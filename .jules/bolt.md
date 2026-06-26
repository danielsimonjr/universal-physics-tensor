## 2024-05-18 - TypedArray to Array Conversion Overhead
**Learning:** In V8 (Node.js), converting a TypedArray (like `Float64Array`) to a standard Array using `Array.from()` carries massive allocation overhead. This can significantly degrade performance when used inside tight numerical integration loops (like RK4 or GL4 integrators).
**Action:** Always prefer manual `for` loops to populate standard Arrays from TypedArrays in performance-critical sections.
