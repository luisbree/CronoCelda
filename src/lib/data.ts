import type { File, Category } from '@/types';

export const CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Work Documents', color: '#3B5998' },
  { id: 'cat-2', name: 'Personal Photos', color: '#008080' },
  { id: 'cat-3', name: 'Project Blueprints', color: '#8A2BE2' },
  { id: 'cat-4', name: 'Invoices', color: '#FF4500' },
  { id: 'cat-5', name: 'Archived Records', color: '#708090' },
];

export const FILES: File[] = [
  {
    id: 'file-1',
    name: 'Q4_Financial_Report.pdf',
    size: '1.2 MB',
    uploadedAt: '2024-07-22T14:30:00Z',
    category: CATEGORIES[0],
    tags: ['finance', 'report', 'quarterly'],
    type: 'document',
  },
  {
    id: 'file-2',
    name: 'summer_vacation_01.jpg',
    size: '4.5 MB',
    uploadedAt: '2024-07-22T10:15:00Z',
    category: CATEGORIES[1],
    tags: ['vacation', 'beach', 'summer'],
    type: 'image',
  },
  {
    id: 'file-3',
    name: 'Project_Alpha_Architecture.dwg',
    size: '15.8 MB',
    uploadedAt: '2024-07-21T18:00:00Z',
    category: CATEGORIES[2],
    tags: ['architecture', 'cad', 'blueprint'],
    type: 'document',
  },
  {
    id: 'file-4',
    name: 'Invoice_INV-00123.pdf',
    size: '88 KB',
    uploadedAt: '2024-07-21T09:05:00Z',
    category: CATEGORIES[3],
    tags: ['billing', 'client-x', 'payment'],
    type: 'document',
  },
    {
    id: 'file-5',
    name: 'Old_Client_Contract.docx',
    size: '256 KB',
    uploadedAt: '2023-01-15T11:45:00Z',
    category: CATEGORIES[4],
    tags: ['contract', 'legal', 'archive'],
    type: 'document',
  },
  {
    id: 'file-6',
    name: 'company_logo_final.png',
    size: '312 KB',
    uploadedAt: '2023-01-14T16:20:00Z',
    category: CATEGORIES[0],
    tags: ['branding', 'logo', 'design'],
    type: 'image',
  },
];
