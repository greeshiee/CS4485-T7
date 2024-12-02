from fastapi import FastAPI

from dashboarding import app as dashboarding_app
# from data_pipelining import app as data_pipelining_app
from data_generation import app as data_generation_app
from eda import app as eda_app
from fault_management import app as fault_management_app

app = FastAPI()

app.mount("/", dashboarding_app)
# app.mount("/", data_pipelining_app)
app.mount("/", data_generation_app)
app.mount("/", eda_app)
app.mount("/", fault_management_app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)

