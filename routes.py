from flask.templating import render_template
from flask import session, render_template, request, redirect, url_for, flash
from app import app
import json

@app.route("/")
def homepage():
    return render_template("home.html")

@app.route("/trainer")
def posture_matching():
    return render_template("trainer.html")

@app.route("/student")
def posture_tracking():
    return render_template("student.html")

