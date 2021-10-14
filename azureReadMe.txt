To push changes to azure
First, make sure you are running a virtual environment that has azure-cli installed
Login to azure
	az login
Create a zip file caled app.zip that contains the whoe repo
Upload the code
	az webapp deployment source config-zip --resource-group posture_bois --name posturematcher --src app.zip
The app will be live at https://posturematcher.azurewebsites.net/

Requirements for the app to upload successfully
1. A requirements.txt file. Only modules specified in this file will be available to the app.
2. A python file called app.py that has a Flask app in it named "app".
