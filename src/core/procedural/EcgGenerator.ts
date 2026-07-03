import { Patient } from '../../domain/models/Patient';

export interface EcgWaveConfig {
    pDuration: number;
    prInterval: number;
    qrsDuration: number;
    stSegmentShift: number; // En mm (positif = sus-décalage, négatif = sous-décalage)
    tWaveAmplitude: number;
}

export class EcgGenerator {
    
    /**
     * Génère le path SVG d'une dérivation ECG en fonction de la physiopathologie du patient.
     */
    public generateLeadPath(patient: Patient, leadName: string, width: number, height: number): string {
        const heartRate = patient.vitals.heartRate;
        const beatsPerSecond = heartRate / 60;
        const pixelsPerSecond = width / 5; // Fenêtre de 5 secondes
        const config = this.getEcgConfigFromPathology(patient, leadName);

        let path = `M 0,${height / 2}`;
        let currentX = 0;

        const beatInterval = pixelsPerSecond / beatsPerSecond;
        
        while (currentX < width) {
            path += this.appendSingleHeartBeat(currentX, height / 2, config, pixelsPerSecond);
            currentX += beatInterval;
        }

        return path;
    }

    private appendSingleHeartBeat(startX: number, centerY: number, cfg: EcgWaveConfig, scaleX: number): string {
        // Modélisation géométrique simplifiée mais rigoureuse d'un complexe P-Q-R-S-T-U
        const pWave = ` Q ${startX + scaleX*0.04},${centerY - 8} ${startX + scaleX*0.08},${centerY}`;
        const prSegment = ` L ${startX + scaleX*0.14},${centerY}`;
        const qWave = ` L ${startX + scaleX*0.16},${centerY + 6}`;
        const rWave = ` L ${startX + scaleX*0.19},${centerY - 45}`;
        const sWave = ` L ${startX + scaleX*0.22},${centerY + 12}`;
        const jPoint = ` L ${startX + scaleX*0.24},${centerY - (cfg.stSegmentShift * 4)}`; 
        const stSegment = ` L ${startX + scaleX*0.32},${centerY - (cfg.stSegmentShift * 4)}`;
        const tWave = ` Q ${startX + scaleX*0.42},${centerY - (cfg.tWaveAmplitude * 6)} ${startX + scaleX*0.52},${centerY}`;
        const tpSegment = ` L ${startX + scaleX*0.8},${centerY}`;

        return `${pWave}${prSegment}${qWave}${rWave}${sWave}${jPoint}${stSegment}${tWave}${tpSegment}`;
    }

    private getEcgConfigFromPathology(patient: Patient, leadName: string): EcgWaveConfig {
        const config: EcgWaveConfig = {
            pDuration: 0.08,
            prInterval: 0.16,
            qrsDuration: 0.08,
            stSegmentShift: 0,
            tWaveAmplitude: 3
        };

        // --- Altérations EDN Spécifiques ---
        
        // Item 228 : Syndrome Coronarien Aigu (SCA / IDM)
        if (patient.pathologyId === 'EDN_228_SCA') {
            // Territoire Antérieur (V1, V2, V3, V4) -> Onde de Pardee (Sus-décalage ST convexe vers le haut)
            if (['V1', 'V2', 'V3', 'V4'].includes(leadName)) {
                config.stSegmentShift = 6; // 6mm de sus-décalage
                config.tWaveAmplitude = 8;
            }
            // Image en miroir (Sous-décalage) en DI, aVL
            if (['DII', 'DIII', 'aVF'].includes(leadName)) {
                config.stSegmentShift = -3;
            }
        }

        // Item 267 : Hyperkaliémie
        if (patient.vitals.potassium > 5.5) {
            config.tWaveAmplitude = 12; // Ondes T amples, pointues, symétriques
            if (patient.vitals.potassium > 7.0) {
                config.qrsDuration = 0.16; // Élargissement des complexes QRS (bloquant/mortel)
                config.prInterval = 0.24;
            }
        }

        return config;
    }
}