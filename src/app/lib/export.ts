import { getMoments, type Moment } from './moments';
import { getSessions, type Session } from './sessions';
import { getEntities, type Entity } from './entities';
import { getProfile, type DogProfile } from './profile';

export interface ExportData {
  version: string;
  exportedAt: string;
  profile: DogProfile | null;
  moments: Moment[];
  sessions: Session[];
  entities: Entity[];
}

export function generateExportData(): ExportData {
  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    profile: getProfile(),
    moments: getMoments(),
    sessions: getSessions(),
    entities: getEntities(),
  };
}

export function exportAsJson(): void {
  const data = generateExportData();
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const profile = getProfile();
  const dogName = profile?.name || 'DogTracer';
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `${dogName.replace(/\s+/g, '_')}_export_${dateStr}.json`;
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getExportDataSummary(): { moments: number; sessions: number; entities: number; hasProfile: boolean } {
  return {
    moments: getMoments().length,
    sessions: getSessions().length,
    entities: getEntities().length,
    hasProfile: getProfile() !== null,
  };
}
