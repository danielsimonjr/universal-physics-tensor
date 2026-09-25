## Criterion 3 — the embedding condition and the verdict (pre-registration Amendment 11)

Scored after Amendment 11 was committed (`b6916ab`) and its CI was green (run 36084344662, success, 2026-09-25T02:01:31Z).

Model `qwen3-embedding:4b`, digest df5bd2e3c74cd8d069d21dc038f1b359fcdc9458fce1c99bd43c9eb1518ff907, 2560 dimensions, scored from the frozen vector file `embeddings/qwen3-embedding-4b.json`.

**Verdict (§6 item 3, PRIMARY pooled, n = 50): NOT MET.** The typed structural search's
Wilson lower bound is 14.3%; the embedding condition's point estimate is 98.0%. The
criterion is met only when the lower bound lies above the point estimate.

### PRIMARY (n = 50)

| Group | n | embedding (qwen3-embedding:4b) | typed structural search |
|---|---|---|---|
| all families | 50 | 49/50 = 98.0% [89.5%, 99.6%] | 12/50 = 24.0% [14.3%, 37.4%] |
| in-distribution families | 30 | 30/30 = 100.0% [88.6%, 100.0%] | 0/30 = 0.0% [0.0%, 11.4%] |
| diffusion | 6 | 6/6 = 100.0% [61.0%, 100.0%] | 0/6 = 0.0% [0.0%, 39.0%] |
| oscillators | 12 | 12/12 = 100.0% [75.8%, 100.0%] | 0/12 = 0.0% [0.0%, 24.2%] |
| waves | 12 | 12/12 = 100.0% [75.8%, 100.0%] | 0/12 = 0.0% [0.0%, 24.2%] |
| fluid-statics (held out) | 20 | 19/20 = 95.0% [76.4%, 99.1%] | 12/20 = 60.0% [38.7%, 78.1%] |

### SECONDARY (n = 64)

| Group | n | embedding (qwen3-embedding:4b) | typed structural search |
|---|---|---|---|
| all families | 64 | 63/64 = 98.4% [91.7%, 99.7%] | 15/64 = 23.4% [14.7%, 35.1%] |
| in-distribution families | 34 | 34/34 = 100.0% [89.8%, 100.0%] | 0/34 = 0.0% [0.0%, 10.2%] |
| diffusion | 7 | 7/7 = 100.0% [64.6%, 100.0%] | 0/7 = 0.0% [0.0%, 35.4%] |
| oscillators | 13 | 13/13 = 100.0% [77.2%, 100.0%] | 0/13 = 0.0% [0.0%, 22.8%] |
| waves | 14 | 14/14 = 100.0% [78.5%, 100.0%] | 0/14 = 0.0% [0.0%, 21.5%] |
| fluid-statics (held out) | 30 | 29/30 = 96.7% [83.3%, 99.4%] | 15/30 = 50.0% [33.2%, 66.8%] |

### Variance: a second, independent embedding pass (disclosed, not scored)

- Byte-identical to the frozen pass: no.
- Cosine between the two passes over 232 vectors: min 0.997220, mean 0.999424.
- PRIMARY pooled on the second pass: 49/50 = 98.0% [89.5%, 99.6%].
- Truth queries whose hit at depth 10 differs between the passes: 0.

