export interface InquiryRecord {
  id: string;
  createdAt: string;
  businessRegistrationNumber: string;
  businessName: string;
  contactName: string;
  contactPhone: string;
  message: string;
  status: "new" | "contacted" | "closed";
}

export type InquiryInput = Omit<InquiryRecord, "id" | "createdAt" | "status">;
