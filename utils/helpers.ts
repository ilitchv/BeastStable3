export const determineGameMode = (betNumber: string, selectedTracks: string[], pulitoPositions: number[]): string => {
    if (!betNumber) return "-";
    
    const isUSA = selectedTracks.some(t => ["New York", "Georgia", "New Jersey", "Florida", "Connecticut", "Pensilvania", "Brooklyn", "Front", "Pulito", "Horses"].some(s => t.includes(s)));
    const isSD = selectedTracks.some(t => ["Real", "Gana mas", "Loteka", "Nacional", "Quiniela Pale", "Primera", "Suerte", "Lotería", "Lotedom", "Panama"].some(s => t.includes(s)));
    const isVenezuela = selectedTracks.includes('Venezuela');

    const cleanBetNumber = String(betNumber).replace(/[^0-9-]/g, '');
    const paleRegex = /^\d{2}-\d{2}$/;

    if (paleRegex.test(cleanBetNumber)) {
        return isSD ? "Pale-RD" : "Palé";
    }

    const length = cleanBetNumber.replace(/-/g, '').length;

    if (length === 1 && isUSA) {
        return "Single Action";
    }

    if (length === 2) {
        if (selectedTracks.includes('Pulito') && pulitoPositions.length > 0) {
            return `Pulito-${pulitoPositions.sort((a, b) => a - b).join(',')}`;
        }
        if (isVenezuela) {
            return "Venezuela";
        }
        return isSD ? "RD-Quiniela" : "Pick 2";
    }
    if (length === 3) return "Pick 3";
    if (length === 4) return "Win 4";

    return "-";
};

const calcCombos = (str: string): number => {
    const freq: { [key: string]: number } = {};
    for (let c of str) { freq[c] = (freq[c] || 0) + 1; }
    const factorial = (n: number): number => n <= 1 ? 1 : n * factorial(n - 1);
    let denom = 1;
    for (let k in freq) { denom *= factorial(freq[k]); }
    return factorial(str.length) / denom;
};


export const calculateRowTotal = (betNumber: string, gameMode: string, stVal: number | null, bxVal: number | null, coVal: number | null): number => {
    if (!betNumber || gameMode === "-") return 0;

    const st = stVal ?? 0;
    const bx = bxVal ?? 0;
    const co = coVal ?? 0;

    if (gameMode.startsWith("Pulito-")) {
        const positionsPart = gameMode.split('-')[1] || '';
        const positionCount = positionsPart ? positionsPart.split(',').length : 1;
        return (st + bx) * Math.max(1, positionCount);
    }

    if (["Pale-RD", "Palé", "RD-Quiniela", "Pick 2", "Venezuela", "Single Action"].includes(gameMode)) {
        return st + bx;
    }
    
    if (gameMode === "Win 4" || gameMode === "Pick 3") {
        const combosCount = calcCombos(String(betNumber).replace(/[^0-9]/g, ''));
        return st + bx + (co * combosCount);
    }
    
    return st + bx + co;
};

export const getTodayDateString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};


export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URI prefix, e.g., "data:image/jpeg;base64,"
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
};