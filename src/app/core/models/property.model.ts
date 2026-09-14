export type PropertyStatus = 'Active' | 'Inactive';
export type OccupancyStatus = 'Ready to Move' | 'Under Construction' | 'On Hold' | 'Yet to Start';
export type PropertyType = 'Single Family' | 'Condo' | 'Multi-unit';
export type OccupancyType = 'Owner Occupied' | 'Second Home' | 'Investment Property';
export type LoanPurpose = 'Purchase' | 'Refinance';

export interface Property {
  id: string;
  propertyName: string;
  streetAddress: string;
  addressLine2?: string;
  city: string;
  state: string;
  county: string;
  zipCode: string;
  ownerContactNumber?: string;
  propertyStatus: PropertyStatus;
  occupancyStatus?: OccupancyStatus;
  amount: string;
  propertyType?: PropertyType;
  occupancyType?: OccupancyType;
  loanPurpose?: LoanPurpose;
  createdAt: string;
  updatedAt: string;
}
