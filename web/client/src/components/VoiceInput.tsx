import { useState, useRef } from "react";
import { Mic, Square, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, disabled = false }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsTranscribing(true);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      // In a real implementation, you would send this to your backend
      // For now, we'll simulate transcription
      const formData = new FormData();
      formData.append("audio", audioBlob);

      // Simulate transcription delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock transcription result
      const mockTranscript =
        "This is a simulated transcription. In production, this would use a real speech-to-text service.";
      onTranscript(mockTranscript);
      toast.success("Transcription complete");
    } catch (error) {
      console.error("Transcription error:", error);
      toast.error("Transcription failed");
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="flex gap-2">
      {!isRecording ? (
        <Button
          size="icon"
          variant="ghost"
          onClick={startRecording}
          disabled={disabled || isTranscribing}
          className="text-slate-400 hover:text-white hover:bg-slate-800"
          title="Start voice input"
        >
          {isTranscribing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </Button>
      ) : (
        <Button
          size="icon"
          variant="ghost"
          onClick={stopRecording}
          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 animate-pulse"
          title="Stop recording"
        >
          <Square className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}

interface TextToSpeechProps {
  text: string;
  disabled?: boolean;
}

export function TextToSpeech({ text, disabled = false }: TextToSpeechProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = () => {
    if (!text) {
      toast.error("No text to speak");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={speak}
      disabled={disabled || !text}
      className={`${
        isSpeaking
          ? "text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
          : "text-slate-400 hover:text-white hover:bg-slate-800"
      }`}
      title={isSpeaking ? "Stop speaking" : "Read aloud"}
    >
      <Volume2 className="w-5 h-5" />
    </Button>
  );
}
