export type CourtKey =
  | 'default'
  | 'ao'
  | 'uso'
  | 'sw'
  | 'rg'
  | 'davis'
  | 'nitto'
  | 'nextgen'
  | 'laver'
  | 'cancun'
  | 'riyadh'
  | 'shanghai';

export interface CourtConfig {
  label: string;
  floorColor: string;
  courtColor: string;
  isWimbledon?: boolean;
  isSingles?: boolean;
}

export const COURTS: Record<CourtKey, CourtConfig> = {
  default: {
    label: 'Classic',
    floorColor: '#ED6DA7',
    courtColor: '#404040',
  },
  ao: {
    label: 'Australian Open',
    floorColor: '#1E8FD5',
    courtColor: '#387CB8',
  },
  uso: {
    label: 'US Open',
    floorColor: '#6EA155',
    courtColor: '#476997',
  },
  sw: {
    label: 'Wimbledon',
    floorColor: '#2B8209',
    courtColor: '#2B8209',
    isWimbledon: true,
  },
  rg: {
    label: 'Roland Garros',
    floorColor: '#E8632E',
    courtColor: '#E8632E',
  },
  davis: {
    label: 'Davis Cup',
    floorColor: '#6B696A',
    courtColor: '#3D7969',
  },
  nitto: {
    label: 'Nitto ATP Finals',
    floorColor: '#5982B2',
    courtColor: '#405772',
  },
  nextgen: {
    label: 'Next Gen Finals',
    floorColor: '#68AAFF',
    courtColor: '#34547C',
    isSingles: true,
  },
  laver: {
    label: 'Laver Cup',
    floorColor: '#404040',
    courtColor: '#404040',
  },
  cancun: {
    label: 'Cancun',
    floorColor: '#33383D',
    courtColor: '#5D2947',
  },
  riyadh: {
    label: 'Riyadh',
    floorColor: '#64636A',
    courtColor: '#8D60D3',
  },
  shanghai: {
    label: 'Shanghai',
    floorColor: '#A2C57D',
    courtColor: '#4A477D',
  },
};

export type AIKey =
  | 'local'
  | 'basic'
  | 'phantom'
  | 'sentinel'
  | 'titan'
  | 'rival'
  | 'teleporter'
  | 'matrix';

export interface AIConfig {
  key: AIKey;
  label: string;
  description: string;
  emoji: string;
}

export const AI_OPPONENTS: AIConfig[] = [
  {
    key: 'local',
    label: 'Local 2 Player',
    description: 'Play against a friend on the same device',
    emoji: '👥',
  },
  {
    key: 'basic',
    label: 'Basic',
    description: 'Returns the ball to center court',
    emoji: '🟢',
  },
  {
    key: 'phantom',
    label: 'Phantom',
    description: 'Hits cross-court & inside-out only',
    emoji: '👻',
  },
  {
    key: 'sentinel',
    label: 'Sentinel',
    description: 'Hits down-the-line shots only',
    emoji: '🎯',
  },
  {
    key: 'titan',
    label: 'Titan',
    description: 'Targets the open side of the court',
    emoji: '⚡',
  },
  {
    key: 'rival',
    label: 'Rival',
    description: 'Hits perfectly into the open corner',
    emoji: '🔥',
  },
  {
    key: 'teleporter',
    label: 'Teleporter',
    description: 'Unbeatable — teleports to every ball',
    emoji: '💀',
  },
  {
    key: 'matrix',
    label: 'Matrix',
    description: 'Reads your movement and hits the opposite way',
    emoji: '🕶️',
  },
];