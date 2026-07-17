import os
import json
import redis
from typing import Any, Optional

REDIS_URL = os.environ.get("REDIS_URL")

# Initialize Redis client with a 2-second timeout to avoid hanging the app if Redis is down
redis_client = None
if REDIS_URL:
    try:
        redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True, socket_timeout=2.0)
        # Test connection
        redis_client.ping()
        print(f"[Redis] Connected to {REDIS_URL}")
    except Exception as e:
        print(f"[Redis] Failed to connect: {e}")
        redis_client = None
else:
    print("[Redis] REDIS_URL not set, caching disabled.")

def cache_get(key: str) -> Optional[Any]:
    """Retrieve and parse JSON data from cache. Returns None if miss or Redis is down."""
    if not redis_client:
        return None
    try:
        data = redis_client.get(key)
        if data:
            return json.loads(data)
    except Exception as e:
        print(f"[Redis Error] cache_get({key}): {e}")
    return None

def cache_set(key: str, data: Any, ttl_seconds: int = 60) -> bool:
    """Serialize and store data in cache with TTL. Returns True on success."""
    if not redis_client:
        return False
    try:
        redis_client.setex(key, ttl_seconds, json.dumps(data))
        return True
    except Exception as e:
        print(f"[Redis Error] cache_set({key}): {e}")
    return False

def cache_delete(key: str) -> bool:
    """Delete a key from cache. Returns True on success."""
    if not redis_client:
        return False
    try:
        redis_client.delete(key)
        return True
    except Exception as e:
        print(f"[Redis Error] cache_delete({key}): {e}")
    return False
