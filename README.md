# AeroOps: Tactical Flight Operations & Reroute Engine

**AeroOps** is a high-fidelity flight simulation and mission analysis tool designed for real-time conflict resolution in commercial aviation. It enables flight dispatchers to visualize global assets, identify restricted airspaces, and deploy optimized reroutes based on fuel efficiency, cost, and crew readiness.

## Core Features
* **Live Tactical Map:** Interactive Leaflet-based global tracking with dark/light mode support.
* **Dynamic Conflict Detection:** Real-time path intersection analysis against user-defined No-Fly Zones.
* **Triple-Tier Rerouting:**
    * **ECO-FLOW:** Optimized for minimum fuel burn and CO2 reduction.
    * **BALANCED:** A trade-off between detour length and operational cost.
    * **MAX-SAFETY:** Prioritizes maximum clearance from restricted sectors.
* **Human Factors Integration:** Crew Duty Limit (CDL) tracking and fatigue indexing.
* **ACARS Uplink Simulation:** Visual confirmation of flight plan deployment to airframes.

## Tech Stack
* **Frontend:** React.js, Tailwind CSS, Lucide Icons, Framer Motion, React-Leaflet.
* **Backend:** FastAPI (Python), SQLite3 for persistent spatial data.
* **Logic:** Haversine-based distance algorithms and coordinate offset mathematics.

## Installation

### 1. Backend Setup
```bash
cd backend
python -m venv venv
venv/Scripts/activate
pip install fastapi uvicorn
uvicorn main:app --reload

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start