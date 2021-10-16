from flask import (
    Flask,
    request,
    render_template,
    session,
    redirect,
    url_for,
    jsonify,
    send_from_directory,
    make_response,
    abort,
    g,
)

from config import Config

# Initialize and config app
app = Flask(__name__, static_folder="frontend/static", template_folder="frontend/views")
UPLOAD_FOLDER = 'uploads/'
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'flv'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config.from_object(Config)

import routes

if __name__ == "__main__":
    app.debug = True
    app.run()

