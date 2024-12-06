# Check if venv directory exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv

    # Activate virtual environment
    source ./venv/bin/activate

    # Install requirements∏
    pip install -r requirements.txt
else
    # Activate virtual environment
    echo "Activating virtual environment..."
    source ./venv/bin/activate
fi

# Run the application
export NOTEBOOK_NAME="./notebook"
python3 main.py