/**
 * Hand-rolled structural pins for data/schemas/discovery-run.v0.json
 * (no Ajv — catalog-json.test.ts convention: no new runtime deps).
 *
 * @module tests/composition/probe/discovery-run-schema
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const schema = JSON.parse(
  readFileSync(
    resolve(here, '../../../data/schemas/discovery-run.v0.json'),
    'utf-8',
  ),
) as {
  $schema: string;
  title: string;
  description: string;
  type: string;
  required: string[];
  properties: Record<string, Record<string, unknown>>;
};

const REQUIRED_FIELDS = [
  'schemaVersion',
  'runId',
  'repositoryCommit',
  'problemHash',
  'datasetHashes',
  'backendDescriptors',
  'randomSeeds',
  'tolerances',
  'environment',
  'searchBudget',
  'startedAt',
] as const;

const STOP_REASONS = [
  'exhausted-space',
  'candidate-limit',
  'evaluation-limit',
  'time-limit',
  'memory-limit',
  'cancelled',
  'sufficient-candidates',
  'non-identifiable',
  'no-credible-candidate',
] as const;

const SEARCH_BUDGET_REQUIRED = [
  'maxCandidates',
  'maxAstDepth',
  'maxOperators',
  'maxDerivativeOrder',
  'maxEvaluations',
  'maxWallClockMs',
] as const;

describe('data/schemas/discovery-run.v0.json', () => {
  it('is JSON Schema draft-07 with title, description, and type object', () => {
    expect(schema.$schema).toBe('http://json-schema.org/draft-07/schema#');
    expect(schema.title).toBe('UPT Discovery Run Manifest');
    expect(typeof schema.description).toBe('string');
    expect(schema.description.length).toBeGreaterThan(0);
    expect(schema.type).toBe('object');
  });

  it('requires the v0 manifest identity fields', () => {
    for (const field of REQUIRED_FIELDS) {
      expect(schema.required).toContain(field);
    }
  });

  it('pins schemaVersion const "0" and runId ^dr-', () => {
    expect(schema.properties['schemaVersion']?.['const']).toBe('0');
    expect(schema.properties['runId']?.['type']).toBe('string');
    expect(schema.properties['runId']?.['pattern']).toBe('^dr-');
  });

  it('requires searchBudget numeric caps and optional memory/process ceilings', () => {
    const budget = schema.properties['searchBudget'] as {
      type: string;
      required: string[];
      properties: Record<string, { type?: string }>;
    };
    expect(budget.type).toBe('object');
    expect(budget.required).toEqual([...SEARCH_BUDGET_REQUIRED]);
    for (const key of SEARCH_BUDGET_REQUIRED) {
      expect(budget.properties[key]?.type).toBe('number');
    }
    expect(budget.properties['maxResidentMemoryBytes']?.type).toBe('number');
    expect(budget.properties['maxExternalProcesses']?.type).toBe('number');
  });

  it('requires environment node/platform/arch strings', () => {
    const env = schema.properties['environment'] as {
      type: string;
      required: string[];
      properties: Record<string, { type?: string }>;
    };
    expect(env.type).toBe('object');
    expect(env.required).toEqual(['node', 'platform', 'arch']);
    expect(env.properties['node']?.type).toBe('string');
    expect(env.properties['platform']?.type).toBe('string');
    expect(env.properties['arch']?.type).toBe('string');
  });

  it('enumerates SearchStopReason', () => {
    expect(schema.properties['stopReason']?.['enum']).toEqual([...STOP_REASONS]);
  });
});
