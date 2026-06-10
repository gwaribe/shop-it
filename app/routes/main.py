# routes

from flask import Blueprint, render_template, make_response, send_from_directory

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def home():
    return render_template('home.html')

@main_bp.route('/scan')
def scan():
    return render_template('scan.html')

@main_bp.route('/usage')
def usage():
    return render_template('usage.html')

# Serve the Service Worker from the root scope
@main_bp.route('/sw.js')
def serve_sw():
    response = make_response(send_from_directory('static', 'sw.js'))
    response.headers['Content-Type'] = 'application/javascript'
    response.headers['Service-Worker-Allowed'] = '/'
    return response

# The offline fallback page
@main_bp.route('/offline')
def offline():
    return render_template('offline.html')

@main_bp.route('/.well-known/assetlinks.json')
def assetlinks():
    response = make_response(send_from_directory('static/.well-known', 'assetlinks.json'))
    response.headers['Content-Type'] = 'application/json'
    return response