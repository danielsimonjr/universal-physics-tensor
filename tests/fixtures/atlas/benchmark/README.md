# Atlas invalid-bridge benchmark — fixtures (Phase 5)

| Directory | Holds | Who writes it |
|---|---|---|
| `public/items.json` | The FROZEN items, without answers | Independent physicists who have not read `src/atlas/` |
| `scorer/labels.json` | The expected outcome per item | The same independent authors; no `src/` file may read it |
| `contested/items.json` | Candidate drafts, never scored | Anyone, including agents, with `authorship: 'contested-draft'` |

**All three are EMPTY on purpose.** No agent may author a frozen item (design note
`docs/planning/Atlas-Phase-5-Design.md` §0). An empty frozen set is the honest state until
independent authors exist, and no condition may be scored against it and reported as a result.
