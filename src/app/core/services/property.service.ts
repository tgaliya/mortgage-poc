import { Injectable, signal } from '@angular/core';
import { supabase } from '../supabase/supabase-client';
import { Property } from '../models/property.model';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  readonly properties = signal<Property[]>([]);

  constructor() {
    this.refresh();
  }

  async refresh(): Promise<void> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load properties:', error.message);
      return;
    }
    this.properties.set((data ?? []).map(this.fromRow));
  }

  getById(id: string): Property | undefined {
    return this.properties().find(p => p.id === id);
  }

  async create(property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property | null> {
    const { data, error } = await supabase
      .from('properties')
      .insert(this.toRow(property))
      .select()
      .single();

    if (error) {
      console.error('Failed to create property:', error.message);
      return null;
    }
    await this.refresh();
    return this.fromRow(data);
  }

  async update(id: string, changes: Partial<Property>): Promise<void> {
    const { error } = await supabase.from('properties').update(this.toRow(changes)).eq('id', id);
    if (error) {
      console.error('Failed to update property:', error.message);
      return;
    }
    await this.refresh();
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete property:', error.message);
      return;
    }
    await this.refresh();
  }

  private toRow(p: Partial<Property>): Record<string, any> {
    const row: Record<string, any> = {};
    if (p.propertyName !== undefined) row['property_name'] = p.propertyName;
    if (p.streetAddress !== undefined) row['street_address'] = p.streetAddress;
    if (p.addressLine2 !== undefined) row['address_line2'] = p.addressLine2;
    if (p.city !== undefined) row['city'] = p.city;
    if (p.state !== undefined) row['state'] = p.state;
    if (p.county !== undefined) row['county'] = p.county;
    if (p.zipCode !== undefined) row['zip_code'] = p.zipCode;
    if (p.ownerContactNumber !== undefined) row['owner_contact_number'] = p.ownerContactNumber;
    if (p.propertyStatus !== undefined) row['property_status'] = p.propertyStatus;
    if (p.occupancyStatus !== undefined) row['occupancy_status'] = p.occupancyStatus;
    if (p.amount !== undefined) row['amount'] = p.amount;
    if (p.propertyType !== undefined) row['property_type'] = p.propertyType;
    if (p.occupancyType !== undefined) row['occupancy_type'] = p.occupancyType;
    if (p.loanPurpose !== undefined) row['loan_purpose'] = p.loanPurpose;
    return row;
  }

  private fromRow(row: any): Property {
    return {
      id: row.id,
      propertyName: row.property_name,
      streetAddress: row.street_address,
      addressLine2: row.address_line2 ?? undefined,
      city: row.city,
      state: row.state,
      county: row.county,
      zipCode: row.zip_code,
      ownerContactNumber: row.owner_contact_number ?? undefined,
      propertyStatus: row.property_status,
      occupancyStatus: row.occupancy_status ?? undefined,
      amount: row.amount,
      propertyType: row.property_type ?? undefined,
      occupancyType: row.occupancy_type ?? undefined,
      loanPurpose: row.loan_purpose ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
