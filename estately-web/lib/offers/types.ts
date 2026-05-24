export interface OfferActionState {
  status: 'idle' | 'error' | 'success';
  message: string;
  fields?: {
    amount?: string;
    message?: string;
  };
  errors?: {
    amount?: string;
    message?: string;
  };
}
