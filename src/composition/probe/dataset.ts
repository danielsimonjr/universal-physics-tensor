/**
 * Observation adapters for Product B.
 *
 * In-memory / JSON / CSV. Does not live in `src/bridges/observations/` —
 * that tree is Product A's confrontation ledger and must stay cycle-free
 * from probe.
 *
 * @internal
 */

import { readFileSync } from 'node:fs';
import type { DatasetRole, ObservationRow, ProbeDataset } from './types.js';
import { SCHEMA_VERSION } from './types.js';

/** Build an in-memory dataset. @internal */
export function datasetFromRows(
  rows: readonly ObservationRow[],
  observable: string,
  role: DatasetRole,
  id = 'inline',
  sigma?: number,
): ProbeDataset {
  return { id, role, rows, observable, ...(sigma !== undefined ? { sigma } : {}), schemaVersion: SCHEMA_VERSION };
}

/** Coerce unknown JSON into a ProbeDataset. @internal */
export function asDatasetSafe(raw: unknown, fallbackId: string, fallbackRole?: DatasetRole): ProbeDataset {
  if (!raw || typeof raw !== 'object') {
    throw new Error(`dataset JSON is not an object (${fallbackId})`);
  }
  const obj = raw as {
    id?: unknown;
    role?: unknown;
    rows?: unknown;
    observable?: unknown;
    sigma?: unknown;
    schemaVersion?: unknown;
  };
  if (!Array.isArray(obj.rows)) {
    throw new Error(`dataset at ${fallbackId} is missing rows[]`);
  }
  if (typeof obj.observable !== 'string' || obj.observable.length === 0) {
    throw new Error(`dataset at ${fallbackId} is missing observable`);
  }
  const role = (typeof obj.role === 'string' ? obj.role : fallbackRole) as DatasetRole | undefined;
  if (
    role !== 'exploratory-fit' &&
    role !== 'validation-holdout' &&
    role !== 'external-replication' &&
    role !== 'falsification-only'
  ) {
    throw new Error(`dataset at ${fallbackId} has invalid role '${String(obj.role)}'`);
  }
  const rows: ObservationRow[] = obj.rows.map((row, i) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      throw new Error(`dataset ${fallbackId} row ${i} is not an object`);
    }
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(row as Record<string, unknown>)) {
      const n = typeof v === 'number' ? v : Number(v);
      if (!Number.isFinite(n)) {
        throw new Error(`dataset ${fallbackId} row ${i} column ${k}: not a finite number`);
      }
      out[k] = n;
    }
    return out;
  });
  return {
    id: typeof obj.id === 'string' ? obj.id : fallbackId,
    role,
    rows,
    observable: obj.observable,
    ...(typeof obj.sigma === 'number' && Number.isFinite(obj.sigma) ? { sigma: obj.sigma } : {}),
    schemaVersion: typeof obj.schemaVersion === 'string' ? obj.schemaVersion : SCHEMA_VERSION,
  };
}

/** Load a single ProbeDataset JSON object. @internal */
export function loadDatasetFromJson(path: string, fallbackRole?: DatasetRole): ProbeDataset {
  const raw = JSON.parse(readFileSync(path, 'utf8')) as unknown;
  return asDatasetSafe(raw, path, fallbackRole);
}

export interface SplitFileDatasets {
  readonly exploratory?: ProbeDataset;
  readonly holdout?: ProbeDataset;
}

/** Load `{ exploratory, holdout }` JSON. @internal */
export function loadSplitDatasetsFromJson(path: string): SplitFileDatasets {
  const raw = JSON.parse(readFileSync(path, 'utf8')) as {
    exploratory?: unknown;
    holdout?: unknown;
    observations?: unknown;
  };
  if (raw.exploratory || raw.holdout) {
    return {
      exploratory: raw.exploratory
        ? asDatasetSafe(raw.exploratory, `${path}#exploratory`, 'exploratory-fit')
        : undefined,
      holdout: raw.holdout
        ? asDatasetSafe(raw.holdout, `${path}#holdout`, 'validation-holdout')
        : undefined,
    };
  }
  if (raw.observations) {
    return {
      exploratory: asDatasetSafe(
        { ...(raw.observations as object), role: 'exploratory-fit' },
        `${path}#observations`,
        'exploratory-fit',
      ),
    };
  }
  throw new Error(`JSON at ${path} needs exploratory/holdout or observations`);
}

/**
 * Minimal CSV: first row headers, remaining rows numeric values.
 * Optional `split` column (`exploratory`/`holdout`/`blind`).
 *
 * @internal
 */
export function loadDatasetFromCsv(
  path: string,
  observable: string,
  role: DatasetRole,
  id = path,
): ProbeDataset {
  const text = readFileSync(path, 'utf8').trim();
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length < 2) {
    throw new Error(`CSV dataset at ${path} needs a header and at least one row`);
  }
  const headers = lines[0]!.split(',').map((h) => h.trim());
  const rows: ObservationRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i]!.split(',').map((c) => c.trim());
    const row: Record<string, number> = {};
    for (let c = 0; c < headers.length; c++) {
      const h = headers[c]!;
      if (h === 'split') continue;
      const n = Number(cells[c] ?? '');
      if (!Number.isFinite(n)) {
        throw new Error(`CSV ${path} row ${i + 1} column ${h}: not a finite number`);
      }
      row[h] = n;
    }
    rows.push(row);
  }
  if (!(observable in (rows[0] ?? {}))) {
    throw new Error(`CSV ${path} is missing observable column '${observable}'`);
  }
  return datasetFromRows(rows, observable, role, id);
}

/** Partition a mixed-split CSV (uses a `split` column). @internal */
export function loadSplitCsv(
  path: string,
  observable: string,
): { exploratory: ProbeDataset; holdout: ProbeDataset } {
  const text = readFileSync(path, 'utf8').trim();
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length < 2) {
    throw new Error(`CSV dataset at ${path} needs a header and at least one row`);
  }
  const headers = lines[0]!.split(',').map((h) => h.trim());
  const splitIdx = headers.indexOf('split');
  if (splitIdx < 0) {
    throw new Error(`CSV ${path} has no split column`);
  }
  const exploratoryRows: ObservationRow[] = [];
  const holdoutRows: ObservationRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i]!.split(',').map((c) => c.trim());
    const row: Record<string, number> = {};
    for (let c = 0; c < headers.length; c++) {
      if (c === splitIdx) continue;
      const n = Number(cells[c] ?? '');
      if (!Number.isFinite(n)) {
        throw new Error(`CSV ${path} row ${i + 1} column ${headers[c]}: not a finite number`);
      }
      row[headers[c]!] = n;
    }
    const split = cells[splitIdx];
    if (split === 'holdout') holdoutRows.push(row);
    else exploratoryRows.push(row);
  }
  return {
    exploratory: datasetFromRows(exploratoryRows, observable, 'exploratory-fit', `${path}#exploratory`),
    holdout: datasetFromRows(holdoutRows, observable, 'validation-holdout', `${path}#holdout`),
  };
}
