import { describe, test, expect, beforeEach } from 'vitest';
import { DiagnosticEngine, DiagnosticSubmissionPayload } from '../core/engine/DiagnosticEngine';

describe('🎯 Validation Suite : EDN Grading Framework', () => {
    let diagnosticEngine: DiagnosticEngine;

    beforeEach(() => {
        diagnosticEngine = new DiagnosticEngine();
    });

    test('Should award a maximum score of 40 for perfect primary diagnosis identity and penalty-free safety matrix', () => {
        const cleanSubmission: DiagnosticSubmissionPayload = {
            primaryDiagnosticId: 'EDN_228_SCA',
            differentialDiagnosticIds: [],
            immediateOrdersIds: []
        };

        const score = diagnosticEngine.evaluatePlayerSubmission(cleanSubmission, 'EDN_228_SCA', []);
        
        expect(score.diagnosticAccuracy).toBe(40);
        expect(score.therapeuticSafety).toBe(40);
        expect(score.globalScore).toBe(80); // 40 + 0 + 40 (sans l'extension différentielle implémentée)
        expect(score.criticalErrorsCount).toBe(0);
    });

    test('Should drop diagnostic accuracy to 0 if primary pathology is mismatched', () => {
        const wrongSubmission: DiagnosticSubmissionPayload = {
            primaryDiagnosticId: 'EDN_352_PERITONITIS',
            differentialDiagnosticIds: [],
            immediateOrdersIds: []
        };

        const score = diagnosticEngine.evaluatePlayerSubmission(wrongSubmission, 'EDN_228_SCA', []);
        
        expect(score.diagnosticAccuracy).toBe(0);
        expect(score.globalScore).toBe(40); // Conserve ses points de sécurité s'il n'a fait aucune faute de traitement
    });

    test('Should heavily penalize global scoring matrix proportionally to critical clinical failures triggered', () => {
        const submission: DiagnosticSubmissionPayload = {
            primaryDiagnosticId: 'EDN_228_SCA',
            differentialDiagnosticIds: [],
            immediateOrdersIds: []
        };

        const criticalMistakes = [
            "Omission majeure : Défibrillateur non préparé sur rythme instable",
            "Iatrogénie fatale : Administration d'AINS sur Insuffisance rénale sévère"
        ];

        const score = diagnosticEngine.evaluatePlayerSubmission(submission, 'EDN_228_SCA', criticalMistakes);
        
        expect(score.diagnosticAccuracy).toBe(40);
        expect(score.therapeuticSafety).toBe(10); // 40 - (2 * 15) = 10 pts restants
        expect(score.globalScore).toBe(50); // Pénalisation drastique du classement
        expect(score.criticalErrorsCount).toBe(2);
    });
});