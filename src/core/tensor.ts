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
   * Sparse tensor storage: only store non-zero elements.
   * Key: serialized tensor indices
   * Value: set of equation IDs occupying that cell (multiple laws/bridges
   * may coexist in a single tensor cell without overwriting each other).
   */
  private readonly tensorData: Map<string, Set<string>>;

  constructor(config: TensorConfig) {
    // Runtime validation (strict TS catches these at compile time, but JS
    // consumers bypass the type system — we validate defensively here).
    if (![3, 4, 5, 6].includes(config.rank)) {
      throw new RangeError(`TensorConfig.rank must be 3, 4, 5, or 6; got ${config.rank}`);
    }
    if (!Array.isArray(config.scales) || config.scales.length === 0) {
      throw new TypeError('TensorConfig.scales must be a non-empty array');
    }
    if (!Array.isArray(config.forces) || config.forces.length === 0) {
      throw new TypeError('TensorConfig.forces must be a non-empty array');
    }

    // Apply defaults
    this.config = {
      rank: config.rank,
      scales: config.scales,
      forces: config.forces,
      symmetries: config.symmetries && config.symmetries.length > 0
        ? config.symmetries
        : ['poincare', 'gauge'],
      informationMeasures: config.informationMeasures && config.informationMeasures.length > 0
        ? config.informationMeasures
        : ['vonNeumann', 'shannon'],
      sparse: config.sparse ?? true,
    };

    this.knownLaws = new Map();
    this.bridgeEquations = new Map();
    this.emergentPhenomena = new Map();
    this.tensorData = new Map();
  }

  /**
   * Add a known physical law to the tensor.
   * Returns true if newly added, false if it replaced an existing law with the same id.
   * If replacing, stale cell entries from the previous law are removed first.
   */
  public addLaw(law: PhysicalLaw): boolean {
    this.validateId(law.id, 'PhysicalLaw');
    if (!(law.confidence >= 0 && law.confidence <= 1)) {
      throw new RangeError(`PhysicalLaw.confidence must be in [0,1]; got ${law.confidence}`);
    }
    this.validateAxisMembership(law.scales, 'scales', this.config.scales);
    this.validateAxisMembership(law.forces, 'forces', this.config.forces);
    this.validateAxisMembership(law.symmetries, 'symmetries', this.config.symmetries);
    this.validateAxisMembership(
      law.informationMeasures,
      'informationMeasures',
      this.config.informationMeasures
    );
    this.validateFiniteIntegerArray(law.dimensions, 'dimensions');
    this.validateFiniteIntegerArray(law.topologies, 'topologies');
    const previous = this.knownLaws.get(law.id);
    if (previous) {
      // Remove stale cell entries from the prior version before writing new ones.
      for (const scale of previous.scales) {
        for (const force of previous.forces) {
          this.removeFromCell(this.serializeIndices({ scale, force }), law.id);
        }
      }
    }
    this.knownLaws.set(law.id, law);

    // Store in diagonal elements for all scale/force combinations.
    // Multiple laws may occupy the same cell; we accumulate rather than overwrite.
    for (const scale of law.scales) {
      for (const force of law.forces) {
        const key = this.serializeIndices({ scale, force });
        this.addToCell(key, law.id);
      }
    }
    return previous === undefined;
  }

  /**
   * Add a bridge equation connecting regimes.
   * Returns true if newly added, false if it replaced an existing bridge with the same id.
   * If replacing, stale cell entries from the previous bridge are removed first.
   */
  public addBridge(bridge: BridgeEquation): boolean {
    this.validateId(bridge.id, 'BridgeEquation');
    if (!(bridge.confidence >= 0 && bridge.confidence <= 1)) {
      throw new RangeError(`BridgeEquation.confidence must be in [0,1]; got ${bridge.confidence}`);
    }
    // Bridges are off-diagonal by definition — reject source == target
    // (including the degenerate case where both are empty {}).
    const sourceKey = this.serializeIndices(bridge.source);
    const targetKey = this.serializeIndices(bridge.target);
    if (sourceKey === targetKey) {
      throw new RangeError(
        `BridgeEquation source must differ from target in at least one index; id=${bridge.id}` +
          (sourceKey === '' ? ' (both were empty {})' : '')
      );
    }
    const previous = this.bridgeEquations.get(bridge.id);
    if (previous) {
      this.removeFromCell(this.bridgeCellKey(previous.source, previous.target), bridge.id);
    }
    this.bridgeEquations.set(bridge.id, bridge);

    // Store in off-diagonal elements. Multiple bridges between the same
    // source/target regime pair are accumulated in the same cell.
    this.addToCell(this.bridgeCellKey(bridge.source, bridge.target), bridge.id);
    return previous === undefined;
  }

  /**
   * Reject empty or whitespace-only IDs — almost always caller error.
   */
  private validateId(id: string, kind: string): void {
    if (typeof id !== 'string' || id.trim() === '') {
      throw new TypeError(`${kind}.id must be a non-empty string`);
    }
  }

  /**
   * Reject axis values that are not declared in the tensor's config.
   * Prevents silent drift between TensorConfig (declared axes) and actual stored content.
   */
  private validateAxisMembership<T extends string>(
    values: readonly T[] | undefined,
    axisName: string,
    declared: readonly T[]
  ): void {
    if (!values) return;
    for (const v of values) {
      if (!declared.includes(v)) {
        throw new RangeError(
          `${axisName} value '${v}' is not declared in TensorConfig.${axisName}=[${declared.join(', ')}]`
        );
      }
    }
  }

  /**
   * Reject non-finite or non-integer numeric axis values (dimensions, topologies).
   * Integer values (including 0, negative integers) are allowed;
   * NaN, Infinity, and non-integers are rejected.
   */
  private validateFiniteIntegerArray(
    values: readonly number[] | undefined,
    axisName: string
  ): void {
    if (!values) return;
    for (const v of values) {
      if (!Number.isFinite(v) || !Number.isInteger(v)) {
        throw new RangeError(
          `${axisName} values must be finite integers; got ${v}`
        );
      }
    }
  }

  /**
   * Compose the cell key for a bridge equation's source→target indices.
   */
  private bridgeCellKey(source: TensorIndices, target: TensorIndices): string {
    return this.serializeIndices(source) + ' -> ' + this.serializeIndices(target);
  }

  /**
   * Accumulate an equation ID into the tensor cell at the given key.
   * Creates a new Set if the cell is empty.
   */
  private addToCell(key: string, equationId: string): void {
    let cell = this.tensorData.get(key);
    if (!cell) {
      cell = new Set();
      this.tensorData.set(key, cell);
    }
    cell.add(equationId);
  }

  /**
   * Remove an equation ID from a tensor cell. Prunes empty cells.
   */
  private removeFromCell(key: string, equationId: string): void {
    const cell = this.tensorData.get(key);
    if (!cell) return;
    cell.delete(equationId);
    if (cell.size === 0) this.tensorData.delete(key);
  }

  /**
   * Add an emergent phenomenon.
   * Returns true if newly added, false if it replaced an existing phenomenon.
   */
  public addEmergence(phenomenon: EmergentPhenomenon): boolean {
    this.validateId(phenomenon.id, 'EmergentPhenomenon');
    if (!Number.isInteger(phenomenon.order) || phenomenon.order < 3) {
      throw new RangeError(
        `EmergentPhenomenon.order must be an integer >= 3 (higher-order correlations); got ${phenomenon.order}`
      );
    }
    if (!(phenomenon.confidence >= 0 && phenomenon.confidence <= 1)) {
      throw new RangeError(
        `EmergentPhenomenon.confidence must be in [0,1]; got ${phenomenon.confidence}`
      );
    }
    const previous = this.emergentPhenomena.get(phenomenon.id);
    if (previous) {
      for (const indices of previous.indices) {
        const key = this.serializeIndices(indices);
        if (key) this.removeFromCell(key, phenomenon.id);
      }
    }
    this.emergentPhenomena.set(phenomenon.id, phenomenon);

    // Populate tensorData at each declared index-tuple, matching the L and B
    // components' storage pattern so the Π = L + B + E decomposition is
    // uniformly represented in the sparse tensor.
    for (const indices of phenomenon.indices) {
      const key = this.serializeIndices(indices);
      if (key) this.addToCell(key, phenomenon.id);
    }
    return previous === undefined;
  }

  /**
   * Return the IDs of laws and emergent phenomena stored at the diagonal cell
   * addressed by the given indices.
   * For bridge-equation cells (off-diagonal, source→target), use getBridgeCellContents instead.
   */
  public getCellContents(indices: TensorIndices): string[] {
    const key = this.serializeIndices(indices);
    const cell = this.tensorData.get(key);
    return cell ? Array.from(cell) : [];
  }

  /**
   * Return the IDs of bridge equations stored at the off-diagonal cell
   * addressed by the given source/target indices.
   */
  public getBridgeCellContents(source: TensorIndices, target: TensorIndices): string[] {
    const key = this.bridgeCellKey(source, target);
    const cell = this.tensorData.get(key);
    return cell ? Array.from(cell) : [];
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
    // occupiedCells = number of distinct (diagonal or off-diagonal) tensor cells
    // that hold at least one equation ID. Each cell may hold multiple IDs (Set).
    let totalEntries = 0;
    for (const cell of this.tensorData.values()) totalEntries += cell.size;
    return {
      rank: this.config.rank,
      knownLaws: this.knownLaws.size,
      bridgeEquations: this.bridgeEquations.size,
      emergentPhenomena: this.emergentPhenomena.size,
      occupiedCells: this.tensorData.size,
      totalEntries,
      sparse: this.config.sparse,
      /** @deprecated use occupiedCells (cell count) or totalEntries (sum of set sizes) */
      totalElements: this.tensorData.size,
    };
  }

  /**
   * Serialize tensor indices to string key.
   * Uses !== undefined checks so that dimension/topology values of 0
   * (e.g., trivial winding number, genus-0 surface) are preserved.
   */
  private serializeIndices(indices: TensorIndices): string {
    const parts: string[] = [];

    if (indices.scale !== undefined) parts.push(`scale:${indices.scale}`);
    if (indices.force !== undefined) parts.push(`force:${indices.force}`);
    if (indices.symmetry !== undefined) parts.push(`sym:${indices.symmetry}`);
    if (indices.information !== undefined) parts.push(`info:${indices.information}`);
    if (indices.dimension !== undefined) parts.push(`dim:${indices.dimension}`);
    if (indices.topology !== undefined) parts.push(`topo:${indices.topology}`);

    return parts.join('|');
  }

  /**
   * Check if a law matches query indices.
   * If the query specifies an index dimension that the law does not declare
   * (e.g., the law has no informationMeasures but the query asks for one),
   * the law is excluded — querying on an undeclared index cannot match.
   */
  private lawMatchesQuery(law: PhysicalLaw, query: TensorIndices): boolean {
    if (query.scale && !law.scales.includes(query.scale)) {
      return false;
    }

    if (query.force && !law.forces.includes(query.force)) {
      return false;
    }

    if (query.symmetry && !law.symmetries.includes(query.symmetry)) {
      return false;
    }

    if (query.information) {
      if (!law.informationMeasures || !law.informationMeasures.includes(query.information)) {
        return false;
      }
    }

    if (query.dimension !== undefined) {
      if (!law.dimensions || !law.dimensions.includes(query.dimension)) {
        return false;
      }
    }

    if (query.topology !== undefined) {
      if (!law.topologies || !law.topologies.includes(query.topology)) {
        return false;
      }
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

    if (b.dimension !== undefined && a.dimension !== b.dimension) {
      return false;
    }

    if (b.topology !== undefined && a.topology !== b.topology) {
      return false;
    }

    return true;
  }
}
