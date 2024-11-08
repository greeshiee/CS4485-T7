import requests

class PhoneSpecAPI:
    def __init__(self):
        self.base_url = "https://phone-specs-g57ftrc7l-azharimms-projects.vercel.app"

    def fetch_brands(self):
        try:
            response = requests.get(f"{self.base_url}/brands", timeout=10)
            response.raise_for_status()  # Raise an error for bad responses
            data = response.json().get("data", [])
            print(f"Fetched {len(data)} brands.")  # Debug print
            return data
        except requests.RequestException as e:
            print(f"Error fetching brands: {e}")
            return []
