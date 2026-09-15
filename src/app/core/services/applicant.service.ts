import { Injectable, inject, signal } from '@angular/core';
import { supabase } from '../supabase/supabase-client';
import { Applicant } from '../models/applicant.model';
import { LoadingService } from './loading.service';
import { ActivityLogService } from './activity-log.service';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { resolveCurrentActor } from '../../shared/utils/activity-actor.util';

const BUCKET = 'applicant-photos';

@Injectable({ providedIn: 'root' })
export class ApplicantService {
  private loading = inject(LoadingService);
  private activityLog = inject(ActivityLogService);
  private auth = inject(AuthService);
  private userService = inject(UserService);

  readonly applicants = signal<Applicant[]>([]);

  constructor() {
    this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading.show();
    try {
      const { data, error } = await supabase
        .from('applicants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load applicants:', error.message);
        return;
      }
      this.applicants.set((data ?? []).map(this.fromRow));
    } finally {
      this.loading.hide();
    }
  }

  getById(id: string): Applicant | undefined {
    return this.applicants().find(a => a.id === id);
  }

  /** Uploads the passport-size photo to Supabase Storage and returns its storage path. */
  async uploadPhoto(file: File): Promise<string | null> {
    this.loading.show();
    try {
      const path = `${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file);
      if (error) {
        console.error('Failed to upload photo:', error.message);
        return null;
      }
      return path;
    } finally {
      this.loading.hide();
    }
  }

  async create(applicant: Omit<Applicant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Applicant | null> {
    this.loading.show();
    try {
      const { data, error } = await supabase.from('applicants').insert(this.toRow(applicant)).select().single();
      if (error) {
        console.error('Failed to create applicant:', error.message);
        return null;
      }
      await this.refresh();
      const created = this.fromRow(data);
      this.activityLog.log({
        ...resolveCurrentActor(this.auth, this.userService),
        action: 'Create',
        entityType: 'Personal Details',
        entityId: created.id,
        entityLabel: `${created.firstName} ${created.lastName}`
      });
      return created;
    } finally {
      this.loading.hide();
    }
  }

  async update(id: string, changes: Partial<Applicant>): Promise<void> {
    this.loading.show();
    try {
      const { error } = await supabase.from('applicants').update(this.toRow(changes)).eq('id', id);
      if (error) {
        console.error('Failed to update applicant:', error.message);
        return;
      }
      const label = this.getById(id);
      await this.refresh();
      this.activityLog.log({
        ...resolveCurrentActor(this.auth, this.userService),
        action: 'Update',
        entityType: 'Personal Details',
        entityId: id,
        entityLabel: label ? `${label.firstName} ${label.lastName}` : undefined
      });
    } finally {
      this.loading.hide();
    }
  }

  async delete(id: string): Promise<void> {
    this.loading.show();
    try {
      const applicant = this.getById(id);
      const { error } = await supabase.from('applicants').delete().eq('id', id);
      if (error) {
        console.error('Failed to delete applicant:', error.message);
        return;
      }
      if ((applicant as any)?.photoFilePath) {
        await supabase.storage.from(BUCKET).remove([(applicant as any).photoFilePath]);
      }
      await this.refresh();
      this.activityLog.log({
        ...resolveCurrentActor(this.auth, this.userService),
        action: 'Delete',
        entityType: 'Personal Details',
        entityId: id,
        entityLabel: applicant ? `${applicant.firstName} ${applicant.lastName}` : undefined
      });
    } finally {
      this.loading.hide();
    }
  }

  private toRow(a: Partial<Applicant> & { photoFilePath?: string }): Record<string, any> {
    const row: Record<string, any> = {};
    const map: Record<string, string> = {
      firstName: 'first_name', middleName: 'middle_name', lastName: 'last_name',
      gender: 'gender', genderSpecify: 'gender_specify', dob: 'dob',
      maritalStatus: 'marital_status', nationality: 'nationality',
      photoFileName: 'photo_file_name', photoFilePath: 'photo_file_path',
      email: 'email', phoneNumber: 'phone_number', alternatePhoneNumber: 'alternate_phone_number',
      emergencyContactName: 'emergency_contact_name', emergencyContactRelationship: 'emergency_contact_relationship',
      emergencyContactNumber: 'emergency_contact_number',
      currentAddressLine1: 'current_address_line1', currentAddressLine2: 'current_address_line2',
      currentCity: 'current_city', currentState: 'current_state', currentCounty: 'current_county',
      currentZipCode: 'current_zip_code',
      sameAsCurrentAddress: 'same_as_current_address', permanentAddressLine1: 'permanent_address_line1',
      permanentAddressLine2: 'permanent_address_line2', permanentCity: 'permanent_city',
      permanentState: 'permanent_state', permanentCounty: 'permanent_county', permanentZipCode: 'permanent_zip_code',
      driversLicenseNumber: 'drivers_license_number', driversLicenseState: 'drivers_license_state',
      passportNumber: 'passport_number', passportExpiryDate: 'passport_expiry_date',
      employerName: 'employer_name', employerAddress: 'employer_address', employerPhoneNumber: 'employer_phone_number',
      jobTitle: 'job_title', employmentStatus: 'employment_status', employmentType: 'employment_type',
      yearsAtCurrentJob: 'years_at_current_job', monthlySalary: 'monthly_salary', annualIncome: 'annual_income',
      otherIncomeSource: 'other_income_source', otherIncomeAmount: 'other_income_amount',
      numberOfDependents: 'number_of_dependents', spouseName: 'spouse_name',
      spouseEmploymentStatus: 'spouse_employment_status', spouseIncome: 'spouse_income',
      preferredLanguage: 'preferred_language', preferredCommunicationMethod: 'preferred_communication_method',
      preferredContactTime: 'preferred_contact_time', preferredNickname: 'preferred_nickname',
      additionalNotes: 'additional_notes', agreementConfirmed: 'agreement_confirmed'
    };

    for (const [camelKey, snakeKey] of Object.entries(map)) {
      const value = (a as any)[camelKey];
      if (value !== undefined) {
        row[snakeKey] = value === '' && snakeKey.endsWith('_date') ? null : value;
      }
    }
    return row;
  }

  private fromRow(row: any): Applicant & { photoFilePath?: string } {
    return {
      id: row.id,
      firstName: row.first_name,
      middleName: row.middle_name ?? undefined,
      lastName: row.last_name,
      gender: row.gender,
      genderSpecify: row.gender_specify ?? undefined,
      dob: row.dob,
      maritalStatus: row.marital_status,
      nationality: row.nationality,
      photoFileName: row.photo_file_name,
      photoFilePath: row.photo_file_path ?? undefined,
      email: row.email,
      phoneNumber: row.phone_number,
      alternatePhoneNumber: row.alternate_phone_number ?? undefined,
      emergencyContactName: row.emergency_contact_name,
      emergencyContactRelationship: row.emergency_contact_relationship,
      emergencyContactNumber: row.emergency_contact_number,
      currentAddressLine1: row.current_address_line1,
      currentAddressLine2: row.current_address_line2 ?? undefined,
      currentCity: row.current_city,
      currentState: row.current_state,
      currentCounty: row.current_county,
      currentZipCode: row.current_zip_code,
      sameAsCurrentAddress: row.same_as_current_address,
      permanentAddressLine1: row.permanent_address_line1 ?? undefined,
      permanentAddressLine2: row.permanent_address_line2 ?? undefined,
      permanentCity: row.permanent_city ?? undefined,
      permanentState: row.permanent_state ?? undefined,
      permanentCounty: row.permanent_county ?? undefined,
      permanentZipCode: row.permanent_zip_code ?? undefined,
      driversLicenseNumber: row.drivers_license_number ?? undefined,
      driversLicenseState: row.drivers_license_state ?? undefined,
      passportNumber: row.passport_number ?? undefined,
      passportExpiryDate: row.passport_expiry_date ?? undefined,
      employerName: row.employer_name,
      employerAddress: row.employer_address ?? undefined,
      employerPhoneNumber: row.employer_phone_number ?? undefined,
      jobTitle: row.job_title,
      employmentStatus: row.employment_status,
      employmentType: row.employment_type,
      yearsAtCurrentJob: row.years_at_current_job,
      monthlySalary: row.monthly_salary,
      annualIncome: row.annual_income ?? undefined,
      otherIncomeSource: row.other_income_source ?? undefined,
      otherIncomeAmount: row.other_income_amount ?? undefined,
      numberOfDependents: row.number_of_dependents,
      spouseName: row.spouse_name ?? undefined,
      spouseEmploymentStatus: row.spouse_employment_status ?? undefined,
      spouseIncome: row.spouse_income ?? undefined,
      preferredLanguage: row.preferred_language,
      preferredCommunicationMethod: row.preferred_communication_method,
      preferredContactTime: row.preferred_contact_time ?? undefined,
      preferredNickname: row.preferred_nickname ?? undefined,
      additionalNotes: row.additional_notes ?? undefined,
      agreementConfirmed: row.agreement_confirmed,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
