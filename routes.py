from flask import session, request, redirect, url_for, flash, Flask, render_template, render_template_string, Response
from app import app, ALLOWED_EXTENSIONS
import mediapipe as mp
import pandas as pd
import os
import cv2
from werkzeug.utils import secure_filename
from PIL import Image
from src.posture_bois.utils.get_data import LabelExtractor
from src.posture_bois.utils.pose_calculations import PoseCalculations

le_parent = LabelExtractor()
pc_parent = PoseCalculations()

def track_video():

    win = False
    mp_drawing = mp.solutions.drawing_utils
    mp_pose = mp.solutions.pose

    cap = cv2.VideoCapture(0)

    # white_bkg_img = Image.new('RGB', (200, 50), color = (255,255,255))
    # first_pose = pc_parent.get_key_poses().iloc[0, :]
    # mp_drawing.draw_landmarks(white_bkg_img, first_pose, mp_pose.POSE_CONNECTIONS, mp_drawing.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=2), mp_drawing.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2))
    # cv2.imwrite('pose.jpg', white_bkg_img)

    ## Setup mediapipe instance
    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        pose_iterator = 0
        while cap.isOpened():
            ret, frame = cap.read()
            
            # Recolor image to RGB
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            #change this if it doesn't flip the image right
            image = cv2.flip(image,1)

            image.flags.writeable = False
            
            # Make detection
            results = pose.process(image)

            # Recolor back to BGR
            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            
            # Extract landmarks
            #print("Upwards check:", results)

            if results.pose_landmarks:
                landmarks = results.pose_landmarks.landmark
                # print(landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x)
                row = []
                for id, lm in enumerate(results.pose_landmarks.landmark):
                    row.append((lm.x, lm.y, lm.z, lm.visibility))


                    #print('RRRRRRRRRRow:', row)
                # print(landmarks_data)

                pc_student = PoseCalculations(data = pd.DataFrame([row]))

                # le_student = LabelExtractor(None)
                pc_student.process_file()

                # print("check on route1:", pc_student.df)

                if pc_parent.pose_idx is not None and pc_student.normalized_df is not None:
                    # print(pc_parent.get_key_poses().iloc[pose_iterator, :].shape)
                    try:
                        trainer_poses = pc_parent.get_key_poses().iloc[pose_iterator, :]
                    except:
                        win = True
                        print("WIN!")
                        break
                        #RETURN RENDER TEMPLATE WELL DONE!

                    comparison = PoseCalculations.compare_poses(trainer_poses, pc_student.normalized_df.iloc[0,:], transform=pc_parent.pca_model)
                    # print("COMPARISON VALUE----->", pose_iterator, comparison)
                    if comparison > 0.85:
                        pose_iterator+=1
                        
            
                # Render detections
                mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                                        mp_drawing.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=2), 
                                        mp_drawing.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2) 
                                        )               
                comparison_disp = comparison * 100

                cv2.putText(image, f'{comparison_disp:.0f}', (70,50), cv2.FONT_HERSHEY_PLAIN, 3, (255, 0, 0), 3)
                cv2.putText(image, f'{pose_iterator:.0f}', (240,50), cv2.FONT_HERSHEY_PLAIN, 3, (255, 0, 0), 3)
                cv2.imwrite('t.jpg', image)

                yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + open('t.jpg', 'rb').read() + b'\r\n')

                if win==True:
                    break
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
            
            if win==True:
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

            # TODO: Extract data here and call function for pose
            le_parent.input_file_path = "uploads/"+filename
            le_parent.extract_landmarks()

            pc_parent.raw_df = le_parent.df
            pc_parent.process_file()
            pc_parent.trainer_pca_transformer()
            pc_parent.extract_key_poses()

            #### print knn poses on the carousel 
            # USE 


            return render_template("trainer.html", success="File successfully uploaded")
        else:
            return render_template("trainer.html", error="File type is not video. Accepted video formats: mp4, avi, mov, flv")
    return render_template("trainer.html")


@app.route('/student')
def posture_tracking():
    """Video streaming"""
    return render_template('student.html')

@app.route('/video_feed')
def video_feed():
    """Video streaming route. Put this in the src attribute of an img tag."""
    return Response(track_video(), mimetype='multipart/x-mixed-replace; boundary=frame')
