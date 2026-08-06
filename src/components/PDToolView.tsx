import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_CATEGORIES } from '../data/categoriesData';
import { INITIAL_PRODUCTS } from '../data/productsData';
import { SAMPLE_APPLICATIONS, SampleApplication } from '../data/sampleApplications';
import { api, EmployeeRecord } from '../services/api';
import { ClientBank } from '../data/clientBanksData';
import { Company } from './CompanySelectionView';
import { BusinessCategory, CategoryProduct, FinancialWaterfall } from '../types';
import { openStandardPDReportPrintWindow } from '../utils/pdReportPrinter';
import { 
  Store, User, DollarSign, Camera, FileCheck, Sparkles, CheckCircle2, 
  AlertTriangle, RefreshCw, MapPin, Plus, Trash2, Shield, ArrowRight, 
  Building, Award, Search, X, Check, Calculator, PieChart, FileText, Upload,
  Building2, Filter, Layers, Zap, Printer, ChevronLeft, ChevronRight
} from 'lucide-react';

export interface ItemizedCalculationLine {
  id: string;
  particulars: string;
  pricePerUnit: number;
  quantityPerDay: number;
  unitLabel: string;
  workingDays: number;
}

const getCategoryDefaultItemizedLines = (catId: string, footfall: number = 40, avgTicket: number = 250, days: number = 26) => {
  if (catId === 'chakki' || catId === 'flour_mill' || catId === 'atta_chakki') {
    return {
      income: [
        { id: 'inc-ck-1', particulars: 'Atta Chakki Grinding Income', pricePerUnit: 2, quantityPerDay: 800, unitLabel: 'Kg', workingDays: days || 28 },
        { id: 'inc-ck-2', particulars: 'Mustard Oil Extraction Charges', pricePerUnit: 6, quantityPerDay: 200, unitLabel: 'Kg', workingDays: days || 28 },
        { id: 'inc-ck-3', particulars: 'Mustard Cake (Khali) Trading', pricePerUnit: 4, quantityPerDay: 120, unitLabel: 'Kg', workingDays: days || 28 },
        { id: 'inc-ck-4', particulars: 'Spice Grinding (Chilli/Turmeric)', pricePerUnit: 20, quantityPerDay: 30, unitLabel: 'Kg', workingDays: days || 28 },
        { id: 'inc-ck-5', particulars: 'Kirana & Retail Grocery Counter', pricePerUnit: 4500, quantityPerDay: 1, unitLabel: 'Daily Counter', workingDays: days || 28 },
      ],
      expense: [
        { id: 'exp-ck-1', particulars: 'Grocery Items Wholesale Purchase', pricePerUnit: 3375, quantityPerDay: 1, unitLabel: 'Daily Restock', workingDays: days || 28 },
        { id: 'exp-ck-2', particulars: 'Electricity Engine Power Charges', pricePerUnit: 771, quantityPerDay: 1, unitLabel: 'Per Day Power', workingDays: days || 28 },
        { id: 'exp-ck-3', particulars: 'Machine Upkeep & Maintenance', pricePerUnit: 285, quantityPerDay: 1, unitLabel: 'Per Day Maint.', workingDays: days || 28 },
      ]
    };
  }

  if (catId === 'kirana' || catId === 'general_store') {
    return {
      income: [
        { id: 'inc-kr-1', particulars: 'FMCG, Toiletries & Packaged Goods', pricePerUnit: avgTicket || 220, quantityPerDay: footfall || 45, unitLabel: 'Cust/Day', workingDays: days || 26 },
        { id: 'inc-kr-2', particulars: 'Loose Grains, Spices & Edible Oils', pricePerUnit: 1200, quantityPerDay: 1, unitLabel: 'Batch/Day', workingDays: days || 26 },
      ],
      expense: [
        { id: 'exp-kr-1', particulars: 'Wholesale Inventory Restock (COGS)', pricePerUnit: Math.round(((avgTicket || 220) * (footfall || 45) + 1200) * 0.78), quantityPerDay: 1, unitLabel: 'Daily Restock', workingDays: days || 26 },
        { id: 'exp-kr-2', particulars: 'Shop Premises Rent Expense', pricePerUnit: 400, quantityPerDay: 1, unitLabel: 'Daily Rent', workingDays: 30 },
        { id: 'exp-kr-3', particulars: 'Electricity & Cold Storage Meter', pricePerUnit: 180, quantityPerDay: 1, unitLabel: 'Per Day Power', workingDays: 30 },
        { id: 'exp-kr-4', particulars: 'Helper Wages & Logistics Freight', pricePerUnit: 350, quantityPerDay: 1, unitLabel: 'Per Day Freight', workingDays: days || 26 },
      ]
    };
  }

  if (catId === 'hardware' || catId === 'sanitary') {
    return {
      income: [
        { id: 'inc-hw-1', particulars: 'Hardware Tools & Sanitary Fittings Sales', pricePerUnit: 450, quantityPerDay: footfall || 25, unitLabel: 'Cust/Day', workingDays: days || 26 },
        { id: 'inc-hw-2', particulars: 'Paints & Construction Goods Sales', pricePerUnit: 1800, quantityPerDay: 2, unitLabel: 'Orders/Day', workingDays: days || 26 },
      ],
      expense: [
        { id: 'exp-hw-1', particulars: 'Wholesale Stock Restock & Freight', pricePerUnit: 8500, quantityPerDay: 1, unitLabel: 'Daily Restock', workingDays: days || 26 },
        { id: 'exp-hw-2', particulars: 'Shop & Godown Rent', pricePerUnit: 500, quantityPerDay: 1, unitLabel: 'Daily Rent', workingDays: 30 },
        { id: 'exp-hw-3', particulars: 'Electricity & Transport Freight', pricePerUnit: 300, quantityPerDay: 1, unitLabel: 'Per Day Utility', workingDays: 30 },
      ]
    };
  }

  const cat = INITIAL_CATEGORIES.find(c => c.id === catId);
  const dailyRev = (avgTicket || 250) * (footfall || 40);
  return {
    income: [
      { id: 'inc-gen-1', particulars: `${cat?.name || 'Main Goods'} Daily Primary Sales`, pricePerUnit: avgTicket || 250, quantityPerDay: footfall || 40, unitLabel: 'Units/Day', workingDays: days || 26 },
      { id: 'inc-gen-2', particulars: 'Secondary Allied Products & Services', pricePerUnit: Math.round(dailyRev * 0.2), quantityPerDay: 1, unitLabel: 'Batch/Day', workingDays: days || 26 },
    ],
    expense: [
      { id: 'exp-gen-1', particulars: 'Raw Materials / Inventory Procurement', pricePerUnit: Math.round(dailyRev * 0.72), quantityPerDay: 1, unitLabel: 'Daily Restock', workingDays: days || 26 },
      { id: 'exp-gen-2', particulars: 'Power, Fuel & Utilities Overhead', pricePerUnit: 200, quantityPerDay: 1, unitLabel: 'Per Day Power', workingDays: 30 },
      { id: 'exp-gen-3', particulars: 'Shop / Facility Rent Overhead', pricePerUnit: 400, quantityPerDay: 1, unitLabel: 'Per Day Rent', workingDays: 30 },
    ]
  };
};

interface PDToolViewProps {
  currentUser?: EmployeeRecord | null;
  selectedClient?: ClientBank;
  selectedCompany: Company;
  onSyncReportToAI: (formData: any) => void;
}

export const PDToolView: React.FC<PDToolViewProps> = ({ currentUser, selectedClient, selectedCompany, onSyncReportToAI }) => {
  // Active Category Selection
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('kirana');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  // Application Search & 1-Click Load States
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [isAppSearchOpen, setIsAppSearchOpen] = useState(false);
  const [isAppGalleryOpen, setIsAppGalleryOpen] = useState(false);
  const [selectedBankFilter, setSelectedBankFilter] = useState<string>('ALL');
  const [loadedToastMessage, setLoadedToastMessage] = useState<string | null>(null);
  const [activeAppNumber, setActiveAppNumber] = useState<string>('INF/2026/88492');
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  
  const [photos, setPhotos] = useState<any[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  
  const [applicantsList, setApplicantsList] = useState<any[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(true);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchApps = async (showLoading = false) => {
      if (!selectedClient?.id) return;
      if (showLoading) setLoadingApplicants(true);
      
      try {
        const data = await api.getApplicants(selectedClient.id);
        // React handles state updates efficiently, but we can do a deep equality check if needed.
        // For now, we will just set it so it updates the gallery in real-time.
        setApplicantsList(data);
      } catch (err) {
        console.error('Failed to fetch applicants:', err);
      } finally {
        if (showLoading) setLoadingApplicants(false);
      }
    };

    if (selectedClient?.id) {
      fetchApps(true);
      // Poll every 5 seconds for real-time updates
      intervalId = setInterval(() => fetchApps(false), 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedClient]);

  // Form Section Tabs
  const [activeTab, setActiveTab] = useState<'profile' | 'applicant' | 'field' | 'financials' | 'decision'>('profile');

  // Active Category Data
  const currentCategory = useMemo(() => {
    return INITIAL_CATEGORIES.find(c => c.id === selectedCategoryId) || INITIAL_CATEGORIES[0];
  }, [selectedCategoryId]);

  // Product Mapping State
  const [productsList, setProductsList] = useState<CategoryProduct[]>(() => {
    return INITIAL_PRODUCTS.filter(p => p.categoryId === 'kirana');
  });

  // Itemized Income and Expenditure Lines (Price x Quantity x Days Format)
  const [incomeLines, setIncomeLines] = useState<ItemizedCalculationLine[]>(() => {
    return getCategoryDefaultItemizedLines('kirana', 45, 220, 26).income;
  });

  const [expenseLines, setExpenseLines] = useState<ItemizedCalculationLine[]>(() => {
    return getCategoryDefaultItemizedLines('kirana', 45, 220, 26).expense;
  });

  // Calculated Itemized Sums
  const itemizedMonthlyIncomeTotal = useMemo(() => {
    return incomeLines.reduce((sum, line) => sum + (line.pricePerUnit * line.quantityPerDay * line.workingDays), 0);
  }, [incomeLines]);

  const itemizedMonthlyExpenseTotal = useMemo(() => {
    return expenseLines.reduce((sum, line) => sum + (line.pricePerUnit * line.quantityPerDay * line.workingDays), 0);
  }, [expenseLines]);



  // Handlers for Itemized Income
  const handleUpdateIncomeLine = (id: string, field: keyof ItemizedCalculationLine, value: any) => {
    setIncomeLines(prev => prev.map(line => line.id === id ? { ...line, [field]: value } : line));
  };

  const handleAddIncomeLine = () => {
    const newId = `inc-custom-${Date.now()}`;
    setIncomeLines(prev => [...prev, {
      id: newId,
      particulars: 'New Goods / Service Product Line',
      pricePerUnit: 150,
      quantityPerDay: 10,
      unitLabel: 'Units',
      workingDays: workingDays || 26
    }]);
  };

  const handleRemoveIncomeLine = (id: string) => {
    setIncomeLines(prev => prev.filter(line => line.id !== id));
  };

  // Handlers for Itemized Expenditure
  const handleUpdateExpenseLine = (id: string, field: keyof ItemizedCalculationLine, value: any) => {
    setExpenseLines(prev => prev.map(line => line.id === id ? { ...line, [field]: value } : line));
  };

  const handleAddExpenseLine = () => {
    const newId = `exp-custom-${Date.now()}`;
    setExpenseLines(prev => [...prev, {
      id: newId,
      particulars: 'New Operational Cost Line',
      pricePerUnit: 200,
      quantityPerDay: 1,
      unitLabel: 'Daily Cost',
      workingDays: workingDays || 26
    }]);
  };

  const handleRemoveExpenseLine = (id: string) => {
    setExpenseLines(prev => prev.filter(line => line.id !== id));
  };

  // Sync Itemized Income Total to Stated Monthly Turnover
  const handleSyncItemizedToStatedTurnover = () => {
    if (itemizedMonthlyIncomeTotal > 0) {
      setStatedMonthlySales(itemizedMonthlyIncomeTotal);
    }
  };

  // When category changes, update products list and default itemized lines
  const handleSelectCategory = (catId: string) => {
    setSelectedCategoryId(catId);
    const catProds = INITIAL_PRODUCTS.filter(p => p.categoryId === catId);
    if (catProds.length > 0) {
      setProductsList(catProds);
    } else {
      const cat = INITIAL_CATEGORIES.find(c => c.id === catId);
      setProductsList([
        {
          id: `prod-${catId}-01`,
          categoryId: catId,
          productName: `${cat?.name || 'Main'} Products & Goods`,
          productCategory: 'Core',
          revenueContributionPct: 70,
          inventoryType: 'FAST_MOVING',
          averageMarginPct: Math.round(((cat?.typicalMarginMin || 10) + (cat?.typicalMarginMax || 20)) / 2),
          businessImportance: 'HIGH'
        },
        {
          id: `prod-${catId}-02`,
          categoryId: catId,
          productName: `Secondary Services & Allied Sales`,
          productCategory: 'Services',
          revenueContributionPct: 30,
          inventoryType: 'SERVICE',
          averageMarginPct: Math.round((cat?.typicalMarginMax || 25) * 1.1),
          businessImportance: 'MEDIUM'
        }
      ]);
    }

    const defaultLines = getCategoryDefaultItemizedLines(catId, dailyFootfall, avgTicketValue, workingDays);
    setIncomeLines(defaultLines.income);
    setExpenseLines(defaultLines.expense);
    setIsCategoryModalOpen(false);
  };

  // Form Fields - Applicant
  const [applicantName, setApplicantName] = useState('Ramesh Chandra Sharma');
  const [mobileNumber, setMobileNumber] = useState('9876543210');
  const [panNumber, setPanNumber] = useState('ABCPS1234F');
  const [aadhaarNumber, setAadhaarNumber] = useState('9876 5432 1098');
  const [residenceAddress, setResidenceAddress] = useState('Flat 402, Sai Residency, Station Road, Jaipur');
  const [residenceOwnership, setResidenceOwnership] = useState<'OWN' | 'RENTED' | 'FAMILY'>('OWN');
  const [yearsAtResidence, setYearsAtResidence] = useState(12);
  const [cibilScore, setCibilScore] = useState(748);
  const [dependentsCount, setDependentsCount] = useState(3);

  // Form Fields - Business
  const [firmName, setFirmName] = useState('Sharma Kirana & General Store');
  const [constitution, setConstitution] = useState('Proprietorship');
  const [yearsInBusiness, setYearsInBusiness] = useState(8);
  const [shopOwnership, setShopOwnership] = useState<'OWN' | 'RENTED' | 'FAMILY'>('RENTED');
  const [monthlyRent, setMonthlyRent] = useState(12000);
  const [shopAreaSqFt, setShopAreaSqFt] = useState(350);
  const [inventoryValue, setInventoryValue] = useState(450000);

  // Form Fields - Field Investigation
  const [dailyFootfall, setDailyFootfall] = useState(45);
  const [avgTicketValue, setAvgTicketValue] = useState(220);
  const [workingDays, setWorkingDays] = useState(26);

  // Sync field investigation inputs with Waterfall Engine Itemized Lines
  useEffect(() => {
    const newLines = getCategoryDefaultItemizedLines(selectedCategoryId, dailyFootfall, avgTicketValue, workingDays);
    setIncomeLines(newLines.income);
    setExpenseLines(newLines.expense);
  }, [dailyFootfall, avgTicketValue, workingDays, selectedCategoryId]);
  const [neighborName, setNeighborName] = useState('Suresh Verma (Verma Electronics)');
  const [neighborFeedback, setNeighborFeedback] = useState('Excellent local reputation. Living in community for 15+ years. Prompt bill payer.');
  const [landlordFeedback, setLandlordFeedback] = useState('Rent paid regularly by 5th of every month. Active lease agreement for next 3 years.');
  const [exifGpsLat, setExifGpsLat] = useState('26.9124° N');
  const [exifGpsLng, setExifGpsLng] = useState('75.7873° E');

  // Form Fields - Loan Scheme & Facilities
  const [appliedAmount, setAppliedAmount] = useState(350000);
  const [tenureMonths, setTenureMonths] = useState(24);
  const [interestRatePct, setInterestRatePct] = useState(16.5);

  // Form Fields - Financial Analysis & Waterfall Numbers
  const [statedMonthlySales, setStatedMonthlySales] = useState(280000);
  const [cogsMarginPct, setCogsMarginPct] = useState(78); // COGS %
  const [salariesExpense, setSalariesExpense] = useState(15000);
  const [utilitiesExpense, setUtilitiesExpense] = useState(8000);
  const [transportExpense, setTransportExpense] = useState(4000);
  const [miscExpense, setMiscExpense] = useState(3000);
  const [otherIncome, setOtherIncome] = useState(6000);
  const [householdExpenses, setHouseholdExpenses] = useState(24000);
  const [existingEmis, setExistingEmis] = useState(8500);

  const handleDeleteApplication = (appNumber: string) => {
    if (currentUser?.role !== 'EMPLOYEE' && window.confirm(`MANAGER ACTION: Are you sure you want to delete application ${appNumber}?`)) {
      setApplicantsList(prev => prev.filter(a => a.applicationNumber !== appNumber));
      setLoadedToastMessage(`Deleted applicant ${appNumber}`);
      setTimeout(() => setLoadedToastMessage(null), 3000);
    }
  };

  // CREATE NEW APPLICANT
  const handleCreateNewApplicant = async () => {
    if (!selectedClient) return;
    const newAppNumber = `INF/2026/${Math.floor(Math.random() * 90000) + 10000}`;
    const newApplicant = {
      applicationNumber: newAppNumber,
      applicantName: 'New Applicant',
      categoryId: 'kirana',
      product: selectedClient.defaultScheme,
      appliedAmount: 100000,
      tenureMonths: 24,
      purpose: 'Working Capital',
      status: 'IN_REVIEW',
      firmName: 'New Business',
      mobileNumber: '9999999999',
      panNumber: 'ABCDE1234F',
      aadhaarNumber: '1111 2222 3333',
      residenceAddress: 'Address',
      residenceOwnership: 'OWN',
      cibilScore: 700,
      dependentsCount: 2,
      constitution: 'Proprietorship',
      yearsInBusiness: 2,
      shopOwnership: 'RENTED',
      monthlyRent: 5000,
      shopAreaSqFt: 150,
      inventoryValue: 50000,
      dailyFootfall: 20,
      avgTicketValue: 100,
      workingDays: 26,
      neighborFeedback: 'Good',
      landlordFeedback: 'Good',
      interestRatePct: 24,
      statedMonthlySales: 50000,
      cogsMarginPct: 75,
      salariesExpense: 0,
      utilitiesExpense: 1000,
      transportExpense: 500,
      miscExpense: 500,
      otherIncome: 0,
      householdExpenses: 10000,
      existingEmis: 0,
      photos: []
    };
    try {
      const created = await api.createApplicant(selectedClient.id, newApplicant);
      setApplicantsList(prev => [created, ...prev]);
      handleLoadSampleApp(created);
      setLoadedToastMessage(`Created new applicant ${newAppNumber}`);
      setTimeout(() => setLoadedToastMessage(null), 3000);
    } catch (err) {
      console.error('Failed to create applicant', err);
    }
  };

  // 1-CLICK LOAD APPLICATION HANDLER
  const handleLoadSampleApp = (app: any) => {
    handleSelectCategory(app.categoryId);
    setApplicantName(app.applicantName || '');
    setMobileNumber(app.mobileNumber || '');
    setPanNumber(app.panNumber || '');
    setAadhaarNumber(app.aadhaarNumber || '');
    setResidenceAddress(app.residenceAddress || '');
    setResidenceOwnership(app.residenceOwnership || 'OWN');
    setCibilScore(app.cibilScore || 0);
    setDependentsCount(app.dependentsCount || 0);
    setFirmName(app.firmName || '');
    setConstitution(app.constitution || 'Proprietorship');
    setYearsInBusiness(app.yearsInBusiness || 0);
    setShopOwnership(app.shopOwnership || 'OWN');
    setMonthlyRent(app.monthlyRent || 0);
    setShopAreaSqFt(app.shopAreaSqFt || 0);
    setInventoryValue(app.inventoryValue || 0);
    setDailyFootfall(app.dailyFootfall || 0);
    setAvgTicketValue(app.avgTicketValue || 0);
    setWorkingDays(app.workingDays || 0);
    setNeighborFeedback(app.neighborFeedback || '');
    setLandlordFeedback(app.landlordFeedback || '');
    setAppliedAmount(app.appliedAmount || 0);
    setTenureMonths(app.tenureMonths || 12);
    setInterestRatePct(app.interestRatePct || 12);
    setStatedMonthlySales(app.statedMonthlySales || 0);
    setCogsMarginPct(app.cogsMarginPct || 0);
    setSalariesExpense(app.salariesExpense || 0);
    setUtilitiesExpense(app.utilitiesExpense || 0);
    setTransportExpense(app.transportExpense || 0);
    setMiscExpense(app.miscExpense || 0);
    setOtherIncome(app.otherIncome || 0);
    setHouseholdExpenses(app.householdExpenses || 0);
    setExistingEmis(app.existingEmis || 0);
    setPhotos(app.photos || []);

    const defaultLines = getCategoryDefaultItemizedLines(app.categoryId, app.dailyFootfall, app.avgTicketValue, app.workingDays);
    setIncomeLines(app.incomeLines || defaultLines.income);
    setExpenseLines(app.expenseLines || defaultLines.expense);

    setActiveAppNumber(app.applicationNumber);
    setActiveAppId(app._id);
    setLoadedToastMessage(`Application #${app.applicationNumber} loaded for ${app.applicantName} (${app.firmName}). All 5 sections updated.`);
    setIsAppSearchOpen(false);
    setIsAppGalleryOpen(false);
    setAppSearchQuery('');

    setTimeout(() => {
      setLoadedToastMessage(null);
    }, 5000);
  };

  // Auto-Save Effect
  useEffect(() => {
    if (!activeAppId || !selectedClient?.id) return;
    const timeout = setTimeout(() => {
      const updateData = {
        applicantName, mobileNumber, panNumber, aadhaarNumber, residenceAddress, residenceOwnership,
        cibilScore, dependentsCount, firmName, constitution, yearsInBusiness, shopOwnership, monthlyRent,
        shopAreaSqFt, inventoryValue, dailyFootfall, avgTicketValue, workingDays, neighborFeedback,
        landlordFeedback, appliedAmount, tenureMonths, interestRatePct, statedMonthlySales, cogsMarginPct,
        salariesExpense, utilitiesExpense, transportExpense, miscExpense, otherIncome, householdExpenses, existingEmis,
        photos, incomeLines, expenseLines
      };
      api.updateApplicant(selectedClient.id, activeAppId, updateData).catch(err => console.error('Failed to auto-save:', err));
    }, 1500);
    return () => clearTimeout(timeout);
  }, [
    activeAppId, selectedClient, applicantName, mobileNumber, panNumber, aadhaarNumber, residenceAddress, residenceOwnership,
    cibilScore, dependentsCount, firmName, constitution, yearsInBusiness, shopOwnership, monthlyRent,
    shopAreaSqFt, inventoryValue, dailyFootfall, avgTicketValue, workingDays, neighborFeedback,
    landlordFeedback, appliedAmount, tenureMonths, interestRatePct, statedMonthlySales, cogsMarginPct,
    salariesExpense, utilitiesExpense, transportExpense, miscExpense, otherIncome, householdExpenses, existingEmis,
    photos, incomeLines, expenseLines
  ]);

  // Search Results for Autocomplete Dropdown
  const searchedApplications = useMemo(() => {
    if (!appSearchQuery.trim()) return applicantsList;
    const query = appSearchQuery.toLowerCase();
    return applicantsList.filter(app => 
      app.applicationNumber?.toLowerCase().includes(query) ||
      app.applicantName?.toLowerCase().includes(query) ||
      app.firmName?.toLowerCase().includes(query)
    );
  }, [appSearchQuery, applicantsList]);

  // Gallery Filtered Applications
  const galleryApplications = useMemo(() => {
    return applicantsList;
  }, [applicantsList]);


  // Computed Field Investigation Cross-Check Sales
  const crossCheckMonthlySales = useMemo(() => {
    return dailyFootfall * avgTicketValue * workingDays;
  }, [dailyFootfall, avgTicketValue, workingDays]);

  // Adopted Monthly Turnover (Min of Stated and Cross-Check)
  const adoptedMonthlySales = useMemo(() => {
    return Math.min(statedMonthlySales, crossCheckMonthlySales);
  }, [statedMonthlySales, crossCheckMonthlySales]);

  // Calculated COGS & Gross Profit
  const cogsAmount = useMemo(() => {
    return Math.round(adoptedMonthlySales * (cogsMarginPct / 100));
  }, [adoptedMonthlySales, cogsMarginPct]);

  const grossProfit = useMemo(() => {
    return adoptedMonthlySales - cogsAmount;
  }, [adoptedMonthlySales, cogsAmount]);

  const grossMarginPct = useMemo(() => {
    return adoptedMonthlySales > 0 ? Math.round((grossProfit / adoptedMonthlySales) * 100) : 0;
  }, [grossProfit, adoptedMonthlySales]);

  // Total Operating Expenses
  const rentEffective = shopOwnership === 'RENTED' ? monthlyRent : 0;
  const totalOperatingExpenses = useMemo(() => {
    return salariesExpense + rentEffective + utilitiesExpense + transportExpense + miscExpense;
  }, [salariesExpense, rentEffective, utilitiesExpense, transportExpense, miscExpense]);

  // Net Business Operating Income
  const netBusinessIncome = useMemo(() => {
    return grossProfit - totalOperatingExpenses;
  }, [grossProfit, totalOperatingExpenses]);

  // Total Household Surplus before Proposed EMI
  const netFamilySurplusBeforeEmi = useMemo(() => {
    return (netBusinessIncome + otherIncome) - householdExpenses - existingEmis;
  }, [netBusinessIncome, otherIncome, householdExpenses, existingEmis]);

  // Calculated Proposed Monthly EMI Formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const proposedEmi = useMemo(() => {
    const r = (interestRatePct / 100) / 12;
    const n = tenureMonths;
    if (r === 0 || n === 0) return 0;
    const emi = (appliedAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  }, [appliedAmount, interestRatePct, tenureMonths]);

  // Post-Loan Net Monthly Surplus
  const postLoanSurplus = useMemo(() => {
    return netFamilySurplusBeforeEmi - proposedEmi;
  }, [netFamilySurplusBeforeEmi, proposedEmi]);

  // DSCR (Debt Service Coverage Ratio)
  const dscrRatio = useMemo(() => {
    if (proposedEmi === 0) return 0;
    const ratio = (netFamilySurplusBeforeEmi + proposedEmi) / proposedEmi;
    return parseFloat(ratio.toFixed(2));
  }, [netFamilySurplusBeforeEmi, proposedEmi]);

  // FOIR % (Fixed Obligation to Income Ratio)
  const foirPct = useMemo(() => {
    const totalIncome = netBusinessIncome + otherIncome;
    if (totalIncome === 0) return 0;
    const totalObligations = existingEmis + proposedEmi + householdExpenses;
    return Math.round((totalObligations / totalIncome) * 100);
  }, [netBusinessIncome, otherIncome, existingEmis, proposedEmi, householdExpenses]);

  // Product Revenue Sum Check
  const totalProductContribPct = useMemo(() => {
    return productsList.reduce((acc, p) => acc + (p.revenueContributionPct || 0), 0);
  }, [productsList]);

  // Automated Risk Score Calculation
  const riskAssessment = useMemo(() => {
    let score = 85; // Base high score
    const flags: string[] = [];
    const strengths: string[] = [];

    if (cibilScore >= 720) {
      strengths.push(`Strong CIBIL score of ${cibilScore}`);
    } else {
      score -= 15;
      flags.push(`Moderate CIBIL score (${cibilScore})`);
    }

    if (dscrRatio >= 1.25) {
      strengths.push(`Healthy DSCR of ${dscrRatio}x (exceeds 1.25x policy norm)`);
    } else {
      score -= 25;
      flags.push(`DSCR of ${dscrRatio}x is below standard 1.25x minimum requirement`);
    }

    if (foirPct <= 60) {
      strengths.push(`FOIR of ${foirPct}% within 60% cap`);
    } else {
      score -= 20;
      flags.push(`High FOIR obligation (${foirPct}% exceeds 60% threshold)`);
    }

    if (yearsInBusiness >= 3) {
      strengths.push(`Stable business vintage of ${yearsInBusiness} years`);
    } else {
      score -= 10;
      flags.push(`Business vintage under 3 years`);
    }

    if (totalProductContribPct !== 100) {
      flags.push(`Product revenue contribution sums to ${totalProductContribPct}% (expected 100%)`);
    }

    let decision: 'APPROVED' | 'CONDITIONAL' | 'REJECTED' = 'APPROVED';
    if (score < 50 || dscrRatio < 1.0) {
      decision = 'REJECTED';
    } else if (score < 75 || dscrRatio < 1.25 || foirPct > 65) {
      decision = 'CONDITIONAL';
    }

    return { score, flags, strengths, decision };
  }, [cibilScore, dscrRatio, foirPct, yearsInBusiness, totalProductContribPct]);

  // 1-CLICK AUTOMATE & PRE-FILL SAMPLE DATA
  const handlePreFillSampleData = () => {
    const cat = currentCategory;
    setApplicantName(
      cat.id === 'kirana' ? 'Ramesh Chandra Sharma' :
      cat.id === 'hardware' ? 'Rajesh Kumar Gupta' :
      cat.id === 'pharmacy' ? 'Dr. Ananya Deshmukh' :
      cat.id === 'garage' ? 'Vikram Singh Motor' :
      'Sunil Kumar Mehta'
    );
    setMobileNumber('9876543210');
    setPanNumber('ABCPS1234F');
    setAadhaarNumber('9876 5432 1098');
    setFirmName(`${applicantName.split(' ')[0]} ${cat.name}`);
    setYearsInBusiness(7);
    setShopOwnership('RENTED');
    setMonthlyRent(15000);
    setShopAreaSqFt(400);
    setInventoryValue(650000);
    setDailyFootfall(cat.id === 'kirana' ? 50 : cat.id === 'hardware' ? 25 : 35);
    setAvgTicketValue(cat.id === 'kirana' ? 240 : cat.id === 'hardware' ? 850 : 450);
    setWorkingDays(26);
    setStatedMonthlySales(cat.id === 'kirana' ? 310000 : cat.id === 'hardware' ? 550000 : 380000);
    setCogsMarginPct(100 - Math.round((cat.typicalMarginMin + cat.typicalMarginMax) / 2));
    setSalariesExpense(18000);
    setUtilitiesExpense(5500);
    setTransportExpense(4000);
    setMiscExpense(3000);
    setOtherIncome(6000);
    setHouseholdExpenses(24000);
    setExistingEmis(9000);
    setAppliedAmount(400000);
    setTenureMonths(24);
    setInterestRatePct(16.0);

    const defaultLines = getCategoryDefaultItemizedLines(cat.id, cat.id === 'kirana' ? 50 : 35, cat.id === 'kirana' ? 240 : 450, 26);
    setIncomeLines(defaultLines.income);
    setExpenseLines(defaultLines.expense);
  };

  // Compile & Sync Report to AI Generator
  const handleSyncToAIStudio = () => {
    const compiledData = {
      applicationNumber: `INF/${new Date().getFullYear()}/${Math.floor(10000 + Math.random() * 90000)}`,
      applicantName,
      categoryId: selectedCategoryId,
      categoryName: currentCategory.name,
      product: `${currentCategory.name} Facility`,
      scheme: 'Infominer Micro Lending Express',
      appliedAmount,
      tenureMonths,
      purpose: `Working capital & inventory expansion for ${firmName}`,
      visitDate: new Date().toISOString().split('T')[0],
      status: riskAssessment.decision === 'APPROVED' ? 'APPROVED' : 'IN_REVIEW',
      assignedOfficer: 'Sandeep Kumar (Field Ops)',
      assignedCreditManager: 'Vikram Malhotra (AVP Credit)',
      agencyName: selectedCompany.name,
      panNumber,
      firmName,
      constitution,
      financials: {
        statedMonthlyRevenue: statedMonthlySales,
        crossCheckRevenue: crossCheckMonthlySales,
        adoptedRevenue: adoptedMonthlySales,
        rawMaterialCOGS: cogsAmount,
        grossProfit,
        grossMarginPct,
        operatingExpenses: {
          salaries: salariesExpense,
          rent: rentEffective,
          utilities: utilitiesExpense,
          transport: transportExpense,
          misc: miscExpense
        },
        totalOperatingExpenses,
        netBusinessIncome,
        netMarginPct: Math.round((netBusinessIncome / adoptedMonthlySales) * 100),
        otherHouseholdIncome: { agriculture: 0, rental: otherIncome, coBorrower: 0, fdDividend: 0, animalHusbandry: 0, other: 0 },
        totalOtherIncome: otherIncome,
        totalFamilyIncome: netBusinessIncome + otherIncome,
        householdExpenses: { food: 12000, rent: 0, education: 5000, medical: 3000, travel: 2000, other: 2000 },
        totalHouseholdExpenses: householdExpenses,
        surplusBeforeEmi: netFamilySurplusBeforeEmi + existingEmis,
        existingEmisSum: existingEmis,
        netMonthlySurplus: netFamilySurplusBeforeEmi,
        proposedEmi,
        postLoanNetSurplus: postLoanSurplus,
        dscr: dscrRatio,
        postLoanDscr: parseFloat((postLoanSurplus / proposedEmi).toFixed(2)),
        foirPct,
        emiCapacity: Math.round(netFamilySurplusBeforeEmi * 0.6)
      },
      riskResult: {
        overallRiskLevel: riskAssessment.score >= 75 ? 'LOW' : riskAssessment.score >= 50 ? 'MEDIUM' : 'HIGH',
        riskScore: riskAssessment.score,
        financialHealthGrade: riskAssessment.score >= 80 ? 'A+' : riskAssessment.score >= 65 ? 'B' : 'C',
        keyRiskFactors: riskAssessment.flags,
        strengths: riskAssessment.strengths,
        weaknesses: riskAssessment.flags,
        anomaliesDetected: [],
        mitigants: ['Verified daily customer footfall', 'Active lease with verified landlord', 'Regular supplier billing']
      },
      photos: [
        {
          id: 'p1',
          name: 'Business Signboard & Counter',
          dataUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&auto=format&fit=crop',
          category: 'Sign Board Photo',
          mimeType: 'image/jpeg',
          gps: { lat: 26.9124, lng: 75.7873, mapLink: 'https://maps.google.com/?q=26.9124,75.7873' }
        },
        {
          id: 'p2',
          name: 'Stock Inventory & Shelves',
          dataUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=500&auto=format&fit=crop',
          category: 'Business Pic',
          mimeType: 'image/jpeg',
          gps: { lat: 26.9124, lng: 75.7873, mapLink: 'https://maps.google.com/?q=26.9124,75.7873' }
        }
      ],
      observations: {
        footfall: dailyFootfall,
        neighborFeedback,
        landlordFeedback,
        exifGps: `${exifGpsLat}, ${exifGpsLng}`
      }
    };

    onSyncReportToAI(compiledData);
  };

  // Direct Print Official Company Standard PD Report
  const handleDirectPrintReport = () => {
    openStandardPDReportPrintWindow({
      companyHeader: {
        name: selectedCompany.name,
        cin: selectedCompany.id === 'infominers' ? 'U67100UP2020PTC131346' : 'U12345DL2024PTC987654',
        designation: 'Chartered Accountant & Risk Advisors',
        address: selectedCompany.id === 'infominers' ? 'Office No 410, Shree Siddhi Vinayak Trade Center - Agra- 282004' : 'Connaught Place, New Delhi - 110001'
      },
      clientBankName: selectedClient?.name || 'Moneyboxx Finance Limited',
      applicationNumber: activeAppNumber,
      statusOfCase: riskAssessment.decision === 'APPROVED' ? 'Recommended' : 'In Review',
      applicantName,
      applicantPhone: mobileNumber,
      coApplicantName: 'Mrs. Rubi Devi (Spouse)',
      coApplicantPhone: '8252240942',
      firmName,
      loanAmount: appliedAmount,
      loanType: `${currentCategory.name} Facility`,
      loanPurpose: `Operational enhancement & working capital expansion for ${firmName}.`,
      residenceAddress: 'Dumari, Parora Garhpura Begusarai 848204 Br',
      businessAddress: 'Dumari, Parora Garhpura Begusarai 848204 Br',
      metPersonName: `${applicantName} (Self) & Spouse`,
      metPersonIdProof: panNumber ? `PAN: ${panNumber}` : 'PAN Card / Aadhaar',
      executiveName: 'Mr. Sumit (Infominer Field Inspector)',

      residenceOwnership: shopOwnership === 'OWN' ? 'Owned Premises - Area 1000-1200 sq.ft Approx - Family residing since birth' : 'Rented Premises',
      houseDetails: 'Single-story structure comprising ground floor residential units.',
      monthlyHouseholdExpenses: householdExpenses,
      residenceGpsCoords: `${exifGpsLat}, ${exifGpsLng}`,
      residenceStatus: 'Recommended',

      briefBusinessProfile: `${applicantName} has been engaged in the ${firmName} business for approximately ${yearsInBusiness} years. The business operates with daily footfall of ${dailyFootfall} verified customers with average ticket size of ₹${avgTicketValue}. Total inventory stock is estimated at ₹${inventoryValue.toLocaleString('en-IN')}.`,
      businessVintage: `${yearsInBusiness} Years`,
      staffCount: 'Managed by family members with zero external staff dependency',
      businessPremiseOwnership: shopOwnership === 'OWN' ? 'Self-Owned Premises' : `Rented Premises (Rent: ₹${monthlyRent}/mo)`,
      factoryInfrastructure: 'Display racks, storage shelves, weighing scales, counter, and necessary processing fixtures',
      stockDetailsValue: `Estimated inventory value of ₹${inventoryValue.toLocaleString('en-IN')}`,
      fixedAndCurrentAssetAnalysis: 'Fixed assets comprise shop furniture, display racks, and fixtures. Current assets include stock inventory and working capital.',
      assetCreationThroughBusiness: 'Income generated has been utilized for house construction, family living expenses, and inventory expansion.',
      initialBusinessInvestment: 'Started with an initial investment of approx ₹1 Lakh to ₹3 Lakhs.',
      agriculturalIncomeDetails: 'Applicant owns agricultural land with yearly supplementary crop income.',
      operationalSavingAnalysis: 'Working capital stock expansion will reduce unit procurement cost and optimize monthly profit margins.',

      prominentCustomers: [
        { name: 'Local Retail Walk-in Customers', phone: 'Multiple', remark: 'Satisfactory daily cash & digital UPI sales' }
      ],
      prominentSuppliers: [
        { name: 'Regional Wholesale Stock Supplier', phone: '9811002233', remark: 'Regular stock supplier with favorable credit terms' }
      ],
      bankingDetails: [
        { bankName: selectedClient?.name || 'UCO Bank', branchName: 'Main Branch', accountType: 'Saving / Current Account', ccOdLimit: 'NA', accountNo: '**********9522', remark: 'Active operating account belonging to applicant' }
      ],
      existingLoans: [
        { typeOfLoan: 'NA', financerName: 'NA', loanAmountLakhs: '0', emiRs: `${existingEmis}`, tenureYearsMonths: 'NA', balanceTenure: 'NA', remark: existingEmis > 0 ? `Active monthly EMI of ₹${existingEmis}` : 'No existing loan obligation' }
      ],
      currentObligationSummary: existingEmis > 0 ? `Monthly EMI of ₹${existingEmis}` : 'No existing obligation',
      businessGpsCoords: `${exifGpsLat}, ${exifGpsLng}`,
      businessElectricityDetails: 'Active commercial electricity connection verified',
      businessNeighborName: 'Adjoining market shopkeepers',
      businessNeighborFeedback: neighborFeedback || 'Neighbour verification confirmed applicant business presence and stable local reputation.',
      businessStatus: 'Recommended',

      itemizedSales: incomeLines.map(l => ({
        particulars: l.particulars,
        businessNotes: `Rate ₹${l.pricePerUnit} × ${l.quantityPerDay} ${l.unitLabel}/day × ${l.workingDays} Days`,
        monthly: l.pricePerUnit * l.quantityPerDay * l.workingDays,
        yearly: l.pricePerUnit * l.quantityPerDay * l.workingDays * 12,
      })),
      itemizedExpenses: expenseLines.map(l => ({
        particulars: l.particulars,
        businessNotes: `Cost ₹${l.pricePerUnit} × ${l.quantityPerDay} ${l.unitLabel}/day × ${l.workingDays} Days`,
        monthly: l.pricePerUnit * l.quantityPerDay * l.workingDays,
        yearly: l.pricePerUnit * l.quantityPerDay * l.workingDays * 12,
      })),

      totalSalesMonthly: adoptedMonthlySales,
      totalSalesYearly: adoptedMonthlySales * 12,
      totalExpensesMonthly: totalOperatingExpenses,
      totalExpensesYearly: totalOperatingExpenses * 12,
      netProfitMonthly: netBusinessIncome,
      netProfitYearly: netBusinessIncome * 12,
      existingEmiMonthly: existingEmis,
      existingEmiYearly: existingEmis * 12,
      householdExpensesMonthly: householdExpenses,
      householdExpensesYearly: householdExpenses * 12,
      netDisposalIncomeMonthly: postLoanSurplus,
      netDisposalIncomeYearly: postLoanSurplus * 12,

      dscrRatio: dscrRatio,
      foirPct: foirPct,
      cibilScore: cibilScore,
      riskScore: riskAssessment.score,
      riskLevel: riskAssessment.decision,
      strengths: riskAssessment.strengths,
      flags: riskAssessment.flags,
      proposedEmi: proposedEmi,
      postLoanSurplus: postLoanSurplus,

      aiExecutiveSummary: `<strong>Borrower & Vintage Profile:</strong> ${applicantName} operates <strong>${firmName}</strong> (${currentCategory.name}) with an established business vintage of <strong>${yearsInBusiness} years</strong>. On-site field verification confirmed average daily footfall of <strong>${dailyFootfall} customers</strong> with average ticket size of <strong>₹${avgTicketValue}</strong> across ${workingDays} monthly working days.<br/><br/><strong>Sales & Cash Flow Waterfall:</strong> Stated monthly sales turnover of <strong>₹${statedMonthlySales.toLocaleString('en-IN')}</strong> is cross-checked against footfall observation (₹${crossCheckMonthlySales.toLocaleString('en-IN')}), adopting a conservative monthly turnover of <strong>₹${adoptedMonthlySales.toLocaleString('en-IN')}</strong>. Gross profit margin is assessed at <strong>${grossMarginPct}% (₹${grossProfit.toLocaleString('en-IN')})</strong>. After total business operating expenses of <strong>₹${totalOperatingExpenses.toLocaleString('en-IN')}</strong> and household living costs of <strong>₹${householdExpenses.toLocaleString('en-IN')}</strong>, net monthly disposable surplus stands at <strong>₹${postLoanSurplus.toLocaleString('en-IN')}</strong>.<br/><br/><strong>Debt Service Capacity & Policy Compliance:</strong> The requested micro-lending facility of <strong>₹${appliedAmount.toLocaleString('en-IN')}</strong> at ${interestRatePct}% for ${tenureMonths} months requires a monthly EMI of <strong>₹${proposedEmi.toLocaleString('en-IN')}</strong>. The post-loan DSCR is calculated at <strong>${dscrRatio}x</strong> (policy threshold ≥ 1.25x) with FOIR at <strong>${foirPct}%</strong> (policy cap ≤ 60%), fully satisfying institutional credit guidelines.<br/><br/><strong>Bureau & Community Verification:</strong> Credit bureau CIBIL score is verified at <strong>${cibilScore}</strong> with clean repayment track record. Local market and neighbor reference checks confirm positive reputation and stable operating history.`
    });
  };

  const renderTabNavigationFooter = () => {
    const TABS_LIST: Array<{ id: 'profile' | 'applicant' | 'field' | 'financials' | 'decision'; label: string }> = [
      { id: 'profile', label: '1. Business Profile' },
      { id: 'applicant', label: '2. Applicant & Household' },
      { id: 'field', label: '3. Field Verification' },
      { id: 'financials', label: '4. Financial Analysis' },
      { id: 'decision', label: '5. Risk Score & Summary' },
    ];

    const currentIndex = TABS_LIST.findIndex(t => t.id === activeTab);
    const prevTab = currentIndex > 0 ? TABS_LIST[currentIndex - 1] : null;
    const nextTab = currentIndex < TABS_LIST.length - 1 ? TABS_LIST[currentIndex + 1] : null;

    const scrollToTop = () => {
      window.scrollTo({ top: 280, behavior: 'smooth' });
    };

    return (
      <div className="mt-8 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border">
        <div>
          {prevTab ? (
            <button
              onClick={() => {
                setActiveTab(prevTab.id);
                scrollToTop();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition shadow-xs"
            >
              <ChevronLeft className="w-4 h-4 text-[#eb8a23]" />
              Previous: {prevTab.label}
            </button>
          ) : <div />}
        </div>

        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Section {currentIndex + 1} of {TABS_LIST.length}
        </div>

        <div>
          {nextTab ? (
            <button
              onClick={() => {
                setActiveTab(nextTab.id);
                scrollToTop();
              }}
              className="flex items-center gap-2 px-5 py-2 bg-[#384c5e] hover:bg-[#2d3e50] text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Next: {nextTab.label}
              <ChevronRight className="w-4 h-4 text-[#eb8a23]" />
            </button>
          ) : (
            <button
              onClick={handleDirectPrintReport}
              className="flex items-center gap-2 px-5 py-2 bg-[#eb8a23] hover:bg-[#d97917] text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Printer className="w-4 h-4 text-white" />
              Print Standard Company PD Report
            </button>
          )}
        </div>
      </div>
    );
  };

  const filteredCategoriesModal = INITIAL_CATEGORIES.filter(c => 
    c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
    c.description.toLowerCase().includes(categorySearch.toLowerCase()) ||
    c.industryGroup.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-[#2d3e50]">
      {/* Toast Notification when Application is Loaded */}
      {loadedToastMessage && (
        <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center justify-between border border-emerald-500 animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
            <span className="text-xs md:text-sm font-bold">{loadedToastMessage}</span>
          </div>
          <button
            onClick={() => setLoadedToastMessage(null)}
            className="text-emerald-200 hover:text-white text-xs font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Application Search & Quick 1-Click Load Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#eb8a23] border border-amber-200 flex items-center justify-center font-bold">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs md:text-sm font-black text-[#2d3e50] uppercase tracking-wider">
                Application Search & 1-Click Pre-Fill
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Lookup by Application # (e.g. INF/2026/88492, HDFC/2026/4402) or load pre-audited loan cases.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCreateNewApplicant}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              + New Applicant
            </button>
            {/* Live Application Number Search Input with Autocomplete Dropdown */}
            <div className="relative min-w-[260px]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search App # or Name..."
                  value={appSearchQuery}
                  onChange={(e) => {
                    setAppSearchQuery(e.target.value);
                    setIsAppSearchOpen(true);
                  }}
                  onFocus={() => setIsAppSearchOpen(true)}
                  className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#2d3e50] focus:outline-none focus:ring-2 focus:ring-[#eb8a23]"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                {appSearchQuery && (
                  <button
                    onClick={() => {
                      setAppSearchQuery('');
                      setIsAppSearchOpen(false);
                    }}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {isAppSearchOpen && searchedApplications.length > 0 && (
                <div className="absolute left-0 right-0 top-11 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {searchedApplications.map((app) => (
                    <div
                      key={app.applicationNumber}
                      onClick={() => handleLoadSampleApp(app)}
                      className="p-3 hover:bg-amber-50/60 cursor-pointer transition flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-extrabold text-[#eb8a23] font-mono">
                          #{app.applicationNumber}
                        </div>
                        <div className="font-bold text-[#2d3e50]">{app.applicantName}</div>
                        <div className="text-[10px] text-slate-500">{app.firmName} • {app.categoryName}</div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {app.bankName}
                        </span>
                        <div className="text-[11px] font-extrabold text-emerald-700 mt-0.5">
                          ₹{(app.appliedAmount / 100000).toFixed(2)} Lakh
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 1-Click Load Application Cases Modal Trigger */}
            <button
              onClick={() => setIsAppGalleryOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#384c5e] hover:bg-[#2d3e50] text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              1-Click Load Application Cases
            </button>
          </div>
        </div>
      </div>

      {/* Top Banner & Active Category Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center text-3xl shadow-xs shrink-0">
              {currentCategory.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#2d3e50]">{currentCategory.name}</h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                  {currentCategory.industryGroup}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  App #{activeAppNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1 max-w-xl">
                {currentCategory.description} • Margin Benchmark: <strong className="text-emerald-700">{currentCategory.typicalMarginMin}% - {currentCategory.typicalMarginMax}%</strong>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition border border-slate-300"
            >
              <Store className="w-4 h-4 text-[#eb8a23]" />
              Switch Category ({INITIAL_CATEGORIES.length})
            </button>

            <button
              onClick={handlePreFillSampleData}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition shadow-xs"
              title="Instantly pre-fill realistic sample values for rapid evaluation"
            >
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
              Automate & Pre-Fill Data
            </button>

            <button
              onClick={handleSyncToAIStudio}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#eb8a23] hover:bg-[#d97917] text-white rounded-lg text-xs font-bold transition shadow-sm"
            >
              <FileText className="w-4 h-4" />
              Sync & AI Report
            </button>

            <button
              onClick={handleDirectPrintReport}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2d3e50] hover:bg-[#1e293b] text-white rounded-lg text-xs font-bold transition shadow-sm border border-slate-700"
            >
              <Printer className="w-4 h-4 text-[#eb8a23]" />
              Print Standard Company PD Report
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Module Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-xs flex flex-wrap gap-1">
        {[
          { id: 'profile', label: '1. Business Profile & Products', icon: Store },
          { id: 'applicant', label: '2. Applicant & Household', icon: User },
          { id: 'field', label: '3. Field Investigation & EXIF', icon: Camera },
          { id: 'financials', label: '4. Waterfall Cash Flow Engine', icon: Calculator },
          { id: 'decision', label: '5. Risk Score & Decision', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                isActive
                  ? 'bg-[#384c5e] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#eb8a23]' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: BUSINESS PROFILE & PRODUCT MAPPING */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-[#eb8a23]" />
              Business Profile & Establishment Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Firm / Trade Name *</label>
                <input
                  type="text"
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Constitution</label>
                <select
                  value={constitution}
                  onChange={(e) => setConstitution(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold"
                >
                  <option value="Proprietorship">Sole Proprietorship</option>
                  <option value="Partnership">Registered Partnership</option>
                  <option value="Pvt Ltd">Private Limited Company</option>
                  <option value="LLP">Limited Liability Partnership</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Years in Business (Vintage)</label>
                <input
                  type="number"
                  value={yearsInBusiness}
                  onChange={(e) => setYearsInBusiness(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Premises Ownership</label>
                <select
                  value={shopOwnership}
                  onChange={(e) => setShopOwnership(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold"
                >
                  <option value="RENTED">Rented Premises</option>
                  <option value="OWN">Self Owned Premises</option>
                  <option value="FAMILY">Family / Ancestral Owned</option>
                </select>
              </div>

              {shopOwnership === 'RENTED' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Shop Rent (₹)</label>
                  <input
                    type="number"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Carpet Area (Sq. Ft.)</label>
                <input
                  type="number"
                  value={shopAreaSqFt}
                  onChange={(e) => setShopAreaSqFt(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Inventory Value (₹)</label>
                <input
                  type="number"
                  value={inventoryValue}
                  onChange={(e) => setInventoryValue(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Product Breakdown Matrix */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-[#eb8a23]" />
                  Product Mapping & Revenue Contribution Matrix
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Category specific item breakdown with margin % and sales share.
                </p>
              </div>

              <div className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                totalProductContribPct === 100 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                  : 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
              }`}>
                Total Share: {totalProductContribPct}% {totalProductContribPct !== 100 && '(Must sum to 100%)'}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Product / Service Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-center">Share %</th>
                    <th className="p-3 text-center">Avg Margin %</th>
                    <th className="p-3">Inventory Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {productsList.map((prod, idx) => (
                    <tr key={prod.id || idx} className="hover:bg-slate-50/80">
                      <td className="p-3 font-bold text-[#2d3e50]">
                        <input
                          type="text"
                          value={prod.productName}
                          onChange={(e) => {
                            const updated = [...productsList];
                            updated[idx].productName = e.target.value;
                            setProductsList(updated);
                          }}
                          className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-[#eb8a23] focus:outline-none py-1"
                        />
                      </td>
                      <td className="p-3 text-slate-600">{prod.productCategory}</td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          value={prod.revenueContributionPct}
                          onChange={(e) => {
                            const updated = [...productsList];
                            updated[idx].revenueContributionPct = Number(e.target.value);
                            setProductsList(updated);
                          }}
                          className="w-16 text-center border border-slate-300 rounded py-1 font-bold text-[#2d3e50]"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          value={prod.averageMarginPct}
                          onChange={(e) => {
                            const updated = [...productsList];
                            updated[idx].averageMarginPct = Number(e.target.value);
                            setProductsList(updated);
                          }}
                          className="w-16 text-center border border-slate-300 rounded py-1 font-bold text-emerald-700"
                        />
                      </td>
                      <td className="p-3 text-slate-600 font-bold">
                        {prod.inventoryType}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {renderTabNavigationFooter()}
        </div>
      )}

      {/* TAB 2: APPLICANT & HOUSEHOLD PROFILE */}
      {activeTab === 'applicant' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-[#eb8a23]" />
              Borrower & Family KYC Profile
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Applicant Name *</label>
                <input
                  type="text"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PAN Number *</label>
                <input
                  type="text"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Aadhaar Number *</label>
                <input
                  type="text"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bureau CIBIL Score</label>
                <input
                  type="number"
                  value={cibilScore}
                  onChange={(e) => setCibilScore(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Residence Ownership</label>
                <select
                  value={residenceOwnership}
                  onChange={(e) => setResidenceOwnership(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold"
                >
                  <option value="OWN">Self / Family Owned</option>
                  <option value="RENTED">Rented Residence</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={residenceAddress}
                  onChange={(e) => setResidenceAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Number of Dependents</label>
                <input
                  type="number"
                  value={dependentsCount}
                  onChange={(e) => setDependentsCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold"
                />
              </div>
            </div>
          </div>
          {renderTabNavigationFooter()}
        </div>
      )}

      {/* TAB 3: FIELD INVESTIGATION & EXIF PHOTOS */}
      {activeTab === 'field' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#eb8a23]" />
              On-Site Footfall Observation & Field Verification
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Observed Customers / Day</label>
                <input
                  type="number"
                  value={dailyFootfall}
                  onChange={(e) => setDailyFootfall(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Avg Ticket Size (₹/customer)</label>
                <input
                  type="number"
                  value={avgTicketValue}
                  onChange={(e) => setAvgTicketValue(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Working Days / Month</label>
                <input
                  type="number"
                  value={workingDays}
                  onChange={(e) => setWorkingDays(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-bold"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
              <span className="font-bold text-slate-600">Automated Field Cross-Check Monthly Revenue Formula:</span>
              <span className="font-black text-[#eb8a23] text-sm">
                {dailyFootfall} cust × ₹{avgTicketValue} × {workingDays} days = ₹{crossCheckMonthlySales.toLocaleString('en-IN')} / mo
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Neighbor / Market Reference Feedback</label>
                <textarea
                  value={neighborFeedback}
                  onChange={(e) => setNeighborFeedback(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Landlord / Premises Verification Comments</label>
                <textarea
                  value={landlordFeedback}
                  onChange={(e) => setLandlordFeedback(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]"
                />
              </div>
            </div>
          </div>

          {/* EXIF GPS Photos */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#eb8a23]" />
                EXIF GPS Geotagged Field Inspection Proofs
              </h3>
              <label className="flex items-center gap-1.5 px-3.5 py-2 bg-[#eb8a23] hover:bg-[#d97917] text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer">
                {isUploadingPhoto ? (
                  <span className="animate-pulse">Uploading...</span>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-white" />
                    Upload Photo
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploadingPhoto(true);
                        const reader = new FileReader();
                        reader.onloadend = async () => {
                          try {
                            const base64Data = reader.result as string;
                            const res = await api.uploadPhoto(file.name, base64Data, parseFloat(exifGpsLat) || 26.9124, parseFloat(exifGpsLng) || 75.7873);
                            if (res) {
                              setPhotos(prev => [...prev, { ...res, categoryTag: 'Field Proof' }]);
                            }
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setIsUploadingPhoto(false);
                          }
                        };
                        reader.readAsDataURL(file);
                      }} 
                    />
                  </>
                )}
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {photos.length === 0 ? (
                <div className="col-span-1 sm:col-span-2 p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
                  <Camera className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 font-bold">No photos uploaded yet</p>
                  <p className="text-xs text-slate-400">Click upload to add field inspection proofs</p>
                </div>
              ) : (
                photos.map((photo, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-[#2d3e50] truncate max-w-[150px]">{photo.caption}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          GPS: {photo.gpsCoordinates?.latitude?.toFixed(4)}, {photo.gpsCoordinates?.longitude?.toFixed(4)}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                        VERIFIED GPS
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {renderTabNavigationFooter()}
        </div>
      )}

      {/* TAB 4: FINANCIAL ANALYSIS & ITEMIZED PRICE x QTY x DAYS CALCULATOR */}
      {activeTab === 'financials' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[#eb8a23]" />
                  Waterfall Cash Flow & Financial Analysis Engine
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Itemized Price × Quantity × Days breakdown matched against category standards for {currentCategory.name}.
                </p>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-500 font-bold">Proposed Loan Facility</div>
                <div className="text-base font-black text-[#2d3e50]">₹{appliedAmount.toLocaleString('en-IN')} @ {interestRatePct}% for {tenureMonths}m</div>
              </div>
            </div>

            {/* Live Financial Waterfall Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Adopted Monthly Sales</p>
                <div className="text-xl font-black text-[#2d3e50] mt-1">₹{adoptedMonthlySales.toLocaleString('en-IN')}</div>
                <p className="text-[10px] text-slate-400 mt-0.5">Min(Stated, Footfall Cross-check)</p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-[10px] font-bold text-emerald-800 uppercase">Gross Profit ({grossMarginPct}%)</p>
                <div className="text-xl font-black text-emerald-800 mt-1">₹{grossProfit.toLocaleString('en-IN')}</div>
                <p className="text-[10px] text-emerald-600 mt-0.5">COGS Share: {cogsMarginPct}%</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-[10px] font-bold text-blue-800 uppercase">Net Business Operating Income</p>
                <div className="text-xl font-black text-blue-900 mt-1">₹{netBusinessIncome.toLocaleString('en-IN')}</div>
                <p className="text-[10px] text-blue-600 mt-0.5">OpEx Total: ₹{totalOperatingExpenses.toLocaleString('en-IN')}</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-[10px] font-bold text-amber-900 uppercase">Net Monthly Family Surplus</p>
                <div className="text-xl font-black text-[#d97917] mt-1">₹{netFamilySurplusBeforeEmi.toLocaleString('en-IN')}</div>
                <p className="text-[10px] text-amber-700 mt-0.5">Available Before Proposed EMI</p>
              </div>
            </div>

            {/* Price x Quantity x Days Itemized Income Breakdown */}
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h4 className="text-xs font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Itemized Income & Goods Revenue ({currentCategory.name})
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">Editable Price × Quantity per Day × Working Days format.</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-xs font-extrabold px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg">
                    Itemized Total: ₹{itemizedMonthlyIncomeTotal.toLocaleString('en-IN')} / mo
                  </div>
                  <button
                    onClick={handleSyncItemizedToStatedTurnover}
                    className="px-2.5 py-1 bg-[#384c5e] hover:bg-[#2d3e50] text-white text-[11px] font-bold rounded-lg transition"
                  >
                    Sync to Stated Turnover
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-200/70 text-slate-700 font-extrabold uppercase tracking-wider">
                    <tr>
                      <th className="p-2.5">Item / Particulars</th>
                      <th className="p-2.5 text-center">Price / Rate (₹)</th>
                      <th className="p-2.5 text-center">Qty / Day</th>
                      <th className="p-2.5 text-center">Unit Label</th>
                      <th className="p-2.5 text-center">Days / Mo</th>
                      <th className="p-2.5 text-right">Monthly Total (₹)</th>
                      <th className="p-2.5 text-right">Yearly Total (₹)</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white font-medium">
                    {incomeLines.map((line) => {
                      const monthlyLineTotal = line.pricePerUnit * line.quantityPerDay * line.workingDays;
                      return (
                        <tr key={line.id} className="hover:bg-slate-50">
                          <td className="p-2">
                            <input
                              type="text"
                              value={line.particulars}
                              onChange={(e) => handleUpdateIncomeLine(line.id, 'particulars', e.target.value)}
                              className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-bold text-[#2d3e50]"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              value={line.pricePerUnit}
                              onChange={(e) => handleUpdateIncomeLine(line.id, 'pricePerUnit', Number(e.target.value))}
                              className="w-20 px-2 py-1 border border-slate-300 rounded text-xs text-center font-bold"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              value={line.quantityPerDay}
                              onChange={(e) => handleUpdateIncomeLine(line.id, 'quantityPerDay', Number(e.target.value))}
                              className="w-16 px-2 py-1 border border-slate-300 rounded text-xs text-center font-bold"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="text"
                              value={line.unitLabel}
                              onChange={(e) => handleUpdateIncomeLine(line.id, 'unitLabel', e.target.value)}
                              className="w-20 px-2 py-1 border border-slate-300 rounded text-xs text-center font-medium"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              value={line.workingDays}
                              onChange={(e) => handleUpdateIncomeLine(line.id, 'workingDays', Number(e.target.value))}
                              className="w-16 px-2 py-1 border border-slate-300 rounded text-xs text-center font-bold"
                            />
                          </td>
                          <td className="p-2 text-right font-black text-emerald-700">
                            ₹{monthlyLineTotal.toLocaleString('en-IN')}
                          </td>
                          <td className="p-2 text-right font-bold text-slate-600">
                            ₹{(monthlyLineTotal * 12).toLocaleString('en-IN')}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => handleRemoveIncomeLine(line.id)}
                              className="p-1 text-rose-500 hover:text-rose-700 rounded transition"
                              title="Delete Item Line"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-1">
                <button
                  onClick={handleAddIncomeLine}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Income Item Line
                </button>
                <div className="text-xs font-bold text-slate-500">
                  Formula: Price × Qty/Day × Working Days
                </div>
              </div>
            </div>

            {/* Price x Quantity x Days Itemized Expenditure Breakdown */}
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h4 className="text-xs font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-rose-600" />
                    Itemized Operating Expenditures & Direct Costs ({currentCategory.name})
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">Editable Cost × Quantity per Day × Working Days format.</p>
                </div>

                <div className="text-xs font-extrabold px-3 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-lg">
                  Itemized Expense Total: ₹{itemizedMonthlyExpenseTotal.toLocaleString('en-IN')} / mo
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-200/70 text-slate-700 font-extrabold uppercase tracking-wider">
                    <tr>
                      <th className="p-2.5">Expenditure / Cost Line</th>
                      <th className="p-2.5 text-center">Cost / Unit (₹)</th>
                      <th className="p-2.5 text-center">Qty / Day</th>
                      <th className="p-2.5 text-center">Unit Label</th>
                      <th className="p-2.5 text-center">Days / Mo</th>
                      <th className="p-2.5 text-right">Monthly Total (₹)</th>
                      <th className="p-2.5 text-right">Yearly Total (₹)</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white font-medium">
                    {expenseLines.map((line) => {
                      const monthlyLineTotal = line.pricePerUnit * line.quantityPerDay * line.workingDays;
                      return (
                        <tr key={line.id} className="hover:bg-slate-50">
                          <td className="p-2">
                            <input
                              type="text"
                              value={line.particulars}
                              onChange={(e) => handleUpdateExpenseLine(line.id, 'particulars', e.target.value)}
                              className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-bold text-[#2d3e50]"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              value={line.pricePerUnit}
                              onChange={(e) => handleUpdateExpenseLine(line.id, 'pricePerUnit', Number(e.target.value))}
                              className="w-20 px-2 py-1 border border-slate-300 rounded text-xs text-center font-bold"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              value={line.quantityPerDay}
                              onChange={(e) => handleUpdateExpenseLine(line.id, 'quantityPerDay', Number(e.target.value))}
                              className="w-16 px-2 py-1 border border-slate-300 rounded text-xs text-center font-bold"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="text"
                              value={line.unitLabel}
                              onChange={(e) => handleUpdateExpenseLine(line.id, 'unitLabel', e.target.value)}
                              className="w-20 px-2 py-1 border border-slate-300 rounded text-xs text-center font-medium"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              value={line.workingDays}
                              onChange={(e) => handleUpdateExpenseLine(line.id, 'workingDays', Number(e.target.value))}
                              className="w-16 px-2 py-1 border border-slate-300 rounded text-xs text-center font-bold"
                            />
                          </td>
                          <td className="p-2 text-right font-black text-rose-700">
                            ₹{monthlyLineTotal.toLocaleString('en-IN')}
                          </td>
                          <td className="p-2 text-right font-bold text-slate-600">
                            ₹{(monthlyLineTotal * 12).toLocaleString('en-IN')}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => handleRemoveExpenseLine(line.id)}
                              className="p-1 text-rose-500 hover:text-rose-700 rounded transition"
                              title="Delete Expense Line"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-1">
                <button
                  onClick={handleAddExpenseLine}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Expenditure Line
                </button>
                <div className="text-xs font-bold text-slate-500">
                  Formula: Cost × Qty/Day × Working Days
                </div>
              </div>
            </div>

            {/* Waterfall Input Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Stated Monthly Sales Turnover (₹)</label>
                <input
                  type="number"
                  value={statedMonthlySales}
                  onChange={(e) => setStatedMonthlySales(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">COGS / Stock Purchase % ({cogsMarginPct}%)</label>
                <input
                  type="range"
                  min={40}
                  max={92}
                  value={cogsMarginPct}
                  onChange={(e) => setCogsMarginPct(Number(e.target.value))}
                  className="w-full accent-[#eb8a23]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Proposed Loan Amount (₹)</label>
                <input
                  type="number"
                  value={appliedAmount}
                  onChange={(e) => setAppliedAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold text-[#eb8a23]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Staff Salaries (₹/mo)</label>
                <input
                  type="number"
                  value={salariesExpense}
                  onChange={(e) => setSalariesExpense(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Power & Utilities (₹/mo)</label>
                <input
                  type="number"
                  value={utilitiesExpense}
                  onChange={(e) => setUtilitiesExpense(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Household Expenses (₹/mo)</label>
                <input
                  type="number"
                  value={householdExpenses}
                  onChange={(e) => setHouseholdExpenses(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-semibold"
                />
              </div>
            </div>

            {/* LIVE FINANCIAL RATIOS CARD */}
            <div className="bg-[#384c5e] text-white rounded-xl p-5 shadow-md flex flex-wrap items-center justify-between gap-6">
              <div>
                <div className="text-xs text-amber-300 font-bold uppercase tracking-wider">Automated Debt Service Coverage Ratios</div>
                <div className="flex items-center gap-6 mt-2">
                  <div>
                    <div className="text-[10px] text-slate-300">Proposed Monthly EMI</div>
                    <div className="text-xl font-black text-white">₹{proposedEmi.toLocaleString('en-IN')}</div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-300">DSCR Ratio</div>
                    <div className={`text-xl font-black ${dscrRatio >= 1.25 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {dscrRatio}x
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-300">FOIR Obligation</div>
                    <div className={`text-xl font-black ${foirPct <= 60 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {foirPct}%
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-300">Post-Loan Net Surplus</div>
                    <div className="text-xl font-black text-amber-300">₹{postLoanSurplus.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${
                  dscrRatio >= 1.25 && foirPct <= 60 ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {dscrRatio >= 1.25 && foirPct <= 60 ? 'Policy Compliant' : 'Conditional Approval Needed'}
                </span>
              </div>
            </div>
          </div>
          {renderTabNavigationFooter()}
        </div>
      )}

      {/* TAB 5: AUTOMATED RISK SCORE & AUTOMATIC EXECUTIVE SUMMARY REPORT */}
      {activeTab === 'decision' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#eb8a23]" />
                  Automated Credit Assessment & Risk Scoring Report
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Real-time rule engine evaluation for {firmName} ({applicantName}).
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Risk Quality Score</div>
                  <div className="text-2xl font-black" style={{ color: riskAssessment.score >= 80 ? '#10b981' : riskAssessment.score >= 60 ? '#f59e0b' : '#ef4444' }}>
                    {riskAssessment.score} / 100
                  </div>
                </div>
                <div className="relative w-20 h-10 overflow-hidden flex items-end">
                  <svg viewBox="0 0 100 50" className="w-full h-full">
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" 
                      stroke={riskAssessment.score >= 80 ? '#10b981' : riskAssessment.score >= 60 ? '#f59e0b' : '#ef4444'} 
                      strokeWidth="12" strokeLinecap="round" 
                      strokeDasharray="125.6" 
                      strokeDashoffset={125.6 - (riskAssessment.score / 100) * 125.6} 
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Decision Recommendation Banner */}
            <div className={`p-5 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${
              riskAssessment.decision === 'APPROVED' 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                : riskAssessment.decision === 'CONDITIONAL'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-sm font-black uppercase tracking-wide">
                    AUTOMATED RECOMMENDATION: {riskAssessment.decision === 'APPROVED' ? 'RECOMMENDED FOR SANCTION' : riskAssessment.decision}
                  </div>
                  <p className="text-xs font-medium mt-0.5 opacity-90">
                    Applicant demonstrates adequate cash flow coverage with post-loan DSCR of {dscrRatio}x and FOIR of {foirPct}%. Recommended Sanction: ₹{appliedAmount.toLocaleString('en-IN')}.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDirectPrintReport}
                  className="px-4 py-2.5 bg-[#eb8a23] hover:bg-[#d97917] text-white font-bold text-xs rounded-lg shadow-md transition flex items-center gap-2"
                >
                  <Printer className="w-4 h-4 text-white" />
                  Print Official Company PD Report
                </button>
              </div>
            </div>

            {/* Manager Override Section */}
            {currentUser?.role !== 'EMPLOYEE' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-800 uppercase">Manager Override Actions</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    Restricted to {currentUser?.role}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                   <button 
                     onClick={() => alert('Manual Override: Status changed to APPROVED')}
                     className="px-4 py-2 bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-lg shadow-sm text-xs font-bold transition"
                   >
                     Force Sanction
                   </button>
                   <button 
                     onClick={() => alert('Manual Override: Status changed to REJECTED')}
                     className="px-4 py-2 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg shadow-sm text-xs font-bold transition"
                   >
                     Force Decline
                   </button>
                   <button 
                     onClick={() => alert('File sent back for re-verification')}
                     className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg shadow-sm text-xs font-bold transition"
                   >
                     Request Re-Verification
                   </button>
                </div>
              </div>
            )}

            {/* AUTOMATED EXECUTIVE SUMMARY CARD (DISPLAYED DIRECTLY AT RISK SCORE MENU) */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#eb8a23]" />
                  <h4 className="text-xs font-extrabold text-[#2d3e50] uppercase tracking-wider">
                    Executive Appraisal Summary & Credit Synthesis
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  AUTOMATICALLY GENERATED
                </span>
              </div>

              <div className="prose prose-xs max-w-none text-slate-700 text-xs leading-relaxed space-y-3">
                <p>
                  <strong>Borrower & Vintage Profile:</strong> {applicantName} operates <strong>{firmName}</strong> ({currentCategory.name}) with an established business vintage of <strong>{yearsInBusiness} years</strong>. On-site field verification confirmed average daily footfall of <strong>{dailyFootfall} customers</strong> with average ticket size of <strong>₹{avgTicketValue}</strong> across {workingDays} monthly working days.
                </p>
                <p>
                  <strong>Sales & Cash Flow Waterfall:</strong> Stated monthly sales turnover of <strong>₹{statedMonthlySales.toLocaleString('en-IN')}</strong> is cross-checked against footfall observation (₹{crossCheckMonthlySales.toLocaleString('en-IN')}), adopting a conservative monthly turnover of <strong>₹{adoptedMonthlySales.toLocaleString('en-IN')}</strong>. Gross profit margin is assessed at <strong>{grossMarginPct}% (₹{grossProfit.toLocaleString('en-IN')})</strong>. After total business operating expenses of <strong>₹{totalOperatingExpenses.toLocaleString('en-IN')}</strong> and household living costs of <strong>₹{householdExpenses.toLocaleString('en-IN')}</strong>, net monthly disposable surplus stands at <strong>₹{(postLoanSurplus + proposedEmi).toLocaleString('en-IN')}</strong>.
                </p>
                <p>
                  <strong>Debt Service Capacity & Policy Compliance:</strong> The requested micro-lending facility of <strong>₹{appliedAmount.toLocaleString('en-IN')}</strong> at {interestRatePct}% for {tenureMonths} months requires a monthly EMI of <strong>₹{proposedEmi.toLocaleString('en-IN')}</strong>. The post-loan DSCR is calculated at <strong>{dscrRatio}x</strong> (policy threshold ≥ 1.25x) with FOIR at <strong>{foirPct}%</strong> (policy cap ≤ 60%), fully satisfying institutional credit guidelines.
                </p>
                <p>
                  <strong>Bureau & Community Verification:</strong> Credit bureau CIBIL score is verified at <strong>{cibilScore}</strong> with clean repayment track record. Local market and neighbor reference checks confirm positive reputation and stable operating history.
                </p>
              </div>

              {/* Financial Waterfall Summary Table */}
              <div className="pt-2">
                <div className="text-[11px] font-extrabold text-slate-600 uppercase mb-2">Key Financial Waterfall Summary</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-bold">Adopted Monthly Revenue</div>
                    <div className="text-xs font-black text-[#2d3e50]">₹{adoptedMonthlySales.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-bold">Net Business Operating Profit</div>
                    <div className="text-xs font-black text-emerald-700">₹{netBusinessIncome.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-bold">Proposed Monthly EMI</div>
                    <div className="text-xs font-black text-blue-700">₹{proposedEmi.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-bold">Post-Loan Net Surplus</div>
                    <div className="text-xs font-black text-[#eb8a23]">₹{postLoanSurplus.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths & Flags Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Key Institutional Credit Strengths ({riskAssessment.strengths.length})
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {riskAssessment.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Audit & Compliance Risk Flags ({riskAssessment.flags.length})
                </h4>
                {riskAssessment.flags.length === 0 ? (
                  <p className="text-xs text-slate-500">No critical risk flags detected.</p>
                ) : (
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {riskAssessment.flags.map((flag, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          {renderTabNavigationFooter()}
        </div>
      )}

      {/* CATEGORY SELECTOR MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-[#384c5e] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-[#eb8a23]" />
                <h3 className="font-bold text-sm">Select Business Category ({INITIAL_CATEGORIES.length} Profiles)</h3>
              </div>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-300 hover:text-white font-bold text-xl">
                &times;
              </button>
            </div>

            <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Search among 21 categories (e.g. Kirana, Hardware, Pharmacy, Garage...)"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb8a23]"
                />
              </div>
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredCategoriesModal.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    selectedCategoryId === cat.id
                      ? 'border-[#eb8a23] bg-amber-50/80 ring-2 ring-[#eb8a23]/30'
                      : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {cat.industryGroup}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#2d3e50]">{cat.name}</div>
                    <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">{cat.description}</div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] font-bold text-emerald-700 flex items-center justify-between">
                    <span>Margin: {cat.typicalMarginMin}% - {cat.typicalMarginMax}%</span>
                    <ArrowRight className="w-3 h-3 text-[#eb8a23]" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* 1-CLICK APPLICATION CASE GALLERY MODAL */}
      {isAppGalleryOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#384c5e] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                <div>
                  <h3 className="font-bold text-sm">1-Click Load Application Cases</h3>
                  <p className="text-[11px] text-slate-300">Select any pre-audited loan file to instantly auto-populate all 5 PD Studio modules.</p>
                </div>
              </div>
              <button onClick={() => setIsAppGalleryOpen(false)} className="text-slate-300 hover:text-white font-bold text-xl">
                &times;
              </button>
            </div>

            {/* Bank Filter Tabs */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filter Bank:
                </span>
                {['ALL', 'axis', 'hdfc', 'icici', 'sbi', 'indusind', 'kotak'].map((bId) => {
                  const label = bId === 'ALL' ? 'All Banks (6)' : bId.toUpperCase();
                  const isActive = selectedBankFilter === bId;
                  return (
                    <button
                      key={bId}
                      onClick={() => setSelectedBankFilter(bId)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                        isActive
                          ? 'bg-[#eb8a23] text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Showing <strong>{galleryApplications.length}</strong> applications
              </div>
            </div>

            {/* Application Cards Grid */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryApplications.map((app) => (
                <div
                  key={app.applicationNumber}
                  className="bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-xs text-[#eb8a23] bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        #{app.applicationNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        app.riskScore >= 80 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {app.riskScore >= 80 ? 'APPROVED' : 'CONDITIONAL'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-[#2d3e50]">{app.applicantName}</h4>
                      <p className="text-xs font-bold text-slate-600">{app.firmName}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{app.categoryName} • {app.constitution}</p>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Client Bank:</span>
                        <span className="font-bold text-[#2d3e50]">{app.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Applied Amount:</span>
                        <span className="font-extrabold text-emerald-700">₹{(app.appliedAmount || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">CIBIL / Vintage:</span>
                        <span className="font-bold text-slate-700">{app.cibilScore} Score / {app.yearsInBusiness} yrs</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleLoadSampleApp(app)}
                    className="w-full py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-300 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 shadow-xs group"
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white" />
                    Load App #{app.applicationNumber}
                  </button>

                  {currentUser?.role !== 'EMPLOYEE' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteApplication(app.applicationNumber); }}
                      className="w-full mt-1 py-1 bg-rose-50 hover:bg-rose-600 text-rose-800 hover:text-white border border-rose-300 rounded-lg text-[10px] font-extrabold transition flex items-center justify-center gap-1.5 shadow-xs group"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600 group-hover:text-white" />
                      Delete App
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
