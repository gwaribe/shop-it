# app configuration and initialization
from flask import Flask

def create_app():
    app = Flask(__name__)

    # register blueprints
    from app.routes.main import main_bp
    app.register_blueprint(main_bp)

    return app