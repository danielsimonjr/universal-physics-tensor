/**
 * Quick test of the Universal Physics Tensor
 */

import { UniversalTensor, PhysicalConstants } from './dist/index.js';

// Create a tensor
const tensor = new UniversalTensor({
  rank: 3,
  scales: ['quantum', 'classical'],
  forces: ['electromagnetic', 'gravitational'],
});

// Add Schrödinger equation
tensor.addLaw({
  id: 'schrodinger',
  name: 'Schrödinger Equation',
  equation: 'iℏ ∂ψ/∂t = Ĥψ',
  scales: ['quantum'],
  forces: ['electromagnetic'],
  symmetries: ['poincare'],
  confidence: 1.0,
});

// Add Newton's second law
tensor.addLaw({
  id: 'newton-second',
  name: "Newton's Second Law",
  equation: 'F = ma',
  scales: ['classical'],
  forces: ['gravitational', 'electromagnetic'],
  symmetries: ['poincare'],
  confidence: 1.0,
});

// Add bridge equation
tensor.addBridge({
  id: 'ehrenfest',
  name: 'Ehrenfest Theorem',
  source: { scale: 'quantum', force: 'electromagnetic' },
  target: { scale: 'classical', force: 'electromagnetic' },
  equation: 'd⟨p⟩/dt = -⟨∇V⟩',
  confidence: 1.0,
  validated: true,
  description: 'Quantum expectation values follow classical motion',
});

console.log('\n=== Quantum Laws ===');
const quantumLaws = tensor.queryLaws({ scale: 'quantum' });
quantumLaws.forEach(law => console.log(`${law.name}: ${law.equation}`));

console.log('\n=== Classical Laws ===');
const classicalLaws = tensor.queryLaws({ scale: 'classical' });
classicalLaws.forEach(law => console.log(`${law.name}: ${law.equation}`));

console.log('\n=== Quantum ↔ Classical Bridges ===');
const bridges = tensor.findBridges(
  { scale: 'quantum' },
  { scale: 'classical' }
);
bridges.forEach(bridge => {
  console.log(`${bridge.name}: ${bridge.equation}`);
  console.log(`  Validated: ${bridge.validated}`);
});

console.log('\n=== Tensor Statistics ===');
const stats = tensor.getStats();
console.log(`Rank: ${stats.rank}`);
console.log(`Known Laws: ${stats.knownLaws}`);
console.log(`Bridge Equations: ${stats.bridgeEquations}`);

console.log('\n=== Physical Constants ===');
console.log(`Speed of light: ${PhysicalConstants.c} m/s`);
console.log(`Planck length: ${PhysicalConstants.lP} m`);
console.log(`✅ Test completed successfully!`);
