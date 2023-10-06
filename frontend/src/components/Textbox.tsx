import React, { useState, useRef } from 'react';
import axios from "axios";

const Textbox: React.FC = () => {
    const [message, setMessage] = useState<string>('');
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const mediaRecorderRef = useRef<any>(null);

    function createBlobURL(data: any) {
      const blob = new Blob([data], { type: "audio/mpeg" });
      const url = window.URL.createObjectURL(blob);
      return url;
    }

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        const audioChunks: any[] = [];

        mediaRecorderRef.current.ondataavailable = (event: any) => {
            audioChunks.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
            const audioBlob = new Blob(audioChunks);
            // Send the audioBlob to your backend for transcription
            const transcribedText = await sendAudioToBackend(audioBlob);
            setMessage(transcribedText);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const sendAudioToBackend = async (audioBlob: Blob): Promise<string> => {
        const formData = new FormData();
        formData.append('audio', audioBlob);

        const { data:text } = await axios.post<string>("http://localhost:8000/get-user-audio", formData, {
          headers: {
            "Content-Type": "audio/mpeg",
          },
        });

        
        return text; // adjust this based on your backend response structure
    };

    const handleSend = () => {
        console.log("Sending message:", message);
        // You can send the message to your backend or perform any other operations here
        setMessage('');
    };

    return (
        <div className="flex items-center p-2 border rounded-md">
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-grow p-2 outline-none"
            />
            <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                className={`ml-2 p-2 rounded-full h-10 w-10 ${isRecording ? 'bg-red-500' : 'bg-gray-500'}`}
            >
                🎤
            </button>
            <button onClick={handleSend} className="bg-blue-500 text-white p-2 ml-2 rounded-full h-10 w-10">
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
            </button>
        </div>
    );
};

export default Textbox;

