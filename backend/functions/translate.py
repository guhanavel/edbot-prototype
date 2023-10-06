# import packages
import os
from google.cloud import translate_v2
import html



os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = r"translate.json"


def translator(text):
    translate_client = translate_v2.Client()
    target = "en"
    output = html.unescape(translate_client.translate(text,target_language=target)["translatedText"])
    print(output)
    return output