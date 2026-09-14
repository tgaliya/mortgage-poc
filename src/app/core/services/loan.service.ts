import { Injectable, signal } from '@angular/core';
import { supabase } from '../supabase/supabase-client';
import { Loan } from '../models/loan.model';

@Injectable({ providedIn: 'root' })
export class LoanService {
  readonly loans = signal<Loan[]>([]);

  constructor() {
    this.refresh();
  }

  async refresh(): Promise<void> {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load loans:', error.message);
      return;
    }
    this.loans.set((data ?? []).map(this.fromRow));
  }

  getById(id: string): Loan | undefined {
    return this.loans().find(l => l.id === id);
  }

  async create(loan: Omit<Loan, 'id' | 'createdAt' | 'updatedAt'>): Promise<Loan | null> {
    const { data, error } = await supabase.from('loans').insert(this.toRow(loan)).select().single();
    if (error) {
      console.error('Failed to create loan:', error.message);
      return null;
    }
    await this.refresh();
    return this.fromRow(data);
  }

  async update(id: string, changes: Partial<Loan>): Promise<void> {
    const { error } = await supabase.from('loans').update(this.toRow(changes)).eq('id', id);
    if (error) {
      console.error('Failed to update loan:', error.message);
      return;
    }
    await this.refresh();
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('loans').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete loan:', error.message);
      return;
    }
    await this.refresh();
  }

  private toRow(l: Partial<Loan>): Record<string, any> {
    const row: Record<string, any> = {};
    if (l.loanNumber !== undefined) row['loan_number'] = l.loanNumber;
    if (l.loanType !== undefined) row['loan_type'] = l.loanType;
    if (l.lienPosition !== undefined) row['lien_position'] = l.lienPosition;
    if (l.nextPaymentDueDate !== undefined) row['next_payment_due_date'] = l.nextPaymentDueDate || null;
    if (l.originalLoanAmount !== undefined) row['original_loan_amount'] = l.originalLoanAmount;
    if (l.investor !== undefined) row['investor'] = l.investor;
    if (l.loanPaymentDuration !== undefined) row['loan_payment_duration'] = l.loanPaymentDuration;
    if (l.loanMaturityDate !== undefined) row['loan_maturity_date'] = l.loanMaturityDate || null;
    if (l.lastPaymentDate !== undefined) row['last_payment_date'] = l.lastPaymentDate || null;
    if (l.unpaidPrincipalBalance !== undefined) row['unpaid_principal_balance'] = l.unpaidPrincipalBalance;
    if (l.loanStatus !== undefined) row['loan_status'] = l.loanStatus;
    return row;
  }

  private fromRow(row: any): Loan {
    return {
      id: row.id,
      loanNumber: row.loan_number,
      loanType: row.loan_type,
      lienPosition: row.lien_position ?? undefined,
      nextPaymentDueDate: row.next_payment_due_date ?? undefined,
      originalLoanAmount: row.original_loan_amount,
      investor: row.investor,
      loanPaymentDuration: row.loan_payment_duration,
      loanMaturityDate: row.loan_maturity_date ?? undefined,
      lastPaymentDate: row.last_payment_date ?? undefined,
      unpaidPrincipalBalance: row.unpaid_principal_balance,
      loanStatus: row.loan_status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
