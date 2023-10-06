import { useEffect, useState } from "react";
import Title from "./Title";
import axios from "axios";
import RecordMessage from "./RecordMessage";
import Next from "./Next";
import Collapsible from 'react-collapsible';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';

import { MessageBox } from "./MessageBox";


const Convo = () => {
  // initial state
  const [isLoading, setIsLoading] = useState(false);
  // title at top
  const [preamble, setPreamble] = useState<string>("");
  // Bot and user messages
  const [messages, setMessages] = useState<any[]>([]);
  // Grammar and Appropriatness here
  const [feedback, setFeedback] = useState<any[]>([]);
  // Suggest answer here
  const [suggested, setSuggested] = useState<any[]>([]);
  // temp message
  const [message, setMessage] = useState<string>('');
  // temp bloburl
  const [bloburl, setBloburl] = useState<string>('');
  // recording status
  const [recordingStatus, setRecordingStatus] = useState<string>('');



  // create function called createBlobUrl to convert any audio to Blob
  function createBlobURL(data: any) {
    const blob = new Blob([data], { type: "audio/mpeg" });
    const url = window.URL.createObjectURL(blob);
    return url;
  }

  // need to create a function or method to display the inital question 
  const MAX_STARS = 5; // Assuming you want to rate out of 5 stars

  const renderStars = (score: number) => {
    let stars = [];
    for (let i = 0; i < MAX_STARS; i++) {
      if (i < score) {
        stars.push(<FontAwesomeIcon key={i} icon={faStarSolid} />);
      } else {
        stars.push(<FontAwesomeIcon key={i} icon={faStarRegular} />);
      }
    }
    return stars;
  };

  // This function will be called by the child component
  const handleStatusChange = (status: string) => {
    setRecordingStatus(status);
};
  

  
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response_text = await fetch('http://localhost:8000/start-question-text');
        const response_audio = await fetch('http://localhost:8000/start-question-voice');
        const preambleResponse = await fetch('http://localhost:8000/conversation-preamble');
        const preambleData = await preambleResponse.json();
        setPreamble(preambleData.text);
        const data = await response_text.json();
        const blob = await response_audio.blob();
        const audio = new Audio();
        audio.src = createBlobURL(blob);
        //const initialMessage = { sender: "Edubot", blobUrl: audio.src, text: data.text };
        //const newMessageArr = [...messages, initialMessage];
        setMessages([{ sender: "Edubot", blobUrl: audio.src, text: data.text }]);
        setIsLoading(false);
        audio.play();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  },[]);
  

  const [isResetting, setIsResetting] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
    setClickCount(clickCount + 1);
  };

  // Reset conversation
  const resetConversation = async () => {
    setIsResetting(true);
    setClickCount(0);

    await axios
      .get("http://localhost:8000/reset", {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.status == 200) {
          setMessages([{ sender: "Edubot", text:res.data}]);
          setFeedback([])
          setSuggested([])

        }
      })
      .catch((err) => {});

    setIsResetting(false);
  };


  // when the recording stops, infomation will start processing here
  const handleStop = async (blobUrl: string) => {
    setIsLoading(true);

    // convert blob url to blob object
    fetch(blobUrl)
      .then((res) => res.blob())
      .then(async (blob) => {
        // Construct audio to send file
        const formData = new FormData();
        formData.append("file", blob, "myFile.wav");
        
        // Send audio file --> post-audio endpoint (to get audio text)
        const { data:text } = await axios.post<string>("http://localhost:8000/get-user-audio", formData, {
          headers: {
            "Content-Type": "audio/mpeg",
          },
        });
        // Append the received text to edubot message
        
        setMessage(text)
        setBloburl(blobUrl)
        setIsLoading(false);

        
      });
  };
  
  const whenEnter = async () => {
     //set the formdata for GPTResponse
     setIsLoading(true);
     const formtext = new FormData();
     formtext.append("message_decode", message);
     const myMessage = {sender: "Me", blobUrl:bloburl, text:message}
     const newMessageArr = [...messages,myMessage]
     setMessages(newMessageArr)
     setMessage('');
     

     // send the my text to get GPTresponse
     const { data:gpt } = await axios.post("http://localhost:8000/feedback", formtext, {
       headers: {
         "Content-Type": 'multipart/form-data',
       },
     });
     //Append gpt text to edubot message
     const grammarMessage = [{sender: "Grammar", text:gpt.grammar_feedback, score:gpt.grammar_score},
                             {sender:"Appropriateness", text:gpt.appropriateness_feedback, score:gpt.appropriateness_score}]
     const feedbackArr = [...feedback, ...grammarMessage]
     setFeedback(feedbackArr);
     const formDat = new FormData();
     formDat.append("chat_response", gpt.suggested_answer);


     // send form data to api endpoint
     await axios
       .post("http://localhost:8000/suggested-answer",formDat, {
         headers: {
           "Content-Type": 'multipart/form-data',
         },
         responseType: "arraybuffer", // Set the response type to handle binary data
       })
       .then((res: any) => {
         const blob = res.data;
         const audio = new Audio();
         audio.src = createBlobURL(blob);
         

         // Append to audio
         const suggestedAns = { sender: "Suggested Answer", blobUrl:audio.src, text:gpt.suggested_answer, next:gpt.Next };
         const newSuggestedArr = [...suggested,suggestedAns]
         setSuggested(newSuggestedArr);

         // Play audio
         setIsLoading(false);
       })
       .catch((err: any) => {
         console.error(err);
         setIsLoading(false);
       });


}
  

  return (
    <div className="h-screen overflow-y-hidden">
      {/* Title */}
      <Title setMessages={setMessages} setFeedback={setFeedback} setSuggested={setSuggested} />
      <div className="preamble-container">
          <p className="preamble-text">{preamble}</p>
      </div>
      <div className="flex flex-col justify-between h-full overflow-y-scroll pb-96">
      
      
        {/* Conversation */}
        <div className="mt-5 px-5">


{/* Response */}
        {messages?.map((audio, index) => {
  return (
    <div
      key={index + audio.sender}
      className={
        "flex flex-col " +
        (audio.sender == "Me" ? "flex items-end" : "")
      }
      
    >
      
      {/* Sender */}
      <div className="mt-4">
        
        
        <p
          className={
            audio.sender == "Me"
              ? "text-left mr-2 italic text-green-500"
              : "ml-2 italic text-blue-500"
          }
        >
          {audio.sender}
        </p>

        {/* Text Message */}
      <div className={audio.sender == "Me"? "relative p-4 bg-green-500  max-w-xs rounded-xl" :"relative p-4 bg-blue-500  max-w-xs rounded-xl"}>
  
        <p className = "text-white">{audio.text}</p>
        {/* Message */}
        <audio
          src={audio.blobUrl}
          className="appearance-none"
          controls
        />
        
      </div>
      </div>
    </div>
    
  );
})}

{/* Feedback */}
{feedback.length > 0 && (
<div className="flex flex-col bg-orange-900 text-white rounded-lg p-4 m-2">
  <div className="text-xl font-bold mb-4">Feedback</div>

  {/* Evaluation */}
  {feedback?.map((type, index) => {
    return (
      <div key={index + type.sender} className="flex flex-col mb-4">
        {/* Sender */}
        <div className="max-w-md mx-flex">
          <Collapsible 
            trigger={
              <div className="flex justify-between items-center">
                <span>{type.sender}
                  <FontAwesomeIcon icon={faChevronDown} className="arrow-icon" />
                </span>
                <span className="ml-2 bg-blue-700 px-2 py-1 rounded-full">{renderStars(type.score)}</span>
              </div>
            }
            className="relative"
          >
            <p className="mt-2 italic">
              {type.text}
            </p>
          </Collapsible>
        </div>
      </div>
    );
  })}

  {/* Divider */}
  <div className="border-t border-white my-4"></div>

  {/* Suggested Answer */}
  {suggested?.map((audio, index) => {
    return (
      <div key={index + audio.sender} className="flex flex-col mb-4">
        {/* Sender */}
        <div className="max-w-md mx-flex">
          <Collapsible trigger={
              <div className="flex justify-between items-center">
                <span>{audio.sender}
                  <FontAwesomeIcon icon={faChevronDown} className="arrow-icon" />
                </span>
              </div>
            } >
            {/* Message */}
            <audio src={audio.blobUrl} className="appearance-none" controls />
            {/* Text Message */}
            <div className="mt-4 italic">
              <p>{audio.text}</p>
            </div>
          </Collapsible>
        </div>
        <Next handleNext={resetConversation} text={audio.next} className="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded-full mt-4" />
      </div>
    );
  })}
</div>
)}

          
          {isLoading && (
            <div className="text-center font-light italic mt-10 animate-pulse">
              Gimme a few seconds...
            </div>
          )}

        </div>

        {/* Recorder */}
        
        <div className="fixed bottom-0 w-full py-6 border-t text-center bg-gradient-to-r from-sky-500 to-green-500">
          <div>   
            <MessageBox
                message={message}
                setMessage={setMessage}
                handleStop={handleStop}
                onStatusChange={handleStatusChange}
                whenEnter={whenEnter}
                isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Convo;