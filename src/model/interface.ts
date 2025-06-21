export interface IResponse {
  status: 'Failure' | 'Success';
  message: string;
  code: number;
  payload: any | null;
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
}
