from fastapi import FastAPI, HTTPException
from .phone_spec_db import init_db, insert_phone, get_all_phones
from .api_integration import PhoneSpecAPI
import requests
from fastapi.middleware.cors import CORSMiddleware


# Initialize FastAPI app and database
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
                    "http://localhost:3000/phones",
                    "http://127.0.0.1:3000", 
                    ], # Vite development server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
init_db()

# Initialize the PhoneSpecAPI client
phone_spec_api = PhoneSpecAPI()

@app.get("/fetch")
def fetch_data():
    """Fetch data from the external API and store it in the database."""
    brands = phone_spec_api.fetch_brands()
    if not brands:
        raise HTTPException(status_code=404, detail="No data fetched from the API")

    for brand in brands:
        insert_phone(brand["brand_name"], "N/A")  # Assuming no model info in this call
    return {"message": "Data fetched and stored successfully"}

@app.get("/phone/{phone_slug}")
def get_phone_specs(phone_slug: str):
    """Fetch detailed specifications of a specific phone."""
    try:
        response = requests.get(f"{phone_spec_api.base_url}/{phone_slug}")
        response.raise_for_status()
        phone_specs = response.json().get("data", {})
        return phone_specs
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/phones/{brand_slug}")
def get_phones_by_brand(brand_slug: str):
    """Fetch all phones for a specific brand."""
    try:
        response = requests.get(
            f"{phone_spec_api.base_url}/brands/{brand_slug}"
        )
        response.raise_for_status()
        phones = response.json().get("data", {}).get("phones", [])
        return {"phones": phones}
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/phones")
def get_phones():
    """Retrieve all phones from the database."""
    phones = get_all_phones()
    if not phones:
        raise HTTPException(status_code=404, detail="No phones found")
    return {"phones": phones}

@app.get("/search")
def search_phone(query: str):
    """Search for a phone by name."""
    try:
        response = requests.get(
            f"{phone_spec_api.base_url}/search", params={"query": query}
        )
        response.raise_for_status()
        results = response.json().get("data", [])
        return {"results": results}
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/latest")
def get_latest_phones():
    """Fetch the latest phones."""
    try:
        response = requests.get(f"{phone_spec_api.base_url}/latest")
        response.raise_for_status()
        latest_phones = response.json().get("data", [])
        return {"latest": latest_phones}
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
