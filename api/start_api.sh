# Check if venv directory exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source ./venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run the application
NOTEBOOK_NAME="./notebook" python main.py