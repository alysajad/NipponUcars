import os
from celery import Celery

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")

app = Celery(
    "bg_removal",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["workers.bg_removal"]
)

app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)
