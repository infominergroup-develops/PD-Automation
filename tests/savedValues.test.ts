import { describe, expect, it } from 'vitest';
import { savedNumberOrBlank } from '../src/components/pd/savedValues';

describe('savedNumberOrBlank', () => {
  it('reads numbers and numeric strings', () => {
    expect(savedNumberOrBlank(3)).toBe(3);
    expect(savedNumberOrBlank('42105')).toBe(42105);
  });
  it('treats missing or non-numeric values as blank', () => {
    expect(savedNumberOrBlank(undefined)).toBe('');
    expect(savedNumberOrBlank('')).toBe('');
    expect(savedNumberOrBlank('abc')).toBe('');
  });
});
