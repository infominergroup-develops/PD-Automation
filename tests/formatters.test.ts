import { describe, expect, it } from 'vitest';
import * as clientFormatters from '../src/utils/creditFormatters';
import * as serverFormatters from '../api/utils/formatters';

// The browser and the API each keep a copy of these helpers; both must behave the same
describe.each([
  ['client', clientFormatters],
  ['server', serverFormatters],
])('%s credit formatters', (_side, f) => {
  describe('formatIndianCurrency', () => {
    it.each([
      [0, '₹0'],
      [999, '₹999'],
      [1000, '₹1,000'],
      [123456, '₹1,23,456'],
      [12345678, '₹1,23,45,678'],
      [-250000, '-₹2,50,000'],
      [1234.6, '₹1,235'],
      [null, '₹0'],
      [undefined, '₹0'],
      [NaN, '₹0'],
    ])('%s → %s', (input, expected) => {
      expect(f.formatIndianCurrency(input as number | null | undefined)).toBe(expected);
    });
  });

  describe('parseNumericValue', () => {
    it.each([
      [1500, 1500],
      ['1,50,000', 150000],
      ['₹ 2,500', 2500],
      ['INR 75,000.50', 75000.5],
      ['Rs. 5,000', 5000],
      ['Rs.12,000', 12000],
      ['"3,400"', 3400],
      ['-1,200', -1200],
      ['NA', null],
      ['-', null],
      ['', null],
      ['abc', null],
      [null, null],
      [{}, null],
    ])('%j → %j', (input, expected) => {
      expect(f.parseNumericValue(input)).toBe(expected);
    });
  });

  describe('parseDateString', () => {
    it.each([
      ['5/3/2024', '05-03-2024'],
      ['15-01-2023', '15-01-2023'],
      ['1.12.2022', '01-12-2022'],
      ['15-JAN-2023', '15-JAN-2023'],
      ['NA', null],
      ['', null],
      [42, null],
    ])('%j → %j', (input, expected) => {
      expect(f.parseDateString(input)).toBe(expected);
    });
  });
});

describe('masking (server)', () => {
  it('masks the middle of a PAN', () => {
    expect(serverFormatters.maskPAN('abcde1234f')).toBe('ABXXXXXX4F');
    expect(serverFormatters.maskPAN(null)).toBe('XXXXX0000X');
  });

  it('keeps only the last four digits of a phone number', () => {
    expect(serverFormatters.maskPhone('+91 98765-43210')).toBe('XXXXXX3210');
    expect(serverFormatters.maskPhone('12')).toBe('XXXXXX0000');
  });
});
