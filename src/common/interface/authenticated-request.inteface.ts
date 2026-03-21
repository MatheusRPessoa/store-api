export interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    username: string;
    refreshToken?: string;
  };
}
