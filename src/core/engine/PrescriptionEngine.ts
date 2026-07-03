import { Patient } from '../../domain/models/Patient';
import { Prescription } from '../../domain/models/Prescription';
import { PHARMACOLOGY_BASE, MoleculeDefinition } from '../../domain/medical_knowledge/PharmacologyBase';

export interface ClinicalAlert {
    type: 'ERROR' | 'WARNING';
    message: string;
    timestamp: number;
}

export class PrescriptionEngine {

    /**
     * Calcule la pharmacocinétique et met à jour les concentrations plasmatiques des molécules actives.
     * Déclenche les alertes iatrogènes immédiates si nécessaire.
     */
    public updatePharmacokinetics(patient: Patient, prescriptions: Prescription[], elapsedMinutes: number): { updatedPrescriptions: Prescription[], alerts: ClinicalAlert[] } {
        const alerts: ClinicalAlert[] = [];
        const updatedPrescriptions: Prescription[] = [];

        // 1. Détection des interactions croisées immédiates (ex: la triade de la mort rénale AINS + IEC + Diurétique)
        this.checkCrossInteractions(prescriptions, alerts, elapsedMinutes);

        for (const rx of prescriptions) {
            if (!rx.isActive) {
                updatedPrescriptions.push(rx);
                continue;
            }

            const definition = PHARMACOLOGY_BASE[rx.molecule];
            if (!definition) continue;

            // Vérification des contre-indications par rapport au terrain du patient
            this.checkContraindications(definition, patient, alerts, elapsedMinutes);

            // Calcul du taux d'élimination basé sur les défaillances d'organes du patient
            let eliminationFactor = 1.0;
            if (definition.clearanceType === 'RENAL') {
                // Si la clairance est à 30 mL/min au lieu de 100, l'élimination est ralentie
                eliminationFactor = Math.max(0.2, patient.state.creatinineClearance / 100);
            }

            const adjustedHalfLife = definition.halfLifeMinutes / eliminationFactor;
            const decayConstant = Math.log(2) / adjustedHalfLife;

            let newConcentration = rx.currentPlasmaConcentration;

            // Simulation d'apport selon le mode d'administration
            if (definition.standardRoute === 'PSE') {
                // Apport continu par perfusion : C_t = (R / Cl) * (1 - e^(-k*t))
                const rate = rx.dosageMgPerHour / 60; // mg par minute
                newConcentration = (rate / decayConstant) * (1 - Math.exp(-decayConstant * elapsedMinutes));
            } else {
                // Bolus IV ou PerOs (modélisation simplifiée sans absorption gastrique pour l'étape core)
                if (rx.justAdministered) {
                    newConcentration += rx.dosageMgPerDose;
                    rx.justAdministered = false;
                }
                // Décroissance exponentielle naturelle : C_t = C_0 * e^(-k*t)
                newConcentration = newConcentration * Math.exp(-decayConstant * elapsedMinutes);
            }

            // Détection de surdosage toxique
            if (newConcentration > definition.toxicThresholdPlasmatic) {
                alerts.push({
                    type: 'ERROR',
                    message: `Toxicité systémique aiguë détectée : Surdosage majeur en ${definition.name}. Concentration sérique critique.`,
                    timestamp: elapsedMinutes
                });
                patient.vitals.creatinine *= 1.2; // Dommage organique induit (Néphrotoxicité directe)
            }

            updatedPrescriptions.push({
                ...rx,
                currentPlasmaConcentration: Number(newConcentration.toFixed(3))
            });
        }

        return { updatedPrescriptions, alerts };
    }

    private checkContraindications(def: MoleculeDefinition, patient: Patient, alerts: ClinicalAlert[], time: number): void {
        for (const ci of def.contraindications) {
            // Vérification des allergies connues stockées dans les antécédents
            if (patient.atcd.includes(ci)) {
                alerts.push({
                    type: 'ERROR',
                    message: `CRITICAL ERROR: Administration de ${def.name} malgré une contre-indication absolue (${ci}). Un choc anaphylactique ou une aggravation majeure est imminent.`,
                    timestamp: time
                });
            }
        }
    }

    private checkCrossInteractions(prescriptions: Prescription[], alerts: ClinicalAlert[], time: number): void {
        const activeMolecules = prescriptions.filter(p => p.isActive).map(p => p.molecule);
        
        if (activeMolecules.includes('IBUPROFENE') && activeMolecules.includes('FUROSEMIDE')) {
            alerts.push({
                type: 'WARNING',
                message: `Iatrogénie : L'association d'AINS (Ibuprofène) et de diurétiques de l'anse (Furosémide) antagonise les effets recherchés et induit une hypoperfusion rénale critique.`,
                timestamp: time
            });
        }
    }
}