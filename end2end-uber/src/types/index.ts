export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'PASSENGER' | 'DRIVER';
}

export interface Trip {
  id: number;
  passengerId: number;
  driverId?: number | null;
  pickupAddress: string;
  dropoffAddress: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  passenger?: { firstName: string; lastName: string; };
  driver?: { firstName: string; lastName: string; rating?: number; } | null;
}