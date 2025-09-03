import json
from django.http import JsonResponse, HttpResponseNotAllowed, FileResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from .models import Printable, Order
from django.utils import timezone
from django.db import transaction


def not_implemented(message: str):
    return JsonResponse(
        {"error": {"code": "NOT_IMPLEMENTED", "message": message}}, status=501
    )


def printables(request):
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    data = [
        {
            "id": p.id,
            "name": p.name,
            "color": p.color,
            "stl_url": (
                request.build_absolute_uri(f"/api/printables/{p.id}/stl")
                if p.stl
                else None
            ),
        }
        for p in Printable.objects.all().order_by("id")
    ]
    return JsonResponse({"printables": data})


def printable_detail(request, printable_id: int):
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    try:
        p = Printable.objects.get(pk=printable_id)
        return JsonResponse(
            {
                "id": p.id,
                "name": p.name,
                "color": p.color,
                "stl_url": (
                    request.build_absolute_uri(f"/api/printables/{p.id}/stl")
                    if p.stl
                    else None
                ),
            }
        )
    except Printable.DoesNotExist:
        return JsonResponse({"error": {"code": "NOT_FOUND"}}, status=404)


def printable_stl(request, printable_id: int):
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    try:
        p = Printable.objects.get(pk=printable_id)
    except Printable.DoesNotExist:
        raise Http404()
    if not p.stl:
        raise Http404()
    # Let Django serve the file; content_type guessed by FileResponse
    return FileResponse(
        p.stl.open("rb"), as_attachment=True, filename=p.stl.name.split("/", 1)[-1]
    )


@csrf_exempt
def create_order(request):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    try:
        payload = json.loads(request.body or b"{}")
    except json.JSONDecodeError:
        return JsonResponse(
            {"error": {"code": "BAD_REQUEST", "message": "Invalid JSON"}}, status=400
        )

    items = payload.get("items")
    if not isinstance(items, list) or not items:
        return JsonResponse(
            {"error": {"code": "BAD_REQUEST", "message": "items[] required"}},
            status=400,
        )

    cleaned = []
    for it in items:
        try:
            pid = int(it.get("printable_id"))
            qty = int(it.get("qty", 1))
        except Exception:
            return JsonResponse(
                {"error": {"code": "BAD_REQUEST", "message": "Invalid item"}},
                status=400,
            )
        if qty <= 0:
            return JsonResponse(
                {"error": {"code": "BAD_REQUEST", "message": "qty must be > 0"}},
                status=400,
            )
        # Ensure printable exists
        if not Printable.objects.filter(id=pid).exists():
            return JsonResponse(
                {
                    "error": {
                        "code": "BAD_REQUEST",
                        "message": f"printable_id {pid} not found",
                    }
                },
                status=400,
            )
        cleaned.append({"printable_id": pid, "qty": qty})

    order = Order.objects.create(status="queued", items=cleaned)
    return JsonResponse({"order_id": order.id, "status": order.status}, status=201)


def order_status(request, order_id: int):
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    try:
        o = Order.objects.get(pk=order_id)
        return JsonResponse(
            {
                "id": o.id,
                "status": o.status,
                "assigned_printer_id": o.assigned_printer_id,
            }
        )
    except Order.DoesNotExist:
        return JsonResponse({"error": {"code": "NOT_FOUND"}}, status=404)


@csrf_exempt
def printer_ping(request):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    try:
        payload = json.loads(request.body or b"{}")
    except json.JSONDecodeError:
        return JsonResponse(
            {"error": {"code": "BAD_REQUEST", "message": "Invalid JSON"}}, status=400
        )

    printer_id = payload.get("printer_id")
    name = payload.get("name") or "printer"
    status = payload.get("status") or "idle"

    from .models import Printer  # local import to avoid circular issues in some tools

    if printer_id:
        try:
            printer = Printer.objects.get(pk=int(printer_id))
        except (Printer.DoesNotExist, ValueError):
            # Create if unknown id sent
            printer = Printer.objects.create(name=name)
    else:
        printer = Printer.objects.create(name=name)

    # Update printer heartbeat
    printer.name = name or printer.name
    printer.status = status
    printer.last_ping_at = timezone.now()

    # If printer reports printing, update current order progress
    if printer.current_order and status == "printing":
        try:
            o = printer.current_order
            o.status = "printing"
            o.save(update_fields=["status", "updated_at"])
        except Order.DoesNotExist:
            pass

    instruction = None
    # Assign new job if idle and no current job
    if status == "idle" and not printer.current_order:
        with transaction.atomic():
            job = (
                Order.objects.select_for_update()
                .filter(status="queued")
                .order_by("created_at")
                .first()
            )
            if job:
                job.status = "printing"
                job.assigned_printer_id = printer.id
                job.save(
                    update_fields=[
                        "status",
                        "assigned_printer_id",
                        "updated_at",
                    ]
                )
                printer.current_order = job
                printer.status = "printing"
                instruction = {
                    "job_id": job.id,
                    "order_id": job.id,
                    "items": job.items,
                    "started_at": timezone.now().isoformat(),
                }

    printer.save()

    resp = {"printer_id": printer.id}
    if instruction:
        resp["instruction"] = instruction
    return JsonResponse(resp)


@csrf_exempt
def job_complete(request, job_id: int):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    try:
        payload = json.loads(request.body or b"{}")
    except json.JSONDecodeError:
        return JsonResponse(
            {"error": {"code": "BAD_REQUEST", "message": "Invalid JSON"}}, status=400
        )

    printer_id = payload.get("printer_id")
    if not printer_id:
        return JsonResponse(
            {"error": {"code": "BAD_REQUEST", "message": "printer_id required"}},
            status=400,
        )

    try:
        order = Order.objects.get(pk=job_id)
    except Order.DoesNotExist:
        return JsonResponse({"error": {"code": "NOT_FOUND"}}, status=404)

    if order.assigned_printer_id and int(order.assigned_printer_id) != int(printer_id):
        return JsonResponse(
            {"error": {"code": "BAD_REQUEST", "message": "printer mismatch"}},
            status=400,
        )

    # Mark order complete
    order.status = "complete"
    order.save(update_fields=["status", "updated_at"])

    from .models import Printer  # local import as above

    try:
        pr = Printer.objects.get(pk=int(printer_id))
        if pr.current_order_id == order.id:
            pr.current_order = None
            pr.status = "idle"
            pr.save(update_fields=["current_order", "status", "last_ping_at"])
    except (Printer.DoesNotExist, ValueError):
        pass

    return JsonResponse({"ok": True})
