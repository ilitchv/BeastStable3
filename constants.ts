
import type { TrackCategory } from './types';

export const MAX_PLAYS = 200;

export const TRACK_CATEGORIES: TrackCategory[] = [
  {
    name: 'USA',
    tracks: [
      { name: 'New York Mid Day', id: 'New York Mid Day' },
      { name: 'New York Evening', id: 'New York Evening' },
      { name: 'Georgia Mid Day', id: 'Georgia Mid Day' },
      { name: 'Georgia Evening', id: 'Georgia Evening' },
      { name: 'New Jersey Mid Day', id: 'New Jersey Mid Day' },
      { name: 'New Jersey Evening', id: 'New Jersey Evening' },
      { name: 'Florida Mid Day', id: 'Florida Mid Day' },
      { name: 'Florida Evening', id: 'Florida Evening' },
      { name: 'Connecticut Mid Day', id: 'Connecticut Mid Day' },
      { name: 'Connecticut Evening', id: 'Connecticut Evening' },
      { name: 'Georgia Night', id: 'Georgia Night' },
      { name: 'Pensilvania AM', id: 'Pensilvania AM' },
      { name: 'Pensilvania PM', id: 'Pensilvania PM' },
      { name: 'Pulito', id: 'Pulito' },
      { name: 'Venezuela', id: 'Venezuela' },
      { name: 'Brooklyn Midday', id: 'Brooklyn Midday' },
      { name: 'Brooklyn Evening', id: 'Brooklyn Evening' },
      { name: 'Front Midday', id: 'Front Midday' },
      { name: 'Front Evening', id: 'Front Evening' },
      { name: 'New York Horses', id: 'New York Horses' },
    ],
  },
  {
    name: 'Santo Domingo',
    tracks: [
      { name: 'Real', id: 'Real' },
      { name: 'Gana mas', id: 'Gana mas' },
      { name: 'Loteka', id: 'Loteka' },
      { name: 'Nacional', id: 'Nacional' },
      { name: 'Quiniela Pale', id: 'Quiniela Pale' },
      { name: 'Primera Día', id: 'Primera Día' },
      { name: 'Suerte Día', id: 'Suerte Día' },
      { name: 'Lotería Real', id: 'Lotería Real' },
      { name: 'Suerte Tarde', id: 'Suerte Tarde' },
      { name: 'Lotedom', id: 'Lotedom' },
      { name: 'Primera Noche', id: 'Primera Noche' },
      { name: 'Panama', id: 'Panama' },
    ],
  },
];

export const CUTOFF_TIMES: { [key: string]: string } = {
    "New York Mid Day": "14:20", 
    "New York Evening": "22:00", 
    "Georgia Mid Day": "12:20", 
    "Georgia Evening": "18:40", 
    "New Jersey Mid Day": "12:50", 
    "New Jersey Evening": "22:00", 
    "Florida Mid Day": "13:20", 
    "Florida Evening": "21:30", 
    "Connecticut Mid Day": "13:30", 
    "Connecticut Evening": "22:00", 
    "Georgia Night": "22:00", 
    "Pensilvania AM": "12:45", 
    "Pensilvania PM": "18:15",
    "Pulito": "23:59", // No real cutoff
    "Venezuela": "23:59", // No real cutoff
    "Brooklyn Midday": "14:20", 
    "Brooklyn Evening": "22:00", 
    "Front Midday": "14:20", 
    "Front Evening": "22:00", 
    "New York Horses": "16:00",
    "Real": "11:45", 
    "Gana mas": "13:25", 
    "Loteka": "18:30", 
    "Nacional": "19:30", 
    "Quiniela Pale": "19:30", 
    "Primera Día": "10:50", 
    "Suerte Día": "11:20", 
    "Lotería Real": "11:50", 
    "Suerte Tarde": "16:50", 
    "Lotedom": "16:50", 
    "Primera Noche": "18:50", 
    "Panama": "16:00"
};
