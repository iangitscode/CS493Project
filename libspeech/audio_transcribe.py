#!/usr/bin/env python3

import speech_recognition as sr
from sys import argv

# obtain path to "english.wav" in the same folder as this script
from os import path
AUDIO_FILE = path.join(path.dirname(path.realpath(__file__)), argv[1])
# AUDIO_FILE = path.join(path.dirname(path.realpath(__file__)), "french.aiff")
# AUDIO_FILE = path.join(path.dirname(path.realpath(__file__)), "chinese.flac")

# use the audio file as the audio source
r = sr.Recognizer()
with sr.AudioFile(AUDIO_FILE) as source:
    audio = r.record(source)  # read the entire audio file
    # recognize speech using Sphinx
    try:
        framerate = .01
        decoder = r.recognize_sphinx(audio, show_all=False)
        print(decoder)
        print([(seg.word, seg.start_frame/framerate)for seg in decoder.seg()])
    except sr.UnknownValueError:
        print("Sphinx could not understand audio")
    except sr.RequestError as e:
        print("Sphinx error; {0}".format(e))
    exit(0)
