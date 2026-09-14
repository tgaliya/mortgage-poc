import { Injectable, signal } from '@angular/core';
import { supabase } from '../supabase/supabase-client';
import { Borrower } from '../models/borrower.model';

/**
 * Borrower Information data layer - backed by Supabase (table: borrowers).
 * The signal acts as a local cache: refreshed on init and after every
 * write, so grids update immediately without a manual page refresh
 * (Global Rule 1.6).
 */
@Injectable({ providedIn: 'root' })
export class BorrowerService {
  readonly borrowers = signal<Borrower[]>([]);

  constructor() {
    this.refresh();
  }

  async refresh(): Promise<void> {
    const { data, error } = await supabase
      .from('borrowers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load borrowers:', error.message);
      return;
    }
    this.borrowers.set((data ?? []).map(this.fromRow));
  }

  getById(id: string): Borrower | undefined {
    return this.borrowers().find(b => b.id === id);
  }

  async create(borrower: Omit<Borrower, 'id' | 'createdAt' | 'updatedAt'>): Promise<Borrower | null> {
    const { data, error } = await supabase
      .from('borrowers')
      .insert(this.toRow(borrower))
      .select()
      .single();

    if (error) {
      console.error('Failed to create borrower:', error.message);
      return null;
    }
    await this.refresh();
    return this.fromRow(data);
  }

  async update(id: string, changes: Partial<Borrower>): Promise<void> {
    const { error } = await supabase
      .from('borrowers')
      .update(this.toRow(changes))
      .eq('id', id);

    if (error) {
      console.error('Failed to update borrower:', error.message);
      return;
    }
    await this.refresh();
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('borrowers').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete borrower:', error.message);
      return;
    }
    await this.refresh();
  }

  /** Maps camelCase app model -> snake_case DB row for insert/update. */
  private toRow(b: Partial<Borrower>): Record<string, any> {
    const row: Record<string, any> = {};
    if (b.firstName !== undefined) row['first_name'] = b.firstName;
    if (b.middleName !== undefined) row['middle_name'] = b.middleName;
    if (b.lastName !== undefined) row['last_name'] = b.lastName;
    if (b.email !== undefined) row['email'] = b.email;
    if (b.phoneNumber !== undefined) row['phone_number'] = b.phoneNumber;
    if (b.dob !== undefined) row['dob'] = b.dob;
    if (b.ssn !== undefined) row['ssn'] = b.ssn;
    if (b.gender !== undefined) row['gender'] = b.gender;
    if (b.genderSpecify !== undefined) row['gender_specify'] = b.genderSpecify;
    if (b.maritalStatus !== undefined) row['marital_status'] = b.maritalStatus;
    if (b.hasCoBorrower !== undefined) row['has_co_borrower'] = b.hasCoBorrower;
    if (b.coBorrower !== undefined) row['co_borrower'] = b.coBorrower ?? null;
    if (b.employmentStatus !== undefined) row['employment_status'] = b.employmentStatus;
    if (b.borrowerStatus !== undefined) row['borrower_status'] = b.borrowerStatus;
    return row;
  }

  /** Maps snake_case DB row -> camelCase app model. */
  private fromRow(row: any): Borrower {
    return {
      id: row.id,
      firstName: row.first_name,
      middleName: row.middle_name ?? undefined,
      lastName: row.last_name,
      email: row.email,
      phoneNumber: row.phone_number,
      dob: row.dob,
      ssn: row.ssn,
      gender: row.gender,
      genderSpecify: row.gender_specify ?? undefined,
      maritalStatus: row.marital_status ?? undefined,
      hasCoBorrower: row.has_co_borrower,
      coBorrower: row.co_borrower ?? undefined,
      employmentStatus: row.employment_status ?? undefined,
      borrowerStatus: row.borrower_status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
