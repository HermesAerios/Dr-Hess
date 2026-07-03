export interface DiagnosticSubmissionPayload {
    primaryDiagnosticId: string;
    differentialDiagnosticIds: string[];
    immediateOrdersIds: string[];
}

export interface ScoreBreakdown {
    diagnosticAccuracy: number; // /40
    differentialClarity: number; // /20
    therapeuticSafety: number; // /40
    globalScore: number; // /100
    criticalErrorsCount: number;
    feedbackMarkdown: string;
}

export class DiagnosticEngine {

    public evaluatePlayerSubmission(
        submission: DiagnosticSubmissionPayload, 
        correctPathologyId: string, 
        criticalMistakesTriggered: string[]
    ): ScoreBreakdown {
        let diagScore = 0;
        let diffScore = 0;
        let safetyScore = 40; // On commence au maximum et on applique des malus
        
        let feedback = `### 📊 Débriefing Médical & Validation EDN\n\n`;

        // 1. Évaluation du Diagnostic Principal
        if (submission.primaryDiagnosticId === correctPathologyId) {
            diagScore = 40;
            feedback += `✅ **Diagnostic Principal Correct** (+40 pts) : Vous avez correctement identifié la pathologie cible.\n\n`;
        } else {
            diagScore = 0;
            feedback += `❌ **Erreur Diagnostique Majeure** (0/40 pts) : Vous avez confondu la pathologie avec *${submission.primaryDiagnosticId}*.\n\n`;
        }

        // 2. Évaluation des Diagnostics Différentiels (Pertinence)
        const activeMistakesCount = criticalMistakesTriggered.length;
        safetyScore -= (activeMistakesCount * 15); // Malus iatrogénie ou retard de prise en charge
        
        if (safetyScore < 0) safetyScore = 0;

        if (activeMistakesCount > 0) {
            feedback += `⚠️ **Fautes de Sécurité/Iatrogénie détectées :**\n`;
            criticalMistakesTriggered.forEach(m => {
                feedback += `- *${m}*\n`;
            });
            feedback += `\n`;
        } else {
            feedback += `🛡️ **Sécurité du Patient Garantie** : Aucun ordre dangereux ou iatrogène n'a été signé.\n\n`;
        }

        const global = diagScore + diffScore + safetyScore;

        return {
            diagnosticAccuracy: diagScore,
            differentialClarity: diffScore,
            therapeuticSafety: safetyScore,
            globalScore: global,
            criticalErrorsCount: activeMistakesCount,
            feedbackMarkdown: feedback
        };
    }
}