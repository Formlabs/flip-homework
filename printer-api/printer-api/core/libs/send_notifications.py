import json
from pywebpush import webpush
from django.conf import settings
from ..models import Order, Push

def send_notifications(order: Order):
    subscriptions = Push.objects.all()
    for subscription in subscriptions:
        _send_notification(subscription.subscription, {
            "title": "Order Complete",
            "body": f"Order {order.id} has been completed",
        })
    
def _send_notification(subscription: dict, payload: dict):
    try:
        webpush(
            subscription_info=subscription,
            data=json.dumps(payload),
            vapid_private_key=settings.VAPID_PRIVATE_KEY,
            vapid_claims={"sub": "mailto:" + settings.PUSH_NOTIFICATION_SENDER}
        )
    except Exception as e:
        print(e)
