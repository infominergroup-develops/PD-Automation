/**
 * Saved PD applicant records (Firestore `applicants` collection).
 *
 * The server owns the metadata fields; the PD form owns everything else. The index fields
 * below are the ones the form always writes at the top level for the case gallery and search.
 * The remaining form fields are not typed yet: they get typed per section as the PD form is
 * split into section components.
 */

export type CaseDeliveryStatus = 'DELIVERED' | 'IN_PROGRESS';

/** Fields set by the API, never by the form. */
export interface ApplicantRecordMeta {
  _id: string;
  clientId: string;
  createdAt: string;
  updatedAt: string;
  preparedBy?: string;
  preparedById?: string | null;
  preparedByEmail?: string | null;
  isClosed?: boolean;
  status?: string;
  caseDeliveryStatus?: CaseDeliveryStatus;
  closedAt?: string | null;
  closedBy?: string | null;
}

/** Top-level fields the PD form always saves. */
export interface ApplicantIndexFields {
  applicationNumber: string;
  applicantName: string;
  firmName?: string;
  financialInstitute?: string;
  categoryId?: string;
  constitution?: string;
  appliedAmount?: number;
  yearsInBusiness?: number;
  riskScore?: number;
}

/** A record as returned by the API. Older saves may nest form fields under `formData`. */
export type ApplicantRecord = ApplicantRecordMeta &
  Partial<ApplicantIndexFields> & {
    formData?: Record<string, unknown>;
    [formField: string]: unknown;
  };

/** What the case gallery and search work with after legacy records are normalised. */
export interface GalleryApplicant extends ApplicantRecordMeta, ApplicantIndexFields {
  isClosed: boolean;
  caseDeliveryStatus: CaseDeliveryStatus;
  preparedBy: string;
  /** Lender name, from `financialInstitute`. */
  bankName: string;
  /** Business category name resolved from `categoryId`. */
  categoryName: string;
  [formField: string]: unknown;
}

/** Body sent when creating or updating an applicant: the PD form's fields. */
export type ApplicantPayload = Partial<ApplicantIndexFields> & Record<string, unknown>;
