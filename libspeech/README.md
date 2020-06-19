# Lib Speech

## Dependencies:
- libpulse-dev
- swig
- libasound2-dev
- pocketsphinx (CMU's offline speech recognition engine)

To install in Ubuntu:
```
sudo apt install libpulse-dev swig libasound2-dev
```
To install in MacOS (I somehow didn't need PulseAudio or libsound2 on my mac):
```
brew install swig
```
On all platform:
```
pip3 install pocketsphinx
```


## Debug
```
cd libspeech
python3 audio_transcribe.py cs480_super_cut.flac
```

## Data
The python scripts works with RAW audio files (FLAC) not compressed ones (MP3 etc). 

There are two files included. They are both from a YouTube upload of a CS lecture. 

`cs480_cut` is 3 minutes long and `cs480_super_cut` is 30 seconds long.

