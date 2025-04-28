
export interface Station {
  id: string;
  name: string;
  location: string;
  lastTestDate: string;
  nextDueDate: string;
  status: 'ok' | 'warning' | 'error';
}

export interface Test {
  id: string;
  date: string;
  type: string;
  result: 'pass' | 'fail';
  technician: string;
}

export interface Asset {
  id: string;
  name: string;
  serialNumber: string;
  type: string;
  lastInspection: string;
}

export interface StationStats {
  testsThisSeason: number;
  failRate: number;
  pending: number;
}
