
export interface User {
  id: string;
  fullname?: string;
  username: string;
  gender?: boolean;
  email?: string;
  phone?: string;
  address?: string;
  role: { id: string, name: string };
  //ddax fix
  avatar?: string;
  status: string;
}