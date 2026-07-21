export interface Stop {
  id: string;
  name: string;
  zone: number;
  kmFromStart: number;
  minutesFromStart: number;
  isOnDemand?: boolean;
}

export interface TicketType {
  id: string;
  name: string;
  multiplier: number;
}

export interface Route {
  id: string;
  number: string;
  name: string;
  stops: Stop[];
}

export interface Transaction {
  id: string;
  timestamp: Date;
  fromStop: string;
  toStop: string;
  ticketType: string;
  price: number;
  storno?: boolean;
}

export interface Driver {
  id: string;
  name: string;
  pin: string;
}
