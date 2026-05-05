# Bridge Equation Index

Machine-readable catalog of the 40 bridge equations defined in the UPT specification (`docs/specification/Part-{I..VI}.md`), exported as `BRIDGE_EQUATIONS: BridgeEquationEntry[]` from `index.ts`.

## Schema

See `index.ts` — `BridgeEquationEntry`, `KnownIssue`, `BridgeEquationStatus`. Notable honest-claude conventions:

- `formula_latex` is the LaTeX source decoded from the spec's `<img src="https://i.upmath.me/svg/...">` URLs (URL-decoded with `urllib.parse.unquote`). It is the *first* equation block under each `**Mathematical Formulation**` header.
- `dimensional_signature` is `null` for every entry — Tier 4 dimensional-analysis work has not been done; do not infer from the formula.
- `known_issues[]` only includes issues with explicit spec markers (`**Known issue:**`, `**Additional known issue:**`, `**Bound violation:**`, `**Caveat:**`, `**Sign-convention concern:**`, etc.). Equations whose `Status` paragraph discusses problems narratively without such a marker have `known_issues: []`; the full Status text is preserved in `notes`.
- `references[]` only contains arXiv IDs the regex actually matched in each entry's body. Verbatim journal citations (e.g., "Lindblad 1976, Commun. Math. Phys. 48:119") are *not* in `references` but are visible in `notes`.
- `dependencies[]` is the set of *other* bridge equation IDs explicitly named ("Bridge Equation N") in the body — not transitive.
- `bridges[]` is a heuristic mapping from category → endpoint pair; treat as advisory.

## Regenerate

The TS file is generated, not hand-written. Sources:

- `~/.claude/playground/upt_bridge_extraction/extract.py` — phase-1 regex over the 6 spec markdown files; writes `_bridge_extract_enriched.json` (gitignored).
- `~/.claude/playground/upt_bridge_extraction/gen_ts.py` — turns the JSON into `src/bridges/index.ts`.

Run on Windows: `python -X utf8 ~/.claude/playground/upt_bridge_extraction/extract.py && python -X utf8 ~/.claude/playground/upt_bridge_extraction/gen_ts.py`. The `-X utf8` flag prevents cp1252 decode errors on the Greek/math characters in the spec.

After regen, `npm run typecheck && npx vitest run` must pass; the `tests/bridges-index.test.ts` invariants pin the count and structure.
