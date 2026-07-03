import { Patient } from '../../domain/models/Patient';
import { LAB_RANGES, LabPanelType } from '../../domain/medical_knowledge/ReferenceRanges';
import { v4 as uuidv4 } from 'uuid';

export interface LabResult {
    id: string;
    parameterId: string;
    value: number;
    unit: string;
    isAbnormal: boolean;
    isCritical: boolean;
}

export interface LabOrder {
    orderId: string;
    panelType: LabPanelType;
    orderedAtTime: number;
    availableAtTime: number;
    results: LabResult[] | null;
}

export class LabResultsGenerator {
    
    /**
     * Commande un bilan. Retourne l'ordre avec le délai de livraison.
     */
    public orderLabPanel(patient: Patient, panel: LabPanelType, currentTime: number, isStat: boolean = false): LabOrder {
        const delay = this.getPanelDelay(panel, isStat);
        
        return {
            orderId: uuidv4(),
            panelType: panel,
            orderedAtTime: currentTime,
            availableAtTime: currentTime + delay,
            results: null // Les résultats sont "calculés" mais cachés jusqu'à availableAtTime
        };
    }

    /**
     * Génère les valeurs réelles au moment de l'analyse, reflétant l'état du patient à cet instant T.
     */
    public generateResultsForOrder(patient: Patient, order: LabOrder): LabOrder {
        const results: LabResult[] = [];
        const paramsToGenerate = this.getParametersForPanel(order.panelType);

        paramsToGenerate.forEach(paramId => {
            const rawValue = this.calculatePhysiologicalValue(patient, paramId);
            const ref = LAB_RANGES[paramId];
            
            // Évaluation des flags H/L ou critiques
            const isLow = patient.sex === 'M' ? rawValue < ref.minM : rawValue < ref.minF;
            const isHigh = patient.sex === 'M' ? rawValue > ref.maxM : rawValue > ref.maxF;
            const isCritLow = ref.criticalMin !== undefined && rawValue <= ref.criticalMin;
            const isCritHigh = ref.criticalMax !== undefined && rawValue >= ref.criticalMax;

            results.push({
                id: uuidv4(),
                parameterId: paramId,
                value: Number(rawValue.toFixed(2)),
                unit: ref.unit,
                isAbnormal: isLow || isHigh,
                isCritical: isCritLow || isCritHigh
            });
        });

        return { ...order, results };
    }

    private calculatePhysiologicalValue(patient: Patient, paramId: string): number {
        const ref = LAB_RANGES[paramId];
        const baseNorm = patient.sex === 'M' ? (ref.maxM + ref.minM)/2 : (ref.maxF + ref.minF)/2;
        let targetValue = baseNorm;

        // --- Logique Physiopathologique ---
        
        if (paramId === 'CREATININE') {
            // Relation inverse avec la clairance de la créatinine (Cockcroft-Gault inversé pour simulation)
            if (patient.state.creatinineClearance < 90) {
                targetValue = ((140 - patient.age) * patient.weight) / (0.814 * patient.state.creatinineClearance);
            }
        }

        if (paramId === 'LACTATES') {
            // Sepsis ou hypoperfusion (Choc)
            if (patient.vitals.systolicBP < 90) targetValue += 3.5; 
            if (patient.pathologyId === 'EDN_334_SEPSIS') targetValue += 4.0;
        }

        if (paramId === 'TROPONIN_HS') {
            // Infarctus du myocarde
            if (patient.pathologyId === 'EDN_228_SCA') {
                // Monte drastiquement avec le temps in-game
                targetValue = 150 + (patient.timeInSystem * 12);
            }
        }
        
        if (paramId === 'HEMOGLOBIN') {
             if (patient.pathologyId === 'EDN_339_HEMORRHAGE') {
                 targetValue -= (patient.timeInSystem * 0.1); // Baisse de l'hémoglobine due au saignement actif
             }
        }

        // Ajout d'un très léger bruit gaussien (±2%) pour éviter les chiffres trop "ronds" ou irréalistes
        const noise = (Math.random() * 0.04 - 0.02) * targetValue;
        return targetValue + noise;
    }

    private getParametersForPanel(panel: LabPanelType): string[] {
        switch (panel) {
            case 'IONO_SANG': return ['SODIUM', 'POTASSIUM', 'CHLORURE', 'CREATININE'];
            case 'NFS': return ['HEMOGLOBIN', 'LEUKOCYTES', 'PLATELETS'];
            case 'GAZ_DU_SANG': return ['PH', 'PAO2', 'PACO2', 'LACTATES'];
            case 'TROPONINE': return ['TROPONIN_HS'];
            case 'BILAN_INFLAMMATOIRE': return ['CRP', 'LEUKOCYTES'];
            default: return [];
        }
    }

    private getPanelDelay(panel: LabPanelType, isStat: boolean): number {
        const multiplier = isStat ? 0.5 : 1.0;
        switch (panel) {
            case 'GAZ_DU_SANG': return 5; // Direct en réa
            case 'TROPONINE': return 30 * multiplier;
            case 'NFS': 
            case 'IONO_SANG': return 45 * multiplier;
            default: return 60 * multiplier;
        }
    }
}