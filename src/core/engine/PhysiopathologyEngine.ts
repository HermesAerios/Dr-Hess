import { Patient, Vitals } from '../../domain/models/Patient';
import { Prescription } from '../../domain/models/Prescription';

export class PhysiopathologyEngine {
    private readonly tickRateMs: number;

    constructor(tickRateMs: number = 60000) { // 1 minute in-game
        this.tickRateMs = tickRateMs;
    }

    /**
     * Calcule l'état du patient pour le tick suivant.
     * Intègre l'évolution naturelle de la pathologie et l'effet des traitements.
     */
    public processTick(patient: Patient, activePrescriptions: Prescription[]): Patient {
        let newVitals = { ...patient.vitals };
        let newState = { ...patient.state };

        // 1. Progression de la pathologie sous-jacente
        newVitals = this.applyDiseaseProgression(patient.pathologyId, newVitals, patient.timeInSystem);

        // 2. Application de la pharmacocinétique / pharmacodynamie
        newVitals = this.applyTreatments(newVitals, activePrescriptions, patient);

        // 3. Calcul des variables dépendantes (ex: DFG via Cockcroft-Gault)
        newState.creatinineClearance = this.calculateCockcroftGault(
            patient.age, 
            patient.weight, 
            newVitals.creatinine, 
            patient.sex
        );

        // 4. Vérification des seuils critiques (Arrêt cardiorespiratoire, choc)
        this.checkCriticalThresholds(newVitals, patient.id);

        return {
            ...patient,
            vitals: newVitals,
            state: newState,
            timeInSystem: patient.timeInSystem + 1
        };
    }

    private applyDiseaseProgression(pathologyId: string, vitals: Vitals, time: number): Vitals {
        // Logique de détérioration selon l'item EDN
        // Ex: Item 334 - Sepsis
        if (pathologyId === 'EDN_334_SEPSIS') {
            vitals.systolicBP -= (time * 0.1); // Baisse progressive de la TA
            vitals.heartRate += (time * 0.5);  // Tachycardie compensatoire
            vitals.temperature += 0.05;
        }
        return vitals;
    }

    private applyTreatments(vitals: Vitals, prescriptions: Prescription[], patient: Patient): Vitals {
        for (const rx of prescriptions) {
            // Modélisation précise des catécholamines
            if (rx.molecule === 'Noradrenaline' && rx.isActive) {
                vitals.systolicBP += (rx.dosageMgPerHour * 2.5); // Réponse vasopressive
                vitals.heartRate += (rx.dosageMgPerHour * 1.2);
            }
            // Modélisation iatrogénique (ex: néphrotoxicité)
            if (rx.molecule === 'Gentamicine' && patient.state.creatinineClearance < 30) {
                vitals.creatinine *= 1.1; // Accumulation toxique
            }
        }
        return MathUtils.clampVitals(vitals);
    }

    private calculateCockcroftGault(age: number, weight: number, creatinine: number, sex: 'M'|'F'): number {
        // Formule: ClCr = ((140 - âge) * Poids) / (0.814 * Créatinine)
        // Multiplier par 0.85 pour les femmes
        let clcr = ((140 - age) * weight) / (0.814 * creatinine);
        if (sex === 'F') {
            clcr = clcr * 0.85;
        }
        return clcr;
    }

    private checkCriticalThresholds(vitals: Vitals, patientId: string): void {
        if (vitals.systolicBP < 60 || vitals.oxygenSaturation < 70) {
            EventManager.emit('PATIENT_CODE_BLUE', { patientId });
        }
    }
}

class MathUtils {
    static clampVitals(vitals: Vitals): Vitals {
        return {
            ...vitals,
            systolicBP: Math.max(0, Math.min(300, vitals.systolicBP)),
            heartRate: Math.max(0, Math.min(300, vitals.heartRate)),
            oxygenSaturation: Math.max(0, Math.min(100, vitals.oxygenSaturation))
        };
    }
}