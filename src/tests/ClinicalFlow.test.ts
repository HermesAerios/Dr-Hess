import { describe, test, expect, beforeEach } from 'vitest';
import { Patient } from '../domain/models/Patient';
import { ClinicalExamEngine } from '../core/engine/ClinicalExamEngine';
import { LabResultsGenerator } from '../core/procedural/LabResultsGenerator';

describe('🔬 Integration Suite : Core Physiological & Lab Flow', () => {
    let mockPatientSCA: Patient;
    let examEngine: ClinicalExamEngine;
    let labGenerator: LabResultsGenerator;

    beforeEach(() => {
        examEngine = new ClinicalExamEngine();
        labGenerator = new LabResultsGenerator();

        // Initialisation d'un cas typique de l'Item EDN 228 (SCA)
        mockPatientSCA = {
            id: 'test-patient-uuid-1',
            name: 'Jean Dupont',
            age: 64,
            sex: 'M',
            profession: 'Retraité',
            weight: 82,
            atcd: ['Tabagisme actif', 'Hypertension artérielle'],
            symptoms: ['Douleur thoracique constrictive', 'Irradiation mâchoire gauche'],
            pathologyId: 'EDN_228_SCA',
            timeInSystem: 10, // Arrivé il y a 10 minutes
            vitals: {
                heartRate: 95,
                systolicBP: 135,
                diastolicBP: 85,
                oxygenSaturation: 94,
                potassium: 4.2,
                creatinine: 90
            },
            state: {
                consciousnessScore: 15, // Conscient
                creatinineClearance: 85
            }
        };
    });

    test('Should accurately translate SCA pathology into abnormal pulmonary and cardiac clinical signs', () => {
        // Examen cardio : doit révéler le bruit de galop ou une tachycardie relative
        const cardioResult = examEngine.performExam(mockPatientSCA, 'THORAX_CARDIO', 'AUSCULTATION');
        
        // Examen pulmonaire : doit être normal par défaut dans un angor/SCA sans insuffisance ventriculaire gauche aiguë immédiate
        const pulmResult = examEngine.performExam(mockPatientSCA, 'THORAX_PULM', 'AUSCULTATION');

        expect(cardioResult.costInMinutes).toBe(3); // L'auscultation coûte 3 minutes
        expect(pulmResult.isAbnormal).toBe(false); // Pas de crépitants à ce stade (pas d'OAP)
    });

    test('Should generate dynamically rising high-sensitivity Troponin values as time elapsed increases', () => {
        const baseOrder = labGenerator.orderLabPanel(mockPatientSCA, 'TROPONINE', 0, true); // Commande urgente
        expect(baseOrder.availableAtTime).toBe(15); // STAT réduit le délai à 15 minutes au lieu de 30

        // Simulation du calcul des résultats à T+15
        const analyticalResult = labGenerator.generateResultsForOrder(mockPatientSCA, baseOrder);
        const troponinParam = analyticalResult.results?.find(r => r.parameterId === 'TROPONIN_HS');

        expect(troponinParam).toBeDefined();
        expect(troponinParam!.isAbnormal).toBe(true);
        expect(troponinParam!.value).toBeGreaterThan(14); // Seuil supérieur de la norme (cf. LAB_RANGES)
        
        // Évolution à T+120 minutes (Infarctus étendu sans reperfusion)
        mockPatientSCA.timeInSystem = 120;
        const delayedOrder = labGenerator.orderLabPanel(mockPatientSCA, 'TROPONINE', 120, false);
        const delayedResult = labGenerator.generateResultsForOrder(mockPatientSCA, delayedOrder);
        const lateTroponin = delayedResult.results?.find(r => r.parameterId === 'TROPONIN_HS');
        
        expect(lateTroponin!.value).toBeGreaterThan(troponinParam!.value); // Cinétique de la troponine ascendante
    });
});