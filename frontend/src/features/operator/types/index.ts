export type SenderType = 'client' | 'operator' | 'system';

export interface Message {
  id?: string;
  senderId: string;
  senderType: SenderType;
  content: string;
  createdAt: string;
}

export interface Room {
  id: string;
  clientName: string;
  clientContact: string;
  topic: string;
  status: 'waiting' | 'active' | 'closed';
  operatorId?: string;
  clientOnline?: boolean;
  createdAt: string;
  messages?: Message[];
}

export type OperatorTab = 'active' | 'closed';
