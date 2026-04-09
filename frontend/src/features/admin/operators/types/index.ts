export type OperatorStatus = 'online' | 'offline';

export interface Operator {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: OperatorStatus;
}

export interface NewOperatorPayload {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
}
