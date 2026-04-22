export interface Country {
  id: string;
  name: string;
  priority: number;
  status: string;
  notes?: string;
  pathways: Pathway[];
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface Pathway {
  id: string;
  countryId: string;
  type: string;
  requirements?: Record<string, unknown>;
  timeline?: string;
  costEstimate?: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  filePath: string;
  fileType?: string;
  fileSize?: number;
  category?: string;
  countryId?: string;
  expiryDate?: string;
  createdAt: string;
}
