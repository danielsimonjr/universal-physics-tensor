import { runEngineConformance } from './engine-conformance.js';
import { Float64ReferenceEngine } from '../../src/numerical/float64-engine.js';

// Task 4 ships the 'core' tier; Task 5 promotes this to 'full'.
runEngineConformance(() => new Float64ReferenceEngine(), 'core');
