from flask import session, request, redirect, url_for, flash, Flask, render_template, render_template_string, Response
from app import app, ALLOWED_EXTENSIONS
import mediapipe as mp
import os
import cv2
from werkzeug.utils import secure_filename


def track_video():

    mp_drawing = mp.solutions.drawing_utils
    mp_pose = mp.solutions.pose

    cap = cv2.VideoCapture(0)

    ## Setup mediapipe instance
    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        while cap.isOpened():
            ret, frame = cap.read()
            
            # Recolor image to RGB
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
            
            # Make detection
            results = pose.process(image)

            # Recolor back to BGR
            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            
            # Render detections
            mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                                    mp_drawing.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=2), 
                                    mp_drawing.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2) 
                                        )               
            
            cv2.imwrite('t.jpg', image)

            yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + open('t.jpg', 'rb').read() + b'\r\n')
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
            
    cap.release()
    cv2.destroyAllWindows()

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
            return render_template("trainer.html", success="File successfully uploaded")
        else:
            return render_template("trainer.html", error="File type is not video. Accepted video formats: mp4, avi, mov, flv")

    return render_template("trainer.html")


@app.route('/student')
def iposture_tracking():
    """Video streaming"""
    return render_template('student.html')

@app.route('/video_feed')
def video_feed():
    """Video streaming route. Put this in the src attribute of an img tag."""
    return Response(track_video(), mimetype='multipart/x-mixed-replace; boundary=frame')
