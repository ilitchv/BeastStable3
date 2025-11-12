import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import type { Play } from '../types';
import { calculateRowTotal } from '../utils/helpers';

interface TicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    plays: Play[];
    selectedTracks: string[];
    grandTotal: number;
    selectedDates: string[];
}

const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose, plays, selectedTracks, grandTotal, selectedDates }) => {
    const ticketRef = useRef<HTMLDivElement>(null);
    const qrRef = useRef<HTMLDivElement>(null);
    const [ticketNumber, setTicketNumber] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [ticketImageBlob, setTicketImageBlob] = useState<Blob | null>(null);
    
    useEffect(() => {
        if (isOpen) {
            // Reset state every time the modal opens
            setIsConfirmed(false);
            setTicketNumber('');
            setTicketImageBlob(null);
            if (qrRef.current) {
                qrRef.current.innerHTML = '';
            }
        }
    }, [isOpen]);

    const handleConfirmAndPrint = () => {
        const uniqueId = Math.floor(10000000 + Math.random() * 90000000).toString();
        setTicketNumber(uniqueId);
        setIsConfirmed(true);

        setTimeout(() => {
            if (qrRef.current) {
                qrRef.current.innerHTML = '';
                new (window as any).QRCode(qrRef.current, {
                    text: uniqueId,
                    width: 128,
                    height: 128,
                    correctLevel: (window as any).QRCode.CorrectLevel.M
                });
            }

            setTimeout(async () => {
                if (!ticketRef.current) return;
                try {
                    const canvas = await html2canvas(ticketRef.current, {
                        scale: 3,
                        useCORS: true,
                        backgroundColor: '#ffffff',
                        // Explicitly set width and height to capture the entire scrollable content
                        width: ticketRef.current.scrollWidth,
                        height: ticketRef.current.scrollHeight,
                    });
                    
                    canvas.toBlob((blob) => {
                        if (blob) {
                            setTicketImageBlob(blob); // Save for sharing
                            
                            // Trigger download
                            const link = document.createElement('a');
                            link.download = `ticket_${uniqueId}.png`;
                            link.href = URL.createObjectURL(blob);
                            link.click();
                            URL.revokeObjectURL(link.href);
                        }
                    }, 'image/png');

                } catch (error) {
                    console.error("Failed to process ticket image:", error);
                    alert("Could not create ticket image.");
                }
            }, 500);
        }, 100);
    };
    
    const handleShare = async () => {
        if (!ticketImageBlob) {
            alert("Ticket image not available for sharing.");
            return;
        }
        if (!navigator.share) {
            alert("Web Share API is not supported in your browser.");
            return;
        }

        const file = new File([ticketImageBlob], `ticket_${ticketNumber}.png`, { type: 'image/png' });

        try {
            await navigator.share({
                title: 'Beast Reader Lotto Ticket',
                text: `Check out my lotto ticket #${ticketNumber}`,
                files: [file],
            });
        } catch (error) {
            console.error('Error sharing:', error);
            // Don't alert on abort errors
            if ((error as DOMException).name !== 'AbortError') {
              alert('An error occurred while trying to share the ticket.');
            }
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white text-black rounded-lg shadow-lg w-full max-w-sm max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center bg-gray-100 rounded-t-lg">
                    <h2 className="text-lg font-bold">Ticket Preview</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                        <svg data-lucide="x" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </div>

                <div className="p-4 overflow-y-auto" >
                    <div ref={ticketRef} className="bg-white text-black font-mono text-xs">
                        <div className="text-center mb-3">
                            <h3 className="font-bold text-base">BEAST READER TICKET</h3>
                            <p>Dates: {selectedDates.join(', ')}</p>
                            {isConfirmed && <p>TKN: {ticketNumber}</p>}
                        </div>

                        <div className="mb-2">
                            <h4 className="font-bold border-b border-dashed border-black pb-1 mb-1">Tracks:</h4>
                            <p>{selectedTracks.join(', ')}</p>
                        </div>

                        <div>
                            <h4 className="font-bold border-b border-dashed border-black pb-1 mb-1">Plays:</h4>
                            <table className="w-full text-black">
                                <thead>
                                    <tr className="border-b border-dashed border-black font-semibold text-xs">
                                        <th className="p-1 text-left">Bet</th>
                                        <th className="p-1 text-left">Mode</th>
                                        <th className="p-1 text-right">Str</th>
                                        <th className="p-1 text-right">Box</th>
                                        <th className="p-1 text-right">Com</th>
                                        <th className="p-1 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="text-black">
                                    {plays.map(play => {
                                        const rowTotal = calculateRowTotal(play.betNumber, play.gameMode, play.straightAmount, play.boxAmount, play.comboAmount);
                                        return (
                                            <tr key={play.id} className="font-normal text-xs">
                                                <td className="p-1 text-left">{play.betNumber}</td>
                                                <td className="p-1 text-left">{play.gameMode}</td>
                                                <td className="p-1 text-right">{play.straightAmount?.toFixed(2) ?? '-'}</td>
                                                <td className="p-1 text-right">{play.boxAmount?.toFixed(2) ?? '-'}</td>
                                                <td className="p-1 text-right">{play.comboAmount?.toFixed(2) ?? '-'}</td>
                                                <td className="p-1 text-right font-semibold">${rowTotal.toFixed(2)}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-3 pt-2 border-t-2 border-dashed border-black">
                            <div className="flex justify-between font-bold text-base">
                                <span>GRAND TOTAL:</span>
                                <span>${grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                        
                        {isConfirmed && (
                            <div className="mt-4 text-center">
                                <div ref={qrRef} className="flex justify-center p-2 bg-white"></div>
                                <p className="text-center text-[10px] mt-2">Please check your ticket.</p>
                            </div>
                        )}
                    </div>
                </div>
                 <div className="p-4 mt-auto border-t flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-colors">Edit</button>
                    {isConfirmed && ticketImageBlob && (
                         <button onClick={handleShare} className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center gap-2">
                            <svg data-lucide="share-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
                            Share
                         </button>
                    )}
                    <button onClick={handleConfirmAndPrint} disabled={isConfirmed} className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:bg-gray-400 hover:bg-blue-700 transition-colors">
                        {isConfirmed ? 'Confirmed!' : 'Confirm & Print'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TicketModal;