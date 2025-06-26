export interface File {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  category: Category;
  tags: string[] | null;
  type: 'document' | 'image' | 'video' | 'audio' | 'other';
}

export interface Category {
  id: string;
  name: string;
  color: string;
}
