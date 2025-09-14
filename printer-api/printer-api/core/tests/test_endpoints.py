from django.test import TestCase, Client, override_settings
from django.core.files.base import ContentFile
from core.models import Printable, Order, Printer, Push
from tempfile import TemporaryDirectory
import json


class ApiEndpointsTests(TestCase):
    def setUp(self) -> None:
        # Clean up database models
        self._cleanup_models()

        self.client = Client()
        # Use a temp MEDIA_ROOT to avoid writing files into repo
        self._media_tmp = TemporaryDirectory()
        self._settings_ctx = override_settings(MEDIA_ROOT=self._media_tmp.name)
        self._settings_ctx.enable()

    def tearDown(self) -> None:
        self._settings_ctx.disable()
        self._media_tmp.cleanup()

    def _cleanup_models(self):
        Printable.objects.all().delete()
        Order.objects.all().delete()
        Printer.objects.all().delete()

    def _make_printable(
        self, name="Cube",with_stl=False, color=""
    ):
        p = Printable.objects.create(name=name, color=color)
        if with_stl:
            # Create an in-memory STL file
            p.stl.save("test.stl", ContentFile(b"solid test\nendsolid\n"))
        return p

    def _post_json(self, path: str, payload: dict):
        return self.client.post(
            path, data=json.dumps(payload), content_type="application/json"
        )

    # Printables
    def test_printables_list_and_detail(self):
        p1 = self._make_printable(
            name="Red Cube", color="red", with_stl=True
        )
        self._make_printable(
            name="Blue Cube", color="blue", with_stl=False
        )

        # List
        resp = self.client.get("/api/printables")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("printables", data)
        self.assertEqual(len(data["printables"]), 2)

        # Each item minimal shape
        item = data["printables"][0]
        self.assertIn("id", item)
        self.assertIn("name", item)
        self.assertIn("color", item)
        self.assertIn("stl_url", item)

        # Detail existing
        resp = self.client.get(f"/api/printables/{p1.id}")
        self.assertEqual(resp.status_code, 200)
        detail = resp.json()
        self.assertEqual(detail["id"], p1.id)
        self.assertEqual(detail["color"], "red")
        self.assertTrue(detail["stl_url"])  # has STL

        # Detail not found
        resp = self.client.get("/api/printables/999")
        self.assertEqual(resp.status_code, 404)

    def test_printable_stl_download_and_404(self):
        p_with = self._make_printable(name="A", with_stl=True)
        p_without = self._make_printable(name="B", with_stl=False)

        # STL exists
        resp = self.client.get(f"/api/printables/{p_with.id}/stl")
        self.assertEqual(resp.status_code, 200)
        self.assertTrue("Content-Disposition" in resp.headers)

        # STL missing -> 404
        resp = self.client.get(f"/api/printables/{p_without.id}/stl")
        self.assertEqual(resp.status_code, 404)

        # Printable missing -> 404
        resp = self.client.get("/api/printables/999/stl")
        self.assertEqual(resp.status_code, 404)

    # Orders
    def test_create_order_validation_and_success(self):
        p1 = self._make_printable(name="A")
        p2 = self._make_printable(name="B")

        # Invalid JSON
        resp = self.client.post(
            "/api/orders", data="{not-json}", content_type="application/json"
        )
        self.assertEqual(resp.status_code, 400)

        # Missing items
        resp = self.client.post(
            "/api/orders", data="{}", content_type="application/json"
        )
        self.assertEqual(resp.status_code, 400)

        # Printable not found
        resp = self._post_json(
            "/api/orders", {"items": [{"printable_id": 999, "qty": 1}]}
        )
        self.assertEqual(resp.status_code, 400)

        # Qty <= 0
        resp = self._post_json(
            "/api/orders", {"items": [{"printable_id": p1.id, "qty": 0}]}
        )
        self.assertEqual(resp.status_code, 400)

        # Success
        resp = self._post_json(
            "/api/orders",
            {
                "items": [
                    {"printable_id": p1.id, "qty": 1},
                    {"printable_id": p2.id, "qty": 2},
                ]
            },
        )
        self.assertEqual(resp.status_code, 201)
        body = resp.json()
        self.assertIn("order_id", body)
        oid = body["order_id"]
        self.assertEqual(body["status"], "queued")

        # Status check
        resp = self.client.get(f"/api/orders/{oid}")
        self.assertEqual(resp.status_code, 200)
        stat = resp.json()
        self.assertEqual(stat["id"], oid)
        self.assertEqual(stat["status"], "queued")

        # Unknown order
        resp = self.client.get("/api/orders/999")
        self.assertEqual(resp.status_code, 404)

    # Printer flow
    def test_printer_ping_assigns_job_and_job_complete(self):
        # Prepare queued order
        p = self._make_printable(name="C")
        o = Order.objects.create(
            status="queued", items=[{"printable_id": p.id, "qty": 1}]
        )

        # First ping creates a printer and assigns job
        resp = self._post_json("/api/printers/ping", {"name": "P1", "status": "idle"})
        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertIn("printer_id", body)
        self.assertIn("instruction", body)  # received a job
        printer_id = body["printer_id"]
        self.assertEqual(body["instruction"]["order_id"], o.id)

        # Order should be printing and assigned
        o.refresh_from_db()
        self.assertEqual(o.status, "printing")
        self.assertEqual(o.assigned_printer_id, printer_id)

        # Complete the job with correct printer
        resp = self._post_json(f"/api/jobs/{o.id}/complete", {"printer_id": printer_id})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json(), {"ok": True})
        o.refresh_from_db()
        self.assertEqual(o.status, "complete")

        # Completing with wrong printer should fail
        o2 = Order.objects.create(
            status="queued", items=[{"printable_id": p.id, "qty": 1}]
        )
        # Assign to printer
        resp = self._post_json(
            "/api/printers/ping",
            {"printer_id": printer_id, "name": "P1", "status": "idle"},
        )
        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertIn("instruction", body)
        self.assertEqual(body["instruction"]["order_id"], o2.id)

        wrong_printer = Printer.objects.create(name="Other")
        resp = self._post_json(
            f"/api/jobs/{o2.id}/complete", {"printer_id": wrong_printer.id}
        )
        self.assertEqual(resp.status_code, 400)

    def test_printer_ping_invalid_json_and_methods(self):
        # Wrong method handling
        resp = self.client.get("/api/printers/ping")
        self.assertEqual(resp.status_code, 405)

        # Invalid JSON
        resp = self.client.post(
            "/api/printers/ping", data="{bad}", content_type="application/json"
        )
        self.assertEqual(resp.status_code, 400)


    def test_order_progress_returns_progress_and_timestamp(self):
        progress = 50
        printable = self._make_printable()
        order = Order.objects.create(
            status="printing", items=[{"printable_id": printable.id, "qty": 1}], progress=progress
        )

        response = self.client.get(f"/api/orders/{order.id}/progress")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"progress": progress, "timestamp": order.updated_at.isoformat()})
        

    def test_push_subscription(self):
        response = self.client.post(
            "/api/push/subscription", data=json.dumps({"subscription": {"endpoint": "test"}}), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Push.objects.count(), 1)
        self.assertEqual(Push.objects.first().subscription, {"endpoint": "test"})