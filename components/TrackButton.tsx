import React from 'react';

interface TrackButtonProps {
    trackId: string;
    trackName: string;
    isSelected: boolean;
    onClick: () => void;
    isExpired: boolean;
    remainingTime: string | null;
    isDisabled?: boolean;
    pulitoPositions?: number[];
    onPulitoPositionClick?: (position: number) => void;
}

const getTrackColorClasses = (trackId: string): string => {
    // New Jersey -> Orange
    if (trackId.includes('New Jersey')) {
        return trackId.includes('Mid Day') ? 'bg-gradient-to-b from-orange-400 to-orange-500' : 'bg-gradient-to-b from-orange-600 to-orange-700';
    }
    // New York -> Blue
    if (trackId.includes('New York') && !trackId.includes('Horses')) {
        return trackId.includes('Mid Day') ? 'bg-gradient-to-b from-blue-400 to-blue-500' : 'bg-gradient-to-b from-blue-700 to-blue-800';
    }
    // New York Horses -> Lime
    if (trackId.includes('Horses')) {
        return 'bg-gradient-to-b from-lime-400 to-lime-500';
    }
    // Georgia -> Green
    if (trackId.includes('Georgia')) {
        if (trackId.includes('Mid Day')) return 'bg-gradient-to-b from-green-400 to-green-500';
        if (trackId.includes('Evening')) return 'bg-gradient-to-b from-green-600 to-green-700';
        return 'bg-gradient-to-b from-green-800 to-green-900'; // Night
    }
    // Florida -> Cyan
    if (trackId.includes('Florida')) {
        return trackId.includes('Mid Day') ? 'bg-gradient-to-b from-cyan-400 to-cyan-500' : 'bg-gradient-to-b from-cyan-600 to-cyan-700';
    }
    // Connecticut -> Emerald
    if (trackId.includes('Connecticut')) {
        return trackId.includes('Mid Day') ? 'bg-gradient-to-b from-emerald-400 to-emerald-500' : 'bg-gradient-to-b from-emerald-600 to-emerald-700';
    }
    // Pennsylvania -> Pink
    if (trackId.includes('Pensilvania')) {
        return trackId.includes('AM') ? 'bg-gradient-to-b from-pink-400 to-pink-500' : 'bg-gradient-to-b from-pink-600 to-pink-700';
    }
    // Brooklyn / Front -> Sky
    if (trackId.includes('Brooklyn') || trackId.includes('Front')) {
        return trackId.includes('Midday') ? 'bg-gradient-to-b from-sky-400 to-sky-500' : 'bg-gradient-to-b from-sky-600 to-sky-700';
    }
     // Pulito -> Indigo
    if (trackId.includes('Pulito')) {
        return 'bg-gradient-to-b from-indigo-400 to-indigo-600';
    }
    // Santo Domingo individual colors
    if (trackId.includes('Real')) return 'bg-gradient-to-b from-red-500 to-red-700';
    if (trackId.includes('Gana mas')) return 'bg-gradient-to-b from-amber-400 to-amber-600';
    if (trackId.includes('Loteka')) return 'bg-gradient-to-b from-lime-500 to-lime-700';
    if (trackId.includes('Nacional') || trackId.includes('Quiniela Pale')) return 'bg-gradient-to-b from-emerald-500 to-emerald-700';
    if (trackId.includes('Primera')) return trackId.includes('Día') ? 'bg-gradient-to-b from-cyan-400 to-cyan-600' : 'bg-gradient-to-b from-cyan-600 to-cyan-800';
    if (trackId.includes('Suerte')) return trackId.includes('Día') ? 'bg-gradient-to-b from-sky-400 to-sky-600' : 'bg-gradient-to-b from-sky-600 to-sky-800';
    if (trackId.includes('Lotería Real')) return 'bg-gradient-to-b from-indigo-500 to-indigo-700';
    if (trackId.includes('Lotedom')) return 'bg-gradient-to-b from-violet-500 to-violet-700';
    if (trackId.includes('Panama')) return 'bg-gradient-to-b from-fuchsia-500 to-fuchsia-700';

    // Default / Venezuela -> Gray
    return 'bg-gradient-to-b from-gray-500 to-gray-600';
};

const getTrackIcon = (trackId: string) => {
    const iconClasses = "w-full h-full";
    if (trackId.toLowerCase().includes('day') || trackId.toLowerCase().includes('am') || trackId.toLowerCase().includes('mas')) {
        return <svg data-lucide="sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>;
    }
    if (trackId.toLowerCase().includes('evening') || trackId.toLowerCase().includes('night') || trackId.toLowerCase().includes('noche') || trackId.toLowerCase().includes('pm')) {
        return <svg data-lucide="moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>;
    }
    if (trackId.includes('Horses')) {
        return <svg data-lucide="award" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>;
    }
     if (trackId.includes('Pulito')) {
        return <svg data-lucide="list-ordered" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>;
    }
    return <svg data-lucide="ticket" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClasses}><path d="M2 9a3 3 0 0 1 0 6v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3a3 3 0 0 1 0-6V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>;
};

const TrackButton: React.FC<TrackButtonProps> = ({ trackId, trackName, isSelected, onClick, isExpired, remainingTime, isDisabled, pulitoPositions = [], onPulitoPositionClick }) => {
    const colorClasses = getTrackColorClasses(trackId);
    const isInteractive = trackId === 'Pulito';

    const baseClasses = "relative flex flex-col items-center justify-center p-2 rounded-lg text-white font-bold transition-all duration-200 ease-in-out shadow-md aspect-square overflow-hidden";
    const selectedClasses = "ring-4 ring-offset-2 ring-offset-light-card dark:ring-offset-dark-card ring-neon-cyan";
    const enabledClasses = "hover:-translate-y-1 hover:shadow-lg";
    const disabledClasses = "opacity-60 cursor-not-allowed";
    
    const finalDisabled = isExpired || isDisabled;

    const renderStandardButton = () => (
        <button
            onClick={onClick}
            disabled={finalDisabled}
            className={`${baseClasses} ${colorClasses} ${finalDisabled ? disabledClasses : enabledClasses} ${isSelected ? selectedClasses : ''}`}
            aria-label={`Select track: ${trackName}${isExpired ? ' (Closed)' : ''}${isDisabled ? ' (Disabled)' : ''}`}
            aria-pressed={isSelected}
        >
            <div className="w-8 h-8 mb-1 flex-shrink-0" aria-hidden="true">{getTrackIcon(trackId)}</div>
            <span className="text-xs text-center leading-tight">{trackName}</span>
            
            {remainingTime !== null && !isExpired && (
                <span className="absolute bottom-0.5 text-[10px] font-mono bg-black/20 px-1 rounded-sm" aria-label={`Time remaining: ${remainingTime}`}>{remainingTime}</span>
            )}
            
            {isSelected && (
                 <div className="absolute top-1 right-1 bg-white/30 backdrop-blur-sm rounded-full p-0.5 z-20" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
            )}
        </button>
    );

    const renderInteractiveButton = () => {
        const positions = pulitoPositions;
        const onPositionClick = onPulitoPositionClick;

        return (
            <div className="relative">
                <button
                    onClick={onClick}
                    disabled={finalDisabled}
                    className={`${baseClasses} ${colorClasses} ${finalDisabled ? disabledClasses : enabledClasses} ${isSelected ? selectedClasses : ''} w-full`}
                    aria-label={`Select track: ${trackName}${isExpired ? ' (Closed)' : ''}${isDisabled ? ' (Disabled)' : ''}`}
                    aria-pressed={isSelected}
                >
                    <div className="w-8 h-8 mb-1 flex-shrink-0">{getTrackIcon(trackId)}</div>
                    <span className="text-xs text-center leading-tight">{trackName}</span>
                </button>
                {isSelected && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex justify-center items-center gap-1 w-[calc(100%+4px)] bg-black/30 rounded-full px-1 py-0.5 backdrop-blur-sm z-10">
                        {[1, 2, 3, 4].map(pos => {
                            const isPositionSelected = positions.includes(pos);
                            return (
                                <button
                                    key={pos}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onPositionClick?.(pos);
                                    }}
                                    className={`w-5 h-5 text-xs rounded-full flex items-center justify-center font-bold transition-colors ${isPositionSelected ? 'bg-neon-cyan text-black' : 'bg-gray-200/50 text-white hover:bg-gray-200/80'}`}
                                    aria-label={`Select position ${pos}`}
                                    aria-pressed={isPositionSelected}
                                >
                                    {pos}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };


    return isInteractive ? renderInteractiveButton() : renderStandardButton();
};

export default TrackButton;