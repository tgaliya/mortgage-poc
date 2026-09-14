export type DocumentType =
  | 'Identity Proof' | 'Income Proof' | 'Bank Statement' | 'Property Document'
  | 'Loan Agreement' | 'Tax Document' | 'Other';

export type DocumentStatus = 'Pending Review' | 'Approved' | 'Rejected' | 'Resubmission Required';

/** Dependent dropdown: Document Sub Type options change based on Document Type. */
export const DOCUMENT_SUB_TYPE_MAP: Record<DocumentType, string[]> = {
  'Identity Proof': ['Passport', "Driver's License", 'SSN Card', 'State ID'],
  'Income Proof': ['Pay Stub', 'W-2 Form', 'Employment Letter', '1099 Form'],
  'Bank Statement': ['Checking Account', 'Savings Account', 'Investment Account'],
  'Property Document': ['Deed', 'Title Report', 'Appraisal Report', 'Survey'],
  'Loan Agreement': ['Promissory Note', 'Mortgage Note', 'Loan Estimate', 'Closing Disclosure'],
  'Tax Document': ['Tax Return', 'Property Tax Bill', 'Tax Transcript'],
  'Other': ['Miscellaneous']
};

export interface AppDocument {
  id: string;
  documentName: string;
  documentType: DocumentType;
  documentSubType: string;
  documentNumber?: string;
  documentDate?: string;
  documentDescription?: string;
  documentStatus: DocumentStatus;
  fileName: string;
  filePath?: string;
  fileSizeBytes: number;
  createdAt: string;
  updatedAt: string;
}
