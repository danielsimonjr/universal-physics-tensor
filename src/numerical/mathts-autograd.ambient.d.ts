/**
 * Ambient module declaration for the optional peer dependency
 * `@danielsimonjr/mathts-autograd`. The package is listed in package.json's
 * `optionalDependencies` and is therefore not guaranteed to be installed at
 * tsc time — without this declaration, the dynamic `await import(
 * '@danielsimonjr/mathts-autograd')` call sites in numerical/engine-registry.ts
 * and numerical/mathts-engine.ts would fail tsc with TS2307 and need
 * `@ts-ignore` directives to compile.
 *
 * The declaration body is empty: the runtime call in engine-registry.ts only
 * checks for presence (Promise resolves iff the package is installed), and
 * the call sites in mathts-engine.ts re-narrow the result via the
 * module-private `MathTSAutograd` structural interface there (`autograd =
 * await import(...) as unknown as MathTSAutograd`). The empty ambient is
 * therefore exactly the surface tsc needs to resolve the specifier; runtime
 * type-safety is provided by the consumer-side `as unknown as ...` cast.
 *
 * v0.5.1 TS-4: replaces three `@ts-ignore` directives (engine-registry.ts L43-47,
 * mathts-engine.ts L141 + L182) with this single ambient module declaration.
 *
 * @module numerical/mathts-autograd.ambient
 */

declare module '@danielsimonjr/mathts-autograd';
