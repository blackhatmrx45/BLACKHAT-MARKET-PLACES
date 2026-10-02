export type ProductCategory = 
  | 'Web Tools'
  | 'Developer Tools'
  | 'AI Tools'
  | 'Security Tools'
  | 'Productivity'
  | 'Educational Tools'
  | 'Utility Tools';

export type ProductStatus = 'AVAILABLE' | 'COMING SOON' | 'UPDATING' | 'SOLD OUT';

export interface Product {
  id: string;
  name: string;
  image: string;
  description: string;
  category: ProductCategory;
  version: string;
  platform: string;
  price: number;
  currency: 'LKR';
  status: ProductStatus;
  isDemo?: boolean;
  features: string[];
  requirements: string;
  license: string;
  fileType: string;
  lastUpdated: string;
  supportInfo: string;
}

export type FilterCategory = 'ALL' | 'WEB' | 'DEVELOPER' | 'AI' | 'SECURITY' | 'PRODUCTIVITY' | 'EDUCATION' | 'UTILITY';

export type SortOption = 'NEWEST' | 'PRICE_LOW_HIGH' | 'PRICE_HIGH_LOW' | 'NAME_A_Z';
