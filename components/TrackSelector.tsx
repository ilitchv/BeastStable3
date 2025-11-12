import React, { useState, useMemo } from 'react';
import { TRACK_CATEGORIES, CUTOFF_TIMES } from '../constants';
import { getTodayDateString } from '../utils/helpers';

interface TrackSelectorProps {
  selectedTracks: string[];
  onSelectionChange: (selected: string[]) => void;
  selectedDates: string[];
}

const TrackSelector: React.FC<TrackSelectorProps> = ({ selectedTracks, onSelectionChange, selectedDates }) => {
    const [openCategory, setOpenCategory] = useState<string | null>(TRACK_CATEGORIES[0]?.name || null);

    const isTodaySelected = useMemo(() => selectedDates.includes(getTodayDateString()), [selectedDates]);

    const isTrackExpired = (trackId: string): boolean => {
        if (!isTodaySelected) return false;
        
        const cutoff = CUTOFF_TIMES[trackId];
        if (!cutoff) return false;

        const now = new Date();
        const [hours, minutes] = cutoff.split(':').map(Number);
        const cutoffTime = new Date();
        cutoffTime.setHours(hours, minutes, 0, 0);

        return now > cutoffTime;
    };


    const handleTrackToggle = (trackId: string) => {
        const newSelection = selectedTracks.includes(trackId)
            ? selectedTracks.filter(id => id !== trackId)
            : [...selectedTracks, trackId];
        onSelectionChange(newSelection);
    };

    const toggleCategory = (categoryName: string) => {
        setOpenCategory(prev => prev === categoryName ? null : categoryName);
    };

    return (
        <div className="bg-light-card dark:bg-dark-card p-4 rounded-xl shadow-lg animate-fade-in">
            <h2 className="font-bold text-lg mb-3">Select Tracks ({selectedTracks.length})</h2>
            <div className="space-y-2">
                {TRACK_CATEGORIES.map(category => (
                    <div key={category.name} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                        <button 
                            className="w-full flex justify-between items-center p-2 text-left font-semibold"
                            onClick={() => toggleCategory(category.name)}
                        >
                            <span>{category.name}</span>
                            <svg className={`w-5 h-5 transition-transform duration-300 ${openCategory === category.name ? 'rotate-180' : ''}`} data-lucide="chevron-down" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openCategory === category.name ? 'max-h-[500px]' : 'max-h-0'}`}>
                            <div className="p-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
                                {category.tracks.map(track => {
                                    const expired = isTrackExpired(track.id);
                                    return (
                                    <label key={track.id} className={`flex items-center space-x-2 p-1.5 rounded-md ${expired ? 'opacity-50 cursor-not-allowed' : 'hover:bg-light-surface dark:hover:bg-dark-surface cursor-pointer'}`}>
                                        <input
                                            type="checkbox"
                                            checked={selectedTracks.includes(track.id)}
                                            onChange={() => handleTrackToggle(track.id)}
                                            disabled={expired}
                                            className="w-4 h-4 rounded text-neon-cyan bg-gray-300 border-gray-400 focus:ring-neon-cyan focus:ring-2 disabled:cursor-not-allowed"
                                        />
                                        <span className={`text-sm ${expired ? 'line-through' : ''}`}>{track.name}</span>
                                    </label>
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