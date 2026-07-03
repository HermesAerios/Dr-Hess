import { Patient } from '../models/Patient';

export interface HouseScenario {
    id: string;
    title: string;
    ednItemReference: number;
    difficulty: 'EXPERT' | 'MYSTERY';
    initialPatientState: Patient;
    goldenStandardDiagnosticCode: string; // Le vrai diagnostic caché
    trapDiagnosticCodes: string[]; // Les fausses pistes évidentes (ex: Hépatite alcoolique)
    criticalMistakesMatrix: Record<string, string>;
    evolutionTriggers: {
        timeThresholdMinutes: number;
        actionRequired?: string;
        harmfulActions?: string[];
        resultantVitalsModifier: Partial<Patient['vitals']>;
        narrativeUpdate: string;
    }[];
}

export const HOUSE_SCENARIOS_REGISTRY: Record<string, HouseScenario> = {
    'CASE_HOUSE_001_WILSON': {
        id: 'CASE_HOUSE_001_WILSON',
        title: 'L\'Énigme de l\'Ictère Flamboyant (Maladie de Wilson Fulminante)',
        ednItemReference: 267,
        difficulty: 'MYSTERY',
        initialPatientState: {
            id: 'house-pat-001',
            name: 'Clara Lombardi',
            age: 24,
            sex: 'F',
            profession: 'Violoniste professionnelle',
            weight: 52,
            atcd: ['Épisodes dépressifs légers traités par millepertuis', 'Dysménorrhée'],
            symptoms: ['Ictère cutanéo-muqueux subit', 'Tremblement des extrémités au repos', 'Dysarthrie récente'],
            pathologyId: 'EDN_267_WILSON_FULMINANT',
            timeInSystem: 0,
            vitals: {
                heartRate: 104,
                systolicBP: 105,
                diastolicBP: 65,
                oxygenSaturation: 97,
                potassium: 3.4, // Hypokaliémie modérée
                creatinine: 145 // Insuffisance rénale fonctionnelle débutante
            },
            state: {
                consciousnessScore: 14, // Légèrement ralentie (Encéphalopathie hépatique Stade I)
                creatinineClearance: 45
            }
        },
        goldenStandardDiagnosticCode: 'WILSON_DISEASE',
        trapDiagnosticCodes: ['HEPATITE_ALCOOLIQUE', 'OVERDOSE_PARACETAMOL', 'DEPRESSION_PSYCHOTIQUE'],
        criticalMistakesMatrix: {
            'IBUPROFENE': 'Fatal : L\'administration d\'AINS sur cette insuffisance hépato-rénale a précipité un syndrome hépato-rénal de type 1.',
            'PARACETAMOL': 'Toxicité critique : L\'administration de Paracétamol sur un foie en cytolyse fulminante a détruit les derniers hépatocytes fonctionnels.',
            'NEUROLEPTIQUES': 'Erreur syndromique : Traiter les tremblements ou l\'agitation comme une crise psychotique avec des neuroleptiques aggrave dramatiquement le syndrome extrapyramidal de Wilson.'
        },
        evolutionTriggers: [
            {
                timeThresholdMinutes: 30,
                harmfulActions: ['IBUPROFENE', 'PARACETAMOL'],
                resultantVitalsModifier: { systolicBP: 85, creatinine: 280, heartRate: 125 },
                narrativeUpdate: "🚨 ALERTE CLINIQUE : Le patient entre en encéphalopathie hépatique majeure (Stade III). Somnolence profonde, astérixis (flapping tremor) bilatéral. La fonction rénale s'effondre."
            },
            {
                timeThresholdMinutes: 60,
                resultantVitalsModifier: { potassium: 6.2, heartRate: 48 }, // Hyperkaliémie par insuffisance rénale terminale
                narrativeUpdate: "🚨 URGENCE VITALE : Bradycardie extrême. L'ECG montre des ondes T amples et pointues. Sans traitement hypokaliémiant immédiat et transfert en réanimation pour transplantation hépatique en urgence, l'arrêt cardiaque est inévitable."
            }
        ]
    }
};