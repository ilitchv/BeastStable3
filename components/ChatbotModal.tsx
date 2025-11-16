import React, { useState, useEffect, useRef } from 'react';
import type { OcrResult, ChatMessage as ChatMessageType } from '../types';
import ChatMessage from './ChatMessage';

interface ChatbotModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddPlays: (plays: OcrResult[]) => void;
    interpretTicketImage: (base64Image: string) => Promise<OcrResult[]>;
    interpretNaturalLanguagePlays: (prompt: string) => Promise<OcrResult[]>;
    fileToBase64: (file: File) => Promise<string>;
}

// Check for SpeechRecognition API
// FIX: Cast window to `any` to access non-standard SpeechRecognition APIs and prevent TypeScript errors.
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const hasSpeechRecognition = !!SpeechRecognition;

const ChatbotModal: React.FC<ChatbotModalProps> = ({ isOpen, onClose, onAddPlays, interpretTicketImage, interpretNaturalLanguagePlays, fileToBase64 }) => {
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const recognitionRef = useRef<any>(null);
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setMessages([{
                id: Date.now(),
                user: 'bot',
                text: "Hello! How can I help you add plays today? You can type, speak, or upload an image of a ticket."
            }]);
        } else {
            // Cleanup on close
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsRecording(false);
            setInputValue('');
        }
    }, [isOpen]);

    useEffect(() => {
        // Scroll to bottom of chat
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);
    
    // Setup Speech Recognition
    useEffect(() => {
        if (!hasSpeechRecognition) return;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if(finalTranscript) setInputValue(prev => prev + finalTranscript);
        };
        
        recognition.onend = () => {
            setIsRecording(false);
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, []);

    const handleSendMessage = async (text: string, imageFile?: File) => {
        if ((!text.trim() && !imageFile) || isLoading) return;

        setIsLoading(true);
        setInputValue('');

        const userMessageText = text.trim() || (imageFile ? `Analyzing image: ${imageFile.name}` : '');
        const userMessage: ChatMessageType = { id: Date.now(), user: 'user', text: userMessageText };
        const loadingMessage: ChatMessageType = { id: Date.now() + 1, user: 'bot', isLoading: true };
        
        setMessages(prev => [...prev, userMessage, loadingMessage]);

        try {
            let results: OcrResult[] = [];
            let botText = "Here are the plays I found:";

            if (imageFile) {
                const base64 = await fileToBase64(imageFile);
                results = await interpretTicketImage(base64);
            } else {
                results = await interpretNaturalLanguagePlays(text);
            }

            if (results.length === 0) {
                botText = "Sorry, I couldn't detect any valid plays. Please try rephrasing or use a clearer image.";
            }

            const botResponse: ChatMessageType = { id: Date.now() + 2, user: 'bot', text: botText, ocrResults: results };
            setMessages(prev => [...prev.slice(0, -1), botResponse]);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            const errorResponse: ChatMessageType = { id: Date.now() + 2, user: 'bot', text: errorMessage };
            setMessages(prev => [...prev.slice(0, -1), errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadPlays = (plays: OcrResult[]) => {
        onAddPlays(plays);
        onClose();
    };

    const handleMicClick = () => {
        if (!hasSpeechRecognition) return;
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        } else {
            recognitionRef.current?.start();
            setIsRecording(true);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleSendMessage('', file);
        }
        // Reset file input to allow selecting the same file again
        if(fileInputRef.current) fileInputRef.current.value = '';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-pink flex items-center gap-2">
                       <svg data-lucide="bot" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                        AI Bet Assistant
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                       <svg data-lucide="x" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </div>

                <div ref={chatBodyRef} className="flex-grow p-4 space-y-4 overflow-y-auto flex flex-col">
                    {messages.map(msg => <ChatMessage key={msg.id} message={msg} onLoadPlays={handleLoadPlays} />)}
                </div>
                
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue);}} className="flex items-center gap-2 bg-light-surface dark:bg-dark-surface p-2 rounded-lg">
                        <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 dark:text-gray-400 hover:text-neon-cyan transition-colors" title="Upload Image">
                           <svg data-lucide="paperclip" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.59a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                        </button>
                        <input 
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type or say '5 straight on 123'..."
                            className="flex-grow bg-transparent focus:outline-none"
                            disabled={isLoading}
                        />
                        {hasSpeechRecognition && (
                             <button type="button" onClick={handleMicClick} className={`p-2 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-500 dark:text-gray-400 hover:text-neon-cyan'}`} title="Record Voice">
                                <svg data-lucide="mic" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                            </button>
                        )}
                        <button type="submit" disabled={!inputValue.trim() || isLoading} className="p-2 rounded-full bg-neon-cyan text-black disabled:opacity-50 transition-opacity" title="Send">
                            <svg data-lucide="send" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatbotModal;
