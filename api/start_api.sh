# Check if venv directory exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv                 
fi

# Activate virtual environment
source ./venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run the application
export NOTEBOOK_NAME="./notebook"
python3 main.py