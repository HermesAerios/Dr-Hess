import { Patient } from '../../domain/models/Patient';

export type ExamModality = 'INSPECTION' | 'PALPATION' | 'PERCUSSION' | 'AUSCULTATION';
export type BodyRegion = 'HEAD_NECK' | 'THORAX_CARDIO' | 'THORAX_PULM' | 'ABDOMEN' | 'NEUROLOGICAL' | 'EXTREMITIES';

export interface ExamResult {
    finding: string;
    isAbnormal: boolean;
    costInMinutes: number;
}

export class ClinicalExamEngine {
    
    /**
     * Exécute un examen clinique ciblé.
     * Le temps virtuel s'écoule à chaque examen, forçant le joueur à prioriser.
     */
    public performExam(patient: Patient, region: BodyRegion, modality: ExamModality): ExamResult {
        // Temps standardisé par type d'examen
        const timeCost = this.getTimeCost(modality);
        
        // Résultat normal par défaut
        let result: ExamResult = {
            finding: this.getDefaultFinding(region, modality),
            isAbnormal: false,
            costInMinutes: timeCost
        };

        // Remplacement par des signes pathologiques selon la maladie et la gravité
        result = this.applyPathologicalFindings(patient, region, modality, result);

        return result;
    }

    private applyPathologicalFindings(patient: Patient, region: BodyRegion, modality: ExamModality, defaultResult: ExamResult): ExamResult {
        let currentResult = { ...defaultResult };

        // Exemple : Item EDN 234 - Insuffisance Cardiaque Aiguë (OAP)
        if (patient.pathologyId === 'EDN_234_HEART_FAILURE') {
            if (region === 'THORAX_PULM' && modality === 'AUSCULTATION') {
                currentResult = {
                    finding: "Crépitants bilatéraux prédominant aux bases, remontant jusqu'à mi-champs.",
                    isAbnormal: true,
                    costInMinutes: currentResult.costInMinutes
                };
            }
            if (region === 'EXTREMITIES' && modality === 'PALPATION') {
                currentResult = {
                    finding: "Œdèmes des membres inférieurs, bilatéraux, blancs, mous, prenant le godet. Index de pression systolique normal.",
                    isAbnormal: true,
                    costInMinutes: currentResult.costInMinutes
                };
            }
            if (region === 'THORAX_CARDIO' && modality === 'AUSCULTATION') {
                currentResult = {
                    finding: "Tachycardie régulière. Bruit de galop (B3) protodiastolique audible à l'apex.",
                    isAbnormal: true,
                    costInMinutes: currentResult.costInMinutes
                };
            }
        }

        // Exemple : Item EDN 352 - Péritonite aiguë
        if (patient.pathologyId === 'EDN_352_PERITONITIS') {
            if (region === 'ABDOMEN' && modality === 'PALPATION') {
                currentResult = {
                    finding: "Contracture abdominale généralisée, abdomen de bois, hyperesthésie cutanée. Douleur exquise au rebond.",
                    isAbnormal: true,
                    costInMinutes: currentResult.costInMinutes + 1 // Palpation difficile prend plus de temps
                };
            }
            if (region === 'ABDOMEN' && modality === 'AUSCULTATION') {
                currentResult = {
                    finding: "Abolition des bruits hydro-aériques (iléus paralytique).",
                    isAbnormal: true,
                    costInMinutes: currentResult.costInMinutes
                };
            }
        }

        // Surcouche liée aux constantes vitales (indépendante de la pathologie de base)
        if (patient.vitals.oxygenSaturation < 85 && region === 'EXTREMITIES' && modality === 'INSPECTION') {
             currentResult.finding += " Cyanose des extrémités marquée.";
             currentResult.isAbnormal = true;
        }

        return currentResult;
    }

    private getTimeCost(modality: ExamModality): number {
        switch (modality) {
            case 'INSPECTION': return 0.5; // Rapide
            case 'PALPATION': return 2;
            case 'PERCUSSION': return 1.5;
            case 'AUSCULTATION': return 3; // Demande de la concentration
            default: return 1;
        }
    }

    private getDefaultFinding(region: BodyRegion, modality: ExamModality): string {
        const defaults: Record<string, string> = {
            'THORAX_PULM_AUSCULTATION': "Murmure vésiculaire perçu de façon symétrique, sans bruits surajoutés.",
            'THORAX_CARDIO_AUSCULTATION': "Bruits du cœur réguliers, bien frappés, sans souffle perçu.",
            'ABDOMEN_PALPATION': "Abdomen souple, dépressible, indolore. Pas d'hépatomégalie ni de splénomégalie.",
            'NEUROLOGICAL_INSPECTION': "Patient conscient, orienté dans le temps et l'espace. Pas de déficit moteur évident.",
            // ... autres combinaisons par défaut mappées sur l'examen standard normal
        };
        return defaults[`${region}_${modality}`] || "Examen sans particularité.";
    }
}