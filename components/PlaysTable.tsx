import React from 'react';
import type { Play } from '../types';
import { determineGameMode, calculateRowTotal } from '../utils/helpers';

interface PlaysTableProps {
  plays: Play[];
  updatePlay: (id: number, field: keyof Play, value: string | number | null) => void;
  deletePlay: (id: number) => void;
  selectedTracks: string[];
  selectedPlayIds: number[];
  onSelectionChange: (ids: number[]) => void;
}

const PlaysTable: React.FC<PlaysTableProps> = ({ plays, updatePlay, deletePlay, selectedTracks, selectedPlayIds, onSelectionChange }) => {

    const handleInputChange = (id: number, field: keyof Play, value: string) => {
        if (field === 'betNumber') {
            updatePlay(id, field, value);
        } else {
            const numValue = value === '' ? null : parseFloat(value);
            if (numValue === null || (!isNaN(numValue) && numValue >= 0)) {
                 updatePlay(id, field, numValue);
            }
        }
    };

    const handleBetNumberBlur = (id: number, betNumber: string) => {
        const gameMode = determineGameMode(betNumber, selectedTracks);
        updatePlay(id, 'gameMode', gameMode);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            onSelectionChange(plays.map(p => p.id));
        } else {
            onSelectionChange([]);
        }
    };

    const handleSelectRow = (id: number) => {
        const newSelection = selectedPlayIds.includes(id)
            ? selectedPlayIds.filter(playId => playId !== id)
            : [...selectedPlayIds, id];
        onSelectionChange(newSelection);
    };

    const areAllPlaysValid = (play: Play): boolean => {
        const hasWager = (play.straightAmount ?? 0) > 0 || (play.boxAmount ?? 0) > 0 || (play.comboAmount ?? 0) > 0;
        return play.betNumber.trim() !== '' && play.gameMode !== '-' && hasWager;
    };

    return (
    <div className="bg-light-card dark:bg-dark-card p-4 rounded-xl shadow-lg animate-fade-in">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-light-surface dark:bg-dark-surface">
                    <tr>
                        <th scope="col" className="px-3 py-3 rounded-l-lg w-10">
                            <input 
                                type="checkbox"
                                className="w-4 h-4 rounded text-neon-cyan bg-gray-300 border-gray-400 focus:ring-neon-cyan focus:ring-2"
                                checked={plays.length > 0 && selectedPlayIds.length === plays.length}
                                onChange={handleSelectAll}
                                aria-label="Select all plays"
                            />
                        </th>
                        <th scope="col" className="px-3 py-3">#</th>
                        <th scope="col" className="px-3 py-3">Bet Number</th>
                        <th scope="col" className="px-3 py-3">Mode</th>
                        <th scope="col" className="px-3 py-3">Straight</th>
                        <th scope="col" className="px-3 py-3">Box</th>
                        <th scope="col" className="px-3 py-3">Combo</th>
                        <th scope="col" className="px-3 py-3">Total</th>
                        <th scope="col" className="px-3 py-3 rounded-r-lg"></th>
                    </tr>
                </thead>
                <tbody>
                    {plays.length === 0 ? (
                        <tr>
                            <td colSpan={9} className="text-center py-10 text-gray-500">
                                No plays added yet. Use the buttons above to start.
                            </td>
                        </tr>
                    ) : (
                        plays.map((play, index) => {
                            const rowTotal = calculateRowTotal(play.betNumber, play.gameMode, play.straightAmount, play.boxAmount, play.comboAmount);
                            const isInvalid = !areAllPlaysValid(play);
                            const isSelected = selectedPlayIds.includes(play.id);
                            
                            return (
                                <tr key={play.id} className={`border-b dark:border-gray-700 transition-colors ${isSelected ? 'bg-neon-cyan/10' : 'hover:bg-light-surface/50 dark:hover:bg-dark-surface/50'} ${isInvalid ? 'bg-red-500/10' : ''}`}>
                                    <td className="px-3 py-2">
                                        <input 
                                            type="checkbox"
                                            className="w-4 h-4 rounded text-neon-cyan bg-gray-300 border-gray-400 focus:ring-neon-cyan focus:ring-2"
                                            checked={isSelected}
                                            onChange={() => handleSelectRow(play.id)}
                                            aria-label={`Select play ${index + 1}`}
                                        />
                                    </td>
                                    <td className="px-3 py-2 font-bold">{index + 1}</td>
                                    <td className="px-3 py-2">
                                        <input 
                                            type="text" 
                                            value={play.betNumber}
                                            onChange={(e) => handleInputChange(play.id, 'betNumber', e.target.value)}
                                            onBlur={() => handleBetNumberBlur(play.id, play.betNumber)}
                                            className="w-24 bg-transparent p-1 rounded focus:outline-none focus:ring-1 focus:ring-neon-cyan font-mono"
                                            placeholder="e.g. 123"
                                        />
                                    </td>
                                    <td className="px-3 py-2 text-xs font-semibold">{play.gameMode}</td>
                                    {['straightAmount', 'boxAmount', 'comboAmount'].map(field => (
                                        <td key={field} className="px-3 py-2">
                                            <input 
                                                type="number"
                                                value={play[field as keyof Play] ?? ''}
                                                onChange={(e) => handleInputChange(play.id, field as keyof Play, e.target.value)}
                                                className="w-20 bg-transparent p-1 rounded focus:outline-none focus:ring-1 focus:ring-neon-cyan font-mono"
                                                placeholder="$0.00"
                                                step="0.5"
                                                min="0"
                                            />
                                        </td>
                                    ))}
                                    <td className="px-3 py-2 font-bold font-mono">${rowTotal.toFixed(2)}</td>
                                    <td className="px-3 py-2">
                                        <button onClick={() => deletePlay(play.id)} className="text-red-500 hover:text-red-400 p-1 rounded-full">
                                            <svg data-lucide="trash-2" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default PlaysTable;