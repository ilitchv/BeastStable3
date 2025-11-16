import React, { useState, useMemo, useEffect } from 'react';
import type { Play, OcrResult, WizardPlay, CopiedWagers, ChatMessage } from './types';
import { MAX_PLAYS } from './constants';
import { getTodayDateString, calculateRowTotal, determineGameMode, fileToBase64 } from './utils/helpers';
import { interpretTicketImage, interpretNaturalLanguagePlays } from './services/geminiService';

// Import components
import Header from './components/Header';
import TrackSelector from './components/TrackSelector';
import DatePicker from './components/DatePicker';
import ActionsPanel from './components/ActionsPanel';
import PlaysTable from './components/PlaysTable';
import TotalDisplay from './components/TotalDisplay';
import OcrModal from './components/OcrModal';
import WizardModal from './components/WizardModal';
import TicketModal from './components/TicketModal';
import ValidationErrorModal from './components/ValidationErrorModal';
import ChatbotModal from './components/ChatbotModal'; // Import the new Chatbot Modal
import { CUTOFF_TIMES } from './constants';

const LOCAL_STORAGE_KEY = 'beastReaderLottoState';

const getDefaultNewYorkTrack = (): string => {
    const now = new Date();
    const cutoffTime = new Date();
    // Cutoff is 14:20 (2:20 PM)
    cutoffTime.setHours(14, 20, 0, 0); 
    return now < cutoffTime ? 'New York Mid Day' : 'New York Evening';
};


const App: React.FC = () => {
    // State management
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [plays, setPlays] = useState<Play[]>([]);
    const [selectedPlayIds, setSelectedPlayIds] = useState<number[]>([]);
    const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
    const [selectedDates, setSelectedDates] = useState<string[]>([getTodayDateString()]);
    const [copiedWagers, setCopiedWagers] = useState<CopiedWagers | null>(null);
    const [pulitoPositions, setPulitoPositions] = useState<number[]>([]);
    
    // Modal states
    const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
    const [isWizardModalOpen, setIsWizardModalOpen] = useState(false);
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [isValidationErrorModalOpen, setIsValidationErrorModalOpen] = useState(false);
    const [isChatbotModalOpen, setIsChatbotModalOpen] = useState(false); // State for the new chatbot modal
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    // Ticket State
    const [isTicketConfirmed, setIsTicketConfirmed] = useState(false);
    const [ticketNumber, setTicketNumber] = useState('');
    const [ticketImageBlob, setTicketImageBlob] = useState<Blob | null>(null);

    // Load state from localStorage on initial render
    useEffect(() => {
        try {
            const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedStateJSON) {
                const savedState = JSON.parse(savedStateJSON);
                setPlays(savedState.plays || []);
                
                if (savedState.selectedTracks && savedState.selectedTracks.length > 0) {
                    setSelectedTracks(savedState.selectedTracks);
                } else {
                    setSelectedTracks([getDefaultNewYorkTrack()]);
                }

                setSelectedDates(savedState.selectedDates && savedState.selectedDates.length > 0 ? savedState.selectedDates : [getTodayDateString()]);
                setCopiedWagers(savedState.copiedWagers || null);
                setPulitoPositions(savedState.pulitoPositions || []);
            } else {
                // If there's no saved state, set the default track.
                setSelectedTracks([getDefaultNewYorkTrack()]);
            }
        } catch (error) {
            console.error("Failed to load state from localStorage", error);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            setSelectedTracks([getDefaultNewYorkTrack()]); // Fallback on error
        }
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        try {
            const stateToSave = {
                plays,
                selectedTracks,
                selectedDates,
                copiedWagers,
                pulitoPositions,
            };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (error) {
            console.error("Failed to save state to localStorage", error);
        }
    }, [plays, selectedTracks, selectedDates, copiedWagers, pulitoPositions]);

    // Theme toggle logic
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };
    
    // Play manipulation handlers
    const addPlay = () => {
        if (plays.length >= MAX_PLAYS) return;
        const newPlay: Play = {
            id: Date.now() + Math.random(), // more unique id
            betNumber: '',
            gameMode: '-',
            straightAmount: null,
            boxAmount: null,
            comboAmount: null
        };
        setPlays(prev => [...prev, newPlay]);
    };

    const updatePlay = (id: number, updatedPlay: Partial<Play>) => {
        setPlays(prev => prev.map(p => {
            if (p.id === id) {
                const newPlay = { ...p, ...updatedPlay };
                if (updatedPlay.betNumber !== undefined) {
                    newPlay.gameMode = determineGameMode(newPlay.betNumber, selectedTracks, pulitoPositions);
                }
                return newPlay;
            }
            return p;
        }));
    };

    const deletePlay = (id: number) => {
        setPlays(prev => prev.filter(p => p.id !== id));
        setSelectedPlayIds(prev => prev.filter(playId => playId !== id));
    };

    const deleteSelectedPlays = () => {
        setPlays(prev => prev.filter(p => !selectedPlayIds.includes(p.id)));
        setSelectedPlayIds([]);
    };
    
    const resetAll = () => {
        // The sandbox environment blocks window.confirm(), so we perform the reset directly.
        // Step 1: Immediately and directly remove the persisted state.
        // This is the atomic operation that prevents race conditions.
        localStorage.removeItem(LOCAL_STORAGE_KEY);

        // Step 2: Update the React state to visually clear the UI.
        // The useEffect hook will then persist this new empty state.
        setPlays([]);
        setSelectedTracks([getDefaultNewYorkTrack()]);
        setSelectedDates([getTodayDateString()]);
        setCopiedWagers(null);
        setSelectedPlayIds([]);
        setPulitoPositions([]);
    };

    const handleCopyWagers = (play: Play) => {
        setCopiedWagers({
            straightAmount: play.straightAmount,
            boxAmount: play.boxAmount,
            comboAmount: play.comboAmount,
        });
    };

    const handlePasteWagers = () => {
        if (!copiedWagers || selectedPlayIds.length === 0) return;

        setPlays(currentPlays =>
            currentPlays.map(p => {
                if (selectedPlayIds.includes(p.id)) {
                    const updatedPlay = { ...p };
                     if (copiedWagers.straightAmount !== null) {
                        updatedPlay.straightAmount = copiedWagers.straightAmount;
                    }
                    if (copiedWagers.boxAmount !== null) {
                        updatedPlay.boxAmount = copiedWagers.boxAmount;
                    }
                    if (copiedWagers.comboAmount !== null) {
                        updatedPlay.comboAmount = copiedWagers.comboAmount;
                    }
                    return updatedPlay;
                }
                return p;
            })
        );
    };
    
    const handleAddPlaysFromWizard = (wizardPlays: WizardPlay[]) => {
        const newPlays: Play[] = wizardPlays.map((p, i) => ({
            id: Date.now() + Math.random() + i,
            betNumber: p.betNumber,
            gameMode: p.gameMode,
            straightAmount: p.straight,
            boxAmount: p.box,
            comboAmount: p.combo,
        }));
        setPlays(prev => [...prev, ...newPlays].slice(0, MAX_PLAYS));
        setIsWizardModalOpen(false);
    };
    
    const handleAddPlaysFromOcr = (ocrPlays: OcrResult[]) => {
        const newPlays: Play[] = ocrPlays.map((p, i) => ({
            id: Date.now() + Math.random() + i,
            betNumber: p.betNumber,
            gameMode: determineGameMode(p.betNumber, selectedTracks, pulitoPositions),
            straightAmount: p.straightAmount,
            boxAmount: p.boxAmount,
            comboAmount: p.comboAmount,
        }));
        setPlays(prev => [...prev, ...newPlays].slice(0, MAX_PLAYS));
        setIsOcrModalOpen(false);
    };

    const handleAddPlaysFromChatbot = (chatbotPlays: OcrResult[]) => {
        const newPlays: Play[] = chatbotPlays.map((p, i) => ({
            id: Date.now() + Math.random() + i,
            betNumber: p.betNumber,
            gameMode: determineGameMode(p.betNumber, selectedTracks, pulitoPositions),
            straightAmount: p.straightAmount,
            boxAmount: p.boxAmount,
            comboAmount: p.comboAmount,
        }));
        setPlays(prev => [...prev, ...newPlays].slice(0, MAX_PLAYS));
        setIsChatbotModalOpen(false); // Close the chatbot modal after adding plays
    };

    // Calculations
    const baseTotal = useMemo(() => {
        return plays.reduce((acc, play) => {
            const rowTotal = calculateRowTotal(play.betNumber, play.gameMode, play.straightAmount, play.boxAmount, play.comboAmount);
            return acc + rowTotal;
        }, 0);
    }, [plays]);

    const trackMultiplier = useMemo(() => {
      const nonSpecialTracks = selectedTracks.filter(t => t !== 'Venezuela' && t !== 'Pulito' && t !== 'New York Horses');
      return Math.max(1, nonSpecialTracks.length);
    }, [selectedTracks]);
    
    const dateMultiplier = useMemo(() => Math.max(1, selectedDates.length), [selectedDates]);
    const grandTotal = useMemo(() => baseTotal * trackMultiplier * dateMultiplier, [baseTotal, trackMultiplier, dateMultiplier]);
    
    // Ticket generation and validation
    const handleGenerateTicket = () => {
        const errors: string[] = [];
        const todayStr = getTodayDateString();
        const now = new Date();

        // CRITICAL VALIDATION: Ensure core selections are made first.
        const standardTracks = selectedTracks.filter(t => t !== 'Venezuela' && t !== 'Pulito' && t !== 'New York Horses');
        const hasSpecialTrack = selectedTracks.some(t => t === 'Venezuela' || t === 'Pulito' || t === 'New York Horses');
        
        if (selectedTracks.length === 0) {
            errors.push('Please select at least one track.');
        } else if (hasSpecialTrack && standardTracks.length === 0) {
            errors.push('When selecting a special track (Pulito, Horses, Venezuela), you must also select at least one other standard track.');
        } else if (standardTracks.length === 0 && !hasSpecialTrack) {
             // This case is essentially selectedTracks.length === 0 if we only have special tracks
             errors.push('Please select at least one valid track.');
        }


        if (plays.length === 0) errors.push('Please add at least one play.');
        if (selectedDates.length === 0) errors.push('Please select at least one date.');

        selectedDates.forEach(dateStr => {
            if (dateStr < todayStr) {
                errors.push(`Date ${dateStr} is in the past.`);
            }

            if (dateStr === todayStr) {
                 selectedTracks.forEach(trackId => {
                    const cutoff = CUTOFF_TIMES[trackId];
                    if (cutoff) {
                        const [hours, minutes] = cutoff.split(':').map(Number);
                        const cutoffTime = new Date();
                        cutoffTime.setHours(hours, minutes, 0, 0);
                        if (now > cutoffTime) {
                            errors.push(`Track "${trackId}" has passed its cutoff time for today.`);
                        }
                    }
                });
            }
        });
        
        plays.forEach((play, index) => {
            if (!play.betNumber.trim()) {
                errors.push(`Play #${index + 1}: Bet number is empty.`);
            } else if (play.gameMode === '-') {
                 errors.push(`Play #${index + 1}: Bet number "${play.betNumber}" is invalid for the selected tracks.`);
            }
            const total = calculateRowTotal(play.betNumber, play.gameMode, play.straightAmount, play.boxAmount, play.comboAmount);
            if (total <= 0) {
                 errors.push(`Play #${index + 1}: Must have an amount greater than $0.`);
            }
        });

        if (errors.length > 0) {
            setValidationErrors(errors);
            setIsValidationErrorModalOpen(true);
        } else {
            setIsTicketConfirmed(false);
            setTicketImageBlob(null);
            setTicketNumber('');
            setIsTicketModalOpen(true);
        }
    };
    
    const isTicketGenerationDisabled = useMemo(() => {
        if (plays.length === 0 || selectedDates.length === 0 || selectedTracks.length === 0) {
            return true;
        }
        const standardTracksCount = selectedTracks.filter(t => t !== 'Venezuela' && t !== 'Pulito' && t !== 'New York Horses').length;
        const hasSpecialTrack = selectedTracks.some(t => t === 'Venezuela' || t === 'Pulito' || t === 'New York Horses');
        
        // Disable if a special track is selected without any standard tracks
        if (hasSpecialTrack && standardTracksCount === 0) {
            return true;
        }
        
        // Disable if no standard tracks are selected at all
        if (standardTracksCount === 0 && !hasSpecialTrack) {
            return true;
        }

        return false;
    }, [plays.length, selectedDates.length, selectedTracks]);

    return (
        <div className="bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-gray-200 min-h-screen p-2 sm:p-4 font-sans transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-4">
                <Header theme={theme} toggleTheme={toggleTheme} />
                
                <main className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left Column */}
                    <div className="lg:col-span-1 space-y-4">
                        <DatePicker selectedDates={selectedDates} onDatesChange={setSelectedDates} />
                        <TrackSelector 
                            selectedTracks={selectedTracks} 
                            onSelectionChange={setSelectedTracks} 
                            selectedDates={selectedDates}
                            pulitoPositions={pulitoPositions}
                            onPulitoPositionsChange={setPulitoPositions}
                        />
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-4">
                        <ActionsPanel 
                            onAddPlay={addPlay}
                            onDeleteSelected={deleteSelectedPlays}
                            onReset={resetAll}
                            onOpenOcr={() => setIsOcrModalOpen(true)}
                            onOpenWizard={() => setIsWizardModalOpen(true)}
                            onOpenChatbot={() => setIsChatbotModalOpen(true)}
                            onGenerateTicket={handleGenerateTicket}
                            isTicketGenerationDisabled={isTicketGenerationDisabled}
                            onPasteWagers={handlePasteWagers}
                            hasCopiedWagers={copiedWagers !== null}
                            hasSelectedPlays={selectedPlayIds.length > 0}
                        />
                        <PlaysTable 
                            plays={plays}
                            updatePlay={updatePlay}
                            deletePlay={deletePlay}
                            selectedPlayIds={selectedPlayIds}
                            setSelectedPlayIds={setSelectedPlayIds}
                            onCopyWagers={handleCopyWagers}
                        />
                        <TotalDisplay 
                            baseTotal={baseTotal}
                            trackMultiplier={trackMultiplier}
                            dateMultiplier={dateMultiplier}
                            grandTotal={grandTotal}
                        />
                    </div>
                </main>

                {/* Modals */}
                <OcrModal 
                    isOpen={isOcrModalOpen}
                    onClose={() => setIsOcrModalOpen(false)}
                    onAddPlays={handleAddPlaysFromOcr}
                    interpretTicketImage={interpretTicketImage}
                    fileToBase64={fileToBase64}
                />
                <WizardModal 
                    isOpen={isWizardModalOpen}
                    onClose={() => setIsWizardModalOpen(false)}
                    onAddPlays={handleAddPlaysFromWizard}
                    selectedTracks={selectedTracks}
                    pulitoPositions={pulitoPositions}
                />
                 <TicketModal 
                    isOpen={isTicketModalOpen}
                    onClose={() => setIsTicketModalOpen(false)}
                    plays={plays.filter(p => calculateRowTotal(p.betNumber, p.gameMode, p.straightAmount, p.boxAmount, p.comboAmount) > 0)}
                    selectedTracks={selectedTracks}
                    selectedDates={selectedDates}
                    grandTotal={grandTotal}
                    isConfirmed={isTicketConfirmed}
                    setIsConfirmed={setIsTicketConfirmed}
                    ticketNumber={ticketNumber}
                    setTicketNumber={setTicketNumber}
                    ticketImageBlob={ticketImageBlob}
                    setTicketImageBlob={setTicketImageBlob}
                />
                <ValidationErrorModal
                    isOpen={isValidationErrorModalOpen}
                    onClose={() => setIsValidationErrorModalOpen(false)}
                    errors={validationErrors}
                />
                <ChatbotModal
                    isOpen={isChatbotModalOpen}
                    onClose={() => setIsChatbotModalOpen(false)}
                    onAddPlays={handleAddPlaysFromChatbot}
                    interpretTicketImage={interpretTicketImage}
                    interpretNaturalLanguagePlays={interpretNaturalLanguagePlays}
                    fileToBase64={fileToBase64}
                />
            </div>
        </div>
    );
};

export default App;