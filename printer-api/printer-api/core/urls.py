from django.urls import path
from . import views

urlpatterns = [
    path("printables", views.printables, name="printables"),
    path("printables/<int:printable_id>", views.printable_detail, name="printable_detail"),
    path("printables/<int:printable_id>/stl", views.printable_stl, name="printable_stl"),
    path("orders", views.create_order, name="create_order"),
    path("orders/<int:order_id>", views.order_status, name="order_status"),
    path("orders/<int:order_id>/progress", views.order_progress, name="order_progress"),
    path("printers/ping", views.printer_ping, name="printer_ping"),
    path("jobs/<int:job_id>/complete", views.job_complete, name="job_complete"),
]
