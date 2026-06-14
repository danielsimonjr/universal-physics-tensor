// Ambient declaration for the OPTIONAL peer @danielsimonjr/mathts-functions
// (the assembled mathjs-style instance: `parse` / `evaluate` + AST nodes).
//
// Mirrors mathts-tensor.ambient.d.ts / mathts-autograd.ambient.d.ts: it lets
// tsc resolve the dynamic `import('@danielsimonjr/mathts-functions')` in
// formula-mathts.ts even when the optional peer is NOT installed. The module
// is declared with no exports; the consumer casts through `unknown` to its
// own local structural shape.
declare module '@danielsimonjr/mathts-functions';
