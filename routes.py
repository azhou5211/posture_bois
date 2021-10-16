from flask.templating import render_template
from flask import session, request, redirect, url_for, flash, Flask, render_template, render_template_string, Response
from app import app
import json
import cv2

video_capture = cv2.VideoCapture(0)

def gen():    
    while True:
        ret, image = video_capture.read()
        cv2.imwrite('t.jpg', image)
        yield (b'--frame\r\n'
           b'Content-Type: image/jpeg\r\n\r\n' + open('t.jpg', 'rb').read() + b'\r\n')
    video_capture.release()

@app.route("/")
def homepage():
    return render_template("home.html")

@app.route("/trainer")
def posture_matching():
    return render_template("trainer.html")


@app.route('/student')
def iposture_tracking():
    """Video streaming"""
    return render_template('student.html')

@app.route('/video_feed')
def video_feed():
    """Video streaming route. Put this in the src attribute of an img tag."""
    return Response(gen(), mimetype='multipart/x-mixed-replace; boundary=frame')
