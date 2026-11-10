export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  avatar: string;
  quotaUsed: number;
  quotaTotal: number;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  message?: string;
  user?: User;
}
