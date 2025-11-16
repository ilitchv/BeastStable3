import React from 'react';
import type { ChatMessage as ChatMessageType, OcrResult } from '../types';

interface ChatMessageProps {
    message: ChatMessageType;
    onLoadPlays: (plays: OcrResult[]) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onLoadPlays }) => {
    const isUser = message.user === 'user';
    const bubbleClasses = isUser
        ? 'bg-neon-cyan/80 text-black self-end'
        : 'bg-light-surface dark:bg-dark-surface self-start';
    
    const renderContent = () => {
        if (message.isLoading) {
            return (
                <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
            );
        }

        if (message.ocrResults && message.ocrResults.length > 0) {
            return (
                <div className="space-y-3">
                    <p>{message.text || 'I have prepared these plays for you:'}</p>
                    <div className="max-h-48 overflow-y-auto space-y-2 p-2 bg-light-card dark:bg-dark-card rounded-lg">
                        <table className="w-full text-xs">
                           <thead>
                                <tr className="text-left text-gray-500 dark:text-gray-400">
                                    <th className="p-1 font-semibold">Bet</th>
                                    <th className="p-1 font-semibold text-right">Str</th>
                                    <th className="p-1 font-semibold text-right">Box</th>
                                    <th className="p-1 font-semibold text-right">Com</th>
                                </tr>
                           </thead>
                           <tbody>
                            {message.ocrResults.map((play, index) => (
                                <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                                    <td className="p-1 font-mono">{play.betNumber}</td>
                                    <td className="p-1 font-mono text-right">${play.straightAmount?.toFixed(2) ?? '0.00'}</td>
                                    <td className="p-1 font-mono text-right">${play.boxAmount?.toFixed(2) ?? '0.00'}</td>
                                    <td className="p-1 font-mono text-right">${play.comboAmount?.toFixed(2) ?? '0.00'}</td>
                                </tr>
                            ))}
                           </tbody>
                        </table>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button 
                            onClick={() => onLoadPlays(message.ocrResults || [])}
                            className="px-3 py-1 text-sm rounded-md bg-green-500 text-white font-bold hover:bg-green-600 transition-colors"
                        >
                            Load Plays
                        </button>
                    </div>
                </div>
            );
        }
        
        return <p>{message.text}</p>;
    }

    return (
        <div className={`w-fit max-w-lg rounded-xl p-3 shadow-md ${bubbleClasses}`}>
            {renderContent()}
        </div>
    );
};

export default ChatMessage;
