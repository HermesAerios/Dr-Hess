import { Patient } from '../../domain/models/Patient';
import { Prescription } from '../../domain/models/Prescription';
import { HOUSE_SCENARIOS_REGISTRY, HouseScenario } from '../../domain/medical_knowledge/HouseScenarios';
import { ClinicalAlert } from './PrescriptionEngine';

export class HouseEngine {
    private activeScenario: HouseScenario;
    private triggeredEvols: boolean[] = [];

    constructor(scenarioId: string) {
        this.activeScenario = HOUSE_SCENARIOS_REGISTRY[scenarioId];
        if (!this.activeScenario) {
            throw new Error(`Scénario introuvable : ${scenarioId}`);
        }
        // Initialise le traceur d'évolutions temporelles
        this.triggeredEvols = new Array(this.activeScenario.evolutionTriggers.length).fill(false);
    }

    public getInitialPatient(): Patient {
        return JSON.parse(JSON.stringify(this.activeScenario.initialPatientState));
    }

    /**
     * Intercepte la boucle de temps in-game pour appliquer les règles spécifiques du cas mystère.
     */
    public processGameTick(patient: Patient, activePrescriptions: Prescription[], totalMinutesElapsed: number): { narrativeAlerts: string[], safetyAlerts: ClinicalAlert[] } {
        const narrativeAlerts: string[] = [];
        const safetyAlerts: ClinicalAlert[] = [];
        
        const activeMolecules = activePrescriptions.filter(p => p.isActive).map(p => p.molecule);

        // 1. Vérification des erreurs critiques (Iatrogénie sélective "Dr House")
        for (const molecule of activeMolecules) {
            if (this.activeScenario.criticalMistakesMatrix[molecule]) {
                const errorMessage = this.activeScenario.criticalMistakesMatrix[molecule];
                
                // Si l'erreur n'a pas encore détruit le patient, on applique un malus direct
                safetyAlerts.push({
                    type: 'ERROR',
                    message: errorMessage,
                    timestamp: totalMinutesElapsed
                });

                // Dégradation immédiate des constantes vitaux suite à l'erreur thérapeutique
                patient.vitals.creatinine *= 1.5;
                patient.vitals.systolicBP -= 15;
            }
        }

        // 2. Gestion des triggers temporels physiopathologiques
        this.activeScenario.evolutionTriggers.forEach((trigger, index) => {
            if (!this.triggeredEvols[index] && totalMinutesElapsed >= trigger.timeThresholdMinutes) {
                
                // Si le déclencheur dépend d'actions nocives commises par le joueur
                const hasCommittedHarm = trigger.harmfulActions 
                    ? trigger.harmfulActions.some(m => activeMolecules.includes(m))
                    : true;

                if (hasCommittedHarm) {
                    this.triggeredEvols[index] = true;
                    narrativeAlerts.push(trigger.narrativeUpdate);

                    // Mutation dynamique de l'état du patient
                    patient.vitals = {
                        ...patient.vitals,
                        ...trigger.resultantVitalsModifier
                    };

                    if (patient.vitals.creatinine > 250) {
                        patient.state.creatinineClearance = 15; // Insuffisance rénale aiguë anurique
                    }
                }
            }
        });

        return { narrativeAlerts, safetyAlerts };
    }

    /**
     * Permet d'injecter des indices cliniques hautement spécifiques cachés si le joueur pose la bonne question.
     */
    public handleSpecificInvestigation(searchQuery: string): string | null {
        const query = searchQuery.toUpperCase();
        
        if (this.activeScenario.id === 'CASE_HOUSE_001_WILSON') {
            if (query.includes('OEIL') || query.includes('CORNEE') || query.includes('KAYSER')) {
                return "👁️ EXAMEN À LA LAMPE À FENTE : Présence bilatérale d'un anneau de Kayser-Fleischer (dépôt de cuivre brun-vert pericornéen). Cet indice est pathognomonique.";
            }
            if (query.includes('CERULOPLASMINE') || query.includes('CUIVRE')) {
                return "🧪 RÉSULTAT BIOLOGIQUE CIBLÉ : Effondrement de la céruloplasminémie sérique à 0.05 g/L (Normale > 0.20) et hypercuivrerie urinaire des 24h majeure. Le diagnostic est biologique.";
            }
        }
        return null;
    }
}