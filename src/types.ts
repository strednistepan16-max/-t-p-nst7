export interface Stop {
  id: string;
  name: string;
  zone: number;
  kmFromStart: number;
  minutesFromStart: number;
  arrivalMinutesFromStart?: number;
  isOnDemand?: boolean;
}

export interface TicketType {
  id: string;
  name: string;
  multiplier: number;
  category?: 'basic' | 'time' | 'group' | 'luggage' | 'special';
  badge?: string;
  description?: string;
}

export interface Route {
  id: string;
  number: string;
  name: string;
  stops: Stop[];
}

export interface MultilistekItem {
  type: TicketType;
  count: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Transaction {
  id: string;
  timestamp: Date;
  fromStop: string;
  toStop: string;
  ticketType: string;
  price: number;
  storno?: boolean;
  isMultilistek?: boolean;
  multilistekItems?: MultilistekItem[];
  totalPassengers?: number;
  paymentMethod?: string;
  ticketCode?: string;
  note?: string;
}

export interface Driver {
  id: string;
  name: string;
  pin: string;
}

export interface BusWindows {
  driverWindow: boolean;
  roofHatchFront: boolean;
  roofHatchRear: boolean;
  leftWindow1: boolean;
  leftWindow2: boolean;
  leftWindow3: boolean;
  rightWindow1: boolean;
  rightWindow2: boolean;
  rightWindow3: boolean;
}

