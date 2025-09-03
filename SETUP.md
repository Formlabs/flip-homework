# **Setup instructions**

## Quick start
1) Prerequisites
- Node.js 18+ (20+ recommended), npm
- Python 3.13 (managed by uv)
- uv package manager installed: curl -LsSf https://astral.sh/uv/install.sh | sh

2) Start the API (Django)
- cd printer-api/printer-api
- uv venv && uv sync
- uv run manage.py migrate
- uv run manage.py runserver
Default: http://127.0.0.1:8000

3) Start the Frontend (Next.js)
- cd frontend
- npm install
- npm run dev
Default: http://localhost:3000 (talks to API at http://127.0.0.1:8000)

4) Start printer mock(s)
In a separate terminal:
- cd printer-api/printer-mock
- uv run printer.py          # single printer
	or
- uv run run_multiple_printer.py   # two demo printers
Defaults: API_BASE=http://127.0.0.1:8000, name persists via .printer_id* files

Useful URLs
- Frontend: http://localhost:3000
- API – printables: http://127.0.0.1:8000/api/printables
- API – single printable: http://127.0.0.1:8000/api/printables/1
- API – printable STL file: http://127.0.0.1:8000/api/printables/1/stl
- API – order status: http://127.0.0.1:8000/api/orders/{id}

- Notes
- Database is SQLite. Migrations also seed demo printables and STL file links.

Seeding details
- The `core` app includes a data migration (`core/migrations/0002_seed_printables.py`) that
    creates three demo `Printable` rows (Red/Green/Blue Cube) during `migrate`.

Re-run or reset seeded data
- If you need to recreate the seeded printables you can:
    - Drop `db.sqlite3` and re-run `uv run manage.py migrate` to start fresh.
    - Or use `uv run manage.py shell` and run custom ORM commands to recreate/delete rows.

- CORS is enabled for http://localhost:3000 in development.


## Testing

Printer API (Django) tests live under `printer-api/printer-api/core/tests`.

Run all tests:

```sh
cd printer-api/printer-api
uv sync  # first time only
uv run python manage.py test -v 2
```

Notes
- Uses Django's test runner with an in-memory SQLite database.
- Tests isolate file uploads by overriding `MEDIA_ROOT` to a temporary directory.
<br><br>

---
