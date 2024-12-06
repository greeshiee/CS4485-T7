from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from data_ingestion import app as data_ingestion_app
from dashboarding import app as dashboarding_app
# from data_pipelining import app as data_pipelining_app
from data_generation import app as data_generation_app
from eda import app as eda_app
from fault_management import app as fault_management_app
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse
from jose import JWTError, jwt
import requests
from kpi import app as kpi_management_app



DOMAIN = 'dev-ek2dti7hmslc8nga.us.auth0.com'        # e.g., 'your-domain.auth0.com'
AUDIENCE = 'cs4485'     # e.g., 'https://your-api/'
ALGOS = ['RS256']
JWKS_URL = f"https://{DOMAIN}/.well-known/jwks.json"
JWKS = requests.get(JWKS_URL).json()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# JWT Authentication Middleware
@app.middleware("http")
async def jwt_authentication_middleware(request: Request, call_next):
    # List of paths that should bypass JWT authentication
    bypass_paths = ["/dashboarding/public-dashboards", "/dashboarding/dashboards", '/kpi_management']
    
    # Always allow OPTIONS requests
    if request.method == "OPTIONS":
        response = await call_next(request)
        return response

    # Check if the path should bypass authentication
    if any(request.url.path.startswith(path) for path in bypass_paths):
        response = await call_next(request)
        return response

    print('auth started')

    auth_header = request.headers.get('Authorization')
    if auth_header is None or not auth_header.startswith('Bearer '):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Not authenticated"},
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth_header.split(" ")[1]

    # Replace these with your actual values



    unverified_header = jwt.get_unverified_header(token)
    rsa_key = {}
    for key in JWKS["keys"]:
        if key["kid"] == unverified_header["kid"]:
            rsa_key = {
                "kty": key["kty"],
                "kid": key["kid"],
                "use": key["use"],
                "n": key["n"],
                "e": key["e"],
            }
            break

    if not rsa_key:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Invalid token"},
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=ALGOS,
            audience=AUDIENCE,
            issuer=f"https://{DOMAIN}/",
        )
        request.state.user = payload  # Save user info in request state
    except JWTError as e:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Could not validate credentials: " + str(e)},
            headers={"WWW-Authenticate": "Bearer"},
        )

    response = await call_next(request)

    print('auth ended')

    return response

# Authorization Header Logging Middleware
@app.middleware("http")
async def auth_header_logging_middleware(request: Request, call_next):
    auth_header = request.headers.get('Authorization')
    print(f"Authorization Header: {auth_header}")
    response = await call_next(request)
    return response

@app.route('/test')
def test():
    return "This is a test"

app.mount("/dashboarding", dashboarding_app)
# app.mount("/", data_pipelining_app)
app.mount("/data_generation", data_generation_app)
app.mount("/eda", eda_app)
app.mount("/fault_management", fault_management_app)
app.mount("/kpi_management", kpi_management_app)
app.mount("/data_ingestion", data_ingestion_app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)

