export interface ReferenceRange {
    name: string;
    unit: string;
    minM: number;
    maxM: number;
    minF: number;
    maxF: number;
    criticalMin?: number;
    criticalMax?: number;
}

export const LAB_RANGES: Record<string, ReferenceRange> = {
    'SODIUM': { name: 'Sodium (Na+)', unit: 'mmol/L', minM: 135, maxM: 145, minF: 135, maxF: 145, criticalMin: 120, criticalMax: 160 },
    'POTASSIUM': { name: 'Potassium (K+)', unit: 'mmol/L', minM: 3.5, maxM: 5.0, minF: 3.5, maxF: 5.0, criticalMin: 2.5, criticalMax: 6.5 },
    'CHLORURE': { name: 'Chlorure (Cl-)', unit: 'mmol/L', minM: 98, maxM: 107, minF: 98, maxF: 107 },
    'CREATININE': { name: 'Créatinine', unit: 'µmol/L', minM: 80, maxM: 115, minF: 60, maxF: 95 },
    'HEMOGLOBIN': { name: 'Hémoglobine', unit: 'g/dL', minM: 13.0, maxM: 17.0, minF: 12.0, maxF: 16.0, criticalMin: 7.0 },
    'LEUKOCYTES': { name: 'Leucocytes', unit: 'G/L', minM: 4.0, maxM: 10.0, minF: 4.0, maxF: 10.0, criticalMin: 1.0, criticalMax: 50.0 },
    'PLATELETS': { name: 'Plaquettes', unit: 'G/L', minM: 150, maxM: 400, minF: 150, maxF: 400, criticalMin: 50 },
    'TROPONIN_HS': { name: 'Troponine us', unit: 'ng/L', minM: 0, maxM: 14, minF: 0, maxF: 14, criticalMax: 50 },
    'CRP': { name: 'Protéine C-Réactive', unit: 'mg/L', minM: 0, maxM: 5, minF: 0, maxF: 5 },
    'LACTATES': { name: 'Lactates', unit: 'mmol/L', minM: 0.5, maxM: 2.0, minF: 0.5, maxF: 2.0, criticalMax: 4.0 },
    'PH': { name: 'pH artériel', unit: '', minM: 7.35, maxM: 7.45, minF: 7.35, maxF: 7.45, criticalMin: 7.20, criticalMax: 7.60 },
    'PAO2': { name: 'PaO2', unit: 'mmHg', minM: 80, maxM: 100, minF: 80, maxF: 100, criticalMin: 60 },
    'PACO2': { name: 'PaCO2', unit: 'mmHg', minM: 35, maxM: 45, minF: 35, maxF: 45 }
};

export type LabPanelType = 'IONO_SANG' | 'NFS' | 'BILAN_HEPATIQUE' | 'GAZ_DU_SANG' | 'TROPONINE' | 'BILAN_INFLAMMATOIRE';