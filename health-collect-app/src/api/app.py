
from flask import Flask
from flask_cors import CORS
from src.api.routes.service_orders import service_orders_bp

def create_app():
    """Factory function to create and configure the Flask app"""
    app = Flask(__name__)
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(service_orders_bp)
    
    return app

# Create the application instance
app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
