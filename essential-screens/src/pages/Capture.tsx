import { useNavigate } from "react-router-dom";
import { Camera, Image as ImageIcon, Upload, Mic, Send, StopCircle, Volume2, Sparkles } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { chat, voiceChat, getChats } from "../lib/api";
import Header from "../components/Header";

const Capture = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);

  // User & Session
  const userId = localStorage.getItem("user_id") || "demo_user";

  const addNotification = (title: string, message: string, type: 'success' | 'system' = 'success') => {
    const saved = localStorage.getItem(`notifications_${userId}`);
    const notifications = saved ? JSON.parse(saved) : [];
    const newNotif = {
      id: Date.now(),
      title,
      message,
      time: "Just now",
      unread: true,
      type
    };
    const updated = [newNotif, ...notifications].slice(0, 10);
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
    window.dispatchEvent(new Event("notificationsUpdated"));
  };

  // Chat & Voice States
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleCapture = () => {
    const dummyCapture = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80";
    navigate("/review", { state: { image: dummyCapture } });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCapturedImage(imageUrl);
      setCapturedFile(file);
      setIsCameraActive(false);
      addNotification("Image Uploaded", "Image successfully prepared for analysis.", "success");
    }
  };

  const handleAnalyzeUpload = () => {
    if (capturedImage) {
      addNotification("Analysis Started", "We're identifying your meal now...", "system");
      navigate("/review", { state: { image: capturedImage, file: capturedFile } });
    }
  };

  // AI Chat Logic
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getChats(userId);
        if (data && Array.isArray(data.history)) {
          setChatMessages(data.history.map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          })));
        }
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
      }
    };
    fetchHistory();
  }, [userId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isThinking) return;

    const userMsg = inputText.trim();
    setInputText("");
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsThinking(true);

    try {
      const response = await chat(userId, userMsg);
      setChatMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
    } catch (err) {
      console.error("Chat error:", err);
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsThinking(false);
    }
  };

  // Voice Assistant Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], "voice_query.wav", { type: 'audio/wav' });

        setIsThinking(true);
        setChatMessages(prev => [...prev, { role: 'user', content: "🎤 [Voice Message]" }]);

        try {
          const response = await voiceChat(userId, audioFile);
          setChatMessages(prev => [
            ...prev.filter(m => m.content !== "🎤 [Voice Message]"),
            { role: 'user', content: `🎤 ${response.transcription}` },
            { role: 'assistant', content: response.response }
          ]);
        } catch (err) {
          console.error("Voice chat error:", err);
          setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't process your voice message." }]);
        } finally {
          setIsThinking(false);
        }

        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Camera is not supported on this environment.");
      return;
    }

    try {
      setCapturedImage(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera.");
    }
  };

  React.useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const retakeImage = () => {
    setCapturedImage(null);
    setIsCameraActive(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 px-6 py-4 flex flex-col overflow-y-auto custom-scrollbar">
        <div className="animate-slide-up mb-6" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-3xl font-bold text-foreground mb-2">Log your meal</h1>
          <p className="text-muted-foreground">Instantly analyze your food nutrition using our AI engine.</p>
        </div>

        <div className="flex-1 min-h-[400px] relative rounded-3xl overflow-hidden glass-card border-none shadow-2xl animate-slide-up group" style={{ animationDelay: '0.3s' }}>
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            {!isCameraActive && !capturedImage && (
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600&q=80')] bg-cover bg-center opacity-40 transition-opacity duration-700" />
            )}
            {isCameraActive && (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            )}
            {capturedImage && (
              <img src={capturedImage} alt="Captured" className="w-full h-full object-contain bg-black/50 backdrop-blur-sm" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10 pointer-events-none">
            {!isCameraActive && !capturedImage && (
              <div className="text-center mb-8 animate-fade-in pointer-events-auto">
                <h2 className="text-4xl font-bold text-white mb-4">Scan Your Meal</h2>
                <div className="flex gap-4 justify-center">
                  <button onClick={startCamera} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full font-semibold shadow-xl glow-primary transition-all hover:scale-105 active:scale-95">
                    <Camera size={24} /> Start Camera
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-full font-semibold border border-white/20 transition-all hover:scale-105 active:scale-95">
                    <ImageIcon size={24} /> Browse File
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                </div>
              </div>
            )}
            {isCameraActive && (
              <button onClick={handleCapture} className="pointer-events-auto absolute bottom-12 w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200">
                <div className="w-16 h-16 rounded-full bg-white"></div>
              </button>
            )}
            {capturedImage && (
              <div className="pointer-events-auto flex gap-4 mt-auto mb-8 animate-fade-in">
                <button onClick={retakeImage} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-full font-semibold border border-white/20 transition-all hover:scale-105">
                  Change Image
                </button>
                <button onClick={handleAnalyzeUpload} className="flex items-center gap-2 gradient-primary text-primary-foreground px-8 py-3 rounded-full font-semibold shadow-xl glow-primary transition-all hover:scale-105">
                  <Upload size={20} /> Analyze Photo
                </button>
              </div>
            )}
          </div>
          <div className="absolute inset-8 border-2 border-white/20 rounded-2xl pointer-events-none opacity-50">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white/60 -mt-0.5 -ml-0.5 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white/60 -mt-0.5 -mr-0.5 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white/60 -mb-0.5 -ml-0.5 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white/60 -mb-0.5 -mr-0.5 rounded-br-lg"></div>
          </div>
        </div>

        <div className="mt-8 animate-slide-up mb-8" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <Sparkles size={16} className="text-accent" />
            </div>
            <h3 className="text-xl font-bold text-foreground">AI Nutrichat</h3>
            <span className="bg-accent/10 border border-accent/20 text-accent text-[10px] px-2 py-0.5 rounded-full font-bold">BETA VOICE</span>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden border-border/50 flex flex-col h-[400px] shadow-lg">
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-2">
                  <Volume2 size={48} className="text-muted-foreground mb-2" />
                  <p className="text-foreground font-medium">How can I help you today?</p>
                  <p className="text-xs text-muted-foreground max-w-[200px]">Ask me about nutrition, recipes, or dietary advice.</p>
                </div>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-secondary/80 text-foreground border border-border/50 rounded-tl-none'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {isThinking && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-secondary/80 text-foreground border border-border/50 rounded-2xl rounded-tl-none px-4 py-2 text-sm flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    AI is thinking...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-secondary/20 border-t border-border/50 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <button onClick={isRecording ? stopRecording : startRecording} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-destructive text-white animate-pulse' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}>
                  {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
                </button>
                <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={isRecording ? "Listening..." : "Type your query here..."} className="flex-1 bg-background/50 border border-border/50 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all" />
                <button onClick={handleSendMessage} disabled={!inputText.trim() || isThinking} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-all shadow-glow">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Capture;
