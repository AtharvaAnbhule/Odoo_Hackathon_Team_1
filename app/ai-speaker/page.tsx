"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic,
  MicOff,
  MessageCircle,
  X,
  Volume2,
  VolumeX,
  Send,
  MoreVertical,
  Copy,
  RefreshCw,
  Download,
  Search,
  Zap,
  Heart,
  Smile,
  ThumbsUp,
  Settings,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  reactions?: string[];
  suggestions?: string[];
  metadata?: {
    confidence?: number;
    processingTime?: number;
    tokens?: number;
  };
  rating?: "up" | "down";
}

interface VoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
  voice: string;
  language: string;
}

export default function AdvancedChatbot() {
  const COHERE_MODEL = "command";

  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    rate: 0.9,
    pitch: 1,
    volume: 1,
    voice: "default",
    language: "en-US",
  });
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [conversationContext, setConversationContext] = useState("");

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  //@ts-ignore
  const animationRef = useRef<number>();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("speechSynthesis" in window) {
        synthRef.current = window.speechSynthesis;

        const loadVoices = () => {
          const voices = synthRef.current?.getVoices() || [];
          setAvailableVoices(voices);
        };

        loadVoices();
        synthRef.current.onvoiceschanged = loadVoices;
      }

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = voiceSettings.language;

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          setTranscript(finalTranscript || interimTranscript);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          stopAudioVisualization();
          if (transcript.trim()) {
            handleSendMessage(transcript);
            setTranscript("");
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
          stopAudioVisualization();
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      stopAudioVisualization();
    };
  }, [transcript, voiceSettings.language]);

  const startAudioVisualization = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateAudioLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setAudioLevel(average / 255);
          animationRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      updateAudioLevel();
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  }, []);

  const stopAudioVisualization = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setAudioLevel(0);
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript("");
      setIsListening(true);
      startAudioVisualization();
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const startTime = Date.now();
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsProcessing(true);
    setIsTyping(true);

    const typingMessage: Message = {
      id: "typing",
      type: "assistant",
      content: "",
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      const response = await fetch("https://api.cohere.ai/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_COHERE_API_KEY}`,
        },
        body: JSON.stringify({
          model: COHERE_MODEL,
          message: message,
          chat_history: messages.map((msg) => ({
            role: msg.type === "user" ? "USER" : "CHATBOT",
            message: msg.content,
          })),
          temperature: 0.7,
          max_tokens: 300,
          preamble: `You are a helpful AI assistant for a rental equipment company. 
          Be friendly, professional and provide accurate information about our products and services.
          Keep responses concise but informative.`,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      setMessages((prev) => prev.filter((msg) => msg.id !== "typing"));

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "",
        timestamp: new Date(),
        suggestions: generateSuggestions(message),
        metadata: {
          confidence: 0.95,
          processingTime,
          tokens: data.response?.length || 0,
        },
      };

      setMessages((prev) => [...prev, aiMessage]);

      let currentText = "";
      const fullText =
        data.text || "I couldn't process that request. Please try again.";
      const typingSpeed = 30;

      for (let i = 0; i < fullText.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, typingSpeed));
        currentText += fullText[i];
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessage.id ? { ...msg, content: currentText } : msg
          )
        );
      }

      if (synthRef.current && fullText) {
        setTimeout(() => speakText(fullText), 500);
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      setMessages((prev) => prev.filter((msg) => msg.id !== "typing"));

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
        suggestions: ["Try again", "Contact support"],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      setIsTyping(false);
    }
  };

  const generateSuggestions = (userMessage: string): string[] => {
    const lowerMessage = userMessage.toLowerCase();
    const suggestions = new Set<string>();

    if (lowerMessage.includes("equipment") || lowerMessage.includes("rent")) {
      suggestions.add("What equipment do you have available?");
      suggestions.add("What are your rental rates?");
    }
    if (lowerMessage.includes("price") || lowerMessage.includes("cost")) {
      suggestions.add("Can you explain your pricing structure?");
      suggestions.add("Do you offer any discounts?");
    }
    if (lowerMessage.includes("book") || lowerMessage.includes("reserve")) {
      suggestions.add("How do I make a reservation?");
      suggestions.add("What's your cancellation policy?");
    }

    if (suggestions.size === 0) {
      return [
        "Tell me more about your services",
        "What are your business hours?",
        "Do you offer delivery?",
        "What payment methods do you accept?",
      ];
    }

    return Array.from(suggestions);
  };

  const speakText = (text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;

      if (voiceSettings.voice !== "default") {
        const selectedVoice = availableVoices.find(
          (voice) => voice.name === voiceSettings.voice
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputText);
    }
  };

  const addReaction = (messageId: string, reaction: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              reactions: msg.reactions
                ? [...msg.reactions, reaction]
                : [reaction],
            }
          : msg
      )
    );
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const regenerateResponse = (messageId: string) => {
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);
    if (messageIndex > 0) {
      const previousUserMessage = messages[messageIndex - 1];
      if (previousUserMessage.type === "user") {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
        handleSendMessage(previousUserMessage.content);
      }
    }
  };

  const exportConversation = () => {
    const conversation = messages
      .map(
        (msg) =>
          `${msg.type.toUpperCase()}: ${
            msg.content
          } (${msg.timestamp.toLocaleString()})`
      )
      .join("\n\n");

    const blob = new Blob([conversation], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversation-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const filteredMessages = messages.filter((msg) =>
    searchQuery
      ? msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const chatPanelClass = isFullscreen
    ? "fixed inset-0 w-screen h-screen"
    : "fixed bottom-6 right-6 w-[420px] h-[700px] max-h-[90vh]";

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-50 animate-pulse"></div>
            <Button
              onClick={() => setIsOpen(true)}
              className="relative h-16 w-16 rounded-full shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-110 transition-all duration-300"
              size="icon">
              <MessageCircle className="h-8 w-8" />
            </Button>
          </div>
          {messages.length > 0 && (
            <Badge className="absolute -top-2 -left-2 bg-red-500 animate-bounce">
              {messages.length}
            </Badge>
          )}
        </div>
      )}

      {isOpen && (
        <Card
          className={`${chatPanelClass} shadow-2xl z-50 flex flex-col ${
            isDarkMode ? "bg-gray-900/95 border-gray-700" : "bg-white/95"
          } backdrop-blur-xl transition-all duration-300`}>
          {/* Header */}
          <CardHeader className="pb-3 flex-shrink-0 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  {isSpeaking && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div>
                  <h3
                    className={`font-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}>
                    AI Assistant
                  </h3>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}>
                    {isTyping
                      ? "Typing..."
                      : isSpeaking
                      ? "Speaking..."
                      : "Online"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {/* Search */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Search className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Search Conversation</DialogTitle>
                    </DialogHeader>
                    <Input
                      placeholder="Search messages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </DialogContent>
                </Dialog>

                {/* Settings */}
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Voice & Chat Settings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Language</Label>
                        <Select
                          value={voiceSettings.language}
                          onValueChange={(value) =>
                            setVoiceSettings((prev) => ({
                              ...prev,
                              language: value,
                            }))
                          }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en-US">English (US)</SelectItem>
                            <SelectItem value="en-GB">English (UK)</SelectItem>
                            <SelectItem value="hi-IN">Hindi (India)</SelectItem>
                            <SelectItem value="es-ES">Spanish</SelectItem>
                            <SelectItem value="fr-FR">French</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Voice</Label>
                        <Select
                          value={voiceSettings.voice}
                          onValueChange={(value) =>
                            setVoiceSettings((prev) => ({
                              ...prev,
                              voice: value,
                            }))
                          }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            {availableVoices.map((voice) => (
                              <SelectItem key={voice.name} value={voice.name}>
                                {voice.name} ({voice.lang})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>
                          Speech Rate: {voiceSettings.rate.toFixed(1)}
                        </Label>
                        <Slider
                          value={[voiceSettings.rate]}
                          onValueChange={([value]) =>
                            setVoiceSettings((prev) => ({
                              ...prev,
                              rate: value,
                            }))
                          }
                          min={0.5}
                          max={2}
                          step={0.1}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Pitch: {voiceSettings.pitch.toFixed(1)}</Label>
                        <Slider
                          value={[voiceSettings.pitch]}
                          onValueChange={([value]) =>
                            setVoiceSettings((prev) => ({
                              ...prev,
                              pitch: value,
                            }))
                          }
                          min={0.5}
                          max={2}
                          step={0.1}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>
                          Volume: {Math.round(voiceSettings.volume * 100)}%
                        </Label>
                        <Slider
                          value={[voiceSettings.volume]}
                          onValueChange={([value]) =>
                            setVoiceSettings((prev) => ({
                              ...prev,
                              volume: value,
                            }))
                          }
                          min={0}
                          max={1}
                          step={0.1}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* More Options */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={exportConversation}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Chat
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setMessages([])}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Clear Chat
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="h-8 w-8">
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 flex flex-col min-h-0 p-0 overflow-hidden">
            <ScrollArea className="flex-1 px-4 overflow-y-auto">
              <div className="space-y-4 py-4">
                {filteredMessages.length === 0 && !searchQuery && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageCircle className="h-10 w-10 text-white" />
                    </div>
                    <h3
                      className={`text-lg font-semibold mb-2 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}>
                      Welcome to AI Assistant! 👋
                    </h3>
                    <p
                      className={`text-sm mb-6 ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}>
                      I'm here to help with your rental needs. Try voice or
                      text!
                    </p>
                    <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                      {generateSuggestions("")
                        .slice(0, 4)
                        .map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendMessage(suggestion)}
                            className="text-xs h-8 bg-transparent">
                            {suggestion}
                          </Button>
                        ))}
                    </div>
                  </div>
                )}

                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    } group max-w-full`}>
                    <div
                      className={`max-w-[min(85%,500px)] ${
                        message.type === "user" ? "text-right" : "text-left"
                      }`}>
                      {message.isTyping ? (
                        <div
                          className={`p-4 rounded-2xl ${
                            isDarkMode ? "bg-gray-800" : "bg-gray-100"
                          }`}>
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}></div>
                              <div
                                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}></div>
                            </div>
                            <span
                              className={`text-sm ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                              }`}>
                              AI is thinking...
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div
                            className={`p-4 rounded-2xl ${
                              message.type === "user"
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                : isDarkMode
                                ? "bg-gray-800 text-gray-100"
                                : "bg-gray-100 text-gray-900"
                            } relative`}>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">
                              {message.content}
                            </p>

                            {/* Message Actions */}
                            {message.type === "assistant" && (
                              <div className="absolute -right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex flex-col gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 bg-white shadow-md hover:bg-gray-50"
                                    onClick={() => speakText(message.content)}>
                                    <Volume2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 bg-white shadow-md hover:bg-gray-50"
                                    onClick={() =>
                                      copyMessage(message.content)
                                    }>
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 bg-white shadow-md hover:bg-gray-50"
                                    onClick={() =>
                                      regenerateResponse(message.id)
                                    }>
                                    <RefreshCw className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Metadata */}
                            <div className="flex items-center justify-between mt-2">
                              <span
                                className={`text-xs ${
                                  message.type === "user"
                                    ? "text-blue-100"
                                    : isDarkMode
                                    ? "text-gray-500"
                                    : "text-gray-500"
                                }`}>
                                {formatTime(message.timestamp)}
                                {message.metadata && (
                                  <span className="ml-2">
                                    • {message.metadata.processingTime}ms
                                    {message.metadata.confidence && (
                                      <span className="ml-1">
                                        •{" "}
                                        {Math.round(
                                          message.metadata.confidence * 100
                                        )}
                                        %
                                      </span>
                                    )}
                                  </span>
                                )}
                              </span>

                              {/* Reactions */}
                              {message.type === "assistant" && (
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    onClick={() =>
                                      addReaction(message.id, "👍")
                                    }>
                                    <ThumbsUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    onClick={() =>
                                      addReaction(message.id, "❤️")
                                    }>
                                    <Heart className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    onClick={() =>
                                      addReaction(message.id, "😊")
                                    }>
                                    <Smile className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>

                            {/* Reactions Display */}
                            {message.reactions &&
                              message.reactions.length > 0 && (
                                <div className="flex gap-1 mt-2">
                                  {message.reactions.map((reaction, index) => (
                                    <span key={index} className="text-sm">
                                      {reaction}
                                    </span>
                                  ))}
                                </div>
                              )}
                          </div>

                          {/* Suggestions */}
                          {message.suggestions &&
                            message.suggestions.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {message.suggestions.map(
                                  (suggestion, index) => (
                                    <Button
                                      key={index}
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleSendMessage(suggestion)
                                      }
                                      className="text-xs h-7 bg-transparent hover:bg-blue-50">
                                      {suggestion}
                                    </Button>
                                  )
                                )}
                              </div>
                            )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t bg-background/50 backdrop-blur-lg sticky bottom-0">
              {/* Voice Transcript */}
              {(isListening || transcript) && (
                <div className="mb-3">
                  <div className="relative">
                    <Input
                      value={transcript}
                      readOnly
                      placeholder="Your voice input appears here..."
                      className={`${
                        isDarkMode
                          ? "bg-gray-800 border-gray-700"
                          : "bg-gray-50"
                      } pr-12`}
                    />
                    {isListening && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div
                          className="w-6 h-6 bg-red-500 rounded-full animate-pulse flex items-center justify-center"
                          style={{
                            transform: `scale(${1 + audioLevel * 0.5})`,
                            opacity: 0.7 + audioLevel * 0.3,
                          }}>
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  {isListening && (
                    <div className="flex items-center justify-center mt-2">
                      <Badge
                        variant="secondary"
                        className="bg-red-100 text-red-800">
                        🎤 Listening... {Math.round(audioLevel * 100)}% volume
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Input Controls */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message or use voice..."
                    className={`min-h-[44px] max-h-32 resize-none pr-12 ${
                      isDarkMode ? "bg-gray-800 border-gray-700" : ""
                    }`}
                    disabled={isProcessing}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSendMessage(inputText)}
                    disabled={!inputText.trim() || isProcessing}
                    className="absolute right-2 top-2 h-8 w-8">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {/* Voice Button */}
                {!isListening ? (
                  <Button
                    onClick={startListening}
                    disabled={isProcessing}
                    className="h-11 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                    <Mic className="h-4 w-4 mr-2" />
                    Voice
                  </Button>
                ) : (
                  <Button
                    onClick={stopListening}
                    variant="destructive"
                    className="h-11 px-4">
                    <MicOff className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                )}

                {/* Speaking Control */}
                {isSpeaking && (
                  <Button
                    onClick={stopSpeaking}
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 bg-transparent">
                    <VolumeX className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Smart Suggestions */}
              {messages.length === 0 && !inputText && !isListening && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {generateSuggestions("")
                    .slice(4, 8)
                    .map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendMessage(suggestion)}
                        className="text-xs h-7 bg-transparent">
                        <Zap className="h-3 w-3 mr-1" />
                        {suggestion}
                      </Button>
                    ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
