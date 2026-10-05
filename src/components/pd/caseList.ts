import type { GalleryApplicant } from '../../types/applicant';

/** Gallery label for legacy applicants saved before the preparing employee was recorded. */
export const UNRECORDED_PREPARER = 'Not recorded';

type CaseStatusFields = Partial<Pick<GalleryApplicant, 'isClosed' | 'status' | 'caseDeliveryStatus'>>;

/** A case counts as closed if any of the closure fields (current or legacy) says so. */
export const isCaseClosed = (app: CaseStatusFields) =>
  Boolean(app.isClosed || app.status === 'CLOSED' || app.caseDeliveryStatus === 'DELIVERED');

export function countCases(applicants: CaseStatusFields[]) {
  const closed = applicants.filter(isCaseClosed).length;
  return { open: applicants.length - closed, closed };
}

const LATEST_TIMESTAMP_FIELDS = ['updatedAt', 'createdAt', 'dateOfVisit', 'reportDate', 'visitDate'] as const;

function caseTimestamp(app: GalleryApplicant): number {
  const value = LATEST_TIMESTAMP_FIELDS.map((field) => app[field]).find(Boolean);
  const time = value ? new Date(String(value)).getTime() : NaN;
  return isNaN(time) ? 0 : time;
}

/** Most recently updated first; ties broken by application number, then id. */
export function sortLatestFirst<T extends GalleryApplicant>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const diff = caseTimestamp(b) - caseTimestamp(a);
    if (diff !== 0) return diff;
    return String(b.applicationNumber || b._id || '').localeCompare(String(a.applicationNumber || a._id || ''));
  });
}
