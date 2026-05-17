import { describe, it, expect } from 'vitest';
import * as constants from '../../src/dimensional/constants.js';

describe('dimensional/constants public surface — v0.4.5 dead-code removal', () => {
  it('epsilon_0 is removed (was unused)', () => {
    expect('epsilon_0' in constants).toBe(false);
  });

  it('t_P is removed (was unused)', () => {
    expect('t_P' in constants).toBe(false);
  });

  it('m_P is removed (was unused)', () => {
    expect('m_P' in constants).toBe(false);
  });

  it('E_P is removed (was unused)', () => {
    expect('E_P' in constants).toBe(false);
  });

  it('retained constants still present: hbar, c, G, k_B, e, l_P', () => {
    expect('hbar' in constants).toBe(true);
    expect('c' in constants).toBe(true);
    expect('G' in constants).toBe(true);
    expect('k_B' in constants).toBe(true);
    expect('e' in constants).toBe(true);
    expect('l_P' in constants).toBe(true);
  });
});
