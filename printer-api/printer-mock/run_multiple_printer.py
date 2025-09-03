import threading
import os
import random
import time
import sys
from pathlib import Path

try:
    from printer import PrinterMock  # type: ignore
except Exception:  # pragma: no cover - fallback for direct execution
    sys.path.append(str(Path(__file__).parent))
    from printer import PrinterMock  # type: ignore

ADJECTIVES = [
    "Sleepy",
    "Happy",
    "Grumpy",
    "Silly",
    "Brave",
    "Clever",
    "Witty",
    "Funky",
    "Jolly",
    "Zippy",
]
ANIMALS = [
    "Panda",
    "Otter",
    "Llama",
    "Penguin",
    "Koala",
    "Giraffe",
    "Sloth",
    "Moose",
    "Ferret",
    "Hedgehog",
]


def random_name(existing=None):
    rng = random.Random(42)  # deterministic seed
    while True:

        name = f"{rng.choice(ADJECTIVES)}-{rng.choice(ANIMALS)}"
        if not existing or name not in existing:
            return name


def run_printer(printer_name, idx):
    api_base = os.environ.get("API_BASE", "http://127.0.0.1:8000")
    state_file = f".printer_id_{printer_name}"
    print(f"[Thread-{idx}] Starting printer: {printer_name}")
    PrinterMock(
        api_base=api_base, printer_name=printer_name, state_file=state_file
    ).run()


def main():
    num_printers = 2
    names = set()
    threads = []
    for i in range(num_printers):
        name = random_name(names)
        names.add(name)
        t = threading.Thread(target=run_printer, args=(name, i + 1), daemon=True)
        threads.append(t)
        t.start()
    try:
        while any(t.is_alive() for t in threads):
            time.sleep(1)
    except KeyboardInterrupt:
        print("Shutting down all printers.")


if __name__ == "__main__":
    main()
