/**
 * Wave P-D R-D2 (2026-05-06): BE-25 Consciousness — Information Integration
 * Bridge reformulated to the canonical Integrated Information Theory (IIT,
 * Tononi) Φ_max form:
 *
 *   Φ_max(S) = min over partitions θ of [ ii(s, s̃) - ii_θ(s, s̃) ]
 *   ii(s, s̃) = p(s̃ | s) log₂ [ p(s̃ | s) / p(s̃) ]
 *
 * Replaces tests/bridges/be-25-r3-disposition.test.ts (deleted). The
 * Tegmark-falsified Penrose-Hameroff Orch-OR form t_OR = ℏ/(Δm c² Δx/ℓ_P)
 * is fully dropped; IIT is substrate-agnostic and makes no claim about
 * microtubule quantum coherence, so the Tegmark and McKemmish
 * falsifications are moot under this reformulation.
 *
 * Honest-archaeology pattern (Wave-G/I.B/P-A/P-B/P-C/P-D-R-D1 precedent):
 * when a bridge equation undergoes a disposition change (here: R3 invalid
 * → reformulation landed using canonical literature form), the prior
 * disposition-pinning tests are deleted and replaced.
 *
 * Canonical references: Tononi 2008 *Biol. Bull.* 215:216 (original IIT);
 * Oizumi, Albantakis & Tononi 2014 *PLoS Comput. Biol.* 10:e1003588 (IIT
 * 3.0 — calculable Φ); Albantakis et al. 2023 *PLoS Comput. Biol.*
 * 19:e1011465 (IIT 4.0, arXiv:2212.14787).
 *
 * Honest-claude flag: WebFetch on arXiv:2212.14787 (IIT 4.0 preprint)
 * returned only abstract content (axiom-postulate framework); WebFetch on
 * Wikipedia "Integrated information theory" / "Phi (integrated
 * information theory)" provided the canonical Φ-via-MIP formula and the
 * intrinsic-information form ii(s,s̃) = p(s̃|s) log₂[p(s̃|s)/p(s̃)]. The
 * earth-mover's-distance / Wasserstein-metric specific computation in IIT
 * 3.0 follows the canonical PLoS Comput. Biol. paper rather than a fresh
 * WebFetch.
 *
 * Important: Part-IV §12.3, Part-V §21.2.2, Part-VI §28.2 (excised in
 * Wave L Tier B3 because BE-25 was Penrose-Hameroff) are NOT restored
 * under this IIT reformulation; those original sections were tied to
 * the Penrose-Hameroff cosmic-consciousness / clinical-application
 * framings. IIT-clinical applications (PCI etc.) are outside UPT scope.
 */
import { describe, it, expect } from 'vitest';
import { expectBridgeInIndex, expectHasReformulationIssue } from './_helpers.js';

describe('BE-25 Consciousness — IIT Φ_max integrated information (Wave P-D R-D2 reformulation)', () => {
  it('exists in the index', () => {
    expectBridgeInIndex(25);
  });

  it("status is now 'speculative' (IIT canonical and calculable; bridge framing speculative)", () => {
    expectBridgeInIndex(25, 'speculative');
  });

  it('name reflects the IIT Φ reformulation (drops Penrose-Hameroff Orch-OR / Quantum Information framing)', () => {
    const entry = expectBridgeInIndex(25);
    expect(entry.name).toMatch(/IIT|Information Integration|integrated information/i);
    expect(entry.name).not.toMatch(/Quantum Information/);
  });

  it('formula_latex contains the canonical IIT Φ_max minimum-information-partition form', () => {
    const entry = expectBridgeInIndex(25);
    // Φ_max
    expect(entry.formula_latex).toMatch(/\\Phi_\{?\\?max\}?|Phi_.*max/);
    // min over partitions
    expect(entry.formula_latex).toMatch(/\\min|min_.*partition/);
    // intrinsic-information ii(s, s̃) component
    expect(entry.formula_latex).toMatch(/ii\(s/);
  });

  it('formula_latex contains the intrinsic-information form ii(s,s̃) = p(s̃|s) log₂[p(s̃|s)/p(s̃)]', () => {
    const entry = expectBridgeInIndex(25);
    // Conditional probability p(s̃|s)
    expect(entry.formula_latex).toMatch(/p\(\\tilde\{s\}\s*\\mid\s*s\)|p\(.*tilde.*s.*mid.*s/);
    // log_2
    expect(entry.formula_latex).toMatch(/\\log_2|log_\{?2\}?/);
    // Marginal p(s̃)
    expect(entry.formula_latex).toMatch(/p\(\\tilde\{s\}\)|p\(.*tilde.*s.*\)/);
  });

  it('does not retain the Tegmark-falsified Penrose-Hameroff Orch-OR form', () => {
    const entry = expectBridgeInIndex(25);
    // No t_OR
    expect(entry.formula_latex).not.toMatch(/t_\{?\\?text\{?OR\}?\}?/);
    // No spurious Δm c² Δx / ℓ_P expression
    expect(entry.formula_latex).not.toMatch(/\\Delta\s*m\s*c\^2/);
    expect(entry.formula_latex).not.toMatch(/l_P|ell_P|\\ell_P/);
    // No E_G gravitational self-energy
    expect(entry.formula_latex).not.toMatch(/E_G/);
  });

  it('references include Tononi 2008, Oizumi-Albantakis-Tononi 2014 (IIT 3.0), and IIT 4.0 (arXiv:2212.14787)', () => {
    const entry = expectBridgeInIndex(25);
    const refs = entry.references.join(' | ');
    expect(refs).toMatch(/Tononi 2008|Biol\.\s*Bull\.\s*215/);
    expect(refs).toMatch(/Oizumi.*Albantakis.*Tononi 2014|IIT 3\.0|PLoS Comput\. Biol\./);
    expect(refs).toMatch(/2212\.14787|IIT 4\.0|Albantakis.*2023/);
  });

  it('references include the contested-framework citations (Aaronson 2014 / Doerig 2019 unfolding argument)', () => {
    const entry = expectBridgeInIndex(25);
    const refs = entry.references.join(' | ');
    expect(refs).toMatch(/Aaronson 2014|integrated information theorist/);
    expect(refs).toMatch(/Doerig|unfolding/i);
  });

  it('references retain the Penrose-Hameroff and Tegmark citations as historical / moot context', () => {
    const entry = expectBridgeInIndex(25);
    const refs = entry.references.join(' | ');
    expect(refs).toMatch(/Penrose.*Hameroff 1996|Orch-OR/i);
    expect(refs).toMatch(/Tegmark 2000|quant-ph\/9907009/);
  });

  it('notes record the 2026-05-06 reformulation under Wave P-D R-D2', () => {
    const entry = expectBridgeInIndex(25);
    expect(entry.notes).toMatch(/Reformulated 2026-05-06/);
    expect(entry.notes).toMatch(/Wave P-D/);
  });

  it('notes commit to the substrate-agnostic IIT framing (drops the consciousness ↔ quantum information framing)', () => {
    const entry = expectBridgeInIndex(25);
    expect(entry.notes).toMatch(/IIT|Tononi|integrated information/i);
    expect(entry.notes).toMatch(/substrate-agnostic|substrate.agnostic/i);
  });

  it('notes document that downstream Part-IV §12.3 / Part-V §21.2.2 / Part-VI §28.2 excisions are NOT restored', () => {
    // The excisions tied to Penrose-Hameroff stay excised; IIT-based clinical
    // applications are outside UPT scope under this reformulation.
    const entry = expectBridgeInIndex(25);
    expect(entry.notes).toMatch(/Part-IV.*12\.3|Part-V.*21\.2\.2|Part-VI.*28\.2/);
    expect(entry.notes).toMatch(/not restored|NOT restored|outside.*scope/i);
  });

  it('notes acknowledge that Tegmark / McKemmish Orch-OR falsifications are moot under IIT (substrate-agnostic, no quantum-coherence claim)', () => {
    const entry = expectBridgeInIndex(25);
    expect(entry.notes).toMatch(/Tegmark/);
    expect(entry.notes).toMatch(/moot|substrate-agnostic|substrate.agnostic|no claim/i);
  });

  it('tractability_class is numerical-asymptotic (Wave Q B1, per CS iter-6 C1: Φ_max IS computable, just exponential — EXPTIME, not non-Turing-computable)', () => {
    const entry = expectBridgeInIndex(25);
    expect(entry.tractability_class).toBe('numerical-asymptotic');
  });

  it('notes record the Wave Q B1 tractability_class fix (CS iter-6 C1)', () => {
    const entry = expectBridgeInIndex(25);
    expect(entry.notes).toMatch(/Wave Q B1|CS iter-6 C1/);
    expect(entry.notes).toMatch(/EXPTIME|numerical-asymptotic|computable/i);
  });

  it('known_issues retains a phenomenological-ansatz / reformulation entry for the bridge framing', () => {
    const entry = expectBridgeInIndex(25);
    expectHasReformulationIssue(entry);
  });

  it('honest-claude: the WebFetch limitation on arXiv:2212.14787 abstract-only return is documented in notes', () => {
    const entry = expectBridgeInIndex(25);
    expect(entry.notes).toMatch(/Honest-claude|WebFetch/i);
  });
});
