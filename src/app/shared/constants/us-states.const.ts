export interface UsState {
  code: string;
  name: string;
  /** true for the 50 states; false for DC and the 5 territories. */
  isState: boolean;
}

/** 50 states + DC + the 5 populated US territories, sorted alphabetically by name. */
export const US_STATES: UsState[] = [
  { code: 'AL', name: 'Alabama', isState: true },
  { code: 'AK', name: 'Alaska', isState: true },
  { code: 'AS', name: 'American Samoa', isState: false },
  { code: 'AZ', name: 'Arizona', isState: true },
  { code: 'AR', name: 'Arkansas', isState: true },
  { code: 'CA', name: 'California', isState: true },
  { code: 'CO', name: 'Colorado', isState: true },
  { code: 'CT', name: 'Connecticut', isState: true },
  { code: 'DE', name: 'Delaware', isState: true },
  { code: 'DC', name: 'District of Columbia', isState: false },
  { code: 'FL', name: 'Florida', isState: true },
  { code: 'GA', name: 'Georgia', isState: true },
  { code: 'GU', name: 'Guam', isState: false },
  { code: 'HI', name: 'Hawaii', isState: true },
  { code: 'ID', name: 'Idaho', isState: true },
  { code: 'IL', name: 'Illinois', isState: true },
  { code: 'IN', name: 'Indiana', isState: true },
  { code: 'IA', name: 'Iowa', isState: true },
  { code: 'KS', name: 'Kansas', isState: true },
  { code: 'KY', name: 'Kentucky', isState: true },
  { code: 'LA', name: 'Louisiana', isState: true },
  { code: 'ME', name: 'Maine', isState: true },
  { code: 'MD', name: 'Maryland', isState: true },
  { code: 'MA', name: 'Massachusetts', isState: true },
  { code: 'MI', name: 'Michigan', isState: true },
  { code: 'MN', name: 'Minnesota', isState: true },
  { code: 'MS', name: 'Mississippi', isState: true },
  { code: 'MO', name: 'Missouri', isState: true },
  { code: 'MT', name: 'Montana', isState: true },
  { code: 'NE', name: 'Nebraska', isState: true },
  { code: 'NV', name: 'Nevada', isState: true },
  { code: 'NH', name: 'New Hampshire', isState: true },
  { code: 'NJ', name: 'New Jersey', isState: true },
  { code: 'NM', name: 'New Mexico', isState: true },
  { code: 'NY', name: 'New York', isState: true },
  { code: 'NC', name: 'North Carolina', isState: true },
  { code: 'ND', name: 'North Dakota', isState: true },
  { code: 'MP', name: 'Northern Mariana Islands', isState: false },
  { code: 'OH', name: 'Ohio', isState: true },
  { code: 'OK', name: 'Oklahoma', isState: true },
  { code: 'OR', name: 'Oregon', isState: true },
  { code: 'PA', name: 'Pennsylvania', isState: true },
  { code: 'PR', name: 'Puerto Rico', isState: false },
  { code: 'RI', name: 'Rhode Island', isState: true },
  { code: 'SC', name: 'South Carolina', isState: true },
  { code: 'SD', name: 'South Dakota', isState: true },
  { code: 'TN', name: 'Tennessee', isState: true },
  { code: 'TX', name: 'Texas', isState: true },
  { code: 'UT', name: 'Utah', isState: true },
  { code: 'VT', name: 'Vermont', isState: true },
  { code: 'VI', name: 'U.S. Virgin Islands', isState: false },
  { code: 'VA', name: 'Virginia', isState: true },
  { code: 'WA', name: 'Washington', isState: true },
  { code: 'WV', name: 'West Virginia', isState: true },
  { code: 'WI', name: 'Wisconsin', isState: true },
  { code: 'WY', name: 'Wyoming', isState: true }
];

/** Just the 50 states - no DC, no territories. */
export const US_STATES_ONLY: UsState[] = US_STATES.filter(s => s.isState);
