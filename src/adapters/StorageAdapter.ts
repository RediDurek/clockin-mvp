// Defines the common interface that different storage backends must implement.

export interface Site {
  id: string;
  tenantId: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  active: boolean;
}

export interface Pause {
  start: number;
  end?: number;
}

export interface Shift {
  id: string;
  userId: string;
  siteId: string;
  startedAt: number;
  endedAt?: number;
  pauses: Pause[];
}

export interface SignInResult {
  userId: string;
  email: string;
  role: 'owner' | 'employee';
}

export interface StorageAdapter {
  signIn(email: string, pin: string): Promise<SignInResult | null>;
  listSites(): Promise<Site[]>;
  startShift(siteId: string, userId: string): Promise<Shift>;
  pauseShift(shiftId: string): Promise<void>;
  resumeShift(shiftId: string): Promise<void>;
  endShift(shiftId: string): Promise<Shift>;
  listShifts(userId: string): Promise<Shift[]>;
}
