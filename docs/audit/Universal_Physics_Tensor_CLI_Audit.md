# Universal Physics Tensor: an applied physicist’s CLI exploration

**Audit date:** 26 September 2026  
**Audience:** Daniel Simon Jr.  
**CLI version observed:** 0.47.1  
**Repository:** danielsimonjr/universal-physics-tensor  
**Checkout:** `/workspace/scratch/7985fde4bcdf/universal-physics-tensor`  
**Output directory:** `/root/docs/audit` (`~/docs/audit` in this execution environment)  
**Method:** black-box use of the documented `upt` command-line interface.

## 1. Executive assessment

The repository is useful as a **physics relationship laboratory**, especially when it exposes the assumptions, transformations, error norms, counterexamples, and time horizons behind a connection. Its strongest demonstration is the qualified atlas: the difference between an exact normalized spring–LC correspondence, a small-angle pendulum approximation, an overdamped diffusion limit, and an imaginary-time Schrödinger continuation is made explicit.

This session did **not** establish a new physical law, experimentally validate the repository, or demonstrate universal coverage of physics. It did establish that the CLI can navigate a substantial collection, calculate physically meaningful examples, reject selected incorrect equations and out-of-regime requests, and reproduce a known dimensional scaling without falsely calling it novel.

The main limitations observed are equally concrete:

1. The equation graph, bridge catalog, and qualified model atlas cover different populations. Their counts must not be treated as interchangeable.
2. Shared-quantity connectivity is not physical equivalence. Even the deliberately invalid equation `period = mass` joins an anchored cluster, while correctly receiving a dimensional mismatch and exit code 3.
3. Discovery rankings still elevate many dimensional coincidences with no tested mechanism or data. Zero numerical contradictions does not validate all candidate identifications.
4. `path` cannot traverse cross-family connections, even when `atlas` explicitly lists the desired bridge.
5. The active MathTS expression parser rejects the documented `ln` function. `log` works for the tested natural logarithm.
6. A formal-proof label covers only its quoted theorem. In the pendulum record it does not certify the numerical error bound or validity horizon.
7. The empirical confrontation collection mixes stringent, moderate, and loose checks. It contains literature summaries and non-exclusion checks, not 19 equivalent independent confirmations.
8. Some physical qualifications remain prose rather than machine-evaluated conditions. “VACUOUS” means no inequality was checked; it does not mean every physical premise is true.

**Applied-physics verdict:** use the CLI to organize models, expose assumptions, compute examples, and identify questions worth investigating. Treat candidate discovery as hypothesis generation. The qualified atlas is more immediately useful for engineering reasoning than the unqualified ranking of same-dimension quantities.

## 2. Scope, evidence, and reproducibility

### 2.1 What was and was not accessed

The README and CLI guide had been read before the user imposed the CLI-only restriction. After that restriction, all substantive repository exploration in this audit used `node bin/upt.mjs …`. No source files, tests, internal APIs, or library modules were inspected to obtain physics findings. No website or external physics literature was consulted. Source citations below are citations **reported by the CLI**, not papers retrieved and verified in this session.

Shell/Python orchestration was used solely to launch the CLI, capture stdout/stderr and exit codes, summarize those captured outputs, and write this report. It did not import the physics library or calculate an independent physics model. Numerical cross-checks used explicit formulas through `upt eval`, thereby remaining inside the requested interface. These checks exercise a second CLI route; they are not independent software implementations or experimental replications.

The initial `upt version` invocation failed because the checkout lacked its built package. The diagnostic requested `npm run build`. Setup used:

```bash
npm install --ignore-scripts --package-lock=false --no-audit --no-fund
npm run build
```

Installation added 106 packages and completed successfully; the build completed successfully. The environment reported Node v24.19.0 and npm 11.9.0. No physics implementation was edited. Installation did not use a frozen lockfile, so exact dependency resolution is a reproducibility limitation. The parser identified itself as `mathts` in the later `--debug` checks. The initial registry check was an installation connectivity check, not external physics research.

The checkout had previously been verified at commit `c2c9dfce905f14f2cce48526bab1417b38c62541`. That provenance comes from the preceding checkout operation, not from a new Git inspection during this CLI-only audit.

### 2.2 Evidence hierarchy used in this report

| Evidence category | What it supports | What it does not support |
|---|---|---|
| Live CLI calculation | The observed numerical behavior for the supplied inputs | Universal accuracy or experimental truth |
| Explicit-formula `eval` cross-check | Agreement between the exposed evaluator and a separately entered formula | Independence from the same runtime/constants |
| Positive/negative control pair | The selected check accepts the intended case and rejects the chosen wrong case | Exhaustive validation of all possible inputs |
| `atlas` witness descriptions | The package reports specific witnesses and counterexamples | Those tests were rerun here |
| `atlas` formal reference | A recorded theorem with stated scope and axioms | The entire bridge or bound was proved here |
| `confront` output | The package’s committed comparison and its stated sources | Fresh raw-data analysis or current literature completeness |
| Discovery output | An algebraic or structural hypothesis worth reviewing | A discovered physical law |
| Physicist interpretation | Reasoning about the displayed equations and assumptions | Additional empirically verified evidence |

### 2.3 Companion files

- `upt-cli-session.jsonl`: complete machine-readable command records, including UTC timestamps, argument arrays, exit codes, stdout, and stderr.
- `UPT_CLI_Transcript.md`: readable command transcript, including negative and failed attempts.
- `canonical-physics-map.mmd`: canonical map produced directly by `upt map`.
- `combined-physics-map.svg`: combined map produced directly by `upt map`.
- `cli-json-capture.txt`: raw capture of the later JSON-oriented batch.

Command identifiers in the generated index at the end of this report point to the same identifiers in the transcript. Parallel independent batches may interleave by completion order; the timestamp records should be used when reconstructing timing. The report does not infer physical significance from execution timing.

## 3. What universe is actually represented?

### 3.1 Three different views

| View | Live result | Interpretation |
|---|---:|---|
| Canonical registry | 107 entries | Registered standard-physics representations |
| Canonical quantity graph | 107 edges, 23 components; 74 edges reported to compose into chains | Connectivity through shared quantities |
| Combined quantity graph | 148 edges, 40 components; 113 edges reported to compose into chains | Canonical graph plus catalog graph representations |
| Catalog grounding inventory | 55 bridges | Catalog entries classified by available grounding |
| Qualified atlas | 20 bridges across 3 families | Explicit model-to-model transformations and qualifications |
| Closed-form `evaluate` menu | 13 bridge models | Direct numerical evaluator coverage through this command |

Evidence: `canonical --vars`, `canonical --json`, `map --source=canonical`, `map --source=both`, `coverage`, `atlas`, and `evaluate`.

The combined graph’s largest component contains 100 edges: 84 labeled law, 5 established, 9 speculative, and 2 highly speculative. There are 33 isolated edges. The canonical graph’s largest component contains 83 law edges; two further components contain two edges each, and 20 edges are isolated.

A graph component is a statement about this representation. An isolated first-law-of-thermodynamics entry is not a claim that thermodynamics is physically disconnected from mechanics. Likewise, combining catalogs can increase both the number of edges and the number of components because it adds isolated content.

### 3.2 Breadth and fidelity

The canonical JSON contains 32 mechanics, 20 electromagnetism, 17 quantum, 9 statistical, 9 thermodynamics, 9 condensed-matter, 6 general-relativity, 2 gravitation, 2 cosmology, and 1 information entries. These are the registry’s own categories, not mutually complete divisions of nature.

Its `epistemicStatus` fields count 63 `fully-quantitative`, 27 `scalar-up-to-constant`, and 17 `dimensional` entries. The text interface additionally uses L0/L1/L2 fidelity language. These two labeling systems should not be silently equated: representation fidelity and quantitative completeness are distinct questions.

Specific qualifications matter:

- The canonical Lorentz-force entry is the perpendicular magnetic-force magnitude, `F = qvB`, with `v ⟂ B` explicitly assumed. It is not the full vector electric-plus-magnetic Lorentz force.
- The uncertainty entry explicitly says it represents a **lower bound**, and its scalar AST is the saturating case, not a universal equality.
- The Jarzynski entry displays the ensemble-exponential expression but is `scalar-up-to-constant`. Its work-distribution dependence must not disappear into a harmless-looking scalar coefficient.
- The Einstein field equation is displayed as a field equation. That does not demonstrate that the CLI solves arbitrary spacetime geometries.
- `explain schrodinger-equation --source=canonical` reports NOT COVERED because that name is not a quantity in that graph. This is a query-surface limitation, not evidence that Schrödinger physics is absent: the atlas explicitly includes the free Schrödinger model.

The complete CLI-exported canonical inventory, including assumptions and source references, is appended below.

## 4. Journey I — mechanics, circuits, and controlled approximation

### 4.1 A spring and an LC circuit

The atlas supplies the force–voltage mapping:

\[
m\leftrightarrow L,\qquad k\leftrightarrow 1/C,\qquad x\leftrightarrow q.
\]

The mechanical and electrical equations can then be understood as

\[
m\ddot x+kx=0,\qquad L\ddot q+q/C=0,
\]

with characteristic frequencies

\[
\omega_s=\sqrt{k/m},\qquad \omega_{LC}=1/\sqrt{LC}.
\]

`atlas ab-spring-lc` calls this exact equivalence after normalization, with positive parameters, lossless/unforced dynamics, and nonzero amplitude scales. It preserves the normalized frequency, energy up to scale, and phase portrait. It explicitly does not preserve physical interpretation or units.

Two independent formula entries through `eval` gave:

| System | Parameters | Angular frequency |
|---|---|---:|
| Mechanical | m = 2, k = 8 | 2 rad/s |
| Electrical | L = 2, C = 0.125 | 2 rad/s |

`path model-spring model-lc` reports exact equivalence with K = 1 and delta = 0, but no checked regime inequality. The zero is the encoded identity under the mapping, not a measured engineering error budget.

**Applied use:** a normalized transient or resonance calculation can be transferred between mechanical and electrical models after specifying the mapping. The analogy does not manufacture a physical transducer or erase different units.

For damped systems, `atlas ab-damped-rlc` adds `b ↔ R` and requires equal damping ratios:

\[
\zeta_m=\frac{b}{2\sqrt{mk}},\qquad
\zeta_e=\frac R2\sqrt{\frac CL}.
\]

That equality is a necessary part of the bridge. Simply matching natural frequencies is insufficient.

### 4.2 A pendulum becomes a harmonic oscillator only in a regime

The transformation is `sin θ → θ`, with `x ↔ ℓθ` and `ω₀² = g/ℓ`. The atlas’s domain is θ₀ ≤ 0.5 rad. Its bound concerns **relative period error**, not a trajectory norm valid for unlimited time.

For a one-metre pendulum at g = 9.81 m/s², `eval` gives the small-angle period

\[
T_0=2\pi\sqrt{\ell/g}=2.0060666807106475\ \mathrm{s}.
\]

The separate `path` experiment used T₀ = 1 as its time-scale input; it was not the same one-metre setup:

| Path inputs | Reported pointwise period error | Regime | Horizon | Exit |
|---|---:|---|---|---:|
| θ₀ = 0.2, T₀ = 1, t = 10 | 0.002505744228602058 | Holds | Holds | 0 |
| θ₀ = 0.2, T₀ = 1, t = 1000 | Same | Holds | Violated | 3 |

The domain-wide bound is 0.015852531101436806; the pointwise value is about 0.2506%. The machine horizon is `t < 4T₀/θ₀²`, giving 100 in the chosen time units. The atlas records a counterexample in which approximately 100 cycles accumulate approximately π/2 phase drift.

**Physical lesson:** a small frequency or period error can accumulate into a large phase error. A resonator model suitable for a few cycles can fail a long coherent timing task.

The pendulum record reports a formal reference, but explicitly limits it to the correspondence of the linearized equation and a harmonic-oscillator construction. The reference has fidelity `sanity-lemmas` and does **not** certify the error bound, regime, or horizon. No Lean proof was executed here.

### 4.3 Composition is conservative

`path model-pendulum model-lc` finds two steps—approximation then exact equivalence—but reports **no composite claim** and supplies no composite bound. This is an implementation coverage limit in the composition table, not evidence that physical reasoning cannot relate a small-angle pendulum to an LC circuit. The refusal is preferable to inventing a bound, but it blocks an otherwise natural user journey.

### 4.4 The overdamped limit loses initial information

`atlas ab-damped-massless` drops `m x″`, reducing the order of the equation. It requires `mk/b² < 1/4` and observation outside the initial boundary layer, `t ≥ 5m/b`. The displayed bound is tied to witness normalization `b = k = 1` and `|v₀| ≤ 5`.

This reduction discards the independent initial velocity and the fast relaxation mode. Its recorded counterexample gives an O(1) velocity error inside the boundary layer. For a control-system application, this is a warning to separate settling-time behavior from initial transients rather than extending a first-order model to all times.

## 5. Journey II — transport, Brownian motion, heat, and waves

### 5.1 Microscopic steps to macroscopic diffusion

`ab-walk-diffusion` uses

\[
D=\frac{\Delta x^2}{2\Delta t},\qquad \langle x^2\rangle=2Dt,
\]

for a symmetric unbiased walk in the many-step limit. It preserves total probability and mean-square displacement, but loses lattice parity and the finite propagation limit at fixed step size. The recorded counterexample places the walker outside its reachable lattice sites while the continuum diffusion kernel remains positive there.

`ab-langevin-diffusion` makes a different reduction: for times much longer than momentum relaxation, `t ≫ m/γ`, it gives

\[
D=\frac{k_BT}{\gamma}.
\]

The machine criterion is `m/(γt) ≤ 0.01`. The original Langevin model has a short-time ballistic regime; the reduced diffusion model does not retain velocity as a state variable. The CLI’s preservation list mentions equilibrium velocity variance, but that should be read as an inherited relation of the parent model, not a velocity distribution dynamically represented by a position-only diffusion equation.

### 5.2 Stokes–Einstein connects fluid drag to molecular agitation

Combining `γ = 6πηa` with the Einstein relation produces

\[
D=\frac{k_BT}{6\pi\eta a}.
\]

`atlas ab-stokes-einstein` states low Reynolds number, no slip, and overdamped observation times. It encodes Re ≤ 0.1 and `m/(γt) ≤ 0.01`, identifying these as chosen numerical interpretations of “much less than.”

For T = 293.15 K, η = 0.001 Pa·s, and radius a = 1 μm, `eval` gives **2.1471978227748074 × 10⁻¹³ m²/s**. Using a = 0.5 μm gives **4.294395645549615 × 10⁻¹³ m²/s**.

The witness prose says “a 1 µm sphere” yields approximately 4.29 × 10⁻¹³ m²/s. That value matches a one-micrometre **diameter** under these supplied parameters, rather than a one-micrometre radius. This is an exposed wording ambiguity, not a proven evaluator defect. The witness’s full input set was not available through that text and its test was not opened. For reproducibility the CLI should state radius, diameter, temperature, and viscosity explicitly.

### 5.3 Heat and concentration can share an operator

`ab-heat-diffusion` maps temperature to concentration and thermal diffusivity to D:

\[
\alpha=\frac{\kappa}{\rho c_p}\longleftrightarrow D.
\]

The correspondence requires constant homogeneous isotropic material parameters and no sources or advection. The same differential operator can then govern different physical observables. The separate material parameters are not recoverable from their ratio alone.

`ab-heat-laplace` restricts to steady state with fixed end temperatures. The transient and heat-capacity information drop out. Its Fourier-number threshold is not a universal error tolerance for every initial profile; the CLI supplies no general bound there.

### 5.4 The telegraph equation illustrates two different limits

The atlas’s transformations correspond to

\[
\tau u_{tt}+u_t=D u_{xx},\qquad \epsilon=\tau Dq^2.
\]

| Limit | Encoded regime | Additional time requirement | What is lost |
|---|---|---|---|
| Diffusion | ε ≤ 0.05 | After initial layer and before accumulated rate error dominates | Second initial condition, finite signal speed |
| Wave | ε ≥ 25 | Before significant damping | Damping and long-time diffusive relaxation |

For τ = 0.01, D = 1, q = 1, t = 1, `path model-telegraph model-fick` reports all regime/horizon checks hold and pointwise relative decay-rate error **0.010205144336440153**. The domain supremum is 0.055728090000841446.

At τ = D = q = 1, `regime diffusion` rejects both limiting bridges and reports an uncovered point. This is a gap in the **available limiting descriptions**, not a hole in physics: the parent telegraph model remains the appropriate model to investigate.

### 5.5 Constitutive closure matters: sound speed

`ab-sound-speed` requires an adiabatic equation of state, small pressure perturbations, and fluid initially at rest. It leads to

\[
c_s=\sqrt{\gamma p_0/\rho_0}.
\]

For γ = 1.4, p₀ = 101325 Pa, and ρ₀ = 1.204 kg/m³, `eval` returns **343.2488418652865 m/s**. Omitting the adiabatic factor gives **290.09821913308264 m/s**. These reproduce the atlas’s stated contrast.

Both expressions have the correct dimensions. The constitutive assumption selects the physical answer. This is a particularly clear demonstration of why dimensional analysis alone cannot establish a bridge.

### 5.6 Discrete chains and stiff strings

The chain-to-wave coarse-graining retains the long-wavelength wave speed `c = a√(κ/m)` but loses the lattice band edge. The displayed condition `qa < 1` is an operational cutoff for a statement written as `qa ≪ 1`; no global error bound is supplied.

The stiff-string approximation drops the bending term from

\[
\omega^2=(F/\mu)k^2+(EI/\mu)k^4.
\]

It uses β = EIk²/F ≤ 0.01. The domain-wide relative phase-velocity bound is 0.00498756211208895, with a finite phase horizon. At β = 1 the stiff-string speed is √2 times the flexible-string value. The higher-order boundary conditions and high-partial inharmonicity are lost in the reduction.

## 6. Journey III — quantum evolution and relativistic limits

### 6.1 Imaginary time is a transformation, not ordinary diffusion in disguise

`ab-schrodinger-diffusion` specifies free-particle evolution, V = 0, and the formal continuation `t = −iτ`, with D = ℏ/(2m). It preserves linearity and a Gaussian-kernel structure while losing real-time oscillatory phase and unitary norm conservation.

The CLI explicitly records a squared-norm counterexample: the Wick-rotated kernel’s norm decreases while the original Schrödinger norm would be conserved. Its prose about a “spread growing linearly” should not be extended to every real-time quantum wavepacket; kernel continuation and a specific packet’s width are different statements.

**Applied interpretation:** imaginary-time methods can connect operators and computation strategies. They do not establish that a quantum wavefunction is a classical concentration field evolving in ordinary real time.

### 6.2 Klein–Gordon has several useful reductions

Writing the displayed dispersion in normalized form,

\[
\omega=\omega_0\sqrt{1+x^2},\qquad x=ck/\omega_0,
\]

produces three distinct atlas routes:

- Small x: remove the fast rest-frequency phase and approximate the kinetic frequency by `ω₀x²/2`, leading to the free Schrödinger equation.
- Large x: neglect the gap and approximate the dispersion by `ck`, leading to the massless wave equation.
- Spatially uniform data: retain the k = 0 mode, giving a harmonic oscillator.

For x = 0.05, two explicit `eval` calls return exact normalized kinetic frequency **0.00124921972503933** and reduced frequency **0.0012500000000000002**. At x = 1, the relative error normalized by the reduced value is **0.17157287525380982**, reproducing the atlas’s 17.2% counterexample. The different 20.7% figure in the atlas uses the exact value as denominator; these are consistent, not competing results.

`regime waves` marks the Schrödinger limit valid at x = 0.05. At x = 1 it rejects both the x ≤ 0.1 Schrödinger limit and the x ≥ 10 massless-wave limit, leaving an uncovered reduction regime.

However, both attempted `path model-klein-gordon model-schrodinger-free …` calls fail before a path bound is evaluated: the source belongs to `waves` and the target to `diffusion`. The explicit cross-family bridge can be read with `atlas` and its inequality checked with `regime`, but cannot currently be traversed by `path`.

## 7. Journey IV — gravity, thermodynamics, and information

### 7.1 Hawking temperature

For the supplied mass M = 1.989 × 10³⁰ kg,

\[
T_H=\frac{\hbar c^3}{8\pi GMk_B}
=6.168429712630829\times10^{-8}\ \mathrm K.
\]

`explain hawking-temperature mass=1.989e30` displays two agreeing routes, direct and through Schwarzschild radius. It correctly says these restate one bridge and agree **by construction**, rather than constituting independent confirmation. An explicitly entered `eval` formula gives the value above.

The assumptions remain those of the displayed canonical entry: Schwarzschild and semiclassical. This is not a general-temperature formula for every rotating, charged, or time-dependent black hole.

### 7.2 Composing Hawking with Landauer

Substitute the Hawking temperature into the Landauer minimum-erasure energy:

\[
E_{\min}=k_BT_H\ln2
=\frac{\hbar c^3\ln2}{8\pi GM}.
\]

The CLI returns **5.903143819685109 × 10⁻³¹ J** through an explicit formula using `log(2)`. `explain landauer-erasure-energy mass=…` and `symbolic --simplify` return the same value to displayed precision. Boltzmann’s constant cancels algebraically.

This establishes a **conditional composition of formulas**. The interpretation assumes that the erasure bath temperature can be identified with the Hawking temperature in the modeled setup. It does not demonstrate a realizable erasure machine operating at a horizon or a new gravitational information law. Landauer’s lower bound and the quasistatic idealization remain essential.

The symbolic pretty-printer’s slash and dot notation can make denominator scope difficult to read, especially in CT-1b. For reuse, the parenthesized formulas above are less ambiguous than copying a flat text rendering.

### 7.3 Weak-field gravitational examples

| Calculation | Supplied parameters | CLI result | Explicit-formula check |
|---|---|---:|---|
| Solar-limb light deflection | M = 1.989e30 kg, b = 6.957e8 m | 1.7517100517691688 arcsec | 1.751710051769169 |
| Mercury-like perihelion advance | M = 1.989e30 kg, a = 5.7909e10 m, e = 0.20563, period = 0.2408467 yr | 42.99339207131854 arcsec/century | Same |

The explicit checks used `4GM/(c²b)` and `6πGM/[a(1−e²)c²]`, with angular and orbital-period conversion through `eval`. These are numerical consistency checks of weak-field formulas, not fresh measurements.

The stored Mercury confrontation reports 42.98056 arcsec/century, slightly different from this custom-input calculation. The inputs were not asserted to be identical; a difference between two parameterized predictions is not by itself a defect.

### 7.4 Astrophysical scales

| Evaluator | Inputs | Output |
|---|---|---:|
| Chandrasekhar mass, BE-63 | μe = 2 | 2.89572223712275e30 kg = 1.4558683947324034 solar masses |
| Eddington luminosity, BE-64 | M = 1.989e30 kg | 1.2574382573536063e31 W = 32848.43932480685 solar luminosities |
| Jeans mass, BE-65 | T = 10 K, ρ = 1e−16 kg/m³, μ = 2.33 | 6.753353958159026e30 kg |

These connect microphysical assumptions or transport balances to astronomical scales. The CLI’s own confrontation descriptions qualify the white-dwarf model, super-Eddington sources, and convention-dependent Jeans prefactors. These three custom evaluations were not separately rederived in this session; they are reported outputs, not independently validated predictions.

## 8. Journey V — quantum and thermal physics in electrical engineering

All 13 models in the `evaluate` menu were exercised. The following complement the gravity/astrophysics cases above.

| Bridge | Inputs | Output | Interpretation and limit |
|---|---|---|---|
| BE-58 Johnson–Nyquist | T = 300 K, R = 1000 Ω | Sᵥ = 1.6567788e−17 V²/Hz | Thermal voltage-noise spectral density in the represented classical model |
| BE-59 AC Josephson | V = 1 mV | f = 4.8359784841698364e11 Hz | Voltage-to-frequency relation |
| BE-55 Integer quantum Hall | C = 1 | Rᴴ = 25812.807459304513 Ω; σxy = 3.8740458649318244e−5 S | Quantized plateau model |
| BE-60 Fractional quantum Hall | ν = 1/3 | Rxy = 77438.42237791355 Ω | Three times the displayed integer Hall resistance |
| BE-61 Wiedemann–Franz | σ = 5.8e7 S/m, T = 300 K | κ = 425.08278457881806 W/(m·K) | Ideal Lorenz-number relation, not a new material measurement |
| BE-62 BCS gap | Tc = 1.2 K | Δ₀ = 2.922354000954473e−23 J; 2Δ₀/(kBTc) = 3.527753977724091 | Weak-coupling relation; not every superconductor |
| BE-56 Casimir | d = 1 μm | Pressure = −0.0013001257724477536 Pa | Negative sign denotes attraction in this convention; idealized model |
| BE-57 Unruh | a = 9.81 m/s² | T = 3.977968265813071e−20 K | Accelerated-observer temperature scale, not an observation in this session |

For the resistor example, entering `sqrt(4kTRB)` with B = 10 kHz gives **4.070354775692163 × 10⁻⁷ V RMS**, about 0.407 μV. This calculation assumes a flat spectral density over that measurement bandwidth and the matching spectral-density convention; bandwidth integration is an additional applied assumption, not an input accepted by the BE-58 evaluator itself.

Explicit `eval` calculations reproduced `4kTR`, `h/e²`, and `2eV/h`. The paired input controls rejected negative temperature for Johnson–Nyquist and zero plate separation for Casimir. These checks demonstrate some useful domain protection; they do not audit every evaluator’s complete physical regime.

The Wiedemann–Franz output should not be read as a certified conductivity for a named copper specimen. The supplied electrical conductivity was a scenario input, and the stored confrontation explicitly notes material spread. Similarly, a Casimir experiment’s real geometry and corrections are not exhausted by the single plate-separation parameter.

## 9. What discovery and dimensional analysis actually accomplished

### 9.1 The discovery funnels

| Source | Candidates | Promising | Inert | Magnitude clash | Numerical contradiction | Axis clash |
|---|---:|---:|---:|---:|---:|---:|
| Catalog, JSON recount | 132 | 7 | 35 | 20 | 0 | 70 |
| Canonical, text | 345 | 49 | 286 | 9 | 0 | 1 |
| Both, text | 833 | 107 | 604 | 61 | 0 | 61 |

These use the default anchor and thresholds; no anchor-sensitivity sweep was performed. Results are not counts of true or false laws. “Inert,” “axis clash,” and “numerically contradictory” are different outcomes. A magnitude clash concerns the represented values and hypothesis, not a prohibition on every conceivable relation between the quantities.

Examples of canonical promising candidates include Compton wavelength identified with Hubble distance, or an orbital length identified with the classical electron radius. Their grounding text often says magnitude checking abstained, regime attributes were unresolved, and the consequence was inconclusive. That is precisely why an apparently exciting score must not be promoted to physical equivalence.

`ground landauer-erasure-energy barrier-height` succeeds and reports numerical consistency plus a magnitude check, but explicitly sets `mechanism-tested false` and `data-tested false`. This is a positive control for `ground`.

In contrast, `ground compton-wavelength hubble-distance` and `ground barrier-width compton-wavelength` fail despite those pairs appearing in a different-source discovery result. The observed behavior indicates a source-scope mismatch in the workflow. `help ground` exposes no source selector. This audit did not inspect implementation to determine the internal cause.

### 9.2 Three generated canonical consequences

`discover --source=canonical --derive --json` produced three relations, each explicitly unadjudicated and conditional on an identification:

| Assumed equality | Algebraic result | Applied interpretation |
|---|---|---|
| Erasure energy = photon energy | ν = kBT ln2/h | Frequency of a photon with that energy; not a law that erasure must emit one photon |
| Photon energy = rest energy | m = hν/c² | Equivalent rest-mass energy scale; not proof of nonzero photon rest mass |
| Hubble distance = Wien peak wavelength | T = bH/c | Consequence of equating those lengths; not an established cosmological temperature law |

For the first, `eval` gives ν = **4.332853139320784e12 Hz** at 300 K. For the second, a supplied ν = 5e14 Hz gives **3.686248661906354e−36 kg** as the equivalent energy scale. Neither numerical result proves its identification premise.

The catalog JSON additionally labels one consequence involving Landauer energy and a dark-fermion mass parameter as `novel-consequence`. Its own grounding states that mechanism and data were not tested. “Novel” here means no canonical match was found by that procedure, not scientific novelty established by literature review.

### 9.3 Dimensional derivation and its controls

`audit` reports 11 derived monomial forms, 5 decoys, and 25 open cases over its 41-edge representation. Prefactors are recovered by matching an evaluator; they are not generally derived from dimensions.

A clean control pair demonstrates the distinction:

- `2*pi*sqrt(length/gravity)` is dimensionally a time and agrees with the canonical pendulum expression at three fixed points; exit 0.
- `pi*sqrt(length/gravity)` has the same dimension and scaling but differs by a factor of 0.5; exit 3.

The check at three fixed points is a useful numerical comparison, not a symbolic proof of equivalence over every domain.

The `audit` label DECOY includes the direct Hawking and light-deflection graph forms, even though other commands calculate those formulas and compare them with canonical physics. In this context the label concerns the attempted dimensional reconstruction. It must not be paraphrased as “Hawking radiation was refuted.” The command itself says derivability is orthogonal to credibility, but the label remains easy to misuse.

### 9.4 Structural predictions and active axes

`predict` projects 39 of 41 edges onto 15 regimes, reports 14 regime pairs already bridged, and lists 16 missing-link hypotheses. These are triadic-closure suggestions based on the representation. They do not supply new governing equations.

`axes` reports only scale and force as active gates: scale checked 111 and fired 75 times; force checked 39 and fired 29. Information checked one and fired zero; symmetry, topology, and statistics checked zero. The printed result is 2 of 6 axes gate. It does not experimentally validate a rank-6 or rank-7 mathematical tensor; it characterizes this discovery procedure’s use of classification attributes.

### 9.5 Expression search correctly rediscovered a known law

`probe scan` reports 0 of 232 frontier gaps searchable by Product B; they are relation-link/regime-transition gaps directed to `discover`. That does not mean the explicit problem-file search is broken.

Using the documented pendulum fixture through `probe run` returned one candidate, no rejections, stop reason `exhausted-space`, and the known relation `CE-pendulum-period`. The fitted prefactor was approximately 6.283, exploratory RMSE 2.72e−16, and holdout RMSE 3.33e−16. `probe reproduce` returned the same run identifier and displayed scores.

This demonstrates repeatability on that fixture and correct non-novelty labeling. The fixture contents were not read directly, no new experimental data were collected, and no claim about real-world predictive generalization follows from near-machine-precision fixture errors. The search used its default 0.15 holdout tolerance as reported in its comparison text.

## 10. Empirical grounding, proofs, and what remains unverified

### 10.1 Catalog coverage

Of 55 catalog bridges, 19 are `data-confronted`, 30 `graph-computable`, 6 `encoded-only`, and none `thin`. All have at least one recorded citation. Thus 36 lack a data confrontation in this collection. The JSON list independently recounts to the displayed totals; this checks aggregation consistency, not the underlying truth of the entries.

The confrontation command divides its 19 records into 7 stringent, 3 moderate, and 9 loose. These labels and assessments belong to the package.

### 10.2 Precision checks versus broad consistency

The Cassini record compares γ = 1 with 1.000021 ± 0.000023, reporting 0.91σ. The light-deflection record distinguishes the measured PPN γ from the solar-limb angle derived from it. That disclosure prevents a derived quantity being mistaken for an independently measured angle.

Other records summarize universality ratios, lower/upper-bound compatibility, or order-of-magnitude material/astrophysical agreement. Examples include a 50% Eddington ratio gap and a 150% Jeans-mass gap. They cannot be pooled as identical precision tests.

The Johnson-noise confrontation uses a historical Boltzmann-constant comparison while the numerical example uses 1.380649e−23 as its supplied constant. These serve different purposes. This session did not resolve or update the literature records.

### 10.3 Two presentation cautions

`confront --frontier` ranks Cassini first with a “0.09σ to exclusion” margin because the encoded comparison uses a one-sigma acceptance boundary. That is a margin to this software criterion, not a claim that general relativity is 0.09σ away from scientific exclusion. A one-sigma interval is not a universal hypothesis-rejection standard.

The GW-speed record prints “predicted 1e−15,” “bound 6.501939179989081e−16,” and “not excluded,” followed by an explicit one-sided caveat. Read as a simple point prediction versus an upper limit, those numbers would be confusing. The record may represent a range or constraint comparison rather than that simplistic reading. With only the displayed output, this audit does not resolve the underlying semantics; clearer labels are warranted. The full source was not fetched.

`confront --bridge=be-37 --sensitivity` reports **no ranked-input model**. It does not deliver a Cassini uncertainty budget. Its preamble correctly distinguishes elasticity from uncertainty contribution.

### 10.4 Proof coverage and graph overlays are different surfaces

The qualified pendulum atlas record reports a limited formal reference. Meanwhile, `map --source=both --evidence=formally-proved` keeps zero of 148 graph edges: 40 do not match and 108 lack overlay metadata. These results refer to different representations and metadata coverage. They must not be collapsed into either “everything is unproved” or “the full pendulum approximation is formally proved.”

All 20 inspected atlas entries show `review status: proposed`. Witness text is helpful, but no witness was rerun and no formal artifact was inspected under the CLI-only restriction. Several symbolic verdicts explicitly defer to a repository witness-results artifact instead of asserting a result the package cannot see. That abstention is appropriate.

## 11. Findings ledger and recommended improvements

The priorities below are this audit’s usability/scientific-risk judgment, not repository issue states. No fixes, commits, or external issues were made.

| ID | Priority | Observed finding | Evidence | Recommended response |
|---|---|---|---|---|
| F01 | High | Cross-family `path` refuses an explicitly listed KG→Schrödinger bridge | `atlas ab-kg-schrodinger`; two `path` failures | Support cross-family route lookup or expose an explicit bridge-evaluation route with all checks |
| F02 | High | Promising dimensional identifications can have neither mechanism nor data tests | Canonical/combined discovery; successful `ground` control | Keep grounding gaps adjacent to rankings; require a physical mechanism and falsifiable prediction before promotion |
| F03 | Medium | Documented `ln` fails with the active MathTS parser | `eval ln(2) --debug` fails; `log(2)` succeeds | Normalize function aliases across parsers and test documented examples in both modes |
| F04 | Medium | `ground` cannot inspect tested candidates from other graph scopes | Two negative ground calls plus one positive | Expose source selection or state the supported scope and remediation explicitly |
| F05 | Medium | Natural pendulum→LC route has no composed claim | `path model-pendulum model-lc` | Extend composition only with a justified transported norm/bound; retain abstention until then |
| F06 | Medium | Radius/diameter ambiguity in Brownian witness prose | `atlas ab-stokes-einstein`; two radius calculations | Print full witness parameters and distinguish radius from diameter |
| F07 | Medium | “Exclusion” wording overstates a one-sigma software threshold | `confront --frontier` | Say “margin to configured acceptance threshold” and show the criterion |
| F08 | Medium | Conditions in prose are not necessarily checked by `regime` | VACUOUS exact analogies, no-slip and boundary assumptions | Separate evaluated inequalities from untested physical premises |
| F09 | Medium | Formal-proof label can be read more broadly than its theorem | Pendulum atlas record | Display theorem scope alongside every proof badge or summary |
| F10 | Medium | Empty evidence-filtered map has large unknown-metadata population | 108 missing overlays vs 40 nonmatches | Preserve this distinction in exports and summary graphics |
| F11 | Low/Medium | DECOY terminology can be mistaken for physical refutation | `audit` vs Hawking/light-deflection evaluations | Rename or qualify as failed dimensional reconstruction |
| F12 | Low/Medium | Some symbolic pretty-printing leaves denominator grouping unclear | `symbolic --simplify`, particularly CT-1b | Emit unambiguous parentheses or LaTeX fractions |
| F13 | Medium | GW-speed confrontation output needs clearer constraint semantics | `confront` BE-36 | State which number is a predicted range, experimental interval, or scalar bound and how compatibility is assessed |
| F14 | Low/Medium | Top-level help’s fixed “20 isolated bridges” line does not describe the observed default combined view | `help`, `map --source=both`, `connectors` | Derive counts from the selected graph or avoid a fixed number |

The two rejected physical inputs are successful safeguards, not defects. The unsupported `probe help` syntax was an exploratory usage error; the documented `help probe` worked. The NOT COVERED Schrödinger query likewise should not be filed as a missing-physics defect without specifying the quantity interface’s contract.

## 12. A practical research workflow using only this CLI

1. Start with `canonical --json` and read the assumptions, not just the name of a law.
2. Use `map --source=canonical` for representation connectivity; use the combined map to see catalog additions without treating their labels as new evidence.
3. Use `atlas` for physical transformations. Record what is preserved, discarded, or assumed.
4. Supply actual regime coordinates to `regime` or `path`. Preserve UNKNOWN, VACUOUS, and VIOLATED as distinct outcomes.
5. For an approximation, record the error quantity, normalization, domain, and time horizon together. Never quote delta alone.
6. Use `evaluate` for a named model and `eval` for a separately entered formula. Add a physically meaningful negative input or regime control.
7. Read `confront` as the package’s stored confrontation, including rigor and source provenance. Do not silently substitute it for a new literature/data review.
8. Use `discover` to generate a question, then demand mechanism, assumptions, competing models, and a measurable discriminator.
9. Treat `probe` fixture recovery as a software demonstration unless its data and holdout design have independently earned stronger evidential status.
10. Preserve the command arguments and outputs with every conclusion, including failures and refusals.

The next scientifically valuable step would be a focused, externally validated case study with measured data and explicit uncertainty—such as thermal noise across temperature, or diffusion across particle size. That lies beyond this CLI-only session. Within the current constraint, the strongest result is a well-qualified map of model relationships and their boundaries, not a newly unified theory.

## 13. Sources and attribution

The authoritative evidence for this report is the captured CLI session. Literature references printed by `canonical`, `atlas`, and `confront` are preserved verbatim in the transcript and summarized in the inventories below. They include sources attributed by the CLI to Olson and Feynman for dynamical analogies; Landau–Lifshitz and Abramowitz–Stegun for pendulum approximations; Einstein, Stokes, Feller, and Uhlenbeck–Ornstein for diffusion; Cattaneo and Goldstein for telegraph limits; Greiner and Whitham for relativistic wave limits; and the confrontation-specific papers named in the full output.

These references have **not** been independently authenticated, downloaded, or checked against their original equations in this audit. The restriction to the CLI prevents claiming otherwise. References to tests and formal artifacts in the transcript identify what the package reports, not files inspected by the auditor.


## 14. Twenty improvements from the applied-physicist user experience

**Added 26 September 2026, following the user’s request.** These recommendations are grounded in the captured CLI session, not a source-code review. Items described as extensions are proposed capabilities, not assertions that no equivalent internal capability exists. The original observations, failed commands, and evidence remain unchanged. Any suggested command syntax below is illustrative, not an existing documented interface.

The goal is to make the tool answer four practical questions reliably: **Which model should I use? What assumptions must hold? How accurate is the answer? What observation could show that I am wrong?**

Priority definitions: **P1** removes an observed blocker or a substantial risk of scientific misinterpretation; **P2** makes analysis more useful and reproducible; **P3** expands research reach after the foundations are dependable. These priorities are recommendations, not estimates of implementation effort.

### 1. Allow qualified routes across model families — P1

**User experience:** `atlas ab-kg-schrodinger` exposes a bridge from Klein–Gordon to free Schrödinger dynamics, but `path` refuses it because the endpoints belong to different families. A classification boundary obstructs the very physics connection the user wants to explore (§6.2; F01).

**Improvement:** search a common model graph across families while retaining family labels as descriptive metadata. Every route should carry its transformations, side conditions, evidence, error norm, and horizon. Cross-family support must not weaken composition rules.

**Acceptance example:** the observed KG→Schrödinger request returns the listed bridge. At `c=1 omega0=1 k=0.05`, it evaluates the available regime information; at `k=1`, it reports the violated inequality. Unsupported bound composition still produces an explicit refusal.

**Physicist benefit:** users can move between relativistic, quantum, mechanical, and transport descriptions without manually stitching together disconnected command results.

### 2. Support physically justified composition of approximations and exact mappings — P1

**User experience:** pendulum→spring→LC is discoverable as a route, but the composition table supplies no composite claim (§4.3; F05).

**Improvement:** add composition rules only when the error measure can be transported through the next mapping. Carry normalization, amplitude/time rescaling, parameter restrictions, and any error amplification. Distinguish period error, trajectory error, and phase error; do not combine unrelated norms into one number.

**Acceptance example:** for a qualified pendulum→LC route, the output identifies which error is bounded in the mapped circuit and why. If the required mapping information is missing, it names that missing information instead of only saying “no composite claim.”

**Physicist benefit:** a chain becomes an actionable approximation with a known cost, rather than merely a diagram of possible transitions.

### 3. Use a consistent graph scope across exploration commands — P1

**User experience:** pairs shown by canonical/combined `discover` could not be inspected with `ground`, while a catalog pair worked (§9.1; F04).

**Improvement:** carry the selected source through `discover`, `ground`, `explain`, `map`, and exported candidate identifiers. Where a command cannot support a source, say so explicitly and show the supported alternative. Print the effective source and anchor in every result.

**Acceptance example:** a candidate returned by a discovery command can be passed directly to its grounding command with the same source, or the CLI explains a specific supported-scope limitation. It must not imply the pair never existed.

**Physicist benefit:** a hypothesis remains inspectable as the user moves from overview to evidence.

### 4. Make expression syntax stable across optional parsers — P1

**User experience:** the documented `ln(2)` failed under MathTS; `log(2)` returned the expected natural logarithm (§7.2; F03).

**Improvement:** provide a documented compatibility layer for function names, logarithm bases, constants, and operator precedence. Report the parser and its version, and make an unsupported function diagnostic suggest a tested equivalent. Check the advertised examples with every supported parser configuration.

**Acceptance example:** `ln(2)` and the documented natural-log alias agree in each supported configuration; base-10 logarithms are unambiguous. Unknown functions still fail instead of being silently reinterpreted.

**Physicist benefit:** equations copied from notes or literature behave predictably regardless of which optional packages happen to be installed.

### 5. Add semantic quantity lookup and guided input completion — P2

**User experience:** `explain schrodinger-equation` failed because it was a model/law name rather than a quantity; its suggestions included unhelpful one-letter names. The registry also exposed varied names for related constants and quantities (§3.2).

**Improvement:** offer a search/lookup surface accepting law names, model names, symbols, aliases, and physical descriptions. Return the correct command, exact quantity identifier, required inputs, and source availability. Distinguish genuine aliases from merely equal dimensions: radius is not automatically wavelength, and angular frequency is not automatically ordinary frequency.

**Acceptance example:** a search for “Schrödinger” points to the free-particle atlas model and its available relations. A search for “thermal noise” identifies BE-58 and its temperature/resistance inputs, with units.

**Physicist benefit:** the CLI becomes approachable without memorizing its internal vocabulary.

### 6. Make input units, conventions, and geometry explicit — P2

**User experience:** `evaluate` exposes useful SI-oriented parameter names, but generic `eval` requires the user to carry dimensions mentally. “A 1 µm sphere” was ambiguous between radius and diameter (§5.2; F06).

**Improvement:** introduce unit-aware input parsing and explicit parameter schemas. Show accepted units, conversion results, angular-frequency conventions, sign conventions, and whether a geometric length means radius, diameter, or separation. Keep plain numerical input available with an explicit default-unit contract.

**Acceptance example:** a radius of 1 μm and a diameter of 2 μm produce the same Stokes–Einstein result after conversion. A radius of 0.5 μm yields twice the diffusivity. Temperature differences and absolute temperatures are not interchanged silently.

**Physicist benefit:** common laboratory and engineering input mistakes are caught before they become plausible-looking numerical answers.

### 7. Separate checked conditions from untested physical premises — P1

**User experience:** exact analogies can report VACUOUS regimes even though positivity, no forcing, no slip, boundary conditions, or material assumptions remain essential (§10.4; F08).

**Improvement:** expose an assumption checklist with separate states for numerically verified, user-declared, contradicted, and unspecified premises. “No machine inequality” should not look like universal applicability. User declarations should be recorded as declarations, not measured evidence.

**Acceptance example:** a spring–LC result shows whether losslessness and the parameter mapping have been established or merely assumed. Stokes–Einstein reports Reynolds-number checks separately from a no-slip declaration.

**Physicist benefit:** users can see exactly which parts of a model-selection decision are warranted and which still require judgment or measurement.

### 8. Turn validity horizons into tolerance-driven guidance — P2

**User experience:** the pendulum and telegraph examples demonstrated that a small local error can fail over time, but the user must interpret fixed machine thresholds (§§4.2 and 5.4).

**Improvement:** where supported by the model, accept a requested observable tolerance and observation time, then report whether the approximation is adequate. Expose pointwise error, domain supremum, phase accumulation, and the threshold’s origin separately. Use explicit interval conventions at boundaries.

**Acceptance example:** a pendulum query requesting a phase tolerance receives a phase-based horizon, not merely the period-error bound. If the CLI has no justified translation between the two, it says so. An evaluation just beyond the accepted horizon fails appropriately.

**Physicist benefit:** the question changes from “Is this approximately valid?” to “Is it accurate enough for my experiment’s duration and observable?”

### 9. Add uncertainty propagation distinct from sensitivity — P2

**User experience:** numerical evaluators return many digits, while the Cassini sensitivity request had no ranked-input model. The CLI correctly warned that elasticity is not an uncertainty budget (§10.3).

**Improvement:** accept input uncertainties and, where needed, covariance; propagate them by a stated method. Keep measurement uncertainty, parameter uncertainty, numerical error, and model discrepancy separate. Report method limits near singularities or strong nonlinearities.

**Acceptance example:** Johnson-noise output accepts uncertainties in R and T and returns a propagated uncertainty alongside sensitivity. A correlated-input example differs from the independent-input result. Deterministic constants are distinguished from measured parameters.

**Physicist benefit:** results can support instrument design, parameter estimation, and comparisons with actual measurements instead of only idealized arithmetic.

### 10. Render equations in a reproducible, unambiguous form — P1

**User experience:** symbolic slash/dot rendering made denominator scope difficult to read in a composed Hawking expression (§7.2; F12).

**Improvement:** provide fully parenthesized plain text and LaTeX output, with a symbol table and explicit constant conventions. Preserve the original expression, substitutions, and simplified expression. Avoid a pretty-printer that changes apparent meaning.

**Acceptance example:** copying the printed scalar formula back into `eval` with the shown inputs reproduces the composed result. CT-1b’s entire denominator is visibly grouped. Round-trip checks include nested division and exponentiation.

**Physicist benefit:** users can safely transfer a result into a notebook, lab report, or independent calculation.

### 11. Rank discovery candidates by evidential readiness, not connectivity alone — P1

**User experience:** “promising” included same-dimension identifications with no magnitude value, unresolved regimes, and no tested mechanism or data (§9.1; F02).

**Improvement:** display separate dimensions of merit: structural usefulness, semantic compatibility, mechanism support, identifiability, and available falsifiers. Make abstentions reduce readiness rather than resemble passes. Preserve the distinction between a hypothesis being unexplored and being refuted.

**Acceptance example:** an identification between an orbital length and an electron scale cannot appear as evidence-backed solely because it connects components. The output states what additional premise could make it meaningful and which independent observation could test that premise.

**Physicist benefit:** review time goes toward physically motivated questions, while exploratory coincidences remain visible without receiving inflated authority.

### 12. Preserve conditional premises and known-law status in every derived relation — P1

**User experience:** the CLI correctly marked `m = hν/c²` and `ν = kBT ln2/h` as consequences of assumed identifications, but those formulas are easy to detach from their caveats (§9.2).

**Improvement:** make the premise, source equations, assumptions, and novelty status inseparable from exported results. State whether a result is a known law, a restatement, a conditional identity, or an untested proposal. Explain the exact scope of any “no canonical match” finding.

**Acceptance example:** an exported photon-energy/rest-energy relation labels m as the mass associated with an equal rest-energy scale in that identification; it does not imply photon rest mass. A document export retains the warning without relying on a prior terminal banner.

**Physicist benefit:** algebraically correct expressions are less likely to become physically false claims when shared.

### 13. Replace overloaded verdict words with precise scientific descriptions — P1

**User experience:** DECOY could be misread as refutation of a physical formula; VACUOUS as unconditional validity; and “margin to exclusion” as a research-level rejection criterion (§§9.3 and 10.3; F07/F11).

**Improvement:** use labels such as “dimensional reconstruction mismatch,” “no machine condition evaluated,” and “margin to configured acceptance threshold.” Define each status in concise help and the JSON schema. Do not collapse these states into a single pass/fail badge.

**Acceptance example:** the direct Hawking dimensional-audit result describes exactly which reconstruction failed while leaving the separate physical/evaluator status intact. The Cassini frontier states its one-sigma software criterion explicitly.

**Physicist benefit:** a user can summarize an output without accidentally exaggerating its scientific meaning.

### 14. Make empirical confrontations transparent about their data and statistics — P1

**User experience:** the 19 records mixed precision measurements, derived observables, ratios, broad consistency, and non-exclusion. The GW-speed display was difficult to interpret as a constraint comparison (§10).

**Improvement:** show the actual statistical object: point estimate, interval, upper limit, distribution, or range. Identify measured versus derived quantities; display the criterion, uncertainties, preprocessing, and source location. Separate independence from goodness of fit and explain reused constants or calibrations.

**Acceptance example:** the GW-speed record explains why its displayed numbers are compatible or incompatible under the chosen interval semantics. The VLBI record continues to identify γ as the measurement and deflection as derived. Broad consistency summaries cannot be counted as equivalent to precision tests.

**Physicist benefit:** the tool supports defensible comparison with evidence rather than a collection of reassuring check marks.

### 15. Expose claim-level proof and witness provenance — P1

**User experience:** the pendulum record’s formal reference covered a limited equation correspondence, not its approximation bound. Other symbolic verdicts depended on an artifact not exposed as a live result (§10.4; F09).

**Improvement:** split a bridge into individual claims—transformation, regime, error bound, horizon, preserved observable—and attach evidence to each. Record proof version, axioms, witness parameters, execution status, and whether results are stored or rerun. Provide a CLI-accessible way to retrieve or run supported checks without source inspection.

**Acceptance example:** the pendulum bridge visibly marks its linearized correspondence as formally referenced while leaving the numerical bound and horizon under their own evidence categories. A failed or unavailable witness is not promoted to success by the existence of its name.

**Physicist benefit:** formal methods and numerical tests provide appropriately scoped assurance rather than a misleading global badge.

### 16. Offer focused maps with evidence and coverage visible — P2

**User experience:** the combined map contained 148 edges over 40 components; an evidence filter retained none while 108 edges lacked metadata (§§3.1 and 10.4; F10).

**Improvement:** support neighborhood, route, family, observable, and evidence-focused exports. Visually distinguish shared-quantity connectivity from model transformations and distinguish absent evidence from negative evidence. State the count denominator and source in each map. Generate help counts from the active data rather than hard-coding them.

**Acceptance example:** a compact “oscillator to circuit” view shows the relevant equations, assumptions, and unresolved composition step. A formally-proved filter explicitly retains an accounting of omitted unknown-metadata edges even when no edge qualifies.

**Physicist benefit:** maps become navigable working instruments, rather than impressive but difficult-to-read catalogs.

### 17. Provide a single-command reproducible experiment record — P2

**User experience:** this audit required an external wrapper to preserve 114 invocations, arguments, outputs, errors, and artifact hashes (§2.3 and Appendix D).

**Improvement:** add a CLI session/case export containing version, dependency/parser versions, source selection, constants, units, anchors, supplied inputs, outputs, assumptions, and failures. Provide replay with differences reported explicitly. Include machine-readable and readable forms.

**Acceptance example:** replaying the thermal-noise case reproduces its calculation under the captured configuration, or names the version/constant changes affecting it. Failed `ln` and invalid-input attempts remain part of the record rather than being discarded.

**Physicist benefit:** a colleague can reproduce the analysis without reconstructing a terminal history or guessing the environment.

### 18. Add parameter sweeps and comparison with higher-fidelity models — P2

**User experience:** this session tested a small number of parameter points manually. The most informative differences concerned transition regimes and accumulated errors (§§4–6).

**Improvement:** allow bounded CLI sweeps with tabular/CSV/JSON output for parent and reduced models, residuals, and regime/horizon status. Specify what is actually evaluated and reject unsupported comparisons rather than fabricating trajectories. Include sampling and numerical-resolution information.

**Acceptance example:** a pendulum amplitude sweep shows the growth of period error; a KG sweep covers the low-x, transition, and high-x regions; a telegraph sweep exposes where neither encoded limit applies. Plots must not connect invalid samples as though they belonged to a validated approximation.

**Physicist benefit:** validity becomes a visible region of parameter space instead of a single favorable example.

### 19. Extend expression search to a real-data, falsification-oriented workflow — P3

**User experience:** `probe` reproducibly recovered the known pendulum relation from a fixture, while the frontier scan reported no searchable Product-B gaps (§9.5).

**Improvement:** make it straightforward to supply calibrated observations with units, uncertainty, exploratory/holdout roles, competing baseline models, and acquisition provenance. Couple candidate fitting to discriminating experiment suggestions and meaningful falsification tests. Guard against leakage and avoid treating a good fit as a causal mechanism.

**Acceptance example:** recover the expected scaling from a transparently labeled synthetic control, then test a withheld change of regime where that model should fail. Preserve a “no credible candidate” result when the search cannot support an explanation. Independent replication data must not be reused as exploratory fit data.

**Physicist benefit:** the research workflow progresses from formula rediscovery toward asking which measurement would distinguish competing physical explanations.

### 20. Expand qualified model coverage around complete applied problems — P3

**User experience:** the qualified atlas covered only oscillators, diffusion, and waves, while the canonical inventory spanned many more domains (§3). Some useful evaluators lacked an equally rich route of assumptions, approximations, and observable comparisons.

**Improvement:** prioritize end-to-end worked cases rather than equation count alone. Good initial cases include a resistor noise measurement with bandwidth and instrument loading, a Brownian-particle diffusion experiment with particle geometry and fluid conditions, and a resonator comparison with damping and finite observation time. Then extend the same qualification discipline to broader electromagnetic, thermodynamic, and astrophysical models.

**Acceptance example:** each added case includes governing equations, an observable, units, boundary/initial conditions, regime checks, uncertainty treatment, at least one valid example, one failure example, and a route to measurement comparison. A scalar simplification is visibly distinguished from its parent vector or field equation.

**Physicist benefit:** users can complete an experiment-design or model-selection task, not merely find a formula that resembles their problem.

### Suggested implementation order

Start with **1, 3, 4, 10, and 13** to remove the clearest interface blockers and ambiguous outputs. In parallel with subsequent feature work, address **7, 11, 12, 14, and 15** to strengthen the meaning of scientific claims. Build **2, 5, 6, 8, 9, 16, 17, and 18** into coherent applied workflows. Pursue **19 and 20** after those workflows can preserve assumptions, uncertainty, and reproducibility.

This ordering does not imply that interface fixes alone validate the physics. The release criterion should be that a user can obtain a correct, qualified result, understand a refusal, and reproduce both—without inspecting implementation files.


## Appendix A — complete canonical inventory exported by the CLI

The expressions and assumptions below come from `canonical --json`. Registry notation is preserved; typographic imperfections are not silently repaired. Quantitative status is the JSON field, not a new auditor rating.

| ID | Domain | Quantitative status | Equation | Assumptions | CLI-supplied references |
|---|---|---|---|---|---|
| CE-pendulum-period | mechanics | dimensional | T = 2\pi\sqrt{L/g} | small-angle; point mass; rigid massless rod | Taylor, Classical Mechanics §1 |
| CE-kepler-third | gravitation | dimensional | T^2 = 4\pi^2 a^3/(GM) | two-body; M ≫ m | Kepler 1619; any celestial-mechanics text |
| CE-schwarzschild-radius | general-relativity | dimensional | r_s = 2GM/c^2 | static; spherically symmetric; vacuum | Schwarzschild 1916 |
| CE-string-wave-speed | mechanics | dimensional | v = \sqrt{F/\mu} | ideal flexible string; small amplitude | Any waves/mechanics text |
| CE-planck-length | quantum | dimensional | \ell_P = \sqrt{\hbar G/c^3} |  | Planck 1899 |
| CE-planck-mass | quantum | dimensional | m_P = \sqrt{\hbar c/G} |  | Planck 1899 |
| CE-planck-time | quantum | dimensional | t_P = \sqrt{\hbar G/c^5} |  | Planck 1899 |
| CE-compton-wavelength | quantum | dimensional | \lambda_C = \hbar/(mc) |  | Compton 1923 |
| CE-thermal-de-broglie | statistical | dimensional | \lambda \propto \hbar/\sqrt{m k_B T} | non-relativistic; ideal gas | Any statistical-mechanics text |
| CE-einstein-field-eq | general-relativity | fully-quantitative | G_{\mu\nu} + \Lambda g_{\mu\nu} = (8\pi G/c^4) T_{\mu\nu} | classical GR; pseudo-Riemannian spacetime | Einstein 1915 |
| CE-friedmann | cosmology | fully-quantitative | H^2 = 8\pi G \rho/3 | flat (k=0); matter-dominated; Λ=0; FLRW | Friedmann 1922 |
| CE-hawking-temperature | general-relativity | fully-quantitative | T_H = \hbar c^3/(8\pi G M k_B) | Schwarzschild; semiclassical | Hawking 1975 |
| CE-light-deflection | general-relativity | fully-quantitative | \alpha = 4 G M/(c^2 b) | weak field; grazing ray | Einstein 1915; Eddington 1919 |
| CE-perihelion-precession | general-relativity | fully-quantitative | \Delta\phi = 6\pi G M/(c^2 a (1-e^2)) | weak field; nearly-circular orbit | Einstein 1915 |
| CE-bekenstein-hawking | general-relativity | fully-quantitative | S = k_B c^3 A/(4 G \hbar) | stationary horizon; semiclassical | Bekenstein 1973; Hawking 1975 |
| CE-newton-gravitation | gravitation | fully-quantitative | F = G m_1 m_2/r^2 | point masses; non-relativistic | Newton 1687 |
| CE-newton-second-law | mechanics | fully-quantitative | F = m a | inertial frame; constant mass | Newton, Principia 1687 |
| CE-mass-energy | mechanics | fully-quantitative | E = m c^2 | rest energy of a massive body | Einstein 1905, Ann. Phys. 18:639 |
| CE-momentum | mechanics | fully-quantitative | p = m v | non-relativistic (v ≪ c) | Newton, Principia 1687 |
| CE-kinetic-energy | mechanics | scalar-up-to-constant | K = \tfrac{1}{2} m v^2 | non-relativistic | Taylor, Classical Mechanics §1 |
| CE-rotational-kinetic-energy | mechanics | scalar-up-to-constant | K = \tfrac{1}{2} I \omega^2 | rigid body | Taylor, Classical Mechanics §10 |
| CE-gravitational-potential-energy | mechanics | scalar-up-to-constant | U = -G m_1 m_2 / r | two point masses; zero reference at infinity | Newton, Principia 1687 |
| CE-work | mechanics | fully-quantitative | W = F d | constant force along displacement | Taylor, Classical Mechanics §4 |
| CE-spring-potential-energy | mechanics | scalar-up-to-constant | U = \tfrac{1}{2} k x^2 | Hookean (linear) spring | Taylor, Classical Mechanics §5 |
| CE-power | mechanics | fully-quantitative | P = F v | force along velocity | Taylor, Classical Mechanics §4 |
| CE-centripetal-force | mechanics | fully-quantitative | F = m v^2 / r | uniform circular motion | Taylor, Classical Mechanics §1 |
| CE-hooke-law | mechanics | scalar-up-to-constant | F = -k x | linear elastic regime | Hooke 1678 |
| CE-torque | mechanics | fully-quantitative | \tau = r F | force perpendicular to lever arm | Taylor, Classical Mechanics §10 |
| CE-angular-momentum | mechanics | fully-quantitative | L = r p | momentum perpendicular to radius | Taylor, Classical Mechanics §3 |
| CE-moment-of-inertia | mechanics | fully-quantitative | I = m r^2 | point mass at radius r | Taylor, Classical Mechanics §10 |
| CE-impulse | mechanics | fully-quantitative | J = F t | constant force over interval t | Taylor, Classical Mechanics §1 |
| CE-simple-harmonic-frequency | mechanics | dimensional | \omega = \sqrt{k/m} | ideal mass–spring oscillator | Taylor, Classical Mechanics §5 |
| CE-ohm-law | electromagnetism | fully-quantitative | V = I R | ohmic conductor | Ohm 1827 |
| CE-electrical-power | electromagnetism | fully-quantitative | P = I V |  | Joule 1841 |
| CE-resistance-material | electromagnetism | fully-quantitative | R = \rho L / A | uniform cross-section; homogeneous material | Pouillet 1837 |
| CE-capacitance-parallel-plate | electromagnetism | fully-quantitative | C = \varepsilon_0 A / d | vacuum gap; ideal plates (no fringing) | Faraday 1837 |
| CE-capacitor-energy | electromagnetism | scalar-up-to-constant | U = \tfrac{1}{2} C V^2 |  | Standard electromagnetism (Griffiths §2.4) |
| CE-inductor-energy | electromagnetism | scalar-up-to-constant | U = \tfrac{1}{2} L I^2 |  | Standard electromagnetism (Griffiths §7.2) |
| CE-magnetic-field-wire | electromagnetism | scalar-up-to-constant | B = \mu_0 I / (2\pi r) | infinite straight wire; magnetostatic | Ampère 1826 |
| CE-cyclotron-frequency | electromagnetism | fully-quantitative | \omega_c = q B / m | non-relativistic charged particle | Standard plasma physics |
| CE-larmor-radius | electromagnetism | fully-quantitative | r_L = m v_\perp / (q B) | velocity perpendicular to B; non-relativistic | Standard plasma physics |
| CE-point-charge-field | electromagnetism | scalar-up-to-constant | E = q / (4\pi \varepsilon_0 r^2) | point charge; vacuum; electrostatic | Coulomb 1785 |
| CE-lc-resonance | electromagnetism | dimensional | \omega_0 = 1/\sqrt{L C} | ideal lossless LC circuit | Standard circuit theory |
| CE-coulomb | electromagnetism | fully-quantitative | F = q_1 q_2/(4\pi\varepsilon_0 r^2) | point charges; vacuum; electrostatic | Coulomb 1785 |
| CE-lorentz-force | electromagnetism | fully-quantitative | F = q v B | v ⟂ B (magnitude only) | Lorentz 1895 |
| CE-rc-time-constant | electromagnetism | fully-quantitative | \tau = R C | series RC circuit | Standard circuit theory |
| CE-poynting-flux | electromagnetism | fully-quantitative | S = E B / \mu_0 | plane EM wave; vacuum | Poynting 1884; Griffiths, Introduction to Electrodynamics |
| CE-solenoid-field | electromagnetism | fully-quantitative | B = \mu_0 n I | ideal infinite solenoid | Ampère 1826; Griffiths, Introduction to Electrodynamics |
| CE-larmor-power | electromagnetism | scalar-up-to-constant | P = q^2 a^2 / (6\pi \varepsilon_0 c^3) | non-relativistic point charge | Larmor 1897; Jackson, Classical Electrodynamics |
| CE-field-energy-density | electromagnetism | scalar-up-to-constant | u = \tfrac{1}{2} \varepsilon_0 E^2 | linear vacuum; electrostatic | Griffiths, Introduction to Electrodynamics |
| CE-hydrostatic-pressure | mechanics | fully-quantitative | P = \rho g h | incompressible fluid; uniform gravity | Pascal 1647 |
| CE-pressure-definition | mechanics | fully-quantitative | P = F / A | force normal to surface | Standard mechanics |
| CE-density-definition | mechanics | fully-quantitative | \rho = m / V | uniform body | Standard mechanics |
| CE-buoyant-force | mechanics | fully-quantitative | F_b = \rho V g | fully submerged; static fluid | Archimedes, On Floating Bodies |
| CE-stokes-drag | mechanics | scalar-up-to-constant | F_d = 6\pi \eta r v | low Reynolds number; rigid sphere | Stokes 1851 |
| CE-wave-speed | mechanics | fully-quantitative | v = f \lambda | single propagating mode | Standard wave mechanics |
| CE-sound-speed | mechanics | dimensional | c = \sqrt{\gamma P / \rho} | adiabatic; ideal fluid (γ dimensionless) | Newton–Laplace |
| CE-volume-flow-rate | mechanics | fully-quantitative | Q = A v | incompressible flow; steady state | Batchelor, An Introduction to Fluid Dynamics |
| CE-shear-stress | mechanics | fully-quantitative | \tau = \mu (dv/dy) | Newtonian fluid; laminar flow | Newton; standard fluid mechanics |
| CE-laplace-pressure | mechanics | scalar-up-to-constant | \Delta P = 2\gamma / r | spherical interface | Young–Laplace |
| CE-dynamic-pressure | mechanics | scalar-up-to-constant | q = \tfrac{1}{2} \rho v^2 | incompressible flow | Bernoulli; standard fluid mechanics |
| CE-oscillator-energy | mechanics | scalar-up-to-constant | E = \tfrac{1}{2} k A^2 | simple harmonic motion; linear spring | Standard mechanics |
| CE-heat-capacity | thermodynamics | fully-quantitative | Q = m c \Delta T | no phase change; constant specific heat | Standard thermodynamics |
| CE-half-life | quantum | scalar-up-to-constant | t_{1/2} = \ln 2 / \lambda | first-order (exponential) decay | Rutherford–Soddy 1902 |
| CE-hubble-distance | cosmology | fully-quantitative | D_H = c / H_0 | present-epoch Hubble parameter | Hubble 1929 |
| CE-landauer | information | fully-quantitative | E = k_B T \ln 2 | isothermal; quasi-static erasure | Landauer 1961 |
| CE-jarzynski | statistical | scalar-up-to-constant | \Delta F = -k_B T \ln \langle \exp(-W/(k_B T)) \rangle | isothermal; arbitrary work protocol between two equilibria | Jarzynski 1997 PRL 78:2690 |
| CE-stefan-boltzmann | thermodynamics | fully-quantitative | j = \sigma T^4 | blackbody; thermal equilibrium | Stefan 1879; Boltzmann 1884 |
| CE-ideal-gas | thermodynamics | fully-quantitative | P = N k_B T/V | ideal gas; thermal equilibrium | Clapeyron 1834 |
| CE-wien | thermodynamics | fully-quantitative | \lambda_{max} = b/T | blackbody; thermal equilibrium | Wien 1893 |
| CE-latent-heat | thermodynamics | fully-quantitative | Q = m L | isothermal phase transition | Callen, Thermodynamics |
| CE-clausius-entropy | thermodynamics | fully-quantitative | \Delta S = Q/T | reversible process; constant temperature | Clausius 1865; Callen, Thermodynamics |
| CE-thermal-diffusivity | thermodynamics | fully-quantitative | \alpha = k/(\rho c_p) | homogeneous isotropic medium | Carslaw & Jaeger, Conduction of Heat in Solids |
| CE-rydberg-energy | quantum | scalar-up-to-constant | E_R = m_e e^4 / (8 \varepsilon_0^2 \hbar^2) | hydrogen-like; non-relativistic | Rydberg 1888; Bohr 1913 |
| CE-classical-electron-radius | quantum | scalar-up-to-constant | r_e = e^2 / (4\pi \varepsilon_0 m_e c^2) | classical point-charge self-energy scale | Lorentz; Thomson scattering |
| CE-bohr-magneton | quantum | scalar-up-to-constant | \mu_B = e \hbar / (2 m_e) | electron magnetic-moment scale | Bohr 1913; Pauli 1920 |
| CE-planck-einstein | quantum | fully-quantitative | E = h\nu |  | Planck 1900; Einstein 1905 |
| CE-de-broglie | quantum | fully-quantitative | \lambda = h/p |  | de Broglie 1924 |
| CE-bohr-radius | quantum | fully-quantitative | a_0 = 4\pi\varepsilon_0\hbar^2/(m_e e^2) | hydrogen-like; non-relativistic | Bohr 1913 |
| CE-thomson-cross-section | quantum | scalar-up-to-constant | \sigma_T = (8\pi/3) r_e^2 | non-relativistic Thomson limit; free electron | J.J. Thomson; Jackson, Classical Electrodynamics |
| CE-uncertainty-principle | quantum | scalar-up-to-constant | Delta x , Delta p geq hbar/2 | a LOWER BOUND, not an equality; the scalarAst is its saturating case; saturated only by minimum-uncertainty (Gaussian) states | Heisenberg 1927; Kennard 1927; Robertson 1929 Phys. Rev. 34:163 |
| CE-carrier-mobility | condensed-matter | fully-quantitative | \mu = q\tau/m | Drude free-electron model | Ashcroft & Mermin, Solid State Physics |
| CE-electrical-conductivity | condensed-matter | fully-quantitative | \sigma = n q \mu | Drude free-electron model | Ashcroft & Mermin, Solid State Physics (Drude model) |
| CE-drude-resistivity | condensed-matter | fully-quantitative | \rho = m/(n q^2 \tau) | Drude free-electron model | Drude 1900; Ashcroft & Mermin, Solid State Physics |
| CE-hall-coefficient | condensed-matter | fully-quantitative | R_H = 1/(nq) | single-carrier Drude model; low magnetic field | Kittel, Introduction to Solid State Physics |
| CE-drift-velocity | condensed-matter | fully-quantitative | v_d = \mu E | Drude free-electron model; linear-response (low-field) regime | Drude 1900; Ashcroft & Mermin, Solid State Physics |
| CE-fermi-energy | condensed-matter | dimensional | E_F \propto \hbar^2 n^{2/3}/m | degenerate free-electron gas; T ≈ 0 | Ashcroft & Mermin, Solid State Physics |
| CE-fermi-velocity | condensed-matter | dimensional | v_F \propto (\hbar/m) n^{1/3} | degenerate free-electron gas; T ≈ 0 | Ashcroft & Mermin, Solid State Physics |
| CE-plasma-frequency | condensed-matter | dimensional | \omega_p \propto \sqrt{n q^2/(\varepsilon_0 m)} | free-electron gas; long-wavelength (q→0) limit | Kittel, Introduction to Solid State Physics; Ashcroft & Mermin, Solid State Physics |
| CE-debye-frequency | condensed-matter | dimensional | \omega_D \propto v_s n^{1/3} | Debye model of lattice vibrations; linear dispersion | Debye 1912; Kittel, Introduction to Solid State Physics |
| CE-equipartition | statistical | scalar-up-to-constant | \langle E \rangle = \tfrac{3}{2} k_B T | ideal gas; thermal equilibrium; 3 translational DOF | Reif, Fundamentals of Statistical and Thermal Physics |
| CE-stokes-einstein | statistical | scalar-up-to-constant | D = k_B T/(6\pi\mu r) | spherical particle; low Reynolds number | Einstein 1905; Sutherland 1905 |
| CE-kinetic-pressure | statistical | scalar-up-to-constant | P = \tfrac{1}{3} n m \langle v^2 \rangle | ideal gas; isotropic velocity distribution | Maxwell 1860; Reif, Fundamentals of Statistical and Thermal Physics |
| CE-mb-most-probable-speed | statistical | dimensional | v_p = \sqrt{2 k_B T/m} | Maxwell-Boltzmann distribution | Maxwell 1860; Reif, Fundamentals of Statistical and Thermal Physics |
| CE-bernoulli | mechanics | scalar-up-to-constant | \tfrac12 \rho v^2 + \rho g h + P = \text{const} | incompressible; inviscid; steady flow along a streamline | Bernoulli 1738 Hydrodynamica |
| CE-radioactive-decay | quantum | fully-quantitative | N = N_0 e^{-\lambda t} | first-order decay; large-N statistical limit | Rutherford & Soddy 1902 |
| CE-photoelectric | quantum | fully-quantitative | K_{\max} = h f - W | single-photon absorption; above threshold (hf > W) | Einstein 1905 Ann. Phys. 17:132 |
| CE-carnot-efficiency | thermodynamics | fully-quantitative | \eta = 1 - \tfrac{T_c}{T_h} | reversible cycle; two heat reservoirs | Carnot 1824 Réflexions sur la puissance motrice du feu |
| CE-boltzmann-factor | statistical | fully-quantitative | e^{-E/k_B T} | canonical ensemble; thermal equilibrium | Boltzmann 1868 Wien. Ber. 58:517 |
| CE-lorentz-factor | mechanics | fully-quantitative | \gamma = \left(1 - \tfrac{v^2}{c^2}\right)^{-1/2} | special relativity; inertial frames | Einstein 1905 Ann. Phys. 17:891 |
| CE-compton-shift | quantum | fully-quantitative | \Delta\lambda = \tfrac{h}{m_e c}(1 - \cos\theta) | elastic photon-electron scattering; free electron at rest | Compton 1923 Phys. Rev. 21:483 |
| CE-rydberg-formula | quantum | fully-quantitative | \tfrac{1}{\lambda} = R\left(\tfrac{1}{n_1^2} - \tfrac{1}{n_2^2}\right) | hydrogen-like atom; bound-state transition | Rydberg 1890 / Balmer 1885 |
| CE-snell-law | electromagnetism | fully-quantitative | n_2 = n_1 \sin\theta_1 / \sin\theta_2 | geometric optics; planar interface between isotropic media | Snell 1621 / Descartes 1637 |
| CE-malus-law | electromagnetism | fully-quantitative | I = I_0 \cos^2\theta | ideal linear polarizer; coherent linearly-polarized incident light | Malus 1809 |
| CE-first-law-thermodynamics | thermodynamics | fully-quantitative | Delta U = Q - W | closed system; sign convention: Q into the system, W done by the system | Clausius 1850; Callen, Thermodynamics |
| CE-boltzmann-entropy | statistical | fully-quantitative | S = k_B ln W | microcanonical ensemble; equiprobable microstates | Boltzmann 1877 Wien. Ber. 76:373; Planck 1901 |
| CE-normal-distribution | statistical | scalar-up-to-constant | p(x) = rac{1}{sigmasqrt{2pi}} e^{-(x-mu)^2 / 2sigma^2} | sigma > 0; variate taken length-dimensioned as the representative case | Gauss 1809 Theoria Motus; Laplace 1812 Théorie analytique des probabilités |

## Appendix B — complete catalog grounding inventory

These are metadata reported by `coverage --json`. A citation count or a known-issue count is not a quality score. No source details were fetched to resolve the recorded issues.

| Bridge | Status | Grounding tier | Graph edge reported | Citation count | Known-issue count |
|---|---|---|---|---:|---:|
| BE-11 | established | data-confronted | True | 5 | 0 |
| BE-12 | speculative | graph-computable | True | 5 | 1 |
| BE-13 | speculative | graph-computable | True | 8 | 2 |
| BE-14 | speculative | graph-computable | True | 1 | 0 |
| BE-15 | speculative | graph-computable | True | 9 | 1 |
| BE-16 | speculative | graph-computable | True | 10 | 3 |
| BE-17 | speculative | graph-computable | True | 5 | 1 |
| BE-18 | speculative | graph-computable | True | 4 | 1 |
| BE-19 | speculative | graph-computable | True | 3 | 2 |
| BE-20 | speculative | graph-computable | True | 5 | 1 |
| BE-21 | established | data-confronted | True | 5 | 1 |
| BE-22 | speculative | graph-computable | True | 2 | 4 |
| BE-23 | speculative | data-confronted | True | 8 | 1 |
| BE-24 | speculative | graph-computable | True | 10 | 1 |
| BE-25 | speculative | graph-computable | True | 9 | 1 |
| BE-26 | speculative | graph-computable | True | 4 | 1 |
| BE-27 | speculative | graph-computable | True | 5 | 1 |
| BE-28 | speculative | encoded-only | False | 4 | 0 |
| BE-29 | speculative | encoded-only | False | 6 | 1 |
| BE-30 | speculative | graph-computable | True | 6 | 1 |
| BE-31 | speculative | graph-computable | True | 5 | 1 |
| BE-32 | speculative | encoded-only | False | 4 | 1 |
| BE-33 | speculative | graph-computable | True | 5 | 2 |
| BE-34 | established | graph-computable | True | 3 | 1 |
| BE-35 | established | data-confronted | False | 4 | 1 |
| BE-36 | speculative | data-confronted | True | 8 | 2 |
| BE-37 | speculative | data-confronted | True | 8 | 2 |
| BE-38 | speculative | graph-computable | True | 6 | 1 |
| BE-39 | speculative | graph-computable | True | 6 | 3 |
| BE-40 | established | encoded-only | False | 3 | 0 |
| BE-41 | speculative | graph-computable | True | 1 | 1 |
| BE-42 | highly-speculative | graph-computable | True | 7 | 1 |
| BE-43 | speculative | graph-computable | True | 6 | 1 |
| BE-44 | speculative | encoded-only | False | 5 | 1 |
| BE-45 | speculative | graph-computable | True | 1 | 1 |
| BE-46 | highly-speculative | graph-computable | True | 4 | 1 |
| BE-47 | speculative | graph-computable | True | 5 | 0 |
| BE-48 | speculative | data-confronted | True | 6 | 1 |
| BE-49 | speculative | graph-computable | True | 4 | 1 |
| BE-50 | highly-speculative | graph-computable | True | 4 | 1 |
| BE-51 | established | data-confronted | True | 4 | 0 |
| BE-52 | established | data-confronted | True | 4 | 0 |
| BE-53 | established | graph-computable | True | 3 | 0 |
| BE-54 | speculative | graph-computable | True | 3 | 0 |
| BE-55 | established | data-confronted | False | 3 | 0 |
| BE-56 | established | data-confronted | False | 3 | 0 |
| BE-57 | established | encoded-only | False | 3 | 0 |
| BE-58 | established | data-confronted | False | 3 | 0 |
| BE-59 | established | data-confronted | False | 3 | 0 |
| BE-60 | established | data-confronted | False | 3 | 0 |
| BE-61 | established | data-confronted | False | 3 | 0 |
| BE-62 | established | data-confronted | False | 3 | 0 |
| BE-63 | established | data-confronted | False | 3 | 0 |
| BE-64 | established | data-confronted | False | 3 | 0 |
| BE-65 | established | data-confronted | False | 2 | 0 |

## Appendix C — all 20 qualified atlas records

The following are the full CLI records, including every qualification, reported witness, counterexample, and formal-reference limitation. These records were read, not re-executed as tests.

### ab-spring-lc

```text
ab-spring-lc — exact-equivalence [oscillators]
  model-spring (oscillators) → model-lc (oscillators)
transformation: force–voltage analogy m ↔ L, k ↔ 1/C, x ↔ q (so ω0² = k/m ↔ 1/(LC)); u = x/x0 or q/q0, τ = ω0 t; composed, q(t) = (q0/x0)·x(ω_LC t / ω_s)
inverse: x = x0 u, t = τ/ω0
side conditions:
  - m, k, L, C > 0
  - lossless
  - unforced
  - x0, q0 nonzero
regime:
  VACUOUS — states no inequality; the bridge claims no restricted domain
bound:
  none stated
preserves:
  - the natural frequency in units of ω0 (ω = 1 in τ = ω0 t)
  - energy up to scale
  - phase portrait
does NOT preserve:
  - physical interpretation
  - units
stored evidence: numerically-supported, proposed
formally-proved (derived from formalRef): no
symbolically-checked: decided by data/atlas/witness-results.json over W1, W1s (repository artifact, not shipped in the package)
witnesses:
  - W1 [symbolic] tests/atlas/oscillators-exact.test.ts — exact — rational exponent arithmetic, no floating point
  - W1a [numeric] tests/atlas/oscillators-exact.test.ts — |u_spring − u_lc| < 1e-8; each within 1e-8 of cos τ
  - W1b [numeric] tests/atlas/oscillators-exact.test.ts — inverse-mapped trajectory solves m x″ + k x = 0 within 1e-8; a 1% wrong ω0 fails
  - W2b [numeric] tests/atlas/oscillators-exact.test.ts — separation > 1e-2 at τ = π
  - W1s [symbolic] tests/atlas/witness-results.test.ts — CAS: k/m under m ↔ L, k ↔ 1/C minus 1/(LC) simplifies to literal 0
counterexamples:
  - adding R to bridge 1 breaks it: the circuit L = 2, C = 0.125 of witness W2b with R = 4 has ζ_RLC = (R/2)√(C/L) = 0.5, which no lossless spring matches — the trajectories separate by more than 1e-2 at τ = π (witness W2b)
formal reference:
  none — no checked counterpart is recorded
citations:
  - Olson, Dynamical Analogies - the force-voltage (impedance) analogy between a mass-spring–damper and a series RLC circuit
  - Feynman, Lectures on Physics Vol. II, chapter on resonance - the LC oscillator and its mechanical counterpart
review status: proposed
```

### ab-pendulum-linear

```text
ab-pendulum-linear — approximation [oscillators]
  model-pendulum (oscillators) → model-spring (oscillators)
transformation: sin θ → θ, with x ↔ ℓ θ and ω0² = g/ℓ
inverse: none stated
side conditions:
  - θ0 ≤ 0.5 rad
  - the bound is a PERIOD error and is not uniform in time
regime:
  - theta0 <= 0.5 (θ0 ≤ 0.5 rad)
bound:
  K = 1, delta = 0.015852531101436806 (relative period error, normalized by the value of the reduced model)
  domain: θ0 ≤ 0.5 rad
  horizon: t ≪ 16 T0/θ0²; machine form t < 4 T0/θ0², the π/2-drift time
  limit: regular
  uniformity: one period, for θ0 in the stated domain
preserves:
  - harmonic frequency ω0 to O(θ0²)
  - energy conservation
  - time-reversal symmetry
does NOT preserve:
  - the amplitude dependence of the period
  - phase over times t ≳ 16 T0/θ0²
stored evidence: numerically-supported
formally-proved (derived from formalRef): YES
symbolically-checked: no symbolic witness
witnesses:
  - W7 [numeric] tests/atlas/oscillators-limits.test.ts — T/T0 − 1 ∈ [0.002505, 0.002507]; residual ∈ [5.70e-6, 5.76e-6] at θ0 = 0.2
  - W7b [numeric] tests/atlas/oscillators-limits.test.ts — cycles to π/2 drift ∈ [99, 101] at θ0 = 0.2
  - W7c [numeric] tests/atlas/oscillators-limits.test.ts — RK4 zero-crossing lag within 0.05° of the elliptic prediction 89.98°
counterexamples:
  - the approximation is non-uniform in time: at θ0 = 0.2 the phase drift reaches π/2 after ~100 cycles, however small the per-cycle error is (witness W7b)
formal reference:
  lean4-physlib: ClassicalMechanics.SimplePendulum.linearizedEquationOfMotion_iff: for a smooth lift θ, θ̈ + ω²θ = 0 iff θ solves the equation of motion of toHarmonicOscillator (mass mℓ², spring constant mgℓ); with toHarmonicOscillator_ω, ω = √(g/ℓ)
  version physlib@5ad56e24de155462acd8478458292347393d5908 lean4:v4.34.0; axioms propext, Classical.choice, Quot.sound
  fidelity: sanity-lemmas
  covers: the statement above ONLY — not the bound, regime or side conditions unless it says so
citations:
  - Landau & Lifshitz, Mechanics §11 (pendulum period as a complete elliptic integral)
  - Abramowitz & Stegun §17.6 (AGM evaluation of K)
review status: proposed
```

### ab-schrodinger-diffusion

```text
ab-schrodinger-diffusion — analytic-continuation [diffusion]
  model-schrodinger-free (diffusion) → model-fick (diffusion)
transformation: t = −iτ: ψ(x, −iτ) ↦ c(x, τ), with D = ħ/(2m)
inverse: none stated
side conditions:
  - V = 0 (free particle)
  - the continuation is formal: real Schrödinger time maps to imaginary diffusion time
regime:
  VACUOUS — states no inequality; the bridge claims no restricted domain
bound:
  none stated
preserves:
  - linearity
  - the Gaussian kernel structure, with a spread growing linearly in time
does NOT preserve:
  - unitarity: ∫|ψ|² dx is conserved, ∫φ² dx decays
  - oscillation and phase: the oscillating propagator becomes a decaying Gaussian
  - time-reversal symmetry: diffusion is irreversible
stored evidence: numerically-supported, proposed
formally-proved (derived from formalRef): no
symbolically-checked: no symbolic witness
witnesses:
  - W5 [numeric] tests/atlas/quantum-support.test.ts — coefficients ħ/2m, −1, 1/ħ; free-kernel sup-norm residual ratio of ∂τφ = (ħ/2m)∂²φ below 1e-4
  - WD3 [numeric] tests/atlas/diffusion.test.ts — finite-difference residual of ∂τφ = (ħ/2m)∂²φ below 1e-3 at h = 0.025
  - WD3b [numeric] tests/atlas/diffusion.test.ts — ∫φ² dx matches s²√(2π/σ(τ)) within 1e-9 and decreases in τ
counterexamples:
  - The squared norm of the Wick-rotated kernel falls from 1.755 at τ = 0 to 0.580 at τ = 4 (ħ = 1, m = 0.5, s = 0.7), where the Schrödinger norm would be conserved. (witness WD3b)
formal reference:
  none — no checked counterpart is recorded
citations:
  - Feynman & Hibbs, Quantum Mechanics and Path Integrals - the free-particle kernel and its imaginary-time form
  - Nelson, J. Math. Phys. 5 (1964) 332 - Feynman integrals and the Schrödinger equation (the analytic continuation to the heat kernel)
review status: proposed
```

### ab-kg-schrodinger

```text
ab-kg-schrodinger — approximation [waves]
  model-klein-gordon (waves) → model-schrodinger-free (diffusion)
transformation: u = Re(ψ e^{−iω₀t}) with ψ slowly varying; ħ/m ↦ c²/ω₀: ω − ω₀ = ω₀(√(1 + x²) − 1) → ω₀x²/2, x = ck/ω₀
inverse: none stated
side conditions:
  - non-relativistic modes: x = ck/ω₀ ≤ 0.1
  - the bound is a FREQUENCY error, not uniform in time
regime:
  - c · omega0^-1 · k <= 0.1 (ck/ω₀ ≤ 0.1)
bound:
  K = 1, delta = 0.0024875775822101875 (relative error of the kinetic frequency ω − ω₀, normalized by the value of the reduced model)
  domain: x = ck/ω₀ ≤ 0.1
  horizon: t ≪ π/(δ ω₀ x²): the kinetic-phase drift reaches π/2; machine form t < π/(δ ω₀ x²)
  limit: regular
  uniformity: kinetic frequency of one mode, for x = ck/ω₀ ≤ 0.1
preserves:
  - the kinetic frequency ħk²/(2m) to O(x²)
  - linearity
does NOT preserve:
  - the rest-frequency phase e^{−iω₀t}
  - the negative-frequency branch
  - relativistic dispersion at x ≳ 1
stored evidence: numerically-supported, proposed
formally-proved (derived from formalRef): no
symbolically-checked: no symbolic witness
witnesses:
  - WS5 [numeric] tests/atlas/closure.test.ts — kinetic-frequency error below 1e-3 at x = 0.05; falls ≈4× per halving of x
  - WS5b [numeric] tests/atlas/closure.test.ts — relative error 3 − 2√2 = 0.1716 at x = 1, normalized by the reduced value
counterexamples:
  - At x = ck/ω₀ = 1 the non-relativistic kinetic frequency ω₀/2 is 20.7% above the exact ω₀(√2 − 1), which is 17.2% of its own value (the normalization of delta): the limit is a long-wavelength statement. (witness WS5b)
formal reference:
  none — no checked counterpart is recorded
citations:
  - Greiner, Relativistic Quantum Mechanics: Wave Equations - Ch. 1, the Klein-Gordon equation and its non-relativistic limit
review status: proposed
```

### ab-stokes-einstein

```text
ab-stokes-einstein — derivation [diffusion]
  model-langevin (diffusion) + model-stokes-drag (diffusion) → model-fick (diffusion)
transformation: substitute γ = 6πηa into D = k_B T/γ: D = k_B T/(6πηa)
inverse: none stated
side conditions:
  - creeping flow around the sphere, Re ≪ 1 (machine form Re ≤ 0.1: a chosen threshold for "≪ 1")
  - no-slip boundary
  - overdamped times t ≫ m/γ (machine form m/(γt) ≤ 0.01: a chosen threshold for "≪ 1", as in ab-langevin-diffusion)
regime:
  - Re <= 0.1 (Re ≪ 1 (machine form Re ≤ 0.1))
  - m · gamma^-1 · t^-1 <= 0.01 (τ_p/t ≪ 1 (machine form m/(γt) ≤ 0.01))
bound:
  none stated
preserves:
  - the long-time diffusion coefficient of a sphere
does NOT preserve:
  - the particle mass (it drops out)
  - the shape beyond the radius a
stored evidence: numerically-supported, proposed
formally-proved (derived from formalRef): no
symbolically-checked: decided by data/atlas/witness-results.json over WD5s (repository artifact, not shipped in the package)
witnesses:
  - WD5 [numeric] tests/atlas/closure.test.ts — agrees with CE-stokes-einstein to 1e-12 relative; a 1 µm sphere in water at 20 °C gives D = 4.29e-13 m²/s
  - WD5s [symbolic] tests/atlas/witness-results.test.ts — CAS: k_BT/γ under γ ↦ 6πηa minus k_BT/(6πηa) simplifies to literal 0
counterexamples:
  none stated
formal reference:
  none — no checked counterpart is recorded
citations:
  - Einstein, Ann. Phys. 17 (1905) 549 - Brownian motion of a sphere, D = k_B T/(6πηa)
  - Stokes, Trans. Camb. Phil. Soc. 9 (1851) 8 - the drag on a sphere in creeping flow
review status: proposed
```

### ab-telegraph-diffusion

```text
ab-telegraph-diffusion — approximation [diffusion]
  model-telegraph (diffusion) → model-fick (diffusion)
transformation: drop τ u_tt: the slow mode decays at Dq²(1 + ε + 2ε² + …) → Dq², ε = τDq²
inverse: none stated
side conditions:
  - ε = τDq² ≤ 0.05
  - after the initial layer: t ≫ τ
regime:
  - tau · D · q^2 <= 0.05 (ε = τDq² ≤ 0.05)
bound:
  K = 1, delta = 0.055728090000841446 (relative error of the slow-mode decay rate of a Fourier mode, normalized by the value of the reduced model)
  domain: ε = τDq² ≤ 0.05
  horizon: τ ≪ t ≪ 1/(δ D q²): after the initial layer and before the decay-rate error accumulates; machine form 5τ < t < 0.1/(δ D q²)
  limit: singular
  uniformity: slow-mode decay rate of one Fourier mode, for ε = τDq² ≤ 0.05
preserves:
  - the slow decay rate of each Fourier mode to O(ε)
  - the total amount ∫u dx
does NOT preserve:
  - the finite signal speed √(D/τ)
  - the second initial condition u_t(x, 0)
  - oscillatory modes, which exist for ε > 1/4
stored evidence: numerically-supported, proposed
formally-proved (derived from formalRef): no
symbolically-checked: no symbolic witness
witnesses:
  - WD6 [numeric] tests/atlas/closure.test.ts — slow rate / Dq² within 0.03 of 1 at τ = 0.025 (D = q = 1); error halves with τ
  - WD6b [numeric] tests/atlas/closure.test.ts — no real slow rate at ε = 1
counterexamples:
  - At ε = τDq² = 1 the telegraph mode is OSCILLATORY (complex rate, NaN on the slow branch): no diffusion mode oscillates. (witness WD6b)
formal reference:
  none — no checked counterpart is recorded
citations:
  - Cattaneo, Atti Sem. Mat. Fis. Univ. Modena 3 (1948) 83 - heat conduction with a relaxation time
  - Goldstein, Q. J. Mech. Appl. Math. 4 (1951) 129 - On diffusion by discontinuous movements, and on the telegraph equation
review status: proposed
```

### ab-damped-rlc

```text
ab-damped-rlc — exact-equivalence [oscillators]
  model-damped-spring (oscillators) → model-rlc (oscillators)
transformation: force–voltage analogy m ↔ L, k ↔ 1/C, b ↔ R, x ↔ q; u = x/x0 or q/q0, τ = ω0 t; composed, q(t) = (q0/x0)·x(ω_RLC t / ω_mech)
inverse: x = x0 u, t = τ/ω0
side conditions:
  - b/√(mk) = R√(C/L), equivalently ζ_mech = b/(2√(mk)) equals ζ_RLC = (R/2)√(C/L)
  - m, b, k, L, R, C > 0
  - unforced
  - x0, q0 nonzero
regime:
  VACUOUS — states no inequality; the bridge claims no restricted domain
bound:
  none stated
preserves:
  - the natural frequency in units of ω0 (ω = 1 in τ = ω0 t)
  - damping ratio
  - phase portrait
does NOT preserve:
  - physical interpretation
  - units
stored evidence: numerically-supported, proposed
formally-proved (derived from formalRef): no
symbolically-checked: decided by data/atlas/witness-results.json over W2s (repository artifact, not shipped in the package)
witnesses:
  - W2 [numeric] tests/atlas/oscillators-exact.test.ts — R derived exactly; |u_mech − u_rlc| < 1e-8 at four τ
  - W2s [symbolic] tests/atlas/witness-results.test.ts — CAS: b²/(4mk) under m ↔ L, k ↔ 1/C, b ↔ R minus R²C/(4L) simplifies to literal 0
counterexamples:
  none stated
formal reference:
  none — no checked counterpart is recorded
citations:
  - Olson, Dynamical Analogies - the force-voltage (impedance) analogy between a mass-spring–damper and a series RLC circuit
  - Feynman, Lectures on Physics Vol. II, chapter on resonance - the LC oscillator and its mechanical counterpart
review status: proposed
```

### ab-damped-massless

```text
ab-damped-massless — approximation [oscillators]
  model-damped-spring (oscillators) → model-first-order (oscillators)
transformation: m → 0, dropping the m x″ term
inverse: none stated
side conditions:
  - overdamped: m k / b² < 1/4
  - the bound holds only outside the boundary layer, t ≥ 5 m/b
regime:
  - m · b^-2 · k < 0.25 (ζ > 1)
bound:
  K = 1, delta = 3 (sup |x − x_reduced| for t ≥ 5 m/b)
  domain: t ≥ 5 m/b, overdamped, at the witness normalisation b = k = 1
  horizon: t ≥ 5 m/b (outside the boundary layer)
  limit: singular
  uniformity: t ≥ 5 m/b, overdamped, at the witness normalisation b = k = 1; m k / b² < 1/4, |v0| ≤ 5
preserves:
  - the slow relaxation rate k/b to O(m)
  - the sign and monotonicity of the decay
does NOT preserve:
  - the order of the system (two → one)
  - the initial condition x'(0), which the reduced model cannot satisfy
  - the fast mode r ≈ −b/m
stored evidence: numerically-supported
formally-proved (derived from formalRef): no
symbolically-checked: no symbolic witness
witnesses:
  - W8 [numeric] tests/atlas/oscillators-limits.test.ts — |r_slow + k/b| < 2m and |r_fast·m + b| < 2m for m ∈ {1e-1, 1e-2, 1e-3}
  - W8b [numeric] tests/atlas/oscillators-limits.test.ts — |x_full − x_red| < 2(1+v0)·m for t ≥ 5 m/b; |x'| error > 1 at 0.5 m/b and < 0.05 at 5 m/b
counterexamples:
  - inside the boundary layer the reduced model's velocity is wrong by O(1): at t = 0.5 m/b with v0 = 5 the velocity error is 3.6, against x'_red = −1 (witness W8b)
formal reference:
  none — no checked counterpart is recorded
citations:
  - Kevorkian & Cole, Multiple Scale and Singular Perturbation Methods §2 (Tikhonov's theorem)
  - Verhulst, Methods and Applications of Singular Perturbations §8 (boundary layers)
review status: proposed
```

### ab-chain-wave

```text
ab-chain-wave — coarse-graining [oscillators]
  model-chain (oscillators) → model-wave-1d (oscillators)
transformation: u_n(t) ↦ u(x = n a, t), with c² = κ a² / m
inverse: none stated
side conditions:
  - long-wavelength, qa ≪ 1
regime:
  - qa < 1 (qa ≪ 1)
bound:
  none stated
preserves:
  - long-wavelength dispersion ω ≈ c q
  - wave speed c = a √(κ/m)
  - linearity
does NOT preserve:
  - modes with q > π/a
  - the band edge ω_max = 2 √(κ/m) at qa = π
  - the discrete lattice spacing a as an independent scale
stored evidence: dimension-checked, numerically-supported, proposed
formally-proved (derived from formalRef): no
symbolically-checked: no symbolic witness
witnesses:
  - W9 [numeric] tests/atlas/oscillators-coarse.test.ts — relative dispersion error matches (qa)²/24 within 0.5% of itself
  - W9b [numeric] tests/atlas/oscillators-coarse.test.ts — ring of 64 masses integrated: ω matches the lattice dispersion within 1e-9 and the coarse error (qa)²/24 within 1%; superposition within 1e-10 (linearity); a 10% wrong κ and a cubic on-site force each fail
counterexamples:
  - A mode at the band edge qa = π has ω = 2√(κ/m) on the lattice, while the continuum relation ω = c q is unbounded: the coarse-grained model has no band edge at all. (witness W9)
formal reference:
  none — no checked counterpart is recorded
citations:
  - Kittel, Introduction to Solid State Physics - Phonons I: the monatomic linear chain, its dispersion relation and the qa << 1 continuum limit
  - Ashcroft & Mermin, Solid State Physics - the one-dimensional monatomic Bravais lattice and the first Brillouin zone band edge at qa = pi
review status: proposed
```

### ab-walk-diffusion

```text
ab-walk-diffusion — coarse-graining [diffusion]
  model-random-walk (diffusion) → model-fick (diffusion)
transformation: P(n, k)/(2Δx) ↦ c(x = nΔx, t = kΔt), with the closure D = Δx²/(2Δt)
inverse: none stated
side conditions:
  - the closure D = Δx²/(2Δt) is held fixed as Δx, Δt → 0
  - many steps: Δt/t ≪ 1
  - symmetric, unbiased steps
regime:
  - dt · t^-1 <= 0.01 (Δt/t ≪ 1 (machine form ≤ 0.01, the coarse resolution WD1 measures))
bound:
  none stated
preserves:
  - mean-square displacement ⟨x²⟩ = 2Dt, exactly at every step
  - total probability
  - the Gaussian long-time profile
does NOT preserve:
  - the lattice spacing Δx and the step Δt as independent scales — only Δx²/Δt survives
  - parity: after an even number of steps only even sites are occupied
  - the finite propagation speed Δx/Δt: diffusion is positive everywhere at once
stored evidence: numerically-supported, proposed
formally-proved (derived from formalRef): no
symbolically-checked: no symbolic witness
witnesses:
  - WD1 [numeric] tests/atlas/diffusion.test.ts — density at the origin within 1e-4 of (4πDt)^-1/2 at 1000 steps; error shrinks with refinement
  - WD1b [numeric] tests/atlas/diffusion.test.ts — walk density exactly 0 beyond the light cone while the kernel is > 0
counterexamples:
  - After 100 steps the walker cannot be more than 100 sites from the origin, so its density at site 101 is exactly 0, while the diffusion kernel there is positive: the coarse-grained model has no light cone. (witness WD1b)
formal reference:
  none — no checked counterpart is recorded
citations:
  - Einstein, Ann. Phys. 17 (1905) 549 - Brownian motion; the mean-square displacement grows as 2Dt
  - Feller, An Introduction to Probability Theory and Its Applications, Vol. I - the symmetric random walk and the de Moivre-Laplace limit
review status: proposed
```

### ab-heat-diffusion

```text
ab-heat-diffusion — exact-equivalence [diffusion]
  model-heat (diffusion) → model-fick (diffusion)
transformation: T ↦ c, κ/(ρ c_p) ↦ D
inverse: c ↦ T, D ↦ κ/(ρ c_p) (any κ, ρ, c_p with that ratio)
side conditions:
  - homogeneous isotropic medium: κ, ρ, c_p constant
  - no sources and no advection (the Péclet number is not applicable to either model)
regime:
  VACUOUS — states no inequality; the bridge claims no restricted domain
bound:
  none stated
preserves:
  - the solution operator: equal initial data give equal solutions at every t
  - Fourier-mode decay rates D q²
  - the Fourier number D t/ℓ²
does NOT preserve:
  - physical interpretation: temperature versus concentration
  - units
  - the separate values of κ, ρ and c_p — only their ratio survives
stored evidence: numerically-supported, proposed
formally-proved (derived from formalRef): no
symbolically-checked: decided by data/atlas/witness-results.json over WD2s (repository artifact, not shipped in the package)
witnesses:
  - WD2 [numeric] tests/atlas/diffusion.test.ts — FTCS heat solution at x = 0 within 5e-4 of the Fick solution with D = κ/(ρ c_p) at 160 cells
  - WD2s [symbolic] tests/atlas/witness-results.test.ts — CAS: κq²/(ρ c_p) under κ ↦ D ρ c_p minus D q² simplifies to literal 0
counterexamples:
  none stated
formal reference:
  none — no checked counterpart is recorded
citations:
  - Carslaw & Jaeger, Conduction of Heat in Solids - the heat equation and the thermal diffusivity κ/(ρ c_p)
  - Crank, The Mathematics of Diffusion - Fick’s second law and its identity with the heat-conduction equation
review status: proposed
```

### ab-langevin-diffusion

```text
ab-langevin-diffusion — coarse-graining [diffusion]
  model-langevin (diffusion) → model-fick (diffusion)
transformation: average over times t ≫ τ_p = m/γ: ⟨x²⟩ → 2Dt with D = k_B T/γ (Einstein)
inverse: none stated
side conditions:
  - overdamped observation times: τ_p/t ≪ 1
  - white thermal noise, fluctuation–dissipation 2γk_BT
regime:
  - m · gamma^-1 · t^-1 <= 0.01 (τ_p/t ≪ 1 (machine form ≤ 0.01))
bound:
  none stated
preserves:
  - the long-time mean-square displacement
  - the equilibrium velocity variance k_B T/m
does NOT preserve:
  - the velocity as a state variable
  - the ballistic regime t ≲ τ_p, where ⟨x²⟩ ≈ (k_B T/m) t²
  - the momentum relaxation time τ_p as an independent scale
stored evidence: numerically-supported, proposed
formally-proved (derived from formalRef): no
symbolically-checked: no symbolic witness
witnesses:
  - WD4 [numeric] tests/atlas/closure.test.ts — ⟨x²⟩/(2Dt) within 0.02 of 1 at t = 100 τ_p, from the Langevin moment equations by RK4
  - WD4b [numeric] tests/atlas/closure.test.ts — ⟨x²⟩/(2Dt) = 0.0484 at t = 0.1 τ_p
counterexamples:
  - At t = 0.1 τ_p the Langevin mean-square displacement is 0.048 of 2Dt: the particle is still ballistic, ⟨x²⟩ ≈ (k_BT/m)t², and the diffusion model does not describe it. (witness WD4b)
formal reference:
  none — no checked counterpart is recorded
citations:
  - Uhlenbeck & Ornstein, Phys. Rev. 36 (1930) 823 - On the theory of the Brownian motion
  - Einstein, Ann. Phys. 17 (1905) 549 - the relation D = k_B T/γ
review status: proposed
```

### ab-telegraph-wave

```text
ab-telegraph-wave — approximation [diffusion]
  model-telegraph (diffusion) → model-wave-1d (oscillators)
transformation: drop u_t: τ u_tt = D u_xx, a wave with c² = D/τ
inverse: none stated
side conditions:
  - ε = τDq² ≥ 25
  - short times t ≪ τ (the bound is not uniform in time)
regime:
  - tau · D · q^2 >= 25 (ε = τDq² ≥ 25)
bound:
  K = 1, delta = 0.005012562893380035 (relative error of the oscillation frequency of a Fourier mode, normalized by the value of the reduced model)
  domain: ε = τDq² ≥ 25
  horizon: t ≪ τ: before damping e^{−t/(2τ)} removes 10% of the amplitude; machine form t < 2τ ln(10/9)
  limit: regular
  uniformity: oscillation frequency of one Fourier mode, for ε = τDq² ≥ 25
preserves:
  - the signal speed √(D/τ)
  - the oscillation frequency to O(1/ε)
does NOT preserve:
  - damping: telegraph modes decay as e^{−t/(2τ)}
  - relaxation to diffusion at long times
stored evidence: numerically-supported, proposed
formally-proved (derived from formalRef): no
symbolically-checked: no symbolic witness
witnesses:
  - WD7 [numeric] tests/atlas/closure.test.ts — frequency ratio within 3e-3 of 1 at ε = 50; error halves as ε doubles
counterexamples:
  none stated
formal reference:
  none — no checked counterpart is recorded
citations:
  - Goldstein, Q. J. Mech. Appl. Math. 4 (1951) 129 - On diffusion by discontinuous movements, and on the telegraph equation
review status: proposed
```

### ab-heat-laplace

```text
ab-heat-laplace — restriction [diffusion]
  model-heat (diffusion) → model-laplace-1d (diffusion)
transformation: ∂T/∂t = 0: κ T_xx = 0, T linear between the end temperatures
inverse: none stated
side conditions:
  - fixed end temperatures
  - Fourier number αt/ℓ² ≥ 1 (transients decayed)
regime:
  - kappa · rho^-1 · cp^-1 · ell^-2 · t >= 1 (Fo = αt/ℓ² ≥ 1)
bound:
  none stated
preserves:
  - the end temperatures
  - the steady heat flux κ(T_b − T_a)/ℓ
does NOT preserve:
  - the transient
  - ρ and c_p, which drop out of the steady state
stored evidence: numerically-supported, proposed
formally-proved (derived from formalRef): no
symbolically-checked: no symbolic witness
witnesses:
  - WD8 [numeric] tests/atlas/closure.test.ts — max deviation from the linear profile below 0.025 at αt/ℓ² = 0.4; shrinks with time
counterexamples:
  none stated
formal reference:
  none — no checked counterpart is recorded
citations:
  - Carslaw & Jaeger, Conduction of Heat in Solids - steady linear flow in a slab
review status: proposed
```

### ab-string-wave

```text
ab-string-wave — restriction [waves]
  model-string (waves) → model-wave-1d (oscillators)
transformation: y ↦ u, with c² = F/μ
inverse: none stated
side conditions:
  - small slopes |y_x| ≪ 1
  - uniform tension and density
  - perfectly flexible
regime:
  VACUOUS — states no inequality; the bridge claims no restricted domain
bound:
  none stated
preserves:
  - the solution operator for small slopes
  - normal-mode frequencies nπc/ℓ
does NOT preserve:
  - the separate values of F and μ — only F/μ survives
  - the transverse geometry: the wave equation does not know u is a displacement
stored evidence: numerically-supported, proposed
formally-proved (derived from formalRef): no
symbolically-checked: no symbolic witness
witnesses:
  - WS1 [numeric] tests/atlas/waves.test.ts — leapfrog string solution at the midpoint within 2e-4 of sin(πx)cos(πct), c = √(F/μ), at 80 cells
counterexamples:
  none stated
formal reference:
  none — no checked counterpart is recorded
citations:
  - Morse & Ingard, Theoretical Acoustics - the flexible string and its wave equation with c² = T/ρ
review status: proposed
```

### ab-wave-dalembert

```text
ab-wave-dalembert — derivation [waves]
  model-wave-1d (oscillators) → model-dalembert (waves)
transformation: characteristics ξ = x − ct, η = x + ct turn u_tt = c²u_xx into u_ξη = 0
inverse: none stated
side conditions:
  - infinite line, or boundaries handled by the method of images
  - u ∈ C²
regime:
  VACUOUS — states no inequality; the bridge claims no restricted domain
bound:
  none stated
preserves:
  - every C² solution on the whole line
  - the speed c
does NOT preserve:
  - boundary conditions: on a bounded domain f and g are fixed only up to reflections
stored evidence: numerically-supported, proposed
formally-proved (derived from formalRef): no
symbolically-checked: no symbolic witness
witnesses:
  - WS2 [numeric] tests/atlas/waves.test.ts — finite-difference residual |u_tt − c²u_xx| below 2e-3 at h = 0.0125
counterexamples:
  none stated
formal reference:
  none — no checked counterpart is recorded
citations:
  - d'Alembert, Recherches sur la courbe que forme une corde tendue mise en vibration (1747)
  - Strauss, Partial Differential Equations: An Introduction - §2.1, the wave equation on the line
review status: proposed
```

### ab-sound-speed

```text
ab-sound-speed — derivation [waves]
  model-euler-linear (waves) + model-adiabatic-eos (waves) → model-sound (waves)
transformation: close the Euler pair with p′ = (dp/dρ)|ρ₀ ρ′ = (γp₀/ρ₀) ρ′, then eliminate v: p′_tt = (γp₀/ρ₀) p′_xx
inverse: none stated
side conditions:
  - small perturbations: |p′| ≪ p₀
  - adiabatic compression (no heat exchange within a wavelength)
  - fluid at rest, no ambient flow
regime:
  - p0 · p1^-1 >= 100 (|p′| ≪ p₀ (machine form p₀/p₁ ≥ 100))
bound:
  none stated
preserves:
  - linearity
  - the sound speed c_s² = γp₀/ρ₀
does NOT preserve:
  - nonlinear steepening and shocks at finite amplitude
  - viscous and thermal attenuation
stored evidence: numerically-supported, proposed
formally-proved (derived from formalRef): no
symbolically-checked: no symbolic witness
witnesses:
  - WS3 [numeric] tests/atlas/waves.test.ts — staggered Euler + adiabatic-closure solution within 2e-4 of the sound model’s sin(2πx)cos(2πc_s t) at 128 cells
  - WS3b [numeric] tests/atlas/waves.test.ts — air, 101325 Pa, 1.204 kg/m³, γ = 1.4: adiabatic 343.25 m/s, isothermal 290.10 m/s
counterexamples:
  - The adiabatic premise is necessary. Closing the same Euler pair ISOTHERMALLY (Newton) gives √(p₀/ρ₀) = 290.1 m/s for air at 20 °C, 15% below the measured ≈343 m/s; the adiabatic closure gives 343.2 m/s. (witness WS3b)
formal reference:
  none — no checked counterpart is recorded
citations:
  - Laplace, Ann. Chim. Phys. 3 (1816) 238 - the adiabatic correction to Newton’s speed of sound
  - Landau & Lifshitz, Fluid Mechanics §64 - sound waves from the linearized equations of motion
review status: proposed
```

### ab-klein-gordon-wave

```text
ab-klein-gordon-wave — approximation [waves]
  model-klein-gordon (waves) → model-wave-1d (oscillators)
transformation: drop the mass term ω₀²u; ω(k) = √(c²k² + ω₀²) → ck
inverse: none stated
side conditions:
  - short wavelengths: ω₀/(ck) ≤ 0.1
  - the bound is a PHASE-VELOCITY error, not uniform in time
regime:
  - c · omega0^-1 · k >= 10 (ω₀/(c k) ≤ 0.1)
bound:
  K = 1, delta = 0.00498756211208895 (relative phase-velocity error of a Fourier mode, normalized by the value of the reduced model)
  domain: ω₀/(c k) ≤ 0.1
  horizon: t ≪ π/(2 c k δ): the phase drift reaches π/2; machine form t < π/(2 c k δ(ω₀, c, k))
  limit: regular
  uniformity: phase velocity of one Fourier mode, for ω₀/(ck) ≤ 0.1
preserves:
  - the wave speed c for short wavelengths
  - linearity
does NOT preserve:
  - dispersion: wave packets spread under Klein–Gordon and not under the wave equation
  - the gap: Klein–Gordon has no mode below ω₀
stored evidence: numerically-supported, proposed
formally-proved (derived from formalRef): no
symbolically-checked: no symbolic witness
witnesses:
  - WS4 [numeric] tests/atlas/waves.test.ts — phase velocity within 2e-3 of c at k = 20 (ω₀ = c = 1); error falls ≈4× per doubling of k
  - WS4b [numeric] tests/atlas/waves.test.ts — relative phase error √2 − 1 at ω₀/(ck) = 1
counterexamples:
  - At ω₀/(c k) = 1 the phase velocity is √2 c: a 41% error. The dispersion-free limit is a short-wavelength statement and fails for the long waves the domain excludes. (witness WS4b)
formal reference:
  none — no checked counterpart is recorded
citations:
  - Whitham, Linear and Nonlinear Waves - §11.1, dispersive waves and the Klein-Gordon equation
review status: proposed
```

### ab-kg-oscillator

```text
ab-kg-oscillator — restriction [waves]
  model-klein-gordon (waves) → model-spring (oscillators)
transformation: u(x, t) = u(t): u_tt = −ω₀² u; u ↦ x, ω₀² ↦ k/m
inverse: none stated
side conditions:
  - spatially uniform initial data
  - periodic or infinite domain (no boundary forcing)
regime:
  VACUOUS — states no inequality; the bridge claims no restricted domain
bound:
  none stated
preserves:
  - the k = 0 mode exactly
  - the frequency ω₀
does NOT preserve:
  - every mode with k ≠ 0
  - spatial structure
stored evidence: numerically-supported, proposed
formally-proved (derived from formalRef): no
symbolically-checked: no symbolic witness
witnesses:
  - WS6 [numeric] tests/atlas/closure.test.ts — uniform leapfrog field within 3e-4 of cos(ω₀t) at 100 steps (ω₀ = 2, t = 3); ≈4× per halving
counterexamples:
  none stated
formal reference:
  none — no checked counterpart is recorded
citations:
  - Whitham, Linear and Nonlinear Waves - §11.1, dispersive waves and the Klein-Gordon equation
review status: proposed
```

### ab-stiff-string

```text
ab-stiff-string — approximation [waves]
  model-stiff-string (waves) → model-string (waves)
transformation: drop EI y_xxxx: ω² = (F/μ)k² + (EI/μ)k⁴ → (F/μ)k²
inverse: none stated
side conditions:
  - β = EIk²/F ≤ 0.01
  - the bound is a PHASE-VELOCITY error, not uniform in time
regime:
  - F · EI^-1 · k^-2 >= 100 (β = EIk²/F ≤ 0.01)
bound:
  K = 1, delta = 0.00498756211208895 (relative phase-velocity error of a Fourier mode, normalized by the value of the reduced model)
  domain: β = EIk²/F ≤ 0.01
  horizon: t ≪ π/(2 c k δ): the phase drift reaches π/2; machine form t < π/(2 √(F/μ) k δ)
  limit: regular
  uniformity: phase velocity of one Fourier mode, for β = EIk²/F ≤ 0.01
preserves:
  - the wave speed √(F/μ) for long wavelengths
  - harmonic partials to O(β)
does NOT preserve:
  - inharmonicity: high partials of a stiff string are sharp
  - the fourth-order boundary conditions
stored evidence: numerically-supported, proposed
formally-proved (derived from formalRef): no
symbolically-checked: no symbolic witness
witnesses:
  - WS7 [numeric] tests/atlas/closure.test.ts — phase velocity within 0.15 of √(F/μ) = 100 at k = 5 (EI/F = 1e-4); ≈4× per halving of k
  - WS7b [numeric] tests/atlas/closure.test.ts — relative phase error √2 − 1 at β = 1
counterexamples:
  - The partials of a stiff string are sharp: at β = 1 the phase velocity is √2 times the flexible-string value, the inharmonicity piano tuners stretch octaves to accommodate. (witness WS7b)
formal reference:
  none — no checked counterpart is recorded
citations:
  - Fletcher, J. Acoust. Soc. Am. 36 (1964) 203 - Normal vibration frequencies of a stiff piano string
review status: proposed
```

## Appendix D — execution index and completeness

The captured post-build session contains **114 CLI invocations**. Exit-code distribution: `0`: 101, `1`: 7, `2`: 3, `3`: 3. These include deliberate negative controls, scope refusals, an exploratory usage error, and the reproducible logarithm failure. Nonzero exits are not all software defects. The initial pre-build failure and setup commands are described in §2 and were observed before this structured logger was created.

| Evidence ID | CLI command | Exit |
|---|---|---:|
| C001 | `upt version` | 0 |
| C002 | `upt help` | 0 |
| C003 | `upt canonical --vars` | 0 |
| C004 | `upt map --source=canonical` | 0 |
| C005 | `upt map --source=both` | 0 |
| C006 | `upt coverage` | 0 |
| C007 | `upt recover` | 0 |
| C008 | `upt help regime` | 0 |
| C009 | `upt help path` | 0 |
| C010 | `upt atlas` | 0 |
| C011 | `upt evaluate` | 0 |
| C012 | `upt discover --source=canonical` | 0 |
| C013 | `upt discover --source=both` | 0 |
| C014 | `upt confront` | 0 |
| C015 | `upt symbolic --simplify` | 0 |
| C016 | `upt probe scan` | 0 |
| C017 | `upt axes` | 0 |
| C018 | `upt atlas ab-spring-lc` | 0 |
| C019 | `upt atlas ab-pendulum-linear` | 0 |
| C020 | `upt atlas ab-schrodinger-diffusion` | 0 |
| C021 | `upt atlas ab-kg-schrodinger` | 0 |
| C022 | `upt atlas ab-stokes-einstein` | 0 |
| C023 | `upt atlas ab-telegraph-diffusion` | 0 |
| C024 | `upt path model-pendulum model-spring --at theta0=0.2 T0=1 t=10` | 0 |
| C025 | `upt path model-pendulum model-spring --at theta0=0.2 T0=1 t=1000` | 3 |
| C026 | `upt path model-pendulum model-lc` | 0 |
| C027 | `upt regime diffusion --at tau=1 D=1 q=1` | 0 |
| C028 | `upt regime waves` | 0 |
| C029 | `upt regime oscillators --at theta0=0.2` | 0 |
| C030 | `upt explain hawking-temperature mass=1.989e30` | 0 |
| C031 | `upt explain landauer-erasure-energy mass=1.989e30` | 0 |
| C032 | `upt eval 'hbar*c^3/(8*pi*G*M*k_B)' hbar=1.054571817e-34 c=299792458 G=6.6743e-11 M=1.989e30 k_B=1.380649e-23` | 0 |
| C033 | `upt eval 'hbar*c^3*ln(2)/(8*pi*G*M)' hbar=1.054571817e-34 c=299792458 G=6.6743e-11 M=1.989e30` | 2 |
| C034 | `upt evaluate be-58 T_K=300 R_ohm=1000` | 0 |
| C035 | `upt eval 'sqrt(4*k*T*R*B)' k=1.380649e-23 T=300 R=1000 B=10000` | 0 |
| C036 | `upt evaluate be-59 V_volts=0.001` | 0 |
| C037 | `upt evaluate be-55 C=1` | 0 |
| C038 | `upt evaluate be-60 nu=0.3333333333333333` | 0 |
| C039 | `upt evaluate be-61 sigma_S_per_m=58000000 T_K=300` | 0 |
| C040 | `upt evaluate be-62 T_c_K=1.2` | 0 |
| C041 | `upt evaluate be-56 d_m=0.000001` | 0 |
| C042 | `upt evaluate be-57 a_m_s2=9.81` | 0 |
| C043 | `upt evaluate be-63 mu_e=2` | 0 |
| C044 | `upt evaluate be-64 M_kg=1.989e30` | 0 |
| C045 | `upt evaluate be-65 T_K=10 rho_kg_per_m3=1e-16 mu=2.33` | 0 |
| C046 | `upt evaluate be-51 M_kg=1.989e30 b_m=6.957e8` | 0 |
| C047 | `upt evaluate be-52 M_kg=1.989e30 a_m=5.7909e10 e=0.20563 T_yr=0.2408467` | 0 |
| C048 | `upt eval 'ln(2)' --debug` | 2 |
| C049 | `upt eval 'log(2)' --debug` | 0 |
| C050 | `upt eval 'hbar*c^3*log(2)/(8*pi*G*M)' hbar=1.054571817e-34 c=299792458 G=6.6743e-11 M=1.989e30` | 0 |
| C051 | `upt derive period:time length:length gravity:acceleration --formula '2*pi*sqrt(length/gravity)'` | 0 |
| C052 | `upt derive period:time length:length gravity:acceleration --formula 'pi*sqrt(length/gravity)'` | 3 |
| C053 | `upt map --source=canonical --equation 'period = mass'` | 3 |
| C054 | `upt audit` | 0 |
| C055 | `upt eval '2*pi*sqrt(length/gravity)' length=1 gravity=9.81` | 0 |
| C056 | `upt priority` | 0 |
| C057 | `upt predict` | 0 |
| C058 | `upt eval 'k*T/(6*pi*eta*a)' k=1.380649e-23 T=293.15 eta=0.001 a=0.000001` | 0 |
| C059 | `upt connectors` | 0 |
| C060 | `upt ground compton-wavelength hubble-distance` | 1 |
| C061 | `upt map --source=both --evidence=formally-proved` | 0 |
| C062 | `upt path model-spring model-lc` | 0 |
| C063 | `upt map --source=canonical --format=mermaid --out=/root/docs/audit/canonical-physics-map.mmd` | 0 |
| C064 | `upt path model-klein-gordon model-schrodinger-free --at c=1 omega0=1 k=0.05 t=10` | 1 |
| C065 | `upt map --source=both --format=svg --out=/root/docs/audit/combined-physics-map.svg` | 0 |
| C066 | `upt path model-klein-gordon model-schrodinger-free --at c=1 omega0=1 k=1 t=10` | 1 |
| C067 | `upt path model-telegraph model-fick --at tau=0.01 D=1 q=1 t=1` | 0 |
| C068 | `upt confront --bridge=be-37 --sensitivity` | 0 |
| C069 | `upt confront --frontier` | 0 |
| C070 | `upt atlas ab-damped-rlc` | 0 |
| C071 | `upt atlas ab-damped-massless` | 0 |
| C072 | `upt atlas ab-chain-wave` | 0 |
| C073 | `upt atlas ab-walk-diffusion` | 0 |
| C074 | `upt atlas ab-heat-diffusion` | 0 |
| C075 | `upt atlas ab-langevin-diffusion` | 0 |
| C076 | `upt atlas ab-telegraph-wave` | 0 |
| C077 | `upt atlas ab-heat-laplace` | 0 |
| C078 | `upt atlas ab-string-wave` | 0 |
| C079 | `upt atlas ab-wave-dalembert` | 0 |
| C080 | `upt atlas ab-sound-speed` | 0 |
| C081 | `upt atlas ab-klein-gordon-wave` | 0 |
| C082 | `upt atlas ab-kg-oscillator` | 0 |
| C083 | `upt atlas ab-stiff-string` | 0 |
| C084 | `upt help ground` | 0 |
| C085 | `upt ground barrier-width compton-wavelength` | 1 |
| C086 | `upt regime waves --at c=1 omega0=1 k=0.05` | 0 |
| C087 | `upt regime waves --at c=1 omega0=1 k=1` | 0 |
| C088 | `upt evaluate be-58 T_K=-1 R_ohm=1000` | 1 |
| C089 | `upt evaluate be-56 d_m=0` | 1 |
| C090 | `upt eval 'k*T/(6*pi*eta*a)' k=1.380649e-23 T=293.15 eta=0.001 a=0.0000005` | 0 |
| C091 | `upt eval '1/sqrt(L*C)' L=2 C=0.125` | 0 |
| C092 | `upt eval 'sqrt(k/m)' k=8 m=2` | 0 |
| C093 | `upt eval 'sqrt(1+x^2)-1' x=0.05` | 0 |
| C094 | `upt eval 'x^2/2' x=0.05` | 0 |
| C095 | `upt eval '1-2/(sqrt(1+x^2)+1)' x=1` | 0 |
| C096 | `upt eval '4*k*T*R' k=1.380649e-23 T=300 R=1000` | 0 |
| C097 | `upt eval 'h/(e^2)' h=6.62607015e-34 e=1.602176634e-19` | 0 |
| C098 | `upt eval '2*e*V/h' e=1.602176634e-19 V=0.001 h=6.62607015e-34` | 0 |
| C099 | `upt canonical --json` | 0 |
| C100 | `upt eval '4*G*M/(c^2*b)*180*3600/pi' G=6.6743e-11 M=1.989e30 c=299792458 b=6.957e8` | 0 |
| C101 | `upt coverage --json` | 0 |
| C102 | `upt discover --source=catalog --json` | 0 |
| C103 | `upt eval '6*pi*G*M/(a*(1-e^2)*c^2)*180*3600/pi*100/T' G=6.6743e-11 M=1.989e30 a=5.7909e10 e=0.20563 c=299792458 T=0.2408467` | 0 |
| C104 | `upt discover --source=canonical --derive --json` | 0 |
| C105 | `upt probe help` | 2 |
| C106 | `upt help probe` | 0 |
| C107 | `upt explain schrodinger-equation --source=canonical` | 1 |
| C108 | `upt ground landauer-erasure-energy barrier-height` | 0 |
| C109 | `upt probe run --problem=tests/fixtures/discovery/pendulum-scaling/public/problem.json` | 0 |
| C110 | `upt probe reproduce --problem=tests/fixtures/discovery/pendulum-scaling/public/problem.json` | 0 |
| C111 | `upt eval 'k*T*log(2)/h' k=1.380649e-23 T=300 h=6.62607015e-34` | 0 |
| C112 | `upt eval 'h*nu/c^2' h=6.62607015e-34 nu=500000000000000 c=299792458` | 0 |
| C113 | `upt eval 'sqrt(gamma*p/rho)' gamma=1.4 p=101325 rho=1.204` | 0 |
| C114 | `upt eval 'sqrt(p/rho)' p=101325 rho=1.204` | 0 |
