import { ReactMediaRecorder } from "react-media-recorder";
import RecordIcon from "./RecordIcon";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'


type MessageBoxProps = {
    message: string;
    setMessage: (value: string) => void;
    handleStop: any;
    onStatusChange: (status: string) => void;
    whenEnter: () => void;
    isLoading: boolean;

};

export function MessageBox({
    message,
    setMessage,
    handleStop,
    onStatusChange,
    whenEnter,
    isLoading,
}: MessageBoxProps) {
    return (
        <div className="flex items-center bg-white rounded-lg shadow p-2 space-x-2">
            <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-grow p-2 rounded-lg outline-none resize-none"
                rows={1}
            />

            <ReactMediaRecorder
                audio
                onStop={handleStop}
                render={({ status, startRecording, stopRecording }) => {
                    // Call the onStatusChange prop with the new status
                    onStatusChange(status);

                    return (
                        <button
                            onMouseDown={startRecording}
                            onMouseUp={stopRecording}
                            className="bg-blue p-2 rounded-full"
                        >
                            <RecordIcon
                                classText={
                                    status === "recording"
                                        ? "animate-pulse text-red-500"
                                        : "text-sky-500"
                                }
                            />
                        </button>
                    );
                }}
            />

            {(!isLoading && message.trim()) && (
                <button 
                    onClick={whenEnter} 
                    className="bg-blue-500 text-white p-2 rounded-full h-10 w-10"
                >
                    <FontAwesomeIcon icon={faPaperPlane} />
                </button>
            )}
        </div>
    );
}


export default MessageBox;