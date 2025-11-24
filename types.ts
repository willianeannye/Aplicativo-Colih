export enum GroupName {
  GrupoA = 'Grupo A',
  GrupoB = 'Grupo B',
  GrupoC = 'Grupo C',
  GrupoD = 'Grupo D',
  GrupoE = 'Grupo E',
  Camacari = 'Grupo Camaçari',
  Itaparica = 'Grupo Itaparica',
  SAJ = 'Grupo SAJ',
  Valenca = 'Grupo Valença',
  Alagoinhas = 'Grupo Alagoinhas',
}

export enum Status {
  InProgress = 'Em andamento',
  Finalized = 'Finalizado',
}

export enum YesNo {
  Yes = 'Sim',
  No = 'Não',
}

export interface AttendanceRecord {
  id: string;
  group: GroupName;
  responsibleMember: string;
  patientInitials: string;
  hospital: string;
  status: Status;
  hlc7Finalized: YesNo;
  hlc7Sent: YesNo;
  observations: string;
  createdAt: number;
  updatedAt: number;
  createdByUserId: string; // To allow editing only by creator (simulated)
}

export interface User {
  id: string;
  name: string;
  role: 'Manager' | 'Member';
  group?: GroupName; // Managers might not have a specific group, or see all
}

export interface FilterState {
  responsibleMember: string;
  patientInitials: string;
  hospital: string;
  status: string;
  hlc7Finalized: string;
  hlc7Sent: string;
}