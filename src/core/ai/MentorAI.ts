import { Patient } from '../../domain/models/Patient';
import { Prescription } from '../../domain/models/Prescription';
import { NLPService } from '../../infrastructure/llm_adapter/NLPService';

export class MentorAI {
    private nlpService: NLPService;
    private personaConfig = {
        tone: "sarcastic, extremely demanding, brilliant, intolerant of mediocrity",
        rules: "Never give the direct answer. Point out logical flaws. Use medical terminology perfectly. Reference the EDN guidelines if the student fails a critical item."
    };

    constructor(nlpService: NLPService) {
        this.nlpService = nlpService;
    }

    /**
     * Analyse une action du joueur et décide s'il faut intervenir.
     */
    public async evaluateAction(playerAction: string, patient: Patient, expectedActions: string[]): Promise<string | null> {
        const isActionUseless = this.checkIfUseless(playerAction, expectedActions);
        const isActionDangerous = this.checkIfDangerous(playerAction, patient);

        if (isActionDangerous) {
            return await this.generateIntervention(
                `The student just prescribed ${playerAction} which is strictly contraindicated due to ${patient.atcd.join(', ')}.`
            );
        }

        if (isActionUseless) {
            // Ne pas intervenir à chaque fois pour laisser le joueur se tromper (Error based learning)
            if (Math.random() > 0.6) {
                return await this.generateIntervention(
                    `The student ordered ${playerAction} which costs money and time, adding zero value to the diagnostic of ${patient.pathologyId}.`
                );
            }
        }

        return null;
    }

    /**
     * Génère le débriefing de fin de cas.
     */
    public async generateDebriefing(patient: Patient, playerHistory: any[], timeSpent: number): Promise<string> {
        const prompt = `
        You are the brilliant, sarcastic Head of Medicine. The case is over.
        Patient: ${patient.age}yo ${patient.sex}, Diagnosis: ${patient.pathologyId}.
        Student's timeline: ${JSON.stringify(playerHistory)}.
        Time taken: ${timeSpent} minutes.
        
        Produce a highly structured debriefing containing:
        1. A scathing but accurate clinical critique.
        2. Expected clinical reasoning vs Student's reasoning.
        3. EDN Pearls (Perles EDN) related to this pathology.
        4. Wasted exams and cost analysis.
        `;

        return await this.nlpService.generateResponse(prompt, this.personaConfig);
    }

    private checkIfUseless(action: string, expected: string[]): boolean {
        // Algorithme de distance de Levenshtein ou sémantique pour comparer l'action aux guidelines
        return !expected.includes(action);
    }

    private checkIfDangerous(action: string, patient: Patient): boolean {
        // Ex: Prescription d'AINS chez un patient avec insuffisance rénale aiguë
        if (action.includes('Ibuprofene') && patient.state.creatinineClearance < 60) {
            return true;
        }
        return false;
    }

    private async generateIntervention(contextualTrigger: string): Promise<string> {
        const prompt = `Context: ${contextualTrigger}. React in character immediately to the student.`;
        return await this.nlpService.generateResponse(prompt, this.personaConfig);
    }
}