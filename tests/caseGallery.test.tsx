import type { ComponentProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CaseGalleryModal } from '../src/components/pd/CaseGalleryModal';
import { countCases, isCaseClosed, sortLatestFirst } from '../src/components/pd/caseList';
import type { GalleryApplicant } from '../src/types/applicant';

const makeCase = (overrides: Partial<GalleryApplicant>): GalleryApplicant => ({
  _id: 'id',
  clientId: 'tata',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  applicationNumber: 'APP-1',
  applicantName: 'Applicant',
  isClosed: false,
  caseDeliveryStatus: 'IN_PROGRESS',
  preparedBy: 'Harry',
  bankName: 'Tata Capital Limited',
  categoryName: 'Kirana Store',
  ...overrides,
});

const cases = [
  makeCase({ _id: 'a', applicantName: 'Asha Verma', preparedBy: 'Harry', updatedAt: '2026-03-01T00:00:00.000Z' }),
  makeCase({
    _id: 'b',
    applicantName: 'Bilal Khan',
    preparedBy: 'Priya',
    updatedAt: '2026-05-01T00:00:00.000Z',
    isClosed: true,
  }),
  makeCase({
    _id: 'c',
    applicantName: 'Chetan Rao',
    preparedBy: 'Harry',
    updatedAt: '2026-04-01T00:00:00.000Z',
    riskScore: 85,
  }),
];

const noop = () => {};
const render = (props: Partial<ComponentProps<typeof CaseGalleryModal>> = {}) =>
  renderToStaticMarkup(
    <CaseGalleryModal
      applicants={cases}
      loading={false}
      canManageCases={false}
      canDeleteAll={false}
      onClose={noop}
      onLoad={noop}
      onToggleClosed={noop}
      onDelete={noop}
      onDeleteAll={noop}
      {...props}
    />,
  );

describe('case list helpers', () => {
  it('treats any of the closure fields as closed', () => {
    expect(isCaseClosed({ isClosed: true })).toBe(true);
    expect(isCaseClosed({ isClosed: false, status: 'CLOSED' })).toBe(true);
    expect(isCaseClosed({ isClosed: false, caseDeliveryStatus: 'DELIVERED' })).toBe(true);
    expect(isCaseClosed({ isClosed: false, caseDeliveryStatus: 'IN_PROGRESS' })).toBe(false);
  });

  it('counts open and closed cases', () => {
    expect(countCases(cases)).toEqual({ open: 2, closed: 1 });
  });

  it('sorts the most recently updated first', () => {
    expect(sortLatestFirst(cases).map((c) => c.applicantName)).toEqual(['Bilal Khan', 'Chetan Rao', 'Asha Verma']);
  });
});

describe('CaseGalleryModal', () => {
  it('shows each case with who prepared it, latest first', () => {
    const html = render();
    expect(html.indexOf('Bilal Khan')).toBeLessThan(html.indexOf('Chetan Rao'));
    expect(html.indexOf('Chetan Rao')).toBeLessThan(html.indexOf('Asha Verma'));
    expect(html).toContain('Prepared by: <span class="font-bold text-[#2d3e50]">Priya</span>');
    expect(html).toContain('Open (2)');
  });

  it('shows a risk badge only for cases with a saved risk score', () => {
    expect(render().match(/APPROVED|CONDITIONAL/g)).toEqual(['APPROVED']);
  });

  it('hides per-employee counts and case actions from employees', () => {
    const html = render();
    expect(html).not.toContain('PD Reports by Employee');
    expect(html).not.toContain('Mark as Closed');
    expect(html).not.toContain('Delete All Applicants');
  });

  it('shows per-employee counts and case actions to managers', () => {
    const html = render({ canManageCases: true });
    expect(html).toContain('PD Reports by Employee');
    expect(html).toMatch(/Harry <span class="font-black">2<\/span>/);
    expect(html).toContain('Mark as Closed');
    expect(html).not.toContain('Delete All Applicants');
  });

  it('offers delete-all only to admins', () => {
    expect(render({ canManageCases: true, canDeleteAll: true })).toContain('Delete All Applicants');
  });
});
