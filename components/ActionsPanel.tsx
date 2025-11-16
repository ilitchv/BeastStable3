import React from 'react';

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    colorClasses: string;
    disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onClick, colorClasses, disabled = false }) => {
    const baseClasses = "flex flex-col items-center justify-center p-2 rounded-lg text-white font-bold transition-all duration-200 ease-in-out shadow-md aspect-square";
    const disabledClasses = "opacity-50 cursor-not-allowed";
    const enabledClasses = "hover:-translate-y-1 hover:shadow-lg";

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${colorClasses} ${disabled ? disabledClasses : enabledClasses}`}
        >
            <div className="w-8 h-8 mb-1">{icon}</div>
            <span className="text-xs text-center">{label}</span>
        </button>
    );
};

interface ActionsPanelProps {
    onAddPlay: () => void;
    onDeleteSelected: () => void;
    onReset: () => void;
    onOpenOcr: () => void;
    onOpenWizard: () => void;
    onOpenChatbot: () => void;
    onGenerateTicket: () => void;
    isTicketGenerationDisabled: boolean;
    onPasteWagers: () => void;
    hasCopiedWagers: boolean;
    hasSelectedPlays: boolean;
}

const ActionsPanel: React.FC<ActionsPanelProps> = (props) => {
    const { 
        onAddPlay, onDeleteSelected, onReset, onOpenOcr, onOpenWizard, onOpenChatbot, onGenerateTicket, isTicketGenerationDisabled,
        onPasteWagers, hasCopiedWagers, hasSelectedPlays
    } = props;

    const actions = [
        {
            label: 'Add Play',
            icon: <svg data-lucide="plus-circle" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>,
            onClick: onAddPlay,
            color: 'bg-blue-500',
        },
        {
            label: 'Quick Wizard',
            icon: <svg data-lucide="magic-wand-2" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h.01"/><path d="M17.8 6.2 19 5"/><path d="m3 21 9-9"/><path d="M12.2 6.2 11 5"/></svg>,
            onClick: onOpenWizard,
            color: 'bg-purple-500',
        },
        {
            label: 'Scan Ticket',
            icon: <svg data-lucide="scan-line" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/></svg>,
            onClick: onOpenOcr,
            color: 'bg-orange-500',
        },
        {
            label: 'AI Assistant',
            icon: <svg data-lucide="message-circle" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>,
            onClick: onOpenChatbot,
            color: 'bg-cyan-500',
        },
         {
            label: 'Paste Wagers',
            icon: <svg data-lucide="clipboard-paste" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H9a2 2 0 0 0-2 2v2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2V4a2 2 0 0 0-2-2Z"/><path d="M9 2v4h6V2"/><path d="M12 12v6"/><path d="M9 15h6"/></svg>,
            onClick: onPasteWagers,
            color: 'bg-gray-500',
            disabled: !hasCopiedWagers || !hasSelectedPlays,
        },
        {
            label: 'Delete Sel.',
            icon: <svg data-lucide="trash-2" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>,
            onClick: onDeleteSelected,
            color: 'bg-red-500',
        },
        {
            label: 'Reset All',
            icon: <svg data-lucide="rotate-cw" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/></svg>,
            onClick: onReset,
            color: 'bg-yellow-500',
        },
        {
            label: 'Generate Ticket',
            icon: <svg data-lucide="ticket" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3a3 3 0 0 1 0-6V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>,
            onClick: onGenerateTicket,
            color: 'bg-green-500',
            disabled: isTicketGenerationDisabled,
        },
    ];

    return (
        <div className="bg-light-card dark:bg-dark-card p-3 rounded-xl shadow-lg animate-fade-in">
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {actions.map(action => (
                    <ActionButton
                        key={action.label}
                        icon={action.icon}
                        label={action.label}
                        onClick={action.onClick}
                        colorClasses={action.color}
                        disabled={action.disabled}
                    />
                ))}
            </div>
        </div>
    );
};

export default ActionsPanel;