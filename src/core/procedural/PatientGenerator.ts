import { EDNReferential } from '../../domain/medical_knowledge/EDNReferential';
import { Patient, Vitals } from '../../domain/models/Patient';
import { v4 as uuidv4 } from 'uuid';

export class PatientGenerator {
    private ednReferential: EDNReferential;

    constructor(referential: EDNReferential) {
        this.ednReferential = referential;
    }

    /**
     * Génère un cas clinique procédural complet basé sur un item EDN ciblé.
     */
    public generateCase(ednItemId: string, difficultyModifier: number): Patient {
        const itemData = this.ednReferential.getItem(ednItemId);
        
        const age = this.randomGaussian(itemData.epidemiology.meanAge, itemData.epidemiology.stdDevAge);
        const sex = Math.random() > itemData.epidemiology.femaleRatio ? 'M' : 'F';
        
        // Génération de l'historique et des antécédents de façon cohérente
        const atcd = this.generateComorbidities(age, sex, difficultyModifier);
        
        // Modification de la présentation clinique basée sur les antécédents
        // Ex: Un patient diabétique fera un infarctus plus silencieux
        const presentation = this.alterPresentationBasedOnATCD(itemData.classicPresentation, atcd);

        return {
            id: uuidv4(),
            name: this.generateName(sex),
            age: Math.round(age),
            sex: sex,
            profession: this.generateProfession(age),
            pathologyId: ednItemId,
            atcd: atcd,
            vitals: this.generateInitialVitals(presentation, difficultyModifier),
            symptoms: presentation.symptoms,
            timeInSystem: 0,
            state: {
                creatinineClearance: 100, // Sera recalculé par le moteur
                consciousnessScore: presentation.glasgow || 15
            }
        };
    }

    private generateComorbidities(age: number, sex: string, difficulty: number): string[] {
        const atcd = [];
        // Logique de probabilité d'antécédents croisée avec l'âge
        if (age > 50 && Math.random() < 0.4 * difficulty) atcd.push('Hypertension Artérielle');
        if (age > 60 && Math.random() < 0.2 * difficulty) atcd.push('Diabète de type 2');
        if (Math.random() < 0.1) atcd.push('Allergie: Pénicilline'); // Piège classique EDN
        return atcd;
    }

    private alterPresentationBasedOnATCD(basePresentation: any, atcd: string[]): any {
        let altered = { ...basePresentation };
        if (atcd.includes('Diabète de type 2') && altered.type === 'Infarctus') {
            altered.symptoms = altered.symptoms.filter((s: string) => s !== 'Douleur thoracique typique');
            altered.symptoms.push('Dyspnée isolée', 'Inconfort épigastrique');
        }
        return altered;
    }

    private randomGaussian(mean: number, stdev: number): number {
        let u = 1 - Math.random();
        let v = Math.random();
        let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return z * stdev + mean;
    }

    private generateInitialVitals(presentation: any, difficulty: number): Vitals {
        // Introduit des facteurs de confusion si la difficulté est élevée
        const noise = difficulty > 1.5 ? (Math.random() * 10 - 5) : 0; 
        
        return {
            systolicBP: presentation.baseSBP + noise,
            diastolicBP: presentation.baseDBP + (noise * 0.6),
            heartRate: presentation.baseHR + noise,
            temperature: presentation.baseTemp + (noise * 0.1),
            oxygenSaturation: presentation.baseSpO2,
            creatinine: 80 // Valeur par défaut, perturbée par le moteur bio ensuite
        };
    }

    private generateName(sex: string): string {
        // Connexion à une base de noms procéduraux
        return sex === 'M' ? "Jean Dupont" : "Marie Martin"; 
    }
    
    private generateProfession(age: number): string {
        return age > 65 ? "Retraité(e)" : "Enseignant(e)";
    }
}