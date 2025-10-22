
export interface User {
  id: string;
  username: string | null;
  fullName: string | null;
  email: string;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  gender: boolean | null;
  address: string | null;
  avatarUrl: string | null;
  role: string;            // "driver", "admin", ...
  roleId: string;
  status: string;
  googleId?: string | null;
  createdAt?: string;
}
