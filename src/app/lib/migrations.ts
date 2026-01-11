const SCHEMA_VERSION_KEY = 'dogtracer_schema_version';
const CURRENT_SCHEMA_VERSION = 2;

interface Migration {
  version: number;
  name: string;
  migrate: () => void;
}

function getSchemaVersion(): number {
  if (typeof window === 'undefined') return CURRENT_SCHEMA_VERSION;
  const stored = localStorage.getItem(SCHEMA_VERSION_KEY);
  if (!stored) return 0;
  return parseInt(stored, 10) || 0;
}

function setSchemaVersion(version: number): void {
  localStorage.setItem(SCHEMA_VERSION_KEY, String(version));
}

function migrateMomentsV1ToV2(): void {
  const MOMENTS_KEY = 'dogtracer_moments';
  const stored = localStorage.getItem(MOMENTS_KEY);
  if (!stored) return;

  try {
    const moments = JSON.parse(stored);
    const migrated = moments.map((m: Record<string, unknown>) => ({
      ...m,
      mood: m.mood ?? null,
      moodConfidence: m.moodConfidence ?? null,
      entityIds: m.entityIds ?? [],
      sessionId: m.sessionId ?? null,
    }));
    localStorage.setItem(MOMENTS_KEY, JSON.stringify(migrated));
  } catch {
    console.warn('Failed to migrate moments from v1 to v2');
  }
}

const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    migrate: () => {
      // Initial schema - nothing to migrate
    },
  },
  {
    version: 2,
    name: 'add_mood_entities_session_to_moments',
    migrate: migrateMomentsV1ToV2,
  },
];

export function runMigrations(): void {
  if (typeof window === 'undefined') return;

  const currentVersion = getSchemaVersion();

  if (currentVersion >= CURRENT_SCHEMA_VERSION) {
    return;
  }

  const pendingMigrations = migrations.filter((m) => m.version > currentVersion);

  for (const migration of pendingMigrations) {
    console.log(`Running migration ${migration.version}: ${migration.name}`);
    try {
      migration.migrate();
      setSchemaVersion(migration.version);
    } catch (error) {
      console.error(`Migration ${migration.version} failed:`, error);
      break;
    }
  }
}

export function getDbVersion(): number {
  return getSchemaVersion();
}

export function getCurrentSchemaVersion(): number {
  return CURRENT_SCHEMA_VERSION;
}
