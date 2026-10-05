/**
 * Readers for values coming back from a saved applicant. Records written by older versions of
 * the app can hold missing or differently-typed fields, so each reader falls back explicitly.
 */

/** A saved applicant as handed to a section's `load`; values are untrusted until read. */
export type SavedApplicant = Record<string, unknown>;

export const savedString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' && value !== '' ? value : typeof value === 'number' ? String(value) : fallback;

/** A non-empty saved list, or the fallback rows for a blank form. */
export const savedList = <T>(value: unknown, fallback: T[]): T[] =>
  Array.isArray(value) && value.length > 0 ? (value as T[]) : fallback;
