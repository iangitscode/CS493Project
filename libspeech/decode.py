#!/usr/bin/python3


from kaldiasr.nnet3 import KaldiNNet3OnlineModel, KaldiNNet3OnlineDecoder
from pydub import AudioSegment
from deepsegment import DeepSegment

from flask import Flask, request, render_template
from flask_cors import CORS

import subprocess
import sys
import os
import json

app = Flask(__name__)
CORS(app)

MODELDIR    = '/home/raynor106/Public/share/libspeech/model/kaldi-generic-en-tdnn_fl-r20190609'

def delete_if_exists(filepath):
    if os.path.exists(filepath):
        os.remove(filepath)

def wav_from_mp4(mp4_file):
    wav_out = mp4_file + ".wav"
    delete_if_exists(wav_out)
    
    with open('/tmp/ffmpeg.log', "w") as outfile:
        subprocess.run("ffmpeg -i " + mp4_file + " -vn -acodec pcm_s16le -ar 16000 -ac 2 " + wav_out, shell=True, stderr=outfile)
    
    return wav_out

def stereo_to_mono(stereo_file):
    mono_out = stereo_file + ".mono"
    delete_if_exists(mono_out)
    
    sound = AudioSegment.from_wav(stereo_file)
    sound = sound.set_channels(1)
    sound.export(mono_out, format="wav")

    delete_if_exists(stereo_file)

    return os.path.abspath(mono_out)

def prepare_input(mp4_file):
    stereo_wav = wav_from_mp4(mp4_file)
    return stereo_to_mono(stereo_wav)

def decode(WAVFILE):
    kaldi_model = KaldiNNet3OnlineModel (MODELDIR)
    decoder     = KaldiNNet3OnlineDecoder (kaldi_model)

    if decoder.decode_wav_file(WAVFILE):

        s, l = decoder.get_decoded_string()
        align = decoder.get_word_alignment()

        os.remove(WAVFILE)

        for word_idx in range(len(align[0])):
            str_word = align[0][word_idx].decode("utf-8")
            align[0][word_idx] = str_word
    
        out_dict = dict()
        out_dict["transcript"] = s
        out_dict["likelihood"] = l
        out_dict["model"] = os.path.basename(MODELDIR)
        out_dict["alignment"] = align
        return out_dict
        #print()
        #print(u"*****************************************************************")
        #print(u"**", WAVFILE)
        #print(u"**", s)
        #print(u"** %s likelihood:" % MODELDIR, l)
        #print(u"*****************************************************************")
        #print()

        #print()

    else:
        print("***ERROR: decoding of %s failed." % WAVFILE)
        return "error"

def segment(transcript):
    # The default language is 'en'
    segmenter = DeepSegment("en")
    result = segmenter.segment(transcript)
    print(result)
    print("# segments: " + str(len(result)))

def prepare_and_decode(input_filename):
        mono_wav = prepare_input(input_filename)
        print("Converted to WAV mono.")
        output = decode(mono_wav)
        print("Decoded with Kaldi.") 
        return output


@app.route('/')
def run():
  return "call /transcribe"

@app.route('/transcribe', methods=['POST'])
def transcribe():
    try:
        input_filename = "/tmp/transcribe.mp4"
        mp4_byte_buffer = request.data
        mp4 = open(input_filename, "wb")
        mp4.write(mp4_byte_buffer)
        mp4.close()
        print("Read MP4.")
        dict_obj = prepare_and_decode(input_filename)
        delete_if_exists(input_filename)
        return json.dumps(dict_obj)
    except Exception as error: 
        delete_if_exists("/tmp/transcribe.mp4")
        print("ERROR: " + str(error))


if __name__ == '__main__':
    if len(sys.argv) > 1:
        transcript = prepare_and_decode(sys.argv[1])["transcript"]
        segment(transcript)
    else:
        app.run(host='0.0.0.0', port=10000)

