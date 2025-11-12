
export interface Play {
  id: number;
  betNumber: string;
  gameMode: string;
  straightAmount: number | null;
  boxAmount: number | null;
  comboAmount: number | null;
}

export interface WizardPlay {
    betNumber: string;
    gameMode: string;
    straight: number | null;
    box: number | null;
    combo: number | null;
}

export interface Track {
  name: string;
  id: string;
}

export interface TrackCategory {
  name: string;
  tracks: Track[];
}

export interface OcrResult {
  betNumber: string;
  straightAmount: number | null;
  boxAmount: number | null;
  comboAmount: number | null;
}
