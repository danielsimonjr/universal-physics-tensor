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
