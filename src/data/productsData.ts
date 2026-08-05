import { CategoryProduct } from '../types';

export const INITIAL_PRODUCTS: CategoryProduct[] = [
  // Hardware & Sanitary
  {
    id: 'prod-hw-01',
    categoryId: 'hardware',
    productName: 'CPVC & PVC Pipes & Fittings',
    productCategory: 'Plumbing',
    revenueContributionPct: 30,
    inventoryType: 'FAST_MOVING',
    averageMarginPct: 15,
    businessImportance: 'HIGH'
  },
  {
    id: 'prod-hw-02',
    categoryId: 'hardware',
    productName: 'Sanitaryware (Basins & Commodes)',
    productCategory: 'Sanitary',
    revenueContributionPct: 25,
    inventoryType: 'HIGH_VALUE',
    averageMarginPct: 22,
    businessImportance: 'HIGH'
  },
  {
    id: 'prod-hw-03',
    categoryId: 'hardware',
    productName: 'Electrical Switches & Wires',
    productCategory: 'Electricals',
    revenueContributionPct: 20,
    inventoryType: 'FAST_MOVING',
    averageMarginPct: 14,
    businessImportance: 'MEDIUM'
  },
  {
    id: 'prod-hw-04',
    categoryId: 'hardware',
    productName: 'Paints & Putty',
    productCategory: 'Paints',
    revenueContributionPct: 15,
    inventoryType: 'FAST_MOVING',
    averageMarginPct: 12,
    businessImportance: 'MEDIUM'
  },
  {
    id: 'prod-hw-05',
    categoryId: 'hardware',
    productName: 'Hand Tools & Fasteners',
    productCategory: 'Tools',
    revenueContributionPct: 10,
    inventoryType: 'SLOW_MOVING',
    averageMarginPct: 28,
    businessImportance: 'LOW'
  },

  // Kirana
  {
    id: 'prod-kr-01',
    categoryId: 'kirana',
    productName: 'Atta, Rice, Dal & Sugar (Loose/Packaged)',
    productCategory: 'Staples',
    revenueContributionPct: 45,
    inventoryType: 'FAST_MOVING',
    averageMarginPct: 8,
    businessImportance: 'HIGH'
  },
  {
    id: 'prod-kr-02',
    categoryId: 'kirana',
    productName: 'Branded FMCG & Packaged Foods',
    productCategory: 'FMCG',
    revenueContributionPct: 30,
    inventoryType: 'FAST_MOVING',
    averageMarginPct: 12,
    businessImportance: 'HIGH'
  },
  {
    id: 'prod-kr-03',
    categoryId: 'kirana',
    productName: 'Personal Care & Soaps',
    productCategory: 'Toiletries',
    revenueContributionPct: 15,
    inventoryType: 'FAST_MOVING',
    averageMarginPct: 16,
    businessImportance: 'MEDIUM'
  },
  {
    id: 'prod-kr-04',
    categoryId: 'kirana',
    productName: 'Beverages, Dairy & Cold Drinks',
    productCategory: 'Cold Storage',
    revenueContributionPct: 10,
    inventoryType: 'PERISHABLE',
    averageMarginPct: 18,
    businessImportance: 'MEDIUM'
  },

  // Apparel
  {
    id: 'prod-ap-01',
    categoryId: 'apparel',
    productName: 'Sarees & Ethnic Suit Sets',
    productCategory: 'Ethnic Wear',
    revenueContributionPct: 40,
    inventoryType: 'HIGH_VALUE',
    averageMarginPct: 32,
    businessImportance: 'HIGH'
  },
  {
    id: 'prod-ap-02',
    categoryId: 'apparel',
    productName: 'Men\'s Shirts & Trousers',
    productCategory: 'Menswear',
    revenueContributionPct: 35,
    inventoryType: 'FAST_MOVING',
    averageMarginPct: 24,
    businessImportance: 'HIGH'
  },
  {
    id: 'prod-ap-03',
    categoryId: 'apparel',
    productName: 'Kids Wear & Casuals',
    productCategory: 'Kidswear',
    revenueContributionPct: 25,
    inventoryType: 'FAST_MOVING',
    averageMarginPct: 28,
    businessImportance: 'MEDIUM'
  },

  // Pharmacy
  {
    id: 'prod-ph-01',
    categoryId: 'pharmacy',
    productName: 'Ethical Prescription Medicines (Rx)',
    productCategory: 'Prescription Drugs',
    revenueContributionPct: 60,
    inventoryType: 'FAST_MOVING',
    averageMarginPct: 16,
    businessImportance: 'HIGH'
  },
  {
    id: 'prod-ph-02',
    categoryId: 'pharmacy',
    productName: 'Generic Medicines',
    productCategory: 'Generics',
    revenueContributionPct: 20,
    inventoryType: 'FAST_MOVING',
    averageMarginPct: 45,
    businessImportance: 'HIGH'
  },
  {
    id: 'prod-ph-03',
    categoryId: 'pharmacy',
    productName: 'OTC & Wellness Products',
    productCategory: 'OTC',
    revenueContributionPct: 20,
    inventoryType: 'FAST_MOVING',
    averageMarginPct: 22,
    businessImportance: 'MEDIUM'
  }
];
