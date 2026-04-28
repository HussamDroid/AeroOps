import requests

class FlightService:
    """
    Handles fetching live flight data from the OpenSky Network.
    Filtered specifically for Qatar Airways (Callsign prefix: QTR).
    """

    def __init__(self):
        # OpenSky API URL for all state vectors
        self.API_URL = "https://opensky-network.org/api/states/all"

    def get_live_qatar_flights(self):
        """
        Fetches all live flights and filters for Qatar Airways.
        """
        try:
            response = requests.get(self.API_URL)
            if response.status_code == 200:
                data = response.json()
                states = data.get("states", [])
                
                # Filter flights where the callsign starts with 'QTR' (Qatar Airways)
                # OpenSky format: state[1] is the callsign
                qatar_flights = [
                    {
                        "callsign": s[1].strip(),
                        "longitude": s[5],
                        "latitude": s[6],
                        "altitude": s[7],
                        "velocity": s[9],
                        "origin_country": s[2]
                    }
                    for s in states if s[1] and s[1].startswith("QTR")
                ]
                return qatar_flights
            else:
                print(f"Error: API returned status {response.status_code}")
                return []
        except Exception as e:
            print(f"Connection Error: {e}")
            return []

if __name__ == "__main__":
    # Internal Test
    service = FlightService()
    flights = service.get_live_qatar_flights()
    print(f"Found {len(flights)} live Qatar Airways flights.")
    if flights:
        print(f"Sample Flight: {flights[0]}")