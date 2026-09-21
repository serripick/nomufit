export interface BusinessRecord {
  id: string;
  businessRegistrationNumber: string;
  businessName: string;
  representativeName: string;
  businessAddress: string;
  businessPhone: string;
  fiveOrMoreEmployees: boolean;
}

export type BusinessRecordInput = Omit<BusinessRecord, "id">;
