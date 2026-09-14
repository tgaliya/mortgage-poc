export type LienPosition = '1st' | '2nd' | '3rd' | '4th' | '5th' | 'Other';
export type Investor = 'Bank Owned' | 'FHLMC' | 'FNMA' | 'Other' | 'Fannie Mac' | 'Federal Housing Administration';
export type LoanStatus = 'Active' | 'Paid Off' | 'Delinquent' | 'In Default' | 'Foreclosure' | 'Closed';

export interface Loan {
  id: string;
  loanNumber: string;
  loanType: string;
  lienPosition?: LienPosition;
  nextPaymentDueDate?: string;
  originalLoanAmount: string;
  investor: Investor;
  loanPaymentDuration: string;
  loanMaturityDate?: string;
  lastPaymentDate?: string;
  unpaidPrincipalBalance: string;
  loanStatus: LoanStatus;
  createdAt: string;
  updatedAt: string;
}
