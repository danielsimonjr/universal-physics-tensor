/**
 * Numerical-backend error type. Subclass of UPTError so downstream
 * consumers discriminate UPT-source errors uniformly with `instanceof`.
 *
 * @module numerical/errors
 */
import { UPTError } from '../dimensional/errors.js';

export class NumericalBackendError extends UPTError {
  constructor(message: string) {
    super(message);
    this.name = 'NumericalBackendError';
    Object.setPrototypeOf(this, NumericalBackendError.prototype);
  }
}
