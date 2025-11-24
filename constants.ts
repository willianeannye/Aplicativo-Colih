import { GroupName, YesNo, Status } from './types';

export const GROUPS = Object.values(GroupName);
export const YES_NO_OPTIONS = Object.values(YesNo);
export const STATUS_OPTIONS = Object.values(Status);

export const MOCK_USERS = [
  { id: 'mgr1', name: 'Gestor Geral', role: 'Manager' },
  { id: 'usr1', name: 'Membro Grupo A', role: 'Member', group: GroupName.GrupoA },
  { id: 'usr2', name: 'Membro Grupo B', role: 'Member', group: GroupName.GrupoB },
  { id: 'usr3', name: 'Membro Camaçari', role: 'Member', group: GroupName.Camacari },
]; // Simplified for demo login