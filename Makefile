# Makefile for Flip Homework Project
# This file provides convenient commands to start and manage different services

.PHONY: help install-api install-frontend install-all start-api start-frontend start-printer start-printers start-all stop clean test-api test-frontend

# Default target
help:
	@echo "Available commands:"
	@echo ""
	@echo "Installation:"
	@echo "  install-api       Install Python dependencies for the API"
	@echo "  install-frontend  Install Node.js dependencies for the frontend"
	@echo "  install-all       Install dependencies for all services"
	@echo ""
	@echo "Starting services:"
	@echo "  start-api         Start the Django API server"
	@echo "  start-frontend    Start the Next.js frontend development server"
	@echo "  start-printer     Start a single printer mock"
	@echo "  start-printers    Start multiple printer mocks (2 printers)"
	@echo "  start-all         Start all services (API, frontend, and printers)"
	@echo ""
	@echo "Testing:"
	@echo "  test-api          Run Django API tests"
	@echo "  test-frontend     Run frontend linting"
	@echo ""
	@echo "Utilities:"
	@echo "  stop              Stop all running services"
	@echo "  clean             Clean up generated files and dependencies"
	@echo "  help              Show this help message"

# Installation commands
install-api:
	@echo "Installing API dependencies..."
	cd printer-api/printer-api && uv venv && uv sync

install-frontend:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

install-all: install-api install-frontend
	@echo "All dependencies installed!"

# Service startup commands
start-api:
	@echo "Starting Django API server..."
	cd printer-api/printer-api && uv run manage.py migrate && uv run manage.py runserver

start-frontend:
	@echo "Starting Next.js frontend..."
	cd frontend && npm run dev

start-printer:
	@echo "Starting single printer mock..."
	cd printer-api/printer-mock && uv run printer.py

start-printers:
	@echo "Starting multiple printer mocks..."
	cd printer-api/printer-mock && uv run run_multiple_printer.py

# Start all services in background
start-all:
	@echo "Starting all services..."
	@echo "Starting API server in background..."
	@cd printer-api/printer-api && uv run manage.py migrate && uv run manage.py runserver &
	@sleep 3
	@echo "Starting frontend in background..."
	@cd frontend && npm run dev &
	@sleep 3
	@echo "Starting printer mocks in background..."
	@cd printer-api/printer-mock && uv run run_multiple_printer.py &
	@echo ""
	@echo "All services started! Check the following URLs:"
	@echo "  Frontend: http://localhost:3000"
	@echo "  API: http://127.0.0.1:8000"
	@echo "  API Printables: http://127.0.0.1:8000/api/printables"
	@echo ""
	@echo "Press Ctrl+C to stop all services"

# Testing commands
test-api:
	@echo "Running API tests..."
	cd printer-api/printer-api && uv run python manage.py test -v 2

test-frontend:
	@echo "Running frontend linting..."
	cd frontend && npm run lint

# Utility commands
stop:
	@echo "Stopping all services..."
	@pkill -f "manage.py runserver" || true
	@pkill -f "next dev" || true
	@pkill -f "printer.py" || true
	@pkill -f "run_multiple_printer.py" || true
	@echo "All services stopped."

clean:
	@echo "Cleaning up..."
	@rm -rf printer-api/printer-api/.venv
	@rm -rf frontend/node_modules
	@rm -rf frontend/.next
	@rm -f printer-api/printer-mock/.printer_id*
	@rm -f printer-api/printer-api/db.sqlite3
	@echo "Cleanup complete."

# Development helpers
reset-db:
	@echo "Resetting database..."
	cd printer-api/printer-api && rm -f db.sqlite3 && uv run manage.py migrate
	@echo "Database reset complete."

logs-api:
	@echo "Showing API logs..."
	@tail -f printer-api/printer-api/logs/*.log 2>/dev/null || echo "No log files found"

# Quick development setup
dev-setup: install-all reset-db
	@echo "Development environment ready!"
	@echo "Run 'make start-all' to start all services"
