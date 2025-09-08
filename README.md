# Formlabs Web Homework

# **Setup instructions**

## Services:
- Frontend (Next.js) – user-facing shop and 3D previews
- Printer API (Django) – orders, printables, printer coordination
- Printer mock – simulates one or more printers talking to the API

## Architecture
```
   +-----------+                     +-----------------------+
   |  Browser  | <--- HTML/JS --->   |  Frontend (Next.js) |
   |  (user)   |                     |   http://localhost:3000|
   +-----------+                     +-----------+-----------+
									 |
				   JSON (fetch)      |  Next API route (/api/orders)
   Printable pages fetch: GET /api/printables/*   |  proxies to Django, then redirects
									 v
                            +--------+--------+                   +---------+
                            |   Printer API   | <---------------> | SQLite  |
                            |   (Django)      |                   |  DB     |
STL files: GET /api/printables/1/stl -> serves /media/stl/*.stl     +---------+
                            | http://127.0.0.1:8000
                            +----+-----------+---+
                                ^           |
                                |           |  POST /api/jobs/{id}/complete
                        POST /api/printers/ping
                                |           v
                            +----+-----------+---+
                            |   Printer mock(s)  |
                            |  uv run printer.py |
                            +--------------------+
```

## Data models

The system consists of three main data models that handle the 3D printing workflow:

### **Printable**
Represents 3D objects that can be printed.
- `name`: Display name (e.g., "Red Cube")
- `color`: Optional color specification for visual display
- `stl`: File reference to the STL 3D model file stored in `/media/stl/`

Example: The system is seeded with three demo printables (Red/Green/Blue Cube) that reference STL files.

### **Order**
Represents a customer order containing one or more printable items.
- `status`: Order lifecycle state - `unknown` → `queued` → `assigned` → `printing` → `complete`/`failed`
- `items`: JSON array of order items, each containing:
  - `printable_id`: Reference to a Printable
  - `qty`: Quantity to print
- `assigned_printer_id`: Which printer is handling this order (when assigned)
- `created_at`/`updated_at`: Timestamps for tracking

Order Flow:
1. Created via POST `/api/orders` with status `queued`
2. Assigned to an idle printer → status becomes `assigned`
3. Printer starts work → status becomes `printing`
4. Printer completes → status becomes `complete`

### **Printer**
Represents physical 3D printers that execute orders.
- `name`: Human-readable printer identifier
- `status`: Current printer state (`idle`, `printing`, etc.)
- `last_ping_at`: Heartbeat timestamp from printer health checks
- `current_order`: Reference to the Order currently being processed (if any)

Printer Lifecycle:
- Printers register themselves via POST `/api/printers/ping`
- API assigns queued orders to idle printers automatically
- Printers report completion via POST `/api/jobs/{id}/complete`


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

# **HOMEWORK ASSIGNMENT**


## 🎯 **Tasks**

This homework includes **6 optional tasks** of varying complexity to showcase different skills. You can choose to complete **one, multiple, or all** tasks based on your interests and time availability.

> **📝 Important:** We don't evaluate candidates based on the number of tasks completed. Each task is **completely optional**, but completing multiple tasks provides more evaluation opportunities across different skill areas.

### 📋 **Task Selection Strategy**

**Frontend Focus (Tasks 1-3):**
- **Task 1:** Automatic status updates (polling/WebSocket)
- **Task 2:** 3D model coloring 
- **Task 3:** Ground plane and measurements

**Fullstack Challenge (Tasks 4-6):**
- **Task 4:** Printer progress persistence
- **Task 5:** User STL uploads
- **Task 6:** Push notifications

### 💡 **Recommended Combinations**

- **Quick Frontend Demo:** Pick 1-2 tasks from stories 1-3
- **Fullstack Showcase:** Combine one frontend task (1-3) with one backend task (4-6)
- **Comprehensive Demo:** Feel free to tackle multiple tasks that interest you

### 📖 **Detailed Task Descriptions**

For complete task specifications, acceptance criteria, and technical hints, see **[TASKS.md](./TASKS.md)**.

Each task includes:
- Clear user stories and acceptance criteria
- Complexity indicators (🟢 Low, 🟡 Medium, 🔴 High)
- Frontend vs. Fullstack focus areas

---
