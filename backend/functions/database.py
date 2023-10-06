import os
import json

#import the requried modules
import firebase_admin
from firebase_admin import db, credentials
from functions.prompt import PROMPT, QNS_1



#authenticate to firebase
cred = credentials.Certificate("db.json")
firebase_admin.initialize_app(cred, {"databaseURL": "https://eduflare-9f4c5-default-rtdb.asia-southeast1.firebasedatabase.app/"})

def template():

  # Define the file name
  ##file_name = "stored_data.json"
  messages =  [{
      "role":"system",
      "content": "###Limit: Make your response at most 20 words. Each time increase ### Count by 1. \
      ### Kill-Switch: When a user goes out of topic or asks weird questions more than 2 counts or the conversation has reached 9 counts. End the conversation by saying Thank you and add this back <End of conversation> \
      ### Role: User: An ex-student attending a formal event for the first time. AI: An PE coach providing guidance on appropriate greetings. \
      ### Situation: Attending a formal school assembly. \
      ### Prompt: Have a conversation with the AI where it will enquire how the student is doing and his occupation. \
      ### Feedback: Based on 'user' content, tell him how he can improve himself. Write the feedback in {Write here}. If there is no feedback, write 'no feedback'   "
      },
	      {
            "role": "assistant",
            "content":"안녕하세요! 처음 오셨군요. 이름이 어떻게 되시나요? ### Count: 1 ### Feedback {Write here}"
        },
	]
  # Return messages
  return messages


def get_recent_messages():

  # Initialize messages
  messages = template()


  # Get last messages from database
  try:
    ref = db.reference("/history").get()

    # Append last 5 rows of data
    if ref:
        for item in ref:
          messages.append(item)
  except:
    pass

  # Return messages
  return messages

# Save messages for retrieval later on



# Save messages for retrieval later on
def store_messages(request_message, response_message):

  # Define the file name
  #file_name = "stored_data.json"

  # Get recent messages
  messages = get_recent_messages()

  # Add messages to data
  user_message = {"role": "user", 
                  "content": request_message}
  assistant_message = {"role": "assistant", 
                       "content": response_message} 
  messages.append(user_message)
  messages.append(assistant_message)

  # Save the data into firebase
  db.reference("/").update({"history":messages})


# Save messages for retrieval later on
def reset_messages():


  # reset message from firebase
  db.reference("/").delete()
  # append learning instruction into firebase db
  db.reference("/").update(template()[0])

