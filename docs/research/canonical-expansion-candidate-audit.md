# Canonical L-Layer Expansion — Monomial-Fit Candidate Audit

**Date:** 2026-07-03 · **Gating Task-0** for the L-layer expansion
(`docs/superpowers/specs/2026-07-03-canonical-l-layer-expansion-design.md`, r2).
Purpose: classify the standard textbook laws in each target area by whether they
fit the L0 monomial model, yielding the HONEST monomial-compliant count + the
executable batch list. Non-monomials are logged as the L1-sum/L2 backlog, NOT
force-fit (the vet's core correction).

**Legend:** ✅ monomial (fully-quantitative) · ½ monomial-with-prefactor
(`scalar-up-to-constant`) · √ fractional-monomial (`dimensional`) · ❌
NON-monomial → L1-sum/L2 backlog · ⟳ likely duplicate of an existing entry.

## Classification by area

**Fluids (NEW domain — high yield):** ✅ ρgh (hydrostatic P) · ✅ Q=Av
(continuity/flow) · ✅ Re=ρvL/μ · ½ F=6πμrv (Stokes) · ½ Q=πr⁴ΔP/8μL
(Poiseuille) · ✅ F=ρVg (buoyancy) · ½ ΔP=2γ/r (Laplace) · ½ q=½ρv² (dynamic
pressure — the monomial *term* of Bernoulli) · ✅ τ=μ(dv/dy) (shear stress).
❌ Bernoulli (sum). **→ 8 monomial.**

**Condensed-matter (NEW domain — highest yield; PILOT batch):** √ E_F (Fermi
energy) · ✅ R_H=1/nq (Hall) · ✅ V_H=IB/nqt · ✅ v_d=I/nqA (drift) · ✅ σ=nqμ
(conductivity) · ✅ ρ=m/nq²τ (Drude resistivity) · √ ω_p=√(nq²/ε₀m) (plasma
freq) · ✅ ω_c=qB/m (cyclotron) · ✅ μ=qτ/m (mobility) · ✅ ω_D (Debye, ∝ v_s/a).
**→ 10 monomial, 0 non-monomial — the clean pilot.**

**Nuclear (NEW domain):** ½ t½=ln2/λ (half-life) · ✅ A=λN (activity) · ✅
R=nσvN (reaction rate) · √ R=r₀A^⅓ (nuclear radius) · ⟳ E=Δmc² (mass-energy,
= existing rest-energy). ❌ N=N₀e^−λt (decay, exp) · ❌ Q=(mᵢ−mf)c² (difference)
· ❌ SEMF (sum). **→ 4 monomial.**

**Thermodynamics (expand existing):** ✅ Q=mcΔT · ✅ P=NkT/V (ideal gas) · ✅
j=σT⁴ (Stefan-Boltzmann) · ✅ λ_max=b/T (Wien) · ✅ Q=mL (latent heat) · ✅
ΔL=αL₀ΔT (thermal expansion) · ✅ ΔS=Q/T (Clausius) · ✅ Q/t=kAΔT/L (conduction).
❌ η=1−T_c/T_h (Carnot, difference). **→ 8 monomial.**

**EM (expand existing):** ✅ F=kq₁q₂/r² (Coulomb) · ✅ E=kq/r² · ✅ C=ε₀A/d ·
½ U=½CV² · ½ u=½ε₀E² · ✅ τ=RC · √ ω=1/√(LC) · ½ P=q²a²/6πε₀c³ (Larmor) · ✅
B=μ₀I/2πr (wire field) · ✅ S=EB/μ₀ (Poynting). ⟳ V=IR, P=IV (likely exist).
**→ 10 monomial.**

**Waves & oscillation (→ fold into `mechanics`):** ✅ v=fλ · ½ ω=2πf · ✅ T=1/f
· √ v=√(T/μ) (string) · √ v=√(B/ρ) (sound) · ½ E=½kA² (oscillator energy) · ✅
fₙ=nv/2L (harmonics) · ✅ Q=ω₀τ (quality factor). ⟳ pendulum/SHM T=2π√(L/g)
(exists). ❌ Doppler (ratio of sums) · ❌ beat=|f₁−f₂|. **→ 7 monomial.**

**Statistical mechanics (expand existing):** ½ ½kT (equipartition per DOF) · √
v_p=√(2kT/m) (MB peak speed) · ½ λ=1/√2nσ (mean free path) · ✅ D=kT/6πμr
(Einstein diffusion) · ½ P=⅓nm⟨v²⟩ (kinetic pressure). ❌ e^−E/kT (Boltzmann
factor, exp). **→ 5 monomial.**

**Atomic (→ fold into `quantum`):** ✅ λ=h/p (de Broglie) · ✅ a₀=ε₀h²/πme²
(Bohr radius) · ✅ Eₙ=−me⁴/8ε₀²h²n² (Bohr energy, ∝ n⁻²) · ✅ α=e²/4πε₀ℏc
(fine-structure) · ✅ E=hc/λ (photon energy). ⟳ E=hf (Planck, likely exists) ·
❌ Rydberg (difference) · ❌ K=hf−W (photoelectric) · ❌ Δλ∝(1−cosθ) (Compton).
**→ 5 monomial.**

**Optics (→ fold into `electromagnetism`; low yield):** ✅ n=c/v · ✅ m=hᵢ/hₒ
(magnification) · ½ θ=1.22λ/D (Rayleigh) · ✅ Δy=λL/d (fringe spacing). ❌ Snell,
thin-lens (sum), lensmaker, Bragg, grating, critical-angle, Malus (all
sine/sum). **→ 4 monomial.**

**Relativity (existing domain — DROP as a batch):** every candidate is the
γ=1/√(1−v²/c²) family or E²=(pc)²+(mc²)² — all ❌ NON-monomial. ⟳ E=mc² exists.
**→ 0 new monomial. Batch dropped.**

## Result

**~61 genuine monomial candidates** (before de-dup against the existing 66;
expect ~50–55 net after removing overlaps): fluids 8, condensed-matter 10,
nuclear 4, thermo 8, EM 10, waves 7, stat-mech 5, atomic 5, optics 4. This
**confirms the vet's ~50–70 estimate** and refutes r1's ~110.

**New `CanonicalDomain` values (3, not 6):** `fluids`, `nuclear`,
`condensed-matter` — each has a distinct, non-trivial monomial yield.
`waves`→mechanics, `optics`→electromagnetism, `atomic`→quantum,
`relativity`→existing (dropped). Minimal enum change.

**Executable batches (SDD, one per implementer + per-batch Adam+Eve physics
review of the governing sets, PILOT = condensed-matter first):**
condensed-matter (10) → fluids (8) → EM-expand (10) → thermo-expand (8) →
waves-into-mechanics (7) → atomic-into-quantum (5) → stat-mech-expand (5) →
nuclear (4) → optics-into-EM (4).

**L1-sum / L2 backlog (real physics, NOT force-fit into L0 — a separate later
tier):** Bernoulli, Carnot efficiency, Rydberg, photoelectric, Compton,
radioactive-decay exp, Boltzmann factor, Planck's law, Snell/Bragg/grating/
Malus, thin-lens/lensmaker, Doppler (classical + relativistic), the full
relativistic γ-family (E², time dilation, length contraction, p=γmv, E=γmc²),
Q-value, SEMF. These are where the L1-sum / L2 field-equation tier earns its
place; logged here so they are not lost.

## Execution addendum (2026-07-03) — a THIRD "doesn't fit L0" class found during encoding

Two exclusion rules the initial audit missed, surfaced by the Buckingham engine
during the pilot + fluids batches (both catches made BEFORE bad entries shipped):

1. **Hidden multiple length scales** (Poiseuille `Q=πr⁴ΔP/8μL`): two lengths
   `r`, `L` at different powers — dimensional analysis sees only total length, so
   the r⁴/L split is a free dimensionless group (r/L). Not a monomial. Excluded.
2. **Dimensionless targets** (Reynolds `Re=ρvL/μ`; **also the fine-structure
   constant α and optical magnification**): a dimensionless target built from a
   dimensionless governing group has an **unpinnable exponent** (Re, Re², 1/Re
   all dimensionless) → `freeDimensionlessGroups=1`, `monomial=null`. Any named
   dimensionless NUMBER fails the monomial test. Excluded.

**Batch re-scoping from these rules:**
- **fluids: 4 landed** (continuity, shear-stress, Laplace, dynamic-pressure),
  domain `'mechanics'` (NOT a new `fluids` domain — the codebase folds fluids
  into mechanics). Reynolds + Poiseuille → backlog.
- **atomic: drop the fine-structure constant α** (dimensionless target) → ~4 net.
- **optics: drop magnification** (dimensionless ratio h_i/h_o) → ~3 net; optics
  yield is now very thin (n=c/v, Rayleigh, fringe-spacing).
- Net total revises DOWN from ~50 toward **~45**. This is honest: the monomial
  L0 model is narrower than the raw textbook-law count in three distinct ways
  (sums/transcendentals, hidden scales, dimensionless numbers).

## Honest note

Optics and relativity are dominated by non-monomial (sine / γ) laws — the
monomial L-layer genuinely cannot represent most of classical optics or special
relativity without the higher tier. That is a real, documented boundary of the
L0 model, surfaced by this audit rather than papered over. The expansion
delivers a comprehensive *monomial-law* reference (~50–55 new, tripling the
clean-monomial L-layer) and an explicit backlog for the non-monomial physics.
