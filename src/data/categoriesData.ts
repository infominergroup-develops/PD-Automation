import { BusinessCategory } from '../types';

export const INITIAL_CATEGORIES: BusinessCategory[] = [
  {
    id: 'hardware',
    name: 'Hardware & Sanitary',
    icon: '🔧',
    description: 'Dealers in sanitary ware, piping, electrical fittings, tiles, paints, and tools.',
    industryGroup: 'Retail & Wholesale Trade',
    typicalMarginMin: 12,
    typicalMarginMax: 22,
    requiredDocs: ['GST Certificate', 'Shop License', 'Trade License', 'Supplier Invoices', 'Bank Statements'],
    validationRules: [
      {
        ruleId: 'HW-01',
        field: 'gross_rev',
        operator: 'RATIO_CHECK',
        value: 10, // Stock turnover ratio
        message: 'Gross revenue is disproportionately higher than current inventory value (Inventory turnover > 10x).',
        severity: 'HIGH'
      },
      {
        ruleId: 'HW-02',
        field: 'pct_retail',
        operator: 'BETWEEN',
        value: [0, 100],
        message: 'Sum of retail and wholesale percentages must equal 100%.',
        severity: 'MEDIUM'
      }
    ],
    riskParameters: [
      { parameter: 'Contractor Association', weight: 0.25, description: 'Ties with local plumbers, painters, and civil contractors.' },
      { parameter: 'Stock Obsolescence', weight: 0.2, description: 'Inventory aging for slow-moving sanitaryware.' },
      { parameter: 'Brand Dealership', weight: 0.2, description: 'Official dealership for Jaquar, Asian Paints, Finolex, etc.' }
    ]
  },
  {
    id: 'kirana',
    name: 'Kirana / General Store',
    icon: '🏪',
    description: 'Retail grocery, daily essentials, packaged food, beverages, and personal care products.',
    industryGroup: 'Essential Retail Trade',
    typicalMarginMin: 8,
    typicalMarginMax: 16,
    requiredDocs: ['FSSAI License', 'Shop & Establishment Certificate', 'UPI QR Soundbox Statements', 'Purchase Bills'],
    validationRules: [
      {
        ruleId: 'KR-01',
        field: 'xchk_a',
        operator: 'GT',
        value: 15,
        message: 'Daily customer footfall under 15 for a Kirana store is atypically low.',
        severity: 'MEDIUM'
      },
      {
        ruleId: 'KR-02',
        field: 'gross_rev',
        operator: 'RATIO_CHECK',
        value: 0.18, // Max net profit margin
        message: 'Declared gross profit margin exceeds 20%, which is rare for standard FMCG staples.',
        severity: 'HIGH'
      }
    ],
    riskParameters: [
      { parameter: 'Location & Footfall Density', weight: 0.35, description: 'Proximity to residential societies and high footfall streets.' },
      { parameter: 'UPI Digital Transaction Share', weight: 0.25, description: 'Volume of digital payments vs cash.' },
      { parameter: 'Stock Rotation Speed', weight: 0.2, description: 'Freshness of packaged goods and perishable staples.' }
    ]
  },
  {
    id: 'apparel',
    name: 'Apparel & Footwear',
    icon: '👗',
    description: 'Garment retail, ethnic wear, ready-made clothing, western wear, and footwear stores.',
    industryGroup: 'Retail Trade',
    typicalMarginMin: 18,
    typicalMarginMax: 35,
    requiredDocs: ['GSTIN Certificate', 'Shop License', 'Vendor Invoices', 'POS / Billing System Statements'],
    validationRules: [
      {
        ruleId: 'AP-01',
        field: 'inv_value',
        operator: 'GT',
        value: 100000,
        message: 'Inventory value is below ₹1,00,000 for a standalone garment showroom.',
        severity: 'MEDIUM'
      }
    ],
    riskParameters: [
      { parameter: 'Festive Seasonality', weight: 0.3, description: 'Revenue concentration during Diwali, Eid, Wedding season.' },
      { parameter: 'Fashion Trend Risk', weight: 0.25, description: 'Dead stock risk due to changing fashion trends.' }
    ]
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy & Medicals',
    icon: '💊',
    description: 'Retail chemistry, prescription medicines, OTC drugs, medical equipment, and healthcare products.',
    industryGroup: 'Healthcare & Pharma',
    typicalMarginMin: 14,
    typicalMarginMax: 25,
    requiredDocs: ['Drug License (Form 20/21)', 'Registered Pharmacist Degree/Certificate', 'GSTIN', 'Wholesale Purchase Registers'],
    validationRules: [
      {
        ruleId: 'PH-01',
        field: 'drug_licence',
        operator: 'EQ',
        value: 1,
        message: 'CRITICAL: Operating a pharmacy without a valid Drug License is illegal.',
        severity: 'HIGH'
      }
    ],
    riskParameters: [
      { parameter: 'Nearby Clinic/Hospital Tie-ups', weight: 0.4, description: 'Proximity and prescription inflow from doctors.' },
      { parameter: 'Cold Chain Maintenance', weight: 0.2, description: 'Refrigerator / AC infrastructure for vaccines & insulin.' }
    ]
  },
  {
    id: 'restaurant',
    name: 'Restaurant & Food Business',
    icon: '🍽️',
    description: 'Dine-in restaurants, quick service outlets, bakeries, food stalls, and catering units.',
    industryGroup: 'Hospitality & Food Services',
    typicalMarginMin: 22,
    typicalMarginMax: 40,
    requiredDocs: ['FSSAI License', 'Health NOC / Municipal License', 'Swiggy / Zomato Merchant Statements', 'GSTIN'],
    validationRules: [
      {
        ruleId: 'RS-01',
        field: 'gas_cylinders',
        operator: 'GT',
        value: 2,
        message: 'Declared restaurant revenue requires a minimum monthly commercial gas consumption.',
        severity: 'MEDIUM'
      }
    ],
    riskParameters: [
      { parameter: 'Hygiene & FSSAI Compliance', weight: 0.3, description: 'Regulatory cleanliness standards and licensing.' },
      { parameter: 'Online Delivery Platform Dependency', weight: 0.25, description: 'Share of Swiggy/Zomato orders and platform commissions.' }
    ]
  },
  {
    id: 'transport',
    name: 'Transport & Logistics',
    icon: '🚛',
    description: 'Goods transport, commercial fleet operators, auto logistics, and local delivery contractors.',
    industryGroup: 'Logistics & Transport',
    typicalMarginMin: 12,
    typicalMarginMax: 22,
    requiredDocs: ['Vehicle RC Books', 'National Permits', 'Commercial Driving License', 'Freight Invoices', 'Diesel Bills'],
    validationRules: [
      {
        ruleId: 'TR-01',
        field: 'cost_fuel',
        operator: 'GT',
        value: 30,
        message: 'Fuel expenses typically constitute 35% - 55% of gross freight revenue.',
        severity: 'HIGH'
      }
    ],
    riskParameters: [
      { parameter: 'Fleet Ownership vs Loan Encumbrance', weight: 0.35, description: 'Number of loan-free vehicles vs financed trucks.' },
      { parameter: 'Route Contract Tenure', weight: 0.25, description: 'Long-term corporate tie-ups vs spot market trips.' }
    ]
  },
  {
    id: 'carpentry',
    name: 'Carpentry & Furniture',
    icon: '🪑',
    description: 'Wooden furniture manufacturing, modular interior work, upholstery, and custom woodworking.',
    industryGroup: 'Manufacturing & Artisans',
    typicalMarginMin: 20,
    typicalMarginMax: 35,
    requiredDocs: ['Workshop License', 'Client Work Orders', 'Raw Material (Wood/Ply) Invoices', 'Bank Statements'],
    validationRules: [
      {
        ruleId: 'CP-01',
        field: 'wip_value',
        operator: 'GT',
        value: 10000,
        message: 'Work in progress furniture stock must be consistent with declared monthly job orders.',
        severity: 'MEDIUM'
      }
    ],
    riskParameters: [
      { parameter: 'Skilled Labour Dependency', weight: 0.3, description: 'Retention of master carpenters and craftsmen.' },
      { parameter: 'Advance Payment Collection', weight: 0.2, description: 'Standard advance taken from clients before raw material purchase.' }
    ]
  },
  {
    id: 'contractor',
    name: 'Civil & Interior Contractor',
    icon: '🏗️',
    description: 'Civil construction contractors, renovation workers, electrical & plumbing sub-contractors.',
    industryGroup: 'Construction & Real Estate Services',
    typicalMarginMin: 15,
    typicalMarginMax: 28,
    requiredDocs: ['GSTIN', 'Contract Agreements / Work Orders', 'Labour Salary Receipts', 'Bank Statements'],
    validationRules: [
      {
        ruleId: 'CN-01',
        field: 'ongoing_projects',
        operator: 'GT',
        value: 1,
        message: 'Active ongoing work orders required to justify claimed monthly revenue.',
        severity: 'HIGH'
      }
    ],
    riskParameters: [
      { parameter: 'Working Capital Cycle', weight: 0.4, description: 'Payment delay from main builders and clients.' },
      { parameter: 'Machinery Ownership', weight: 0.2, description: 'Concrete mixers, scaffolding, laser tools.' }
    ]
  },
  {
    id: 'diagnostic',
    name: 'Diagnostic Lab & Clinic',
    icon: '🏥',
    description: 'Pathology testing labs, radiology clinics, ultrasound centers, and polyclinics.',
    industryGroup: 'Healthcare Services',
    typicalMarginMin: 25,
    typicalMarginMax: 45,
    requiredDocs: ['Medical Council Registration', 'NABL / Bio-Medical Waste NOC', 'Equipment Lease/Invoice Deeds'],
    validationRules: [
      {
        ruleId: 'DG-01',
        field: 'med_reg',
        operator: 'GT',
        value: 0,
        message: 'Medical registration number mandatory for clinic operator.',
        severity: 'HIGH'
      }
    ],
    riskParameters: [
      { parameter: 'Doctor Referral Network', weight: 0.35, description: 'Inflow of test recommendations from neighborhood practitioners.' },
      { parameter: 'Equipment Technology Age', weight: 0.25, description: 'Condition of automated analyzers and scanners.' }
    ]
  },
  {
    id: 'electronics',
    name: 'Electronics Repair & Sales',
    icon: '📱',
    description: 'Mobile repairing, laptop/PC servicing, home appliance repairs, and accessory retail.',
    industryGroup: 'Service & Retail',
    typicalMarginMin: 25,
    typicalMarginMax: 45,
    requiredDocs: ['Shop License', 'Spares Purchase Bills', 'Service Register / CRM Logs'],
    validationRules: [],
    riskParameters: [
      { parameter: 'Technician Skill Certification', weight: 0.3, description: 'In-house chip-level soldering and micro-repair capability.' }
    ]
  },
  {
    id: 'fabrication',
    name: 'Industrial Fabrication',
    icon: '⚙️',
    description: 'Metal fabrication, welding, lathe machining, structural steel work, and gate/grill making.',
    industryGroup: 'Small Scale Manufacturing',
    typicalMarginMin: 18,
    typicalMarginMax: 30,
    requiredDocs: ['Factory License / MSME Udyam', 'Electricity Bill (Commercial)', 'Steel Invoices'],
    validationRules: [],
    riskParameters: [
      { parameter: 'Power Connection Load', weight: 0.35, description: '3-Phase industrial electricity load adequacy.' }
    ]
  },
  {
    id: 'garage',
    name: 'Garage & Auto Workshop',
    icon: '🚗',
    description: 'Two-wheeler and four-wheeler repair workshop, denting/painting, auto spares, and washing center.',
    industryGroup: 'Auto Services',
    typicalMarginMin: 20,
    typicalMarginMax: 38,
    requiredDocs: ['Workshop License', 'Spares Distributor Bills', 'Insurance Tie-up Letters'],
    validationRules: [],
    riskParameters: [
      { parameter: 'Cashless Insurance Tie-ups', weight: 0.3, description: 'Official tie-up with ICICI Lombard, Digit, HDFC ERGO.' }
    ]
  },
  {
    id: 'manufacturing',
    name: 'General Manufacturing',
    icon: '🏭',
    description: 'Plastic molding, packaging units, food processing, footwear mfg, and light engineering.',
    industryGroup: 'Manufacturing',
    typicalMarginMin: 15,
    typicalMarginMax: 26,
    requiredDocs: ['Factory License', 'Pollution Control Board NOC', 'Udyam Certificate', 'GSTIN'],
    validationRules: [],
    riskParameters: [
      { parameter: 'Raw Material Price Volatility', weight: 0.3, description: 'Sensitivity to polymer/granule or metal prices.' }
    ]
  },
  {
    id: 'service',
    name: 'General Services',
    icon: '🛠️',
    description: 'Dry cleaning, laundry, printing press, photo studio, event management, and consultancy.',
    industryGroup: 'Services',
    typicalMarginMin: 30,
    typicalMarginMax: 55,
    requiredDocs: ['Shop License', 'Machinery Invoices', 'Client Service Contracts'],
    validationRules: [],
    riskParameters: [
      { parameter: 'Repeat Customer Rate', weight: 0.3, description: 'Subscription or regular monthly retainer client base.' }
    ]
  },
  {
    id: 'trade',
    name: 'General Wholesale Trade',
    icon: '🛒',
    description: 'B2B trading, commodity wholesaling, distribution agency, and bulk merchandising.',
    industryGroup: 'Wholesale Trade',
    typicalMarginMin: 5,
    typicalMarginMax: 12,
    requiredDocs: ['GSTIN', 'Audited Financials', 'Godown Lease Agreement', 'Bank Statements'],
    validationRules: [],
    riskParameters: [
      { parameter: 'Working Capital Days', weight: 0.4, description: 'Debtor collection days vs Creditor payment period.' }
    ]
  },
  {
    id: 'painter',
    name: 'Painter & Decorator',
    icon: '🖌️',
    description: 'Wall painting contractor, waterproofing specialist, texture coating, and interior painting.',
    industryGroup: 'Artisan Services',
    typicalMarginMin: 25,
    typicalMarginMax: 40,
    requiredDocs: ['Asian Paints / Berger Dealer Token Statements', 'Client Payment Receipts'],
    validationRules: [],
    riskParameters: [
      { parameter: 'Paint Dealer Loyalty Points', weight: 0.3, description: 'Verification via Master Painter app tier/points.' }
    ]
  },
  {
    id: 'perishable',
    name: 'Perishable Goods Vendor',
    icon: '🥦',
    description: 'Fruit & vegetable vendors, dairy booths, poultry/meat shops, and flower merchants.',
    industryGroup: 'Perishable Retail',
    typicalMarginMin: 15,
    typicalMarginMax: 28,
    requiredDocs: ['Mandi Mandi Procurement Receipts', 'FSSAI Registration'],
    validationRules: [],
    riskParameters: [
      { parameter: 'Daily Spoilage Wastage', weight: 0.4, description: 'Percentage of inventory loss due to decay or weather.' }
    ]
  },
  {
    id: 'salon',
    name: 'Salon & Beauty Parlour',
    icon: '💇',
    description: 'Beauty salons, unisex parlours, bridal studios, spa, and barber shops.',
    industryGroup: 'Personal Care Services',
    typicalMarginMin: 35,
    typicalMarginMax: 60,
    requiredDocs: ['Beautician Certification', 'Shop License', 'Product Brand Invoices'],
    validationRules: [],
    riskParameters: [
      { parameter: 'UrbanCompany / Platform Presence', weight: 0.3, description: 'Rating and gig volume on door-step apps.' }
    ]
  },
  {
    id: 'sweets',
    name: 'Sweets & Bakery',
    icon: '🍰',
    description: 'Sweet shops (mithai), cake bakeries, snack corners, and confectionery manufacturing.',
    industryGroup: 'Food & Sweets',
    typicalMarginMin: 25,
    typicalMarginMax: 42,
    requiredDocs: ['FSSAI License', 'Commercial Gas Connection Bills', 'Milk/Khoya Supplier Vouchers'],
    validationRules: [],
    riskParameters: [
      { parameter: 'Milk & Ghee Procurement', weight: 0.35, description: 'Direct dairy tie-up vs market procurement.' }
    ]
  },
  {
    id: 'tailoring',
    name: 'Tailoring & Embroidery',
    icon: '🧵',
    description: 'Bespoke tailoring, boutique stitching, embroidery work, and alteration shops.',
    industryGroup: 'Textile & Apparel Services',
    typicalMarginMin: 35,
    typicalMarginMax: 55,
    requiredDocs: ['Sewing Machine Invoices', 'Order Register'],
    validationRules: [],
    riskParameters: [
      { parameter: 'Machine Count & Type', weight: 0.3, description: 'Number of overlock, interlock, and computerized embroidery machines.' }
    ]
  },
  {
    id: 'textile',
    name: 'Textile & Handloom Unit',
    icon: '🧶',
    description: 'Powerloom, handloom weaving, cloth dyeing, grey fabric trading, and saree printing.',
    industryGroup: 'Textile Manufacturing',
    typicalMarginMin: 10,
    typicalMarginMax: 20,
    requiredDocs: ['GSTIN', 'Power Bill for Looms', 'Yarn Purchase Invoices'],
    validationRules: [],
    riskParameters: [
      { parameter: 'Loom Operational Capacity', weight: 0.4, description: 'Number of active looms running 24x7 vs idle machines.' }
    ]
  }
];
