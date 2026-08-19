/**
 * Canonical JSON + SHA-256 helpers for Product B probe artifacts.
 *
 * Pins: key sort, undefined-omit, array order, Date-as-ISO (not `{}`),
 * empty-string SHA-256 vector, and hashCanonical = sha256(canonicalJson).
 *
 * @module tests/composition/probe/serialize
 */
import { describe, it, expect } from 'vitest';
import {
  canonicalJson,
  sha256Hex,
  hashCanonical,
} from '../../../src/composition/probe/serialize.js';

describe('canonicalJson', () => {
  it('sorts object keys lexicographically', () => {
    expect(canonicalJson({ b: 1, a: 2 })).toBe('{"a":2,"b":1}');
    expect(canonicalJson({ b: 1, a: 2 })).toBe(canonicalJson({ a: 2, b: 1 }));
  });

  it('omits undefined object properties', () => {
    expect(canonicalJson({ a: 1, b: undefined })).toBe('{"a":1}');
  });

  it('preserves array encounter order', () => {
    expect(canonicalJson([2, 1])).toBe('[2,1]');
    expect(canonicalJson([2, 1])).not.toBe(canonicalJson([1, 2]));
  });

  it('sorts nested object keys and leaves nested arrays unordered-by-us', () => {
    expect(canonicalJson({ z: { b: 1, a: 2 }, y: [3, 1] })).toBe(
      '{"y":[3,1],"z":{"a":2,"b":1}}',
    );
  });

  it('serializes Date as ISO-8601, not as an empty object', () => {
    const t = new Date('2026-07-05T00:00:00.000Z');
    expect(canonicalJson(t)).toBe('"2026-07-05T00:00:00.000Z"');
    expect(canonicalJson({ t, a: 1 })).toBe(
      '{"a":1,"t":"2026-07-05T00:00:00.000Z"}',
    );
    expect(canonicalJson(t)).not.toBe('{}');
  });

  it('turns undefined array holes into null (JSON.stringify convention)', () => {
    expect(canonicalJson([1, undefined, 3])).toBe('[1,null,3]');
  });

  it('encodes top-level undefined as null', () => {
    expect(canonicalJson(undefined)).toBe('null');
  });
});

describe('sha256Hex / hashCanonical', () => {
  it('matches the empty-string SHA-256 test vector', () => {
    expect(sha256Hex('')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
  });

  it('matches the NIST "abc" SHA-256 test vector', () => {
    expect(sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('hashCanonical is sha256 of canonicalJson', () => {
    const value = { b: 2, a: 1 };
    expect(hashCanonical(value)).toBe(sha256Hex(canonicalJson(value)));
    expect(hashCanonical({ a: 1, b: 2 })).toBe(hashCanonical({ b: 2, a: 1 }));
  });
});
