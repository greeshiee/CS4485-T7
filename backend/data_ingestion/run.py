import sys
import os
import uvicorn

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.realpath(__file__)))

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)