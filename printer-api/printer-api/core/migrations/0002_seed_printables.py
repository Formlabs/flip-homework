from django.db import migrations


def create_printables(apps, schema_editor):
    Printable = apps.get_model("core", "Printable")

    printables = [
        {
            "id": 1,
            "sku": "3DP-REDCUBE",
            "name": "Red Cube",
            "price_cents": 1999,
            "stl": "stl/red-cube.stl",
            "color": "red",
        },
        {
            "id": 2,
            "sku": "3DP-GREENCUBE",
            "name": "Green Cube",
            "price_cents": 1999,
            "stl": "stl/green-cube.stl",
            "color": "green",
        },
        {
            "id": 3,
            "sku": "3DP-BLUECUBE",
            "name": "Blue Cube",
            "price_cents": 1999,
            "stl": "stl/blue-cube.stl",
            "color": "blue",
        },
    ]

    for p in printables:
        # Use update_or_create so running migrations multiple times (or on an existing DB)
        # is idempotent. We set the primary key and other fields explicitly.
        obj, created = Printable.objects.update_or_create(
            id=p["id"],
            defaults={
                "sku": p["sku"],
                "name": p["name"],
                "price_cents": p["price_cents"],
                # FileField stores path relative to MEDIA_ROOT; we can set name directly.
                "stl": p["stl"],
                "color": p["color"],
            },
        )


def reverse_func(apps, schema_editor):
    Printable = apps.get_model("core", "Printable")
    Printable.objects.filter(
        sku__in=["3DP-REDCUBE", "3DP-GREENCUBE", "3DP-BLUECUBE"]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [("core", "0001_initial")]

    operations = [migrations.RunPython(create_printables, reverse_func)]
