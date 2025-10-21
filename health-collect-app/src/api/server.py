
# Main entry point for the API server
from src.api.app import app

# This is kept for backward compatibility with existing code
# that might import from server.py
if __name__ == '__main__':
    app.run(debug=True, port=5000)
