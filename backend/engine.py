import math

class AeroEngine:
    """
    The 'Brain' of AeroOps. 
    Handles Physics, Economics, and now Geospatial Geofencing.
    """
    
    def __init__(self):
        self.BASE_FUEL_BURN_PER_HOUR = 8000
        self.FUEL_PRICE_PER_KG = 1.10
        self.CREW_COST_PER_HOUR = 1200
        self.AVG_CRUISE_SPEED_KNOTS = 450
        self.ISA_TEMP_CELSIUS = 15

    def calculate_distance(self, lat1, lon1, lat2, lon2):
        """Standard Haversine formula for distance between two points."""
        R = 6371
        p1, p2 = math.radians(lat1), math.radians(lat2)
        dp, dl = math.radians(lat2-lat1), math.radians(lon2-lon1)
        a = math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
        return R * (2 * math.atan2(math.sqrt(a), math.sqrt(1-a)))

    def is_in_no_fly_zone(self, flight_lat, flight_lon, zone_lat, zone_lon, radius_km):
        """
        Checks if a flight is currently inside a forbidden area.
        """
        distance_to_zone = self.calculate_distance(flight_lat, flight_lon, zone_lat, zone_lon)
        return distance_to_zone <= radius_km

    def get_heat_penalty(self, temp):
        if temp <= self.ISA_TEMP_CELSIUS: return 1.0
        return 1 + ((temp - self.ISA_TEMP_CELSIUS) * 0.005)

    def compute_op_cost(self, distance_km, temp=15):
        speed_kmh = self.AVG_CRUISE_SPEED_KNOTS * 1.852
        flight_hours = distance_km / speed_kmh
        penalty = self.get_heat_penalty(temp)
        fuel_needed = flight_hours * self.BASE_FUEL_BURN_PER_HOUR * penalty
        total_cost = (fuel_needed * self.FUEL_PRICE_PER_KG) + (flight_hours * self.CREW_COST_PER_HOUR)
        
        return {
            "cost_usd": round(total_cost, 2),
            "fuel_kg": round(fuel_needed, 2),
            "time_hrs": round(flight_hours, 2),
            "efficiency_loss": f"{round((penalty - 1) * 100, 1)}%"
        }

if __name__ == "__main__":
    engine = AeroEngine()
    # Test No-Fly Zone: Is a flight at (25.3, 51.5) inside a 100km zone at (25.0, 51.0)?
    in_zone = engine.is_in_no_fly_zone(25.3, 51.5, 25.0, 51.0, 100)
    print(f"Is flight in danger zone? {in_zone}")