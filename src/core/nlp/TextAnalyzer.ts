export interface AnalyzedIntent {
    intent: 'EXAMEN_CLINIQUE' | 'EXAMEN_LABO' | 'TRAITEMENT' | 'INTERROGATOIRE' | 'INCONNU';
    target: string; // Ce sur quoi porte l'action (ex: "poumons", "paracétamol")
    score: number;
}

export class TextAnalyzer {
    // Permet de nettoyer le texte (vire les accents, les espaces inutiles, met en minuscule)
    private static normalize(text: string): string {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
            .trim();
    }

    public static analyze(rawInput: string): AnalyzedIntent {
        const clean = this.normalize(rawInput);

        // 1. Dictionnaire des Traitements / Médicaments
        if (/\b(injecte|donne|administre|prescrit|met|perfusion|iv|po)\b/.test(clean) || /\b(amoxicilline|paracetamol|g5|insuline|morphine|valium)\b/.test(clean)) {
            let target = 'inconnu';
            if (clean.includes('amoxicilline')) target = 'amoxicilline';
            if (clean.includes('paracetamol')) target = 'paracetamol';
            if (clean.includes('morphine')) target = 'morphine';
            return { intent: 'TRAITEMENT', target, score: 1 };
        }

        // 2. Dictionnaire des Examens Biologiques (Labo)
        if (/\b(sang|prise de sang|bilan|pds|ionogramme|numération|nfs|troponine|creat)\b/.test(clean)) {
            let target = 'bilan_standard';
            if (clean.includes('troponine')) target = 'troponine';
            if (clean.includes('gaz')) target = 'gaz_du_sang';
            return { intent: 'EXAMEN_LABO', target, score: 1 };
        }

        // 3. Dictionnaire des Examens Cliniques (Sur le patient)
        if (/\b(ausculte|ecoute|regarde|examine|palpe|tensiometre|tension|constantes|ecg|pouls)\b/.test(clean)) {
            let target = 'constantes';
            if (clean.includes('poumon') || clean.includes('respirer') || clean.includes('stetho')) target = 'poumons';
            if (clean.includes('coeur') || clean.includes('battement')) target = 'coeur';
            if (clean.includes('ecg')) target = 'ecg';
            return { intent: 'EXAMEN_CLINIQUE', target, score: 1 };
        }

        // 4. Dictionnaire de Dialogue (Interrogatoire)
        if (/\b(demande|questione|parle|demande-lui|interroge|ou as tu mal|douleur)\b/.test(clean) || clean.includes('?')) {
            let target = 'anamnese';
            if (clean.includes('famille') || clean.includes('parents')) target = 'antecedents_familiaux';
            if (clean.includes('tete') || clean.includes('cephalée')) target = 'douleur_tete';
            return { intent: 'INTERROGATOIRE', target, score: 1 };
        }

        return { intent: 'INCONNU', target: '', score: 0 };
    }
}