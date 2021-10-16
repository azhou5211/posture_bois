from flask import session, render_template, request, redirect, url_for, flash
from app import app, ALLOWED_EXTENSIONS
import os
from werkzeug.utils import secure_filename

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/")
def homepage():
    return render_template("home.html")

@app.route("/trainer", methods=['GET', 'POST'])
def posture_matching():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        if file.filename == '':
            flash('No selected file')
            return render_template("trainer.html", error="No File Selected")
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return render_template("trainer.html")
        else:
            return render_template("trainer.html", error="File type is not video. Accepted video formats: mp4, avi, mov, flv")

    return render_template("trainer.html")

@app.route("/student")
def posture_tracking():
    return render_template("student.html")

