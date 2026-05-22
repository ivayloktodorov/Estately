export interface InquiryActionState {
  status: 'idle' | 'error' | 'success';
  message: string;
  fields?: {
    message?: string;
  };
  errors?: {
    message?: string;
  };
}
