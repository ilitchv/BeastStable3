import React, { useState, useMemo, useEffect } from 'react';
import { TRACK_CATEGORIES, CUTOFF_TIMES } from '../constants';
import { getTodayDateString } from '../utils/helpers';
import TrackButton from './TrackButton'; // Import the new component

interface TrackSelectorProps {
  selectedTracks: string[];
  onSelectionChange: (selected: string[]) => void;
  selectedDates: string[];
  pulitoPositions: number[];
  onPulitoPositionsChange: (positions: number[]) => void;
}

const formatTime = (totalSeconds: number): string => {
    if (totalSeconds < 0) return "00:00:00";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const TrackSelector: React.FC<TrackSelectorProps> = ({ selectedTracks, onSelectionChange, selectedDates, pulitoPositions, onPulitoPositionsChange }) => {
    const [openCategory, setOpenCategory] = useState<string | null>(TRACK_CATEGORIES[0]?.name || null);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const isTodaySelected = useMemo(() => selectedDates.includes(getTodayDateString()), [selectedDates]);

    const getTrackStatus = (trackId: string) => {
        const cutoff = CUTOFF_TIMES[trackId];
        if (!isTodaySelected || !cutoff) {
            return { isExpired: false, remainingTime: null };
        }
        
        const [hours, minutes] = cutoff.split(':').map(Number);
        const cutoffTime = new Date();
        cutoffTime.setHours(hours, minutes, 0, 0);
        
        const isExpired = now > cutoffTime;
        const remainingSeconds = Math.round((cutoffTime.getTime() - now.getTime()) / 1000);

        return {
            isExpired,
            remainingTime: isExpired ? null : formatTime(remainingSeconds),
        };
    };

    const handleTrackToggle = (trackId: string) => {
        let newSelection = [...selectedTracks];
        let newPulitoPositions = [...pulitoPositions];

        const isCurrentlySelected = newSelection.includes(trackId);

        if (isCurrentlySelected) {
            newSelection = newSelection.filter(id => id !== trackId);
            if (trackId === 'Pulito') newPulitoPositions = [];
        } else {
            newSelection.push(trackId);
            if (trackId === 'Pulito') {
                newPulitoPositions = [1]; // Add default position 1
                const venezuelaIndex = newSelection.indexOf('Venezuela');
                if (venezuelaIndex > -1) newSelection.splice(venezuelaIndex, 1);
            }
            if (trackId === 'Venezuela') {
                const pulitoIndex = newSelection.indexOf('Pulito');
                if (pulitoIndex > -1) {
                    newSelection.splice(pulitoIndex, 1);
                    newPulitoPositions = [];
                }
            }
        }
        onSelectionChange(newSelection);
        onPulitoPositionsChange(newPulitoPositions);
    };

    const handlePulitoPositionToggle = (position: number) => {
        let newPositions = [...pulitoPositions];
        if (newPositions.includes(position)) {
            if (newPositions.length > 1) {
                newPositions = newPositions.filter(p => p !== position);
            }
        } else {
            newPositions.push(position);
        }
        onPulitoPositionsChange(newPositions.sort((a, b) => a - b));
    };

    const toggleCategory = (categoryName: string) => {
        setOpenCategory(prev => prev === categoryName ? null : categoryName);
    };

    const isPulitoDisabled = selectedTracks.includes('Venezuela');
    const isVenezuelaDisabled = selectedTracks.includes('Pulito');

    return (
        <div className="bg-light-card dark:bg-dark-card p-4 rounded-xl shadow-lg animate-fade-in">
            <h2 className="font-bold text-lg mb-3">Select Tracks ({selectedTracks.length})</h2>
            <div className="space-y-2">
                {TRACK_CATEGORIES.map(category => (
                    <div key={category.name} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                        <button 
                            className={`w-full flex justify-between items-center p-2 text-left font-semibold transition-all duration-300 ease-in-out border-l-4 border-transparent hover:border-neon-cyan hover:bg-light-surface dark:hover:bg-dark-surface hover:pl-4 ${openCategory === category.name ? 'border-neon-cyan bg-light-surface dark:bg-dark-surface pl-4' : ''}`}
                            onClick={() => toggleCategory(category.name)}
                        >
                            <span>{category.name}</span>
                            <svg className={`w-5 h-5 transition-transform duration-300 ${openCategory === category.name ? 'rotate-180' : ''}`} data-lucide="chevron-down" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openCategory === category.name ? 'max-h-[1000px]' : 'max-h-0'}`}>
                             <div className="p-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {category.tracks.map(track => {
                                    const { isExpired, remainingTime } = getTrackStatus(track.id);
                                    const isDisabled = (track.id === 'Pulito' && isPulitoDisabled) || (track.id === 'Venezuela' && isVenezuelaDisabled);
                                    return (
                                       <TrackButton
                                            key={track.id}
                                            trackId={track.id}
                                            trackName={track.name}
                                            isSelected={selectedTracks.includes(track.id)}
                                            onClick={() => handleTrackToggle(track.id)}
                                            isExpired={isExpired}
                                            isDisabled={isDisabled}
                                            remainingTime={remainingTime}
                                            pulitoPositions={track.id === 'Pulito' ? pulitoPositions : undefined}
                                            onPulitoPositionClick={track.id === 'Pulito' ? handlePulitoPositionToggle : undefined}
                                       />
                                )})}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrackSelector;