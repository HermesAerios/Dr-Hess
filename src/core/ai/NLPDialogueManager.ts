import { Patient } from '../../domain/models/Patient';
import { NLPService } from '../../infrastructure/llm_adapter/NLPService';

export class NLPDialogueManager {
    private nlpService: NLPService;

    constructor(nlpService: NLPService) {
        this.nlpService = nlpService;
    }

    /**
     * Traite l'interrogatoire du joueur et génère la réponse du patient.
     */
    public async askPatientQuestion(patient: Patient, playerQuestion: string): Promise<string> {
        // Préparation du prompt système conditionné par l'état du patient
        const systemPrompt = `
        Tu es un patient de ${patient.age} ans, de sexe ${patient.sex === 'M' ? 'masculin' : 'féminin'}.
        Profession : ${patient.profession}.
        Tes antécédents médicaux : ${patient.atcd.length > 0 ? patient.atcd.join(', ') : 'Aucun'}.
        
        Symptômes actuels ressentis (ne pas les dire spontanément, seulement si on te pose la question appropriée) :
        ${patient.symptoms.join(', ')}.

        Niveau de douleur actuel : ${this.calculatePainLevel(patient)}/10.
        État de conscience : ${patient.state.consciousnessScore}/15.
        
        Règles strictes :
        1. Réponds de manière naturelle, comme un patient français le ferait. N'utilise pas de jargon médical pointu sauf si c'est ton métier.
        2. Si on te demande quelque chose qui n'est pas dans tes symptômes, réponds par la négative.
        3. Si ton état de conscience est inférieur à 12, tes phrases doivent être confuses, courtes.
        4. Si ton état de conscience est inférieur à 8, tu ne réponds pas (gémissements seulement).
        5. Sois concis. Le joueur est le médecin (interne ou externe).
        `;

        if (patient.state.consciousnessScore < 8) {
            return "*Le patient ne répond pas, il est comateux. Quelques gémissements à la stimulation.*";
        }

        const userContext = `Médecin : "${playerQuestion}"`;
        
        return await this.nlpService.generatePatientResponse(systemPrompt, userContext);
    }

    private calculatePainLevel(patient: Patient): number {
        // Calcul procédural de la douleur basée sur la pathologie
        if (patient.pathologyId.includes('COLIC') || patient.pathologyId.includes('INFARCTUS')) return 9;
        if (patient.pathologyId.includes('PNEUMONIA')) return 5;
        return 2; // Douleur de base ou absence
    }
}