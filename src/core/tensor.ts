/**
 * Universal Physics Tensor
 *
 * Core implementation of the rank-N tensor living in product space:
 * Π ∈ H_scale ⊗ H_force ⊗ H_symmetry ⊗ H_info ⊗ H_dim ⊗ H_topo
 *
 * Decomposition: Π = L + B + E
 * Where:
 * - L: Known laws (diagonal elements)
 * - B: Bridge equations (off-diagonal elements)
 * - E: Emergent phenomena (higher-order correlations)
 */

import type {
  TensorConfig,
  TensorIndices,
  PhysicalLaw,
  BridgeEquation,
  EmergentPhenomenon,
  PhysicalScale,
  Force,
} from './types.js';

export class UniversalTensor {
  private readonly config: Required<TensorConfig>;
  private readonly knownLaws: Map<string, PhysicalLaw>;
  private readonly bridgeEquations: Map<string, BridgeEquation>;
  private readonly emergentPhenomena: Map<string, EmergentPhenomenon>;

  /**
   * Sparse tensor storage: only store non-zero elements
   * Key: serialized tensor indices
   * Value: numerical value or equation reference
   */
  private readonly tensorData: Map<string, number | string>;

  constructor(config: TensorConfig) {
    // Apply defaults
    this.config = {
      rank: config.rank,
      scales: config.scales,
      forces: config.forces,
      symmetries: config.symmetries || ['poincare', 'gauge'],
      informationMeasures: config.informationMeasures || ['vonNeumann', 'shannon'],
      sparse: config.sparse ?? true,
    };

    this.knownLaws = new Map();
    this.bridgeEquations = new Map();
    this.emergentPhenomena = new Map();
    this.tensorData = new Map();

    this.initialize();
  }

  /**
   * Initialize tensor structure
   */
  private initialize(): void {
    console.log(`Initializing Universal Physics Tensor (rank-${this.config.rank})`);
    console.log(`Scales: ${this.config.scales.join(', ')}`);
    console.log(`Forces: ${this.config.forces.join(', ')}`);
    console.log(`Sparse representation: ${this.config.sparse}`);
  }

  /**
   * Add a known physical law to the tensor
   */
  public addLaw(law: PhysicalLaw): void {
    this.knownLaws.set(law.id, law);

    // Store in diagonal elements
    const key = this.serializeIndices({
      scale: law.scales[0], // Primary scale
      force: law.forces[0], // Primary force
    });

    this.tensorData.set(key, law.id);
  }

  /**
   * Add a bridge equation connecting regimes
   */
  public addBridge(bridge: BridgeEquation): void {
    this.bridgeEquations.set(bridge.id, bridge);

    // Store in off-diagonal elements
    const key = this.serializeIndices(bridge.source) + ' -> ' + this.serializeIndices(bridge.target);
    this.tensorData.set(key, bridge.id);
  }

  /**
   * Add an emergent phenomenon
   */
  public addEmergence(phenomenon: EmergentPhenomenon): void {
    this.emergentPhenomena.set(phenomenon.id, phenomenon);
  }

  /**
   * Query tensor for laws applicable to specific regime
   */
  public queryLaws(indices: TensorIndices): PhysicalLaw[] {
    const results: PhysicalLaw[] = [];

    for (const law of this.knownLaws.values()) {
      if (this.lawMatchesQuery(law, indices)) {
        results.push(law);
      }
    }

    return results;
  }

  /**
   * Find bridge equations connecting two regimes
   */
  public findBridges(source: TensorIndices, target: TensorIndices): BridgeEquation[] {
    const results: BridgeEquation[] = [];

    for (const bridge of this.bridgeEquations.values()) {
      if (
        this.indicesMatch(bridge.source, source) &&
        this.indicesMatch(bridge.target, target)
      ) {
        results.push(bridge);
      }
    }

    return results;
  }

  /**
   * Get all known laws
   */
  public getLaws(): PhysicalLaw[] {
    return Array.from(this.knownLaws.values());
  }

  /**
   * Get all bridge equations
   */
  public getBridges(): BridgeEquation[] {
    return Array.from(this.bridgeEquations.values());
  }

  /**
   * Get all emergent phenomena
   */
  public getEmergence(): EmergentPhenomenon[] {
    return Array.from(this.emergentPhenomena.values());
  }

  /**
   * Get tensor statistics
   */
  public getStats() {
    return {
      rank: this.config.rank,
      knownLaws: this.knownLaws.size,
      bridgeEquations: this.bridgeEquations.size,
      emergentPhenomena: this.emergentPhenomena.size,
      totalElements: this.tensorData.size,
      sparse: this.config.sparse,
    };
  }

  /**
   * Serialize tensor indices to string key
   */
  private serializeIndices(indices: TensorIndices): string {
    const parts: string[] = [];

    if (indices.scale) parts.push(`scale:${indices.scale}`);
    if (indices.force) parts.push(`force:${indices.force}`);
    if (indices.symmetry) parts.push(`sym:${indices.symmetry}`);
    if (indices.information) parts.push(`info:${indices.information}`);
    if (indices.dimension) parts.push(`dim:${indices.dimension}`);
    if (indices.topology) parts.push(`topo:${indices.topology}`);

    return parts.join('|');
  }

  /**
   * Check if a law matches query indices
   */
  private lawMatchesQuery(law: PhysicalLaw, query: TensorIndices): boolean {
    if (query.scale && !law.scales.includes(query.scale)) {
      return false;
    }

    if (query.force && !law.forces.includes(query.force)) {
      return false;
    }

    return true;
  }

  /**
   * Check if two tensor indices match
   */
  private indicesMatch(a: TensorIndices, b: TensorIndices): boolean {
    if (b.scale && a.scale !== b.scale) {
      return false;
    }

    if (b.force && a.force !== b.force) {
      return false;
    }

    if (b.symmetry && a.symmetry !== b.symmetry) {
      return false;
    }

    if (b.information && a.information !== b.information) {
      return false;
    }

    return true;
  }
}
