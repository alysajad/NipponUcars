# NipponUcars

NipponUcars is a modern, full-stack web application designed for a used car dealership or marketplace. It features a robust backend built with Python (FastAPI) and a highly interactive, 3D-capable frontend built with Next.js and Three.js.

## Tech Stack

### Frontend
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **3D Rendering**: Three.js, React Three Fiber, Drei
- **Animations**: GSAP, Framer Motion
- **Smooth Scrolling**: Lenis

### Backend
- **Framework**: FastAPI (Python)
- **Database / Auth**: Supabase
- **Image Management**: Cloudinary
- **Caching / Background Tasks**: Redis
- **Server**: Uvicorn

## Project Structure

The repository is divided into two main directories:

- `frontend/`: The Next.js web application.
- `backend/`: The FastAPI Python backend services.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher recommended)
- Python (v3.12 or higher recommended)
- Git

## Environment Variables Setup

### Backend Environment Variables
Create a `.env` file in the `backend/` directory with the following keys (see `backend/.env.example` if available):
```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_api_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Redis
REDIS_URL=your_redis_url
```

### Frontend Environment Variables
Create a `.env.local` file in the `frontend/` directory. (Check `frontend/.env.local` for required keys, typically API URLs pointing to your backend).

## Local Development Setup

### 1. Backend Setup

Open a terminal and navigate to the `backend/` directory:

```bash
cd backend
```

Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Run the FastAPI server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
The backend API will be available at `http://localhost:8000`. You can view the API documentation at `http://localhost:8000/docs`.

### 2. Frontend Setup

Open a new terminal and navigate to the `frontend/` directory:

```bash
cd frontend
```

Install dependencies:
```bash
npm install
# or yarn install / pnpm install
```

Run the development server:
```bash
npm run dev
# or yarn dev / pnpm dev
```
The frontend application will be available at `http://localhost:3000`.

## Deployment

### Backend Deployment (Render)
The backend is configured for deployment on [Render](https://render.com) using the `render.yaml` file in the root directory. It sets up:
- A Python web service running FastAPI.
- A Redis instance for caching and background operations.

### Frontend Deployment (Vercel)
The frontend is optimized for deployment on [Vercel](https://vercel.com). Simply import the `frontend/` directory as a Next.js project in your Vercel dashboard.

## Contributing
(Add any contribution guidelines here)
