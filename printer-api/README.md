# Setup
- Install uv ( if you did not to that already) via `curl -LsSf https://astral.sh/uv/install.sh | sh` or whatever method you prefer from here https://docs.astral.sh/uv/getting-started/installation/
- `uv venv`
- `uv sync`
- Done!



# Running the printer-api
```bash
cd printer-api
uv run manage.py migrate
uv run manage.py runserver
```

# Running the printer-mock
```bash
cd printer-mock
uv run printer.py
```
