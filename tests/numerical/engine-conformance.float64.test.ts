import { runEngineConformance } from './engine-conformance.js';
import { Float64ReferenceEngine } from '../../src/numerical/float64-engine.js';

runEngineConformance(() => new Float64ReferenceEngine(), 'full');
