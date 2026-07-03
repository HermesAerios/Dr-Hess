import { describe, test, expect, beforeEach } from 'vitest';
import { Patient } from '../domain/models/Patient';
import { Prescription } from '../domain/models/Prescription';
import { PrescriptionEngine } from '../core/engine/PrescriptionEngine';

describe('💊 Validation Suite : Pharmacokinetics & Iatrogenesis', () => {
    let prescriptionEngine: PrescriptionEngine;
    let mockPatientShock: Patient;

    beforeEach(() => {
        prescriptionEngine = new PrescriptionEngine();
        mockPatientShock = {
            id: 'test-patient-uuid-2',
            name: 'Marcelle Martin',
            age: 78,
            sex: 'F',
            profession: 'Sans emploi',
            weight: 55,
            atcd: ['Allergie: Pénicilline', 'Insuffisance rénale chronique'],
            symptoms: ['Fièvre', 'Marbrures', 'Confusion'],
            pathologyId: 'EDN_334_SEPSIS',
            timeInSystem: 0,
            vitals: {
                heartRate: 120,
                systolicBP: 80, // HypoTA
                diastolicBP: 45,
                oxygenSaturation: 89,
                potassium: 3.9,
                creatinine: 180 // Élévation majeure
            },
            state: {
                consciousnessScore: 11, // Obnubilation
                creatinineClearance: 25 // Insuffisance rénale sévère (Stade 4)
            }
        };
    });

    test('Should immediately trigger an absolute contraindication error if player prescribes Penicillin variant to allergic patient', () => {
        const prescriptions: Prescription[] = [{
            id: 'rx-1',
            molecule: 'AMOXICILLINE',
            dosageMgPerDose: 1000,
            dosageMgPerHour: 0,
            route: 'PO',
            isActive: true,
            justAdministered: true,
            currentPlasmaConcentration: 0
        }];

        const runtime = prescriptionEngine.updatePharmacokinetics(mockPatientShock, prescriptions, 1);
        
        const criticalAlert = runtime.alerts.find(a => a.type === 'ERROR');
        expect(criticalAlert).toBeDefined();
        expect(criticalAlert!.message).toContain('CONTRE-INDICATION ABSOLUE');
    });

    test('Should reduce drug clearance and prolong half-life if patient presents with severe renal impairment', () => {
        const prescriptions: Prescription[] = [{
            id: 'rx-2',
            molecule: 'FUROSEMIDE',
            dosageMgPerDose: 40,
            dosageMgPerHour: 0,
            route: 'IV',
            isActive: true,
            justAdministered: true,
            currentPlasmaConcentration: 0
        }];

        // Tick initial d'administration du bolus de Furosémide
        let state = prescriptionEngine.updatePharmacokinetics(mockPatientShock, prescriptions, 0);
        expect(state.updatedPrescriptions[0].currentPlasmaConcentration).toBe(40);

        // Avancement de 90 minutes. Normalement, t1/2 = 90min (la concentration devrait être à 20 mg/L).
        // Mais avec une clairance créat à 25 mL/min (facteur 0.25x), l'élimination est freinée.
        state = prescriptionEngine.updatePharmacokinetics(mockPatientShock, state.updatedPrescriptions, 90);
        
        const plasmaConcentration = state.updatedPrescriptions[0].currentPlasmaConcentration;
        expect(plasmaConcentration).toBeGreaterThan(20); // Preuve d'accumulation sérique par défaut d'épuration
    });

    test('Should catch unsafe co-prescriptions like NSAID + Diuretics and issue a severe iatrogenic warning', () => {
        const prescriptions: Prescription[] = [
            {
                id: 'rx-3',
                molecule: 'FUROSEMIDE',
                dosageMgPerDose: 40,
                dosageMgPerHour: 0,
                route: 'IV',
                isActive: true,
                justAdministered: false,
                currentPlasmaConcentration: 15
            },
            {
                id: 'rx-4',
                molecule: 'IBUPROFENE',
                dosageMgPerDose: 400,
                dosageMgPerHour: 0,
                route: 'PO',
                isActive: true,
                justAdministered: false,
                currentPlasmaConcentration: 30
            }
        ];

        const state = prescriptionEngine.updatePharmacokinetics(mockPatientShock, prescriptions, 5);
        const warning = state.alerts.find(a => a.type === 'WARNING');
        
        expect(warning).toBeDefined();
        expect(warning!.message).toContain('Iatrogénie');
    });
});