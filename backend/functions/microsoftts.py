import os
import azure.cognitiveservices.speech as speechsdk
from pydub import AudioSegment

def microsoft_tts(audio_path):
    # This example requires environment variables named "SPEECH_KEY" and "SPEECH_REGION"
    speech_config = speechsdk.SpeechConfig(subscription='863b1a8ff66a409a943d7c06f079090e', region='southeastasia')
    #speech_config.speech_recognition_language="ko-KR"
    speech_config.speech_recognition_language="en-US"

    #audio_config = speechsdk.audio.AudioConfig(use_default_microphone=True)
    #speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
    try:
        # Load the audio file
        audio = AudioSegment.from_file(audio_path)

        # Specify the output filename with the .mp3 extension
        output_filename = "output.wav"

        # Export the audio as an MP3 file
        audio.export(output_filename, format="wav")

        audio_config = speechsdk.audio.AudioConfig(filename="output.wav")
        speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
        result = speech_recognizer.recognize_once_async().get()
        return result.text
    except Exception as e:
        return "Error"

