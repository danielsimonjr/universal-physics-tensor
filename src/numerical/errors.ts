/**
 * Numerical-backend error type. Subclass of UPTError so downstream
 * consumers discriminate UPT-source errors uniformly with `instanceof`.
 *
 * @module numerical/errors
 */
import { UPTError } from '../dimensional/errors.js';

/**
 * Error type thrown by the numerical-contraction backend. Subclass of
 * `UPTError` so consumers can discriminate UPT-source errors with `instanceof`.
 * @public
 */
export class NumericalBackendError extends UPTError {
  constructor(message: string) {
    super(message);
    this.name = 'NumericalBackendError';
    Object.setPrototypeOf(this, NumericalBackendError.prototype);
  }
}

/**
 * Thrown when a TensorEngine method required for an operation is not
 * implemented by the active engine (e.g. forwardGrad/reverseGrad on
 * Float64ReferenceEngine). Call `hasAutogradSupport(engine)` before
 * invoking AD methods to avoid this error.
 * @public
 */
export class EngineCapabilityError extends NumericalBackendError {
  constructor(
    public readonly engineName: string,
    public readonly missingMethod: string,
  ) {
    super(
      `Engine "${engineName}" does not implement "${missingMethod}". ` +
      `Call \`hasAutogradSupport(engine)\` to detect support before invoking.`,
    );
    this.name = 'EngineCapabilityError';
    Object.setPrototypeOf(this, EngineCapabilityError.prototype);
  }
}
