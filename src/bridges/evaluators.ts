/**
 * Bridge-evaluator registry — the single dispatch surface for `upt evaluate`.
 *
 * The closed-form + Schwarzschild-spacetime bridges (BE-51/52/55…65) carry plain-JS
 * evaluators but were, until now, unreachable from the CLI (`upt eval` is
 * user-formula-only; `upt explain <be-NN>` even redirected to a capability that did
 * not exist). This registry maps each bridge id to its evaluator, its input keys,
 * and a typed `run`, so `upt evaluate be-63 mu_e=2` returns M_Ch ≈ 1.44 M_⊙.
 *
 * @module bridges/evaluators
 */
import { evaluateGravitationalLensing } from './gravitational-lensing.js';
import { evaluatePerihelionPrecession } from './perihelion-precession.js';
import { evaluateQuantumHall } from './be55-quantum-hall.js';
import { evaluateCasimir } from './be56-casimir.js';
import { evaluateUnruh } from './be57-unruh.js';
import { evaluateJohnsonNyquist } from './be58-johnson-nyquist.js';
import { evaluateACJosephson } from './be59-ac-josephson.js';
import { evaluateFractionalQH } from './be60-fractional-qh.js';
import { evaluateWiedemannFranz } from './be61-wiedemann-franz.js';
import { evaluateBCSGap } from './be62-bcs-gap.js';
import { evaluateChandrasekharMass } from './be63-chandrasekhar-mass.js';
import { evaluateEddingtonLuminosity } from './be64-eddington-luminosity.js';
import { evaluateJeansMass } from './be65-jeans-mass.js';

/** A callable bridge evaluator with its input contract. @public */
export interface EvaluatorSpec {
  readonly bridgeId: number;
  readonly name: string;
  /** Required numeric input keys (all must be supplied). */
  readonly inputKeys: readonly string[];
  /** Evaluate with a validated input record; returns the evaluator's result object. */
  run(inputs: Readonly<Record<string, number>>): unknown;
}

/** @internal */
function spec(
  bridgeId: number,
  name: string,
  inputKeys: readonly string[],
  run: (i: Record<string, number>) => unknown,
): EvaluatorSpec {
  return { bridgeId, name, inputKeys, run };
}

/** Bridge id → evaluator. @public */
export const BRIDGE_EVALUATORS: ReadonlyMap<number, EvaluatorSpec> = new Map(
  [
    spec(51, 'Gravitational lensing (Eddington)', ['M_kg', 'b_m'], (i) =>
      evaluateGravitationalLensing({ M_kg: i.M_kg, b_m: i.b_m }),
    ),
    spec(52, 'Perihelion precession (Einstein)', ['M_kg', 'a_m', 'e', 'T_yr'], (i) =>
      evaluatePerihelionPrecession({ M_kg: i.M_kg, a_m: i.a_m, e: i.e, T_yr: i.T_yr }),
    ),
    spec(55, 'Integer quantum Hall / TKNN', ['C'], (i) => evaluateQuantumHall({ C: i.C })),
    spec(56, 'Casimir effect', ['d_m'], (i) => evaluateCasimir({ d_m: i.d_m })),
    spec(57, 'Unruh effect', ['a_m_s2'], (i) => evaluateUnruh({ a_m_s2: i.a_m_s2 })),
    spec(58, 'Johnson-Nyquist noise', ['T_K', 'R_ohm'], (i) =>
      evaluateJohnsonNyquist({ T_K: i.T_K, R_ohm: i.R_ohm }),
    ),
    spec(59, 'AC Josephson', ['V_volts'], (i) => evaluateACJosephson({ V_volts: i.V_volts })),
    spec(60, 'Fractional quantum Hall', ['nu'], (i) => evaluateFractionalQH({ nu: i.nu })),
    spec(61, 'Wiedemann-Franz', ['sigma_S_per_m', 'T_K'], (i) =>
      evaluateWiedemannFranz({ sigma_S_per_m: i.sigma_S_per_m, T_K: i.T_K }),
    ),
    spec(62, 'BCS gap ratio', ['T_c_K'], (i) => evaluateBCSGap({ T_c_K: i.T_c_K })),
    spec(63, 'Chandrasekhar mass', ['mu_e'], (i) => evaluateChandrasekharMass({ mu_e: i.mu_e })),
    spec(64, 'Eddington luminosity', ['M_kg'], (i) => evaluateEddingtonLuminosity({ M_kg: i.M_kg })),
    spec(65, 'Jeans mass', ['T_K', 'rho_kg_per_m3', 'mu'], (i) =>
      evaluateJeansMass({ T_K: i.T_K, rho_kg_per_m3: i.rho_kg_per_m3, mu: i.mu }),
    ),
  ].map((s) => [s.bridgeId, s]),
);

/**
 * Evaluate a bridge by id with a numeric input record. Throws on an unknown id
 * or a missing required input (the evaluator itself validates ranges).
 *
 * @public
 */
export function evaluateBridge(
  bridgeId: number,
  inputs: Readonly<Record<string, number>>,
): unknown {
  const s = BRIDGE_EVALUATORS.get(bridgeId);
  if (!s) {
    throw new Error(
      `evaluateBridge: be-${bridgeId} has no evaluator (only closed-form + spacetime bridges do — see \`upt evaluate\` with no args)`,
    );
  }
  const missing = s.inputKeys.filter((k) => !(k in inputs) || !Number.isFinite(inputs[k]));
  if (missing.length) {
    throw new Error(
      `evaluateBridge: be-${bridgeId} (${s.name}) needs {${s.inputKeys.join(', ')}}; missing/non-finite: ${missing.join(', ')}`,
    );
  }
  return s.run(inputs);
}
