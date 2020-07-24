# AWS SDK for Python
import boto3
import os
import uuid
import time
import requests
import json
import wget
from pytube import YouTube
from flask import Flask, request, render_template
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

s3client = boto3.client('s3')
s3 = boto3.resource('s3')
aws_transcribe = boto3.client('transcribe')
s3resource = boto3.resource('s3')

@app.route('/')
def run():
  return render_template('index.html')

@app.route('/transcribe', methods=['POST'])
def transcribe():
    # Create a temporary bucket to store the file in
    # Bucket names must be unique, hence the uuid
    # TODO(ian): Maybe it'd be better to use one known bucket instead of generating one each time
    bucket_name = 'unique-name-{}'.format(uuid.uuid4())
    print('Creating new bucket with name: {}'.format(bucket_name))
    s3client.create_bucket(Bucket=bucket_name)

    try:

      # Code to get file from URL, used for GET requests

      # # Get the url param sent from the front end
      # # link = list(request.form.to_dict().keys())[0] + '=' + list(request.form.to_dict().values())[0]
      # link = request.args.get('url')
      # print("Link is",link)

      # object_key = ""
      # if "youtube.com" in link:
      #   # Download using pytube library
      #   yt = YouTube(link)
      #   stream = yt.streams.first()
      #   stream.download('tmp')

      #   # Get the mp4 name
      #   videos = []
      #   videos += [each for each in os.listdir('tmp') if each.endswith('.mp4')]
      #   print(videos)
      #   object_key = videos[0]
      # else:
      #   wget.download(link, "tmp/download.mp4")
      #   object_key = "download.mp4"

      if not os.path.exists("tmp"):
          os.mkdir("tmp")
      f = open("tmp/download.mp4", "wb")
      f.write(request.data)
      f.close()
      object_key = "download.mp4"

      # Perform the upload
      print('Uploading video to bucket {} with key: {}'.format(
          bucket_name, object_key))

      s3.meta.client.upload_file('tmp/'+object_key, bucket_name, object_key)

      url = 'https://{}.s3.amazonaws.com/{}'.format(bucket_name, object_key)
      job_name = 'test-transcription-{}'.format(uuid.uuid4())
      print('Starting transcription work with job name {} on file {}'.format(job_name, url))

      aws_transcribe.start_transcription_job(
          TranscriptionJobName=job_name,
          Media={'MediaFileUri': url},
          # TODO(ian): This should be variable media format based on input
          MediaFormat='mp4',
          LanguageCode='en-US'
      )

      print('Polling list of transcription jobs to check for completion')
      while True:
          status = aws_transcribe.get_transcription_job(TranscriptionJobName=job_name)
          if status['TranscriptionJob']['TranscriptionJobStatus'] in ['COMPLETED', 'FAILED']:
              break
          print("Not ready yet...")
          time.sleep(5)

      # Extract transcription data from job
      data = requests.get(status['TranscriptionJob']['Transcript']['TranscriptFileUri'])

    finally:
      bucket = s3resource.Bucket(bucket_name)

      print('Deleting all objects in bucket {}.'.format(bucket_name))

      delete_responses = bucket.objects.delete()
      for delete_response in delete_responses:
          for deleted in delete_response['Deleted']:
              print('Deleted: {}'.format(deleted['Key']))

      print('Deleting the bucket.')
      bucket.delete()
      print('Deleting the video')
      os.remove('tmp/'+object_key)
    return json.dumps(postProcessData(data.json()))

# Handle all postprocessing work for the data
def postProcessData(data):
  result = {}
  result["timestamps"] = extractSimpleTimestamps(data)
  result["complete_transcript"] = data["results"]["transcripts"][0]["transcript"]
  return result

# Make output format smaller by removing unnecessary data
# Output format will look like
# {
#  "timestamps":
#   [
#     {"time": "0.14", "word": "Hello", "type": "pronunciation"},
#     {"time": -1, "word": ",", "type": "punctuation"},
#     {"time": "0.81", "word": "world", "type": "pronunciation"},
#     {"time": -1, "word": ".", "type": "punctuation"}
#   ],
#  "complete_transcript": "Hello, world."
# }

def extractSimpleTimestamps(data):
  result = []
  for item in data["results"]["items"]:
    mostLikelyWord = max(item["alternatives"], key=lambda x: x["confidence"])["content"]
    next_word = {"time": -1, "word": mostLikelyWord, "type": item["type"]}
    if item["type"] == "pronunciation":
      next_word["time"] = item["start_time"]
    result.append(next_word)

  return result

if __name__ == '__main__':
  app.run()
