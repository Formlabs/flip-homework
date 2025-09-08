from django.contrib import admin
from .models import Printable, Order, Printer


@admin.register(Printable)
class PrintableAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "status", "assigned_printer_id", "created_at")
    list_filter = ("status",)
    date_hierarchy = "created_at"


@admin.register(Printer)
class PrinterAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "status", "last_ping_at")
    list_filter = ("status",)
