export interface Company {
  id: string;
  name: string;
}

export interface Driver {
  id: string;
  name: string;
  role: string;
  status: string;
  truck: string;
  phone: string;
  license: string;
  medical: string;
  location: string;
  href: string;
}

export interface Truck {
  id: string;
  unitNumber: string;
  status: string;
  driverId?: string;
  location?: string;
}

export interface Load {
  id: string;
  reference: string;
  status: string;
  driverId?: string;
  truckId?: string;
  origin: string;
  destination: string;
}

export interface Invoice {
  id: string;
  reference: string;
  status: string;
  amount: number;
  dueDate: string;
}

export interface Document {
  id: string;
  type: string;
  status: string;
  expiresAt?: string;
  entityId: string;
}
