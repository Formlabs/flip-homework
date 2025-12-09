from django.db import models


class Printable(models.Model):
    name = models.CharField(max_length=128)
    stl = models.FileField(upload_to="stl/", null=True, blank=True)
    color = models.CharField(max_length=32, default="", blank=True)

    def __str__(self) -> str:  # pragma: no cover - admin display
        return f"{self.name}"


class Order(models.Model):
    STATUS_CHOICES = [
        ("unknown", "Unknown"),
        ("queued", "Queued"),
        ("assigned", "Assigned"),
        ("printing", "Printing"),
        ("complete", "Complete"),
        ("failed", "Failed"),
    ]

    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="unknown")
    items = models.JSONField(default=list, blank=True)
    assigned_printer_id = models.IntegerField(null=True, blank=True)
    progress = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:  # pragma: no cover - admin display
        return f"Order {self.pk} - {self.status}"


class Printer(models.Model):
    name = models.CharField(max_length=128)
    status = models.CharField(max_length=16, default="idle")
    last_ping_at = models.DateTimeField(null=True, blank=True)
    current_order = models.ForeignKey(
        Order,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="current_printer",
    )

    def __str__(self) -> str:  # pragma: no cover - admin display
        return f"Printer {self.pk} - {self.name}"
