import React, { useRef, useEffect, useState } from 'react';
import type { Play } from '../types';
import { calculateRowTotal } from '../utils/helpers';

declare var QRCode: any;
declare var html2canvas: any;

interface TicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    plays: Play[];
    selectedTracks: string[];
    selectedDates: string[];
    grandTotal: number;
    isConfirmed: boolean;
    setIsConfirmed: (isConfirmed: boolean) => void;
    ticketNumber: string;
    setTicketNumber: (ticketNumber: string) => void;
    ticketImageBlob: Blob | null;
    setTicketImageBlob: (blob: Blob | null) => void;
}

// A lightweight, valid SVG watermark, converted to Base64. This is much more reliable.
// This pattern is subtle and resembles the requested "doodle" style.
const WATERMARK_BASE64 = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEiPjxwYXRoIG9wYWNpdHk9IjAuMDUiIGQ9Ik0xMCwyMCBDMzAsNDAgNzAsNDAgOTAsMjAgQzExMCwwIDE1MCwwIDE3MCwyMCBDMTkwLDQwIDIzMCw0MCAyNTAsMjAiLz48cGF0aCBvcGFjaXR5PSIwLjA1IiBkPSJNMjAsNTAgQzQwLDcwIDgwLDcwIDEwMCw1MCBDMTIwLDMwIDE2MCwzMCAxODAsNTAiLz48cGF0aCBvcGFjaXR5PSIwLjA1IiBkPSJNNTAsOTAgQzcwLDExMCAxMTAsMTEwIDEzMCw5MCBDMTUwLDcwIDE5MCw3MCAyMTAsOTAiLz48cGF0aCBvcGFjaXR5PSIwLjA1IiBkPSJNMzAsMTMwIEM1MCwxNTAgOTAsMTUwIDExMCwxMzAgQzEzMCwxMTAgMTcwLDExMCAxOTAsMTMwIi8+PC9nPjwvc3ZnPg==";


const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose, plays, selectedTracks, selectedDates, grandTotal, isConfirmed, setIsConfirmed, ticketNumber, setTicketNumber, ticketImageBlob, setTicketImageBlob }) => {
    const ticketContentRef = useRef<HTMLDivElement>(null);
    const qrCodeRef = useRef<HTMLDivElement>(null);

    const generateTicketNumber = () => `T-${Date.now().toString().slice(-8)}`;

    useEffect(() => {
        if (isConfirmed && ticketNumber && qrCodeRef.current) {
            qrCodeRef.current.innerHTML = '';
            new QRCode(qrCodeRef.current, {
                text: `Ticket #${ticketNumber}`,
                width: 128,
                height: 128,
            });
        }
    }, [isConfirmed, ticketNumber]);


    const handleConfirmAndPrint = async () => {
        setIsConfirmed(true);
        const newTicketNumber = generateTicketNumber();
        setTicketNumber(newTicketNumber);

        // Allow state to update and QR to render before capturing
        setTimeout(async () => {
            const ticketElement = ticketContentRef.current;
            if (ticketElement) {
                try {
                    // Generate a high-quality canvas first
                    const canvas = await html2canvas(ticketElement, { 
                        scale: 3, // Higher scale for better quality PNG
                        backgroundColor: '#ffffff' 
                    });

                    // --- Action 1: Trigger automatic download of the high-res PNG ---
                    const link = document.createElement('a');
                    link.download = `ticket-${newTicketNumber}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();

                    // --- Action 2: Generate and store the lightweight JPEG for sharing ---
                    canvas.toBlob((blob) => {
                        if (blob) {
                            setTicketImageBlob(blob);
                        }
                    }, 'image/jpeg', 0.9);

                } catch (error) {
                    console.error("Error generating ticket image:", error);
                }
            }
        }, 200); // 200ms delay
    };

    const handleShare = async () => {
        if (ticketImageBlob && navigator.share) {
            const file = new File([ticketImageBlob], `ticket-${ticketNumber}.jpg`, { type: 'image/jpeg' });
            try {
                await navigator.share({
                    title: `Lotto Ticket ${ticketNumber}`,
                    text: `Here is my ticket for a total of $${grandTotal.toFixed(2)}`,
                    files: [file],
                });
            } catch (error) {
                console.error('Error sharing ticket:', error);
            }
        } else {
            alert('Sharing is not supported on this browser, or the image is not ready.');
        }
    };


    const formatTime = () => {
        return new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-2 sm:p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-lg w-full max-w-sm max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-neon-cyan">{isConfirmed ? 'Ticket Generated' : 'Confirm Ticket'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <svg data-lucide="x" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </div>

                <div className="p-2 overflow-y-auto">
                    <div ref={ticketContentRef} className="bg-white p-4 text-black font-mono text-xs">
                        <div className="text-center space-y-1 mb-3">
                            <p className="font-bold text-sm">BEAST READER</p>
                            <p>{formatTime().replace(',', ', ')}</p>
                            {isConfirmed && <p className="font-bold">TICKET# {ticketNumber}</p>}
                        </div>

                        <div className="space-y-2 mb-2">
                             <p><span className="font-bold">DATES:</span> {selectedDates.join(', ')}</p>
                             <p><span className="font-bold">TRACKS:</span> {selectedTracks.join(', ')}</p>
                        </div>

                        {/* This is the container for the plays table with the watermark */}
                        <div className="relative border-t border-b border-dashed border-gray-400 py-1">
                             {/* The watermark is a pseudo-element on the container */}
                             <div 
                                style={{
                                    backgroundImage: `url('${WATERMARK_BASE64}')`,
                                    backgroundRepeat: 'repeat',
                                    opacity: 0.08,
                                }}
                                className="absolute inset-0 z-0"
                             ></div>
                            <table className="w-full relative z-10" style={{ backgroundColor: 'transparent' }}>
                                <thead>
                                    <tr className="text-left !text-black">
                                        <th className="font-normal !text-black p-0.5 text-xs">#</th>
                                        <th className="font-normal !text-black p-0.5 text-xs">BET</th>
                                        <th className="font-normal !text-black p-0.5 text-xs">MODE</th>
                                        <th className="font-normal !text-black p-0.5 text-xs text-right">STR</th>
                                        <th className="font-normal !text-black p-0.5 text-xs text-right">BOX</th>
                                        <th className="font-normal !text-black p-0.5 text-xs text-right">COM</th>
                                        <th className="font-normal !text-black p-0.5 text-xs text-right">TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plays.map((play, index) => (
                                        <tr key={play.id} className="border-t border-dashed border-gray-300 !text-black">
                                            <td className="p-0.5 !text-black text-xs">{index + 1}</td>
                                            <td className="p-0.5 !text-black text-xs">{play.betNumber}</td>
                                            <td className="p-0.5 !text-black text-xs">{play.gameMode}</td>
                                            <td className="p-0.5 !text-black text-xs text-right">${(play.straightAmount ?? 0).toFixed(2)}</td>
                                            <td className="p-0.5 !text-black text-xs text-right">${(play.boxAmount ?? 0).toFixed(2)}</td>
                                            <td className="p-0.5 !text-black text-xs text-right">${(play.comboAmount ?? 0).toFixed(2)}</td>
                                            <td className="p-0.5 !text-black text-xs text-right font-bold">${calculateRowTotal(play.betNumber, play.gameMode, play.straightAmount, play.boxAmount, play.comboAmount).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="text-center mt-3 space-y-3">
                            <p className="font-bold text-sm">GRAND TOTAL: ${grandTotal.toFixed(2)}</p>
                            
                            {isConfirmed && (
                                <div className="flex justify-center">
                                    <div ref={qrCodeRef}></div>
                                </div>
                            )}

                            <p className="text-[10px]">Please check your ticket, no claims for errors.</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-700 flex justify-center gap-3">
                    {isConfirmed ? (
                        <>
                            <button onClick={onClose} className="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold transition-colors w-1/2 flex items-center justify-center gap-2">
                               <svg data-lucide="check" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                Done
                            </button>
                            <button onClick={handleShare} disabled={!ticketImageBlob} className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold transition-opacity w-1/2 disabled:opacity-50 flex items-center justify-center gap-2">
                               <svg data-lucide="share-2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
                                Share Ticket
                            </button>
                        </>
                    ) : (
                        <>
                           <button onClick={onClose} className="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold transition-colors w-1/2 flex items-center justify-center gap-2">
                                <svg data-lucide="edit-3" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                                Edit
                            </button>
                            <button onClick={handleConfirmAndPrint} className="px-5 py-2.5 rounded-lg bg-neon-green text-black font-bold hover:opacity-90 transition-opacity w-1/2">Confirm & Print</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TicketModal;