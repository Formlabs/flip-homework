from django.urls import path
from . import views

urlpatterns = [
    path("printables", views.printables, name="printables"),
    path("printables/<int:printable_id>", views.printable_detail, name="printable_detail"),
    path("printables/<int:printable_id>/stl", views.printable_stl, name="printable_stl"),
    path("orders", views.orders, name="orders"),
    path("orders/<int:order_id>", views.order_status, name="order_status"),
    path("printers/ping", views.printer_ping, name="printer_ping"),
    path("jobs/<int:job_id>/complete", views.job_complete, name="job_complete"),
]
