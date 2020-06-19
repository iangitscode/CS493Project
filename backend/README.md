# Setting up AWS Credentials
- Go to https://aws.amazon.com/education/awseducate/ and sign in with Zach's credentials
- Click "AWS Account" in top right
- Click "AWS Educate Starter Account"
- Click "Account Details"
- Follow the instructions under "AWS CLI": Copy paste the content into ~/.aws/credentials
** This token is only valid for a few hours, you'll have to repeat this step every time you start working **


# Trying out the script
- Make sure you have boto3 (AWS SDK for Python) installed ```pip3 install boto3```
- Make sure test.mp4 is in your directory
- Make sure Flask is installed ```(pip3 install flask)```
- Run with Python3 ```python3 upload_video_get_transcript.py```
- Go to your browser and type in ```localhost:5000/transcribe```
This script uploads test.mp4 and runs AWS Transcribe on it, then outputs the results to console
