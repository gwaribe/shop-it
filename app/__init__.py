# app configuration and initialization
from flask import Flask

def create_app():
    app = Flask(__name__)

    # register blueprints
    from app.routes.main import main_bp
    from app.routes.inventory import inventory_bp
    from app.routes.payment import payment_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(inventory_bp, url_prefix="/inventory")
    app.register_blueprint(payment_bp, url_prefix="/mpesa")

    
    return app

app = create_app()
if __name__ == "__main__":
    app.run(debug=False)