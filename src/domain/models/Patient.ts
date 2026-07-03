export class Patient {
    id: string;
    name: string;
    age: number;
    sex: 'M' | 'F';
    profession: string;
    weight: number;
    atcd: string[];
    symptoms: string[];
    pathologyId: string;
    timeInSystem: number;
    vitals: {
        heartRate: number;
        systolicBP: number;
        diastolicBP: number;
        oxygenSaturation: number;
        potassium: number;
        creatinine: number;
    };
    state: {
        consciousnessScore: number;
        creatinineClearance: number;
    };
}
