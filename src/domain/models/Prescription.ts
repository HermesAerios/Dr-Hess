export class Prescription {
    id: string;
    molecule: string;
    dosageMgPerDose: number;
    dosageMgPerHour: number;
    route: 'PO' | 'IV' | 'IM';
    isActive: boolean;
    justAdministered: boolean;
    currentPlasmaConcentration: number;
}