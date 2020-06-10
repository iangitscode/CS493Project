# AWS SDK for Python
import boto3

import uuid
import time
import requests
import json

s3client = boto3.client('s3')
s3 = boto3.resource('s3')
transcribe = boto3.client('transcribe')
s3resource = boto3.resource('s3')

# Create a temporary bucket to store the file in
# Bucket names must be unique, hence the uuid
# TODO(ian): Maybe it'd be better to use one known bucket instead of generating one each time
bucket_name = 'unique-name-{}'.format(uuid.uuid4())
print('Creating new bucket with name: {}'.format(bucket_name))
s3client.create_bucket(Bucket=bucket_name)

try:
  # The file in question being uploaded
  # TODO(ian): Change this to work with arbitrary files
  object_key = 'test.mp4'

  print('Uploading video to bucket {} with key: {}'.format(
      bucket_name, object_key))

  # Perform the upload
  s3.meta.client.upload_file('test.mp4', bucket_name, object_key)

  url = 'https://{}.s3.amazonaws.com/{}'.format(bucket_name, object_key)
  job_name = 'test-transcription-{}'.format(uuid.uuid4())
  print('Starting transcription work with job name {} on file {}'.format(job_name, url))

  transcribe.start_transcription_job(
      TranscriptionJobName=job_name,
      Media={'MediaFileUri': url},
      # TODO(ian): This should be variable media format based on input
      MediaFormat='mp4',
      LanguageCode='en-US'
  )

  print('Polling list of transcription jobs to check for completion')
  while True:
      status = transcribe.get_transcription_job(TranscriptionJobName=job_name)
      if status['TranscriptionJob']['TranscriptionJobStatus'] in ['COMPLETED', 'FAILED']:
          break
      print("Not ready yet...")
      time.sleep(5)
  
  print('Full job status: ')
  print(status)

  # Extract transcription data from job
  data = requests.get(status['TranscriptionJob']['Transcript']['TranscriptFileUri'])
  
  print("My Transcription:")
  print(data.json())

finally:
  bucket = s3resource.Bucket(bucket_name)

  print('Deleting all objects in bucket {}.'.format(bucket_name))

  delete_responses = bucket.objects.delete()
  for delete_response in delete_responses:
      for deleted in delete_response['Deleted']:
          print('Deleted: {}'.format(deleted['Key']))

  print('Deleting the bucket.')
  bucket.delete()