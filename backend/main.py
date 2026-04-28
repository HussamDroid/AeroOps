from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import math
import sqlite3

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def init_db():
    conn = sqlite3.connect('aero_ops.db')
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS zones 
                     (id INTEGER PRIMARY KEY, lat REAL, lng REAL, radius REAL)''')
    conn.commit()
    conn.close()

init_db()

FLIGHTS = [
    {"callsign": "QTR91Y", "type": "B777-300ER", "start": [25.27, 51.52], "end": [35.68, 139.65], "origin": "DOH", "destination": "NRT", "mtow": "351,533 kg", "crew_duty": "08:45 / 14:00", "fatigue_index": "Low"},
    {"callsign": "QTR722", "type": "A350-1000", "start": [25.27, 51.52], "end": [23.00, 45.00], "origin": "DOH", "destination": "JED", "mtow": "316,000 kg", "crew_duty": "03:20 / 12:00", "fatigue_index": "Optimal"},
    {"callsign": "QTR001", "type": "B787-9", "start": [25.27, 51.52], "end": [51.50, -0.12], "origin": "DOH", "destination": "LHR", "mtow": "254,011 kg", "crew_duty": "11:15 / 14:00", "fatigue_index": "Moderate (Alert)"},
    {"callsign": "QTR442", "type": "A380-800", "start": [25.27, 51.52], "end": [48.85, 2.35], "origin": "DOH", "destination": "CDG", "mtow": "575,000 kg", "crew_duty": "05:10 / 16:00", "fatigue_index": "Low"},
    {"callsign": "QTR889", "type": "B777-200LR", "start": [25.27, 51.52], "end": [40.71, -74.00], "origin": "DOH", "destination": "JFK", "mtow": "347,814 kg", "crew_duty": "13:40 / 17:00", "fatigue_index": "High (Critical)"}
]

def get_distance_to_line(p, a, b):
    x, y = p; x1, y1 = a; x2, y2 = b
    dx, dy = x2 - x1, y2 - y1
    if dx == 0 and dy == 0: return math.hypot(x - x1, y - y1)
    t = max(0, min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)))
    return math.hypot(x - (x1 + t * dx), y - (y1 + t * dy))

@app.get("/api/live-operations")
def get_live_ops(): return {"data": FLIGHTS}

@app.get("/api/zones")
def get_zones():
    conn = sqlite3.connect('aero_ops.db')
    cursor = conn.cursor(); cursor.execute("SELECT id, lat, lng, radius FROM zones")
    rows = cursor.fetchall(); conn.close()
    return [{"id": r[0], "center": [r[1], r[2]], "radius": r[3]} for r in rows]

@app.post("/api/zones")
def save_zone(zone: dict = Body(...)):
    conn = sqlite3.connect('aero_ops.db')
    cursor = conn.cursor(); cursor.execute("INSERT INTO zones (lat, lng, radius) VALUES (?, ?, ?)", (zone["center"][0], zone["center"][1], zone["radius"]))
    new_id = cursor.lastrowid; conn.commit(); conn.close()
    return {"id": new_id}

@app.delete("/api/zones/{zone_id}")
def delete_zone(zone_id: int):
    conn = sqlite3.connect('aero_ops.db')
    cursor = conn.cursor(); cursor.execute("DELETE FROM zones WHERE id = ?", (zone_id,)); conn.commit(); conn.close()
    return {"status": "deleted"}

@app.post("/api/analyze-path")
def analyze_path(data: dict = Body(...)):
    flight, zones = data.get("flight"), data.get("zones", [])
    if not flight or not zones: return {"status": "CLEAR", "strategies": []}
    
    conflicts = [z for z in zones if get_distance_to_line(z["center"], flight["start"], flight["end"]) < (z["radius"] * 1.2 / 111000)]
    if not conflicts: return {"status": "CLEAR", "strategies": []}

    c_lat, c_lng = conflicts[0]["center"]
    offset = (conflicts[0]["radius"] / 111000) * 1.6
    return {
        "status": "CONFLICT",
        "strategies": [
            {"id": "eco", "name": "ECO-FLOW", "detour": 120, "fuel": 1500, "cost": 1650, "color": "#10b981", "waypoint": [c_lat + offset, c_lng], "comparison": {"fuel_diff": "+8%", "cost_diff": "+$1,650", "safety_score": "88%"}},
            {"id": "bal", "name": "BALANCED", "detour": 380, "fuel": 4750, "cost": 5200, "color": "#f59e0b", "waypoint": [c_lat + offset * 1.5, c_lng - offset], "comparison": {"fuel_diff": "+15%", "cost_diff": "+$5,200", "safety_score": "96%"}},
            {"id": "saf", "name": "MAX-SAFETY", "detour": 720, "fuel": 9000, "cost": 10500, "color": "#ef4444", "waypoint": [c_lat + offset * 2.2, c_lng - offset * 1.5], "comparison": {"fuel_diff": "+28%", "cost_diff": "+$10,500", "safety_score": "100%"}}
        ]
    }