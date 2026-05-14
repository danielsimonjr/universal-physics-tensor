import { runEngineConformance } from './engine-conformance.js';
import { MathTSEngine } from '../../src/numerical/mathts-engine.js';

// The IDENTICAL suite Float64ReferenceEngine runs (Task 5). Both engines
// passing this is the contract that makes parallel two-repo dev safe.
runEngineConformance(() => new MathTSEngine(), 'full');
