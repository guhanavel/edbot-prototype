import { ReactMediaRecorder } from "react-media-recorder";
import RecordIcon from "./RecordIcon";



type Props = {
    handleStop: any;
    onStatusChange: (status: string) => void;
    
  };

  function RecordMessage({ handleStop, onStatusChange }: Props) {
    return (
        <ReactMediaRecorder
            audio
            onStop={handleStop}
            render={({ status, startRecording, stopRecording }) => {
                // Call the onStatusChange prop with the new status
                onStatusChange(status);

                return (
                    <div className="mt-1">
                        
                        <button
                            onMouseDown={startRecording} 
                            onMouseUp={stopRecording}
                            className="bg-white p-4 rounded-full"
                        >
                            <RecordIcon
                                classText={
                                    status == "recording"
                                        ? "animate-pulse text-red-500"
                                        : "text-sky-500"
                                }
                            />
                        </button>
                    </div>
                );
            }}
        />
    );
}

export default RecordMessage;