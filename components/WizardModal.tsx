
import React, { useState, useEffect } from 'react';
import type { WizardPlay } from '../types';
import { determineGameMode, calculateRowTotal } from '../utils/helpers';

interface WizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlays: (plays: WizardPlay[]) => void;
  selectedTracks: string[];
}

const WizardModal: React.FC<WizardModalProps> = ({ isOpen, onClose, onAddPlays, selectedTracks }) => {
    const [plays, setPlays] = useState<WizardPlay[]>([]);
    const [betNumber, setBetNumber] = useState('');
    const [straight, setStraight] = useState<number | null>(null);
    const [box, setBox] = useState<number | null>(null);
    const [combo, setCombo] = useState<number | null>(null);

    const [qpMode, setQpMode] = useState('Pick 3');
    const [qpCount, setQpCount] = useState(5);
    
    useEffect(() => {
        if (!isOpen) {
            setPlays([]);
            setBetNumber('');
            setStraight(null);
            setBox(null);
            setCombo(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAddNext = () => {
        if (!betNumber) return;
        const gameMode = determineGameMode(betNumber, selectedTracks);
        if (gameMode === '-') {
            alert(`Invalid bet number format or length for selected tracks.`);
            return;
        }
        setPlays(prev => [...prev, { betNumber, gameMode, straight, box, combo }]);
        setBetNumber('');
    };

    const handleQuickPick = () => {
        const newPlays: WizardPlay[] = [];
        for (let i = 0; i < qpCount; i++) {
            let numStr = '';
            switch(qpMode) {
                case 'Pick 3': numStr = String(Math.floor(Math.random() * 1000)).padStart(3, '0'); break;
                case 'Win 4': numStr = String(Math.floor(Math.random() * 10000)).padStart(4, '0'); break;
                case 'Pulito': numStr = String(Math.floor(Math.random() * 100)).padStart(2, '0'); break;
                case 'Pale-RD': 
                    const n1 = String(Math.floor(Math.random() * 100)).padStart(2, '0');
                    const n2 = String(Math.floor(Math.random() * 100)).padStart(2, '0');
                    numStr = `${n1}-${n2}`;
                    break;
            }
            if(numStr) {
                 newPlays.push({ betNumber: numStr, gameMode: qpMode, straight, box, combo });
            }
        }
        setPlays(prev => [...prev, ...newPlays]);
    };

    const handleRoundDown = () => {
        const match = betNumber.match(/^(\d{2})0-(\d{2})9$/);
        if(!match || match[1] !== match[2]) {
            alert("For Round Down, please enter a range like '120-129' in the Bet Number field.");
            return;
        }
        const base = match[1];
        const newPlays: WizardPlay[] = [];
        for (let i = 0; i <= 9; i++) {
            const numStr = `${base}${i}`;
            newPlays.push({ betNumber: numStr, gameMode: 'Pick 3', straight, box: null, combo: null });
        }
        setPlays(prev => [...prev, ...newPlays]);
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-neon-cyan flex items-center gap-2">
                        <svg data-lucide="magic-wand-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h.01"/><path d="M17.8 6.2 19 5"/><path d="m3 21 9-9"/><path d="M12.2 6.2 11 5"/></svg>
                        Quick Entry Wizard
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <svg data-lucide="x" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
                    {/* Left Column: Input and Actions */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="font-bold">1. Enter Amounts (Optional)</label>
                            <div className="grid grid-cols-3 gap-2">
                                <input type="number" placeholder="Straight" value={straight ?? ''} onChange={e => setStraight(e.target.value === '' ? null : +e.target.value)} className="w-full bg-light-surface dark:bg-dark-surface p-2 rounded-lg border-2 border-transparent focus:border-neon-cyan focus:outline-none"/>
                                <input type="number" placeholder="Box" value={box ?? ''} onChange={e => setBox(e.target.value === '' ? null : +e.target.value)} className="w-full bg-light-surface dark:bg-dark-surface p-2 rounded-lg border-2 border-transparent focus:border-neon-cyan focus:outline-none"/>
                                <input type="number" placeholder="Combo" value={combo ?? ''} onChange={e => setCombo(e.target.value === '' ? null : +e.target.value)} className="w-full bg-light-surface dark:bg-dark-surface p-2 rounded-lg border-2 border-transparent focus:border-neon-cyan focus:outline-none"/>
                            </div>
                        </div>
                        <div className="space-y-2">
                             <label className="font-bold">2. Add Bets</label>
                            <div className="flex gap-2">
                                <input type="text" placeholder="Bet Number (e.g. 123, 12-34)" value={betNumber} onChange={e => setBetNumber(e.target.value)} className="flex-grow bg-light-surface dark:bg-dark-surface p-2 rounded-lg border-2 border-transparent focus:border-neon-cyan focus:outline-none"/>
                                <button onClick={handleAddNext} className="px-4 py-2 rounded-lg bg-neon-cyan text-black font-bold">Add</button>
                            </div>
                        </div>

                         <div className="p-4 bg-light-surface dark:bg-dark-surface rounded-lg space-y-3">
                            <h4 className="font-bold">Quick Generators</h4>
                            <div className="grid grid-cols-2 gap-2 items-end">
                                <select value={qpMode} onChange={e => setQpMode(e.target.value)} className="w-full bg-light-card dark:bg-dark-card p-2 rounded-lg border-2 border-transparent focus:border-neon-cyan focus:outline-none">
                                    <option>Pick 3</option>
                                    <option>Win 4</option>
                                    <option>Pulito</option>
                                    <option>Pale-RD</option>
                                </select>
                                <input type="number" value={qpCount} onChange={e => setQpCount(Math.min(50, Math.max(1, +e.target.value)))} className="w-full bg-light-card dark:bg-dark-card p-2 rounded-lg border-2 border-transparent focus:border-neon-cyan focus:outline-none"/>
                                <button onClick={handleQuickPick} className="col-span-2 px-4 py-2 rounded-lg bg-neon-pink/80 text-white font-bold">Quick Pick</button>
                            </div>
                             <button onClick={handleRoundDown} className="w-full px-4 py-2 rounded-lg bg-neon-pink/80 text-white font-bold">Round Down (e.g. 120-129)</button>
                        </div>
                    </div>

                    {/* Right Column: Play List */}
                    <div className="space-y-2">
                         <label className="font-bold">3. Review Plays ({plays.length})</label>
                         <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-2 max-h-80 overflow-y-auto">
                            {plays.length === 0 ? <p className="text-center text-gray-500 p-8">Plays will appear here...</p> : 
                            <table className="w-full text-sm">
                                <thead><tr className="text-left text-gray-500">
                                    <th className="p-1">Bet</th><th className="p-1">Mode</th><th className="p-1">Total</th><th className="p-1 w-8"></th>
                                </tr></thead>
                                <tbody>
                                {plays.map((p, i) => <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                                    <td className="p-1 font-mono">{p.betNumber}</td>
                                    <td className="p-1 font-mono text-xs">{p.gameMode}</td>
                                    <td className="p-1 font-mono">${calculateRowTotal(p.betNumber, p.gameMode, p.straight, p.box, p.combo).toFixed(2)}</td>
                                    <td className="p-1">
                                        <button onClick={() => setPlays(plays.filter((_, idx) => idx !== i))} className="text-red-500">
                                            <svg data-lucide="x-circle" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                                        </button>
                                    </td>
                                </tr>)}
                                </tbody>
                            </table>}
                         </div>
                    </div>
                </div>
                
                <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                    <button onClick={() => onAddPlays(plays)} disabled={plays.length === 0} className="px-4 py-2 rounded-lg bg-neon-green text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">Add {plays.length} Plays</button>
                </div>
            </div>
        </div>
    );
};

export default WizardModal;
