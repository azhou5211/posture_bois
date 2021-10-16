from flask.templating import render_template
from flask import session, render_template, request, redirect, url_for, flash
from app import app
import json

@app.route("/")
def homepage():
    return render_template("home.html")