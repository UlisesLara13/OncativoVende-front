export interface PaymentRequest {
  amount: number;
  description: string;
  payerEmail?: string;
  items?: PaymentItem[];
}

export interface PaymentItem {
  title: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface PaymentResponse {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
}