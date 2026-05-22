export class AuthError extends Error {
  constructor(
    public readonly code:
      | 'INVALID_INPUT'
      | 'INVALID_CREDENTIALS'
      | 'DUPLICATE_EMAIL'
      | 'UNAUTHORIZED'
      | 'FORBIDDEN',
    message: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
