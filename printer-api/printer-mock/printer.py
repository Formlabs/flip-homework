#!/usr/bin/env python3
import json
import os
import time
import urllib.request
import urllib.error


class PrinterMock:
    def __init__(
        self,
        api_base: str | None = None,
        printer_name: str | None = None,
        state_file: str | None = None,
    ):
        self.api_base = api_base or os.environ.get("API_BASE", "http://127.0.0.1:8000")
        self.printer_name = printer_name or os.environ.get("PRINTER_NAME", "mock-01")
        self.state_file = state_file or os.environ.get(
            "PRINTER_STATE_FILE", ".printer_id"
        )
        self.printer_id: str | None = None

    # --- State helpers ---
    def load_printer_id(self):
        if os.path.exists(self.state_file):
            with open(self.state_file, "r") as f:
                return f.read().strip() or None
        return None

    def save_printer_id(self, pid: str):
        with open(self.state_file, "w") as f:
            f.write(str(pid))

    # --- HTTP helpers ---
    def ping(self, status: str = "idle", progress: int = 0):
        url = f"{self.api_base}/api/printers/ping"
        payload = {
            "printer_id": self.printer_id,
            "name": self.printer_name,
            "status": status,
            "progress": progress,
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url, data=data, headers={"Content-Type": "application/json"}, method="POST"
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            body = resp.read().decode("utf-8")
            return resp.status, json.loads(body) if body else {}

    def complete_job(self, job_id: int):
        url = f"{self.api_base}/api/jobs/{job_id}/complete"
        payload = {"printer_id": self.printer_id}
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url, data=data, headers={"Content-Type": "application/json"}, method="POST"
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status, resp.read().decode("utf-8")

    # --- Main loop ---
    def run(self):
        # Initialize state
        self.printer_id = self.load_printer_id()
        print(
            f"Printer mock started. API_BASE={self.api_base}, name={self.printer_name}, printer_id={self.printer_id}"
        )
        try:
            printing = False
            current_job_id = None
            progress = 0
            while True:
                try:
                    status, body = self.ping(
                        "printing" if printing else "idle", progress
                    )
                    if status == 200:
                        if not self.printer_id and "printer_id" in body:
                            self.printer_id = str(body["printer_id"]) or self.printer_id
                            if self.printer_id:
                                self.save_printer_id(self.printer_id)
                        if body.get("instruction") and not printing:
                            # Start a new job
                            current_job_id = int(body["instruction"]["job_id"])  # type: ignore
                            printing = True
                            progress = 0
                            print(
                                f"[{self.printer_name}] Assigned job {current_job_id}"
                            )
                        elif printing:
                            # Advance progress ~every ping
                            progress = min(100, progress + 25)
                            if progress >= 100 and current_job_id and self.printer_id:
                                # Notify completion
                                try:
                                    cstatus, cbody = self.complete_job(current_job_id)
                                    print(
                                        f"[{self.printer_name}] Completed job {current_job_id}: HTTP {cstatus} {cbody}"
                                    )
                                except Exception as e:
                                    print(
                                        f"[{self.printer_name}] Completion failed:", e
                                    )
                                # Reset
                                printing = False
                                current_job_id = None
                                progress = 0
                        else:
                            # Idle and no assignment
                            pass
                    else:
                        print(f"[{self.printer_name}] Ping HTTP {status}", body)
                except urllib.error.HTTPError as e:
                    try:
                        body = e.read().decode("utf-8")
                    except Exception:
                        body = "<no body>"
                    print(f"[{self.printer_name}] Ping failed: HTTP {e.code} {body}")
                except Exception as e:
                    print(f"[{self.printer_name}] Ping exception:", e)
                time.sleep(5)
        except KeyboardInterrupt:
            print(f"[{self.printer_name}] Shutting down printer mock.")


def main():
    PrinterMock().run()


if __name__ == "__main__":
    main()
