import React, { useState } from 'react';
import { getTodayDateString } from '../utils/helpers';

interface DatePickerProps {
    selectedDates: string[];
    onDatesChange: (dates: string[]) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedDates, onDatesChange }) => {
    const [currentDate, setCurrentDate] = useState(getTodayDateString());
    
    const handleAddDate = () => {
        if (currentDate && !selectedDates.includes(currentDate)) {
            const newDates = [...selectedDates, currentDate].sort();
            onDatesChange(newDates);
        }
    };

    const handleRemoveDate = (dateToRemove: string) => {
        onDatesChange(selectedDates.filter(date => date !== dateToRemove));
    };

    return (
        <div className="bg-light-card dark:bg-dark-card p-4 rounded-xl shadow-lg animate-fade-in space-y-3">
            <div>
                <label htmlFor="ticket-date" className="font-bold text-lg mb-2 block">Bet Dates</label>
                <div className="flex gap-2">
                    <input
                        id="ticket-date"
                        type="date"
                        value={currentDate}
                        min={getTodayDateString()}
                        onChange={(e) => setCurrentDate(e.target.value)}
                        className="flex-grow w-full bg-light-surface dark:bg-dark-surface p-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-neon-cyan focus:outline-none focus:ring-0"
                    />
                    <button
                        onClick={handleAddDate}
                        className="px-4 py-2 rounded-lg bg-neon-cyan text-black font-bold hover:opacity-90 transition-opacity"
                    >
                        Add
                    </button>
                </div>
            </div>
            
            {selectedDates.length > 0 && (
                <div>
                    <h3 className="font-semibold text-sm mb-2">Selected Dates ({selectedDates.length}):</h3>
                    <div className="flex flex-wrap gap-2">
                        {selectedDates.map(date => (
                            <div key={date} className="flex items-center gap-2 bg-light-surface dark:bg-dark-surface rounded-full px-3 py-1 text-sm">
                                <span>{date}</span>
                                <button onClick={() => handleRemoveDate(date)} className="text-red-500 hover:text-red-400">
                                    <svg data-lucide="x-circle" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePicker;