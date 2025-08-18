# routes

from flask import Blueprint, render_template

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
