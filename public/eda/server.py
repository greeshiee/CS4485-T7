from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
from pydantic import BaseModel
from IPython.core.interactiveshell import InteractiveShell
from IPython.utils.capture import capture_output
import sys
import os

# Create an instance of InteractiveShell
shell = InteractiveShell.instance()
app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:3000",  # Allow your React app
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

class Cell(BaseModel):
    code: str

class Output(BaseModel):
    result: str
    stdout: str

@app.api_route("/run", methods=["POST", "OPTIONS"])
async def run(cell: Cell = None, request: Request = None):
    # Handle OPTIONS request
    if request.method == "OPTIONS":
        return {}

    if cell is None:
        raise HTTPException(status_code=400, detail="Cell code is required")

    running_code = ''
    for line in cell.code.splitlines():
        if line.startswith('%'):
            running_code += f"!{sys.executable} -m pip install {line[1:]} --break-system-packages\n"
        else:
            running_code += line + '\n'

    with capture_output() as captured:
        # Runs the code
        result = shell.run_cell(running_code)

    return Output(
        result=str(result.result),
        stdout=captured.stdout
    )

UPLOAD_DIRECTORY = "files"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

@app.api_route("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIRECTORY, file.filename)

    # Save the uploaded file
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    return {"filename": file.filename, "saved_to": file_path}

@app.get("/", response_class=HTMLResponse)
async def index():
    with open('index.html', 'r') as file:
        content = file.read()
    return content

@app.get("/index.js", response_class=HTMLResponse)
async def index_js():
    with open('index.js', 'r') as file:
        content = file.read()
    return content

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
