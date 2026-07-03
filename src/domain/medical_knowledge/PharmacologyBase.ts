export interface MoleculeDefinition {
    id: string;
    name: string; // Nom de la molécule (DCI obligatoire pour les EDN)
    class: string;
    halfLifeMinutes: number;
    standardRoute: 'PO' | 'IV' | 'SC' | 'PSE'; // PSE = Pousse-Seringue Électrique
    clearanceType: 'RENAL' | 'HEPATIC';
    toxicThresholdPlasmatic: number;
    baseTherapeuticWindow: { min: number; max: number };
    contraindications: string[]; // Lié au terrain/ATCD du patient
    incompatibilities: string[]; // Molécules incompatibles (synergie toxique)
}

export const PHARMACOLOGY_BASE: Record<string, MoleculeDefinition> = {
    'AMOXICILLINE': {
        id: 'AMOXICILLINE',
        name: 'Amoxicilline',
        class: 'Bêta-lactamines / Pénicillines',
        halfLifeMinutes: 60,
        standardRoute: 'PO',
        clearanceType: 'RENAL',
        toxicThresholdPlasmatic: 100,
        baseTherapeuticWindow: { min: 20, max: 70 },
        contraindications: ['Allergie: Pénicilline', 'Allergie: Bêta-lactamines'],
        incompatibilities: []
    },
    'FUROSEMIDE': {
        id: 'FUROSEMIDE',
        name: 'Furosémide',
        class: 'Diurétiques de l\'anse',
        halfLifeMinutes: 90,
        standardRoute: 'IV',
        clearanceType: 'RENAL',
        toxicThresholdPlasmatic: 50,
        baseTherapeuticWindow: { min: 10, max: 30 },
        contraindications: ['Hypovolémie', 'Hypokaliémie sévère', 'Obstacle sur les voies urinaires'],
        incompatibilities: ['GENTAMICINE'] // Risque majoré d'ototoxicité/néphrotoxicité
    },
    'NORADRENALINE': {
        id: 'NORADRENALINE',
        name: 'Noradrénaline',
        class: 'Catécholamines / Vasopresseurs',
        halfLifeMinutes: 2, // Demi-vie extrêmement courte, requiert un PSE constant
        standardRoute: 'PSE',
        clearanceType: 'HEPATIC',
        toxicThresholdPlasmatic: 10,
        baseTherapeuticWindow: { min: 1, max: 8 },
        contraindications: ['Cardiomyopathie obstructive'],
        incompatibilities: []
    },
    'IBUPROFENE': {
        id: 'IBUPROFENE',
        name: 'Ibuprofène',
        class: 'AINS (Anti-inflammatoires non stéroïdiens)',
        halfLifeMinutes: 120,
        standardRoute: 'PO',
        clearanceType: 'RENAL',
        toxicThresholdPlasmatic: 80,
        baseTherapeuticWindow: { min: 15, max: 50 },
        contraindications: ['Insuffisance rénale chronique', 'Insuffisance cardiaque sévère', 'Ulcère gastroduodénal actif', 'Grossesse 3ème trimestre'],
        incompatibilities: ['FUROSEMIDE'] // Annulation de l'effet diurétique + toxicité rénale démultipliée
    }
};