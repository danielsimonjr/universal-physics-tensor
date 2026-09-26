# Universal Physics Tensor — full CLI transcript

Captured stdout and stderr from the post-build exploration. Outputs are not edited to remove errors or negative results. Each evidence ID matches the report index.

## C001

UTC: 2026-09-26T17:02:23.328386+00:00  
Exit: 0

```bash
upt version
```

stdout:

```text
0.47.1

```

stderr:

```text

```

## C002

UTC: 2026-09-26T17:02:24.257335+00:00  
Exit: 0

```bash
upt help
```

stdout:

```text
upt — Universal Physics Tensor bridge-inference CLI

Usage:
  upt explain <quantity> [name=value | name] ...
        Explain how the graph determines a quantity: the identifiability
        verdict, recovered value, derivation chains, and whether the inputs
        are dimensionally sufficient. A name that is not a quantity of the
        graph is reported NOT COVERED, with near names, and exits 1.
        e.g.  upt explain hawking-temperature mass=1.989e30

  upt priority
        Triage the speculative bridges by structural DECIDABILITY against
        established physics (Tiers 1-3). NOT a credibility ranking.

  upt audit
        Try to derive every built-in bridge equation by dimensions: which
        re-derive as a recognized monomial (with the prefactor recovered),
        which are decoys, which are dimensionally open.

  upt map [--source=catalog|canonical|both] [--format=text|mermaid|dot|svg]
          [--proposed] [--out=PATH] [--equation "TARGET = EXPR"]
        Map how the equations LINK: connected components (clusters) of the
        graph by shared quantities, the anchored core, the link hubs, and
        the isolated tail.
        --format=mermaid|dot|svg emits the VISUAL map (quantities = nodes,
        equations = junctions colored by status, one subgraph per component).
        text (default) is the unchanged linkage printout. svg renders the dot
        layout via the optional @viz-js/viz peer (npm i @viz-js/viz; or pipe
        dot through "dot -Tsvg"). --proposed overlays the unadjudicated
        identity-consequence relations (gray dashed). --out writes to a file
        (default stdout).
        --equation "TARGET = EXPR" injects YOUR OWN equation as a violet 'user'
        node and reports where it lands (which cluster / shared quantities), with
        a "did you mean?" hint for names that miss the catalog vocabulary. Use
        underscores for multi-word quantities (photon_energy -> photon-energy).
        e.g.  upt map --equation "period = 2*pi*sqrt(length/gravity)"

  upt candidates [--source=catalog|canonical|both]
        Propose candidate cross-cluster links (quantities of the same
        dimension in different clusters) for PHYSICIST REVIEW — a
        coincidence-heavy surface, not discovered bridges.

  upt predict
        Project the catalog onto the (scale × force) regime plane and rank
        the EMPTY regime cells as undiscovered-connection hypotheses
        (triadic closure). Makes the namesake tensor operational. Review
        surface, not discovered bridges.

  upt discover [--source=catalog|canonical|both]
        VET the link candidates through the inference suite: hypothesise
        each identification a≡b and test whether it merges disconnected
        physics, unlocks quantities, and stays numerically consistent.
        Ranks promising / inert / contradictory.
        --source=canonical runs the funnel on the standard-physics L-layer
        ALONE (bridges excluded) — new candidates from established physics,
        and a self-consistency check (expect 0 contradictory).
        --derive emits, for each 'promising' identification, the ONE algebraic
        relation it implies (monomial elimination) as an UNADJUDICATED, math-only
        proposal — NOT a bridge (Part-VI §XXVII-B). Pairs with --source=canonical.
        --max-orders=N tunes the magnitude-clash threshold (default 3); looser N
        keeps more candidates 'promising', tighter N falsifies more as clashes.
        --anchor=k=v[,k2=v2] overrides the numeric anchor (default mass=M_sun)
        for the consistency/closure check. Both reshape the candidate pool that
        --derive consumes.

  upt connectors
        Of the 20 ISOLATED bridges, which could connect to the anchored
        core via a same-dimension identification? The structural frontier —
        same-kind connectors are the motivated set for physicist review.

  upt coverage
        Audit the catalog's empirical grounding — which bridges are
        data-confronted vs graph-computable vs encoded-only vs thin — to
        target the physicist review. Fabricates nothing.

  upt canonical
        List the canonical-equation registry — the standard-physics L-layer
        (textbook "answer key") with each entry's fidelity (L0/L1/L2),
        domain, and bridge partners, plus the coverage gap.

  upt recover
        Validate bridges against standard physics: classify each bridge↔
        canonical link as restates-canonical (F4 circularity — NOT a
        discovery), recovers (undeclared structural match), or
        dimensional-only.

  upt symbolic [--simplify]
        Compose bridges' SYMBOLIC (AST) forms, not just their numeric
        evaluators (the Observable contract). Shows the CT-1 / CT-1b chains
        composed by substitution, dimensionally validated and evaluable.
        With --simplify, folds the composed AST via MathTS (k_B cancels),
        re-validated dimensionally + numerically.

  upt eval "<formula>" name=value ...
        Evaluate YOUR OWN scalar formula (safe — arithmetic only). Knows
        pi/tau and sqrt/exp/ln/sin/...; any other name must be supplied.
        e.g.  upt eval "hbar*c^3/(8*pi*G*M*k_B)" hbar=1.054571817e-34 \
                       c=299792458 G=6.6743e-11 M=1.989e30 k_B=1.380649e-23

  upt derive <target:dim> <var:dim> ... [--formula "<expr>"]
        Derive YOUR OWN equation's dimensional form. <dim> is a named
        dimension (length, time, mass, velocity, ...), a constant (hbar, c,
        G, k_B, e), or explicit (L^3.M^-1.T^-2). With --formula, also verify
        it and recover the dimensionless prefactor.
        e.g.  upt derive period:time length:length gravity:acceleration \
                       --formula "2*pi*sqrt(length/gravity)"

  upt confront [--bridge=be-XX] [--rigor=stringent|moderate|loose] [--frontier]
               [--sensitivity]
        Run the catalog's committed real-data confrontations (predicted vs
        observed), each tagged with its RIGOR tier. --rigor filters to one tier
        (the precision core, or the loose tail that needs better data); --frontier
        ranks the σ-tests by margin to exclusion (tightest = most at-risk under new
        data); --sensitivity ranks the prediction's input elasticities.

  upt axes
        Axis-discrimination audit — which tensor classification axes GATE the
        discovery funnel (an axis gates only when it MEASURABLY fires). Reproduces
        the rank-7 result (topology/statistics/symmetry classify but do not gate).

  upt evaluate <be-NN> key=value ...
        Numerically evaluate a closed-form / spacetime bridge (BE-51/52/55..65).
        With no bridge id, lists the evaluable bridges and their input keys.
        e.g.  upt evaluate be-63 mu_e=2   → Chandrasekhar mass ≈ 1.456 M_sun
              (ideal degenerate gas, with m_u and M_sun = 1.989e30 kg)

  upt ground <quantityA> <quantityB>
        The epistemic-grounding ledger for one discovery candidate a=b: which
        falsifiers passed, which abstained (gaps), and the honest ceiling.

  upt regime <family> [--at group=value ...]
        Where in parameter space a family's models are claimed to apply. Each
        model reads valid, VIOLATED (naming the failed inequality), or UNKNOWN
        — a coordinate --at never supplied is NOT a pass. Also prints the
        pairwise regime overlap and, over the box --at states, the uncovered
        points. A group can be given by name (spaces ignored, * for ·) or
        through its parameters (--at tau=1 D=1 q=1 gives tau · D · q^2 = 1);
        a key no record uses is named and ignored.
        e.g.  upt regime oscillators --at theta0=0.2

  upt path <from> <to> [--at group=value ...]
        The chain of bridges between two models, the relation it composes to,
        the composed (K, delta) with its norm, and whether every bridge's regime
        and every horizon still holds at --at (a bound outside its regime is
        not claimed). When the composition table declines to compose, the path
        carries no bound: it prints 'no composite claim' and exits 0.
        e.g.  upt path model-pendulum model-spring --at theta0=0.2 T0=1 t=10

  upt atlas [<bridge-id>]
        One atlas bridge with EVERY qualification visible: relation, side
        conditions, regime, bound and horizon, witnesses, counterexamples and
        formal reference. Empty sections print as "none stated". With no id,
        lists every bridge of every family.
        e.g.  upt atlas ab-pendulum-linear

  upt probe <scan|show|run|candidates|falsify|rank|design|reproduce>
        Experimental expression/residual search (Product B). Orthogonal to
        `upt discover`, which vets quantity identifications a≡b and is frozen.
        Relation-link gaps are not searchable here — use `upt discover`.

  upt help        Show this message.

Run with no arguments for a short demo.

  upt version     Show the installed CLI/package version.
  --json          Global flag: emit a machine-readable JSON envelope instead of
                  text (where the command supports it).

```

stderr:

```text

```

## C003

UTC: 2026-09-26T17:02:25.119689+00:00  
Exit: 0

```bash
upt canonical --vars
```

stdout:

```text

Canonical-equation registry — the standard-physics L-layer (Π = L + B + E)
the textbook "answer key" bridge equations are validated against.

  107 entries:

   fid  id                       target                 variables
   ──────────────────────────────────────────────────────────────────────────
   L0   CE-pendulum-period       period                 length, gravity
   L0   CE-kepler-third          period                 semi-major-axis, G, mass
   L0   CE-schwarzschild-radius  radius                 mass, G, c
   L0   CE-string-wave-speed     speed                  tension, linear-density
   L0   CE-planck-length         planck-length          hbar, G, c
   L0   CE-planck-mass           planck-mass            hbar, c, G
   L0   CE-planck-time           planck-time            hbar, G, c
   L0   CE-compton-wavelength    compton-wavelength     hbar, mass, c
   L0   CE-thermal-de-broglie    thermal-wavelength     hbar, mass, boltzmann, temperature
   L2   CE-einstein-field-eq     efe-curvature          G, c, stress-energy-density
   L1   CE-friedmann             hubble-rate-squared    G, rho
   L1   CE-hawking-temperature   hawking-temperature    hbar, c, G, mass, k_B
   L1   CE-light-deflection      light-deflection       G, mass, c, impact_parameter
   L1   CE-perihelion-precession perihelion-precession  G, mass, c, a
   L1   CE-bekenstein-hawking    bh-entropy             k_B, c, A, G, hbar
   L1   CE-newton-gravitation    gravitational-force    G, mass, secondary-mass, r
   L1   CE-newton-second-law     force                  mass, acceleration
   L1   CE-mass-energy           rest-energy            mass, c
   L1   CE-momentum              p                      mass, velocity
   L1   CE-kinetic-energy        kinetic-energy         mass, speed
   L1   CE-rotational-kinetic-energy rotational-kinetic-energy moment-of-inertia, angular-velocity
   L1   CE-gravitational-potential-energy gravitational-potential-energy G, mass, secondary-mass, r
   L1   CE-work                  work                   force, distance
   L1   CE-spring-potential-energy spring-potential-energy spring-constant, displacement
   L1   CE-power                 power                  force, velocity
   L1   CE-centripetal-force     force                  mass, speed, radius
   L1   CE-hooke-law             force                  spring-constant, displacement
   L1   CE-torque                torque                 radius, force
   L1   CE-angular-momentum      angular-momentum       radius, p
   L1   CE-moment-of-inertia     moment-of-inertia      mass, radius
   L1   CE-impulse               p                      force, time
   L0   CE-simple-harmonic-frequency angular-velocity       spring-constant, mass
   L1   CE-ohm-law               voltage                current, resistance
   L1   CE-electrical-power      power                  current, voltage
   L1   CE-resistance-material   resistance             resistivity, length, area
   L1   CE-capacitance-parallel-plate capacitance            epsilon_0, area, distance
   L1   CE-capacitor-energy      energy                 capacitance, voltage
   L1   CE-inductor-energy       energy                 inductance, current
   L1   CE-magnetic-field-wire   magnetic-field         mu_0, current, distance
   L1   CE-cyclotron-frequency   cyclotron-frequency    charge, magnetic-field, mass
   L1   CE-larmor-radius         larmor-radius          mass, speed, charge, magnetic-field
   L1   CE-point-charge-field    electric-field         charge, epsilon_0, r
   L0   CE-lc-resonance          angular-frequency      inductance, capacitance
   L1   CE-coulomb               coulomb-force          q_1, q_2, epsilon_0, r
   L1   CE-lorentz-force         lorentz-force          q, v, B
   L1   CE-rc-time-constant      rc-time-constant       resistance, capacitance
   L1   CE-poynting-flux         poynting-flux          electric-field, magnetic-flux-density, mu_0
   L1   CE-solenoid-field        solenoid-field         mu_0, turn-density, current
   L1   CE-larmor-power          larmor-power           charge, acceleration, epsilon_0, speed-of-light
   L1   CE-field-energy-density  field-energy-density   epsilon_0, electric-field
   L1   CE-hydrostatic-pressure  pressure               density, g, height
   L1   CE-pressure-definition   pressure               force, area
   L1   CE-density-definition    density                mass, volume
   L1   CE-buoyant-force         force                  density, volume, g
   L1   CE-stokes-drag           force                  viscosity, radius, speed
   L1   CE-wave-speed            speed                  frequency, wavelength
   L0   CE-sound-speed           speed                  pressure, density
   L1   CE-volume-flow-rate      volume-flow-rate       cross-sectional-area, flow-velocity
   L1   CE-shear-stress          shear-stress           dynamic-viscosity, velocity-gradient
   L1   CE-laplace-pressure      laplace-pressure       surface-tension, droplet-radius
   L1   CE-dynamic-pressure      dynamic-pressure       density, flow-velocity
   L1   CE-oscillator-energy     oscillator-energy      spring-constant, amplitude
   L1   CE-heat-capacity         heat-energy            mass, specific-heat, temperature-change
   L1   CE-half-life             half-life              decay-constant
   L1   CE-hubble-distance       hubble-distance        c, hubble-rate
   L1   CE-landauer              erasure-energy         k_B, temperature
   L1   CE-jarzynski             free-energy-difference k_B, temperature
   L1   CE-stefan-boltzmann      radiative-flux         sigma_sb, temperature
   L1   CE-ideal-gas             pressure               k_B, temperature, V
   L1   CE-wien                  peak-wavelength        b, temperature
   L1   CE-latent-heat           latent-heat            mass, specific-latent-heat
   L1   CE-clausius-entropy      entropy-change         heat, temperature
   L1   CE-thermal-diffusivity   thermal-diffusivity    thermal-conductivity, density, specific-heat-capacity
   L1   CE-rydberg-energy        rydberg-energy         m_e, e, epsilon_0, hbar
   L1   CE-classical-electron-radius classical-electron-radius e, epsilon_0, m_e, c
   L1   CE-bohr-magneton         bohr-magneton          e, hbar, m_e
   L1   CE-planck-einstein       photon-energy          h, nu
   L1   CE-de-broglie            de-broglie-wavelength  h, p
   L1   CE-bohr-radius           bohr-radius            epsilon_0, hbar, m_e, e
   L1   CE-thomson-cross-section thomson-cross-section  classical-electron-radius
   L1   CE-uncertainty-principle position-momentum-uncertainty-product hbar
   L1   CE-carrier-mobility      carrier-mobility       charge, relaxation-time, mass
   L1   CE-electrical-conductivity electrical-conductivity carrier-density, charge, carrier-mobility
   L1   CE-drude-resistivity     electrical-resistivity mass, carrier-density, charge, relaxation-time
   L1   CE-hall-coefficient      hall-coefficient       carrier-density, charge
   L1   CE-drift-velocity        drift-velocity         carrier-mobility, electric-field
   L0   CE-fermi-energy          fermi-energy           reduced-planck-constant, mass, carrier-density
   L0   CE-fermi-velocity        fermi-velocity         reduced-planck-constant, mass, carrier-density
   L0   CE-plasma-frequency      plasma-frequency       carrier-density, charge, vacuum-permittivity, mass
   L0   CE-debye-frequency       debye-frequency        sound-speed, number-density
   L1   CE-equipartition         thermal-energy         boltzmann-constant, temperature
   L1   CE-stokes-einstein       diffusion-coefficient  boltzmann-constant, temperature, dynamic-viscosity, particle-radius
   L1   CE-kinetic-pressure      kinetic-pressure       number-density, molecular-mass, mean-square-speed
   L0   CE-mb-most-probable-speed most-probable-speed    boltzmann-constant, temperature, molecular-mass
   L1   CE-bernoulli             bernoulli-total-pressure density, flow-velocity, gravitational-acceleration, height, static-pressure
   L1   CE-radioactive-decay     remaining-nuclei       initial-nuclei, decay-constant, elapsed-time
   L1   CE-photoelectric         photoelectron-max-energy planck-constant, photon-frequency, work-function
   L1   CE-carnot-efficiency     carnot-efficiency      cold-reservoir-temperature, hot-reservoir-temperature
   L1   CE-boltzmann-factor      boltzmann-factor       state-energy, boltzmann-constant, temperature
   L1   CE-lorentz-factor        lorentz-factor         velocity, speed-of-light
   L1   CE-compton-shift         compton-wavelength-shift planck-constant, electron-mass, speed-of-light, scattering-angle
   L1   CE-rydberg-formula       inverse-transition-wavelength rydberg-constant, lower-level-n, upper-level-n
   L1   CE-snell-law             refracted-index        incident-index, angle-of-incidence, angle-of-refraction
   L1   CE-malus-law             transmitted-intensity  incident-intensity, polarization-angle
   L1   CE-first-law-thermodynamics internal-energy-change heat-added, work-done-by-system
   L1   CE-boltzmann-entropy     boltzmann-entropy      boltzmann-constant, microstate-count
   L1   CE-normal-distribution   normal-probability-density standard-deviation, deviation-from-mean

  Use these names in `upt map --equation` / `upt derive` (underscores OK for kebabs).
  coverage: 47 catalog bridges have no canonical partner yet
  (fidelity: L0 dimensional · L1 scalar-AST · L2 field-equation; "=NN" = restatesBridge)

```

stderr:

```text

```

## C004

UTC: 2026-09-26T17:02:26.194496+00:00  
Exit: 0

```bash
upt map --source=canonical
```

stdout:

```text

Linkage map — how the equations connect via shared quantities  [source: canonical (standard-physics L-layer, bridges excluded)]
(23 components over 107 edges; 74 compose into chains)

  ● cluster of 83  [ANCHORED to known physics]
     edges:  CE-pendulum-period, CE-kepler-third, CE-schwarzschild-radius, CE-string-wave-speed, CE-compton-wavelength, CE-thermal-de-broglie, CE-hawking-temperature, CE-light-deflection, CE-perihelion-precession, CE-newton-gravitation, CE-newton-second-law, CE-mass-energy, CE-momentum, CE-kinetic-energy, CE-rotational-kinetic-energy, CE-gravitational-potential-energy, CE-work, CE-spring-potential-energy, CE-power, CE-centripetal-force, CE-hooke-law, CE-torque, CE-angular-momentum, CE-moment-of-inertia, CE-impulse, CE-simple-harmonic-frequency, CE-ohm-law, CE-electrical-power, CE-resistance-material, CE-capacitance-parallel-plate, CE-capacitor-energy, CE-inductor-energy, CE-magnetic-field-wire, CE-cyclotron-frequency, CE-larmor-radius, CE-point-charge-field, CE-lc-resonance, CE-coulomb, CE-rc-time-constant, CE-poynting-flux, CE-solenoid-field, CE-larmor-power, CE-field-energy-density, CE-hydrostatic-pressure, CE-pressure-definition, CE-density-definition, CE-buoyant-force, CE-stokes-drag, CE-wave-speed, CE-sound-speed, CE-volume-flow-rate, CE-shear-stress, CE-dynamic-pressure, CE-oscillator-energy, CE-heat-capacity, CE-landauer, CE-jarzynski, CE-stefan-boltzmann, CE-ideal-gas, CE-wien, CE-latent-heat, CE-clausius-entropy, CE-thermal-diffusivity, CE-de-broglie, CE-carrier-mobility, CE-electrical-conductivity, CE-drude-resistivity, CE-hall-coefficient, CE-drift-velocity, CE-fermi-energy, CE-fermi-velocity, CE-plasma-frequency, CE-debye-frequency, CE-equipartition, CE-stokes-einstein, CE-kinetic-pressure, CE-mb-most-probable-speed, CE-bernoulli, CE-photoelectric, CE-boltzmann-factor, CE-lorentz-factor, CE-compton-shift, CE-boltzmann-entropy
     status: 83 law
     link hubs: acceleration, angular-velocity, area, boltzmann-constant, capacitance, carrier-density, carrier-mobility, charge, compton-wavelength, current, density, displacement, distance, dynamic-viscosity, electric-field, energy, flow-velocity, force, g, height, inductance, length, magnetic-field, mass, molecular-mass, moment-of-inertia, mu_0, number-density, p, period, planck-constant, power, pressure, r, radius, reduced-planck-constant, relaxation-time, resistance, secondary-mass, speed, speed-of-light, spring-constant, temperature, velocity, voltage, volume

  ● cluster of 2  [ANCHORED to known physics]
     edges:  CE-classical-electron-radius, CE-thomson-cross-section
     status: 2 law
     link hubs: classical-electron-radius

  ● cluster of 2  [ANCHORED to known physics]
     edges:  CE-half-life, CE-radioactive-decay
     status: 2 law
     link hubs: decay-constant

  ○ isolated (20) — share no quantity with any other edge:
     CE-bekenstein-hawking, CE-bohr-magneton, CE-bohr-radius, CE-carnot-efficiency, CE-einstein-field-eq, CE-first-law-thermodynamics, CE-friedmann, CE-hubble-distance, CE-laplace-pressure, CE-lorentz-force, CE-malus-law, CE-normal-distribution, CE-planck-einstein, CE-planck-length, CE-planck-mass, CE-planck-time, CE-rydberg-energy, CE-rydberg-formula, CE-snell-law, CE-uncertainty-principle

  (a structural map — shared-quantity connectivity, NOT a credibility signal)

```

stderr:

```text

```

## C005

UTC: 2026-09-26T17:02:27.279109+00:00  
Exit: 0

```bash
upt map --source=both
```

stdout:

```text

Linkage map — how the equations connect via shared quantities  [source: catalog + canonical]
(40 components over 148 edges; 113 compose into chains)

  ● cluster of 100  [ANCHORED to known physics]
     edges:  be-11-zurek, be-12, be-16, be-37, be-42, be-42-via-rs, be-51, be-52, law-schwarzschild-radius, be-48, be-11-master, be-15, be-23, be-27, be-33, be-34, be-38, CE-pendulum-period, CE-kepler-third, CE-schwarzschild-radius, CE-string-wave-speed, CE-compton-wavelength, CE-thermal-de-broglie, CE-hawking-temperature, CE-light-deflection, CE-perihelion-precession, CE-newton-gravitation, CE-newton-second-law, CE-mass-energy, CE-momentum, CE-kinetic-energy, CE-rotational-kinetic-energy, CE-gravitational-potential-energy, CE-work, CE-spring-potential-energy, CE-power, CE-centripetal-force, CE-hooke-law, CE-torque, CE-angular-momentum, CE-moment-of-inertia, CE-impulse, CE-simple-harmonic-frequency, CE-ohm-law, CE-electrical-power, CE-resistance-material, CE-capacitance-parallel-plate, CE-capacitor-energy, CE-inductor-energy, CE-magnetic-field-wire, CE-cyclotron-frequency, CE-larmor-radius, CE-point-charge-field, CE-lc-resonance, CE-coulomb, CE-rc-time-constant, CE-poynting-flux, CE-solenoid-field, CE-larmor-power, CE-field-energy-density, CE-hydrostatic-pressure, CE-pressure-definition, CE-density-definition, CE-buoyant-force, CE-stokes-drag, CE-wave-speed, CE-sound-speed, CE-volume-flow-rate, CE-shear-stress, CE-dynamic-pressure, CE-oscillator-energy, CE-heat-capacity, CE-landauer, CE-jarzynski, CE-stefan-boltzmann, CE-ideal-gas, CE-wien, CE-latent-heat, CE-clausius-entropy, CE-thermal-diffusivity, CE-de-broglie, CE-carrier-mobility, CE-electrical-conductivity, CE-drude-resistivity, CE-hall-coefficient, CE-drift-velocity, CE-fermi-energy, CE-fermi-velocity, CE-plasma-frequency, CE-debye-frequency, CE-equipartition, CE-stokes-einstein, CE-kinetic-pressure, CE-mb-most-probable-speed, CE-bernoulli, CE-photoelectric, CE-boltzmann-factor, CE-lorentz-factor, CE-compton-shift, CE-boltzmann-entropy
     status: 5 established, 9 speculative, 2 highly-speculative, 84 law
     link hubs: acceleration, angular-velocity, area, boltzmann-constant, capacitance, carrier-density, carrier-mobility, charge, compton-wavelength, current, decoherence-rate, density, displacement, distance, dynamic-exponent-z, dynamic-viscosity, electric-field, energy, flow-velocity, force, g, height, inductance, length, magnetic-field, mass, molecular-mass, moment-of-inertia, mu_0, number-density, p, period, planck-constant, power, pressure, r, radius, reduced-planck-constant, relaxation-rate, relaxation-time, resistance, resistivity, schwarzschild-radius, secondary-mass, semi-major-axis, speed, speed-of-light, spring-constant, static-exponent-nu, temperature, thermal-wavelength, time, velocity, voltage, volume

  ● cluster of 4  [ANCHORED to known physics]
     edges:  be-13, be-20, be-31, CE-planck-length
     status: 3 speculative, 1 law
     link hubs: cosmological-constant-curvature, planck-length, ricci-scalar

  ● cluster of 3  [ANCHORED to known physics]
     edges:  be-19, be-54, CE-friedmann
     status: 2 speculative, 1 law
     link hubs: hubble-rate-squared, mass-density

  ● cluster of 2  [ANCHORED to known physics]
     edges:  be-41, CE-planck-mass
     status: 1 speculative, 1 law
     link hubs: planck-mass

  ● cluster of 2  [ANCHORED to known physics]
     edges:  be-47, CE-hubble-distance
     status: 1 speculative, 1 law
     link hubs: hubble-rate

  ● cluster of 2  [ANCHORED to known physics]
     edges:  CE-classical-electron-radius, CE-thomson-cross-section
     status: 2 law
     link hubs: classical-electron-radius

  ● cluster of 2  [ANCHORED to known physics]
     edges:  CE-half-life, CE-radioactive-decay
     status: 2 law
     link hubs: decay-constant

  ○ isolated (33) — share no quantity with any other edge:
     CE-bekenstein-hawking, CE-bohr-magneton, CE-bohr-radius, CE-carnot-efficiency, CE-einstein-field-eq, CE-first-law-thermodynamics, CE-laplace-pressure, CE-lorentz-force, CE-malus-law, CE-normal-distribution, CE-planck-einstein, CE-planck-time, CE-rydberg-energy, CE-rydberg-formula, CE-snell-law, CE-uncertainty-principle, be-14, be-17, be-18, be-21, be-22, be-24, be-25, be-26, be-30, be-36, be-39, be-43, be-45, be-46, be-49, be-50, be-53

  (a structural map — shared-quantity connectivity, NOT a credibility signal)

```

stderr:

```text

```

## C006

UTC: 2026-09-26T17:02:28.315271+00:00  
Exit: 0

```bash
upt coverage
```

stdout:

```text

Empirical-spine coverage — where the catalog's grounding is thin
(reads the catalog/graph/confrontation modules; fabricates nothing)

  55 bridges by grounding tier:
    data-confronted  : 19  (real-data confrontation)
    graph-computable : 30  (graph edge + dimensional signature)
    encoded-only     : 6  (dimensional signature, no graph edge)
    thin             : 0  (no dimensional signature)

  gaps:  36 without a data confrontation · 0 without any citation

  (a targeting tool for the CONTRIBUTING.md physicist review, not a quality score.)

```

stderr:

```text

```

## C007

UTC: 2026-09-26T17:02:29.267663+00:00  
Exit: 0

```bash
upt recover
```

stdout:

```text

Bridge↔canonical recovery — validating bridges against standard physics
⚠ structural match is "same relation UP TO a dimensionless factor"; that factor
  may itself be physically substantive (e.g. ⟨e^-βW⟩). A review surface.

  197 non-unrelated links  →  3 restates-canonical  ·  0 recovers  ·  194 dimensional-only

  RESTATES-CANONICAL (the bridge IS the canonical law — F4: NOT a discovery):
    CE-hawking-temperature     ≡ bridge 42 (recovery exact, err 0e+0)
    CE-landauer                ≡ bridge 16 (recovery exact, err 0e+0)
    CE-jarzynski               ≡ bridge 29 (recovery exact, err 0e+0)

  (194 dimensional-only: same dimension, different form. Run `upt canonical` for the registry.)

```

stderr:

```text

```

## C008

UTC: 2026-09-26T17:02:30.311725+00:00  
Exit: 0

```bash
upt help regime
```

stdout:

```text
upt regime <family> [--at group=value ...] [--json]
        Where in parameter space a family's models are claimed to apply.
        --at states a point in REGIME COORDINATES (π-group formulas, or a
        dimensionless input's own name, e.g. --at theta0=0.2). Every model AND
        bridge is reported as valid, violated (naming the failed inequality),
        or UNKNOWN — a coordinate the point never supplied is NOT a pass, and a
        regime that states no inequality is marked VACUOUS rather than passed.
        A group can be given by its formula (spaces ignored, * read as ·, so
        --at "tau*D*q^2=1" works) or through its parameters: --at tau=1 D=1
        q=1 derives tau · D · q^2 = 1. A key that no record uses is named, and
        ignored.
        Also prints the pairwise overlap of the regimes and, over the box --at
        states, the points no CONSTRAINING regime covers.
        e.g.  upt regime oscillators --at theta0=0.2

```

stderr:

```text

```

## C009

UTC: 2026-09-26T17:02:31.311990+00:00  
Exit: 0

```bash
upt help path
```

stdout:

```text
upt path <from> <to> [--at group=value ...] [--json]
        The chain of bridges from one model to another, the relation the chain
        composes to, the composed (K, delta) with the norm it holds in,
        whether every bridge's REGIME holds at --at (the bound is claimed only
        inside it), and whether every horizon still holds (pass t=<time> plus
        the parameters, e.g. --at theta0=0.2 T0=1 t=10).
        When the composition table declines to compose the relations, the path
        carries NO bound: the command prints 'no composite claim' and exits 0.
        That refusal is the answer, and no number is invented in its place.
        e.g.  upt path model-pendulum model-spring --at theta0=0.2 T0=1 t=10

```

stderr:

```text

```

## C010

UTC: 2026-09-26T17:02:49.915601+00:00  
Exit: 0

```bash
upt atlas
```

stdout:

```text

20 atlas bridges across 3 families:
  ab-spring-lc                 exact-equivalence      [oscillators]
  ab-damped-rlc                exact-equivalence      [oscillators]
  ab-pendulum-linear           approximation          [oscillators]
  ab-damped-massless           approximation          [oscillators]
  ab-chain-wave                coarse-graining        [oscillators]
  ab-walk-diffusion            coarse-graining        [diffusion]
  ab-heat-diffusion            exact-equivalence      [diffusion]
  ab-schrodinger-diffusion     analytic-continuation  [diffusion]
  ab-langevin-diffusion        coarse-graining        [diffusion]
  ab-stokes-einstein           derivation             [diffusion]
  ab-telegraph-diffusion       approximation          [diffusion]
  ab-telegraph-wave            approximation          [diffusion]
  ab-heat-laplace              restriction            [diffusion]
  ab-string-wave               restriction            [waves]
  ab-wave-dalembert            derivation             [waves]
  ab-sound-speed               derivation             [waves]
  ab-klein-gordon-wave         approximation          [waves]
  ab-kg-schrodinger            approximation          [waves]
  ab-kg-oscillator             restriction            [waves]
  ab-stiff-string              approximation          [waves]

Run `upt atlas <bridge-id>` for one bridge with every qualification.

```

stderr:

```text

```

## C011

UTC: 2026-09-26T17:02:50.788615+00:00  
Exit: 0

```bash
upt evaluate
```

stdout:

```text

Evaluable bridges  (upt evaluate <be-NN> key=value ...)
  be-51  Gravitational lensing (Eddington)  inputs: M_kg, b_m
  be-52  Perihelion precession (Einstein)   inputs: M_kg, a_m, e, T_yr
  be-55  Integer quantum Hall / TKNN        inputs: C
  be-56  Casimir effect                     inputs: d_m
  be-57  Unruh effect                       inputs: a_m_s2
  be-58  Johnson-Nyquist noise              inputs: T_K, R_ohm
  be-59  AC Josephson                       inputs: V_volts
  be-60  Fractional quantum Hall            inputs: nu
  be-61  Wiedemann-Franz                    inputs: sigma_S_per_m, T_K
  be-62  BCS gap ratio                      inputs: T_c_K
  be-63  Chandrasekhar mass                 inputs: mu_e
  be-64  Eddington luminosity               inputs: M_kg
  be-65  Jeans mass                         inputs: T_K, rho_kg_per_m3, mu

```

stderr:

```text

```

## C012

UTC: 2026-09-26T17:02:52.396568+00:00  
Exit: 0

```bash
upt discover --source=canonical
```

stdout:

```text

Discovery — link candidates VETTED through the inference suite  [source: canonical (standard-physics L-layer, bridges excluded)]
⚠ a REVIEW SURFACE: `promising` means "worth a physicist's minute", not "true".
  Each candidate hypothesises an identification a≡b and tests its consequences.

  funnel:  345 candidates  →  49 promising  ·  286 inert  ·  9 magnitude-clash  ·  0 contradictory (numerically falsified)  ·  1 axis-clash

  PROMISING (merges disconnected physics, unlocks quantities, stays consistent):
    a ≟ classical-electron-radius                        [[length]]  score 7
        unlocks: a, perihelion-precession
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    A ≟ thomson-cross-section                            [[area]]  score 7
        unlocks: A, bh-entropy
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    classical-electron-radius ≟ particle-radius          [[length]]  score 7
        unlocks: particle-radius
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    cross-sectional-area ≟ thomson-cross-section         [[area]]  score 7
        unlocks: cross-sectional-area
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    droplet-radius ≟ classical-electron-radius           [[length]]  score 7
        unlocks: droplet-radius
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    erasure-energy ≟ internal-energy-change              [[energy]]  score 7
        unlocks: internal-energy-change
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    free-energy-difference ≟ internal-energy-change      [[energy]]  score 7
        unlocks: internal-energy-change
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    free-energy-difference ≟ photon-energy               [[energy]]  score 7
        unlocks: photon-energy
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    impact_parameter ≟ classical-electron-radius         [[length]]  score 7
        unlocks: impact_parameter, light-deflection
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    larmor-radius ≟ classical-electron-radius            [[length]]  score 7
        unlocks: larmor-radius
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    rest-energy ≟ internal-energy-change                 [[energy]]  score 7
        unlocks: internal-energy-change
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    semi-major-axis ≟ classical-electron-radius          [[length]]  score 7
        unlocks: period, semi-major-axis
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    amplitude ≟ classical-electron-radius                [[length]]  score 6
        unlocks: amplitude
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    area ≟ thomson-cross-section                         [[area]]  score 6
        unlocks: area
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    classical-electron-radius ≟ compton-wavelength-shift [[length]]  score 6
        unlocks: compton-wavelength-shift
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    classical-electron-radius ≟ deviation-from-mean      [[length]]  score 6
        unlocks: deviation-from-mean
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    classical-electron-radius ≟ standard-deviation       [[length]]  score 6
        unlocks: standard-deviation
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    compton-wavelength ≟ deviation-from-mean             [[length]]  score 6
        unlocks: deviation-from-mean
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    compton-wavelength ≟ droplet-radius                  [[length]]  score 6
        unlocks: droplet-radius
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    compton-wavelength ≟ hubble-distance                 [[length]]  score 6
        unlocks: hubble-distance
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    compton-wavelength ≟ standard-deviation              [[length]]  score 6
        unlocks: standard-deviation
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    displacement ≟ classical-electron-radius             [[length]]  score 6
        unlocks: displacement
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    distance ≟ classical-electron-radius                 [[length]]  score 6
        unlocks: distance
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    droplet-radius ≟ peak-wavelength                     [[length]]  score 6
        unlocks: droplet-radius
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    erasure-energy ≟ heat-added                          [[energy]]  score 6
        unlocks: heat-added
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    erasure-energy ≟ work-done-by-system                 [[energy]]  score 6
        unlocks: work-done-by-system
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    free-energy-difference ≟ heat-added                  [[energy]]  score 6
        unlocks: heat-added
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    free-energy-difference ≟ work-done-by-system         [[energy]]  score 6
        unlocks: work-done-by-system
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    height ≟ classical-electron-radius                   [[length]]  score 6
        unlocks: height
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    hubble-distance ≟ classical-electron-radius          [[length]]  score 6
        unlocks: hubble-distance
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    length ≟ classical-electron-radius                   [[length]]  score 6
        unlocks: length
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    peak-wavelength ≟ deviation-from-mean                [[length]]  score 6
        unlocks: deviation-from-mean
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    peak-wavelength ≟ standard-deviation                 [[length]]  score 6
        unlocks: standard-deviation
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    r ≟ classical-electron-radius                        [[length]]  score 6
        unlocks: r
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    radiative-flux ≟ incident-intensity                  [[M T^-3]]  score 6
        unlocks: incident-intensity
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    radiative-flux ≟ transmitted-intensity               [[M T^-3]]  score 6
        unlocks: transmitted-intensity
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    radius ≟ deviation-from-mean                         [[length]]  score 6
        unlocks: deviation-from-mean
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    radius ≟ hubble-distance                             [[length]]  score 6
        unlocks: hubble-distance
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    radius ≟ standard-deviation                          [[length]]  score 6
        unlocks: standard-deviation
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    rest-energy ≟ heat-added                             [[energy]]  score 6
        unlocks: heat-added
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    rest-energy ≟ work-done-by-system                    [[energy]]  score 6
        unlocks: work-done-by-system
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    thermal-wavelength ≟ deviation-from-mean             [[length]]  score 6
        unlocks: deviation-from-mean
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    thermal-wavelength ≟ droplet-radius                  [[length]]  score 6
        unlocks: droplet-radius
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    thermal-wavelength ≟ hubble-distance                 [[length]]  score 6
        unlocks: hubble-distance
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    thermal-wavelength ≟ standard-deviation              [[length]]  score 6
        unlocks: standard-deviation
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    wavelength ≟ classical-electron-radius               [[length]]  score 6
        unlocks: wavelength
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
  adjudicated: 3 of the 49 promising carry recorded verdicts (2 decoy, 1 entailed) — folded; --show-adjudicated to list

  MAGNITUDE-CLASH (representative values differ by > N orders — a falsifier):
    classical-electron-radius ≟ bohr-radius              ~3.2 orders apart  (anchor-derived)
    mass ≟ planck-mass                                   ~38.0 orders apart  (anchor-derived)
    planck-length ≟ bohr-radius                          ~24.5 orders apart
    planck-length ≟ classical-electron-radius            ~21.3 orders apart  (anchor-derived)
    planck-length ≟ compton-wavelength                   ~23.2 orders apart
    radius ≟ bohr-radius                                 ~13.4 orders apart  (anchor-derived)
    radius ≟ classical-electron-radius                   ~16.6 orders apart  (anchor-derived)
    radius ≟ planck-length                               ~38.0 orders apart  (anchor-derived)
    rest-energy ≟ rydberg-energy                         ~62.4 orders apart  (anchor-derived)

  SUBSUMING (generic ≟ specialization — tautological, barred from promising):
    distance ≟ hubble-distance                           [[length]]
    energy ≟ internal-energy-change                      [[energy]]
    energy ≟ photon-energy                               [[energy]]
    energy ≟ rydberg-energy                              [[energy]]
    force ≟ lorentz-force                                [[force]]
    heat ≟ heat-added                                    [[energy]]
    length ≟ planck-length                               [[length]]
    planck-time ≟ time                                   [[time]]
    pressure ≟ laplace-pressure                          [[L^-1 M T^-2]]
    radius ≟ droplet-radius                              [[length]]
    temperature ≟ cold-reservoir-temperature             [[temperature]]
    temperature ≟ hot-reservoir-temperature              [[temperature]]
    time ≟ elapsed-time                                  [[time]]
    work ≟ work-done-by-system                           [[energy]]

  AXIS-CLASH (stated scale/force labels differ: a regime-label prior, not a physical test):
    semi-major-axis ≟ planck-length                      scale: classical ≠ quantum

  (magnitude gate abstains where a representative value is unknown; weak priors on dimension.)

```

stderr:

```text

```

## C013

UTC: 2026-09-26T17:02:57.664801+00:00  
Exit: 0

```bash
upt discover --source=both
```

stdout:

```text

Discovery — link candidates VETTED through the inference suite  [source: catalog + canonical]
⚠ a REVIEW SURFACE: `promising` means "worth a physicist's minute", not "true".
  Each candidate hypothesises an identification a≡b and tests its consequences.

  funnel:  833 candidates  →  107 promising  ·  604 inert  ·  61 magnitude-clash  ·  0 contradictory (numerically falsified)  ·  61 axis-clash

  PROMISING (merges disconnected physics, unlocks quantities, stays consistent):
    barrier-width ≟ compton-wavelength                   [[length]]  score 6
        unlocks: barrier-width
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency, magnitude (1.6 orders) · gaps: axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    landauer-erasure-energy ≟ barrier-height             [[energy]]  score 6
        unlocks: barrier-height
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency, magnitude (1.0 orders) · gaps: axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    wormhole-cross-section-area ≟ thomson-cross-section  [[area]]  score 8
        unlocks: wormhole-cross-section-area, wormhole-entanglement-entropy
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    a ≟ classical-electron-radius                        [[length]]  score 7
        unlocks: a, perihelion-precession
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    A ≟ thomson-cross-section                            [[area]]  score 7
        unlocks: A, bh-entropy
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    boundary-length ≟ planck-length                      [[length]]  score 7
        unlocks: boundary-length
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency, axis-compatible (≥1 regime axis) · gaps: magnitude (no representative value), consequence: inconclusive · ceiling: no mechanism/data test]
    classical-electron-radius ≟ particle-radius          [[length]]  score 7
        unlocks: particle-radius
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    cross-sectional-area ≟ thomson-cross-section         [[area]]  score 7
        unlocks: cross-sectional-area
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    droplet-radius ≟ classical-electron-radius           [[length]]  score 7
        unlocks: droplet-radius
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    erasure-energy ≟ internal-energy-change              [[energy]]  score 7
        unlocks: internal-energy-change
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    far-radius ≟ classical-electron-radius               [[length]]  score 7
        unlocks: far-radius
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    free-energy-difference ≟ internal-energy-change      [[energy]]  score 7
        unlocks: internal-energy-change
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    free-energy-difference ≟ photon-energy               [[energy]]  score 7
        unlocks: photon-energy
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    grw-localization-rate ≟ decay-constant               [[frequency]]  score 7
        unlocks: decay-constant, half-life
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    grw-localization-rate ≟ nu                           [[frequency]]  score 7
        unlocks: nu, photon-energy
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    impact_parameter ≟ classical-electron-radius         [[length]]  score 7
        unlocks: impact_parameter, light-deflection
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    impact-parameter ≟ classical-electron-radius         [[length]]  score 7
        unlocks: deflection-angle, impact-parameter
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    inflation-hubble-energy ≟ erasure-energy             [[energy]]  score 7
        unlocks: inflation-hubble-energy
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    inflation-hubble-energy ≟ free-energy-difference     [[energy]]  score 7
        unlocks: inflation-hubble-energy
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    inflation-hubble-energy ≟ rest-energy                [[energy]]  score 7
        unlocks: inflation-hubble-energy
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    landauer-erasure-energy ≟ inflation-hubble-energy    [[energy]]  score 7
        unlocks: inflation-hubble-energy
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    landauer-erasure-energy ≟ internal-energy-change     [[energy]]  score 7
        unlocks: internal-energy-change
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    landauer-erasure-energy ≟ photon-energy              [[energy]]  score 7
        unlocks: photon-energy
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    larmor-radius ≟ classical-electron-radius            [[length]]  score 7
        unlocks: larmor-radius
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    minimal-surface-area ≟ thomson-cross-section         [[area]]  score 7
        unlocks: boundary-entanglement-entropy, minimal-surface-area
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    near-radius ≟ classical-electron-radius              [[length]]  score 7
        unlocks: near-radius
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    planck-length ≟ a                                    [[length]]  score 7
        unlocks: a, perihelion-precession
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    planck-length ≟ impact_parameter                     [[length]]  score 7
        unlocks: impact_parameter, light-deflection
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    planck-length ≟ quantum-correlation-length           [[length]]  score 7
        unlocks: quantum-correlation-length
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency, axis-compatible (≥1 regime axis) · gaps: magnitude (no representative value), consequence: inconclusive · ceiling: no mechanism/data test]
    planck-length ≟ reference-correlation-length         [[length]]  score 7
        unlocks: reference-correlation-length
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency, axis-compatible (≥1 regime axis) · gaps: magnitude (no representative value), consequence: inconclusive · ceiling: no mechanism/data test]
    planck-mass ≟ electron-mass                          [[mass]]  score 7
        unlocks: electron-mass
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    planck-mass ≟ molecular-mass                         [[mass]]  score 7
        unlocks: molecular-mass
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    planck-mass ≟ secondary-mass                         [[mass]]  score 7
        unlocks: secondary-mass
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    rest-energy ≟ internal-energy-change                 [[energy]]  score 7
        unlocks: internal-energy-change
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    schwarzschild-radius ≟ droplet-radius                [[length]]  score 7
        unlocks: droplet-radius
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    semi-major-axis ≟ classical-electron-radius          [[length]]  score 7
        unlocks: period, semi-major-axis
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    amplitude ≟ classical-electron-radius                [[length]]  score 6
        unlocks: amplitude
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    area ≟ thomson-cross-section                         [[area]]  score 6
        unlocks: area
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    boundary-length ≟ classical-electron-radius          [[length]]  score 6
        unlocks: boundary-length
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    boundary-length ≟ compton-wavelength                 [[length]]  score 6
        unlocks: boundary-length
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    boundary-length ≟ peak-wavelength                    [[length]]  score 6
        unlocks: boundary-length
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    boundary-length ≟ radius                             [[length]]  score 6
        unlocks: boundary-length
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    classical-electron-radius ≟ compton-wavelength-shift [[length]]  score 6
        unlocks: compton-wavelength-shift
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    classical-electron-radius ≟ deviation-from-mean      [[length]]  score 6
        unlocks: deviation-from-mean
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    classical-electron-radius ≟ standard-deviation       [[length]]  score 6
        unlocks: standard-deviation
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    coarsening-length ≟ classical-electron-radius        [[length]]  score 6
        unlocks: coarsening-length
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    compton-wavelength ≟ deviation-from-mean             [[length]]  score 6
        unlocks: deviation-from-mean
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    compton-wavelength ≟ droplet-radius                  [[length]]  score 6
        unlocks: droplet-radius
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    compton-wavelength ≟ hubble-distance                 [[length]]  score 6
        unlocks: hubble-distance
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    compton-wavelength ≟ standard-deviation              [[length]]  score 6
        unlocks: standard-deviation
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    dark-fermion-mass ≟ free-energy-difference           [[energy]]  score 6
        unlocks: dark-fermion-mass
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    displacement ≟ classical-electron-radius             [[length]]  score 6
        unlocks: displacement
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    distance ≟ classical-electron-radius                 [[length]]  score 6
        unlocks: distance
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    droplet-radius ≟ peak-wavelength                     [[length]]  score 6
        unlocks: droplet-radius
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    erasure-energy ≟ heat-added                          [[energy]]  score 6
        unlocks: heat-added
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    erasure-energy ≟ work-done-by-system                 [[energy]]  score 6
        unlocks: work-done-by-system
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    free-energy-difference ≟ heat-added                  [[energy]]  score 6
        unlocks: heat-added
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    free-energy-difference ≟ work-done-by-system         [[energy]]  score 6
        unlocks: work-done-by-system
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    height ≟ classical-electron-radius                   [[length]]  score 6
        unlocks: height
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    hubble-distance ≟ classical-electron-radius          [[length]]  score 6
        unlocks: hubble-distance
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    landauer-erasure-energy ≟ dark-fermion-mass          [[energy]]  score 6
        unlocks: dark-fermion-mass
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    landauer-erasure-energy ≟ heat-added                 [[energy]]  score 6
        unlocks: heat-added
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    landauer-erasure-energy ≟ work-done-by-system        [[energy]]  score 6
        unlocks: work-done-by-system
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    length ≟ classical-electron-radius                   [[length]]  score 6
        unlocks: length
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    mass ≟ scalar-field-reference                        [[mass]]  score 6
        unlocks: scalar-field-reference
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    mass ≟ scalar-field-value                            [[mass]]  score 6
        unlocks: scalar-field-value
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    peak-wavelength ≟ deviation-from-mean                [[length]]  score 6
        unlocks: deviation-from-mean
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    peak-wavelength ≟ standard-deviation                 [[length]]  score 6
        unlocks: standard-deviation
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    planck-length ≟ amplitude                            [[length]]  score 6
        unlocks: amplitude
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    planck-length ≟ compton-wavelength-shift             [[length]]  score 6
        unlocks: compton-wavelength-shift
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    planck-length ≟ deviation-from-mean                  [[length]]  score 6
        unlocks: deviation-from-mean
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    planck-length ≟ displacement                         [[length]]  score 6
        unlocks: displacement
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    planck-length ≟ distance                             [[length]]  score 6
        unlocks: distance
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    planck-length ≟ droplet-radius                       [[length]]  score 6
        unlocks: droplet-radius
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    planck-length ≟ height                               [[length]]  score 6
        unlocks: height
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    planck-length ≟ hubble-distance                      [[length]]  score 6
        unlocks: hubble-distance
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    planck-length ≟ larmor-radius                        [[length]]  score 6
        unlocks: larmor-radius
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    planck-length ≟ particle-radius                      [[length]]  score 6
        unlocks: particle-radius
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    planck-length ≟ r                                    [[length]]  score 6
        unlocks: r
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    planck-length ≟ standard-deviation                   [[length]]  score 6
        unlocks: standard-deviation
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    planck-length ≟ wavelength                           [[length]]  score 6
        unlocks: wavelength
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    quantum-correlation-length ≟ classical-electron-radius [[length]]  score 6
        unlocks: quantum-correlation-length
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    r ≟ classical-electron-radius                        [[length]]  score 6
        unlocks: r
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    radiative-flux ≟ incident-intensity                  [[M T^-3]]  score 6
        unlocks: incident-intensity
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    radiative-flux ≟ transmitted-intensity               [[M T^-3]]  score 6
        unlocks: transmitted-intensity
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    radius ≟ deviation-from-mean                         [[length]]  score 6
        unlocks: deviation-from-mean
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    radius ≟ hubble-distance                             [[length]]  score 6
        unlocks: hubble-distance
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    radius ≟ standard-deviation                          [[length]]  score 6
        unlocks: standard-deviation
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    reference-correlation-length ≟ classical-electron-radius [[length]]  score 6
        unlocks: reference-correlation-length
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    rest-energy ≟ heat-added                             [[energy]]  score 6
        unlocks: heat-added
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    rest-energy ≟ work-done-by-system                    [[energy]]  score 6
        unlocks: work-done-by-system
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    schwarzschild-radius ≟ deviation-from-mean           [[length]]  score 6
        unlocks: deviation-from-mean
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    schwarzschild-radius ≟ hubble-distance               [[length]]  score 6
        unlocks: hubble-distance
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    schwarzschild-radius ≟ standard-deviation            [[length]]  score 6
        unlocks: standard-deviation
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    superposition-extent ≟ classical-electron-radius     [[length]]  score 6
        unlocks: superposition-extent
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    superposition-extent ≟ planck-length                 [[length]]  score 6
        unlocks: superposition-extent
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency, axis-compatible (≥1 regime axis) · gaps: magnitude (no representative value), consequence: inconclusive · ceiling: no mechanism/data test]
    thermal-wavelength ≟ boundary-length                 [[length]]  score 6
        unlocks: boundary-length
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency, axis-compatible (≥1 regime axis) · gaps: magnitude (no representative value), consequence: inconclusive · ceiling: no mechanism/data test]
    thermal-wavelength ≟ deviation-from-mean             [[length]]  score 6
        unlocks: deviation-from-mean
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    thermal-wavelength ≟ droplet-radius                  [[length]]  score 6
        unlocks: droplet-radius
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    thermal-wavelength ≟ hubble-distance                 [[length]]  score 6
        unlocks: hubble-distance
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    thermal-wavelength ≟ standard-deviation              [[length]]  score 6
        unlocks: standard-deviation
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
    wavelength ≟ classical-electron-radius               [[length]]  score 6
        unlocks: wavelength
        [consequence: inconclusive]
        [grounding — passed: numerical-consistency · gaps: magnitude (no representative value), axis (regime attributes unresolved), consequence: inconclusive · ceiling: no mechanism/data test]
  adjudicated: 5 of the 107 promising carry recorded verdicts (4 decoy, 1 entailed) — folded; --show-adjudicated to list

  MAGNITUDE-CLASH (representative values differ by > N orders — a falsifier):
    attempt-frequency ≟ hubble-rate                      ~30.7 orders apart
    barrier-height ≟ erasure-energy                      ~10.6 orders apart  (anchor-derived)
    barrier-height ≟ free-energy-difference              ~10.6 orders apart  (anchor-derived)
    barrier-height ≟ planck-mass-energy                  ~28.8 orders apart
    barrier-height ≟ rest-energy                         ~66.7 orders apart  (anchor-derived)
    barrier-height ≟ rydberg-energy                      ~4.3 orders apart  (anchor-derived)
    barrier-width ≟ classical-electron-radius            ~3.5 orders apart  (anchor-derived)
    barrier-width ≟ peak-wavelength                      ~14.7 orders apart  (anchor-derived)
    barrier-width ≟ planck-length                        ~24.8 orders apart
    barrier-width ≟ radius                               ~13.2 orders apart  (anchor-derived)
    classical-electron-radius ≟ bohr-radius              ~3.2 orders apart  (anchor-derived)
    donor-acceptor-distance ≟ classical-electron-radius  ~5.1 orders apart  (anchor-derived)
    donor-acceptor-distance ≟ compton-wavelength         ~3.3 orders apart
    donor-acceptor-distance ≟ peak-wavelength            ~13.0 orders apart  (anchor-derived)
    donor-acceptor-distance ≟ planck-length              ~26.5 orders apart
    donor-acceptor-distance ≟ radius                     ~11.5 orders apart  (anchor-derived)
    erasure-energy ≟ rydberg-energy                      ~14.9 orders apart  (anchor-derived)
    foerster-radius ≟ classical-electron-radius          ~5.1 orders apart  (anchor-derived)
    foerster-radius ≟ compton-wavelength                 ~3.3 orders apart
    foerster-radius ≟ peak-wavelength                    ~13.0 orders apart  (anchor-derived)
    foerster-radius ≟ planck-length                      ~26.5 orders apart
    foerster-radius ≟ radius                             ~11.5 orders apart  (anchor-derived)
    free-energy-difference ≟ rydberg-energy              ~14.9 orders apart  (anchor-derived)
    grw-localization-rate ≟ attempt-frequency            ~29.0 orders apart
    landauer-erasure-energy ≟ planck-mass-energy         ~29.8 orders apart
    landauer-erasure-energy ≟ rydberg-energy             ~5.4 orders apart  (anchor-derived)
    landauer-erasure-energy ≟ vacuum-expectation-value   ~13.1 orders apart
    mass ≟ planck-mass                                   ~38.0 orders apart  (anchor-derived)
    mass ≟ tunneling-mass                                ~57.1 orders apart  (anchor-derived)
    peak-wavelength ≟ bohr-radius                        ~14.9 orders apart  (anchor-derived)
    peak-wavelength ≟ classical-electron-radius          ~18.1 orders apart  (anchor-derived)
    planck-length ≟ bohr-radius                          ~24.5 orders apart
    planck-length ≟ classical-electron-radius            ~21.3 orders apart  (anchor-derived)
    planck-length ≟ compton-wavelength                   ~23.2 orders apart
    planck-length ≟ peak-wavelength                      ~39.5 orders apart  (anchor-derived)
    planck-length ≟ radius                               ~38.0 orders apart  (anchor-derived)
    planck-mass-energy ≟ erasure-energy                  ~39.4 orders apart  (anchor-derived)
    planck-mass-energy ≟ free-energy-difference          ~39.4 orders apart  (anchor-derived)
    planck-mass-energy ≟ rest-energy                     ~38.0 orders apart  (anchor-derived)
    planck-mass-energy ≟ rydberg-energy                  ~24.5 orders apart  (anchor-derived)
    radius ≟ bohr-radius                                 ~13.4 orders apart  (anchor-derived)
    radius ≟ classical-electron-radius                   ~16.6 orders apart  (anchor-derived)
    rest-energy ≟ rydberg-energy                         ~62.4 orders apart  (anchor-derived)
    schwarzschild-radius ≟ barrier-width                 ~13.5 orders apart  (anchor-derived)
    schwarzschild-radius ≟ bohr-radius                   ~13.7 orders apart  (anchor-derived)
    schwarzschild-radius ≟ classical-electron-radius     ~16.9 orders apart  (anchor-derived)
    schwarzschild-radius ≟ donor-acceptor-distance       ~11.8 orders apart  (anchor-derived)
    schwarzschild-radius ≟ foerster-radius               ~11.8 orders apart  (anchor-derived)
    schwarzschild-radius ≟ planck-length                 ~38.3 orders apart  (anchor-derived)
    thermal-wavelength ≟ barrier-width                   ~24.1 orders apart  (anchor-derived)
    thermal-wavelength ≟ bohr-radius                     ~23.8 orders apart  (anchor-derived)
    thermal-wavelength ≟ classical-electron-radius       ~20.6 orders apart  (anchor-derived)
    thermal-wavelength ≟ donor-acceptor-distance         ~25.8 orders apart  (anchor-derived)
    thermal-wavelength ≟ foerster-radius                 ~25.8 orders apart  (anchor-derived)
    tunneling-mass ≟ planck-mass                         ~19.1 orders apart
    vacuum-expectation-value ≟ barrier-height            ~12.1 orders apart
    vacuum-expectation-value ≟ erasure-energy            ~22.7 orders apart  (anchor-derived)
    vacuum-expectation-value ≟ free-energy-difference    ~22.7 orders apart  (anchor-derived)
    vacuum-expectation-value ≟ planck-mass-energy        ~16.7 orders apart
    vacuum-expectation-value ≟ rest-energy               ~54.7 orders apart  (anchor-derived)
    vacuum-expectation-value ≟ rydberg-energy            ~7.8 orders apart  (anchor-derived)

  SUBSUMING (generic ≟ specialization — tautological, barred from promising):
    attempt-frequency ≟ frequency                        [[frequency]]
    boundary-length ≟ length                             [[length]]
    critical-density ≟ density                           [[L^-3 M]]
    distance ≟ hubble-distance                           [[length]]
    donor-acceptor-distance ≟ distance                   [[length]]
    energy ≟ internal-energy-change                      [[energy]]
    energy ≟ photon-energy                               [[energy]]
    energy ≟ rydberg-energy                              [[energy]]
    force ≟ lorentz-force                                [[force]]
    gravitational-wave-speed ≟ speed                     [[velocity]]
    heat ≟ heat-added                                    [[energy]]
    inflation-hubble-energy ≟ energy                     [[energy]]
    lambda-mass-density ≟ density                        [[L^-3 M]]
    mass ≟ reference-mass                                [[mass]]
    mass ≟ swampland-tower-mass                          [[mass]]
    mass-density ≟ density                               [[L^-3 M]]
    mass-density ≟ lambda-mass-density                   [[L^-3 M]]
    minimal-surface-area ≟ area                          [[area]]
    planck-length ≟ length                               [[length]]
    planck-mass-energy ≟ energy                          [[energy]]
    pressure ≟ laplace-pressure                          [[L^-1 M T^-2]]
    radius ≟ droplet-radius                              [[length]]
    temperature ≟ cold-reservoir-temperature             [[temperature]]
    temperature ≟ hot-reservoir-temperature              [[temperature]]
    time ≟ elapsed-time                                  [[time]]
    time ≟ planck-time                                   [[time]]
    work ≟ work-done-by-system                           [[energy]]
    wormhole-cross-section-area ≟ area                   [[area]]

  AXIS-CLASH (stated scale/force labels differ: a regime-label prior, not a physical test):
    active-noise-energy ≟ inflation-hubble-energy        force: emergent ≠ gravitational; scale: mesoscopic ≠ cosmological
    active-noise-energy ≟ planck-mass-energy             force: emergent ≠ gravitational; scale: mesoscopic ≠ quantum
    barrier-height ≟ active-noise-energy                 scale: quantum ≠ mesoscopic
    barrier-height ≟ inflation-hubble-energy             scale: quantum ≠ cosmological
    boundary-length ≟ donor-acceptor-distance            scale: quantum ≠ mesoscopic
    boundary-length ≟ foerster-radius                    scale: quantum ≠ mesoscopic
    carrier-density ≟ dark-species-density               scale: quantum ≠ cosmological
    carrier-density ≟ neutron-density                    scale: quantum ≠ cosmological
    carrier-density ≟ nucleon-yield-density              scale: quantum ≠ cosmological
    carrier-density ≟ proton-density                     scale: quantum ≠ cosmological
    coarsening-length ≟ barrier-width                    scale: mesoscopic ≠ quantum
    coarsening-length ≟ boundary-length                  scale: mesoscopic ≠ quantum
    coarsening-length ≟ donor-acceptor-distance          force: emergent ≠ electromagnetic
    coarsening-length ≟ foerster-radius                  force: emergent ≠ electromagnetic
    coarsening-length ≟ planck-length                    force: emergent ≠ gravitational; scale: mesoscopic ≠ quantum
    critical-density ≟ lambda-mass-density               scale: quantum ≠ cosmological
    dark-fermion-mass ≟ active-noise-energy              force: weak ≠ emergent; scale: quantum ≠ mesoscopic
    dark-fermion-mass ≟ inflation-hubble-energy          force: weak ≠ gravitational; scale: quantum ≠ cosmological
    dark-fermion-mass ≟ planck-mass-energy               force: weak ≠ gravitational
    defect-rest-mass ≟ planck-mass                       scale: cosmological ≠ quantum
    defect-rest-mass ≟ reference-mass                    scale: cosmological ≠ quantum
    defect-rest-mass ≟ scalar-field-reference            scale: cosmological ≠ quantum
    defect-rest-mass ≟ scalar-field-value                scale: cosmological ≠ quantum
    defect-rest-mass ≟ swampland-tower-mass              scale: cosmological ≠ quantum
    donor-acceptor-distance ≟ barrier-width              scale: mesoscopic ≠ quantum
    donor-acceptor-distance ≟ quantum-correlation-length scale: mesoscopic ≠ quantum
    donor-acceptor-distance ≟ reference-correlation-length scale: mesoscopic ≠ quantum
    effective-mass ≟ planck-mass                         force: electromagnetic ≠ gravitational
    far-radius ≟ barrier-width                           scale: classical ≠ quantum
    far-radius ≟ boundary-length                         scale: classical ≠ quantum
    far-radius ≟ donor-acceptor-distance                 force: gravitational ≠ electromagnetic; scale: classical ≠ mesoscopic
    far-radius ≟ foerster-radius                         force: gravitational ≠ electromagnetic; scale: classical ≠ mesoscopic
    far-radius ≟ planck-length                           scale: classical ≠ quantum
    foerster-radius ≟ barrier-width                      scale: mesoscopic ≠ quantum
    foerster-radius ≟ quantum-correlation-length         scale: mesoscopic ≠ quantum
    foerster-radius ≟ reference-correlation-length       scale: mesoscopic ≠ quantum
    grw-localization-rate ≟ hubble-rate                  scale: quantum ≠ cosmological
    grw-localization-rate ≟ mutation-rate                scale: quantum ≠ mesoscopic
    impact-parameter ≟ barrier-width                     scale: classical ≠ quantum
    impact-parameter ≟ boundary-length                   scale: classical ≠ quantum
    impact-parameter ≟ donor-acceptor-distance           force: gravitational ≠ electromagnetic; scale: classical ≠ mesoscopic
    impact-parameter ≟ foerster-radius                   force: gravitational ≠ electromagnetic; scale: classical ≠ mesoscopic
    impact-parameter ≟ planck-length                     scale: classical ≠ quantum
    minimal-surface-area ≟ wormhole-cross-section-area   scale: classical ≠ quantum
    mutation-rate ≟ hubble-rate                          scale: mesoscopic ≠ cosmological
    near-radius ≟ barrier-width                          scale: classical ≠ quantum
    near-radius ≟ boundary-length                        scale: classical ≠ quantum
    near-radius ≟ donor-acceptor-distance                force: gravitational ≠ electromagnetic; scale: classical ≠ mesoscopic
    near-radius ≟ foerster-radius                        force: gravitational ≠ electromagnetic; scale: classical ≠ mesoscopic
    near-radius ≟ planck-length                          scale: classical ≠ quantum
    schwarzschild-radius ≟ boundary-length               scale: classical ≠ quantum
    semi-major-axis ≟ barrier-width                      scale: classical ≠ quantum
    semi-major-axis ≟ boundary-length                    scale: classical ≠ quantum
    semi-major-axis ≟ donor-acceptor-distance            force: gravitational ≠ electromagnetic; scale: classical ≠ mesoscopic
    semi-major-axis ≟ foerster-radius                    force: gravitational ≠ electromagnetic; scale: classical ≠ mesoscopic
    semi-major-axis ≟ planck-length                      scale: classical ≠ quantum
    superposition-extent ≟ donor-acceptor-distance       scale: quantum ≠ mesoscopic
    superposition-extent ≟ foerster-radius               scale: quantum ≠ mesoscopic
    tunneling-mass ≟ defect-rest-mass                    scale: quantum ≠ cosmological
    vacuum-expectation-value ≟ active-noise-energy       force: weak ≠ emergent; scale: quantum ≠ mesoscopic
    vacuum-expectation-value ≟ inflation-hubble-energy   force: weak ≠ gravitational; scale: quantum ≠ cosmological

  (magnitude gate abstains where a representative value is unknown; weak priors on dimension.)

```

stderr:

```text

```

## C014

UTC: 2026-09-26T17:02:58.593812+00:00  
Exit: 0

```bash
upt confront
```

stdout:

```text

Real-data confrontations — predicted vs observed
(confrontation is consistency, not confirmation; a passing confrontation does not prove the bridge.)
rigor: 7 stringent · 3 moderate · 9 loose — NOT 19 equal confirmations

  be-11 [loose]: Decoherence master equation vs collisional decoherence (Hornberger 2003)
    predicted 1 approaches 1 p₀(theory)/p₀(exp) ratio; parameter-free 9-gas agreement within 15% experimental error · gap 0.0%
    source: Hornberger, Uttenthaler, Brezger, Hackermuller, Arndt & Zeilinger 2003, Phys. Rev. Lett. 90:160401 (arXiv:quant-ph/0303093), "Collisional Decoherence Observed in Matter Wave Interferometry"
  be-21 [loose]: KSS viscosity bound vs quark-gluon plasma (Bernhard-Moreland-Bass 2019)
    predicted 0.07957747154594767 approaches 0.1 η/s (ℏ/k_B units); KSS lower bound 1/(4π), observed satisfies + nearly saturates · gap 25.7%
    source: Bernhard, Moreland & Bass 2019, Nature Phys. 15:1113-1117 (Bayesian eta/s extraction from RHIC/LHC heavy-ion flow observables); KSS bound: Kovtun, Son & Starinets 2005, PRL 94:111601
  be-23 [loose]: Planckian dissipation α vs overdoped cuprates (Legros 2019)
    predicted 1 · observed 1 ± 0.4 dimensionless (α) · residual 0.00σ · within 1σ ✓
    source: Legros et al. 2019 Nature Phys. 15:142 (arXiv:1805.02512), "Universal T-linear resistivity and Planckian dissipation in overdoped cuprates" — abstract-level claim that the T-linear scattering rate is the Planckian rate k_B T/ℏ to within ~×2 (encoded conservatively as α = 1.0 ± 0.4)
  be-35 [stringent]: Conformal bootstrap 3D-Ising ν vs experiment (Pelissetto-Vicari 2002)
    predicted 0.629971 · observed 0.63 ± 0.002 ν (3D-Ising correlation-length exponent, dimensionless) · residual 0.01σ · within 1σ ✓
    source: Pelissetto & Vicari 2002, Phys. Rep. 368:549 ("Critical phenomena and renormalization-group theory"); experimental average over liquid-vapor / binary-fluid critical points (3D Ising universality class). Bootstrap prediction: Kos, Poland, Simmons-Duffin & Vichi 2016, JHEP 08:036 (arXiv:1603.04436), Delta_epsilon = 1.412625(10)
  be-36 [loose]: GW speed vs GW170817 bound
    predicted 1e-15 |c_GW − c| / c (dimensionless) · bound 6.501939179989081e-16 · not excluded ✓ · one-sided: +side only (GW170817 −side -3.1e-15 exceeds the symmetric encoded ±1e-15)
    source: Abbott et al. 2017 ApJ Lett. 848:L13 (arXiv:1710.05832), §3 "Speed of Gravity"
  be-37 [stringent]: GR Shapiro delay (PPN γ) vs Cassini (Bertotti 2003)
    predicted 1 · observed 1.000021 ± 0.000023 PPN γ (dimensionless) · residual 0.91σ · within 1σ ✓
    source: Bertotti, Iess & Tortora 2003, Nature 425:374-376 (Cassini radio-link Shapiro delay, June 2002 solar conjunction)
  be-48 [loose]: GRW collapse rate vs LISA-Pathfinder bound (Carlesso 2016)
    predicted 1e-16 s⁻¹ (collapse rate) · bound 2.96e-8 · not excluded ✓
    source: Carlesso, Bassi, Falferi & Vinante 2016, arXiv:1606.03637 / Phys. Rev. D 95:084054 (2017); LISA-Pathfinder data Armano et al. 2016, PRL 116:231101
  be-51 [stringent]: GR light deflection (PPN γ) vs VLBI (Lambert 2009)
    predicted 1.751190325559984 · derived (1+γ)/2 × predicted = 1.7511202779469617 ± 0.00010507141953359905 arcsec (solar-limb deflection) · residual 0.67σ · within 1σ ✓
    measured: PPN γ = 0.99992 ± 0.00012 (VLBI); the value above is derived from it, not observed
    source: Lambert & Le Poncin-Lafitte 2009, A&A 499:331-336 (geodetic VLBI light-deflection determination of PPN gamma); compiled in Will 2014, Living Rev. Relativity 17:4
  be-52 [moderate]: GR perihelion precession vs Mercury (Clemence 1947)
    predicted 42.98056186229095 · observed 43.11 ± 0.45 arcsec/century · residual 0.29σ · within 1σ ✓
    source: Clemence 1947, Rev. Mod. Phys. 19:361 (anomalous advance 43.11±0.45 ″/cy); orbital elements NASA Mercury fact sheet (J2000); Einstein 1915 SPAW 831.
  be-55 [stringent]: Quantum Hall universality (graphene vs GaAs) — Janssen 2012
    predicted 1 approaches 1 R_H(graphene)/R_H(GaAs) ratio; topological universality to 8.6e-11 · gap 0.0%
    source: Janssen, Williams, Fletcher, Goebel, Tzalenchuk, Yakimova, Lara-Avila, Kubatkin & Fal’ko 2012, Metrologia 49:294 (arXiv:1105.4055), "Graphene, universality of the quantum Hall effect and redefinition of the SI"
  be-56 [moderate]: Casimir force vs corrected theory (Mohideen-Roy 1998)
    predicted 1 approaches 1 measured/theory force ratio; ~1% agreement (corrected theory, systematics-dominated) · gap 1.0%
    source: Mohideen & Roy 1998, Phys. Rev. Lett. 81:4549 (arXiv:physics/9805038), "Precision Measurement of the Casimir Force from 0.1 to 0.9 μm"; earlier: Lamoreaux 1997, Phys. Rev. Lett. 78:5 (~5%)
  be-58 [stringent]: Johnson-Nyquist S_V=4k_BTR via JNT k_B (Flowers-Jacobs 2017)
    predicted 1.38064852e-23 · observed 1.3806429e-23 ± 6.9e-29 k_B (J/K); JNT via S_V=4k_BTR vs CODATA · residual 0.81σ · within 1σ ✓
    source: Flowers-Jacobs, Pollarolo, Coakley, Fox, Rogalla, Tew & Benz 2017, Metrologia 54:730, "A Boltzmann constant determination based on Johnson noise thermometry"
  be-59 [stringent]: Josephson-volt universality (junction-independence) — Kautz 1996 / BIPM
    predicted 1 approaches 1 V(junction A)/V(junction B) ratio; Josephson-volt universality to ~1e-9 · gap 0.0%
    source: Kautz 1996, Rep. Prog. Phys. 59:935 ("Noise, chaos, and the Josephson voltage standard"); BIPM international comparisons of Josephson voltage standards
  be-60 [stringent]: Fractional QH ν=1/3 plateau (R_xy=3·R_K) — Tsui-Störmer-Gossard 1982
    predicted 1 approaches 1 R_xy(plateau)/(3·R_K) ratio; the ⅓ fraction (topological order) to ~1e-5 · gap 0.0%
    source: Tsui, Störmer & Gossard 1982, Phys. Rev. Lett. 48:1559 (discovery of the ν=1/3 plateau); fractional charge e/3 confirmed by de-Picciotto et al. 1997, Nature 389:162
  be-61 [loose]: Wiedemann-Franz Lorenz number vs degenerate limit (Kumar 2023)
    predicted 2.443004509073667e-8 approaches 2.443004509073667e-8 Lorenz number L (W·Ω·K⁻²); degenerate-limit consistency, material spread ~10% (caveat) · gap 10.0%
    source: Kumar, Auton et al. 2023, arXiv:2308.12349 / J. Low Temp. Phys. (Wiedemann-Franz verification in silver, RRR 200-400, recovers the fundamental L₀); Kittel, Introduction to Solid State Physics (Cu L≈2.23e-8 at 0°C)
  be-62 [moderate]: BCS gap ratio 2Δ/k_BT_c=3.528 vs weak-coupling superconductors (Tinkham)
    predicted 3.527753977724091 approaches 3.5 2Δ(0)/k_BT_c; weak-coupling class ~3.5, strong-coupling to ~4.3 (caveat) · gap 5.0%
    source: Tinkham 1996, Introduction to Superconductivity 2nd ed. §3.4 (weak-coupling 2Δ/k_BT_c=3.528); Carbotte 1990, Rev. Mod. Phys. 62:1027 (Al ~3.4, Sn ~3.5, strong-coupling Pb ~4.3)
  be-63 [loose]: Chandrasekhar mass ~1.4 M_⊙ vs white-dwarf max (Shapiro-Teukolsky)
    predicted 1.4558683947324034 approaches 1.35 M_⊙; WD max ~1.35 vs M_Ch~1.44 (upper-bound; super-Chandrasekhar SNe caveat) · gap 12.0%
    source: Shapiro & Teukolsky 1983, Black Holes, White Dwarfs and Neutron Stars §3 (M_Ch=1.44 M_⊙); observed WD max ~1.35 M_⊙; super-Chandrasekhar: Howell et al. 2006, Nature 443:308 (SN 2006gz)
  be-64 [loose]: Eddington luminosity vs peak accretion ratio (Rybicki-Lightman)
    predicted 1 approaches 1 peak L/L_Edd (order unity; super-Eddington ULX caveat) · gap 50.0%
    source: Rybicki & Lightman 1979, Radiative Processes in Astrophysics §1 (L_Edd); super-Eddington ULX pulsar: Bachetti et al. 2014, Nature 514:202
  be-65 [loose]: Jeans mass vs molecular-cloud fragmentation scale (Binney-Tremaine)
    predicted 1.7759676829994302 approaches 1 M_⊙; order-of-magnitude collapse scale (convention-dependent prefactor caveat) · gap 150.0%
    source: Binney & Tremaine 2008, Galactic Dynamics 2nd ed. §5 (Jeans mass, convention-dependent prefactor); protostellar-core mass function ~ 1 M_⊙ (e.g. molecular-cloud surveys)

```

stderr:

```text

```

## C015

UTC: 2026-09-26T17:03:00.103283+00:00  
Exit: 0

```bash
upt symbolic --simplify
```

stdout:

```text

Symbolic bridge composition — composing the SYMBOLIC forms, not just numbers
(the Observable contract: composed AST, dimensionally validated + numerically evaluable)

  ● CT-1  (be-42 ∘ be-16, via hawking-temperature ≡ temperature)
      composed:   landauer-erasure-energy(mass) = k_B·(hbar·c^3 / 8pi·G·mass·k_B)·ln2
      simplified: landauer-erasure-energy(mass) = ((hbar·c^3·ln2 / 8pi) / mass) / G
      value @ mass = M_sun:  5.9031e-31  (= composed, [energy])

  ● CT-1b (law-r_s ∘ be-42-via-rs, name-match junction)
      composed:   hawking-temperature(mass) = hbar·c / 4pi·k_B·(2·G·mass / c^2)
      simplified: hawking-temperature(mass) = hbar·c / 4pi·k_B·(2·G·mass / c^2)  (unchanged — minimal, MathTS absent, or not reducible here)
      value @ mass = M_sun:  6.1684e-8  (= composed, [temperature])

  Both compose by AST substitution at the junction and match the numeric composeEdges
  pipeline to float precision. --simplify folds the composed AST via MathTS (k_B cancels), guarded by re-validation.

```

stderr:

```text

```

## C016

UTC: 2026-09-26T17:03:00.992563+00:00  
Exit: 0

```bash
upt probe scan
```

stdout:

```text
upt probe scan — typed frontier gaps
⚠ 0 of 232 gaps are searchable by Product B (all are relation-link / regime-transition).
  Use `upt discover` for those. Pass --all to list them here.

```

stderr:

```text

```

## C017

UTC: 2026-09-26T17:03:01.911274+00:00  
Exit: 0

```bash
upt axes
```

stdout:

```text

Tensor-axis discrimination audit — which axes gate the discovery funnel
(rank grows on measured evidence: an axis gates only when it fires — docs/research/rank7-axis-measurement.md)

  scale        GATED    checked 111 · fires  75 · discriminates ✓
  force        GATED    checked  39 · fires  29 · discriminates ✓
  information  ungated  checked   1 · fires   0 · does not gate
  symmetry     ungated  checked   0 · fires   0 · does not gate
  topology     ungated  checked   0 · fires   0 · does not gate
  statistics   ungated  checked   0 · fires   0 · does not gate

  2 of 6 axes gate (scale, force); the rest classify but do not gate (their physics is closed-form-isolated or already-connected).

```

stderr:

```text

```

## C018

UTC: 2026-09-26T17:03:13.223025+00:00  
Exit: 0

```bash
upt atlas ab-spring-lc
```

stdout:

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

stderr:

```text

```

## C019

UTC: 2026-09-26T17:03:14.230035+00:00  
Exit: 0

```bash
upt atlas ab-pendulum-linear
```

stdout:

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

stderr:

```text

```

## C020

UTC: 2026-09-26T17:03:15.133522+00:00  
Exit: 0

```bash
upt atlas ab-schrodinger-diffusion
```

stdout:

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

stderr:

```text

```

## C021

UTC: 2026-09-26T17:03:16.093774+00:00  
Exit: 0

```bash
upt atlas ab-kg-schrodinger
```

stdout:

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

stderr:

```text

```

## C022

UTC: 2026-09-26T17:03:17.005804+00:00  
Exit: 0

```bash
upt atlas ab-stokes-einstein
```

stdout:

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

stderr:

```text

```

## C023

UTC: 2026-09-26T17:03:17.849226+00:00  
Exit: 0

```bash
upt atlas ab-telegraph-diffusion
```

stdout:

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

stderr:

```text

```

## C024

UTC: 2026-09-26T17:03:18.821239+00:00  
Exit: 0

```bash
upt path model-pendulum model-spring --at theta0=0.2 T0=1 t=10
```

stdout:

```text

upt path model-pendulum → model-spring
  1 bridge(s):
    model-pendulum --[approximation]--> model-spring  (ab-pendulum-linear)

  composite relation: approximation
  composed bound: K = 1 · delta = 0.015852531101436806
  norm: relative period error, normalized by the value of the reduced model
  bound at this point: K = 1 · delta = 0.002505744228602058 (closed-form: the exact error; the composed bound above is the supremum over the bridge's domain)

  regimes at --at: all hold
  horizons at t=10: all hold
    ab-pendulum-linear: holds — t ≪ 16 T0/θ0²; machine form t < 4 T0/θ0², the π/2-drift time
  (a path EXISTING is not a warrant: the bound is the warrant. A no-claim carries no number, and none is synthesized for it.)

```

stderr:

```text

```

## C025

UTC: 2026-09-26T17:03:19.711361+00:00  
Exit: 3

```bash
upt path model-pendulum model-spring --at theta0=0.2 T0=1 t=1000
```

stdout:

```text

upt path model-pendulum → model-spring
  1 bridge(s):
    model-pendulum --[approximation]--> model-spring  (ab-pendulum-linear)

  composite relation: approximation
  composed bound: K = 1 · delta = 0.015852531101436806
  norm: relative period error, normalized by the value of the reduced model
  bound at this point: K = 1 · delta = 0.002505744228602058 (closed-form: the exact error; the composed bound above is the supremum over the bridge's domain)

  regimes at --at: all hold
  horizons at t=1000: NOT all hold
    ab-pendulum-linear: VIOLATED — t ≪ 16 T0/θ0²; machine form t < 4 T0/θ0², the π/2-drift time
  (a path EXISTING is not a warrant: the bound is the warrant. A no-claim carries no number, and none is synthesized for it.)

```

stderr:

```text

```

## C026

UTC: 2026-09-26T17:03:20.616903+00:00  
Exit: 0

```bash
upt path model-pendulum model-lc
```

stdout:

```text

upt path model-pendulum → model-lc
  2 bridge(s):
    model-pendulum --[approximation]--> model-spring  (ab-pendulum-linear)
    model-spring --[exact-equivalence]--> model-lc  (ab-spring-lc)

  composite relation: no composite claim
  bound: no composite claim — reason 'no-composite-claim'
    'ab-pendulum-linear' (approximation) then 'ab-spring-lc' (exact-equivalence) composes to no relation, so the path carries no bound

  regimes at --at: UNKNOWN (a coordinate was not supplied); an unchecked regime is not a passing one
    ab-pendulum-linear: unknown — unchecked: theta0 <= 0.5 (θ0 ≤ 0.5 rad)
  horizons: NOT EVALUATED (no t= supplied via --at); an unevaluated horizon is not a passing one
    ab-pendulum-linear: t ≪ 16 T0/θ0²; machine form t < 4 T0/θ0², the π/2-drift time
  (a path EXISTING is not a warrant: the bound is the warrant. A no-claim carries no number, and none is synthesized for it.)

```

stderr:

```text

```

## C027

UTC: 2026-09-26T17:03:21.563207+00:00  
Exit: 0

```bash
upt regime diffusion --at tau=1 D=1 q=1
```

stdout:

```text

Regimes of family 'diffusion'
at tau=1 · D=1 · q=1

  [model] model-random-walk: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-fick: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-heat: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-schrodinger-free: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-langevin: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-stokes-drag: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-telegraph: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-laplace-1d: valid (VACUOUS — states no inequality; nothing was checked)
  [bridge] ab-walk-diffusion: unknown
    unchecked (no value supplied): dt · t^-1 <= 0.01 (Δt/t ≪ 1 (machine form ≤ 0.01, the coarse resolution WD1 measures))
  [bridge] ab-heat-diffusion: valid (VACUOUS — states no inequality; nothing was checked)
  [bridge] ab-schrodinger-diffusion: valid (VACUOUS — states no inequality; nothing was checked)
  [bridge] ab-langevin-diffusion: unknown
    unchecked (no value supplied): m · gamma^-1 · t^-1 <= 0.01 (τ_p/t ≪ 1 (machine form ≤ 0.01))
  [bridge] ab-stokes-einstein: unknown
    unchecked (no value supplied): Re <= 0.1 (Re ≪ 1 (machine form Re ≤ 0.1))
    unchecked (no value supplied): m · gamma^-1 · t^-1 <= 0.01 (τ_p/t ≪ 1 (machine form m/(γt) ≤ 0.01))
  [bridge] ab-telegraph-diffusion: VIOLATED
    violated: tau · D · q^2 <= 0.05 (ε = τDq² ≤ 0.05)
  [bridge] ab-telegraph-wave: VIOLATED
    violated: tau · D · q^2 >= 25 (ε = τDq² ≥ 25)
  [bridge] ab-heat-laplace: unknown
    unchecked (no value supplied): kappa · rho^-1 · cp^-1 · ell^-2 · t >= 1 (Fo = αt/ℓ² ≥ 1)

Pairwise overlap (on shared coordinates only):
  ab-langevin-diffusion vs ab-stokes-einstein: nested — shared: m · gamma^-1 · t^-1
  ab-telegraph-diffusion vs ab-telegraph-wave: disjoint — shared: tau · D · q^2

Uncovered regions: 1 point(s) of the stated box that no CONSTRAINING regime covers (6 of 16 records state an inequality):
  tau=1 · D=1 · q=1 · tau · D · q^2=1
  (an 'unknown' is not coverage — see the tri-state rule above)

```

stderr:

```text

```

## C028

UTC: 2026-09-26T17:03:22.470923+00:00  
Exit: 0

```bash
upt regime waves
```

stdout:

```text

Regimes of family 'waves'
(no --at point supplied: every inequality is UNCHECKED, which is not a pass)

  [model] model-string: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-dalembert: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-euler-linear: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-adiabatic-eos: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-sound: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-klein-gordon: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-stiff-string: valid (VACUOUS — states no inequality; nothing was checked)
  [bridge] ab-string-wave: valid (VACUOUS — states no inequality; nothing was checked)
  [bridge] ab-wave-dalembert: valid (VACUOUS — states no inequality; nothing was checked)
  [bridge] ab-sound-speed: unknown
    unchecked (no value supplied): p0 · p1^-1 >= 100 (|p′| ≪ p₀ (machine form p₀/p₁ ≥ 100))
  [bridge] ab-klein-gordon-wave: unknown
    unchecked (no value supplied): c · omega0^-1 · k >= 10 (ω₀/(c k) ≤ 0.1)
  [bridge] ab-kg-schrodinger: unknown
    unchecked (no value supplied): c · omega0^-1 · k <= 0.1 (ck/ω₀ ≤ 0.1)
  [bridge] ab-kg-oscillator: valid (VACUOUS — states no inequality; nothing was checked)
  [bridge] ab-stiff-string: unknown
    unchecked (no value supplied): F · EI^-1 · k^-2 >= 100 (β = EIk²/F ≤ 0.01)

Pairwise overlap (on shared coordinates only):
  ab-klein-gordon-wave vs ab-kg-schrodinger: disjoint — shared: c · omega0^-1 · k

Uncovered regions: no box stated. Pass --at to say where you want to know about;
  a synthesized box would measure this tool’s guess, not the atlas.

```

stderr:

```text

```

## C029

UTC: 2026-09-26T17:03:23.348003+00:00  
Exit: 0

```bash
upt regime oscillators --at theta0=0.2
```

stdout:

```text

Regimes of family 'oscillators'
at theta0=0.2

  [model] model-spring: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-lc: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-damped-spring: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-rlc: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-pendulum: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-chain: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-wave-1d: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-cubic-spring: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-first-order: valid (VACUOUS — states no inequality; nothing was checked)
  [bridge] ab-spring-lc: valid (VACUOUS — states no inequality; nothing was checked)
  [bridge] ab-damped-rlc: valid (VACUOUS — states no inequality; nothing was checked)
  [bridge] ab-pendulum-linear: valid
    every inequality checked and satisfied
  [bridge] ab-damped-massless: unknown
    unchecked (no value supplied): m · b^-2 · k < 0.25 (ζ > 1)
  [bridge] ab-chain-wave: unknown
    unchecked (no value supplied): qa < 1 (qa ≪ 1)

Pairwise overlap (on shared coordinates only):
  no two regimes share a coordinate, so none constrains another

Uncovered regions: none — some constraining regime holds at every point of the stated box.

```

stderr:

```text

```

## C030

UTC: 2026-09-26T17:03:43.925734+00:00  
Exit: 0

```bash
upt explain hawking-temperature mass=1.989e30
```

stdout:

```text

● hawking-temperature
  'hawking-temperature' is over-determined from {mass}: 2 derivation routes (be-42, be-42-via-rs) restate ONE bridge (BE-42). They agree (relative spread 0.0e+0) — agreement by construction, not an independent check. Recovered value: 6.1684e-8. Dimensionally, those inputs alone do not fix it — the encoded formula carries dimensionful constants.
  derivations:
    - be-42 (Hawking temperature T_H = ℏc³/(8πGMk_B)) = 6.1684e-8
    - be-42-via-rs (Hawking temperature T_H = ℏc/(4π k_B r_s)) = 6.1684e-8  [from leaves: mass]

```

stderr:

```text

```

## C031

UTC: 2026-09-26T17:03:44.801299+00:00  
Exit: 0

```bash
upt explain landauer-erasure-energy mass=1.989e30
```

stdout:

```text

● landauer-erasure-energy
  'landauer-erasure-energy' is determined from {mass} via be-16 (Landauer's bound E_min = k_B T ln2). Recovered value: 5.9031e-31. Dimensionally, those inputs alone do not fix it — the encoded formula carries dimensionful constants.
  derivations:
    - be-16 (Landauer's bound E_min = k_B T ln2) = 5.9031e-31  [from leaves: mass]

```

stderr:

```text

```

## C032

UTC: 2026-09-26T17:03:46.148382+00:00  
Exit: 0

```bash
upt eval 'hbar*c^3/(8*pi*G*M*k_B)' hbar=1.054571817e-34 c=299792458 G=6.6743e-11 M=1.989e30 k_B=1.380649e-23
```

stdout:

```text
6.168429712630829e-8

```

stderr:

```text

```

## C033

UTC: 2026-09-26T17:03:47.532147+00:00  
Exit: 2

```bash
upt eval 'hbar*c^3*ln(2)/(8*pi*G*M)' hbar=1.054571817e-34 c=299792458 G=6.6743e-11 M=1.989e30
```

stdout:

```text

```

stderr:

```text
Undefined function ln

```

## C034

UTC: 2026-09-26T17:03:48.420952+00:00  
Exit: 0

```bash
upt evaluate be-58 T_K=300 R_ohm=1000
```

stdout:

```text

● be-58  Johnson-Nyquist noise
  inputs: T_K=300, R_ohm=1000
  T_K = 300
  R_ohm = 1000
  S_V_V2_per_Hz = 1.6567788e-17

```

stderr:

```text

```

## C035

UTC: 2026-09-26T17:03:49.771383+00:00  
Exit: 0

```bash
upt eval 'sqrt(4*k*T*R*B)' k=1.380649e-23 T=300 R=1000 B=10000
```

stdout:

```text
4.070354775692163e-7

```

stderr:

```text

```

## C036

UTC: 2026-09-26T17:03:50.705681+00:00  
Exit: 0

```bash
upt evaluate be-59 V_volts=0.001
```

stdout:

```text

● be-59  AC Josephson
  inputs: V_volts=0.001
  V_volts = 0.001
  f_Hz = 483597848416.98364
  K_J_Hz_per_V = 483597848416983.6

```

stderr:

```text

```

## C037

UTC: 2026-09-26T17:03:51.680013+00:00  
Exit: 0

```bash
upt evaluate be-55 C=1
```

stdout:

```text

● be-55  Integer quantum Hall / TKNN
  inputs: C=1
  C = 1
  sigma_xy_S = 0.000038740458649318244
  R_H_ohm = 25812.807459304513
  R_K_ohm = 25812.807459304513

```

stderr:

```text

```

## C038

UTC: 2026-09-26T17:03:52.589699+00:00  
Exit: 0

```bash
upt evaluate be-60 nu=0.3333333333333333
```

stdout:

```text

● be-60  Fractional quantum Hall
  inputs: nu=0.3333333333333333
  nu = 0.3333333333333333
  sigma_xy_S = 0.000012913486216439415
  R_xy_ohm = 77438.42237791355

```

stderr:

```text

```

## C039

UTC: 2026-09-26T17:03:53.485045+00:00  
Exit: 0

```bash
upt evaluate be-61 sigma_S_per_m=58000000 T_K=300
```

stdout:

```text

● be-61  Wiedemann-Franz
  inputs: sigma_S_per_m=58000000, T_K=300
  sigma_S_per_m = 58000000
  T_K = 300
  kappa_W_per_mK = 425.08278457881806
  L0_W_ohm_per_K2 = 2.443004509073667e-8

```

stderr:

```text

```

## C040

UTC: 2026-09-26T17:03:54.429776+00:00  
Exit: 0

```bash
upt evaluate be-62 T_c_K=1.2
```

stdout:

```text

● be-62  BCS gap ratio
  inputs: T_c_K=1.2
  T_c_K = 1.2
  gap_0_J = 2.922354000954473e-23
  ratio_2gap_over_kTc = 3.527753977724091

```

stderr:

```text

```

## C041

UTC: 2026-09-26T17:03:55.393363+00:00  
Exit: 0

```bash
upt evaluate be-56 d_m=0.000001
```

stdout:

```text

● be-56  Casimir effect
  inputs: d_m=0.000001
  d_m = 0.000001
  pressure_Pa = -0.0013001257724477536

```

stderr:

```text

```

## C042

UTC: 2026-09-26T17:03:56.269040+00:00  
Exit: 0

```bash
upt evaluate be-57 a_m_s2=9.81
```

stdout:

```text

● be-57  Unruh effect
  inputs: a_m_s2=9.81
  a_m_s2 = 9.81
  T_K = 3.977968265813071e-20

```

stderr:

```text

```

## C043

UTC: 2026-09-26T17:03:57.146806+00:00  
Exit: 0

```bash
upt evaluate be-63 mu_e=2
```

stdout:

```text

● be-63  Chandrasekhar mass
  inputs: mu_e=2
  mu_e = 2
  M_Ch_kg = 2.89572223712275e+30
  M_Ch_solar = 1.4558683947324034

```

stderr:

```text

```

## C044

UTC: 2026-09-26T17:03:58.033556+00:00  
Exit: 0

```bash
upt evaluate be-64 M_kg=1.989e30
```

stdout:

```text

● be-64  Eddington luminosity
  inputs: M_kg=1.989e+30
  M_kg = 1.989e+30
  L_Edd_W = 1.2574382573536063e+31
  L_Edd_solar = 32848.43932480685

```

stderr:

```text

```

## C045

UTC: 2026-09-26T17:03:58.904598+00:00  
Exit: 0

```bash
upt evaluate be-65 T_K=10 rho_kg_per_m3=1e-16 mu=2.33
```

stdout:

```text

● be-65  Jeans mass
  inputs: T_K=10, rho_kg_per_m3=1e-16, mu=2.33
  T_K = 10
  rho_kg_per_m3 = 1e-16
  mu = 2.33
  M_J_kg = 6.753353958159026e+30

```

stderr:

```text

```

## C046

UTC: 2026-09-26T17:03:59.790708+00:00  
Exit: 0

```bash
upt evaluate be-51 M_kg=1.989e30 b_m=6.957e8
```

stdout:

```text

● be-51  Gravitational lensing (Eddington)
  inputs: M_kg=1.989e+30, b_m=695700000
  alpha_rad = 0.000008492529984347865
  alpha_arcsec = 1.7517100517691688
  M_kg = 1.989e+30
  b_m = 695700000

```

stderr:

```text

```

## C047

UTC: 2026-09-26T17:04:00.702030+00:00  
Exit: 0

```bash
upt evaluate be-52 M_kg=1.989e30 a_m=5.7909e10 e=0.20563 T_yr=0.2408467
```

stdout:

```text

● be-52  Perihelion precession (Einstein)
  inputs: M_kg=1.989e+30, a_m=57909000000, e=0.20563, T_yr=0.2408467
  dphi_rad_per_orbit = 5.020156754118592e-7
  dphi_arcsec_per_orbit = 0.10354816602183235
  dphi_arcsec_per_century = 42.99339207131854
  M_kg = 1.989e+30
  a_m = 57909000000
  e = 0.20563

```

stderr:

```text

```

## C048

UTC: 2026-09-26T17:04:18.562657+00:00  
Exit: 2

```bash
upt eval 'ln(2)' --debug
```

stdout:

```text

```

stderr:

```text
[parser: mathts]
Undefined function ln

```

## C049

UTC: 2026-09-26T17:04:19.954233+00:00  
Exit: 0

```bash
upt eval 'log(2)' --debug
```

stdout:

```text
0.6931471805599453

```

stderr:

```text
[parser: mathts]

```

## C050

UTC: 2026-09-26T17:04:21.443659+00:00  
Exit: 0

```bash
upt eval 'hbar*c^3*log(2)/(8*pi*G*M)' hbar=1.054571817e-34 c=299792458 G=6.6743e-11 M=1.989e30
```

stdout:

```text
5.903143819685109e-31

```

stderr:

```text

```

## C051

UTC: 2026-09-26T17:04:22.867223+00:00  
Exit: 0

```bash
upt derive period:time length:length gravity:acceleration --formula '2*pi*sqrt(length/gravity)'
```

stdout:

```text

● period  from {length, gravity}
  dimensionally determined up to a constant:  period ∝ length^0.5·gravity^-0.5
  formula dimension: [time]  ✓ homogeneous, matches target
  formula MATCHES the dimensional form — recovered prefactor ≈ 6.2832e+0
  ✓ agrees with CE-pendulum-period (Pendulum period), prefactor included: yours/canonical = 1 at 3 fixed points

```

stderr:

```text

```

## C052

UTC: 2026-09-26T17:04:24.324525+00:00  
Exit: 3

```bash
upt derive period:time length:length gravity:acceleration --formula 'pi*sqrt(length/gravity)'
```

stdout:

```text

● period  from {length, gravity}
  dimensionally determined up to a constant:  period ∝ length^0.5·gravity^-0.5
  formula dimension: [time]  ✓ homogeneous, matches target
  formula MATCHES the dimensional form — recovered prefactor ≈ 3.1416e+0
  ⚠ differs from CE-pendulum-period (Pendulum period) by a constant factor: yours/canonical = 0.500000 at 3 fixed points

```

stderr:

```text

```

## C053

UTC: 2026-09-26T17:04:25.870671+00:00  
Exit: 3

```bash
upt map --source=canonical --equation 'period = mass'
```

stdout:

```text

Your equation:  period = mass

  ⚠ dimensional MISMATCH: RHS is [mass] but the target is [time]
  · no canonical equation has this target and these variables, so the prefactor is NOT checked
  ● your equation joins the ANCHORED cluster of 84 via {mass, period}
     nearest equations: CE-kepler-third, CE-carrier-mobility, CE-centripetal-force, CE-compton-wavelength, CE-cyclotron-frequency (+78 more)
     (shared-quantity connectivity, not a physics claim)

Linkage map — how the equations connect via shared quantities  [source: canonical (standard-physics L-layer, bridges excluded)]
(23 components over 107 edges; 74 compose into chains)

  ● cluster of 83  [ANCHORED to known physics]
     edges:  CE-pendulum-period, CE-kepler-third, CE-schwarzschild-radius, CE-string-wave-speed, CE-compton-wavelength, CE-thermal-de-broglie, CE-hawking-temperature, CE-light-deflection, CE-perihelion-precession, CE-newton-gravitation, CE-newton-second-law, CE-mass-energy, CE-momentum, CE-kinetic-energy, CE-rotational-kinetic-energy, CE-gravitational-potential-energy, CE-work, CE-spring-potential-energy, CE-power, CE-centripetal-force, CE-hooke-law, CE-torque, CE-angular-momentum, CE-moment-of-inertia, CE-impulse, CE-simple-harmonic-frequency, CE-ohm-law, CE-electrical-power, CE-resistance-material, CE-capacitance-parallel-plate, CE-capacitor-energy, CE-inductor-energy, CE-magnetic-field-wire, CE-cyclotron-frequency, CE-larmor-radius, CE-point-charge-field, CE-lc-resonance, CE-coulomb, CE-rc-time-constant, CE-poynting-flux, CE-solenoid-field, CE-larmor-power, CE-field-energy-density, CE-hydrostatic-pressure, CE-pressure-definition, CE-density-definition, CE-buoyant-force, CE-stokes-drag, CE-wave-speed, CE-sound-speed, CE-volume-flow-rate, CE-shear-stress, CE-dynamic-pressure, CE-oscillator-energy, CE-heat-capacity, CE-landauer, CE-jarzynski, CE-stefan-boltzmann, CE-ideal-gas, CE-wien, CE-latent-heat, CE-clausius-entropy, CE-thermal-diffusivity, CE-de-broglie, CE-carrier-mobility, CE-electrical-conductivity, CE-drude-resistivity, CE-hall-coefficient, CE-drift-velocity, CE-fermi-energy, CE-fermi-velocity, CE-plasma-frequency, CE-debye-frequency, CE-equipartition, CE-stokes-einstein, CE-kinetic-pressure, CE-mb-most-probable-speed, CE-bernoulli, CE-photoelectric, CE-boltzmann-factor, CE-lorentz-factor, CE-compton-shift, CE-boltzmann-entropy
     status: 83 law
     link hubs: acceleration, angular-velocity, area, boltzmann-constant, capacitance, carrier-density, carrier-mobility, charge, compton-wavelength, current, density, displacement, distance, dynamic-viscosity, electric-field, energy, flow-velocity, force, g, height, inductance, length, magnetic-field, mass, molecular-mass, moment-of-inertia, mu_0, number-density, p, period, planck-constant, power, pressure, r, radius, reduced-planck-constant, relaxation-time, resistance, secondary-mass, speed, speed-of-light, spring-constant, temperature, velocity, voltage, volume

  ● cluster of 2  [ANCHORED to known physics]
     edges:  CE-classical-electron-radius, CE-thomson-cross-section
     status: 2 law
     link hubs: classical-electron-radius

  ● cluster of 2  [ANCHORED to known physics]
     edges:  CE-half-life, CE-radioactive-decay
     status: 2 law
     link hubs: decay-constant

  ○ isolated (20) — share no quantity with any other edge:
     CE-bekenstein-hawking, CE-bohr-magneton, CE-bohr-radius, CE-carnot-efficiency, CE-einstein-field-eq, CE-first-law-thermodynamics, CE-friedmann, CE-hubble-distance, CE-laplace-pressure, CE-lorentz-force, CE-malus-law, CE-normal-distribution, CE-planck-einstein, CE-planck-length, CE-planck-mass, CE-planck-time, CE-rydberg-energy, CE-rydberg-formula, CE-snell-law, CE-uncertainty-principle

  (a structural map — shared-quantity connectivity, NOT a credibility signal)

```

stderr:

```text

```

## C054

UTC: 2026-09-26T17:04:26.635347+00:00  
Exit: 0

```bash
upt audit
```

stdout:

```text

Deriving the bridge equations by dimensions
(form by dimensions; the constant is recovered by matching the evaluator)

  DERIVED (11) — recognized monomial, prefactor recovered:
    be-12                  +[ℏ,k_B]  ×2.507e+0
    be-16                  +[k_B]  ×6.931e-1
    be-42-via-rs           +[ℏ,c,k_B]  ×7.958e-2
    law-schwarzschild-radius +[c,G]  ×2.000e+0
    be-21                  +[ℏ,k_B]  ×7.958e-2
    be-48                  +[ℏ,c]  ×7.026e-41  (empirical/tuned constant)
    be-13                  +[]  ×4.000e+0
    be-15                  +[]  ×1.000e+0
    be-17                  +[]  ×1.000e+0
    be-20                  +[c,G]  ×3.979e-2
    be-36                  +[]  ×-1.000e+0

  DECOY (5) — dimensionally valid but wrong form:
    be-42, be-51, be-14, be-27, be-43

  OPEN (25) — irreducible free dimensionless group(s); by complexity:
    cplx=1  be-11-zurek
    cplx=1  be-37
    cplx=1  be-52
    cplx=1  be-19
    cplx=1  be-54
    cplx=1  be-18
    cplx=1  be-23
    cplx=1  be-24
    cplx=1  be-30
    cplx=1  be-38
    cplx=1  be-50
    cplx=2  be-11-master
    cplx=2  be-22
    cplx=2  be-25
    cplx=2  be-26
    cplx=3  be-53
    cplx=3  be-33
    cplx=3  be-45
    cplx=3  be-46
    cplx=4  be-31
    cplx=4  be-34
    cplx=4  be-41
    cplx=4  be-49
    cplx=5  be-39
    cplx=6  be-47

  (derivability is ORTHOGONAL to credibility — see the priority command)

```

stderr:

```text

```

## C055

UTC: 2026-09-26T17:04:27.450880+00:00  
Exit: 0

```bash
upt eval '2*pi*sqrt(length/gravity)' length=1 gravity=9.81
```

stdout:

```text
2.0060666807106475

```

stderr:

```text

```

## C056

UTC: 2026-09-26T17:04:27.615723+00:00  
Exit: 0

```bash
upt priority
```

stdout:

```text

Bridge triage — structural decidability against established physics
(review/confrontation priority — NOT a credibility ranking)

   tier  anchor  grounding   cplx  data   bridge                status
   ─────────────────────────────────────────────────────────────────────────

   ── Tier 1: anchored + grounded/tractable — confront first
   T1     0   grounded     0        be-12                speculative
   T1     0   grounded     0        be-42-via-rs         highly-speculative
   T1     0   empirical    0  DATA  be-48                speculative
   T1     0   decoy        0        be-42                highly-speculative
   T1     0   open         1        be-38                speculative
   T1     1   grounded     0        be-16                speculative
   T1     1   decoy        0        be-27                speculative
   T1     1   open         1  DATA  be-23                speculative

   ── Tier 2: anchored OR grounded — second pass
   T2     0   open         3        be-33                speculative
   T2     ∞   grounded     0        be-13                speculative
   T2     ∞   grounded     0        be-15                speculative
   T2     ∞   grounded     0        be-17                speculative
   T2     ∞   grounded     0        be-20                speculative
   T2     ∞   grounded     0  DATA  be-36                speculative

   ── Tier 3: isolated + multi-parameter — needs literature review, not structure
   T3     ∞   decoy        0        be-14                speculative
   T3     ∞   decoy        0        be-43                speculative
   T3     ∞   open         1        be-18                speculative
   T3     ∞   open         1        be-19                speculative
   T3     ∞   open         1        be-24                speculative
   T3     ∞   open         1        be-30                speculative
   T3     ∞   open         1        be-50                highly-speculative
   T3     ∞   open         1        be-54                speculative
   T3     ∞   open         2        be-22                speculative
   T3     ∞   open         2        be-25                speculative
   T3     ∞   open         2        be-26                speculative
   T3     ∞   open         3        be-45                speculative
   T3     ∞   open         3        be-46                highly-speculative
   T3     ∞   open         4        be-31                speculative
   T3     ∞   open         4        be-41                speculative
   T3     ∞   open         4        be-49                speculative
   T3     ∞   open         5        be-39                speculative
   T3     ∞   open         6        be-47                speculative

   Tiers: {"1":8,"2":6,"3":18}  (of 32 non-established bridges)
   Reminder: tier ranks decidability/anchoring, not truth.

```

stderr:

```text

```

## C057

UTC: 2026-09-26T17:04:28.642055+00:00  
Exit: 0

```bash
upt predict
```

stdout:

```text

Bridge prediction — empty (scale×force) regime cells as undiscovered-link HYPOTHESES
⚠ STRUCTURAL hypotheses for physicist review, NOT discovered bridges. "Two regimes
  share bridge-neighbours but are not directly linked" (triadic closure) is a weak prior.

  projected 39/41 edges onto 15 regimes; 14 regime-pairs already bridged.

  predicted missing bridges (by shared-neighbour count):
    gravitational ⟷ cosmological                   score 2  via {cosmological/gravitational, quantum/gravitational}
    cosmological/gravitational ⟷ quantum           score 2  via {cosmological, quantum/gravitational}
    gravitational ⟷ classical/gravitational        score 1  via {quantum/gravitational}
    gravitational ⟷ quantum                        score 1  via {quantum/gravitational}
    classical/electromagnetic ⟷ cosmological       score 1  via {quantum}
    classical/electromagnetic ⟷ mesoscopic         score 1  via {quantum}
    classical/electromagnetic ⟷ quantum/gravitational score 1  via {quantum}
    classical/gravitational ⟷ cosmological         score 1  via {quantum/gravitational}
    classical/gravitational ⟷ cosmological/gravitational score 1  via {quantum/gravitational}
    classical/gravitational ⟷ quantum              score 1  via {quantum/gravitational}
    cosmological ⟷ mesoscopic                      score 1  via {quantum}
    cosmological ⟷ quantum/electromagnetic         score 1  via {quantum}
    mesoscopic ⟷ quantum/electromagnetic           score 1  via {quantum}
    mesoscopic ⟷ quantum/gravitational             score 1  via {quantum}
    mesoscopic/electromagnetic ⟷ quantum           score 1  via {mesoscopic}
    quantum/electromagnetic ⟷ quantum/gravitational score 1  via {quantum}

  unexplored regimes adjacent to known ones (the tensor's empty neighbourhoods):
    classical/emergent, classical/strong, classical/weak, cosmological/electromagnetic, cosmological/emergent, cosmological/strong, cosmological/weak, mesoscopic/gravitational, mesoscopic/strong, mesoscopic/weak, quantum/emergent

  (regime coords come from quantity attributes; only regime-tagged edges are placed.)

```

stderr:

```text

```

## C058

UTC: 2026-09-26T17:04:28.922372+00:00  
Exit: 0

```bash
upt eval 'k*T/(6*pi*eta*a)' k=1.380649e-23 T=293.15 eta=0.001 a=0.000001
```

stdout:

```text
2.1471978227748074e-13

```

stderr:

```text

```

## C059

UTC: 2026-09-26T17:04:29.652646+00:00  
Exit: 0

```bash
upt connectors
```

stdout:

```text

Orphan connectors — same-dimension identifications that would pull an ISOLATED
bridge into the anchored core (the graph's structural frontier).  [source: catalog + canonical]
⚠ A REVIEW SURFACE: same dimension is a WEAK prior; most are decoys (a Förster
  radius is not a Schwarzschild radius). Same-kind (shared name token) = stronger.

  19 of the isolated bridges have a same-kind connector; 11 are truly unconnected.

  SAME-KIND connectors (the motivated set — orphan ≟ core via shared token):
    ── be-14 (isolated):
        boundary-entanglement-entropy ≟ bh-entropy             [[entropy]]  → CE-bekenstein-hawking
        boundary-entanglement-entropy ≟ boltzmann-entropy      [[entropy]]  → CE-boltzmann-entropy
        boundary-entanglement-entropy ≟ entropy-change         [[entropy]]  → CE-clausius-entropy
        minimal-surface-area ≟ area                            [[area]]  → CE-resistance-material
        minimal-surface-area ≟ cross-sectional-area            [[area]]  → CE-volume-flow-rate
    ── be-22 (isolated):
        boundary-length ≟ coarsening-length                    [[length]]  → be-15
        boundary-length ≟ length                               [[length]]  → CE-pendulum-period
        boundary-length ≟ planck-length                        [[length]]  → be-31
        boundary-length ≟ quantum-correlation-length           [[length]]  → be-33
        boundary-length ≟ reference-correlation-length         [[length]]  → be-33
    ── be-24 (isolated):
        donor-acceptor-distance ≟ distance                     [[length]]  → CE-work
        donor-acceptor-distance ≟ hubble-distance              [[length]]  → CE-hubble-distance
        foerster-radius ≟ bohr-radius                          [[length]]  → CE-bohr-radius
        foerster-radius ≟ classical-electron-radius            [[length]]  → CE-classical-electron-radius
        foerster-radius ≟ droplet-radius                       [[length]]  → CE-laplace-pressure
        foerster-radius ≟ far-radius                           [[length]]  → be-37
        foerster-radius ≟ larmor-radius                        [[length]]  → CE-larmor-radius
        foerster-radius ≟ near-radius                          [[length]]  → be-37
        foerster-radius ≟ particle-radius                      [[length]]  → CE-stokes-einstein
        foerster-radius ≟ radius                               [[length]]  → CE-schwarzschild-radius
        foerster-radius ≟ schwarzschild-radius                 [[length]]  → be-42-via-rs
    ── be-26 (isolated):
        attempt-frequency ≟ angular-frequency                  [[frequency]]  → CE-lc-resonance
        attempt-frequency ≟ cyclotron-frequency                [[frequency]]  → CE-cyclotron-frequency
        attempt-frequency ≟ debye-frequency                    [[frequency]]  → CE-debye-frequency
        attempt-frequency ≟ frequency                          [[frequency]]  → CE-wave-speed
        attempt-frequency ≟ photon-frequency                   [[frequency]]  → CE-photoelectric
        attempt-frequency ≟ plasma-frequency                   [[frequency]]  → CE-plasma-frequency
        mutation-rate ≟ decoherence-rate                       [[frequency]]  → be-11-zurek
        mutation-rate ≟ grw-localization-rate                  [[frequency]]  → be-48
        mutation-rate ≟ hubble-rate                            [[frequency]]  → be-47
        mutation-rate ≟ relaxation-rate                        [[frequency]]  → be-11-zurek
        tunneling-mass ≟ defect-rest-mass                      [[mass]]  → be-34
        tunneling-mass ≟ effective-mass                        [[mass]]  → be-23
        tunneling-mass ≟ electron-mass                         [[mass]]  → CE-compton-shift
        tunneling-mass ≟ mass                                  [[mass]]  → be-12
        tunneling-mass ≟ molecular-mass                        [[mass]]  → CE-kinetic-pressure
        tunneling-mass ≟ planck-mass                           [[mass]]  → be-41
        tunneling-mass ≟ reference-mass                        [[mass]]  → be-41
        tunneling-mass ≟ secondary-mass                        [[mass]]  → CE-newton-gravitation
        tunneling-mass ≟ swampland-tower-mass                  [[mass]]  → be-41
    ── be-36 (isolated):
        gravitational-wave-speed ≟ most-probable-speed         [[velocity]]  → CE-mb-most-probable-speed
        gravitational-wave-speed ≟ sound-speed                 [[velocity]]  → CE-debye-frequency
        gravitational-wave-speed ≟ speed                       [[velocity]]  → CE-string-wave-speed
        gravitational-wave-speed ≟ speed-of-light              [[velocity]]  → CE-larmor-power
    ── be-43 (isolated):
        wormhole-cross-section-area ≟ area                     [[area]]  → CE-resistance-material
        wormhole-cross-section-area ≟ cross-sectional-area     [[area]]  → CE-volume-flow-rate
        wormhole-cross-section-area ≟ thomson-cross-section    [[area]]  → CE-thomson-cross-section
        wormhole-entanglement-entropy ≟ bh-entropy             [[entropy]]  → CE-bekenstein-hawking
        wormhole-entanglement-entropy ≟ boltzmann-entropy      [[entropy]]  → CE-boltzmann-entropy
        wormhole-entanglement-entropy ≟ entropy-change         [[entropy]]  → CE-clausius-entropy
    ── be-45 (isolated):
        inflation-hubble-energy ≟ active-noise-energy          [[energy]]  → be-27
        inflation-hubble-energy ≟ energy                       [[energy]]  → CE-capacitor-energy
        inflation-hubble-energy ≟ erasure-energy               [[energy]]  → CE-landauer
        inflation-hubble-energy ≟ fermi-energy                 [[energy]]  → CE-fermi-energy
        inflation-hubble-energy ≟ free-energy-difference       [[energy]]  → CE-jarzynski
        inflation-hubble-energy ≟ gravitational-potential-energy [[energy]]  → CE-gravitational-potential-energy
        inflation-hubble-energy ≟ heat-energy                  [[energy]]  → CE-heat-capacity
        inflation-hubble-energy ≟ internal-energy-change       [[energy]]  → CE-first-law-thermodynamics
        inflation-hubble-energy ≟ kinetic-energy               [[energy]]  → CE-kinetic-energy
        inflation-hubble-energy ≟ landauer-erasure-energy      [[energy]]  → be-16
        inflation-hubble-energy ≟ oscillator-energy            [[energy]]  → CE-oscillator-energy
        inflation-hubble-energy ≟ photoelectron-max-energy     [[energy]]  → CE-photoelectric
        inflation-hubble-energy ≟ photon-energy                [[energy]]  → CE-planck-einstein
        inflation-hubble-energy ≟ rest-energy                  [[energy]]  → CE-mass-energy
        inflation-hubble-energy ≟ rotational-kinetic-energy    [[energy]]  → CE-rotational-kinetic-energy
        inflation-hubble-energy ≟ rydberg-energy               [[energy]]  → CE-rydberg-energy
        inflation-hubble-energy ≟ spring-potential-energy      [[energy]]  → CE-spring-potential-energy
        inflation-hubble-energy ≟ state-energy                 [[energy]]  → CE-boltzmann-factor
        inflation-hubble-energy ≟ thermal-energy               [[energy]]  → CE-equipartition
        planck-mass-energy ≟ active-noise-energy               [[energy]]  → be-27
        planck-mass-energy ≟ energy                            [[energy]]  → CE-capacitor-energy
        planck-mass-energy ≟ erasure-energy                    [[energy]]  → CE-landauer
        planck-mass-energy ≟ fermi-energy                      [[energy]]  → CE-fermi-energy
        planck-mass-energy ≟ free-energy-difference            [[energy]]  → CE-jarzynski
        planck-mass-energy ≟ gravitational-potential-energy    [[energy]]  → CE-gravitational-potential-energy
        planck-mass-energy ≟ heat-energy                       [[energy]]  → CE-heat-capacity
        planck-mass-energy ≟ internal-energy-change            [[energy]]  → CE-first-law-thermodynamics
        planck-mass-energy ≟ kinetic-energy                    [[energy]]  → CE-kinetic-energy
        planck-mass-energy ≟ landauer-erasure-energy           [[energy]]  → be-16
        planck-mass-energy ≟ oscillator-energy                 [[energy]]  → CE-oscillator-energy
        planck-mass-energy ≟ photoelectron-max-energy          [[energy]]  → CE-photoelectric
        planck-mass-energy ≟ photon-energy                     [[energy]]  → CE-planck-einstein
        planck-mass-energy ≟ rest-energy                       [[energy]]  → CE-mass-energy
        planck-mass-energy ≟ rotational-kinetic-energy         [[energy]]  → CE-rotational-kinetic-energy
        planck-mass-energy ≟ rydberg-energy                    [[energy]]  → CE-rydberg-energy
        planck-mass-energy ≟ spring-potential-energy           [[energy]]  → CE-spring-potential-energy
        planck-mass-energy ≟ state-energy                      [[energy]]  → CE-boltzmann-factor
        planck-mass-energy ≟ thermal-energy                    [[energy]]  → CE-equipartition
    ── CE-bekenstein-hawking (isolated):
        bh-entropy ≟ boltzmann-entropy                         [[entropy]]  → CE-boltzmann-entropy
        bh-entropy ≟ entropy-change                            [[entropy]]  → CE-clausius-entropy
    ── CE-bohr-radius (isolated):
        bohr-radius ≟ classical-electron-radius                [[length]]  → CE-classical-electron-radius
        bohr-radius ≟ far-radius                               [[length]]  → be-37
        bohr-radius ≟ larmor-radius                            [[length]]  → CE-larmor-radius
        bohr-radius ≟ near-radius                              [[length]]  → be-37
        bohr-radius ≟ particle-radius                          [[length]]  → CE-stokes-einstein
        bohr-radius ≟ radius                                   [[length]]  → CE-schwarzschild-radius
        bohr-radius ≟ schwarzschild-radius                     [[length]]  → be-42-via-rs
    ── CE-carnot-efficiency (isolated):
        cold-reservoir-temperature ≟ effective-temperature     [[temperature]]  → be-27
        cold-reservoir-temperature ≟ reference-temperature     [[temperature]]  → be-33
        cold-reservoir-temperature ≟ reheating-temperature     [[temperature]]  → be-34
        cold-reservoir-temperature ≟ temperature               [[temperature]]  → be-12
        cold-reservoir-temperature ≟ temperature-change        [[temperature]]  → CE-heat-capacity
        hot-reservoir-temperature ≟ effective-temperature      [[temperature]]  → be-27
        hot-reservoir-temperature ≟ reference-temperature      [[temperature]]  → be-33
        hot-reservoir-temperature ≟ reheating-temperature      [[temperature]]  → be-34
        hot-reservoir-temperature ≟ temperature                [[temperature]]  → be-12
        hot-reservoir-temperature ≟ temperature-change         [[temperature]]  → CE-heat-capacity
    ── CE-einstein-field-eq (isolated):
        efe-curvature ≟ cosmological-constant-curvature        [[L^-2]]  → be-13
        stress-energy-density ≟ field-energy-density           [[L^-1 M T^-2]]  → CE-field-energy-density
        stress-energy-density ≟ shear-stress                   [[L^-1 M T^-2]]  → CE-shear-stress
        stress-energy-density ≟ stress-energy-trace            [[L^-1 M T^-2]]  → be-13
    ── CE-first-law-thermodynamics (isolated):
        heat-added ≟ heat                                      [[energy]]  → CE-clausius-entropy
        heat-added ≟ heat-energy                               [[energy]]  → CE-heat-capacity
        heat-added ≟ latent-heat                               [[energy]]  → CE-latent-heat
        internal-energy-change ≟ active-noise-energy           [[energy]]  → be-27
        internal-energy-change ≟ energy                        [[energy]]  → CE-capacitor-energy
        internal-energy-change ≟ erasure-energy                [[energy]]  → CE-landauer
        internal-energy-change ≟ fermi-energy                  [[energy]]  → CE-fermi-energy
        internal-energy-change ≟ free-energy-difference        [[energy]]  → CE-jarzynski
        internal-energy-change ≟ gravitational-potential-energy [[energy]]  → CE-gravitational-potential-energy
        internal-energy-change ≟ heat-energy                   [[energy]]  → CE-heat-capacity
        internal-energy-change ≟ kinetic-energy                [[energy]]  → CE-kinetic-energy
        internal-energy-change ≟ landauer-erasure-energy       [[energy]]  → be-16
        internal-energy-change ≟ oscillator-energy             [[energy]]  → CE-oscillator-energy
        internal-energy-change ≟ photoelectron-max-energy      [[energy]]  → CE-photoelectric
        internal-energy-change ≟ rest-energy                   [[energy]]  → CE-mass-energy
        internal-energy-change ≟ rotational-kinetic-energy     [[energy]]  → CE-rotational-kinetic-energy
        internal-energy-change ≟ spring-potential-energy       [[energy]]  → CE-spring-potential-energy
        internal-energy-change ≟ state-energy                  [[energy]]  → CE-boltzmann-factor
        internal-energy-change ≟ thermal-energy                [[energy]]  → CE-equipartition
        work-done-by-system ≟ work                             [[energy]]  → CE-work
        work-done-by-system ≟ work-function                    [[energy]]  → CE-photoelectric
    ── CE-laplace-pressure (isolated):
        droplet-radius ≟ bohr-radius                           [[length]]  → CE-bohr-radius
        droplet-radius ≟ classical-electron-radius             [[length]]  → CE-classical-electron-radius
        droplet-radius ≟ far-radius                            [[length]]  → be-37
        droplet-radius ≟ larmor-radius                         [[length]]  → CE-larmor-radius
        droplet-radius ≟ near-radius                           [[length]]  → be-37
        droplet-radius ≟ particle-radius                       [[length]]  → CE-stokes-einstein
        droplet-radius ≟ radius                                [[length]]  → CE-schwarzschild-radius
        droplet-radius ≟ schwarzschild-radius                  [[length]]  → be-42-via-rs
        laplace-pressure ≟ bernoulli-total-pressure            [[L^-1 M T^-2]]  → CE-bernoulli
        laplace-pressure ≟ dynamic-pressure                    [[L^-1 M T^-2]]  → CE-dynamic-pressure
        laplace-pressure ≟ kinetic-pressure                    [[L^-1 M T^-2]]  → CE-kinetic-pressure
        laplace-pressure ≟ pressure                            [[L^-1 M T^-2]]  → CE-hydrostatic-pressure
        laplace-pressure ≟ static-pressure                     [[L^-1 M T^-2]]  → CE-bernoulli
    ── CE-lorentz-force (isolated):
        lorentz-force ≟ coulomb-force                          [[force]]  → CE-coulomb
        lorentz-force ≟ force                                  [[force]]  → CE-newton-second-law
        lorentz-force ≟ gravitational-force                    [[force]]  → CE-newton-gravitation
        lorentz-force ≟ mond-force                             [[force]]  → be-38
        lorentz-force ≟ newtonian-force                        [[force]]  → be-38
    ── CE-normal-distribution (isolated):
        normal-probability-density ≟ turn-density              [[L^-1]]  → CE-solenoid-field
    ── CE-planck-einstein (isolated):
        photon-energy ≟ active-noise-energy                    [[energy]]  → be-27
        photon-energy ≟ energy                                 [[energy]]  → CE-capacitor-energy
        photon-energy ≟ erasure-energy                         [[energy]]  → CE-landauer
        photon-energy ≟ fermi-energy                           [[energy]]  → CE-fermi-energy
        photon-energy ≟ free-energy-difference                 [[energy]]  → CE-jarzynski
        photon-energy ≟ gravitational-potential-energy         [[energy]]  → CE-gravitational-potential-energy
        photon-energy ≟ heat-energy                            [[energy]]  → CE-heat-capacity
        photon-energy ≟ internal-energy-change                 [[energy]]  → CE-first-law-thermodynamics
        photon-energy ≟ kinetic-energy                         [[energy]]  → CE-kinetic-energy
        photon-energy ≟ landauer-erasure-energy                [[energy]]  → be-16
        photon-energy ≟ oscillator-energy                      [[energy]]  → CE-oscillator-energy
        photon-energy ≟ photoelectron-max-energy               [[energy]]  → CE-photoelectric
        photon-energy ≟ rest-energy                            [[energy]]  → CE-mass-energy
        photon-energy ≟ rotational-kinetic-energy              [[energy]]  → CE-rotational-kinetic-energy
        photon-energy ≟ spring-potential-energy                [[energy]]  → CE-spring-potential-energy
        photon-energy ≟ state-energy                           [[energy]]  → CE-boltzmann-factor
        photon-energy ≟ thermal-energy                         [[energy]]  → CE-equipartition
    ── CE-planck-time (isolated):
        planck-time ≟ elapsed-time                             [[time]]  → CE-radioactive-decay
        planck-time ≟ microscopic-relaxation-time              [[time]]  → be-34
        planck-time ≟ rc-time-constant                         [[time]]  → CE-rc-time-constant
        planck-time ≟ relaxation-time                          [[time]]  → CE-carrier-mobility
        planck-time ≟ time                                     [[time]]  → be-15
    ── CE-rydberg-energy (isolated):
        rydberg-energy ≟ active-noise-energy                   [[energy]]  → be-27
        rydberg-energy ≟ energy                                [[energy]]  → CE-capacitor-energy
        rydberg-energy ≟ erasure-energy                        [[energy]]  → CE-landauer
        rydberg-energy ≟ fermi-energy                          [[energy]]  → CE-fermi-energy
        rydberg-energy ≟ free-energy-difference                [[energy]]  → CE-jarzynski
        rydberg-energy ≟ gravitational-potential-energy        [[energy]]  → CE-gravitational-potential-energy
        rydberg-energy ≟ heat-energy                           [[energy]]  → CE-heat-capacity
        rydberg-energy ≟ internal-energy-change                [[energy]]  → CE-first-law-thermodynamics
        rydberg-energy ≟ kinetic-energy                        [[energy]]  → CE-kinetic-energy
        rydberg-energy ≟ landauer-erasure-energy               [[energy]]  → be-16
        rydberg-energy ≟ oscillator-energy                     [[energy]]  → CE-oscillator-energy
        rydberg-energy ≟ photoelectron-max-energy              [[energy]]  → CE-photoelectric
        rydberg-energy ≟ photon-energy                         [[energy]]  → CE-planck-einstein
        rydberg-energy ≟ rest-energy                           [[energy]]  → CE-mass-energy
        rydberg-energy ≟ rotational-kinetic-energy             [[energy]]  → CE-rotational-kinetic-energy
        rydberg-energy ≟ spring-potential-energy               [[energy]]  → CE-spring-potential-energy
        rydberg-energy ≟ state-energy                          [[energy]]  → CE-boltzmann-factor
        rydberg-energy ≟ thermal-energy                        [[energy]]  → CE-equipartition
    ── CE-uncertainty-principle (isolated):
        position-momentum-uncertainty-product ≟ angular-momentum [[action]]  → CE-angular-momentum

  truly unconnected (no same-dimension bridge into them): CE-bohr-magneton, CE-snell-law, be-17, be-21, be-25, be-30, be-39, be-46, be-49, be-50, be-53

  Physicist-reasoned ranking + the genuinely-motivated few (e.g. coarsening-length ≟
  quantum-correlation-length; tunneling-mass ≟ effective-mass) are written up in
  docs/research/Orphan-Connector-Analysis.md and proposed in spec Part-IX §9.

```

stderr:

```text

```

## C060

UTC: 2026-09-26T17:04:29.951188+00:00  
Exit: 1

```bash
upt ground compton-wavelength hubble-distance
```

stdout:

```text

```

stderr:

```text
upt ground: no discovery candidate pairs 'compton-wavelength' with 'hubble-distance' — they may not share a dimension, or are already connected (not a cross-cluster coincidence).

```

## C061

UTC: 2026-09-26T17:04:30.622117+00:00  
Exit: 0

```bash
upt map --source=both --evidence=formally-proved
```

stdout:

```text

Linkage map — how the equations connect via shared quantities  [source: catalog + canonical]
(0 components over 0 edges; 0 compose into chains)

  filter: evidence=formally-proved — 0 of 148 kept; 40 dropped (did not match); 108 dropped (no overlay metadata)
  ○ isolated (0) — share no quantity with any other edge:
     

  (a structural map — shared-quantity connectivity, NOT a credibility signal)

```

stderr:

```text

```

## C062

UTC: 2026-09-26T17:04:31.021912+00:00  
Exit: 0

```bash
upt path model-spring model-lc
```

stdout:

```text

upt path model-spring → model-lc
  1 bridge(s):
    model-spring --[exact-equivalence]--> model-lc  (ab-spring-lc)

  composite relation: exact-equivalence
  composed bound: K = 1 · delta = 0
  norm: (none stated — the claim is the vacuous identity)

  regimes: VACUOUS — no bridge on this path states an inequality; nothing was checked
  horizons: none on this path (no step carries a bound)
  (a path EXISTING is not a warrant: the bound is the warrant. A no-claim carries no number, and none is synthesized for it.)

```

stderr:

```text

```

## C063

UTC: 2026-09-26T17:04:31.547261+00:00  
Exit: 0

```bash
upt map --source=canonical --format=mermaid --out=/root/docs/audit/canonical-physics-map.mmd
```

stdout:

```text

```

stderr:

```text
upt: wrote mermaid (107 junctions, 23 clusters) to /root/docs/audit/canonical-physics-map.mmd

```

## C064

UTC: 2026-09-26T17:04:31.958663+00:00  
Exit: 1

```bash
upt path model-klein-gordon model-schrodinger-free --at c=1 omega0=1 k=0.05 t=10
```

stdout:

```text

```

stderr:

```text
upt path: 'model-klein-gordon' is in family 'waves' and 'model-schrodinger-free' in 'diffusion'; routes are searched within one family, and cross-family routes are not supported

```

## C065

UTC: 2026-09-26T17:04:32.597654+00:00  
Exit: 0

```bash
upt map --source=both --format=svg --out=/root/docs/audit/combined-physics-map.svg
```

stdout:

```text

```

stderr:

```text
upt: wrote svg (148 junctions, 40 clusters) to /root/docs/audit/combined-physics-map.svg

```

## C066

UTC: 2026-09-26T17:04:32.873599+00:00  
Exit: 1

```bash
upt path model-klein-gordon model-schrodinger-free --at c=1 omega0=1 k=1 t=10
```

stdout:

```text

```

stderr:

```text
upt path: 'model-klein-gordon' is in family 'waves' and 'model-schrodinger-free' in 'diffusion'; routes are searched within one family, and cross-family routes are not supported

```

## C067

UTC: 2026-09-26T17:04:33.763403+00:00  
Exit: 0

```bash
upt path model-telegraph model-fick --at tau=0.01 D=1 q=1 t=1
```

stdout:

```text

upt path model-telegraph → model-fick
  1 bridge(s):
    model-telegraph --[approximation]--> model-fick  (ab-telegraph-diffusion)

  composite relation: approximation
  composed bound: K = 1 · delta = 0.055728090000841446
  norm: relative error of the slow-mode decay rate of a Fourier mode, normalized by the value of the reduced model
  bound at this point: K = 1 · delta = 0.010205144336440153 (closed-form: the exact error; the composed bound above is the supremum over the bridge's domain)

  regimes at --at: all hold
  horizons at t=1: all hold
    ab-telegraph-diffusion: holds — τ ≪ t ≪ 1/(δ D q²): after the initial layer and before the decay-rate error accumulates; machine form 5τ < t < 0.1/(δ D q²)
  (a path EXISTING is not a warrant: the bound is the warrant. A no-claim carries no number, and none is synthesized for it.)

```

stderr:

```text

```

## C068

UTC: 2026-09-26T17:04:34.691248+00:00  
Exit: 0

```bash
upt confront --bridge=be-37 --sensitivity
```

stdout:

```text

Real-data confrontations — predicted vs observed
(confrontation is consistency, not confirmation; a passing confrontation does not prove the bridge. sensitivity (elasticity) ranks which input the prediction depends on most STRONGLY; it is NOT which input dominates the uncertainty budget (that needs input sigma).)

  be-37 [stringent]: GR Shapiro delay (PPN γ) vs Cassini (Bertotti 2003)
    predicted 1 · observed 1.000021 ± 0.000023 PPN γ (dimensionless) · residual 0.91σ · within 1σ ✓
    sensitivity: no ranked-input model for be-37
    source: Bertotti, Iess & Tortora 2003, Nature 425:374-376 (Cassini radio-link Shapiro delay, June 2002 solar conjunction)

```

stderr:

```text

```

## C069

UTC: 2026-09-26T17:04:35.574323+00:00  
Exit: 0

```bash
upt confront --frontier
```

stdout:

```text

Real-data confrontations — predicted vs observed
(confrontation is consistency, not confirmation; a passing confrontation does not prove the bridge.)
rigor: 7 stringent · 3 moderate · 9 loose — NOT 19 equal confirmations
frontier: σ-tests ordered by margin to exclusion (smallest = most at-risk under new data)

  be-37 [stringent]: GR Shapiro delay (PPN γ) vs Cassini (Bertotti 2003)
    predicted 1 · observed 1.000021 ± 0.000023 PPN γ (dimensionless) · residual 0.91σ · within 1σ ✓ · margin 0.09σ to exclusion
    source: Bertotti, Iess & Tortora 2003, Nature 425:374-376 (Cassini radio-link Shapiro delay, June 2002 solar conjunction)
  be-58 [stringent]: Johnson-Nyquist S_V=4k_BTR via JNT k_B (Flowers-Jacobs 2017)
    predicted 1.38064852e-23 · observed 1.3806429e-23 ± 6.9e-29 k_B (J/K); JNT via S_V=4k_BTR vs CODATA · residual 0.81σ · within 1σ ✓ · margin 0.19σ to exclusion
    source: Flowers-Jacobs, Pollarolo, Coakley, Fox, Rogalla, Tew & Benz 2017, Metrologia 54:730, "A Boltzmann constant determination based on Johnson noise thermometry"
  be-51 [stringent]: GR light deflection (PPN γ) vs VLBI (Lambert 2009)
    predicted 1.751190325559984 · derived (1+γ)/2 × predicted = 1.7511202779469617 ± 0.00010507141953359905 arcsec (solar-limb deflection) · residual 0.67σ · within 1σ ✓ · margin 0.33σ to exclusion
    measured: PPN γ = 0.99992 ± 0.00012 (VLBI); the value above is derived from it, not observed
    source: Lambert & Le Poncin-Lafitte 2009, A&A 499:331-336 (geodetic VLBI light-deflection determination of PPN gamma); compiled in Will 2014, Living Rev. Relativity 17:4
  be-52 [moderate]: GR perihelion precession vs Mercury (Clemence 1947)
    predicted 42.98056186229095 · observed 43.11 ± 0.45 arcsec/century · residual 0.29σ · within 1σ ✓ · margin 0.71σ to exclusion
    source: Clemence 1947, Rev. Mod. Phys. 19:361 (anomalous advance 43.11±0.45 ″/cy); orbital elements NASA Mercury fact sheet (J2000); Einstein 1915 SPAW 831.
  be-35 [stringent]: Conformal bootstrap 3D-Ising ν vs experiment (Pelissetto-Vicari 2002)
    predicted 0.629971 · observed 0.63 ± 0.002 ν (3D-Ising correlation-length exponent, dimensionless) · residual 0.01σ · within 1σ ✓ · margin 0.99σ to exclusion
    source: Pelissetto & Vicari 2002, Phys. Rep. 368:549 ("Critical phenomena and renormalization-group theory"); experimental average over liquid-vapor / binary-fluid critical points (3D Ising universality class). Bootstrap prediction: Kos, Poland, Simmons-Duffin & Vichi 2016, JHEP 08:036 (arXiv:1603.04436), Delta_epsilon = 1.412625(10)
  be-23 [loose]: Planckian dissipation α vs overdoped cuprates (Legros 2019)
    predicted 1 · observed 1 ± 0.4 dimensionless (α) · residual 0.00σ · within 1σ ✓ · margin 1.00σ to exclusion
    source: Legros et al. 2019 Nature Phys. 15:142 (arXiv:1805.02512), "Universal T-linear resistivity and Planckian dissipation in overdoped cuprates" — abstract-level claim that the T-linear scattering rate is the Planckian rate k_B T/ℏ to within ~×2 (encoded conservatively as α = 1.0 ± 0.4)
  be-11 [loose]: Decoherence master equation vs collisional decoherence (Hornberger 2003)
    predicted 1 approaches 1 p₀(theory)/p₀(exp) ratio; parameter-free 9-gas agreement within 15% experimental error · gap 0.0%
    source: Hornberger, Uttenthaler, Brezger, Hackermuller, Arndt & Zeilinger 2003, Phys. Rev. Lett. 90:160401 (arXiv:quant-ph/0303093), "Collisional Decoherence Observed in Matter Wave Interferometry"
  be-21 [loose]: KSS viscosity bound vs quark-gluon plasma (Bernhard-Moreland-Bass 2019)
    predicted 0.07957747154594767 approaches 0.1 η/s (ℏ/k_B units); KSS lower bound 1/(4π), observed satisfies + nearly saturates · gap 25.7%
    source: Bernhard, Moreland & Bass 2019, Nature Phys. 15:1113-1117 (Bayesian eta/s extraction from RHIC/LHC heavy-ion flow observables); KSS bound: Kovtun, Son & Starinets 2005, PRL 94:111601
  be-36 [loose]: GW speed vs GW170817 bound
    predicted 1e-15 |c_GW − c| / c (dimensionless) · bound 6.501939179989081e-16 · not excluded ✓ · one-sided: +side only (GW170817 −side -3.1e-15 exceeds the symmetric encoded ±1e-15)
    source: Abbott et al. 2017 ApJ Lett. 848:L13 (arXiv:1710.05832), §3 "Speed of Gravity"
  be-48 [loose]: GRW collapse rate vs LISA-Pathfinder bound (Carlesso 2016)
    predicted 1e-16 s⁻¹ (collapse rate) · bound 2.96e-8 · not excluded ✓
    source: Carlesso, Bassi, Falferi & Vinante 2016, arXiv:1606.03637 / Phys. Rev. D 95:084054 (2017); LISA-Pathfinder data Armano et al. 2016, PRL 116:231101
  be-55 [stringent]: Quantum Hall universality (graphene vs GaAs) — Janssen 2012
    predicted 1 approaches 1 R_H(graphene)/R_H(GaAs) ratio; topological universality to 8.6e-11 · gap 0.0%
    source: Janssen, Williams, Fletcher, Goebel, Tzalenchuk, Yakimova, Lara-Avila, Kubatkin & Fal’ko 2012, Metrologia 49:294 (arXiv:1105.4055), "Graphene, universality of the quantum Hall effect and redefinition of the SI"
  be-56 [moderate]: Casimir force vs corrected theory (Mohideen-Roy 1998)
    predicted 1 approaches 1 measured/theory force ratio; ~1% agreement (corrected theory, systematics-dominated) · gap 1.0%
    source: Mohideen & Roy 1998, Phys. Rev. Lett. 81:4549 (arXiv:physics/9805038), "Precision Measurement of the Casimir Force from 0.1 to 0.9 μm"; earlier: Lamoreaux 1997, Phys. Rev. Lett. 78:5 (~5%)
  be-59 [stringent]: Josephson-volt universality (junction-independence) — Kautz 1996 / BIPM
    predicted 1 approaches 1 V(junction A)/V(junction B) ratio; Josephson-volt universality to ~1e-9 · gap 0.0%
    source: Kautz 1996, Rep. Prog. Phys. 59:935 ("Noise, chaos, and the Josephson voltage standard"); BIPM international comparisons of Josephson voltage standards
  be-60 [stringent]: Fractional QH ν=1/3 plateau (R_xy=3·R_K) — Tsui-Störmer-Gossard 1982
    predicted 1 approaches 1 R_xy(plateau)/(3·R_K) ratio; the ⅓ fraction (topological order) to ~1e-5 · gap 0.0%
    source: Tsui, Störmer & Gossard 1982, Phys. Rev. Lett. 48:1559 (discovery of the ν=1/3 plateau); fractional charge e/3 confirmed by de-Picciotto et al. 1997, Nature 389:162
  be-61 [loose]: Wiedemann-Franz Lorenz number vs degenerate limit (Kumar 2023)
    predicted 2.443004509073667e-8 approaches 2.443004509073667e-8 Lorenz number L (W·Ω·K⁻²); degenerate-limit consistency, material spread ~10% (caveat) · gap 10.0%
    source: Kumar, Auton et al. 2023, arXiv:2308.12349 / J. Low Temp. Phys. (Wiedemann-Franz verification in silver, RRR 200-400, recovers the fundamental L₀); Kittel, Introduction to Solid State Physics (Cu L≈2.23e-8 at 0°C)
  be-62 [moderate]: BCS gap ratio 2Δ/k_BT_c=3.528 vs weak-coupling superconductors (Tinkham)
    predicted 3.527753977724091 approaches 3.5 2Δ(0)/k_BT_c; weak-coupling class ~3.5, strong-coupling to ~4.3 (caveat) · gap 5.0%
    source: Tinkham 1996, Introduction to Superconductivity 2nd ed. §3.4 (weak-coupling 2Δ/k_BT_c=3.528); Carbotte 1990, Rev. Mod. Phys. 62:1027 (Al ~3.4, Sn ~3.5, strong-coupling Pb ~4.3)
  be-63 [loose]: Chandrasekhar mass ~1.4 M_⊙ vs white-dwarf max (Shapiro-Teukolsky)
    predicted 1.4558683947324034 approaches 1.35 M_⊙; WD max ~1.35 vs M_Ch~1.44 (upper-bound; super-Chandrasekhar SNe caveat) · gap 12.0%
    source: Shapiro & Teukolsky 1983, Black Holes, White Dwarfs and Neutron Stars §3 (M_Ch=1.44 M_⊙); observed WD max ~1.35 M_⊙; super-Chandrasekhar: Howell et al. 2006, Nature 443:308 (SN 2006gz)
  be-64 [loose]: Eddington luminosity vs peak accretion ratio (Rybicki-Lightman)
    predicted 1 approaches 1 peak L/L_Edd (order unity; super-Eddington ULX caveat) · gap 50.0%
    source: Rybicki & Lightman 1979, Radiative Processes in Astrophysics §1 (L_Edd); super-Eddington ULX pulsar: Bachetti et al. 2014, Nature 514:202
  be-65 [loose]: Jeans mass vs molecular-cloud fragmentation scale (Binney-Tremaine)
    predicted 1.7759676829994302 approaches 1 M_⊙; order-of-magnitude collapse scale (convention-dependent prefactor caveat) · gap 150.0%
    source: Binney & Tremaine 2008, Galactic Dynamics 2nd ed. §5 (Jeans mass, convention-dependent prefactor); protostellar-core mass function ~ 1 M_⊙ (e.g. molecular-cloud surveys)

```

stderr:

```text

```

## C070

UTC: 2026-09-26T17:04:50.881909+00:00  
Exit: 0

```bash
upt atlas ab-damped-rlc
```

stdout:

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

stderr:

```text

```

## C071

UTC: 2026-09-26T17:04:51.763741+00:00  
Exit: 0

```bash
upt atlas ab-damped-massless
```

stdout:

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

stderr:

```text

```

## C072

UTC: 2026-09-26T17:04:52.664575+00:00  
Exit: 0

```bash
upt atlas ab-chain-wave
```

stdout:

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

stderr:

```text

```

## C073

UTC: 2026-09-26T17:04:53.555944+00:00  
Exit: 0

```bash
upt atlas ab-walk-diffusion
```

stdout:

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

stderr:

```text

```

## C074

UTC: 2026-09-26T17:04:54.465514+00:00  
Exit: 0

```bash
upt atlas ab-heat-diffusion
```

stdout:

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

stderr:

```text

```

## C075

UTC: 2026-09-26T17:04:55.344601+00:00  
Exit: 0

```bash
upt atlas ab-langevin-diffusion
```

stdout:

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

stderr:

```text

```

## C076

UTC: 2026-09-26T17:04:56.235092+00:00  
Exit: 0

```bash
upt atlas ab-telegraph-wave
```

stdout:

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

stderr:

```text

```

## C077

UTC: 2026-09-26T17:04:57.118753+00:00  
Exit: 0

```bash
upt atlas ab-heat-laplace
```

stdout:

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

stderr:

```text

```

## C078

UTC: 2026-09-26T17:04:58.020462+00:00  
Exit: 0

```bash
upt atlas ab-string-wave
```

stdout:

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

stderr:

```text

```

## C079

UTC: 2026-09-26T17:04:58.998103+00:00  
Exit: 0

```bash
upt atlas ab-wave-dalembert
```

stdout:

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

stderr:

```text

```

## C080

UTC: 2026-09-26T17:04:59.926075+00:00  
Exit: 0

```bash
upt atlas ab-sound-speed
```

stdout:

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

stderr:

```text

```

## C081

UTC: 2026-09-26T17:05:00.836802+00:00  
Exit: 0

```bash
upt atlas ab-klein-gordon-wave
```

stdout:

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

stderr:

```text

```

## C082

UTC: 2026-09-26T17:05:01.697810+00:00  
Exit: 0

```bash
upt atlas ab-kg-oscillator
```

stdout:

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

stderr:

```text

```

## C083

UTC: 2026-09-26T17:05:02.592343+00:00  
Exit: 0

```bash
upt atlas ab-stiff-string
```

stdout:

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

stderr:

```text

```

## C084

UTC: 2026-09-26T17:05:11.441190+00:00  
Exit: 0

```bash
upt help ground
```

stdout:

```text
upt ground <quantityA> <quantityB>
        The epistemic-grounding ledger for one discovery candidate a≡b: which
        falsifiers PASSED, which ABSTAINED (gaps), and the honest ceiling — no
        mechanism test, no data test (permanent for a dimensional candidate;
        real mechanism/data live in `upt confront`).

```

stderr:

```text

```

## C085

UTC: 2026-09-26T17:05:12.439889+00:00  
Exit: 1

```bash
upt ground barrier-width compton-wavelength
```

stdout:

```text

```

stderr:

```text
upt ground: no discovery candidate pairs 'barrier-width' with 'compton-wavelength' — they may not share a dimension, or are already connected (not a cross-cluster coincidence).

```

## C086

UTC: 2026-09-26T17:05:13.355136+00:00  
Exit: 0

```bash
upt regime waves --at c=1 omega0=1 k=0.05
```

stdout:

```text

Regimes of family 'waves'
at c=1 · omega0=1 · k=0.05

  [model] model-string: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-dalembert: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-euler-linear: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-adiabatic-eos: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-sound: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-klein-gordon: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-stiff-string: valid (VACUOUS — states no inequality; nothing was checked)
  [bridge] ab-string-wave: valid (VACUOUS — states no inequality; nothing was checked)
  [bridge] ab-wave-dalembert: valid (VACUOUS — states no inequality; nothing was checked)
  [bridge] ab-sound-speed: unknown
    unchecked (no value supplied): p0 · p1^-1 >= 100 (|p′| ≪ p₀ (machine form p₀/p₁ ≥ 100))
  [bridge] ab-klein-gordon-wave: VIOLATED
    violated: c · omega0^-1 · k >= 10 (ω₀/(c k) ≤ 0.1)
  [bridge] ab-kg-schrodinger: valid
    every inequality checked and satisfied
  [bridge] ab-kg-oscillator: valid (VACUOUS — states no inequality; nothing was checked)
  [bridge] ab-stiff-string: unknown
    unchecked (no value supplied): F · EI^-1 · k^-2 >= 100 (β = EIk²/F ≤ 0.01)

Pairwise overlap (on shared coordinates only):
  ab-klein-gordon-wave vs ab-kg-schrodinger: disjoint — shared: c · omega0^-1 · k

Uncovered regions: none — some constraining regime holds at every point of the stated box.

```

stderr:

```text

```

## C087

UTC: 2026-09-26T17:05:14.222743+00:00  
Exit: 0

```bash
upt regime waves --at c=1 omega0=1 k=1
```

stdout:

```text

Regimes of family 'waves'
at c=1 · omega0=1 · k=1

  [model] model-string: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-dalembert: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-euler-linear: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-adiabatic-eos: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-sound: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-klein-gordon: valid (VACUOUS — states no inequality; nothing was checked)
  [model] model-stiff-string: valid (VACUOUS — states no inequality; nothing was checked)
  [bridge] ab-string-wave: valid (VACUOUS — states no inequality; nothing was checked)
  [bridge] ab-wave-dalembert: valid (VACUOUS — states no inequality; nothing was checked)
  [bridge] ab-sound-speed: unknown
    unchecked (no value supplied): p0 · p1^-1 >= 100 (|p′| ≪ p₀ (machine form p₀/p₁ ≥ 100))
  [bridge] ab-klein-gordon-wave: VIOLATED
    violated: c · omega0^-1 · k >= 10 (ω₀/(c k) ≤ 0.1)
  [bridge] ab-kg-schrodinger: VIOLATED
    violated: c · omega0^-1 · k <= 0.1 (ck/ω₀ ≤ 0.1)
  [bridge] ab-kg-oscillator: valid (VACUOUS — states no inequality; nothing was checked)
  [bridge] ab-stiff-string: unknown
    unchecked (no value supplied): F · EI^-1 · k^-2 >= 100 (β = EIk²/F ≤ 0.01)

Pairwise overlap (on shared coordinates only):
  ab-klein-gordon-wave vs ab-kg-schrodinger: disjoint — shared: c · omega0^-1 · k

Uncovered regions: 1 point(s) of the stated box that no CONSTRAINING regime covers (4 of 14 records state an inequality):
  c=1 · omega0=1 · k=1 · c · omega0^-1 · k=1
  (an 'unknown' is not coverage — see the tri-state rule above)

```

stderr:

```text

```

## C088

UTC: 2026-09-26T17:05:15.169917+00:00  
Exit: 1

```bash
upt evaluate be-58 T_K=-1 R_ohm=1000
```

stdout:

```text

```

stderr:

```text
evaluateJohnsonNyquist: T_K and R_ohm must be ≥ 0

```

## C089

UTC: 2026-09-26T17:05:16.015432+00:00  
Exit: 1

```bash
upt evaluate be-56 d_m=0
```

stdout:

```text

```

stderr:

```text
evaluateCasimir: d_m (plate separation) must be > 0

```

## C090

UTC: 2026-09-26T17:05:17.370371+00:00  
Exit: 0

```bash
upt eval 'k*T/(6*pi*eta*a)' k=1.380649e-23 T=293.15 eta=0.001 a=0.0000005
```

stdout:

```text
4.294395645549615e-13

```

stderr:

```text

```

## C091

UTC: 2026-09-26T17:05:18.772716+00:00  
Exit: 0

```bash
upt eval '1/sqrt(L*C)' L=2 C=0.125
```

stdout:

```text
2

```

stderr:

```text

```

## C092

UTC: 2026-09-26T17:05:20.127641+00:00  
Exit: 0

```bash
upt eval 'sqrt(k/m)' k=8 m=2
```

stdout:

```text
2

```

stderr:

```text

```

## C093

UTC: 2026-09-26T17:05:21.539823+00:00  
Exit: 0

```bash
upt eval 'sqrt(1+x^2)-1' x=0.05
```

stdout:

```text
0.00124921972503933

```

stderr:

```text

```

## C094

UTC: 2026-09-26T17:05:22.957077+00:00  
Exit: 0

```bash
upt eval 'x^2/2' x=0.05
```

stdout:

```text
0.0012500000000000002

```

stderr:

```text

```

## C095

UTC: 2026-09-26T17:05:24.344201+00:00  
Exit: 0

```bash
upt eval '1-2/(sqrt(1+x^2)+1)' x=1
```

stdout:

```text
0.17157287525380982

```

stderr:

```text

```

## C096

UTC: 2026-09-26T17:05:25.755081+00:00  
Exit: 0

```bash
upt eval '4*k*T*R' k=1.380649e-23 T=300 R=1000
```

stdout:

```text
1.6567788e-17

```

stderr:

```text

```

## C097

UTC: 2026-09-26T17:05:27.125317+00:00  
Exit: 0

```bash
upt eval 'h/(e^2)' h=6.62607015e-34 e=1.602176634e-19
```

stdout:

```text
25812.807459304513

```

stderr:

```text

```

## C098

UTC: 2026-09-26T17:05:28.503081+00:00  
Exit: 0

```bash
upt eval '2*e*V/h' e=1.602176634e-19 V=0.001 h=6.62607015e-34
```

stdout:

```text
483597848416.9836

```

stderr:

```text

```

## C099

UTC: 2026-09-26T17:05:29.244623+00:00  
Exit: 0

```bash
upt canonical --json
```

stdout:

```text
{
  "command": "canonical",
  "result": {
    "entries": [
      {
        "epistemicStatus": "dimensional",
        "freeDimensionlessGroups": 0,
        "id": "CE-pendulum-period",
        "name": "Pendulum period",
        "domain": "mechanics",
        "formula_latex": "T = 2\\pi\\sqrt{L/g}",
        "dimensional": {
          "target": {
            "name": "period",
            "dim": {
              "L": 0,
              "M": 0,
              "T": 1,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "length",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "gravity",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "length": 0.5,
            "gravity": -0.5
          }
        },
        "regime": {
          "scale": "classical",
          "force": "gravitational"
        },
        "assumptions": [
          "small-angle",
          "point mass",
          "rigid massless rod"
        ],
        "references": [
          "Taylor, Classical Mechanics §1"
        ],
        "partnerBridges": []
      },
      {
        "epistemicStatus": "dimensional",
        "freeDimensionlessGroups": 0,
        "id": "CE-kepler-third",
        "name": "Kepler's third law",
        "domain": "gravitation",
        "formula_latex": "T^2 = 4\\pi^2 a^3/(GM)",
        "dimensional": {
          "target": {
            "name": "period",
            "dim": {
              "L": 0,
              "M": 0,
              "T": 1,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "semi-major-axis",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "G",
              "dim": {
                "L": 3,
                "M": -1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "semi-major-axis": 1.5,
            "G": -0.5,
            "mass": -0.5
          }
        },
        "regime": {
          "scale": "classical",
          "force": "gravitational"
        },
        "assumptions": [
          "two-body",
          "M ≫ m"
        ],
        "references": [
          "Kepler 1619; any celestial-mechanics text"
        ],
        "partnerBridges": []
      },
      {
        "epistemicStatus": "dimensional",
        "freeDimensionlessGroups": 0,
        "id": "CE-schwarzschild-radius",
        "name": "Schwarzschild radius",
        "domain": "general-relativity",
        "formula_latex": "r_s = 2GM/c^2",
        "dimensional": {
          "target": {
            "name": "radius",
            "dim": {
              "L": 1,
              "M": 0,
              "T": 0,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "G",
              "dim": {
                "L": 3,
                "M": -1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "c",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "mass": 1,
            "G": 1,
            "c": -2
          }
        },
        "regime": {
          "force": "gravitational"
        },
        "assumptions": [
          "static",
          "spherically symmetric",
          "vacuum"
        ],
        "references": [
          "Schwarzschild 1916"
        ],
        "partnerBridges": []
      },
      {
        "epistemicStatus": "dimensional",
        "freeDimensionlessGroups": 0,
        "id": "CE-string-wave-speed",
        "name": "Wave speed on a string",
        "domain": "mechanics",
        "formula_latex": "v = \\sqrt{F/\\mu}",
        "dimensional": {
          "target": {
            "name": "speed",
            "dim": {
              "L": 1,
              "M": 0,
              "T": -1,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "tension",
              "dim": {
                "L": 1,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "linear-density",
              "dim": {
                "L": -1,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "tension": 0.5,
            "linear-density": -0.5
          }
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "ideal flexible string",
          "small amplitude"
        ],
        "references": [
          "Any waves/mechanics text"
        ],
        "partnerBridges": []
      },
      {
        "epistemicStatus": "dimensional",
        "freeDimensionlessGroups": 0,
        "id": "CE-planck-length",
        "name": "Planck length",
        "domain": "quantum",
        "formula_latex": "\\ell_P = \\sqrt{\\hbar G/c^3}",
        "dimensional": {
          "target": {
            "name": "planck-length",
            "dim": {
              "L": 1,
              "M": 0,
              "T": 0,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "hbar",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "G",
              "dim": {
                "L": 3,
                "M": -1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "c",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "hbar": 0.5,
            "G": 0.5,
            "c": -1.5
          }
        },
        "regime": {
          "scale": "quantum",
          "force": "gravitational"
        },
        "assumptions": [],
        "references": [
          "Planck 1899"
        ],
        "partnerBridges": []
      },
      {
        "epistemicStatus": "dimensional",
        "freeDimensionlessGroups": 0,
        "id": "CE-planck-mass",
        "name": "Planck mass",
        "domain": "quantum",
        "formula_latex": "m_P = \\sqrt{\\hbar c/G}",
        "dimensional": {
          "target": {
            "name": "planck-mass",
            "dim": {
              "L": 0,
              "M": 1,
              "T": 0,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "hbar",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "c",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "G",
              "dim": {
                "L": 3,
                "M": -1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "hbar": 0.5,
            "c": 0.5,
            "G": -0.5
          }
        },
        "regime": {
          "scale": "quantum",
          "force": "gravitational"
        },
        "assumptions": [],
        "references": [
          "Planck 1899"
        ],
        "partnerBridges": [
          "41"
        ]
      },
      {
        "epistemicStatus": "dimensional",
        "freeDimensionlessGroups": 0,
        "id": "CE-planck-time",
        "name": "Planck time",
        "domain": "quantum",
        "formula_latex": "t_P = \\sqrt{\\hbar G/c^5}",
        "dimensional": {
          "target": {
            "name": "planck-time",
            "dim": {
              "L": 0,
              "M": 0,
              "T": 1,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "hbar",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "G",
              "dim": {
                "L": 3,
                "M": -1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "c",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "hbar": 0.5,
            "G": 0.5,
            "c": -2.5
          }
        },
        "regime": {
          "scale": "quantum",
          "force": "gravitational"
        },
        "assumptions": [],
        "references": [
          "Planck 1899"
        ],
        "partnerBridges": []
      },
      {
        "epistemicStatus": "dimensional",
        "freeDimensionlessGroups": 0,
        "id": "CE-compton-wavelength",
        "name": "Compton wavelength",
        "domain": "quantum",
        "formula_latex": "\\lambda_C = \\hbar/(mc)",
        "dimensional": {
          "target": {
            "name": "compton-wavelength",
            "dim": {
              "L": 1,
              "M": 0,
              "T": 0,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "hbar",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "c",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "hbar": 1,
            "mass": -1,
            "c": -1
          }
        },
        "regime": {
          "scale": "quantum"
        },
        "assumptions": [],
        "references": [
          "Compton 1923"
        ],
        "partnerBridges": []
      },
      {
        "epistemicStatus": "dimensional",
        "freeDimensionlessGroups": 0,
        "id": "CE-thermal-de-broglie",
        "name": "Thermal de Broglie wavelength",
        "domain": "statistical",
        "formula_latex": "\\lambda \\propto \\hbar/\\sqrt{m k_B T}",
        "dimensional": {
          "target": {
            "name": "thermal-wavelength",
            "dim": {
              "L": 1,
              "M": 0,
              "T": 0,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "hbar",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "boltzmann",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": -1,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "temperature",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 1,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "hbar": 1,
            "mass": -0.5,
            "boltzmann": -0.5,
            "temperature": -0.5
          }
        },
        "regime": {
          "scale": "quantum"
        },
        "assumptions": [
          "non-relativistic",
          "ideal gas"
        ],
        "references": [
          "Any statistical-mechanics text"
        ],
        "partnerBridges": [
          "12"
        ]
      },
      {
        "id": "CE-einstein-field-eq",
        "name": "Einstein field equation",
        "domain": "general-relativity",
        "formula_latex": "G_{\\mu\\nu} + \\Lambda g_{\\mu\\nu} = (8\\pi G/c^4) T_{\\mu\\nu}",
        "epistemicStatus": "fully-quantitative",
        "fieldEquation": {
          "kind": "einstein-equation",
          "lhs": {
            "kind": "einstein-tensor",
            "riemann": {
              "kind": "riemann-tensor",
              "upperIndex": {
                "label": "rho",
                "variance": "upper"
              },
              "lowerIndices": [
                {
                  "label": "mu",
                  "variance": "lower"
                },
                {
                  "label": "lambda",
                  "variance": "lower"
                },
                {
                  "label": "nu",
                  "variance": "lower"
                }
              ],
              "gLower": {
                "kind": "metric-tensor",
                "name": "g",
                "indices": [
                  {
                    "label": "a",
                    "variance": "lower"
                  },
                  {
                    "label": "b",
                    "variance": "lower"
                  }
                ],
                "signature": "+,-,-,-",
                "dim": {
                  "L": 0,
                  "M": 0,
                  "T": 0,
                  "I": 0,
                  "Theta": 0,
                  "N": 0,
                  "J": 0
                }
              },
              "gInverse": {
                "kind": "metric-tensor",
                "name": "g_inv",
                "indices": [
                  {
                    "label": "a",
                    "variance": "upper"
                  },
                  {
                    "label": "b",
                    "variance": "upper"
                  }
                ],
                "signature": "+,-,-,-",
                "dim": {
                  "L": 0,
                  "M": 0,
                  "T": 0,
                  "I": 0,
                  "Theta": 0,
                  "N": 0,
                  "J": 0
                }
              },
              "xCoord": {
                "kind": "tensor-symbol",
                "name": "x",
                "indices": [
                  {
                    "label": "c",
                    "variance": "upper"
                  }
                ],
                "dim": {
                  "L": 1,
                  "M": 0,
                  "T": 0,
                  "I": 0,
                  "Theta": 0,
                  "N": 0,
                  "J": 0
                },
                "role": "coordinate"
              }
            },
            "gLower": {
              "kind": "metric-tensor",
              "name": "g",
              "indices": [
                {
                  "label": "a",
                  "variance": "lower"
                },
                {
                  "label": "b",
                  "variance": "lower"
                }
              ],
              "signature": "+,-,-,-",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            "gInverse": {
              "kind": "metric-tensor",
              "name": "g_inv",
              "indices": [
                {
                  "label": "a",
                  "variance": "upper"
                },
                {
                  "label": "b",
                  "variance": "upper"
                }
              ],
              "signature": "+,-,-,-",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          },
          "cosmological": {
            "kind": "cosmological-constant",
            "symbol": "Λ",
            "dim": {
              "L": -2,
              "M": 0,
              "T": 0,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "metric": {
            "kind": "metric-tensor",
            "name": "g_metric",
            "indices": [
              {
                "label": "mu",
                "variance": "lower"
              },
              {
                "label": "nu",
                "variance": "lower"
              }
            ],
            "signature": "+,-,-,-",
            "dim": {
              "L": 0,
              "M": 0,
              "T": 0,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "rhs": {
            "kind": "stress-energy",
            "symbol": "T",
            "indices": [
              {
                "label": "mu",
                "variance": "lower"
              },
              {
                "label": "nu",
                "variance": "lower"
              }
            ],
            "symmetry": "symmetric",
            "componentDim": {
              "L": -1,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "coupling": "einstein"
        },
        "regime": {
          "force": "gravitational",
          "symmetry": "poincare"
        },
        "assumptions": [
          "classical GR",
          "pseudo-Riemannian spacetime"
        ],
        "references": [
          "Einstein 1915"
        ],
        "partnerBridges": [
          "13"
        ],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "efe-curvature",
            "dim": {
              "L": -2,
              "M": 0,
              "T": 0,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "G",
              "dim": {
                "L": 3,
                "M": -1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "c",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "stress-energy-density",
              "dim": {
                "L": -1,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "G": 1,
            "c": -4,
            "stress-energy-density": 1
          }
        }
      },
      {
        "id": "CE-friedmann",
        "name": "Friedmann equation (flat, matter-dominated)",
        "domain": "cosmology",
        "formula_latex": "H^2 = 8\\pi G \\rho/3",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "8pi",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "G",
                  "dim": {
                    "L": 3,
                    "M": -1,
                    "T": -2,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "rho",
                  "dim": {
                    "L": -3,
                    "M": 1,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            },
            {
              "kind": "symbol",
              "name": "3",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "cosmological",
          "force": "gravitational"
        },
        "assumptions": [
          "flat (k=0)",
          "matter-dominated",
          "Λ=0",
          "FLRW"
        ],
        "references": [
          "Friedmann 1922"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "hubble-rate-squared",
            "dim": {
              "L": 0,
              "M": 0,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "G",
              "dim": {
                "L": 3,
                "M": -1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "rho",
              "dim": {
                "L": -3,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "G": 1,
            "rho": 1
          }
        }
      },
      {
        "id": "CE-hawking-temperature",
        "name": "Hawking temperature",
        "domain": "general-relativity",
        "formula_latex": "T_H = \\hbar c^3/(8\\pi G M k_B)",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "hbar",
                  "dim": {
                    "L": 2,
                    "M": 1,
                    "T": -1,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "op",
                  "op": "^",
                  "args": [
                    {
                      "kind": "symbol",
                      "name": "c",
                      "dim": {
                        "L": 1,
                        "M": 0,
                        "T": -1,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    },
                    {
                      "kind": "symbol",
                      "name": "3",
                      "dim": {
                        "L": 0,
                        "M": 0,
                        "T": 0,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    }
                  ]
                }
              ]
            },
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "8pi",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "G",
                  "dim": {
                    "L": 3,
                    "M": -1,
                    "T": -2,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "M",
                  "dim": {
                    "L": 0,
                    "M": 1,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "k_B",
                  "dim": {
                    "L": 2,
                    "M": 1,
                    "T": -2,
                    "I": 0,
                    "Theta": -1,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            }
          ]
        },
        "regime": {
          "force": "gravitational"
        },
        "assumptions": [
          "Schwarzschild",
          "semiclassical"
        ],
        "references": [
          "Hawking 1975"
        ],
        "partnerBridges": [
          "42"
        ],
        "restatesBridge": "42",
        "freeDimensionlessGroups": 1,
        "dimensional": {
          "target": {
            "name": "hawking-temperature",
            "dim": {
              "L": 0,
              "M": 0,
              "T": 0,
              "I": 0,
              "Theta": 1,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "hbar",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "c",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "G",
              "dim": {
                "L": 3,
                "M": -1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "k_B",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": -1,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": null
        }
      },
      {
        "id": "CE-light-deflection",
        "name": "Light deflection (Eddington weak-field)",
        "domain": "general-relativity",
        "formula_latex": "\\alpha = 4 G M/(c^2 b)",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "4",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "G",
                  "dim": {
                    "L": 3,
                    "M": -1,
                    "T": -2,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "M",
                  "dim": {
                    "L": 0,
                    "M": 1,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            },
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "op",
                  "op": "^",
                  "args": [
                    {
                      "kind": "symbol",
                      "name": "c",
                      "dim": {
                        "L": 1,
                        "M": 0,
                        "T": -1,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    },
                    {
                      "kind": "symbol",
                      "name": "2",
                      "dim": {
                        "L": 0,
                        "M": 0,
                        "T": 0,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    }
                  ]
                },
                {
                  "kind": "symbol",
                  "name": "impact_parameter",
                  "dim": {
                    "L": 1,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            }
          ]
        },
        "regime": {
          "force": "gravitational"
        },
        "assumptions": [
          "weak field",
          "grazing ray"
        ],
        "references": [
          "Einstein 1915; Eddington 1919"
        ],
        "partnerBridges": [
          "51"
        ],
        "restatesBridge": "51",
        "freeDimensionlessGroups": 1,
        "dimensional": {
          "target": {
            "name": "light-deflection",
            "dim": {
              "L": 0,
              "M": 0,
              "T": 0,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "G",
              "dim": {
                "L": 3,
                "M": -1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "c",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "impact_parameter",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": null
        }
      },
      {
        "id": "CE-perihelion-precession",
        "name": "Perihelion precession (Einstein)",
        "domain": "general-relativity",
        "formula_latex": "\\Delta\\phi = 6\\pi G M/(c^2 a (1-e^2))",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "6pi",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "G",
                  "dim": {
                    "L": 3,
                    "M": -1,
                    "T": -2,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "M",
                  "dim": {
                    "L": 0,
                    "M": 1,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            },
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "op",
                  "op": "^",
                  "args": [
                    {
                      "kind": "symbol",
                      "name": "c",
                      "dim": {
                        "L": 1,
                        "M": 0,
                        "T": -1,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    },
                    {
                      "kind": "symbol",
                      "name": "2",
                      "dim": {
                        "L": 0,
                        "M": 0,
                        "T": 0,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    }
                  ]
                },
                {
                  "kind": "symbol",
                  "name": "a",
                  "dim": {
                    "L": 1,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "one_minus_e_sq",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            }
          ]
        },
        "regime": {
          "force": "gravitational"
        },
        "assumptions": [
          "weak field",
          "nearly-circular orbit"
        ],
        "references": [
          "Einstein 1915"
        ],
        "partnerBridges": [
          "52"
        ],
        "restatesBridge": "52",
        "freeDimensionlessGroups": 1,
        "dimensional": {
          "target": {
            "name": "perihelion-precession",
            "dim": {
              "L": 0,
              "M": 0,
              "T": 0,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "G",
              "dim": {
                "L": 3,
                "M": -1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "c",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "a",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": null
        }
      },
      {
        "id": "CE-bekenstein-hawking",
        "name": "Bekenstein–Hawking entropy",
        "domain": "general-relativity",
        "formula_latex": "S = k_B c^3 A/(4 G \\hbar)",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "k_B",
                  "dim": {
                    "L": 2,
                    "M": 1,
                    "T": -2,
                    "I": 0,
                    "Theta": -1,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "op",
                  "op": "^",
                  "args": [
                    {
                      "kind": "symbol",
                      "name": "c",
                      "dim": {
                        "L": 1,
                        "M": 0,
                        "T": -1,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    },
                    {
                      "kind": "symbol",
                      "name": "3",
                      "dim": {
                        "L": 0,
                        "M": 0,
                        "T": 0,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    }
                  ]
                },
                {
                  "kind": "symbol",
                  "name": "A",
                  "dim": {
                    "L": 2,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            },
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "4",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "G",
                  "dim": {
                    "L": 3,
                    "M": -1,
                    "T": -2,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "hbar",
                  "dim": {
                    "L": 2,
                    "M": 1,
                    "T": -1,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            }
          ]
        },
        "forms": {
          "areaOrRadius": "area"
        },
        "regime": {
          "force": "gravitational",
          "information": "vonNeumann"
        },
        "assumptions": [
          "stationary horizon",
          "semiclassical"
        ],
        "references": [
          "Bekenstein 1973; Hawking 1975"
        ],
        "partnerBridges": [
          "42"
        ],
        "freeDimensionlessGroups": 1,
        "dimensional": {
          "target": {
            "name": "bh-entropy",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": -1,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "k_B",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": -1,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "c",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "A",
              "dim": {
                "L": 2,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "G",
              "dim": {
                "L": 3,
                "M": -1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "hbar",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": null
        }
      },
      {
        "id": "CE-newton-gravitation",
        "name": "Newton's law of gravitation",
        "domain": "gravitation",
        "formula_latex": "F = G m_1 m_2/r^2",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "G",
                  "dim": {
                    "L": 3,
                    "M": -1,
                    "T": -2,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "m_1",
                  "dim": {
                    "L": 0,
                    "M": 1,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "m_2",
                  "dim": {
                    "L": 0,
                    "M": 1,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            },
            {
              "kind": "op",
              "op": "^",
              "args": [
                {
                  "kind": "symbol",
                  "name": "r",
                  "dim": {
                    "L": 1,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "2",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            }
          ]
        },
        "regime": {
          "scale": "classical",
          "force": "gravitational"
        },
        "assumptions": [
          "point masses",
          "non-relativistic"
        ],
        "references": [
          "Newton 1687"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 1,
        "dimensional": {
          "target": {
            "name": "gravitational-force",
            "dim": {
              "L": 1,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "G",
              "dim": {
                "L": 3,
                "M": -1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "secondary-mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "r",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": null
        }
      },
      {
        "id": "CE-newton-second-law",
        "name": "Newton's second law",
        "domain": "mechanics",
        "formula_latex": "F = m a",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "acceleration",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "inertial frame",
          "constant mass"
        ],
        "references": [
          "Newton, Principia 1687"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "force",
            "dim": {
              "L": 1,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "acceleration",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "mass": 1,
            "acceleration": 1
          }
        }
      },
      {
        "id": "CE-mass-energy",
        "name": "Mass–energy equivalence",
        "domain": "mechanics",
        "formula_latex": "E = m c^2",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "op",
              "op": "^",
              "args": [
                {
                  "kind": "symbol",
                  "name": "c",
                  "dim": {
                    "L": 1,
                    "M": 0,
                    "T": -1,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "2",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "rest energy of a massive body"
        ],
        "references": [
          "Einstein 1905, Ann. Phys. 18:639"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "rest-energy",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "c",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "mass": 1,
            "c": 2
          }
        }
      },
      {
        "id": "CE-momentum",
        "name": "Momentum (non-relativistic)",
        "domain": "mechanics",
        "formula_latex": "p = m v",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "velocity",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "non-relativistic (v ≪ c)"
        ],
        "references": [
          "Newton, Principia 1687"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "p",
            "dim": {
              "L": 1,
              "M": 1,
              "T": -1,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "velocity",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "mass": 1,
            "velocity": 1
          }
        }
      },
      {
        "id": "CE-kinetic-energy",
        "name": "Kinetic energy",
        "domain": "mechanics",
        "formula_latex": "K = \\tfrac{1}{2} m v^2",
        "epistemicStatus": "scalar-up-to-constant",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "op",
              "op": "^",
              "args": [
                {
                  "kind": "symbol",
                  "name": "speed",
                  "dim": {
                    "L": 1,
                    "M": 0,
                    "T": -1,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "2",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "non-relativistic"
        ],
        "references": [
          "Taylor, Classical Mechanics §1"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "kinetic-energy",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "speed",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "mass": 1,
            "speed": 2
          }
        }
      },
      {
        "id": "CE-rotational-kinetic-energy",
        "name": "Rotational kinetic energy",
        "domain": "mechanics",
        "formula_latex": "K = \\tfrac{1}{2} I \\omega^2",
        "epistemicStatus": "scalar-up-to-constant",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "moment-of-inertia",
              "dim": {
                "L": 2,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "op",
              "op": "^",
              "args": [
                {
                  "kind": "symbol",
                  "name": "angular-velocity",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": -1,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "2",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "rigid body"
        ],
        "references": [
          "Taylor, Classical Mechanics §10"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "rotational-kinetic-energy",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "moment-of-inertia",
              "dim": {
                "L": 2,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "angular-velocity",
              "dim": {
                "L": 0,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "moment-of-inertia": 1,
            "angular-velocity": 2
          }
        }
      },
      {
        "id": "CE-gravitational-potential-energy",
        "name": "Gravitational potential energy",
        "domain": "mechanics",
        "formula_latex": "U = -G m_1 m_2 / r",
        "epistemicStatus": "scalar-up-to-constant",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "G",
                  "dim": {
                    "L": 3,
                    "M": -1,
                    "T": -2,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "mass",
                  "dim": {
                    "L": 0,
                    "M": 1,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "secondary-mass",
                  "dim": {
                    "L": 0,
                    "M": 1,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            },
            {
              "kind": "symbol",
              "name": "r",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical",
          "force": "gravitational"
        },
        "assumptions": [
          "two point masses",
          "zero reference at infinity"
        ],
        "references": [
          "Newton, Principia 1687"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 1,
        "dimensional": {
          "target": {
            "name": "gravitational-potential-energy",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "G",
              "dim": {
                "L": 3,
                "M": -1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "secondary-mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "r",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": null
        }
      },
      {
        "id": "CE-work",
        "name": "Work (constant force)",
        "domain": "mechanics",
        "formula_latex": "W = F d",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "force",
              "dim": {
                "L": 1,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "distance",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "constant force along displacement"
        ],
        "references": [
          "Taylor, Classical Mechanics §4"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "work",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "force",
              "dim": {
                "L": 1,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "distance",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "force": 1,
            "distance": 1
          }
        }
      },
      {
        "id": "CE-spring-potential-energy",
        "name": "Elastic potential energy",
        "domain": "mechanics",
        "formula_latex": "U = \\tfrac{1}{2} k x^2",
        "epistemicStatus": "scalar-up-to-constant",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "spring-constant",
              "dim": {
                "L": 0,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "op",
              "op": "^",
              "args": [
                {
                  "kind": "symbol",
                  "name": "displacement",
                  "dim": {
                    "L": 1,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "2",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            }
          ]
        },
        "regime": {
          "scale": "classical",
          "force": "emergent"
        },
        "assumptions": [
          "Hookean (linear) spring"
        ],
        "references": [
          "Taylor, Classical Mechanics §5"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "spring-potential-energy",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "spring-constant",
              "dim": {
                "L": 0,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "displacement",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "spring-constant": 1,
            "displacement": 2
          }
        }
      },
      {
        "id": "CE-power",
        "name": "Mechanical power",
        "domain": "mechanics",
        "formula_latex": "P = F v",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "force",
              "dim": {
                "L": 1,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "velocity",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "force along velocity"
        ],
        "references": [
          "Taylor, Classical Mechanics §4"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "power",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -3,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "force",
              "dim": {
                "L": 1,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "velocity",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "force": 1,
            "velocity": 1
          }
        }
      },
      {
        "id": "CE-centripetal-force",
        "name": "Centripetal force",
        "domain": "mechanics",
        "formula_latex": "F = m v^2 / r",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "mass",
                  "dim": {
                    "L": 0,
                    "M": 1,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "op",
                  "op": "^",
                  "args": [
                    {
                      "kind": "symbol",
                      "name": "speed",
                      "dim": {
                        "L": 1,
                        "M": 0,
                        "T": -1,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    },
                    {
                      "kind": "symbol",
                      "name": "2",
                      "dim": {
                        "L": 0,
                        "M": 0,
                        "T": 0,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    }
                  ]
                }
              ]
            },
            {
              "kind": "symbol",
              "name": "radius",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "uniform circular motion"
        ],
        "references": [
          "Taylor, Classical Mechanics §1"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "force",
            "dim": {
              "L": 1,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "speed",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "radius",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "mass": 1,
            "speed": 2,
            "radius": -1
          }
        }
      },
      {
        "id": "CE-hooke-law",
        "name": "Hooke's law",
        "domain": "mechanics",
        "formula_latex": "F = -k x",
        "epistemicStatus": "scalar-up-to-constant",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "spring-constant",
              "dim": {
                "L": 0,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "displacement",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical",
          "force": "emergent"
        },
        "assumptions": [
          "linear elastic regime"
        ],
        "references": [
          "Hooke 1678"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "force",
            "dim": {
              "L": 1,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "spring-constant",
              "dim": {
                "L": 0,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "displacement",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "spring-constant": 1,
            "displacement": 1
          }
        }
      },
      {
        "id": "CE-torque",
        "name": "Torque (perpendicular force)",
        "domain": "mechanics",
        "formula_latex": "\\tau = r F",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "radius",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "force",
              "dim": {
                "L": 1,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "force perpendicular to lever arm"
        ],
        "references": [
          "Taylor, Classical Mechanics §10"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "torque",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "radius",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "force",
              "dim": {
                "L": 1,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "radius": 1,
            "force": 1
          }
        }
      },
      {
        "id": "CE-angular-momentum",
        "name": "Angular momentum (point particle)",
        "domain": "mechanics",
        "formula_latex": "L = r p",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "radius",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "p",
              "dim": {
                "L": 1,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "momentum perpendicular to radius"
        ],
        "references": [
          "Taylor, Classical Mechanics §3"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "angular-momentum",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -1,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "radius",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "p",
              "dim": {
                "L": 1,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "radius": 1,
            "p": 1
          }
        }
      },
      {
        "id": "CE-moment-of-inertia",
        "name": "Moment of inertia (point mass)",
        "domain": "mechanics",
        "formula_latex": "I = m r^2",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "op",
              "op": "^",
              "args": [
                {
                  "kind": "symbol",
                  "name": "radius",
                  "dim": {
                    "L": 1,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "2",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "point mass at radius r"
        ],
        "references": [
          "Taylor, Classical Mechanics §10"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "moment-of-inertia",
            "dim": {
              "L": 2,
              "M": 1,
              "T": 0,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "radius",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "mass": 1,
            "radius": 2
          }
        }
      },
      {
        "id": "CE-impulse",
        "name": "Impulse (constant force)",
        "domain": "mechanics",
        "formula_latex": "J = F t",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "force",
              "dim": {
                "L": 1,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "time",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "constant force over interval t"
        ],
        "references": [
          "Taylor, Classical Mechanics §1"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "p",
            "dim": {
              "L": 1,
              "M": 1,
              "T": -1,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "force",
              "dim": {
                "L": 1,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "time",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "force": 1,
            "time": 1
          }
        }
      },
      {
        "id": "CE-simple-harmonic-frequency",
        "name": "Simple-harmonic angular frequency",
        "domain": "mechanics",
        "formula_latex": "\\omega = \\sqrt{k/m}",
        "epistemicStatus": "dimensional",
        "regime": {
          "scale": "classical",
          "force": "emergent"
        },
        "assumptions": [
          "ideal mass–spring oscillator"
        ],
        "references": [
          "Taylor, Classical Mechanics §5"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "angular-velocity",
            "dim": {
              "L": 0,
              "M": 0,
              "T": -1,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "spring-constant",
              "dim": {
                "L": 0,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "spring-constant": 0.5,
            "mass": -0.5
          }
        }
      },
      {
        "id": "CE-ohm-law",
        "name": "Ohm's law",
        "domain": "electromagnetism",
        "formula_latex": "V = I R",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "current",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "resistance",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -3,
                "I": -2,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical",
          "force": "electromagnetic"
        },
        "assumptions": [
          "ohmic conductor"
        ],
        "references": [
          "Ohm 1827"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "voltage",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -3,
              "I": -1,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "current",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "resistance",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -3,
                "I": -2,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "current": 1,
            "resistance": 1
          }
        }
      },
      {
        "id": "CE-electrical-power",
        "name": "Electrical power",
        "domain": "electromagnetism",
        "formula_latex": "P = I V",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "current",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "voltage",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -3,
                "I": -1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical",
          "force": "electromagnetic"
        },
        "assumptions": [],
        "references": [
          "Joule 1841"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "power",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -3,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "current",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "voltage",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -3,
                "I": -1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "current": 1,
            "voltage": 1
          }
        }
      },
      {
        "id": "CE-resistance-material",
        "name": "Resistance of a uniform conductor",
        "domain": "electromagnetism",
        "formula_latex": "R = \\rho L / A",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "resistivity",
                  "dim": {
                    "L": 3,
                    "M": 1,
                    "T": -3,
                    "I": -2,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "length",
                  "dim": {
                    "L": 1,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            },
            {
              "kind": "symbol",
              "name": "area",
              "dim": {
                "L": 2,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical",
          "force": "electromagnetic"
        },
        "assumptions": [
          "uniform cross-section",
          "homogeneous material"
        ],
        "references": [
          "Pouillet 1837"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 1,
        "dimensional": {
          "target": {
            "name": "resistance",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -3,
              "I": -2,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "resistivity",
              "dim": {
                "L": 3,
                "M": 1,
                "T": -3,
                "I": -2,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "length",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "area",
              "dim": {
                "L": 2,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": null
        }
      },
      {
        "id": "CE-capacitance-parallel-plate",
        "name": "Parallel-plate capacitance",
        "domain": "electromagnetism",
        "formula_latex": "C = \\varepsilon_0 A / d",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "epsilon_0",
                  "dim": {
                    "L": -3,
                    "M": -1,
                    "T": 4,
                    "I": 2,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "area",
                  "dim": {
                    "L": 2,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            },
            {
              "kind": "symbol",
              "name": "distance",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical",
          "force": "electromagnetic"
        },
        "assumptions": [
          "vacuum gap",
          "ideal plates (no fringing)"
        ],
        "references": [
          "Faraday 1837"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 1,
        "dimensional": {
          "target": {
            "name": "capacitance",
            "dim": {
              "L": -2,
              "M": -1,
              "T": 4,
              "I": 2,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "epsilon_0",
              "dim": {
                "L": -3,
                "M": -1,
                "T": 4,
                "I": 2,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "area",
              "dim": {
                "L": 2,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "distance",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": null
        }
      },
      {
        "id": "CE-capacitor-energy",
        "name": "Capacitor stored energy",
        "domain": "electromagnetism",
        "formula_latex": "U = \\tfrac{1}{2} C V^2",
        "epistemicStatus": "scalar-up-to-constant",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "capacitance",
              "dim": {
                "L": -2,
                "M": -1,
                "T": 4,
                "I": 2,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "op",
              "op": "^",
              "args": [
                {
                  "kind": "symbol",
                  "name": "voltage",
                  "dim": {
                    "L": 2,
                    "M": 1,
                    "T": -3,
                    "I": -1,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "2",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            }
          ]
        },
        "regime": {
          "scale": "classical",
          "force": "electromagnetic"
        },
        "assumptions": [],
        "references": [
          "Standard electromagnetism (Griffiths §2.4)"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "energy",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "capacitance",
              "dim": {
                "L": -2,
                "M": -1,
                "T": 4,
                "I": 2,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "voltage",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -3,
                "I": -1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "capacitance": 1,
            "voltage": 2
          }
        }
      },
      {
        "id": "CE-inductor-energy",
        "name": "Inductor stored energy",
        "domain": "electromagnetism",
        "formula_latex": "U = \\tfrac{1}{2} L I^2",
        "epistemicStatus": "scalar-up-to-constant",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "inductance",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -2,
                "I": -2,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "op",
              "op": "^",
              "args": [
                {
                  "kind": "symbol",
                  "name": "current",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 1,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "2",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            }
          ]
        },
        "regime": {
          "scale": "classical",
          "force": "electromagnetic"
        },
        "assumptions": [],
        "references": [
          "Standard electromagnetism (Griffiths §7.2)"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "energy",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "inductance",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -2,
                "I": -2,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "current",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "inductance": 1,
            "current": 2
          }
        }
      },
      {
        "id": "CE-magnetic-field-wire",
        "name": "Magnetic field of a long straight wire",
        "domain": "electromagnetism",
        "formula_latex": "B = \\mu_0 I / (2\\pi r)",
        "epistemicStatus": "scalar-up-to-constant",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "mu_0",
                  "dim": {
                    "L": 1,
                    "M": 1,
                    "T": -2,
                    "I": -2,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "current",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 1,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            },
            {
              "kind": "symbol",
              "name": "distance",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical",
          "force": "electromagnetic"
        },
        "assumptions": [
          "infinite straight wire",
          "magnetostatic"
        ],
        "references": [
          "Ampère 1826"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "magnetic-field",
            "dim": {
              "L": 0,
              "M": 1,
              "T": -2,
              "I": -1,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "mu_0",
              "dim": {
                "L": 1,
                "M": 1,
                "T": -2,
                "I": -2,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "current",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "distance",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "mu_0": 1,
            "current": 1,
            "distance": -1
          }
        }
      },
      {
        "id": "CE-cyclotron-frequency",
        "name": "Cyclotron frequency",
        "domain": "electromagnetism",
        "formula_latex": "\\omega_c = q B / m",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "charge",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 1,
                    "I": 1,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "magnetic-field",
                  "dim": {
                    "L": 0,
                    "M": 1,
                    "T": -2,
                    "I": -1,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            },
            {
              "kind": "symbol",
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical",
          "force": "electromagnetic"
        },
        "assumptions": [
          "non-relativistic charged particle"
        ],
        "references": [
          "Standard plasma physics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "cyclotron-frequency",
            "dim": {
              "L": 0,
              "M": 0,
              "T": -1,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "charge",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 1,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "magnetic-field",
              "dim": {
                "L": 0,
                "M": 1,
                "T": -2,
                "I": -1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "charge": 1,
            "magnetic-field": 1,
            "mass": -1
          }
        }
      },
      {
        "id": "CE-larmor-radius",
        "name": "Larmor (gyro) radius",
        "domain": "electromagnetism",
        "formula_latex": "r_L = m v_\\perp / (q B)",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "mass",
                  "dim": {
                    "L": 0,
                    "M": 1,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "speed",
                  "dim": {
                    "L": 1,
                    "M": 0,
                    "T": -1,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            },
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "charge",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 1,
                    "I": 1,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "magnetic-field",
                  "dim": {
                    "L": 0,
                    "M": 1,
                    "T": -2,
                    "I": -1,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            }
          ]
        },
        "regime": {
          "scale": "classical",
          "force": "electromagnetic"
        },
        "assumptions": [
          "velocity perpendicular to B",
          "non-relativistic"
        ],
        "references": [
          "Standard plasma physics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "larmor-radius",
            "dim": {
              "L": 1,
              "M": 0,
              "T": 0,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "speed",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "charge",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 1,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "magnetic-field",
              "dim": {
                "L": 0,
                "M": 1,
                "T": -2,
                "I": -1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "mass": 1,
            "speed": 1,
            "charge": -1,
            "magnetic-field": -1
          }
        }
      },
      {
        "id": "CE-point-charge-field",
        "name": "Point-charge electric field (Coulomb field)",
        "domain": "electromagnetism",
        "formula_latex": "E = q / (4\\pi \\varepsilon_0 r^2)",
        "epistemicStatus": "scalar-up-to-constant",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "symbol",
              "name": "charge",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 1,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "epsilon_0",
                  "dim": {
                    "L": -3,
                    "M": -1,
                    "T": 4,
                    "I": 2,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "op",
                  "op": "^",
                  "args": [
                    {
                      "kind": "symbol",
                      "name": "r",
                      "dim": {
                        "L": 1,
                        "M": 0,
                        "T": 0,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    },
                    {
                      "kind": "symbol",
                      "name": "2",
                      "dim": {
                        "L": 0,
                        "M": 0,
                        "T": 0,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },
        "regime": {
          "scale": "classical",
          "force": "electromagnetic"
        },
        "assumptions": [
          "point charge",
          "vacuum",
          "electrostatic"
        ],
        "references": [
          "Coulomb 1785"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "electric-field",
            "dim": {
              "L": 1,
              "M": 1,
              "T": -3,
              "I": -1,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "charge",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 1,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "epsilon_0",
              "dim": {
                "L": -3,
                "M": -1,
                "T": 4,
                "I": 2,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "r",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "charge": 1,
            "epsilon_0": -1,
            "r": -2
          }
        }
      },
      {
        "id": "CE-lc-resonance",
        "name": "LC resonant angular frequency",
        "domain": "electromagnetism",
        "formula_latex": "\\omega_0 = 1/\\sqrt{L C}",
        "epistemicStatus": "dimensional",
        "regime": {
          "scale": "classical",
          "force": "electromagnetic"
        },
        "assumptions": [
          "ideal lossless LC circuit"
        ],
        "references": [
          "Standard circuit theory"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "angular-frequency",
            "dim": {
              "L": 0,
              "M": 0,
              "T": -1,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "inductance",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -2,
                "I": -2,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "capacitance",
              "dim": {
                "L": -2,
                "M": -1,
                "T": 4,
                "I": 2,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "inductance": -0.5,
            "capacitance": -0.5
          }
        }
      },
      {
        "id": "CE-coulomb",
        "name": "Coulomb's law",
        "domain": "electromagnetism",
        "formula_latex": "F = q_1 q_2/(4\\pi\\varepsilon_0 r^2)",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "q_1",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 1,
                    "I": 1,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "q_2",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 1,
                    "I": 1,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            },
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "4pi",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "epsilon_0",
                  "dim": {
                    "L": -3,
                    "M": -1,
                    "T": 4,
                    "I": 2,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "op",
                  "op": "^",
                  "args": [
                    {
                      "kind": "symbol",
                      "name": "r",
                      "dim": {
                        "L": 1,
                        "M": 0,
                        "T": 0,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    },
                    {
                      "kind": "symbol",
                      "name": "2",
                      "dim": {
                        "L": 0,
                        "M": 0,
                        "T": 0,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },
        "regime": {
          "scale": "classical",
          "force": "electromagnetic"
        },
        "assumptions": [
          "point charges",
          "vacuum",
          "electrostatic"
        ],
        "references": [
          "Coulomb 1785"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 1,
        "dimensional": {
          "target": {
            "name": "coulomb-force",
            "dim": {
              "L": 1,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "q_1",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 1,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "q_2",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 1,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "epsilon_0",
              "dim": {
                "L": -3,
                "M": -1,
                "T": 4,
                "I": 2,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "r",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": null
        }
      },
      {
        "id": "CE-lorentz-force",
        "name": "Lorentz force (magnitude)",
        "domain": "electromagnetism",
        "formula_latex": "F = q v B",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "q",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 1,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "v",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "B",
              "dim": {
                "L": 0,
                "M": 1,
                "T": -2,
                "I": -1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical",
          "force": "electromagnetic"
        },
        "assumptions": [
          "v ⟂ B (magnitude only)"
        ],
        "references": [
          "Lorentz 1895"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "lorentz-force",
            "dim": {
              "L": 1,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "q",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 1,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "v",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "B",
              "dim": {
                "L": 0,
                "M": 1,
                "T": -2,
                "I": -1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "q": 1,
            "v": 1,
            "B": 1
          }
        }
      },
      {
        "id": "CE-rc-time-constant",
        "name": "RC time constant",
        "domain": "electromagnetism",
        "formula_latex": "\\tau = R C",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "resistance",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -3,
                "I": -2,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "capacitance",
              "dim": {
                "L": -2,
                "M": -1,
                "T": 4,
                "I": 2,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical",
          "force": "electromagnetic"
        },
        "assumptions": [
          "series RC circuit"
        ],
        "references": [
          "Standard circuit theory"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "rc-time-constant",
            "dim": {
              "L": 0,
              "M": 0,
              "T": 1,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "resistance",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -3,
                "I": -2,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "capacitance",
              "dim": {
                "L": -2,
                "M": -1,
                "T": 4,
                "I": 2,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "resistance": 1,
            "capacitance": 1
          }
        }
      },
      {
        "id": "CE-poynting-flux",
        "name": "Poynting vector (magnitude)",
        "domain": "electromagnetism",
        "formula_latex": "S = E B / \\mu_0",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "electric-field",
                  "dim": {
                    "L": 1,
                    "M": 1,
                    "T": -3,
                    "I": -1,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "magnetic-flux-density",
                  "dim": {
                    "L": 0,
                    "M": 1,
                    "T": -2,
                    "I": -1,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            },
            {
              "kind": "symbol",
              "name": "mu_0",
              "dim": {
                "L": 1,
                "M": 1,
                "T": -2,
                "I": -2,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical",
          "force": "electromagnetic"
        },
        "assumptions": [
          "plane EM wave",
          "vacuum"
        ],
        "references": [
          "Poynting 1884",
          "Griffiths, Introduction to Electrodynamics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "poynting-flux",
            "dim": {
              "L": 0,
              "M": 1,
              "T": -3,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "electric-field",
              "dim": {
                "L": 1,
                "M": 1,
                "T": -3,
                "I": -1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "magnetic-flux-density",
              "dim": {
                "L": 0,
                "M": 1,
                "T": -2,
                "I": -1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "mu_0",
              "dim": {
                "L": 1,
                "M": 1,
                "T": -2,
                "I": -2,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "electric-field": 1,
            "magnetic-flux-density": 1,
            "mu_0": -1
          }
        }
      },
      {
        "id": "CE-solenoid-field",
        "name": "Solenoid magnetic field",
        "domain": "electromagnetism",
        "formula_latex": "B = \\mu_0 n I",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "mu_0",
                  "dim": {
                    "L": 1,
                    "M": 1,
                    "T": -2,
                    "I": -2,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "turn-density",
                  "dim": {
                    "L": -1,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            },
            {
              "kind": "symbol",
              "name": "current",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical",
          "force": "electromagnetic"
        },
        "assumptions": [
          "ideal infinite solenoid"
        ],
        "references": [
          "Ampère 1826",
          "Griffiths, Introduction to Electrodynamics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "solenoid-field",
            "dim": {
              "L": 0,
              "M": 1,
              "T": -2,
              "I": -1,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "mu_0",
              "dim": {
                "L": 1,
                "M": 1,
                "T": -2,
                "I": -2,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "turn-density",
              "dim": {
                "L": -1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "current",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "mu_0": 1,
            "turn-density": 1,
            "current": 1
          }
        }
      },
      {
        "id": "CE-larmor-power",
        "name": "Larmor radiated power",
        "domain": "electromagnetism",
        "formula_latex": "P = q^2 a^2 / (6\\pi \\varepsilon_0 c^3)",
        "epistemicStatus": "scalar-up-to-constant",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "op",
                  "op": "^",
                  "args": [
                    {
                      "kind": "symbol",
                      "name": "charge",
                      "dim": {
                        "L": 0,
                        "M": 0,
                        "T": 1,
                        "I": 1,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    },
                    {
                      "kind": "symbol",
                      "name": "2",
                      "dim": {
                        "L": 0,
                        "M": 0,
                        "T": 0,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    }
                  ]
                },
                {
                  "kind": "op",
                  "op": "^",
                  "args": [
                    {
                      "kind": "symbol",
                      "name": "acceleration",
                      "dim": {
                        "L": 1,
                        "M": 0,
                        "T": -2,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    },
                    {
                      "kind": "symbol",
                      "name": "2",
                      "dim": {
                        "L": 0,
                        "M": 0,
                        "T": 0,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    }
                  ]
                }
              ]
            },
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "epsilon_0",
                  "dim": {
                    "L": -3,
                    "M": -1,
                    "T": 4,
                    "I": 2,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "op",
                  "op": "^",
                  "args": [
                    {
                      "kind": "symbol",
                      "name": "speed-of-light",
                      "dim": {
                        "L": 1,
                        "M": 0,
                        "T": -1,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    },
                    {
                      "kind": "symbol",
                      "name": "3",
                      "dim": {
                        "L": 0,
                        "M": 0,
                        "T": 0,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },
        "regime": {
          "scale": "classical",
          "force": "electromagnetic"
        },
        "assumptions": [
          "non-relativistic point charge"
        ],
        "references": [
          "Larmor 1897",
          "Jackson, Classical Electrodynamics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "larmor-power",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -3,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "charge",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 1,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "acceleration",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "epsilon_0",
              "dim": {
                "L": -3,
                "M": -1,
                "T": 4,
                "I": 2,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "speed-of-light",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "charge": 2,
            "acceleration": 2,
            "epsilon_0": -1,
            "speed-of-light": -3
          }
        }
      },
      {
        "id": "CE-field-energy-density",
        "name": "Electric-field energy density",
        "domain": "electromagnetism",
        "formula_latex": "u = \\tfrac{1}{2} \\varepsilon_0 E^2",
        "epistemicStatus": "scalar-up-to-constant",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "epsilon_0",
              "dim": {
                "L": -3,
                "M": -1,
                "T": 4,
                "I": 2,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "op",
              "op": "^",
              "args": [
                {
                  "kind": "symbol",
                  "name": "electric-field",
                  "dim": {
                    "L": 1,
                    "M": 1,
                    "T": -3,
                    "I": -1,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "2",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            }
          ]
        },
        "regime": {
          "scale": "classical",
          "force": "electromagnetic"
        },
        "assumptions": [
          "linear vacuum",
          "electrostatic"
        ],
        "references": [
          "Griffiths, Introduction to Electrodynamics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "field-energy-density",
            "dim": {
              "L": -1,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "epsilon_0",
              "dim": {
                "L": -3,
                "M": -1,
                "T": 4,
                "I": 2,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "electric-field",
              "dim": {
                "L": 1,
                "M": 1,
                "T": -3,
                "I": -1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "epsilon_0": 1,
            "electric-field": 2
          }
        }
      },
      {
        "id": "CE-hydrostatic-pressure",
        "name": "Hydrostatic pressure",
        "domain": "mechanics",
        "formula_latex": "P = \\rho g h",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "density",
              "dim": {
                "L": -3,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "g",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "height",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical",
          "force": "gravitational"
        },
        "assumptions": [
          "incompressible fluid",
          "uniform gravity"
        ],
        "references": [
          "Pascal 1647"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "pressure",
            "dim": {
              "L": -1,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "density",
              "dim": {
                "L": -3,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "g",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "height",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "density": 1,
            "g": 1,
            "height": 1
          }
        }
      },
      {
        "id": "CE-pressure-definition",
        "name": "Pressure (force per area)",
        "domain": "mechanics",
        "formula_latex": "P = F / A",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "symbol",
              "name": "force",
              "dim": {
                "L": 1,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "area",
              "dim": {
                "L": 2,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "force normal to surface"
        ],
        "references": [
          "Standard mechanics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "pressure",
            "dim": {
              "L": -1,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "force",
              "dim": {
                "L": 1,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "area",
              "dim": {
                "L": 2,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "force": 1,
            "area": -1
          }
        }
      },
      {
        "id": "CE-density-definition",
        "name": "Mass density",
        "domain": "mechanics",
        "formula_latex": "\\rho = m / V",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "symbol",
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "volume",
              "dim": {
                "L": 3,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "uniform body"
        ],
        "references": [
          "Standard mechanics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "density",
            "dim": {
              "L": -3,
              "M": 1,
              "T": 0,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "volume",
              "dim": {
                "L": 3,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "mass": 1,
            "volume": -1
          }
        }
      },
      {
        "id": "CE-buoyant-force",
        "name": "Buoyant force (Archimedes')",
        "domain": "mechanics",
        "formula_latex": "F_b = \\rho V g",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "density",
              "dim": {
                "L": -3,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "volume",
              "dim": {
                "L": 3,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "g",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical",
          "force": "gravitational"
        },
        "assumptions": [
          "fully submerged",
          "static fluid"
        ],
        "references": [
          "Archimedes, On Floating Bodies"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "force",
            "dim": {
              "L": 1,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "density",
              "dim": {
                "L": -3,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "volume",
              "dim": {
                "L": 3,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "g",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "density": 1,
            "volume": 1,
            "g": 1
          }
        }
      },
      {
        "id": "CE-stokes-drag",
        "name": "Stokes' drag",
        "domain": "mechanics",
        "formula_latex": "F_d = 6\\pi \\eta r v",
        "epistemicStatus": "scalar-up-to-constant",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "viscosity",
              "dim": {
                "L": -1,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "radius",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "speed",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical",
          "force": "emergent"
        },
        "assumptions": [
          "low Reynolds number",
          "rigid sphere"
        ],
        "references": [
          "Stokes 1851"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "force",
            "dim": {
              "L": 1,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "viscosity",
              "dim": {
                "L": -1,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "radius",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "speed",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "viscosity": 1,
            "radius": 1,
            "speed": 1
          }
        }
      },
      {
        "id": "CE-wave-speed",
        "name": "Wave relation (v = fλ)",
        "domain": "mechanics",
        "formula_latex": "v = f \\lambda",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "frequency",
              "dim": {
                "L": 0,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "wavelength",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "single propagating mode"
        ],
        "references": [
          "Standard wave mechanics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "speed",
            "dim": {
              "L": 1,
              "M": 0,
              "T": -1,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "frequency",
              "dim": {
                "L": 0,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "wavelength",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "frequency": 1,
            "wavelength": 1
          }
        }
      },
      {
        "id": "CE-sound-speed",
        "name": "Speed of sound in a fluid",
        "domain": "mechanics",
        "formula_latex": "c = \\sqrt{\\gamma P / \\rho}",
        "epistemicStatus": "dimensional",
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "adiabatic",
          "ideal fluid (γ dimensionless)"
        ],
        "references": [
          "Newton–Laplace"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "speed",
            "dim": {
              "L": 1,
              "M": 0,
              "T": -1,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "pressure",
              "dim": {
                "L": -1,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "density",
              "dim": {
                "L": -3,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "pressure": 0.5,
            "density": -0.5
          }
        }
      },
      {
        "id": "CE-volume-flow-rate",
        "name": "Volume flow rate (continuity)",
        "domain": "mechanics",
        "formula_latex": "Q = A v",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "cross-sectional-area",
              "dim": {
                "L": 2,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "flow-velocity",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "incompressible flow",
          "steady state"
        ],
        "references": [
          "Batchelor, An Introduction to Fluid Dynamics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "volume-flow-rate",
            "dim": {
              "L": 3,
              "M": 0,
              "T": -1,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "cross-sectional-area",
              "dim": {
                "L": 2,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "flow-velocity",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "cross-sectional-area": 1,
            "flow-velocity": 1
          }
        }
      },
      {
        "id": "CE-shear-stress",
        "name": "Shear stress (Newtonian fluid)",
        "domain": "mechanics",
        "formula_latex": "\\tau = \\mu (dv/dy)",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "dynamic-viscosity",
              "dim": {
                "L": -1,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "velocity-gradient",
              "dim": {
                "L": 0,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "Newtonian fluid",
          "laminar flow"
        ],
        "references": [
          "Newton; standard fluid mechanics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "shear-stress",
            "dim": {
              "L": -1,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "dynamic-viscosity",
              "dim": {
                "L": -1,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "velocity-gradient",
              "dim": {
                "L": 0,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "dynamic-viscosity": 1,
            "velocity-gradient": 1
          }
        }
      },
      {
        "id": "CE-laplace-pressure",
        "name": "Laplace pressure (surface tension)",
        "domain": "mechanics",
        "formula_latex": "\\Delta P = 2\\gamma / r",
        "epistemicStatus": "scalar-up-to-constant",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "symbol",
              "name": "surface-tension",
              "dim": {
                "L": 0,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "droplet-radius",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "spherical interface"
        ],
        "references": [
          "Young–Laplace"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "laplace-pressure",
            "dim": {
              "L": -1,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "surface-tension",
              "dim": {
                "L": 0,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "droplet-radius",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "surface-tension": 1,
            "droplet-radius": -1
          }
        }
      },
      {
        "id": "CE-dynamic-pressure",
        "name": "Dynamic pressure",
        "domain": "mechanics",
        "formula_latex": "q = \\tfrac{1}{2} \\rho v^2",
        "epistemicStatus": "scalar-up-to-constant",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "density",
              "dim": {
                "L": -3,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "op",
              "op": "^",
              "args": [
                {
                  "kind": "symbol",
                  "name": "flow-velocity",
                  "dim": {
                    "L": 1,
                    "M": 0,
                    "T": -1,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "2",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "incompressible flow"
        ],
        "references": [
          "Bernoulli; standard fluid mechanics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "dynamic-pressure",
            "dim": {
              "L": -1,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "density",
              "dim": {
                "L": -3,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "flow-velocity",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "density": 1,
            "flow-velocity": 2
          }
        }
      },
      {
        "id": "CE-oscillator-energy",
        "name": "Harmonic oscillator energy",
        "domain": "mechanics",
        "formula_latex": "E = \\tfrac{1}{2} k A^2",
        "epistemicStatus": "scalar-up-to-constant",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "spring-constant",
              "dim": {
                "L": 0,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "op",
              "op": "^",
              "args": [
                {
                  "kind": "symbol",
                  "name": "amplitude",
                  "dim": {
                    "L": 1,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "2",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "simple harmonic motion",
          "linear spring"
        ],
        "references": [
          "Standard mechanics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "oscillator-energy",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "spring-constant",
              "dim": {
                "L": 0,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "amplitude",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "spring-constant": 1,
            "amplitude": 2
          }
        }
      },
      {
        "id": "CE-heat-capacity",
        "name": "Sensible heat (heat capacity)",
        "domain": "thermodynamics",
        "formula_latex": "Q = m c \\Delta T",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "specific-heat",
              "dim": {
                "L": 2,
                "M": 0,
                "T": -2,
                "I": 0,
                "Theta": -1,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "temperature-change",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 1,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "no phase change",
          "constant specific heat"
        ],
        "references": [
          "Standard thermodynamics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "heat-energy",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "specific-heat",
              "dim": {
                "L": 2,
                "M": 0,
                "T": -2,
                "I": 0,
                "Theta": -1,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "temperature-change",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 1,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "mass": 1,
            "specific-heat": 1,
            "temperature-change": 1
          }
        }
      },
      {
        "id": "CE-half-life",
        "name": "Radioactive half-life",
        "domain": "quantum",
        "formula_latex": "t_{1/2} = \\ln 2 / \\lambda",
        "epistemicStatus": "scalar-up-to-constant",
        "scalarAst": {
          "kind": "op",
          "op": "^",
          "args": [
            {
              "kind": "symbol",
              "name": "decay-constant",
              "dim": {
                "L": 0,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "-1",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "quantum"
        },
        "assumptions": [
          "first-order (exponential) decay"
        ],
        "references": [
          "Rutherford–Soddy 1902"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "half-life",
            "dim": {
              "L": 0,
              "M": 0,
              "T": 1,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "decay-constant",
              "dim": {
                "L": 0,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "decay-constant": -1
          }
        }
      },
      {
        "id": "CE-hubble-distance",
        "name": "Hubble distance",
        "domain": "cosmology",
        "formula_latex": "D_H = c / H_0",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "symbol",
              "name": "c",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "hubble-rate",
              "dim": {
                "L": 0,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "cosmological"
        },
        "assumptions": [
          "present-epoch Hubble parameter"
        ],
        "references": [
          "Hubble 1929"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "hubble-distance",
            "dim": {
              "L": 1,
              "M": 0,
              "T": 0,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "c",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "hubble-rate",
              "dim": {
                "L": 0,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "c": 1,
            "hubble-rate": -1
          }
        }
      },
      {
        "id": "CE-landauer",
        "name": "Landauer erasure bound",
        "domain": "information",
        "formula_latex": "E = k_B T \\ln 2",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "k_B",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": -1,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "T",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 1,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "ln2",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "forms": {
          "logBase": "e"
        },
        "regime": {
          "scale": "mesoscopic",
          "information": "shannon"
        },
        "assumptions": [
          "isothermal",
          "quasi-static erasure"
        ],
        "references": [
          "Landauer 1961"
        ],
        "partnerBridges": [
          "16"
        ],
        "restatesBridge": "16",
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "erasure-energy",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "k_B",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": -1,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "temperature",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 1,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "k_B": 1,
            "temperature": 1
          }
        }
      },
      {
        "id": "CE-jarzynski",
        "name": "Jarzynski free-energy equality",
        "domain": "statistical",
        "formula_latex": "\\Delta F = -k_B T \\ln \\langle \\exp(-W/(k_B T)) \\rangle",
        "epistemicStatus": "scalar-up-to-constant",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "-1",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "k_B",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": -1,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "T",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 1,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "ln_avg_exp_minus_betaW",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "mesoscopic"
        },
        "assumptions": [
          "isothermal",
          "arbitrary work protocol between two equilibria"
        ],
        "references": [
          "Jarzynski 1997 PRL 78:2690"
        ],
        "partnerBridges": [
          "29"
        ],
        "restatesBridge": "29",
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "free-energy-difference",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "k_B",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": -1,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "temperature",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 1,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "k_B": 1,
            "temperature": 1
          }
        }
      },
      {
        "id": "CE-stefan-boltzmann",
        "name": "Stefan–Boltzmann law",
        "domain": "thermodynamics",
        "formula_latex": "j = \\sigma T^4",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "sigma_sb",
              "dim": {
                "L": 0,
                "M": 1,
                "T": -3,
                "I": 0,
                "Theta": -4,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "op",
              "op": "^",
              "args": [
                {
                  "kind": "symbol",
                  "name": "T",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 1,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "4",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            }
          ]
        },
        "forms": {
          "quantityKind": "flux"
        },
        "regime": {
          "scale": "classical",
          "force": "electromagnetic"
        },
        "assumptions": [
          "blackbody",
          "thermal equilibrium"
        ],
        "references": [
          "Stefan 1879; Boltzmann 1884"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "radiative-flux",
            "dim": {
              "L": 0,
              "M": 1,
              "T": -3,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "sigma_sb",
              "dim": {
                "L": 0,
                "M": 1,
                "T": -3,
                "I": 0,
                "Theta": -4,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "temperature",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 1,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "sigma_sb": 1,
            "temperature": 4
          }
        }
      },
      {
        "id": "CE-ideal-gas",
        "name": "Ideal gas law",
        "domain": "thermodynamics",
        "formula_latex": "P = N k_B T/V",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "N",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "k_B",
                  "dim": {
                    "L": 2,
                    "M": 1,
                    "T": -2,
                    "I": 0,
                    "Theta": -1,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "T",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 1,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            },
            {
              "kind": "symbol",
              "name": "V",
              "dim": {
                "L": 3,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical",
          "force": "electromagnetic"
        },
        "assumptions": [
          "ideal gas",
          "thermal equilibrium"
        ],
        "references": [
          "Clapeyron 1834"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "pressure",
            "dim": {
              "L": -1,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "k_B",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": -1,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "temperature",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 1,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "V",
              "dim": {
                "L": 3,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "k_B": 1,
            "temperature": 1,
            "V": -1
          }
        }
      },
      {
        "id": "CE-wien",
        "name": "Wien's displacement law",
        "domain": "thermodynamics",
        "formula_latex": "\\lambda_{max} = b/T",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "symbol",
              "name": "b",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 1,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "temperature",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 1,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical",
          "force": "electromagnetic"
        },
        "assumptions": [
          "blackbody",
          "thermal equilibrium"
        ],
        "references": [
          "Wien 1893"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "peak-wavelength",
            "dim": {
              "L": 1,
              "M": 0,
              "T": 0,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "b",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 1,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "temperature",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 1,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "b": 1,
            "temperature": -1
          }
        }
      },
      {
        "id": "CE-latent-heat",
        "name": "Latent heat of phase transition",
        "domain": "thermodynamics",
        "formula_latex": "Q = m L",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "specific-latent-heat",
              "dim": {
                "L": 2,
                "M": 0,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "isothermal phase transition"
        ],
        "references": [
          "Callen, Thermodynamics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "latent-heat",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "specific-latent-heat",
              "dim": {
                "L": 2,
                "M": 0,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "mass": 1,
            "specific-latent-heat": 1
          }
        }
      },
      {
        "id": "CE-clausius-entropy",
        "name": "Clausius entropy change",
        "domain": "thermodynamics",
        "formula_latex": "\\Delta S = Q/T",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "symbol",
              "name": "heat",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "temperature",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 1,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "reversible process",
          "constant temperature"
        ],
        "references": [
          "Clausius 1865",
          "Callen, Thermodynamics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "entropy-change",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": -1,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "heat",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "temperature",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 1,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "heat": 1,
            "temperature": -1
          }
        }
      },
      {
        "id": "CE-thermal-diffusivity",
        "name": "Thermal diffusivity",
        "domain": "thermodynamics",
        "formula_latex": "\\alpha = k/(\\rho c_p)",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "symbol",
              "name": "thermal-conductivity",
              "dim": {
                "L": 1,
                "M": 1,
                "T": -3,
                "I": 0,
                "Theta": -1,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "density",
                  "dim": {
                    "L": -3,
                    "M": 1,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "specific-heat-capacity",
                  "dim": {
                    "L": 2,
                    "M": 0,
                    "T": -2,
                    "I": 0,
                    "Theta": -1,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "homogeneous isotropic medium"
        ],
        "references": [
          "Carslaw & Jaeger, Conduction of Heat in Solids"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "thermal-diffusivity",
            "dim": {
              "L": 2,
              "M": 0,
              "T": -1,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "thermal-conductivity",
              "dim": {
                "L": 1,
                "M": 1,
                "T": -3,
                "I": 0,
                "Theta": -1,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "density",
              "dim": {
                "L": -3,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "specific-heat-capacity",
              "dim": {
                "L": 2,
                "M": 0,
                "T": -2,
                "I": 0,
                "Theta": -1,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "thermal-conductivity": 1,
            "density": -1,
            "specific-heat-capacity": -1
          }
        }
      },
      {
        "id": "CE-rydberg-energy",
        "name": "Rydberg energy",
        "domain": "quantum",
        "formula_latex": "E_R = m_e e^4 / (8 \\varepsilon_0^2 \\hbar^2)",
        "epistemicStatus": "scalar-up-to-constant",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "m_e",
                  "dim": {
                    "L": 0,
                    "M": 1,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "op",
                  "op": "^",
                  "args": [
                    {
                      "kind": "symbol",
                      "name": "e",
                      "dim": {
                        "L": 0,
                        "M": 0,
                        "T": 1,
                        "I": 1,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    },
                    {
                      "kind": "symbol",
                      "name": "4",
                      "dim": {
                        "L": 0,
                        "M": 0,
                        "T": 0,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    }
                  ]
                }
              ]
            },
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "op",
                  "op": "^",
                  "args": [
                    {
                      "kind": "symbol",
                      "name": "epsilon_0",
                      "dim": {
                        "L": -3,
                        "M": -1,
                        "T": 4,
                        "I": 2,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    },
                    {
                      "kind": "symbol",
                      "name": "2",
                      "dim": {
                        "L": 0,
                        "M": 0,
                        "T": 0,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    }
                  ]
                },
                {
                  "kind": "op",
                  "op": "^",
                  "args": [
                    {
                      "kind": "symbol",
                      "name": "hbar",
                      "dim": {
                        "L": 2,
                        "M": 1,
                        "T": -1,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    },
                    {
                      "kind": "symbol",
                      "name": "2",
                      "dim": {
                        "L": 0,
                        "M": 0,
                        "T": 0,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },
        "regime": {
          "scale": "quantum",
          "force": "electromagnetic"
        },
        "assumptions": [
          "hydrogen-like",
          "non-relativistic"
        ],
        "references": [
          "Rydberg 1888; Bohr 1913"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "rydberg-energy",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "m_e",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "e",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 1,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "epsilon_0",
              "dim": {
                "L": -3,
                "M": -1,
                "T": 4,
                "I": 2,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "hbar",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "m_e": 1,
            "e": 4,
            "epsilon_0": -2,
            "hbar": -2
          }
        }
      },
      {
        "id": "CE-classical-electron-radius",
        "name": "Classical electron radius",
        "domain": "quantum",
        "formula_latex": "r_e = e^2 / (4\\pi \\varepsilon_0 m_e c^2)",
        "epistemicStatus": "scalar-up-to-constant",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "op",
              "op": "^",
              "args": [
                {
                  "kind": "symbol",
                  "name": "e",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 1,
                    "I": 1,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "2",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            },
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "epsilon_0",
                  "dim": {
                    "L": -3,
                    "M": -1,
                    "T": 4,
                    "I": 2,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "m_e",
                  "dim": {
                    "L": 0,
                    "M": 1,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "op",
                  "op": "^",
                  "args": [
                    {
                      "kind": "symbol",
                      "name": "c",
                      "dim": {
                        "L": 1,
                        "M": 0,
                        "T": -1,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    },
                    {
                      "kind": "symbol",
                      "name": "2",
                      "dim": {
                        "L": 0,
                        "M": 0,
                        "T": 0,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },
        "regime": {
          "scale": "quantum",
          "force": "electromagnetic"
        },
        "assumptions": [
          "classical point-charge self-energy scale"
        ],
        "references": [
          "Lorentz; Thomson scattering"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "classical-electron-radius",
            "dim": {
              "L": 1,
              "M": 0,
              "T": 0,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "e",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 1,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "epsilon_0",
              "dim": {
                "L": -3,
                "M": -1,
                "T": 4,
                "I": 2,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "m_e",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "c",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "e": 2,
            "epsilon_0": -1,
            "m_e": -1,
            "c": -2
          }
        }
      },
      {
        "id": "CE-bohr-magneton",
        "name": "Bohr magneton",
        "domain": "quantum",
        "formula_latex": "\\mu_B = e \\hbar / (2 m_e)",
        "epistemicStatus": "scalar-up-to-constant",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "e",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 1,
                    "I": 1,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "hbar",
                  "dim": {
                    "L": 2,
                    "M": 1,
                    "T": -1,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            },
            {
              "kind": "symbol",
              "name": "m_e",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "quantum",
          "force": "electromagnetic"
        },
        "assumptions": [
          "electron magnetic-moment scale"
        ],
        "references": [
          "Bohr 1913; Pauli 1920"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "bohr-magneton",
            "dim": {
              "L": 2,
              "M": 0,
              "T": 0,
              "I": 1,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "e",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 1,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "hbar",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "m_e",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "e": 1,
            "hbar": 1,
            "m_e": -1
          }
        }
      },
      {
        "id": "CE-planck-einstein",
        "name": "Planck–Einstein relation",
        "domain": "quantum",
        "formula_latex": "E = h\\nu",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "h",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "nu",
              "dim": {
                "L": 0,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "quantum",
          "force": "electromagnetic"
        },
        "assumptions": [],
        "references": [
          "Planck 1900; Einstein 1905"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "photon-energy",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "h",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "nu",
              "dim": {
                "L": 0,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "h": 1,
            "nu": 1
          }
        }
      },
      {
        "id": "CE-de-broglie",
        "name": "de Broglie wavelength",
        "domain": "quantum",
        "formula_latex": "\\lambda = h/p",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "symbol",
              "name": "h",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "p",
              "dim": {
                "L": 1,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "quantum"
        },
        "assumptions": [],
        "references": [
          "de Broglie 1924"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "de-broglie-wavelength",
            "dim": {
              "L": 1,
              "M": 0,
              "T": 0,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "h",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "p",
              "dim": {
                "L": 1,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "h": 1,
            "p": -1
          }
        }
      },
      {
        "id": "CE-bohr-radius",
        "name": "Bohr radius",
        "domain": "quantum",
        "formula_latex": "a_0 = 4\\pi\\varepsilon_0\\hbar^2/(m_e e^2)",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "4pi",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "epsilon_0",
                  "dim": {
                    "L": -3,
                    "M": -1,
                    "T": 4,
                    "I": 2,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "op",
                  "op": "^",
                  "args": [
                    {
                      "kind": "symbol",
                      "name": "hbar",
                      "dim": {
                        "L": 2,
                        "M": 1,
                        "T": -1,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    },
                    {
                      "kind": "symbol",
                      "name": "2",
                      "dim": {
                        "L": 0,
                        "M": 0,
                        "T": 0,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    }
                  ]
                }
              ]
            },
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "m_e",
                  "dim": {
                    "L": 0,
                    "M": 1,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "op",
                  "op": "^",
                  "args": [
                    {
                      "kind": "symbol",
                      "name": "e",
                      "dim": {
                        "L": 0,
                        "M": 0,
                        "T": 1,
                        "I": 1,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    },
                    {
                      "kind": "symbol",
                      "name": "2",
                      "dim": {
                        "L": 0,
                        "M": 0,
                        "T": 0,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },
        "regime": {
          "scale": "quantum",
          "force": "electromagnetic"
        },
        "assumptions": [
          "hydrogen-like",
          "non-relativistic"
        ],
        "references": [
          "Bohr 1913"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "bohr-radius",
            "dim": {
              "L": 1,
              "M": 0,
              "T": 0,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "epsilon_0",
              "dim": {
                "L": -3,
                "M": -1,
                "T": 4,
                "I": 2,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "hbar",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "m_e",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "e",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 1,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "epsilon_0": 1,
            "hbar": 2,
            "m_e": -1,
            "e": -2
          }
        }
      },
      {
        "id": "CE-thomson-cross-section",
        "name": "Thomson scattering cross-section",
        "domain": "quantum",
        "formula_latex": "\\sigma_T = (8\\pi/3) r_e^2",
        "epistemicStatus": "scalar-up-to-constant",
        "scalarAst": {
          "kind": "op",
          "op": "^",
          "args": [
            {
              "kind": "symbol",
              "name": "classical-electron-radius",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "2",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "quantum",
          "force": "electromagnetic"
        },
        "assumptions": [
          "non-relativistic Thomson limit",
          "free electron"
        ],
        "references": [
          "J.J. Thomson; Jackson, Classical Electrodynamics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "thomson-cross-section",
            "dim": {
              "L": 2,
              "M": 0,
              "T": 0,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "classical-electron-radius",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "classical-electron-radius": 2
          }
        }
      },
      {
        "id": "CE-uncertainty-principle",
        "name": "Heisenberg uncertainty principle",
        "domain": "quantum",
        "formula_latex": "Delta x , Delta p geq hbar/2",
        "epistemicStatus": "scalar-up-to-constant",
        "scalarAst": {
          "kind": "symbol",
          "name": "hbar",
          "dim": {
            "L": 2,
            "M": 1,
            "T": -1,
            "I": 0,
            "Theta": 0,
            "N": 0,
            "J": 0
          }
        },
        "regime": {
          "scale": "quantum"
        },
        "assumptions": [
          "a LOWER BOUND, not an equality; the scalarAst is its saturating case",
          "saturated only by minimum-uncertainty (Gaussian) states"
        ],
        "references": [
          "Heisenberg 1927",
          "Kennard 1927",
          "Robertson 1929 Phys. Rev. 34:163"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "position-momentum-uncertainty-product",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -1,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "hbar",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "hbar": 1
          }
        }
      },
      {
        "id": "CE-carrier-mobility",
        "name": "Carrier mobility",
        "domain": "condensed-matter",
        "formula_latex": "\\mu = q\\tau/m",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "charge",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 1,
                    "I": 1,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "relaxation-time",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 1,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            },
            {
              "kind": "symbol",
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "mesoscopic",
          "force": "electromagnetic"
        },
        "assumptions": [
          "Drude free-electron model"
        ],
        "references": [
          "Ashcroft & Mermin, Solid State Physics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "carrier-mobility",
            "dim": {
              "L": 0,
              "M": -1,
              "T": 2,
              "I": 1,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "charge",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 1,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "relaxation-time",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "charge": 1,
            "relaxation-time": 1,
            "mass": -1
          }
        }
      },
      {
        "id": "CE-electrical-conductivity",
        "name": "Electrical conductivity (Drude)",
        "domain": "condensed-matter",
        "formula_latex": "\\sigma = n q \\mu",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "carrier-density",
              "dim": {
                "L": -3,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "charge",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 1,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "carrier-mobility",
              "dim": {
                "L": 0,
                "M": -1,
                "T": 2,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "mesoscopic",
          "force": "electromagnetic"
        },
        "assumptions": [
          "Drude free-electron model"
        ],
        "references": [
          "Ashcroft & Mermin, Solid State Physics (Drude model)"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "electrical-conductivity",
            "dim": {
              "L": -3,
              "M": -1,
              "T": 3,
              "I": 2,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "carrier-density",
              "dim": {
                "L": -3,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "charge",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 1,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "carrier-mobility",
              "dim": {
                "L": 0,
                "M": -1,
                "T": 2,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "carrier-density": 1,
            "charge": 1,
            "carrier-mobility": 1
          }
        }
      },
      {
        "id": "CE-drude-resistivity",
        "name": "Drude resistivity",
        "domain": "condensed-matter",
        "formula_latex": "\\rho = m/(n q^2 \\tau)",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "symbol",
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "carrier-density",
                  "dim": {
                    "L": -3,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "op",
                  "op": "^",
                  "args": [
                    {
                      "kind": "symbol",
                      "name": "charge",
                      "dim": {
                        "L": 0,
                        "M": 0,
                        "T": 1,
                        "I": 1,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    },
                    {
                      "kind": "symbol",
                      "name": "2",
                      "dim": {
                        "L": 0,
                        "M": 0,
                        "T": 0,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    }
                  ]
                },
                {
                  "kind": "symbol",
                  "name": "relaxation-time",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 1,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            }
          ]
        },
        "regime": {
          "scale": "mesoscopic",
          "force": "electromagnetic"
        },
        "assumptions": [
          "Drude free-electron model"
        ],
        "references": [
          "Drude 1900",
          "Ashcroft & Mermin, Solid State Physics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "electrical-resistivity",
            "dim": {
              "L": 3,
              "M": 1,
              "T": -3,
              "I": -2,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "carrier-density",
              "dim": {
                "L": -3,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "charge",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 1,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "relaxation-time",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "mass": 1,
            "carrier-density": -1,
            "charge": -2,
            "relaxation-time": -1
          }
        }
      },
      {
        "id": "CE-hall-coefficient",
        "name": "Hall coefficient",
        "domain": "condensed-matter",
        "formula_latex": "R_H = 1/(nq)",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "^",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "carrier-density",
                  "dim": {
                    "L": -3,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "charge",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 1,
                    "I": 1,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            },
            {
              "kind": "symbol",
              "name": "-1",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "mesoscopic",
          "force": "electromagnetic"
        },
        "assumptions": [
          "single-carrier Drude model",
          "low magnetic field"
        ],
        "references": [
          "Kittel, Introduction to Solid State Physics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "hall-coefficient",
            "dim": {
              "L": 3,
              "M": 0,
              "T": -1,
              "I": -1,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "carrier-density",
              "dim": {
                "L": -3,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "charge",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 1,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "carrier-density": -1,
            "charge": -1
          }
        }
      },
      {
        "id": "CE-drift-velocity",
        "name": "Carrier drift velocity",
        "domain": "condensed-matter",
        "formula_latex": "v_d = \\mu E",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "carrier-mobility",
              "dim": {
                "L": 0,
                "M": -1,
                "T": 2,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "electric-field",
              "dim": {
                "L": 1,
                "M": 1,
                "T": -3,
                "I": -1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "mesoscopic",
          "force": "electromagnetic"
        },
        "assumptions": [
          "Drude free-electron model",
          "linear-response (low-field) regime"
        ],
        "references": [
          "Drude 1900",
          "Ashcroft & Mermin, Solid State Physics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "drift-velocity",
            "dim": {
              "L": 1,
              "M": 0,
              "T": -1,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "carrier-mobility",
              "dim": {
                "L": 0,
                "M": -1,
                "T": 2,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "electric-field",
              "dim": {
                "L": 1,
                "M": 1,
                "T": -3,
                "I": -1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "carrier-mobility": 1,
            "electric-field": 1
          }
        }
      },
      {
        "id": "CE-fermi-energy",
        "name": "Fermi energy",
        "domain": "condensed-matter",
        "formula_latex": "E_F \\propto \\hbar^2 n^{2/3}/m",
        "epistemicStatus": "dimensional",
        "regime": {
          "scale": "mesoscopic"
        },
        "assumptions": [
          "degenerate free-electron gas",
          "T ≈ 0"
        ],
        "references": [
          "Ashcroft & Mermin, Solid State Physics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "fermi-energy",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "reduced-planck-constant",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "carrier-density",
              "dim": {
                "L": -3,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "reduced-planck-constant": 2,
            "mass": -1,
            "carrier-density": 0.6666666666666666
          }
        }
      },
      {
        "id": "CE-fermi-velocity",
        "name": "Fermi velocity",
        "domain": "condensed-matter",
        "formula_latex": "v_F \\propto (\\hbar/m) n^{1/3}",
        "epistemicStatus": "dimensional",
        "regime": {
          "scale": "mesoscopic"
        },
        "assumptions": [
          "degenerate free-electron gas",
          "T ≈ 0"
        ],
        "references": [
          "Ashcroft & Mermin, Solid State Physics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "fermi-velocity",
            "dim": {
              "L": 1,
              "M": 0,
              "T": -1,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "reduced-planck-constant",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "carrier-density",
              "dim": {
                "L": -3,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "reduced-planck-constant": 1,
            "mass": -1,
            "carrier-density": 0.3333333333333333
          }
        }
      },
      {
        "id": "CE-plasma-frequency",
        "name": "Plasma frequency",
        "domain": "condensed-matter",
        "formula_latex": "\\omega_p \\propto \\sqrt{n q^2/(\\varepsilon_0 m)}",
        "epistemicStatus": "dimensional",
        "regime": {
          "scale": "mesoscopic",
          "force": "electromagnetic"
        },
        "assumptions": [
          "free-electron gas",
          "long-wavelength (q→0) limit"
        ],
        "references": [
          "Kittel, Introduction to Solid State Physics",
          "Ashcroft & Mermin, Solid State Physics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "plasma-frequency",
            "dim": {
              "L": 0,
              "M": 0,
              "T": -1,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "carrier-density",
              "dim": {
                "L": -3,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "charge",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 1,
                "I": 1,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "vacuum-permittivity",
              "dim": {
                "L": -3,
                "M": -1,
                "T": 4,
                "I": 2,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "carrier-density": 0.5,
            "charge": 1,
            "vacuum-permittivity": -0.5,
            "mass": -0.5
          }
        }
      },
      {
        "id": "CE-debye-frequency",
        "name": "Debye frequency",
        "domain": "condensed-matter",
        "formula_latex": "\\omega_D \\propto v_s n^{1/3}",
        "epistemicStatus": "dimensional",
        "regime": {
          "scale": "mesoscopic",
          "force": "emergent"
        },
        "assumptions": [
          "Debye model of lattice vibrations",
          "linear dispersion"
        ],
        "references": [
          "Debye 1912",
          "Kittel, Introduction to Solid State Physics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "debye-frequency",
            "dim": {
              "L": 0,
              "M": 0,
              "T": -1,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "sound-speed",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "number-density",
              "dim": {
                "L": -3,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "sound-speed": 1,
            "number-density": 0.3333333333333333
          }
        }
      },
      {
        "id": "CE-equipartition",
        "name": "Equipartition (mean kinetic energy)",
        "domain": "statistical",
        "formula_latex": "\\langle E \\rangle = \\tfrac{3}{2} k_B T",
        "epistemicStatus": "scalar-up-to-constant",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "boltzmann-constant",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": -1,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "temperature",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 1,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "ideal gas",
          "thermal equilibrium",
          "3 translational DOF"
        ],
        "references": [
          "Reif, Fundamentals of Statistical and Thermal Physics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "thermal-energy",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "boltzmann-constant",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": -1,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "temperature",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 1,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "boltzmann-constant": 1,
            "temperature": 1
          }
        }
      },
      {
        "id": "CE-stokes-einstein",
        "name": "Stokes-Einstein diffusion",
        "domain": "statistical",
        "formula_latex": "D = k_B T/(6\\pi\\mu r)",
        "epistemicStatus": "scalar-up-to-constant",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "boltzmann-constant",
                  "dim": {
                    "L": 2,
                    "M": 1,
                    "T": -2,
                    "I": 0,
                    "Theta": -1,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "temperature",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 1,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            },
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "dynamic-viscosity",
                  "dim": {
                    "L": -1,
                    "M": 1,
                    "T": -1,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "particle-radius",
                  "dim": {
                    "L": 1,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            }
          ]
        },
        "regime": {
          "scale": "mesoscopic"
        },
        "assumptions": [
          "spherical particle",
          "low Reynolds number"
        ],
        "references": [
          "Einstein 1905",
          "Sutherland 1905"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "diffusion-coefficient",
            "dim": {
              "L": 2,
              "M": 0,
              "T": -1,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "boltzmann-constant",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": -1,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "temperature",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 1,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "dynamic-viscosity",
              "dim": {
                "L": -1,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "particle-radius",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "boltzmann-constant": 1,
            "temperature": 1,
            "dynamic-viscosity": -1,
            "particle-radius": -1
          }
        }
      },
      {
        "id": "CE-kinetic-pressure",
        "name": "Kinetic pressure of an ideal gas",
        "domain": "statistical",
        "formula_latex": "P = \\tfrac{1}{3} n m \\langle v^2 \\rangle",
        "epistemicStatus": "scalar-up-to-constant",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "number-density",
                  "dim": {
                    "L": -3,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "molecular-mass",
                  "dim": {
                    "L": 0,
                    "M": 1,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            },
            {
              "kind": "symbol",
              "name": "mean-square-speed",
              "dim": {
                "L": 2,
                "M": 0,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "ideal gas",
          "isotropic velocity distribution"
        ],
        "references": [
          "Maxwell 1860",
          "Reif, Fundamentals of Statistical and Thermal Physics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "kinetic-pressure",
            "dim": {
              "L": -1,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "number-density",
              "dim": {
                "L": -3,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "molecular-mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "mean-square-speed",
              "dim": {
                "L": 2,
                "M": 0,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "number-density": 1,
            "molecular-mass": 1,
            "mean-square-speed": 1
          }
        }
      },
      {
        "id": "CE-mb-most-probable-speed",
        "name": "Maxwell-Boltzmann most-probable speed",
        "domain": "statistical",
        "formula_latex": "v_p = \\sqrt{2 k_B T/m}",
        "epistemicStatus": "dimensional",
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "Maxwell-Boltzmann distribution"
        ],
        "references": [
          "Maxwell 1860",
          "Reif, Fundamentals of Statistical and Thermal Physics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 0,
        "dimensional": {
          "target": {
            "name": "most-probable-speed",
            "dim": {
              "L": 1,
              "M": 0,
              "T": -1,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "boltzmann-constant",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": -1,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "temperature",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 1,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "molecular-mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": {
            "boltzmann-constant": 0.5,
            "temperature": 0.5,
            "molecular-mass": -0.5
          }
        }
      },
      {
        "id": "CE-bernoulli",
        "name": "Bernoulli equation",
        "domain": "mechanics",
        "formula_latex": "\\tfrac12 \\rho v^2 + \\rho g h + P = \\text{const}",
        "epistemicStatus": "scalar-up-to-constant",
        "scalarAst": {
          "kind": "op",
          "op": "+",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "density",
                  "dim": {
                    "L": -3,
                    "M": 1,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "op",
                  "op": "^",
                  "args": [
                    {
                      "kind": "symbol",
                      "name": "flow-velocity",
                      "dim": {
                        "L": 1,
                        "M": 0,
                        "T": -1,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    },
                    {
                      "kind": "symbol",
                      "name": "2",
                      "dim": {
                        "L": 0,
                        "M": 0,
                        "T": 0,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    }
                  ]
                }
              ]
            },
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "density",
                  "dim": {
                    "L": -3,
                    "M": 1,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "op",
                  "op": "*",
                  "args": [
                    {
                      "kind": "symbol",
                      "name": "gravitational-acceleration",
                      "dim": {
                        "L": 1,
                        "M": 0,
                        "T": -2,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    },
                    {
                      "kind": "symbol",
                      "name": "height",
                      "dim": {
                        "L": 1,
                        "M": 0,
                        "T": 0,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    }
                  ]
                }
              ]
            },
            {
              "kind": "symbol",
              "name": "static-pressure",
              "dim": {
                "L": -1,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "incompressible",
          "inviscid",
          "steady flow along a streamline"
        ],
        "references": [
          "Bernoulli 1738 Hydrodynamica"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 2,
        "dimensional": {
          "target": {
            "name": "bernoulli-total-pressure",
            "dim": {
              "L": -1,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "density",
              "dim": {
                "L": -3,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "flow-velocity",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "gravitational-acceleration",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "height",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "static-pressure",
              "dim": {
                "L": -1,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": null
        }
      },
      {
        "id": "CE-radioactive-decay",
        "name": "Radioactive decay law",
        "domain": "quantum",
        "formula_latex": "N = N_0 e^{-\\lambda t}",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "initial-nuclei",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "transcendental",
              "fn": "exp",
              "arg": {
                "kind": "op",
                "op": "*",
                "args": [
                  {
                    "kind": "symbol",
                    "name": "-1",
                    "dim": {
                      "L": 0,
                      "M": 0,
                      "T": 0,
                      "I": 0,
                      "Theta": 0,
                      "N": 0,
                      "J": 0
                    }
                  },
                  {
                    "kind": "op",
                    "op": "*",
                    "args": [
                      {
                        "kind": "symbol",
                        "name": "decay-constant",
                        "dim": {
                          "L": 0,
                          "M": 0,
                          "T": -1,
                          "I": 0,
                          "Theta": 0,
                          "N": 0,
                          "J": 0
                        }
                      },
                      {
                        "kind": "symbol",
                        "name": "elapsed-time",
                        "dim": {
                          "L": 0,
                          "M": 0,
                          "T": 1,
                          "I": 0,
                          "Theta": 0,
                          "N": 0,
                          "J": 0
                        }
                      }
                    ]
                  }
                ]
              }
            }
          ]
        },
        "regime": {
          "scale": "quantum"
        },
        "assumptions": [
          "first-order decay",
          "large-N statistical limit"
        ],
        "references": [
          "Rutherford & Soddy 1902"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 2,
        "dimensional": {
          "target": {
            "name": "remaining-nuclei",
            "dim": {
              "L": 0,
              "M": 0,
              "T": 0,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "initial-nuclei",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "decay-constant",
              "dim": {
                "L": 0,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "elapsed-time",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": null
        }
      },
      {
        "id": "CE-photoelectric",
        "name": "Photoelectric equation",
        "domain": "quantum",
        "formula_latex": "K_{\\max} = h f - W",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "-",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "planck-constant",
                  "dim": {
                    "L": 2,
                    "M": 1,
                    "T": -1,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "photon-frequency",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": -1,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            },
            {
              "kind": "symbol",
              "name": "work-function",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "quantum"
        },
        "assumptions": [
          "single-photon absorption",
          "above threshold (hf > W)"
        ],
        "references": [
          "Einstein 1905 Ann. Phys. 17:132"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 1,
        "dimensional": {
          "target": {
            "name": "photoelectron-max-energy",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "planck-constant",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "photon-frequency",
              "dim": {
                "L": 0,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "work-function",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": null
        }
      },
      {
        "id": "CE-carnot-efficiency",
        "name": "Carnot efficiency",
        "domain": "thermodynamics",
        "formula_latex": "\\eta = 1 - \\tfrac{T_c}{T_h}",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "-",
          "args": [
            {
              "kind": "symbol",
              "name": "1",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "op",
              "op": "/",
              "args": [
                {
                  "kind": "symbol",
                  "name": "cold-reservoir-temperature",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 1,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "symbol",
                  "name": "hot-reservoir-temperature",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 1,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "reversible cycle",
          "two heat reservoirs"
        ],
        "references": [
          "Carnot 1824 Réflexions sur la puissance motrice du feu"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 1,
        "dimensional": {
          "target": {
            "name": "carnot-efficiency",
            "dim": {
              "L": 0,
              "M": 0,
              "T": 0,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "cold-reservoir-temperature",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 1,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "hot-reservoir-temperature",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 1,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": null
        }
      },
      {
        "id": "CE-boltzmann-factor",
        "name": "Boltzmann factor",
        "domain": "statistical",
        "formula_latex": "e^{-E/k_B T}",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "transcendental",
          "fn": "exp",
          "arg": {
            "kind": "op",
            "op": "*",
            "args": [
              {
                "kind": "symbol",
                "name": "-1",
                "dim": {
                  "L": 0,
                  "M": 0,
                  "T": 0,
                  "I": 0,
                  "Theta": 0,
                  "N": 0,
                  "J": 0
                }
              },
              {
                "kind": "op",
                "op": "/",
                "args": [
                  {
                    "kind": "symbol",
                    "name": "state-energy",
                    "dim": {
                      "L": 2,
                      "M": 1,
                      "T": -2,
                      "I": 0,
                      "Theta": 0,
                      "N": 0,
                      "J": 0
                    }
                  },
                  {
                    "kind": "op",
                    "op": "*",
                    "args": [
                      {
                        "kind": "symbol",
                        "name": "boltzmann-constant",
                        "dim": {
                          "L": 2,
                          "M": 1,
                          "T": -2,
                          "I": 0,
                          "Theta": -1,
                          "N": 0,
                          "J": 0
                        }
                      },
                      {
                        "kind": "symbol",
                        "name": "temperature",
                        "dim": {
                          "L": 0,
                          "M": 0,
                          "T": 0,
                          "I": 0,
                          "Theta": 1,
                          "N": 0,
                          "J": 0
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "canonical ensemble",
          "thermal equilibrium"
        ],
        "references": [
          "Boltzmann 1868 Wien. Ber. 58:517"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 1,
        "dimensional": {
          "target": {
            "name": "boltzmann-factor",
            "dim": {
              "L": 0,
              "M": 0,
              "T": 0,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "state-energy",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "boltzmann-constant",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": -1,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "temperature",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 1,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": null
        }
      },
      {
        "id": "CE-lorentz-factor",
        "name": "Lorentz factor",
        "domain": "mechanics",
        "formula_latex": "\\gamma = \\left(1 - \\tfrac{v^2}{c^2}\\right)^{-1/2}",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "^",
          "args": [
            {
              "kind": "op",
              "op": "-",
              "args": [
                {
                  "kind": "symbol",
                  "name": "1",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "op",
                  "op": "/",
                  "args": [
                    {
                      "kind": "op",
                      "op": "^",
                      "args": [
                        {
                          "kind": "symbol",
                          "name": "velocity",
                          "dim": {
                            "L": 1,
                            "M": 0,
                            "T": -1,
                            "I": 0,
                            "Theta": 0,
                            "N": 0,
                            "J": 0
                          }
                        },
                        {
                          "kind": "symbol",
                          "name": "2",
                          "dim": {
                            "L": 0,
                            "M": 0,
                            "T": 0,
                            "I": 0,
                            "Theta": 0,
                            "N": 0,
                            "J": 0
                          }
                        }
                      ]
                    },
                    {
                      "kind": "op",
                      "op": "^",
                      "args": [
                        {
                          "kind": "symbol",
                          "name": "speed-of-light",
                          "dim": {
                            "L": 1,
                            "M": 0,
                            "T": -1,
                            "I": 0,
                            "Theta": 0,
                            "N": 0,
                            "J": 0
                          }
                        },
                        {
                          "kind": "symbol",
                          "name": "2",
                          "dim": {
                            "L": 0,
                            "M": 0,
                            "T": 0,
                            "I": 0,
                            "Theta": 0,
                            "N": 0,
                            "J": 0
                          }
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              "kind": "symbol",
              "name": "-0.5",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "special relativity",
          "inertial frames"
        ],
        "references": [
          "Einstein 1905 Ann. Phys. 17:891"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 1,
        "dimensional": {
          "target": {
            "name": "lorentz-factor",
            "dim": {
              "L": 0,
              "M": 0,
              "T": 0,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "velocity",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "speed-of-light",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": null
        }
      },
      {
        "id": "CE-compton-shift",
        "name": "Compton shift",
        "domain": "quantum",
        "formula_latex": "\\Delta\\lambda = \\tfrac{h}{m_e c}(1 - \\cos\\theta)",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "op",
              "op": "/",
              "args": [
                {
                  "kind": "symbol",
                  "name": "planck-constant",
                  "dim": {
                    "L": 2,
                    "M": 1,
                    "T": -1,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "op",
                  "op": "*",
                  "args": [
                    {
                      "kind": "symbol",
                      "name": "electron-mass",
                      "dim": {
                        "L": 0,
                        "M": 1,
                        "T": 0,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    },
                    {
                      "kind": "symbol",
                      "name": "speed-of-light",
                      "dim": {
                        "L": 1,
                        "M": 0,
                        "T": -1,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    }
                  ]
                }
              ]
            },
            {
              "kind": "op",
              "op": "-",
              "args": [
                {
                  "kind": "symbol",
                  "name": "1",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "transcendental",
                  "fn": "cos",
                  "arg": {
                    "kind": "symbol",
                    "name": "scattering-angle",
                    "dim": {
                      "L": 0,
                      "M": 0,
                      "T": 0,
                      "I": 0,
                      "Theta": 0,
                      "N": 0,
                      "J": 0
                    }
                  }
                }
              ]
            }
          ]
        },
        "regime": {
          "scale": "quantum"
        },
        "assumptions": [
          "elastic photon-electron scattering",
          "free electron at rest"
        ],
        "references": [
          "Compton 1923 Phys. Rev. 21:483"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 1,
        "dimensional": {
          "target": {
            "name": "compton-wavelength-shift",
            "dim": {
              "L": 1,
              "M": 0,
              "T": 0,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "planck-constant",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "electron-mass",
              "dim": {
                "L": 0,
                "M": 1,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "speed-of-light",
              "dim": {
                "L": 1,
                "M": 0,
                "T": -1,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "scattering-angle",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": null
        }
      },
      {
        "id": "CE-rydberg-formula",
        "name": "Rydberg formula",
        "domain": "quantum",
        "formula_latex": "\\tfrac{1}{\\lambda} = R\\left(\\tfrac{1}{n_1^2} - \\tfrac{1}{n_2^2}\\right)",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "rydberg-constant",
              "dim": {
                "L": -1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "op",
              "op": "-",
              "args": [
                {
                  "kind": "op",
                  "op": "^",
                  "args": [
                    {
                      "kind": "symbol",
                      "name": "lower-level-n",
                      "dim": {
                        "L": 0,
                        "M": 0,
                        "T": 0,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    },
                    {
                      "kind": "symbol",
                      "name": "-2",
                      "dim": {
                        "L": 0,
                        "M": 0,
                        "T": 0,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    }
                  ]
                },
                {
                  "kind": "op",
                  "op": "^",
                  "args": [
                    {
                      "kind": "symbol",
                      "name": "upper-level-n",
                      "dim": {
                        "L": 0,
                        "M": 0,
                        "T": 0,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    },
                    {
                      "kind": "symbol",
                      "name": "-2",
                      "dim": {
                        "L": 0,
                        "M": 0,
                        "T": 0,
                        "I": 0,
                        "Theta": 0,
                        "N": 0,
                        "J": 0
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },
        "regime": {
          "scale": "quantum"
        },
        "assumptions": [
          "hydrogen-like atom",
          "bound-state transition"
        ],
        "references": [
          "Rydberg 1890 / Balmer 1885"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 2,
        "dimensional": {
          "target": {
            "name": "inverse-transition-wavelength",
            "dim": {
              "L": -1,
              "M": 0,
              "T": 0,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "rydberg-constant",
              "dim": {
                "L": -1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "lower-level-n",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "upper-level-n",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": null
        }
      },
      {
        "id": "CE-snell-law",
        "name": "Snell's law",
        "domain": "electromagnetism",
        "formula_latex": "n_2 = n_1 \\sin\\theta_1 / \\sin\\theta_2",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "op",
              "op": "*",
              "args": [
                {
                  "kind": "symbol",
                  "name": "incident-index",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                },
                {
                  "kind": "transcendental",
                  "fn": "sin",
                  "arg": {
                    "kind": "symbol",
                    "name": "angle-of-incidence",
                    "dim": {
                      "L": 0,
                      "M": 0,
                      "T": 0,
                      "I": 0,
                      "Theta": 0,
                      "N": 0,
                      "J": 0
                    }
                  }
                }
              ]
            },
            {
              "kind": "transcendental",
              "fn": "sin",
              "arg": {
                "kind": "symbol",
                "name": "angle-of-refraction",
                "dim": {
                  "L": 0,
                  "M": 0,
                  "T": 0,
                  "I": 0,
                  "Theta": 0,
                  "N": 0,
                  "J": 0
                }
              }
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "geometric optics",
          "planar interface between isotropic media"
        ],
        "references": [
          "Snell 1621 / Descartes 1637"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 3,
        "dimensional": {
          "target": {
            "name": "refracted-index",
            "dim": {
              "L": 0,
              "M": 0,
              "T": 0,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "incident-index",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "angle-of-incidence",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "angle-of-refraction",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": null
        }
      },
      {
        "id": "CE-malus-law",
        "name": "Malus's law",
        "domain": "electromagnetism",
        "formula_latex": "I = I_0 \\cos^2\\theta",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "incident-intensity",
              "dim": {
                "L": 0,
                "M": 1,
                "T": -3,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "op",
              "op": "^",
              "args": [
                {
                  "kind": "transcendental",
                  "fn": "cos",
                  "arg": {
                    "kind": "symbol",
                    "name": "polarization-angle",
                    "dim": {
                      "L": 0,
                      "M": 0,
                      "T": 0,
                      "I": 0,
                      "Theta": 0,
                      "N": 0,
                      "J": 0
                    }
                  }
                },
                {
                  "kind": "symbol",
                  "name": "2",
                  "dim": {
                    "L": 0,
                    "M": 0,
                    "T": 0,
                    "I": 0,
                    "Theta": 0,
                    "N": 0,
                    "J": 0
                  }
                }
              ]
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "ideal linear polarizer",
          "coherent linearly-polarized incident light"
        ],
        "references": [
          "Malus 1809"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 1,
        "dimensional": {
          "target": {
            "name": "transmitted-intensity",
            "dim": {
              "L": 0,
              "M": 1,
              "T": -3,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "incident-intensity",
              "dim": {
                "L": 0,
                "M": 1,
                "T": -3,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "polarization-angle",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": null
        }
      },
      {
        "id": "CE-first-law-thermodynamics",
        "name": "First law of thermodynamics",
        "domain": "thermodynamics",
        "formula_latex": "Delta U = Q - W",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "-",
          "args": [
            {
              "kind": "symbol",
              "name": "heat-added",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "symbol",
              "name": "work-done-by-system",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "closed system",
          "sign convention: Q into the system, W done by the system"
        ],
        "references": [
          "Clausius 1850",
          "Callen, Thermodynamics"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 1,
        "dimensional": {
          "target": {
            "name": "internal-energy-change",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "heat-added",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "work-done-by-system",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": null
        }
      },
      {
        "id": "CE-boltzmann-entropy",
        "name": "Boltzmann entropy",
        "domain": "statistical",
        "formula_latex": "S = k_B ln W",
        "epistemicStatus": "fully-quantitative",
        "scalarAst": {
          "kind": "op",
          "op": "*",
          "args": [
            {
              "kind": "symbol",
              "name": "boltzmann-constant",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": -1,
                "N": 0,
                "J": 0
              }
            },
            {
              "kind": "transcendental",
              "fn": "ln",
              "arg": {
                "kind": "symbol",
                "name": "microstate-count",
                "dim": {
                  "L": 0,
                  "M": 0,
                  "T": 0,
                  "I": 0,
                  "Theta": 0,
                  "N": 0,
                  "J": 0
                }
              }
            }
          ]
        },
        "forms": {
          "logBase": "e"
        },
        "regime": {
          "scale": "mesoscopic"
        },
        "assumptions": [
          "microcanonical ensemble",
          "equiprobable microstates"
        ],
        "references": [
          "Boltzmann 1877 Wien. Ber. 76:373",
          "Planck 1901"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 1,
        "dimensional": {
          "target": {
            "name": "boltzmann-entropy",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -2,
              "I": 0,
              "Theta": -1,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "boltzmann-constant",
              "dim": {
                "L": 2,
                "M": 1,
                "T": -2,
                "I": 0,
                "Theta": -1,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "microstate-count",
              "dim": {
                "L": 0,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": null
        }
      },
      {
        "id": "CE-normal-distribution",
        "name": "Normal (Gaussian) distribution",
        "domain": "statistical",
        "formula_latex": "p(x) = \frac{1}{sigmasqrt{2pi}} e^{-(x-mu)^2 / 2sigma^2}",
        "epistemicStatus": "scalar-up-to-constant",
        "scalarAst": {
          "kind": "op",
          "op": "/",
          "args": [
            {
              "kind": "transcendental",
              "fn": "exp",
              "arg": {
                "kind": "op",
                "op": "*",
                "args": [
                  {
                    "kind": "symbol",
                    "name": "-1",
                    "dim": {
                      "L": 0,
                      "M": 0,
                      "T": 0,
                      "I": 0,
                      "Theta": 0,
                      "N": 0,
                      "J": 0
                    }
                  },
                  {
                    "kind": "op",
                    "op": "/",
                    "args": [
                      {
                        "kind": "op",
                        "op": "^",
                        "args": [
                          {
                            "kind": "symbol",
                            "name": "deviation-from-mean",
                            "dim": {
                              "L": 1,
                              "M": 0,
                              "T": 0,
                              "I": 0,
                              "Theta": 0,
                              "N": 0,
                              "J": 0
                            }
                          },
                          {
                            "kind": "symbol",
                            "name": "2",
                            "dim": {
                              "L": 0,
                              "M": 0,
                              "T": 0,
                              "I": 0,
                              "Theta": 0,
                              "N": 0,
                              "J": 0
                            }
                          }
                        ]
                      },
                      {
                        "kind": "op",
                        "op": "^",
                        "args": [
                          {
                            "kind": "symbol",
                            "name": "standard-deviation",
                            "dim": {
                              "L": 1,
                              "M": 0,
                              "T": 0,
                              "I": 0,
                              "Theta": 0,
                              "N": 0,
                              "J": 0
                            }
                          },
                          {
                            "kind": "symbol",
                            "name": "2",
                            "dim": {
                              "L": 0,
                              "M": 0,
                              "T": 0,
                              "I": 0,
                              "Theta": 0,
                              "N": 0,
                              "J": 0
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            },
            {
              "kind": "symbol",
              "name": "standard-deviation",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ]
        },
        "regime": {
          "scale": "classical"
        },
        "assumptions": [
          "sigma > 0",
          "variate taken length-dimensioned as the representative case"
        ],
        "references": [
          "Gauss 1809 Theoria Motus",
          "Laplace 1812 Théorie analytique des probabilités"
        ],
        "partnerBridges": [],
        "freeDimensionlessGroups": 1,
        "dimensional": {
          "target": {
            "name": "normal-probability-density",
            "dim": {
              "L": -1,
              "M": 0,
              "T": 0,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          },
          "governing": [
            {
              "name": "standard-deviation",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            },
            {
              "name": "deviation-from-mean",
              "dim": {
                "L": 1,
                "M": 0,
                "T": 0,
                "I": 0,
                "Theta": 0,
                "N": 0,
                "J": 0
              }
            }
          ],
          "monomial": null
        }
      }
    ],
    "gap": [
      "11",
      "14",
      "15",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
      "24",
      "25",
      "26",
      "27",
      "28",
      "30",
      "31",
      "32",
      "33",
      "34",
      "35",
      "36",
      "37",
      "38",
      "39",
      "40",
      "43",
      "44",
      "45",
      "46",
      "47",
      "48",
      "49",
      "50",
      "53",
      "54",
      "55",
      "56",
      "57",
      "58",
      "59",
      "60",
      "61",
      "62",
      "63",
      "64",
      "65"
    ]
  }
}

```

stderr:

```text

```

## C100

UTC: 2026-09-26T17:05:29.933036+00:00  
Exit: 0

```bash
upt eval '4*G*M/(c^2*b)*180*3600/pi' G=6.6743e-11 M=1.989e30 c=299792458 b=6.957e8
```

stdout:

```text
1.751710051769169

```

stderr:

```text

```

## C101

UTC: 2026-09-26T17:05:30.140431+00:00  
Exit: 0

```bash
upt coverage --json
```

stdout:

```text
{
  "command": "coverage",
  "epistemics": "(reads the catalog/graph/confrontation modules; fabricates nothing)",
  "result": {
    "bridges": [
      {
        "id": 11,
        "status": "established",
        "tier": "data-confronted",
        "hasDataConfrontation": true,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 5,
        "knownIssueCount": 0
      },
      {
        "id": 12,
        "status": "speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 5,
        "knownIssueCount": 1
      },
      {
        "id": 13,
        "status": "speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 8,
        "knownIssueCount": 2
      },
      {
        "id": 14,
        "status": "speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 1,
        "knownIssueCount": 0
      },
      {
        "id": 15,
        "status": "speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 9,
        "knownIssueCount": 1
      },
      {
        "id": 16,
        "status": "speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 10,
        "knownIssueCount": 3
      },
      {
        "id": 17,
        "status": "speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 5,
        "knownIssueCount": 1
      },
      {
        "id": 18,
        "status": "speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 4,
        "knownIssueCount": 1
      },
      {
        "id": 19,
        "status": "speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 3,
        "knownIssueCount": 2
      },
      {
        "id": 20,
        "status": "speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 5,
        "knownIssueCount": 1
      },
      {
        "id": 21,
        "status": "established",
        "tier": "data-confronted",
        "hasDataConfrontation": true,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 5,
        "knownIssueCount": 1
      },
      {
        "id": 22,
        "status": "speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 2,
        "knownIssueCount": 4
      },
      {
        "id": 23,
        "status": "speculative",
        "tier": "data-confronted",
        "hasDataConfrontation": true,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 8,
        "knownIssueCount": 1
      },
      {
        "id": 24,
        "status": "speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 10,
        "knownIssueCount": 1
      },
      {
        "id": 25,
        "status": "speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 9,
        "knownIssueCount": 1
      },
      {
        "id": 26,
        "status": "speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 4,
        "knownIssueCount": 1
      },
      {
        "id": 27,
        "status": "speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 5,
        "knownIssueCount": 1
      },
      {
        "id": 28,
        "status": "speculative",
        "tier": "encoded-only",
        "hasDataConfrontation": false,
        "hasGraphEdge": false,
        "dimensionalSignaturePresent": true,
        "citationCount": 4,
        "knownIssueCount": 0
      },
      {
        "id": 29,
        "status": "speculative",
        "tier": "encoded-only",
        "hasDataConfrontation": false,
        "hasGraphEdge": false,
        "dimensionalSignaturePresent": true,
        "citationCount": 6,
        "knownIssueCount": 1
      },
      {
        "id": 30,
        "status": "speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 6,
        "knownIssueCount": 1
      },
      {
        "id": 31,
        "status": "speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 5,
        "knownIssueCount": 1
      },
      {
        "id": 32,
        "status": "speculative",
        "tier": "encoded-only",
        "hasDataConfrontation": false,
        "hasGraphEdge": false,
        "dimensionalSignaturePresent": true,
        "citationCount": 4,
        "knownIssueCount": 1
      },
      {
        "id": 33,
        "status": "speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 5,
        "knownIssueCount": 2
      },
      {
        "id": 34,
        "status": "established",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 3,
        "knownIssueCount": 1
      },
      {
        "id": 35,
        "status": "established",
        "tier": "data-confronted",
        "hasDataConfrontation": true,
        "hasGraphEdge": false,
        "dimensionalSignaturePresent": true,
        "citationCount": 4,
        "knownIssueCount": 1
      },
      {
        "id": 36,
        "status": "speculative",
        "tier": "data-confronted",
        "hasDataConfrontation": true,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 8,
        "knownIssueCount": 2
      },
      {
        "id": 37,
        "status": "speculative",
        "tier": "data-confronted",
        "hasDataConfrontation": true,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 8,
        "knownIssueCount": 2
      },
      {
        "id": 38,
        "status": "speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 6,
        "knownIssueCount": 1
      },
      {
        "id": 39,
        "status": "speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 6,
        "knownIssueCount": 3
      },
      {
        "id": 40,
        "status": "established",
        "tier": "encoded-only",
        "hasDataConfrontation": false,
        "hasGraphEdge": false,
        "dimensionalSignaturePresent": true,
        "citationCount": 3,
        "knownIssueCount": 0
      },
      {
        "id": 41,
        "status": "speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 1,
        "knownIssueCount": 1
      },
      {
        "id": 42,
        "status": "highly-speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 7,
        "knownIssueCount": 1
      },
      {
        "id": 43,
        "status": "speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 6,
        "knownIssueCount": 1
      },
      {
        "id": 44,
        "status": "speculative",
        "tier": "encoded-only",
        "hasDataConfrontation": false,
        "hasGraphEdge": false,
        "dimensionalSignaturePresent": true,
        "citationCount": 5,
        "knownIssueCount": 1
      },
      {
        "id": 45,
        "status": "speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 1,
        "knownIssueCount": 1
      },
      {
        "id": 46,
        "status": "highly-speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 4,
        "knownIssueCount": 1
      },
      {
        "id": 47,
        "status": "speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 5,
        "knownIssueCount": 0
      },
      {
        "id": 48,
        "status": "speculative",
        "tier": "data-confronted",
        "hasDataConfrontation": true,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 6,
        "knownIssueCount": 1
      },
      {
        "id": 49,
        "status": "speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 4,
        "knownIssueCount": 1
      },
      {
        "id": 50,
        "status": "highly-speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 4,
        "knownIssueCount": 1
      },
      {
        "id": 51,
        "status": "established",
        "tier": "data-confronted",
        "hasDataConfrontation": true,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 4,
        "knownIssueCount": 0
      },
      {
        "id": 52,
        "status": "established",
        "tier": "data-confronted",
        "hasDataConfrontation": true,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 4,
        "knownIssueCount": 0
      },
      {
        "id": 53,
        "status": "established",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 3,
        "knownIssueCount": 0
      },
      {
        "id": 54,
        "status": "speculative",
        "tier": "graph-computable",
        "hasDataConfrontation": false,
        "hasGraphEdge": true,
        "dimensionalSignaturePresent": true,
        "citationCount": 3,
        "knownIssueCount": 0
      },
      {
        "id": 55,
        "status": "established",
        "tier": "data-confronted",
        "hasDataConfrontation": true,
        "hasGraphEdge": false,
        "dimensionalSignaturePresent": true,
        "citationCount": 3,
        "knownIssueCount": 0
      },
      {
        "id": 56,
        "status": "established",
        "tier": "data-confronted",
        "hasDataConfrontation": true,
        "hasGraphEdge": false,
        "dimensionalSignaturePresent": true,
        "citationCount": 3,
        "knownIssueCount": 0
      },
      {
        "id": 57,
        "status": "established",
        "tier": "encoded-only",
        "hasDataConfrontation": false,
        "hasGraphEdge": false,
        "dimensionalSignaturePresent": true,
        "citationCount": 3,
        "knownIssueCount": 0
      },
      {
        "id": 58,
        "status": "established",
        "tier": "data-confronted",
        "hasDataConfrontation": true,
        "hasGraphEdge": false,
        "dimensionalSignaturePresent": true,
        "citationCount": 3,
        "knownIssueCount": 0
      },
      {
        "id": 59,
        "status": "established",
        "tier": "data-confronted",
        "hasDataConfrontation": true,
        "hasGraphEdge": false,
        "dimensionalSignaturePresent": true,
        "citationCount": 3,
        "knownIssueCount": 0
      },
      {
        "id": 60,
        "status": "established",
        "tier": "data-confronted",
        "hasDataConfrontation": true,
        "hasGraphEdge": false,
        "dimensionalSignaturePresent": true,
        "citationCount": 3,
        "knownIssueCount": 0
      },
      {
        "id": 61,
        "status": "established",
        "tier": "data-confronted",
        "hasDataConfrontation": true,
        "hasGraphEdge": false,
        "dimensionalSignaturePresent": true,
        "citationCount": 3,
        "knownIssueCount": 0
      },
      {
        "id": 62,
        "status": "established",
        "tier": "data-confronted",
        "hasDataConfrontation": true,
        "hasGraphEdge": false,
        "dimensionalSignaturePresent": true,
        "citationCount": 3,
        "knownIssueCount": 0
      },
      {
        "id": 63,
        "status": "established",
        "tier": "data-confronted",
        "hasDataConfrontation": true,
        "hasGraphEdge": false,
        "dimensionalSignaturePresent": true,
        "citationCount": 3,
        "knownIssueCount": 0
      },
      {
        "id": 64,
        "status": "established",
        "tier": "data-confronted",
        "hasDataConfrontation": true,
        "hasGraphEdge": false,
        "dimensionalSignaturePresent": true,
        "citationCount": 3,
        "knownIssueCount": 0
      },
      {
        "id": 65,
        "status": "established",
        "tier": "data-confronted",
        "hasDataConfrontation": true,
        "hasGraphEdge": false,
        "dimensionalSignaturePresent": true,
        "citationCount": 2,
        "knownIssueCount": 0
      }
    ],
    "total": 55,
    "byTier": {
      "data-confronted": 19,
      "graph-computable": 30,
      "encoded-only": 6,
      "thin": 0
    },
    "withoutDataConfrontation": 36,
    "withoutCitation": 0,
    "thinBridges": []
  }
}

```

stderr:

```text

```

## C102

UTC: 2026-09-26T17:05:31.147588+00:00  
Exit: 0

```bash
upt discover --source=catalog --json
```

stdout:

```text
{
  "command": "discover",
  "source": "catalog",
  "options": {},
  "epistemics": "⚠ a REVIEW SURFACE: `promising` means \"worth a physicist's minute\", not \"true\".\n  Each candidate hypothesises an identification a≡b and tests its consequences.",
  "result": [
    {
      "a": "landauer-erasure-energy",
      "b": "inflation-hubble-energy",
      "dim": "[energy]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [
        "inflation-hubble-energy"
      ],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "promising",
      "score": 7,
      "axisChecked": false,
      "axisClashes": [],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "information",
        "mechanics",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "consequence": {
        "signal": "inconclusive",
        "evidence": []
      },
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)",
          "axis (regime attributes unresolved)",
          "consequence: inconclusive"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "landauer-erasure-energy",
      "b": "barrier-height",
      "dim": "[energy]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [
        "barrier-height"
      ],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": 1.0427519804209489,
      "magnitudeChecked": true,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "promising",
      "score": 6,
      "axisChecked": false,
      "axisClashes": [],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "information",
        "mechanics",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "consequence": {
        "signal": "inconclusive",
        "evidence": []
      },
      "grounding": {
        "passed": [
          "numerical-consistency",
          "magnitude (1.0 orders)"
        ],
        "gaps": [
          "axis (regime attributes unresolved)",
          "consequence: inconclusive"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "landauer-erasure-energy",
      "b": "dark-fermion-mass",
      "dim": "[energy]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [
        "dark-fermion-mass"
      ],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "promising",
      "score": 6,
      "axisChecked": false,
      "axisClashes": [],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "information",
        "mechanics",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "consequence": {
        "signal": "novel-consequence",
        "evidence": [
          {
            "target": "temperature",
            "governing": [
              "yukawa-coupling",
              "vacuum-expectation-value"
            ],
            "derivedNormalForm": "/(*(stub:yukawa-coupling,sym:vacuum-expectation-value),sym:k_B)",
            "canonicalMatch": null,
            "sourceEquationIds": [
              "BE-18",
              "BE-16"
            ]
          }
        ]
      },
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)",
          "axis (regime attributes unresolved)",
          "consequence: novel (unadjudicated)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "mass",
      "b": "scalar-field-reference",
      "dim": "[mass]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [
        "scalar-field-reference"
      ],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "promising",
      "score": 6,
      "axisChecked": false,
      "axisClashes": [],
      "canonicalKinds": [
        "quantum"
      ],
      "touchesCanonical": true,
      "consequence": {
        "signal": "inconclusive",
        "evidence": []
      },
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)",
          "axis (regime attributes unresolved)",
          "consequence: inconclusive"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "mass",
      "b": "scalar-field-value",
      "dim": "[mass]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [
        "scalar-field-value"
      ],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "promising",
      "score": 6,
      "axisChecked": false,
      "axisClashes": [],
      "canonicalKinds": [
        "quantum"
      ],
      "touchesCanonical": true,
      "consequence": {
        "signal": "inconclusive",
        "evidence": []
      },
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)",
          "axis (regime attributes unresolved)",
          "consequence: inconclusive"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "thermal-wavelength",
      "b": "boundary-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [
        "boundary-length"
      ],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "promising",
      "score": 6,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": true,
      "consequence": {
        "signal": "inconclusive",
        "evidence": []
      },
      "grounding": {
        "passed": [
          "numerical-consistency",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [
          "magnitude (no representative value)",
          "consequence: inconclusive"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "thermal-wavelength",
      "b": "planck-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [
        "planck-length"
      ],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": 1.099278395424676,
      "magnitudeChecked": true,
      "magnitudeUsedAnchor": true,
      "magnitudeAnchorInvariant": true,
      "subsuming": false,
      "verdict": "promising",
      "score": 6,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": true,
      "consequence": {
        "signal": "inconclusive",
        "evidence": []
      },
      "grounding": {
        "passed": [
          "numerical-consistency",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [
          "magnitude (anchor-invariant: the graph fixes this ratio at every anchor, so the match is an identity, not evidence)",
          "consequence: inconclusive"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "boundary-length",
      "b": "quantum-correlation-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 6,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "boundary-length",
      "b": "reference-correlation-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 6,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "decoherence-rate",
      "b": "hubble-rate",
      "dim": "[frequency]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 6,
      "axisChecked": false,
      "axisClashes": [],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "mechanics"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)",
          "axis (regime attributes unresolved)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "decoherence-rate",
      "b": "mutation-rate",
      "dim": "[frequency]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 6,
      "axisChecked": false,
      "axisClashes": [],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "mechanics"
      ],
      "touchesCanonical": false,
      "adjudication": {
        "id": "decoherence-rate~mutation-rate",
        "verdict": "decoy",
        "grounds": "Same units, no shared meaning; unanimous. A decoherence rate (loss of quantum phase to the environment) vs. a mutation rate (frequency of a permanent, classical change to a DNA sequence). Same units, no shared physical meaning — decoherence may precede a mutation, but they are not one quantity.",
        "source": "docs/research/orphan-connector-adjudication.md",
        "date": "2026-06-21"
      },
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)",
          "axis (regime attributes unresolved)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "effective-mass",
      "b": "reference-mass",
      "dim": "[mass]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 6,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "quantum"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "effective-mass",
      "b": "swampland-tower-mass",
      "dim": "[mass]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 6,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "quantum"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "effective-mass",
      "b": "tunneling-mass",
      "dim": "[mass]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 6,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "quantum"
      ],
      "touchesCanonical": false,
      "adjudication": {
        "id": "effective-mass~tunneling-mass",
        "verdict": "decoy",
        "grounds": "Different particles/Hamiltonians; unanimous. A proton's inertia in a specific biomolecular potential vs. an emergent electronic quasiparticle's effective mass in a strongly-correlated metal. Different particles, different Hamiltonians, unrelated scales.",
        "source": "docs/research/orphan-connector-adjudication.md",
        "date": "2026-06-21"
      },
      "grounding": {
        "passed": [
          "numerical-consistency",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "planck-length",
      "b": "quantum-correlation-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 6,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "planck-length",
      "b": "reference-correlation-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 6,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "relaxation-rate",
      "b": "hubble-rate",
      "dim": "[frequency]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 6,
      "axisChecked": false,
      "axisClashes": [],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "mechanics"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)",
          "axis (regime attributes unresolved)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "relaxation-rate",
      "b": "mutation-rate",
      "dim": "[frequency]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 6,
      "axisChecked": false,
      "axisClashes": [],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "mechanics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)",
          "axis (regime attributes unresolved)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "barrier-width",
      "b": "quantum-correlation-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 5,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "barrier-width",
      "b": "reference-correlation-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 5,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "boundary-entanglement-entropy",
      "b": "wormhole-entanglement-entropy",
      "dim": "[entropy]",
      "touchesCore": false,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 5,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "general-relativity",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "boundary-length",
      "b": "planck-length",
      "dim": "[length]",
      "touchesCore": false,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 5,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "decoherence-rate",
      "b": "attempt-frequency",
      "dim": "[frequency]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 5,
      "axisChecked": false,
      "axisClashes": [],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "mechanics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)",
          "axis (regime attributes unresolved)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "effective-mass",
      "b": "scalar-field-reference",
      "dim": "[mass]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 5,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "quantum"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "effective-mass",
      "b": "scalar-field-value",
      "dim": "[mass]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 5,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "quantum"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "relaxation-rate",
      "b": "attempt-frequency",
      "dim": "[frequency]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 5,
      "axisChecked": false,
      "axisClashes": [],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "mechanics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)",
          "axis (regime attributes unresolved)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "shapiro-delay",
      "b": "time",
      "dim": "[time]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 5,
      "axisChecked": false,
      "axisClashes": [],
      "canonicalKinds": [
        "electromagnetism",
        "gravitation",
        "mechanics",
        "quantum"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)",
          "axis (regime attributes unresolved)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "superposition-extent",
      "b": "barrier-width",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 5,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "superposition-extent",
      "b": "boundary-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 5,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "superposition-extent",
      "b": "planck-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 5,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "time",
      "b": "quench-timescale",
      "dim": "[time]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 5,
      "axisChecked": false,
      "axisClashes": [],
      "canonicalKinds": [
        "electromagnetism",
        "gravitation",
        "mechanics",
        "quantum"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)",
          "axis (regime attributes unresolved)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "tunneling-mass",
      "b": "reference-mass",
      "dim": "[mass]",
      "touchesCore": false,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 5,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "quantum"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "tunneling-mass",
      "b": "swampland-tower-mass",
      "dim": "[mass]",
      "touchesCore": false,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 5,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "quantum"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "boundary-length",
      "b": "barrier-width",
      "dim": "[length]",
      "touchesCore": false,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 4,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "brane-tension",
      "b": "lambda-mass-density",
      "dim": "[L^-3 M]",
      "touchesCore": false,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 4,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "mechanics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "dark-fermion-mass",
      "b": "barrier-height",
      "dim": "[energy]",
      "touchesCore": false,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 4,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "information",
        "mechanics",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "tunneling-mass",
      "b": "scalar-field-reference",
      "dim": "[mass]",
      "touchesCore": false,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 4,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "quantum"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "tunneling-mass",
      "b": "scalar-field-value",
      "dim": "[mass]",
      "touchesCore": false,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "inert",
      "score": 4,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "quantum"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "mass",
      "b": "reference-mass",
      "dim": "[mass]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [
        "reference-mass"
      ],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": true,
      "verdict": "inert",
      "score": 0,
      "axisChecked": false,
      "axisClashes": [],
      "canonicalKinds": [
        "quantum"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)",
          "axis (regime attributes unresolved)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "mass",
      "b": "swampland-tower-mass",
      "dim": "[mass]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [
        "swampland-tower-mass"
      ],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": true,
      "verdict": "inert",
      "score": 0,
      "axisChecked": false,
      "axisClashes": [],
      "canonicalKinds": [
        "quantum"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)",
          "axis (regime attributes unresolved)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "mass-density",
      "b": "lambda-mass-density",
      "dim": "[L^-3 M]",
      "touchesCore": false,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": true,
      "verdict": "inert",
      "score": 0,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "mechanics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "time",
      "b": "microscopic-relaxation-time",
      "dim": "[time]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": true,
      "verdict": "inert",
      "score": 0,
      "axisChecked": false,
      "axisClashes": [],
      "canonicalKinds": [
        "electromagnetism",
        "gravitation",
        "mechanics",
        "quantum"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)",
          "axis (regime attributes unresolved)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "attempt-frequency",
      "b": "hubble-rate",
      "dim": "[frequency]",
      "touchesCore": false,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": 30.657577319177793,
      "magnitudeChecked": true,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "magnitude-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: quantum ≠ cosmological"
      ],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "mechanics"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "magnitude (30.7 orders)"
        ],
        "gaps": [],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "barrier-height",
      "b": "planck-mass-energy",
      "dim": "[energy]",
      "touchesCore": false,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": 28.78710609303657,
      "magnitudeChecked": true,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "magnitude-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "information",
        "mechanics",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "magnitude (28.8 orders)",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "barrier-width",
      "b": "planck-length",
      "dim": "[length]",
      "touchesCore": false,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": 24.79155864356143,
      "magnitudeChecked": true,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "magnitude-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "magnitude (24.8 orders)",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "donor-acceptor-distance",
      "b": "planck-length",
      "dim": "[length]",
      "touchesCore": false,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": 26.49052864789745,
      "magnitudeChecked": true,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "magnitude-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: electromagnetic ≠ gravitational",
        "scale: mesoscopic ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "magnitude (26.5 orders)"
        ],
        "gaps": [],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "foerster-radius",
      "b": "planck-length",
      "dim": "[length]",
      "touchesCore": false,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": 26.49052864789745,
      "magnitudeChecked": true,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "magnitude-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: electromagnetic ≠ gravitational",
        "scale: mesoscopic ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "magnitude (26.5 orders)"
        ],
        "gaps": [],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "grw-localization-rate",
      "b": "attempt-frequency",
      "dim": "[frequency]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [
        "attempt-frequency"
      ],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": 29,
      "magnitudeChecked": true,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "magnitude-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "mechanics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "magnitude (29.0 orders)",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "landauer-erasure-energy",
      "b": "planck-mass-energy",
      "dim": "[energy]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [
        "planck-mass-energy"
      ],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": 29.82985807345752,
      "magnitudeChecked": true,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "magnitude-clash",
      "score": -1,
      "axisChecked": false,
      "axisClashes": [],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "information",
        "mechanics",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "magnitude (29.8 orders)"
        ],
        "gaps": [
          "axis (regime attributes unresolved)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "landauer-erasure-energy",
      "b": "vacuum-expectation-value",
      "dim": "[energy]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [
        "vacuum-expectation-value"
      ],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": 13.133098223926616,
      "magnitudeChecked": true,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "magnitude-clash",
      "score": -1,
      "axisChecked": false,
      "axisClashes": [],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "information",
        "mechanics",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "magnitude (13.1 orders)"
        ],
        "gaps": [
          "axis (regime attributes unresolved)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "mass",
      "b": "planck-mass",
      "dim": "[mass]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [
        "planck-mass"
      ],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": 37.96097589209829,
      "magnitudeChecked": true,
      "magnitudeUsedAnchor": true,
      "magnitudeAnchorInvariant": false,
      "subsuming": true,
      "verdict": "magnitude-clash",
      "score": -1,
      "axisChecked": false,
      "axisClashes": [],
      "canonicalKinds": [
        "quantum"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "magnitude (38.0 orders, anchor-derived)"
        ],
        "gaps": [
          "axis (regime attributes unresolved)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "mass",
      "b": "tunneling-mass",
      "dim": "[mass]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [
        "tunneling-mass"
      ],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": 57.07513884216204,
      "magnitudeChecked": true,
      "magnitudeUsedAnchor": true,
      "magnitudeAnchorInvariant": false,
      "subsuming": true,
      "verdict": "magnitude-clash",
      "score": -1,
      "axisChecked": false,
      "axisClashes": [],
      "canonicalKinds": [
        "quantum"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "magnitude (57.1 orders, anchor-derived)"
        ],
        "gaps": [
          "axis (regime attributes unresolved)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "schwarzschild-radius",
      "b": "barrier-width",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [
        "barrier-width"
      ],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": 13.470429096590323,
      "magnitudeChecked": true,
      "magnitudeUsedAnchor": true,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "magnitude-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: classical ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "magnitude (13.5 orders, anchor-derived)"
        ],
        "gaps": [],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "schwarzschild-radius",
      "b": "donor-acceptor-distance",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [
        "donor-acceptor-distance"
      ],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": 11.771459092254304,
      "magnitudeChecked": true,
      "magnitudeUsedAnchor": true,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "magnitude-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: gravitational ≠ electromagnetic",
        "scale: classical ≠ mesoscopic"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "magnitude (11.8 orders, anchor-derived)"
        ],
        "gaps": [],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "schwarzschild-radius",
      "b": "foerster-radius",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [
        "foerster-radius"
      ],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": 11.771459092254304,
      "magnitudeChecked": true,
      "magnitudeUsedAnchor": true,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "magnitude-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: gravitational ≠ electromagnetic",
        "scale: classical ≠ mesoscopic"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "magnitude (11.8 orders, anchor-derived)"
        ],
        "gaps": [],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "schwarzschild-radius",
      "b": "planck-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [
        "planck-length"
      ],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": 38.26198774015175,
      "magnitudeChecked": true,
      "magnitudeUsedAnchor": true,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "magnitude-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: classical ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "magnitude (38.3 orders, anchor-derived)"
        ],
        "gaps": [],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "thermal-wavelength",
      "b": "barrier-width",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [
        "barrier-width"
      ],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": 23.692280248136754,
      "magnitudeChecked": true,
      "magnitudeUsedAnchor": true,
      "magnitudeAnchorInvariant": true,
      "subsuming": false,
      "verdict": "magnitude-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [
          "magnitude (anchor-invariant: the graph fixes this ratio at every anchor, so the match is an identity, not evidence)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "thermal-wavelength",
      "b": "donor-acceptor-distance",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [
        "donor-acceptor-distance"
      ],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": 25.391250252472773,
      "magnitudeChecked": true,
      "magnitudeUsedAnchor": true,
      "magnitudeAnchorInvariant": true,
      "subsuming": false,
      "verdict": "magnitude-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: quantum ≠ mesoscopic"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (anchor-invariant: the graph fixes this ratio at every anchor, so the match is an identity, not evidence)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "thermal-wavelength",
      "b": "foerster-radius",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [
        "foerster-radius"
      ],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": 25.391250252472773,
      "magnitudeChecked": true,
      "magnitudeUsedAnchor": true,
      "magnitudeAnchorInvariant": true,
      "subsuming": false,
      "verdict": "magnitude-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: quantum ≠ mesoscopic"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (anchor-invariant: the graph fixes this ratio at every anchor, so the match is an identity, not evidence)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "tunneling-mass",
      "b": "planck-mass",
      "dim": "[mass]",
      "touchesCore": false,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": 19.114162950063747,
      "magnitudeChecked": true,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "magnitude-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "quantum"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "magnitude (19.1 orders)",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "vacuum-expectation-value",
      "b": "barrier-height",
      "dim": "[energy]",
      "touchesCore": false,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": 12.090346243505667,
      "magnitudeChecked": true,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "magnitude-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "information",
        "mechanics",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "magnitude (12.1 orders)",
          "axis-compatible (≥1 regime axis)"
        ],
        "gaps": [],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "vacuum-expectation-value",
      "b": "planck-mass-energy",
      "dim": "[energy]",
      "touchesCore": false,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": 16.696759849530903,
      "magnitudeChecked": true,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "magnitude-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: weak ≠ gravitational"
      ],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "information",
        "mechanics",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "magnitude (16.7 orders)"
        ],
        "gaps": [],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "active-noise-energy",
      "b": "inflation-hubble-energy",
      "dim": "[energy]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: emergent ≠ gravitational",
        "scale: mesoscopic ≠ cosmological"
      ],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "information",
        "mechanics",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "active-noise-energy",
      "b": "planck-mass-energy",
      "dim": "[energy]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: emergent ≠ gravitational",
        "scale: mesoscopic ≠ quantum"
      ],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "information",
        "mechanics",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "barrier-height",
      "b": "active-noise-energy",
      "dim": "[energy]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: quantum ≠ mesoscopic"
      ],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "information",
        "mechanics",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "barrier-height",
      "b": "inflation-hubble-energy",
      "dim": "[energy]",
      "touchesCore": false,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: quantum ≠ cosmological"
      ],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "information",
        "mechanics",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "boundary-length",
      "b": "donor-acceptor-distance",
      "dim": "[length]",
      "touchesCore": false,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: quantum ≠ mesoscopic"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "boundary-length",
      "b": "foerster-radius",
      "dim": "[length]",
      "touchesCore": false,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: quantum ≠ mesoscopic"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "carrier-density",
      "b": "dark-species-density",
      "dim": "[L^-3]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: quantum ≠ cosmological"
      ],
      "canonicalKinds": [],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "carrier-density",
      "b": "neutron-density",
      "dim": "[L^-3]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: quantum ≠ cosmological"
      ],
      "canonicalKinds": [],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "carrier-density",
      "b": "nucleon-yield-density",
      "dim": "[L^-3]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: quantum ≠ cosmological"
      ],
      "canonicalKinds": [],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "carrier-density",
      "b": "proton-density",
      "dim": "[L^-3]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: quantum ≠ cosmological"
      ],
      "canonicalKinds": [],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "coarsening-length",
      "b": "barrier-width",
      "dim": "[length]",
      "touchesCore": false,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: mesoscopic ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "coarsening-length",
      "b": "boundary-length",
      "dim": "[length]",
      "touchesCore": false,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: mesoscopic ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "coarsening-length",
      "b": "donor-acceptor-distance",
      "dim": "[length]",
      "touchesCore": false,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: emergent ≠ electromagnetic"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "coarsening-length",
      "b": "foerster-radius",
      "dim": "[length]",
      "touchesCore": false,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: emergent ≠ electromagnetic"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "coarsening-length",
      "b": "planck-length",
      "dim": "[length]",
      "touchesCore": false,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: emergent ≠ gravitational",
        "scale: mesoscopic ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "coarsening-length",
      "b": "quantum-correlation-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: mesoscopic ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "adjudication": {
        "id": "coarsening-length~quantum-correlation-length",
        "verdict": "decoy",
        "grounds": "Non-equilibrium vs equilibrium length; unanimous. A coarsening length is a non-equilibrium domain size formed by quenching through a critical point; the quantum correlation length ξ is an equilibrium static property at it. Different processes — not the same length.",
        "source": "docs/research/orphan-connector-adjudication.md",
        "date": "2026-06-21"
      },
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "coarsening-length",
      "b": "reference-correlation-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: mesoscopic ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "critical-density",
      "b": "lambda-mass-density",
      "dim": "[L^-3 M]",
      "touchesCore": false,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: quantum ≠ cosmological"
      ],
      "canonicalKinds": [
        "mechanics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "dark-fermion-mass",
      "b": "active-noise-energy",
      "dim": "[energy]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: weak ≠ emergent",
        "scale: quantum ≠ mesoscopic"
      ],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "information",
        "mechanics",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "dark-fermion-mass",
      "b": "inflation-hubble-energy",
      "dim": "[energy]",
      "touchesCore": false,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: weak ≠ gravitational",
        "scale: quantum ≠ cosmological"
      ],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "information",
        "mechanics",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "dark-fermion-mass",
      "b": "planck-mass-energy",
      "dim": "[energy]",
      "touchesCore": false,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: weak ≠ gravitational"
      ],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "information",
        "mechanics",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "defect-rest-mass",
      "b": "planck-mass",
      "dim": "[mass]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: cosmological ≠ quantum"
      ],
      "canonicalKinds": [
        "quantum"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "defect-rest-mass",
      "b": "reference-mass",
      "dim": "[mass]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: cosmological ≠ quantum"
      ],
      "canonicalKinds": [
        "quantum"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "defect-rest-mass",
      "b": "scalar-field-reference",
      "dim": "[mass]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: cosmological ≠ quantum"
      ],
      "canonicalKinds": [
        "quantum"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "defect-rest-mass",
      "b": "scalar-field-value",
      "dim": "[mass]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: cosmological ≠ quantum"
      ],
      "canonicalKinds": [
        "quantum"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "defect-rest-mass",
      "b": "swampland-tower-mass",
      "dim": "[mass]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: cosmological ≠ quantum"
      ],
      "canonicalKinds": [
        "quantum"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "donor-acceptor-distance",
      "b": "barrier-width",
      "dim": "[length]",
      "touchesCore": false,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": 1.6989700043360187,
      "magnitudeChecked": true,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: mesoscopic ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "magnitude (1.7 orders)"
        ],
        "gaps": [],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "donor-acceptor-distance",
      "b": "quantum-correlation-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: mesoscopic ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "donor-acceptor-distance",
      "b": "reference-correlation-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: mesoscopic ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "effective-mass",
      "b": "planck-mass",
      "dim": "[mass]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: electromagnetic ≠ gravitational"
      ],
      "canonicalKinds": [
        "quantum"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "far-radius",
      "b": "barrier-width",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: classical ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "far-radius",
      "b": "boundary-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: classical ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "far-radius",
      "b": "coarsening-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: gravitational ≠ emergent",
        "scale: classical ≠ mesoscopic"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "far-radius",
      "b": "donor-acceptor-distance",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: gravitational ≠ electromagnetic",
        "scale: classical ≠ mesoscopic"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "far-radius",
      "b": "foerster-radius",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: gravitational ≠ electromagnetic",
        "scale: classical ≠ mesoscopic"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "far-radius",
      "b": "planck-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: classical ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "foerster-radius",
      "b": "barrier-width",
      "dim": "[length]",
      "touchesCore": false,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": 1.6989700043360187,
      "magnitudeChecked": true,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: mesoscopic ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "magnitude (1.7 orders)"
        ],
        "gaps": [],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "foerster-radius",
      "b": "quantum-correlation-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: mesoscopic ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "foerster-radius",
      "b": "reference-correlation-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: mesoscopic ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "grw-localization-rate",
      "b": "hubble-rate",
      "dim": "[frequency]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [
        "hubble-rate"
      ],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": 1.6575773191777934,
      "magnitudeChecked": true,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: quantum ≠ cosmological"
      ],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "mechanics"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency",
          "magnitude (1.7 orders)"
        ],
        "gaps": [],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "grw-localization-rate",
      "b": "mutation-rate",
      "dim": "[frequency]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [
        "mutation-rate"
      ],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: quantum ≠ mesoscopic"
      ],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "mechanics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "impact-parameter",
      "b": "barrier-width",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: classical ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "impact-parameter",
      "b": "boundary-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: classical ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "impact-parameter",
      "b": "coarsening-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: gravitational ≠ emergent",
        "scale: classical ≠ mesoscopic"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "impact-parameter",
      "b": "donor-acceptor-distance",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: gravitational ≠ electromagnetic",
        "scale: classical ≠ mesoscopic"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "impact-parameter",
      "b": "foerster-radius",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: gravitational ≠ electromagnetic",
        "scale: classical ≠ mesoscopic"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "impact-parameter",
      "b": "planck-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: classical ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "minimal-surface-area",
      "b": "wormhole-cross-section-area",
      "dim": "[area]",
      "touchesCore": false,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: classical ≠ quantum"
      ],
      "canonicalKinds": [
        "quantum"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "mutation-rate",
      "b": "hubble-rate",
      "dim": "[frequency]",
      "touchesCore": false,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: mesoscopic ≠ cosmological"
      ],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "mechanics"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "near-radius",
      "b": "barrier-width",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: classical ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "near-radius",
      "b": "boundary-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: classical ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "near-radius",
      "b": "coarsening-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: gravitational ≠ emergent",
        "scale: classical ≠ mesoscopic"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "near-radius",
      "b": "donor-acceptor-distance",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: gravitational ≠ electromagnetic",
        "scale: classical ≠ mesoscopic"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "near-radius",
      "b": "foerster-radius",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: gravitational ≠ electromagnetic",
        "scale: classical ≠ mesoscopic"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "near-radius",
      "b": "planck-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: classical ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "schwarzschild-radius",
      "b": "boundary-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [
        "boundary-length"
      ],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: classical ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "schwarzschild-radius",
      "b": "coarsening-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [
        "coarsening-length"
      ],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: gravitational ≠ emergent",
        "scale: classical ≠ mesoscopic"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "semi-major-axis",
      "b": "barrier-width",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: classical ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "semi-major-axis",
      "b": "boundary-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: classical ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "semi-major-axis",
      "b": "coarsening-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: gravitational ≠ emergent",
        "scale: classical ≠ mesoscopic"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "semi-major-axis",
      "b": "donor-acceptor-distance",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: gravitational ≠ electromagnetic",
        "scale: classical ≠ mesoscopic"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "semi-major-axis",
      "b": "foerster-radius",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: gravitational ≠ electromagnetic",
        "scale: classical ≠ mesoscopic"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "semi-major-axis",
      "b": "planck-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: classical ≠ quantum"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "superposition-extent",
      "b": "coarsening-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: quantum ≠ mesoscopic"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "superposition-extent",
      "b": "donor-acceptor-distance",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: quantum ≠ mesoscopic"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "superposition-extent",
      "b": "foerster-radius",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: quantum ≠ mesoscopic"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "thermal-wavelength",
      "b": "coarsening-length",
      "dim": "[length]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [
        "coarsening-length"
      ],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: quantum ≠ mesoscopic"
      ],
      "canonicalKinds": [
        "cosmology",
        "electromagnetism",
        "general-relativity",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": true,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "tunneling-mass",
      "b": "defect-rest-mass",
      "dim": "[mass]",
      "touchesCore": true,
      "sameKind": true,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "scale: quantum ≠ cosmological"
      ],
      "canonicalKinds": [
        "quantum"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "vacuum-expectation-value",
      "b": "active-noise-energy",
      "dim": "[energy]",
      "touchesCore": true,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: weak ≠ emergent",
        "scale: quantum ≠ mesoscopic"
      ],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "information",
        "mechanics",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    },
    {
      "a": "vacuum-expectation-value",
      "b": "inflation-hubble-energy",
      "dim": "[energy]",
      "touchesCore": false,
      "sameKind": false,
      "mergesComponents": true,
      "unlocksFromAnchor": [],
      "numericallyConsistent": true,
      "inconsistentNodes": [],
      "ordersApart": null,
      "magnitudeChecked": false,
      "magnitudeUsedAnchor": false,
      "magnitudeAnchorInvariant": false,
      "subsuming": false,
      "verdict": "axis-clash",
      "score": -1,
      "axisChecked": true,
      "axisClashes": [
        "force: weak ≠ gravitational",
        "scale: quantum ≠ cosmological"
      ],
      "canonicalKinds": [
        "condensed-matter",
        "electromagnetism",
        "information",
        "mechanics",
        "quantum",
        "statistical",
        "thermodynamics"
      ],
      "touchesCanonical": false,
      "grounding": {
        "passed": [
          "numerical-consistency"
        ],
        "gaps": [
          "magnitude (no representative value)"
        ],
        "mechanismTested": false,
        "dataTested": false
      }
    }
  ],
  "adjudicationSummary": {
    "total": 3,
    "genuine": 0,
    "decoy": 3,
    "entailed": 0,
    "deferred": 0
  }
}

```

stderr:

```text

```

## C103

UTC: 2026-09-26T17:05:31.347210+00:00  
Exit: 0

```bash
upt eval '6*pi*G*M/(a*(1-e^2)*c^2)*180*3600/pi*100/T' G=6.6743e-11 M=1.989e30 a=5.7909e10 e=0.20563 c=299792458 T=0.2408467
```

stdout:

```text
42.99339207131854

```

stderr:

```text

```

## C104

UTC: 2026-09-26T17:05:32.699340+00:00  
Exit: 0

```bash
upt discover --source=canonical --derive --json
```

stdout:

```text
{
  "command": "discover",
  "source": "canonical",
  "options": {},
  "epistemics": "⚠ a REVIEW SURFACE: `promising` means \"worth a physicist's minute\", not \"true\".\n  Each candidate hypothesises an identification a≡b and tests its consequences.",
  "result": [
    {
      "id": "IC-erasure-energy--photon-energy--nu",
      "derivedFrom": {
        "identification": {
          "a": "erasure-energy",
          "b": "photon-energy",
          "dim": "[energy]"
        },
        "sourceEquationIds": [
          "CE-landauer",
          "CE-planck-einstein"
        ],
        "solvedFor": "nu"
      },
      "target": {
        "name": "nu",
        "dim": {
          "L": 0,
          "M": 0,
          "T": -1,
          "I": 0,
          "Theta": 0,
          "N": 0,
          "J": 0
        }
      },
      "governing": [
        {
          "name": "temperature",
          "dim": {
            "L": 0,
            "M": 0,
            "T": 0,
            "I": 0,
            "Theta": 1,
            "N": 0,
            "J": 0
          }
        }
      ],
      "formulaLatex": "nu = \\frac{k_B \\cdot ln2 \\cdot temperature}{h}",
      "scalarAst": {
        "kind": "op",
        "op": "/",
        "args": [
          {
            "kind": "op",
            "op": "*",
            "args": [
              {
                "kind": "symbol",
                "name": "k_B",
                "dim": {
                  "L": 2,
                  "M": 1,
                  "T": -2,
                  "I": 0,
                  "Theta": -1,
                  "N": 0,
                  "J": 0
                }
              },
              {
                "kind": "symbol",
                "name": "ln2",
                "dim": {
                  "L": 0,
                  "M": 0,
                  "T": 0,
                  "I": 0,
                  "Theta": 0,
                  "N": 0,
                  "J": 0
                }
              },
              {
                "kind": "symbol",
                "name": "temperature",
                "dim": {
                  "L": 0,
                  "M": 0,
                  "T": 0,
                  "I": 0,
                  "Theta": 1,
                  "N": 0,
                  "J": 0
                }
              }
            ]
          },
          {
            "kind": "symbol",
            "name": "h",
            "dim": {
              "L": 2,
              "M": 1,
              "T": -1,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          }
        ]
      },
      "dimensionalSignature": "[frequency]",
      "provenance": "Monomial elimination of the UNADJUDICATED identification erasure-energy ≡ photon-energy (CE-landauer (canonical, fully-quantitative).rhs = CE-planck-einstein (canonical, fully-quantitative).rhs), solved for 'nu'. Algebraic consequence of a hypothesised identity — NOT a new physical relation and NOT a bridge. Invertible (any free leaf may be isolated).",
      "alsoDerivableFrom": [],
      "status": "unadjudicated"
    },
    {
      "id": "IC-photon-energy--rest-energy--mass",
      "derivedFrom": {
        "identification": {
          "a": "rest-energy",
          "b": "photon-energy",
          "dim": "[energy]"
        },
        "sourceEquationIds": [
          "CE-planck-einstein",
          "CE-mass-energy"
        ],
        "solvedFor": "mass"
      },
      "target": {
        "name": "mass",
        "dim": {
          "L": 0,
          "M": 1,
          "T": 0,
          "I": 0,
          "Theta": 0,
          "N": 0,
          "J": 0
        }
      },
      "governing": [
        {
          "name": "nu",
          "dim": {
            "L": 0,
            "M": 0,
            "T": -1,
            "I": 0,
            "Theta": 0,
            "N": 0,
            "J": 0
          }
        }
      ],
      "formulaLatex": "mass = \\frac{h \\cdot nu}{c^{2}}",
      "scalarAst": {
        "kind": "op",
        "op": "/",
        "args": [
          {
            "kind": "op",
            "op": "*",
            "args": [
              {
                "kind": "symbol",
                "name": "h",
                "dim": {
                  "L": 2,
                  "M": 1,
                  "T": -1,
                  "I": 0,
                  "Theta": 0,
                  "N": 0,
                  "J": 0
                }
              },
              {
                "kind": "symbol",
                "name": "nu",
                "dim": {
                  "L": 0,
                  "M": 0,
                  "T": -1,
                  "I": 0,
                  "Theta": 0,
                  "N": 0,
                  "J": 0
                }
              }
            ]
          },
          {
            "kind": "op",
            "op": "^",
            "args": [
              {
                "kind": "symbol",
                "name": "c",
                "dim": {
                  "L": 1,
                  "M": 0,
                  "T": -1,
                  "I": 0,
                  "Theta": 0,
                  "N": 0,
                  "J": 0
                }
              },
              {
                "kind": "symbol",
                "name": "2",
                "dim": {
                  "L": 0,
                  "M": 0,
                  "T": 0,
                  "I": 0,
                  "Theta": 0,
                  "N": 0,
                  "J": 0
                }
              }
            ]
          }
        ]
      },
      "dimensionalSignature": "[mass]",
      "provenance": "Monomial elimination of the UNADJUDICATED identification rest-energy ≡ photon-energy (CE-planck-einstein (canonical, fully-quantitative).rhs = CE-mass-energy (canonical, fully-quantitative).rhs), solved for 'mass'. Algebraic consequence of a hypothesised identity — NOT a new physical relation and NOT a bridge. Invertible (any free leaf may be isolated).",
      "alsoDerivableFrom": [],
      "status": "unadjudicated"
    },
    {
      "id": "IC-hubble-distance--peak-wavelength--temperature",
      "derivedFrom": {
        "identification": {
          "a": "hubble-distance",
          "b": "peak-wavelength",
          "dim": "[length]"
        },
        "sourceEquationIds": [
          "CE-hubble-distance",
          "CE-wien"
        ],
        "solvedFor": "temperature"
      },
      "target": {
        "name": "temperature",
        "dim": {
          "L": 0,
          "M": 0,
          "T": 0,
          "I": 0,
          "Theta": 1,
          "N": 0,
          "J": 0
        }
      },
      "governing": [
        {
          "name": "hubble-rate",
          "dim": {
            "L": 0,
            "M": 0,
            "T": -1,
            "I": 0,
            "Theta": 0,
            "N": 0,
            "J": 0
          }
        }
      ],
      "formulaLatex": "temperature = \\frac{b \\cdot hubble-rate}{c}",
      "scalarAst": {
        "kind": "op",
        "op": "/",
        "args": [
          {
            "kind": "op",
            "op": "*",
            "args": [
              {
                "kind": "symbol",
                "name": "b",
                "dim": {
                  "L": 1,
                  "M": 0,
                  "T": 0,
                  "I": 0,
                  "Theta": 1,
                  "N": 0,
                  "J": 0
                }
              },
              {
                "kind": "symbol",
                "name": "hubble-rate",
                "dim": {
                  "L": 0,
                  "M": 0,
                  "T": -1,
                  "I": 0,
                  "Theta": 0,
                  "N": 0,
                  "J": 0
                }
              }
            ]
          },
          {
            "kind": "symbol",
            "name": "c",
            "dim": {
              "L": 1,
              "M": 0,
              "T": -1,
              "I": 0,
              "Theta": 0,
              "N": 0,
              "J": 0
            }
          }
        ]
      },
      "dimensionalSignature": "[temperature]",
      "provenance": "Monomial elimination of the UNADJUDICATED identification hubble-distance ≡ peak-wavelength (CE-hubble-distance (canonical, fully-quantitative).rhs = CE-wien (canonical, fully-quantitative).rhs), solved for 'temperature'. Algebraic consequence of a hypothesised identity — NOT a new physical relation and NOT a bridge. Invertible (any free leaf may be isolated).",
      "alsoDerivableFrom": [],
      "status": "unadjudicated"
    }
  ]
}

```

stderr:

```text

```

## C105

UTC: 2026-09-26T17:05:33.648686+00:00  
Exit: 2

```bash
upt probe help
```

stdout:

```text

```

stderr:

```text
upt probe needs a subverb (scan|show|run|candidates|falsify|rank|design|reproduce). See `upt help probe`.

```

## C106

UTC: 2026-09-26T17:05:34.519410+00:00  
Exit: 0

```bash
upt help probe
```

stdout:

```text
upt probe <scan|show|run|candidates|falsify|rank|design|reproduce>
        Experimental expression/residual search (Product B). Orthogonal to
        `upt discover`, which vets quantity identifications a≡b and is frozen.
        Relation-link / regime-transition gaps are not searchable here — use
        `upt discover`.
        scan                 typed frontier gaps (default: searchable only)
        show <gap-id>        one gap
        run --problem=FILE   bounded native search (MHC / holdout / budget)
        candidates           same as run; list stored statuses
        falsify              run + print falsification batteries
        rank                 run + Pareto front
        design --h1= --h2= --bounds=   discriminating experiment suggestion
        reproduce --problem=FILE       re-run a problem (same stop contract)
        --searchable-only    scan: only Product-B-searchable gaps (default)
        --all                scan: include Product A wrappers (not searchable)
        --budget-ms=N        wall-clock cap (default 5000)
        --holdout-tol=X      relative holdout RMSE cap (default 0.15)
        --worker=PATH        optional NDJSON worker (spawned as node PATH)
        --json               machine envelope

        PROBLEM FILE (--problem=FILE, JSON)
        target       {"name", "dim"}: the observable to explain. "dim" is a named
                     dimension (time, length, mass, acceleration, ...) or explicit
                     L^a.M^b.T^c (e.g. "L^3.M^-1.T^-2").
        governing    [{"name", "dim"}, ...]: the candidate inputs.
        exploratory  {"observable", "rows": [{name: value, ...}, ...]}: the fit data.
        holdout      the same shape: the locked data the fit must also pass. A row
                     that also appears in exploratory is refused as a leak.
        gap          optional {"id", "kind", "summary"}. "id" must start with "fg-".
                     "kind" is one of prediction-residual, relation-link,
                     regime-transition, parameter-tension, assumption-conflict,
                     missing-operator, unexplained-observation (default),
                     model-disagreement, causal-mechanism, other.
        role         optional on a dataset: exploratory-fit (default for
                     exploratory), validation-holdout (default for holdout),
                     external-replication, falsification-only.
        observationsPath  optional: a separate JSON file with the datasets.
        A dimensionless governing variable is written with "dim": "dimensionless".
        Minimal example (small-angle pendulum):
        {
          "target": {"name": "period", "dim": "time"},
          "governing": [{"name": "length", "dim": "length"},
                        {"name": "gravity", "dim": "acceleration"}],
          "exploratory": {"observable": "period", "rows": [
            {"length": 1, "gravity": 9.81, "period": 2.006},
            {"length": 2, "gravity": 9.81, "period": 2.837},
            {"length": 0.5, "gravity": 1.62, "period": 3.491}]},
          "holdout": {"observable": "period", "rows": [
            {"length": 1.5, "gravity": 3.71, "period": 3.995}]}
        }

```

stderr:

```text

```

## C107

UTC: 2026-09-26T17:05:35.454577+00:00  
Exit: 1

```bash
upt explain schrodinger-equation --source=canonical
```

stdout:

```text

```

stderr:

```text
upt explain: 'schrodinger-equation' is not a quantity in the canonical graph: NOT COVERED. did you mean: a, A, g, q, r?

```

## C108

UTC: 2026-09-26T17:06:07.775452+00:00  
Exit: 0

```bash
upt ground landauer-erasure-energy barrier-height
```

stdout:

```text

● landauer-erasure-energy ≟ barrier-height  [promising]
(candidate grounding is a review surface; mechanism/data live in `upt confront`, not candidate space)

  passed:  numerical-consistency, magnitude (1.0 orders)
  gaps:    axis (regime attributes unresolved)
  ceiling: mechanism-tested false · data-tested false (permanent for a dimensional candidate — see `upt confront`)

```

stderr:

```text

```

## C109

UTC: 2026-09-26T17:06:08.688479+00:00  
Exit: 0

```bash
upt probe run --problem=tests/fixtures/discovery/pendulum-scaling/public/problem.json
```

stdout:

```text
upt probe — experimental expression/residual search  [run dr-5fd183caace4]
⚠ Product B is experimental. `upt discover` remains the quantity-identification funnel.
  stop: exhausted-space
  candidates: 1 · rejections: 0

  Algebraic equivalent found in corpus upt-l-layer+b-layer@0: CE-pendulum-period

  ranked (Pareto front first; scores are not a discovery claim):
  ● h-1-d21bf2bf7a  [algebraically equivalent to a known corpus relation (not novel)]  validity=1.00 emp=1.00 parsimony=0.53 ĉ=6.283 RMSE_ex=2.72e-16 RMSE_ho=3.33e-16
      Algebraic equivalent found in corpus upt-l-layer+b-layer@0: CE-pendulum-period
      fitted ĉ=6.283 agrees with CE-pendulum-period's prefactor 6.283 (within the holdout tolerance 0.15)
      {"kind":"op","op":"*","args":[{"kind":"op","op":"^","args":[{"kind":"symbol","name":"gravity","dim":{"L":1,"M":0,"T":-2,"I":0,"Theta":0,"N":0,"J":0}},{"kind":"symbol","name":"-0.5"

```

stderr:

```text

```

## C110

UTC: 2026-09-26T17:06:09.600711+00:00  
Exit: 0

```bash
upt probe reproduce --problem=tests/fixtures/discovery/pendulum-scaling/public/problem.json
```

stdout:

```text
upt probe — experimental expression/residual search  [run dr-5fd183caace4]
⚠ Product B is experimental. `upt discover` remains the quantity-identification funnel.
  stop: exhausted-space
  candidates: 1 · rejections: 0

  Algebraic equivalent found in corpus upt-l-layer+b-layer@0: CE-pendulum-period

  ranked (Pareto front first; scores are not a discovery claim):
  ● h-1-d21bf2bf7a  [algebraically equivalent to a known corpus relation (not novel)]  validity=1.00 emp=1.00 parsimony=0.53 ĉ=6.283 RMSE_ex=2.72e-16 RMSE_ho=3.33e-16
      Algebraic equivalent found in corpus upt-l-layer+b-layer@0: CE-pendulum-period
      fitted ĉ=6.283 agrees with CE-pendulum-period's prefactor 6.283 (within the holdout tolerance 0.15)
      {"kind":"op","op":"*","args":[{"kind":"op","op":"^","args":[{"kind":"symbol","name":"gravity","dim":{"L":1,"M":0,"T":-2,"I":0,"Theta":0,"N":0,"J":0}},{"kind":"symbol","name":"-0.5"

```

stderr:

```text

```

## C111

UTC: 2026-09-26T17:06:10.990407+00:00  
Exit: 0

```bash
upt eval 'k*T*log(2)/h' k=1.380649e-23 T=300 h=6.62607015e-34
```

stdout:

```text
4332853139320.784

```

stderr:

```text

```

## C112

UTC: 2026-09-26T17:06:12.346957+00:00  
Exit: 0

```bash
upt eval 'h*nu/c^2' h=6.62607015e-34 nu=500000000000000 c=299792458
```

stdout:

```text
3.686248661906354e-36

```

stderr:

```text

```

## C113

UTC: 2026-09-26T17:06:13.780975+00:00  
Exit: 0

```bash
upt eval 'sqrt(gamma*p/rho)' gamma=1.4 p=101325 rho=1.204
```

stdout:

```text
343.2488418652865

```

stderr:

```text

```

## C114

UTC: 2026-09-26T17:06:15.123918+00:00  
Exit: 0

```bash
upt eval 'sqrt(p/rho)' p=101325 rho=1.204
```

stdout:

```text
290.09821913308264

```

stderr:

```text

```
