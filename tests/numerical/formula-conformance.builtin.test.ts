/**
 * Path B (self-contained) parser against the shared formula-conformance
 * suite. This always runs — the built-in parser has no optional deps.
 */
import { runFormulaConformance } from './formula-conformance.js';
import { defaultFormulaParser } from '../../src/numerical/formula.js';

runFormulaConformance(defaultFormulaParser, 'builtin');
