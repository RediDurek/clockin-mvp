import type { StorageAdapter, Site, Shift, SignInResult, Pause } from './StorageAdapter';

// A naive in-memory storage adapter for development and demo purposes.
export class MockStorageAdapter implements StorageAdapter {
  // Hard-coded users for demonstration. PINs are stored in plain text here
  // but never logged or exposed elsewhere.
  private users = [
    { id: '1', email: 'owner@example.com', role: 'owner' as const, pin: '1234', tenantId: 't1' },
    { id: '2', email: 'worker@example.com', role: 'employee' as const, pin: '1234', tenantId: 't1' },
  ];

  // Mock sites belonging to a single tenant.
  private sites: Site[] = [
    { id: 'site1', tenantId: 't1', name: 'Site A', lat: 45.40797, lng: 11.88586, radius: 50, active: true },
    { id: 'site2', tenantId: 't1', name: 'Site B', lat: 45.4109, lng: 11.878, radius: 50, active: true },
  ];

  // In-memory shifts
  private shifts: Shift[] = [];

  async signIn(email: string, pin: string): Promise<SignInResult | null> {
    const user = this.users.find(u => u.email === email && u.pin === pin);
    if (!user) return null;
    return { userId: user.id, email: user.email, role: user.role };
  }

  async listSites(): Promise<Site[]> {
    return this.sites.filter(s => s.active);
  }

  async startShift(siteId: string, userId: string): Promise<Shift> {
    const id = `shift_${Date.now()}`;
    const newShift: Shift = {
      id,
      userId,
      siteId,
      startedAt: Date.now(),
      pauses: [],
    };
    this.shifts.push(newShift);
    return newShift;
  }

  async pauseShift(shiftId: string): Promise<void> {
    const shift = this.shifts.find(s => s.id === shiftId);
    if (shift && !shift.endedAt) {
      shift.pauses.push({ start: Date.now() });
    }
  }

  async resumeShift(shiftId: string): Promise<void> {
    const shift = this.shifts.find(s => s.id === shiftId);
    if (shift && shift.pauses.length > 0) {
      const pause = shift.pauses[shift.pauses.length - 1];
      if (pause && !pause.end) {
        pause.end = Date.now();
      }
    }
  }

  async endShift(shiftId: string): Promise<Shift> {
    const shift = this.shifts.find(s => s.id === shiftId);
    if (!shift) throw new Error('Shift not found');
    if (!shift.endedAt) {
      // Close any open pause
      const lastPause = shift.pauses[shift.pauses.length - 1];
      if (lastPause && !lastPause.end) {
        lastPause.end = Date.now();
      }
      shift.endedAt = Date.now();
    }
    return shift;
  }

  async listShifts(userId: string): Promise<Shift[]> {
    return this.shifts.filter(s => s.userId === userId);
  }
}
