# UTrust Platform — Server-Side Image Processing Architecture
### Inventory Module Refactor: Client-Side WASM → Server-Side Pipeline

**Version:** 2.0  
**Replaces:** `background_removal_architecture.md` (client-side WASM approach)  
**Scope:** Inventory CMS (Next.js) + FastAPI backend + Celery workers + Cloudinary + PostgreSQL

---

> **Before you proceed — credential checklist.**
> This document will ask you to fill in credentials at specific points marked with `⚙️ CREDENTIAL REQUIRED`.
> Do not hardcode any value below into source files. Every credential goes into `.env.local` (Next.js)
> and `.env` (FastAPI). A consolidated `.env` reference lives at the bottom of this document.

---

## Table of Contents

1. [Why We're Moving Server-Side](#1-why-were-moving-server-side)
2. [System Overview](#2-system-overview)
3. [Infrastructure & Credentials](#3-infrastructure--credentials)
4. [Database Schema](#4-database-schema)
5. [FastAPI Backend](#5-fastapi-backend)
6. [Celery Worker — Background Removal](#6-celery-worker--background-removal)
7. [Cloudinary Integration](#7-cloudinary-integration)
8. [Next.js CMS — Inventory Module](#8-nextjs-cms--inventory-module)
9. [Real-Time Progress — SSE Flow](#9-real-time-progress--sse-flow)
10. [Full Request Flow (Sequence Diagram)](#10-full-request-flow-sequence-diagram)
11. [File & Folder Structure](#11-file--folder-structure)
12. [Environment Variables Reference](#12-environment-variables-reference)
13. [Migration from Client-Side Architecture](#13-migration-from-client-side-architecture)
14. [Deployment Checklist](#14-deployment-checklist)
15. [Cross-Questions for Antigravity Upload](#15-cross-questions-for-antigravity-upload)

---

## 1. Why We're Moving Server-Side

The previous architecture (`background_removal_architecture.md`) ran `@imgly/background-removal` entirely in the browser using WebAssembly and ONNX Runtime. It worked for prototyping. Production breaks it for these reasons:

| Problem | Client-Side (Current) | Server-Side (New) |
|---|---|---|
| Latency per frame | 2-3s, UI freezes | ~300ms, UI stays live |
| Budget Android devices | 4-5s or crash | Consistent — server hardware |
| 36-frame spin set | Sequential, ~108s total | Parallel workers, ~12s total |
| Storage | IndexedDB (lost on browser clear) | PostgreSQL + Cloudinary (permanent) |
| Resume mid-shoot | Impossible | Sales rep switches devices freely |
| Data ownership | Trapped in browser | Company owns all assets in Cloudinary |
| Multi-user visibility | None | Any manager sees listing status live |

The new architecture processes images server-side using `rembg` with the `birefnet-lite` model inside a Celery worker pool. The Next.js CMS subscribes to Server-Sent Events (SSE) so frames update live in the UI as they finish.

---

## 2. System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SALES CMS  (Next.js 14)                      │
│                                                                 │
│  /cms/listings/new     → multi-step listing creation form       │
│  /cms/listings/[id]    → listing detail + frame upload          │
│  /cms/inventory        → all listings, status badges            │
│                                                                 │
│  Next.js API Routes proxy all requests to FastAPI               │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS (multipart/form-data + JSON)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FASTAPI  (Python 3.11)                        │
│                                                                 │
│  POST /listings/                  create listing record         │
│  POST /listings/{id}/frames       receive photos, enqueue jobs  │
│  GET  /listings/{id}/frames       frame statuses                │
│  GET  /jobs/{id}/progress         SSE stream                    │
│  PATCH /listings/{id}/publish     mark listing live             │
│  GET  /listings/                  inventory list (paginated)    │
│  GET  /listings/{id}              single listing detail         │
└───────┬──────────────────────┬───────────────────────────────────┘
        │                      │
        │ Enqueue jobs         │ Read/write records
        ▼                      ▼
┌───────────────┐    ┌──────────────────────┐
│  Redis Queue  │    │  PostgreSQL           │
│  (Celery)     │    │  listings             │
│               │    │  listing_frames       │
│  also used    │    │  users                │
│  for SSE      │    │  clusters             │
│  pub/sub      │    └──────────────────────┘
└───────┬───────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                  CELERY WORKER POOL                             │
│                                                                 │
│  Session: birefnet-lite loaded ONCE at worker startup           │
│  Concurrency: 4 workers (ThreadPoolExecutor per task)           │
│                                                                 │
│  Per frame task (~300ms):                                       │
│    1. Download raw image from Cloudinary                        │
│    2. rembg.remove(image, session=session)                      │
│    3. Composite onto white canvas (Pillow)                      │
│    4. Upload processed PNG to Cloudinary /processed/ folder     │
│    5. UPDATE listing_frames SET processed_url, status='done'    │
│    6. Redis PUBLISH → SSE stream → Next.js CMS                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │     Cloudinary       │
                 │                      │
                 │  /utrust/raw/        │
                 │  /utrust/processed/  │
                 │  /utrust/thumbs/     │
                 └──────────────────────┘
```

---

## 3. Infrastructure & Credentials

Work through each service below. Fill in every value you get into the `.env` reference in Section 12.

---

### 3.1 PostgreSQL

You already have a PostgreSQL instance from your existing UTrust platform.

```
⚙️ CREDENTIAL REQUIRED — answer these questions:

Q1. Is your PostgreSQL hosted on Supabase, Railway, Render, or self-hosted?
Q2. What is the connection string?
    Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
Q3. Does the database user have CREATE TABLE privileges?
    If not, you need to run migrations as a superuser or ask your DBA.
Q4. Do you want a separate schema (e.g. `inventory`) or use `public`?
    Recommended: use a dedicated `inventory` schema to keep tables clean.
```

Once you have answers, set:
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

---

### 3.2 Redis

You already have Redis in your stack.

```
⚙️ CREDENTIAL REQUIRED — answer these questions:

Q5. Is Redis hosted on Upstash, Railway, Redis Cloud, or self-hosted?
Q6. What is the Redis URL?
    Format: redis://[:PASSWORD@]HOST:PORT/DB_NUMBER
    Example Upstash: rediss://default:TOKEN@HOST:PORT
Q7. Does your Redis instance support pub/sub?
    (All standard Redis instances do. Upstash free tier does NOT support
     persistent pub/sub — upgrade to paid if using Upstash for SSE.)
```

Once you have answers, set:
```
REDIS_URL=redis://HOST:PORT/0
CELERY_BROKER_URL=redis://HOST:PORT/0
CELERY_RESULT_BACKEND=redis://HOST:PORT/1
```

---

### 3.3 Cloudinary

You already use Cloudinary for asset storage.

```
⚙️ CREDENTIAL REQUIRED — answer these questions:

Q8.  What is your Cloudinary Cloud Name?
     (Found at: cloudinary.com/console → Dashboard)
Q9.  What is your Cloudinary API Key?
     (Found at: cloudinary.com/console → Settings → API Keys)
Q10. What is your Cloudinary API Secret?
     (Same location — treat this like a password, never expose client-side)
Q11. Do you want to use a dedicated folder structure?
     Recommended yes. This document uses:
       /utrust/raw/{listing_id}/frame_{n}
       /utrust/processed/{listing_id}/frame_{n}
       /utrust/thumbs/{listing_id}/frame_{n}
Q12. Do you have unsigned upload presets enabled?
     Check: cloudinary.com/console → Settings → Upload → Upload presets
     You need ONE signed preset for server-side uploads (FastAPI → Cloudinary).
     Name it: utrust_server
```

Once you have answers, set:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=utrust_server
```

---

### 3.4 Next.js App

```
⚙️ CREDENTIAL REQUIRED — answer these questions:

Q13. What is the base URL of your FastAPI server?
     Local dev:  http://localhost:8000
     Production: https://api.yourdomain.com
Q14. Do you use JWT for auth between Next.js and FastAPI?
     If yes, what is the shared JWT secret?
     If no, what auth mechanism? (API key, session cookie, etc.)
Q15. What domain will the Next.js CMS run on?
     Example: cms.nippontoyota.com
     This is needed for CORS config on FastAPI.
```

Once you have answers, set (in `.env.local`):
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://cms.yourdomain.com
```

---

### 3.5 rembg Model Download

The `birefnet-lite` model downloads automatically on first Celery worker startup (~25MB). No credentials needed. Confirm the worker server has outbound internet access to download from HuggingFace on first boot.

```
⚙️ ENVIRONMENT QUESTION:

Q16. Does your worker server have outbound internet access?
     If deployed on a private VPC with no internet egress, you need to
     pre-download the model and mount it. In that case, run this locally:
       python -c "from rembg import new_session; new_session('birefnet-lite')"
     Then copy ~/.u2net/birefnet-lite.onnx to your server and set:
       U2NET_HOME=/path/to/model/directory
```

---

## 4. Database Schema

Run these migrations in order. If you use Alembic (recommended), create one migration file per table.

```sql
-- Migration 001: clusters
CREATE TABLE IF NOT EXISTS clusters (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,    -- 'Cochin Titans', 'Travancore Royals', etc.
  code        TEXT NOT NULL UNIQUE,    -- 'CCT', 'TVR', 'HRK', 'PBL'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed the four Kerala clusters
INSERT INTO clusters (name, code) VALUES
  ('Travancore Royals', 'TVR'),
  ('Cochin Titans',     'CCT'),
  ('Highrange Kings',   'HRK'),
  ('Pooram Blasters',   'PBL')
ON CONFLICT DO NOTHING;

-- Migration 002: listings
CREATE TABLE IF NOT EXISTS listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id      UUID REFERENCES clusters(id) ON DELETE SET NULL,
  make            TEXT NOT NULL DEFAULT 'Toyota',
  model           TEXT NOT NULL,         -- 'Camry', 'Fortuner', 'Innova Crysta'
  variant         TEXT,                  -- '2.5 V AT', 'GX Manual'
  year            SMALLINT NOT NULL,
  color           TEXT,
  fuel_type       TEXT,                  -- 'Petrol', 'Diesel', 'Hybrid'
  transmission    TEXT,                  -- 'Automatic', 'Manual'
  km_run          INT,
  owners          SMALLINT DEFAULT 1,
  price           NUMERIC(12, 2),
  body_type       TEXT,                  -- 'sedan', 'suv', 'hatchback', 'muv', 'mpv'
  rc_number       TEXT,
  vin             TEXT,
  status          TEXT DEFAULT 'draft',  -- 'draft', 'processing', 'published', 'sold'
  created_by      UUID,                  -- FK to users table (your existing auth)
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_listings_cluster ON listings(cluster_id);
CREATE INDEX idx_listings_status  ON listings(status);

-- Migration 003: listing_frames
CREATE TABLE IF NOT EXISTS listing_frames (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  frame_index     SMALLINT NOT NULL,     -- 0-35 for spin, 36+ for interior/detail
  frame_type      TEXT NOT NULL,         -- 'spin', 'interior', 'detail', 'hero'
  raw_url         TEXT,                  -- Cloudinary URL of original upload
  processed_url   TEXT,                  -- Cloudinary URL after bg removal
  thumb_url       TEXT,                  -- Cloudinary thumbnail (auto-generated)
  job_id          TEXT,                  -- Celery task ID
  status          TEXT DEFAULT 'queued', -- 'queued', 'processing', 'done', 'failed'
  error_message   TEXT,                  -- populated if status='failed'
  processing_ms   INT,                   -- actual processing time logged per frame
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id, frame_index, frame_type)
);

CREATE INDEX idx_frames_listing  ON listing_frames(listing_id);
CREATE INDEX idx_frames_status   ON listing_frames(status);
CREATE INDEX idx_frames_job      ON listing_frames(job_id);
```

---

## 5. FastAPI Backend

### 5.1 Dependencies

Add to `requirements.txt`:

```txt
fastapi==0.111.0
uvicorn[standard]==0.29.0
sqlalchemy==2.0.30
asyncpg==0.29.0
alembic==1.13.1
celery==5.4.0
redis==5.0.4
cloudinary==1.40.0
rembg[gpu]==2.0.57        # use rembg[cpu] if no GPU available
Pillow==10.3.0
python-multipart==0.0.9   # required for FastAPI file uploads
httpx==0.27.0
python-jose[cryptography]==3.3.0   # JWT auth
```

### 5.2 Project Structure

```
backend/
├── main.py
├── config.py              ← loads all env vars, validates on startup
├── database.py            ← SQLAlchemy async engine
├── models/
│   ├── listing.py
│   └── frame.py
├── routers/
│   ├── listings.py        ← CRUD endpoints
│   ├── frames.py          ← upload + status endpoints
│   └── jobs.py            ← SSE progress endpoint
├── workers/
│   ├── celery_app.py      ← Celery instance + config
│   └── bg_removal.py      ← the actual task
├── services/
│   ├── cloudinary_svc.py  ← upload/delete helpers
│   └── sse.py             ← Redis pub/sub → SSE
└── schemas/
    ├── listing.py
    └── frame.py
```

### 5.3 Core Endpoints

**`POST /listings/`** — Create a listing record before any photos are uploaded.

```python
# routers/listings.py
@router.post("/listings/", response_model=ListingOut, status_code=201)
async def create_listing(payload: ListingCreate, db: AsyncSession = Depends(get_db)):
    listing = Listing(**payload.model_dump())
    db.add(listing)
    await db.commit()
    await db.refresh(listing)
    return listing
```

Request body:
```json
{
  "cluster_id": "uuid",
  "model": "Fortuner",
  "variant": "2.8 4WD AT",
  "year": 2021,
  "color": "Pearl White",
  "fuel_type": "Diesel",
  "transmission": "Automatic",
  "km_run": 38200,
  "owners": 1,
  "price": 3250000,
  "body_type": "suv",
  "rc_number": "KL07AB1234"
}
```

---

**`POST /listings/{listing_id}/frames`** — Receive photo uploads. Stores raw to Cloudinary immediately, enqueues bg-removal job, returns instantly.

```python
@router.post("/listings/{listing_id}/frames")
async def upload_frames(
    listing_id: UUID,
    files: List[UploadFile] = File(...),
    frame_type: str = Form("spin"),
    db: AsyncSession = Depends(get_db)
):
    results = []
    for i, file in enumerate(files):
        # 1. Upload raw to Cloudinary immediately (fast — just storing original)
        raw_url, public_id = await cloudinary_svc.upload_raw(
            file=file,
            folder=f"utrust/raw/{listing_id}",
            public_id=f"frame_{i:03d}"
        )

        # 2. Insert frame record in DB
        frame = ListingFrame(
            listing_id=listing_id,
            frame_index=i,
            frame_type=frame_type,
            raw_url=raw_url,
            status="queued"
        )
        db.add(frame)
        await db.flush()  # get frame.id before commit

        # 3. Enqueue Celery task
        task = remove_background_task.delay(
            frame_id=str(frame.id),
            raw_url=raw_url,
            listing_id=str(listing_id)
        )
        frame.job_id = task.id
        results.append({"frame_id": str(frame.id), "job_id": task.id})

    await db.commit()
    # Returns immediately — bg removal happens async
    return {"listing_id": str(listing_id), "queued": len(results), "frames": results}
```

---

**`GET /jobs/{listing_id}/progress`** — SSE endpoint. Next.js subscribes here; receives frame completion events as they happen.

```python
# routers/jobs.py
from sse_starlette.sse import EventSourceResponse

@router.get("/jobs/{listing_id}/progress")
async def job_progress(listing_id: str, request: Request):
    async def event_stream():
        pubsub = redis_client.pubsub()
        await pubsub.subscribe(f"listing:{listing_id}:progress")
        try:
            async for message in pubsub.listen():
                if await request.is_disconnected():
                    break
                if message["type"] == "message":
                    yield {"data": message["data"]}
        finally:
            await pubsub.unsubscribe(f"listing:{listing_id}:progress")

    return EventSourceResponse(event_stream())
```

SSE message payload (published by worker after each frame):
```json
{
  "frame_id": "uuid",
  "frame_index": 3,
  "frame_type": "spin",
  "processed_url": "https://res.cloudinary.com/...",
  "thumb_url": "https://res.cloudinary.com/.../c_thumb,w_200/...",
  "status": "done",
  "processing_ms": 287,
  "total_done": 4,
  "total_frames": 36
}
```

---

**`PATCH /listings/{listing_id}/publish`** — Marks listing as live. Validates all frames are processed before allowing publish.

```python
@router.patch("/listings/{listing_id}/publish")
async def publish_listing(listing_id: UUID, db: AsyncSession = Depends(get_db)):
    unprocessed = await db.scalar(
        select(func.count()).where(
            ListingFrame.listing_id == listing_id,
            ListingFrame.status != "done"
        )
    )
    if unprocessed > 0:
        raise HTTPException(400, f"{unprocessed} frames still processing. Cannot publish yet.")

    await db.execute(
        update(Listing)
        .where(Listing.id == listing_id)
        .values(status="published", published_at=func.now())
    )
    await db.commit()
    return {"status": "published"}
```

---

## 6. Celery Worker — Background Removal

This is the core of the new architecture. The model loads once when the worker process starts and stays in memory for all subsequent tasks.

```python
# workers/bg_removal.py
from celery import Celery
from rembg import new_session, remove
from PIL import Image
import cloudinary.uploader
import io, time, json, asyncio

from workers.celery_app import app
from database import get_sync_session
from models.frame import ListingFrame
import redis

# ─── CRITICAL: Load model ONCE at worker startup, not per task ───
# This is what drops latency from 2-3s → ~300ms
print("[worker] Loading birefnet-lite model...")
REMBG_SESSION = new_session("birefnet-lite")
print("[worker] Model ready.")

redis_client = redis.from_url(settings.REDIS_URL)


@app.task(bind=True, max_retries=3, default_retry_delay=5)
def remove_background_task(self, frame_id: str, raw_url: str, listing_id: str):
    start = time.monotonic()

    try:
        # ── Step 1: Update DB status to 'processing'
        with get_sync_session() as db:
            db.execute(
                update(ListingFrame)
                .where(ListingFrame.id == frame_id)
                .values(status="processing")
            )
            db.commit()

        # ── Step 2: Download raw image from Cloudinary
        response = httpx.get(raw_url, timeout=30)
        response.raise_for_status()
        raw_image = Image.open(io.BytesIO(response.content)).convert("RGBA")

        # ── Step 3: Remove background (pre-loaded session — fast)
        removed = remove(raw_image, session=REMBG_SESSION)

        # ── Step 4: Composite onto white canvas
        # White background ensures consistent rendering on any site theme
        white_canvas = Image.new("RGBA", removed.size, (255, 255, 255, 255))
        white_canvas.paste(removed, mask=removed.split()[3])
        final = white_canvas.convert("RGB")

        # ── Step 5: Convert to bytes
        buffer = io.BytesIO()
        final.save(buffer, format="JPEG", quality=88, optimize=True)
        buffer.seek(0)

        # ── Step 6: Upload processed image to Cloudinary
        frame_index = frame_id[-3:]  # last 3 chars for naming
        upload_result = cloudinary.uploader.upload(
            buffer,
            folder=f"utrust/processed/{listing_id}",
            public_id=f"frame_{frame_index}",
            resource_type="image",
            transformation=[{"width": 1920, "crop": "limit"}]
        )
        processed_url = upload_result["secure_url"]

        # Cloudinary auto-generates thumb via URL transformation — no extra upload
        thumb_url = processed_url.replace(
            "/upload/", "/upload/c_thumb,w_200,h_140,g_auto/"
        )

        # ── Step 7: Update DB
        elapsed_ms = int((time.monotonic() - start) * 1000)
        with get_sync_session() as db:
            frame = db.get(ListingFrame, frame_id)
            frame.processed_url = processed_url
            frame.thumb_url = thumb_url
            frame.status = "done"
            frame.processing_ms = elapsed_ms

            total_done = db.scalar(
                select(func.count()).where(
                    ListingFrame.listing_id == listing_id,
                    ListingFrame.status == "done"
                )
            )
            total_frames = db.scalar(
                select(func.count()).where(
                    ListingFrame.listing_id == listing_id
                )
            )
            db.commit()

        # ── Step 8: Publish SSE event via Redis
        payload = json.dumps({
            "frame_id": frame_id,
            "frame_index": frame.frame_index,
            "frame_type": frame.frame_type,
            "processed_url": processed_url,
            "thumb_url": thumb_url,
            "status": "done",
            "processing_ms": elapsed_ms,
            "total_done": total_done,
            "total_frames": total_frames
        })
        redis_client.publish(f"listing:{listing_id}:progress", payload)

    except Exception as exc:
        # Mark failed in DB, publish failure event
        with get_sync_session() as db:
            db.execute(
                update(ListingFrame)
                .where(ListingFrame.id == frame_id)
                .values(status="failed", error_message=str(exc))
            )
            db.commit()

        redis_client.publish(f"listing:{listing_id}:progress", json.dumps({
            "frame_id": frame_id,
            "status": "failed",
            "error": str(exc)
        }))

        raise self.retry(exc=exc)
```

### Worker Startup Command

```bash
# Start 4 workers — each has birefnet-lite in memory
celery -A workers.celery_app worker \
  --loglevel=info \
  --concurrency=4 \
  --queues=bg_removal \
  --hostname=worker@%h
```

---

## 7. Cloudinary Integration

### 7.1 Folder Structure

```
your-cloud/
└── utrust/
    ├── raw/
    │   └── {listing_id}/
    │       ├── frame_000.jpg   ← original upload, untouched
    │       ├── frame_001.jpg
    │       └── ...
    ├── processed/
    │   └── {listing_id}/
    │       ├── frame_000.jpg   ← bg-removed, white bg, JPEG 88%
    │       ├── frame_001.jpg
    │       └── ...
    └── thumbs/                 ← generated via URL transform, not uploaded
```

### 7.2 Upload Helper

```python
# services/cloudinary_svc.py
import cloudinary
import cloudinary.uploader
from config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

async def upload_raw(file: UploadFile, folder: str, public_id: str) -> tuple[str, str]:
    contents = await file.read()
    result = cloudinary.uploader.upload(
        contents,
        folder=folder,
        public_id=public_id,
        resource_type="image",
        overwrite=True,
        transformation=[{"width": 2400, "crop": "limit"}]  # cap raw size
    )
    return result["secure_url"], result["public_id"]
```

### 7.3 Cloudinary Transformations for the Spin Viewer

When the 360° viewer loads frames, use Cloudinary's URL-based transforms to serve optimally sized images without generating separate assets:

```
Full spin frame (desktop):
https://res.cloudinary.com/{cloud}/image/upload/c_limit,w_1200,f_auto,q_auto/utrust/processed/{id}/frame_000

Mobile spin frame:
https://res.cloudinary.com/{cloud}/image/upload/c_limit,w_640,f_auto,q_auto/utrust/processed/{id}/frame_000

Thumbnail strip:
https://res.cloudinary.com/{cloud}/image/upload/c_thumb,w_120,h_80,g_auto/utrust/processed/{id}/frame_000
```

Set `f_auto` and `q_auto` always — Cloudinary will serve WebP on supported browsers and optimize quality automatically.

---

## 8. Next.js CMS — Inventory Module

### 8.1 Route Structure

```
app/
├── (cms)/
│   ├── layout.tsx                  ← sidebar, auth guard
│   ├── inventory/
│   │   └── page.tsx                ← listings grid with status badges
│   ├── listings/
│   │   ├── new/
│   │   │   └── page.tsx            ← Step 1: car details form
│   │   └── [id]/
│   │       ├── page.tsx            ← listing overview
│   │       └── upload/
│   │           └── page.tsx        ← Step 2: photo capture + live progress
│   └── page.tsx                    ← redirect to /inventory
├── api/
│   ├── listings/
│   │   └── route.ts                ← proxy to FastAPI POST /listings/
│   └── frames/
│       ├── upload/
│       │   └── route.ts            ← proxy multipart to FastAPI
│       └── [listingId]/
│           └── progress/
│               └── route.ts        ← proxy SSE from FastAPI
```

### 8.2 Listing Creation Flow (Two-Step)

**Step 1 — `/listings/new`:** Sales rep fills in car details (model, year, color, km, price, cluster). On submit, calls `POST /api/listings/` which creates the DB record and returns `listing_id`. Redirects to `/listings/{id}/upload`.

**Step 2 — `/listings/{id}/upload`:** Photo upload screen. Sales rep takes 36 walkaround shots (or bulk-uploads). Each batch of photos is sent to `POST /api/frames/upload`. The component subscribes to SSE at `/api/frames/{listingId}/progress` and updates each frame's status in real time.

### 8.3 Frame Upload Component

```tsx
// app/(cms)/listings/[id]/upload/page.tsx
"use client"

import { useState, useEffect, useRef } from "react"

interface Frame {
  frameId: string
  frameIndex: number
  rawUrl: string
  processedUrl: string | null
  thumbUrl: string | null
  status: "queued" | "processing" | "done" | "failed"
  processingMs: number | null
}

export default function UploadPage({ params }: { params: { id: string } }) {
  const [frames, setFrames] = useState<Frame[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const eventSourceRef = useRef<EventSource | null>(null)

  // Subscribe to SSE when component mounts
  useEffect(() => {
    const es = new EventSource(`/api/frames/${params.id}/progress`)
    eventSourceRef.current = es

    es.onmessage = (event) => {
      const data = JSON.parse(event.data)

      // Swap raw preview → processed image for this frame
      setFrames(prev =>
        prev.map(f =>
          f.frameId === data.frame_id
            ? {
                ...f,
                processedUrl: data.processed_url,
                thumbUrl: data.thumb_url,
                status: data.status,
                processingMs: data.processing_ms
              }
            : f
        )
      )

      setProgress({ done: data.total_done, total: data.total_frames })

      // Auto-close SSE when all frames done
      if (data.total_done === data.total_frames) {
        es.close()
      }
    }

    return () => es.close()
  }, [params.id])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    setUploading(true)

    // Add frames in queued state immediately — show placeholders right away
    const newFrames: Frame[] = files.map((_, i) => ({
      frameId: crypto.randomUUID(),  // temp ID until server responds
      frameIndex: frames.length + i,
      rawUrl: URL.createObjectURL(files[i]),  // show raw preview instantly
      processedUrl: null,
      thumbUrl: null,
      status: "queued",
      processingMs: null
    }))
    setFrames(prev => [...prev, ...newFrames])

    // Send to FastAPI
    const formData = new FormData()
    files.forEach(f => formData.append("files", f))
    formData.append("frame_type", "spin")

    const res = await fetch(`/api/frames/upload?listing_id=${params.id}`, {
      method: "POST",
      body: formData
    })
    const data = await res.json()

    // Replace temp IDs with real frame IDs from server
    setFrames(prev =>
      prev.map((f, idx) => {
        const serverFrame = data.frames[idx - (prev.length - files.length)]
        return serverFrame ? { ...f, frameId: serverFrame.frame_id } : f
      })
    )

    setUploading(false)
  }

  const allDone = progress.total > 0 && progress.done === progress.total

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Progress bar */}
      {progress.total > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Processing frames</span>
            <span>{progress.done} / {progress.total}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-300 rounded-full"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* File input — triggers native camera on mobile */}
      <label className="block mb-6 cursor-pointer">
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-amber-400 transition-colors">
          <p className="text-sm text-muted-foreground">
            Tap to capture photos or drag and drop
          </p>
        </div>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="sr-only"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>

      {/* Frame grid */}
      <div className="grid grid-cols-4 gap-3">
        {frames.map((frame, i) => (
          <div key={frame.frameId} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            <img
              src={frame.processedUrl ?? frame.rawUrl}
              alt={`Frame ${i + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Status overlay */}
            {frame.status !== "done" && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                {frame.status === "queued" && (
                  <span className="text-xs text-white/60">Queued</span>
                )}
                {frame.status === "processing" && (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {frame.status === "failed" && (
                  <span className="text-xs text-red-400">Failed</span>
                )}
              </div>
            )}

            {/* Done badge with timing */}
            {frame.status === "done" && frame.processingMs && (
              <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                {frame.processingMs}ms
              </div>
            )}

            <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
              {i + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Publish button — only active when all processed */}
      {frames.length > 0 && (
        <div className="mt-8 flex justify-end">
          <button
            disabled={!allDone}
            onClick={() => fetch(`/api/listings/${params.id}/publish`, { method: "PATCH" })}
            className="px-6 py-2.5 bg-amber-500 text-black font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-400 transition-colors"
          >
            {allDone ? "Publish Listing" : `Processing... ${progress.done}/${progress.total}`}
          </button>
        </div>
      )}
    </div>
  )
}
```

### 8.4 Inventory List Page

```tsx
// app/(cms)/inventory/page.tsx
// Fetches from GET /api/listings/ with status filter
// Shows status badges: draft (gray), processing (amber pulse), published (green), sold (blue)
// Each card shows: hero frame (processed_url of frame_index=0), model, year, price, cluster, km

// Status badge colors:
// draft       → bg-muted text-muted-foreground
// processing  → bg-amber-100 text-amber-700 (+ animate-pulse)
// published   → bg-green-100 text-green-700
// sold        → bg-blue-100 text-blue-700
```

### 8.5 Next.js API Routes (Proxy Layer)

The Next.js API routes exist purely to forward requests to FastAPI. This keeps your FastAPI URL out of the browser and allows you to attach auth headers server-side.

```ts
// app/api/frames/upload/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const listingId = req.nextUrl.searchParams.get("listing_id")
  const formData = await req.formData()

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/listings/${listingId}/frames`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.INTERNAL_API_KEY}`
      },
      body: formData   // pass multipart through directly
    }
  )

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
```

```ts
// app/api/frames/[listingId]/progress/route.ts
import { NextRequest } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: { listingId: string } }
) {
  // Proxy SSE from FastAPI to browser
  const upstream = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/jobs/${params.listingId}/progress`,
    {
      headers: { Authorization: `Bearer ${process.env.INTERNAL_API_KEY}` }
    }
  )

  // Stream the SSE response directly
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  })
}
```

---

## 9. Real-Time Progress — SSE Flow

The SSE (Server-Sent Events) channel replaces polling. Here is the exact message lifecycle:

```
1. Sales rep uploads 36 photos
   → FastAPI returns immediately with { listing_id, queued: 36, frames: [...] }
   → CMS shows 36 placeholder cards with raw previews

2. CMS opens SSE connection to /api/frames/{id}/progress

3. Celery worker processes frame_000 (~300ms)
   → Uploads processed_url to Cloudinary
   → Redis PUBLISH listing:{id}:progress {frame_index:0, processed_url:..., status:done}
   → FastAPI SSE endpoint receives Redis message
   → Pushes to browser via EventSource

4. CMS receives SSE message
   → Replaces frame_000 raw preview with processed_url
   → Progress bar increments: 1/36

5. Repeat for frames 1-35
   → With 4 workers in parallel, actual wall-clock time is ~36/4 × 300ms ≈ 3 seconds

6. All 36 done → "Publish Listing" button becomes active
```

---

## 10. Full Request Flow (Sequence Diagram)

```mermaid
sequenceDiagram
    participant Rep as Sales Rep (CMS)
    participant Next as Next.js
    participant API as FastAPI
    participant DB as PostgreSQL
    participant Queue as Redis + Celery
    participant Model as rembg (birefnet-lite)
    participant CDN as Cloudinary
    participant SSE as SSE Stream

    Rep->>Next: Fill car details, submit form
    Next->>API: POST /listings/ {model, year, price...}
    API->>DB: INSERT INTO listings
    DB-->>API: listing_id
    API-->>Next: {listing_id}
    Next-->>Rep: Redirect to /listings/{id}/upload

    Rep->>Next: Select 36 photos
    Next->>API: POST /listings/{id}/frames (multipart, 36 files)

    loop For each file (parallel in FastAPI)
        API->>CDN: Upload raw JPEG → /utrust/raw/{id}/frame_N
        CDN-->>API: raw_url
        API->>DB: INSERT INTO listing_frames (raw_url, status=queued)
        API->>Queue: Enqueue remove_background_task(frame_id, raw_url)
    end

    API-->>Next: {queued: 36, frames: [{frame_id, job_id}]}
    Next-->>Rep: Show 36 raw previews instantly
    Next->>SSE: Open EventSource /api/frames/{id}/progress

    loop For each frame (4 workers in parallel)
        Queue->>Model: Dequeue task
        Model->>CDN: Download raw_url
        CDN-->>Model: raw image bytes
        Model->>Model: rembg.remove() ~300ms
        Model->>Model: Composite onto white canvas (Pillow)
        Model->>CDN: Upload processed JPEG → /utrust/processed/{id}/frame_N
        CDN-->>Model: processed_url
        Model->>DB: UPDATE listing_frames SET processed_url, status=done
        Model->>Queue: Redis PUBLISH listing:{id}:progress {frame_index, processed_url}
        Queue->>SSE: Push SSE message to browser
        SSE-->>Rep: Frame N preview swaps raw → processed
    end

    Note over Rep: All 36 done (~3-4 seconds wall clock)
    Rep->>Next: Click "Publish Listing"
    Next->>API: PATCH /listings/{id}/publish
    API->>DB: Validate all frames done, SET status=published
    DB-->>API: OK
    API-->>Next: {status: published}
    Next-->>Rep: Redirect to /inventory
```

---

## 11. File & Folder Structure

```
utrust-platform/
├── frontend/                          ← Next.js 14 App Router
│   ├── app/
│   │   ├── (cms)/
│   │   │   ├── layout.tsx
│   │   │   ├── inventory/
│   │   │   │   └── page.tsx
│   │   │   └── listings/
│   │   │       ├── new/page.tsx
│   │   │       └── [id]/
│   │   │           ├── page.tsx
│   │   │           └── upload/page.tsx   ← FrameUpload component lives here
│   │   └── api/
│   │       ├── listings/route.ts
│   │       └── frames/
│   │           ├── upload/route.ts
│   │           └── [listingId]/progress/route.ts
│   ├── components/
│   │   ├── inventory/
│   │   │   ├── ListingCard.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── FrameGrid.tsx           ← the 36-frame preview grid
│   │   │   └── SpinViewer.tsx          ← the 360° viewer on public site
│   │   └── ui/                         ← shadcn/ui components
│   ├── .env.local
│   └── package.json
│
├── backend/                            ← FastAPI
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models/
│   │   ├── listing.py
│   │   └── frame.py
│   ├── routers/
│   │   ├── listings.py
│   │   ├── frames.py
│   │   └── jobs.py
│   ├── workers/
│   │   ├── celery_app.py
│   │   └── bg_removal.py              ← the Celery task
│   ├── services/
│   │   ├── cloudinary_svc.py
│   │   └── sse.py
│   ├── schemas/
│   │   ├── listing.py
│   │   └── frame.py
│   ├── alembic/
│   │   └── versions/                  ← migration files
│   ├── .env
│   └── requirements.txt
│
└── docker-compose.yml                 ← local dev: postgres + redis + worker
```

---

## 12. Environment Variables Reference

### `frontend/.env.local`

```bash
# FastAPI base URL
NEXT_PUBLIC_API_URL=https://api.yourdomain.com       # ← Q13

# Auth (NextAuth or equivalent)
NEXTAUTH_SECRET=replace_with_32_char_random_string   # ← Q14
NEXTAUTH_URL=https://cms.yourdomain.com              # ← Q15

# Internal API key for Next.js → FastAPI (server-side only, NOT NEXT_PUBLIC_)
INTERNAL_API_KEY=replace_with_random_string
```

### `backend/.env`

```bash
# Database
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST:PORT/DATABASE   # ← Q2

# Redis
REDIS_URL=redis://HOST:PORT/0                          # ← Q6
CELERY_BROKER_URL=redis://HOST:PORT/0
CELERY_RESULT_BACKEND=redis://HOST:PORT/1

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name                  # ← Q8
CLOUDINARY_API_KEY=your_api_key                        # ← Q9
CLOUDINARY_API_SECRET=your_api_secret                  # ← Q10
CLOUDINARY_UPLOAD_PRESET=utrust_server                 # ← Q12

# App
INTERNAL_API_KEY=same_as_frontend_INTERNAL_API_KEY
CORS_ORIGINS=https://cms.yourdomain.com,http://localhost:3000

# Model (optional — only needed if server has no internet access)
# U2NET_HOME=/path/to/models                           # ← Q16
```

---

## 13. Migration from Client-Side Architecture

The previous `background_removal_architecture.md` stored everything in IndexedDB as Base64 strings. Here is exactly how to migrate without losing existing drafts.

**Step 1 — Export existing IndexedDB data**

Add this to the current `SalesCMS.jsx` temporarily. Run it in the browser console to export all saved listings:

```javascript
import localforage from "localforage"

const allKeys = await localforage.keys()
const allData = {}
for (const key of allKeys) {
  allData[key] = await localforage.getItem(key)
}
console.log(JSON.stringify(allData))
// Copy the output and save it as migration_dump.json
```

**Step 2 — Import script**

Write a one-off Python script that reads `migration_dump.json`, decodes the Base64 frames, uploads each to Cloudinary at `/utrust/raw/{temp_id}/frame_N`, creates a `listings` row and `listing_frames` rows in PostgreSQL with `status='done'` (skip rembg for existing data), and marks listings as `published` if they were already live.

**Step 3 — Remove client-side dependencies**

Once all existing data is migrated:
- Remove `@imgly/background-removal` from `package.json`
- Remove `localforage` from `package.json`
- Delete the WASM model loading logic from `SalesCMS.jsx`
- Replace the IndexedDB `Publish` handler with the new `PATCH /listings/{id}/publish` call

---

## 14. Deployment Checklist

Work through this list in order before going to production.

```
Infrastructure
  □ PostgreSQL accessible from FastAPI server
  □ Redis accessible from FastAPI server AND Celery worker server
  □ Cloudinary account has sufficient upload credits for expected volume
  □ Worker server has outbound internet (or birefnet-lite model pre-downloaded)

Backend
  □ All env vars set in backend/.env
  □ Alembic migrations run: alembic upgrade head
  □ FastAPI starts without errors: uvicorn main:app --host 0.0.0.0 --port 8000
  □ Celery worker starts and prints "[worker] Model ready."
  □ CORS_ORIGINS includes your Next.js domain

Frontend
  □ All env vars set in frontend/.env.local
  □ NEXT_PUBLIC_API_URL points to FastAPI (not localhost in production)
  □ next build runs without errors
  □ SSE connection works: open /listings/{id}/upload, upload one photo, confirm frame swaps

End-to-End Test
  □ Create a listing via the CMS
  □ Upload 3 test photos
  □ Confirm raw previews appear instantly
  □ Confirm processed frames arrive via SSE within 5 seconds
  □ Confirm processed_url images have white backgrounds
  □ Click Publish — confirm listing appears in /inventory with status=published
  □ Confirm 360° SpinViewer loads processed frame sequence
```

---

## 15. Cross-Questions for Antigravity Upload

When you upload this document to Antigravity (or any AI coding assistant), it will need answers to the following before it can generate working code. Collect these answers first and paste them alongside the document.

```
CREDENTIAL & CONFIG ANSWERS
════════════════════════════════════════════════════════════════

Q1.  PostgreSQL host type (Supabase / Railway / Render / self-hosted)?
     Answer: _______________

Q2.  PostgreSQL connection string?
     Answer: postgresql://___:___@___:5432/___

Q3.  Does DB user have CREATE TABLE privileges?
     Answer: Yes / No

Q4.  Use separate schema for inventory?
     Answer: Yes → schema name: ___ / No → use public

Q5.  Redis host type (Upstash / Railway / Redis Cloud / self-hosted)?
     Answer: _______________

Q6.  Redis connection URL?
     Answer: redis://___:___@___:6379/0

Q7.  Does Redis instance support pub/sub?
     Answer: Yes / No
     (If using Upstash free tier — answer is No, upgrade needed)

Q8.  Cloudinary Cloud Name?
     Answer: _______________

Q9.  Cloudinary API Key?
     Answer: _______________

Q10. Cloudinary API Secret?
     Answer: _______________

Q11. Use recommended folder structure /utrust/raw/ /utrust/processed/?
     Answer: Yes / No → custom structure: _______________

Q12. Cloudinary upload preset name for server-side uploads?
     Answer: _______________ (create at cloudinary.com → Settings → Upload)

Q13. FastAPI base URL?
     Local dev:  http://localhost:8000
     Production: _______________

Q14. Auth mechanism between Next.js and FastAPI?
     Answer: JWT / API Key / Session Cookie / Other: _______________
     Secret value: _______________

Q15. Next.js CMS domain?
     Answer: _______________

Q16. Does worker server have outbound internet access?
     Answer: Yes / No
     If No → pre-download model path: _______________

ARCHITECTURAL DECISIONS
════════════════════════════════════════════════════════════════

Q17. Number of Celery workers to run in parallel?
     Recommended: 4
     Your answer: _______________

Q18. White background composite or transparent PNG for processed frames?
     Current spec: white (#FFFFFF) for color consistency in spin viewer
     Change to transparent? Yes / No

Q19. Should the public-facing 360° viewer read from processed_url directly
     or go through a Next.js API route?
     Recommendation: direct Cloudinary URL (faster, no Next.js overhead)
     Your answer: Direct / Via Next.js API

Q20. Do you want failed frames to auto-retry?
     Current spec: max 3 retries with 5s delay
     Change retry count? _______________

Q21. Maximum number of spin frames per listing?
     Current spec: 36 (one per 10°)
     Your answer: _______________

Q22. Do you need role-based access? (e.g. sales rep can upload, manager can publish)
     Answer: Yes / No
     If Yes → describe roles: _______________

Q23. The four cluster names are hardcoded as seeds:
     Travancore Royals, Cochin Titans, Highrange Kings, Pooram Blasters
     Are these correct and final?
     Answer: Yes / No → corrections: _______________
```

---

*End of ARCHITECTURE.md — v2.0*  
*This document replaces `background_removal_architecture.md` entirely.*  
*Next step: fill in the Q&A section above, then pass this file to Antigravity.*
