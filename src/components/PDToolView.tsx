import React, { useState, useMemo, useEffect, useRef } from 'react';
import exifr from 'exifr';
import { INITIAL_CATEGORIES } from '../data/categoriesData';
import { INITIAL_PRODUCTS } from '../data/productsData';
import { SAMPLE_APPLICATIONS, SampleApplication } from '../data/sampleApplications';
import { api, EmployeeRecord } from '../services/api';
import { ClientBank } from '../data/clientBanksData';
import { Company } from './CompanySelectionView';
import { BusinessCategory, CategoryProduct, FinancialWaterfall, FamilyMember } from '../types';
import { openStandardPDReportPrintWindow } from '../utils/pdReportPrinter';
import { 
  Store, User, DollarSign, Camera, FileCheck, Sparkles, CheckCircle2, 
  AlertTriangle, RefreshCw, MapPin, Plus, Trash2, Shield, ArrowRight, 
  Building, Award, Search, X, Check, Calculator, PieChart, FileText, Upload,
  Briefcase, Building2, Filter, Layers, Zap, Printer, ChevronLeft, ChevronRight, Settings,
  Loader2, Bot
} from 'lucide-react';
import { 
  extractTextFromPdfFile, 
  parseCrifApplicant, 
  parseCrifSummary, 
  parseCrifAccounts, 
  parseCibilApplicant, 
  parseCibilSummary, 
  parseCibilAccounts 
} from '../services/clientPdfExtractor';
import { AccountDetailsTable } from './AccountDetailsTable';

export interface ItemizedCalculationLine {
  id: string;
  particulars: string;
  businessNotes?: string;
  quantity?: number;
  price?: number;
  workingDays?: number;
  unit?: string;
  monthlyAmount: number;
}

export interface CoApplicant {
  name: string;
  relation: string;
  otherRelation?: string;
  mobileNumber?: string;
  inBusiness?: boolean;
  businessRole?: string;
}

const getCategoryDefaultItemizedLines = (catId: string, footfall: number = 40, avgTicket: number = 250, days: number = 26, catsList: BusinessCategory[] = INITIAL_CATEGORIES) => {
  if (catId === 'chakki' || catId === 'flour_mill' || catId === 'atta_chakki') {
    return {
      income: [
        { id: 'inc-ck-1', particulars: 'Atta Chakki Grinding Income', monthlyAmount: 2 * 800 * (days || 28) },
        { id: 'inc-ck-2', particulars: 'Mustard Oil Extraction Charges', monthlyAmount: 6 * 200 * (days || 28) },
        { id: 'inc-ck-3', particulars: 'Mustard Cake (Khali) Trading', monthlyAmount: 4 * 120 * (days || 28) },
        { id: 'inc-ck-4', particulars: 'Spice Grinding (Chilli/Turmeric)', monthlyAmount: 20 * 30 * (days || 28) },
        { id: 'inc-ck-5', particulars: 'Kirana & Retail Grocery Counter', monthlyAmount: 4500 * 1 * (days || 28) },
      ],
      expense: [
        { id: 'exp-ck-1', particulars: 'Grocery Items Wholesale Purchase', monthlyAmount: 3375 * 1 * (days || 28) },
        { id: 'exp-ck-2', particulars: 'Electricity Engine Power Charges', monthlyAmount: 771 * 1 * (days || 28) },
        { id: 'exp-ck-3', particulars: 'Machine Upkeep & Maintenance', monthlyAmount: 285 * 1 * (days || 28) },
      ]
    };
  }

  if (catId === 'kirana' || catId === 'general_store') {
    return {
      income: [
        { id: 'inc-kr-1', particulars: 'FMCG, Toiletries & Packaged Goods', monthlyAmount: (avgTicket || 220) * (footfall || 45) * (days || 26) },
        { id: 'inc-kr-2', particulars: 'Loose Grains, Spices & Edible Oils', monthlyAmount: 1200 * 1 * (days || 26) },
      ],
      expense: [
        { id: 'exp-kr-1', particulars: 'Wholesale Inventory Restock (COGS)', monthlyAmount: Math.round(((avgTicket || 220) * (footfall || 45) + 1200) * 0.78) * 1 * (days || 26) },
        { id: 'exp-kr-2', particulars: 'Shop Premises Rent Expense', monthlyAmount: 400 * 1 * 30 },
        { id: 'exp-kr-3', particulars: 'Electricity & Cold Storage Meter', monthlyAmount: 180 * 1 * 30 },
        { id: 'exp-kr-4', particulars: 'Helper Wages & Logistics Freight', monthlyAmount: 350 * 1 * (days || 26) },
      ]
    };
  }

  if (catId === 'hardware' || catId === 'sanitary') {
    return {
      income: [
        { id: 'inc-hw-1', particulars: 'Hardware Tools & Sanitary Fittings Sales', monthlyAmount: 450 * (footfall || 25) * (days || 26) },
        { id: 'inc-hw-2', particulars: 'Paints & Construction Goods Sales', monthlyAmount: 1800 * 2 * (days || 26) },
      ],
      expense: [
        { id: 'exp-hw-1', particulars: 'Wholesale Stock Restock & Freight', monthlyAmount: 8500 * 1 * (days || 26) },
        { id: 'exp-hw-2', particulars: 'Shop & Godown Rent', monthlyAmount: 500 * 1 * 30 },
        { id: 'exp-hw-3', particulars: 'Electricity & Transport Freight', monthlyAmount: 300 * 1 * 30 },
      ]
    };
  }

  const cat = catsList.find(c => c.id === catId);
  const dailyRev = (avgTicket || 250) * (footfall || 40);
  return {
    income: [
      { id: 'inc-gen-1', particulars: `${cat?.name || 'Main Goods'} Daily Primary Sales`, monthlyAmount: (avgTicket || 250) * (footfall || 40) * (days || 26) },
      { id: 'inc-gen-2', particulars: 'Secondary Allied Products & Services', monthlyAmount: Math.round(dailyRev * 0.2) * 1 * (days || 26) },
    ],
    expense: [
      { id: 'exp-gen-1', particulars: 'Raw Materials / Inventory Procurement', monthlyAmount: Math.round(dailyRev * 0.72) * 1 * (days || 26) },
      { id: 'exp-gen-2', particulars: 'Power, Fuel & Utilities Overhead', monthlyAmount: 200 * 1 * 30 },
      { id: 'exp-gen-3', particulars: 'Shop / Facility Rent Overhead', monthlyAmount: 400 * 1 * 30 },
    ]
  };
};

const numberToWordsIndian = (num: number): string => {
  if (num === 0) return 'Zero';
  if (num === null || isNaN(num)) return '';

  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = ('000000000' + num).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';

  let str = '';
  str += (n[1] != '00') ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + 'Crore ' : '';
  str += (n[2] != '00') ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + 'Lakh ' : '';
  str += (n[3] != '00') ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + 'Thousand ' : '';
  str += (n[4] != '0') ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + 'Hundred ' : '';
  str += (n[5] != '00') ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])]) : '';
  
  return str.trim() + ' Rupees';
};

interface PDToolViewProps {
  currentUser?: EmployeeRecord | null;
  selectedClient?: ClientBank;
  selectedCompany: Company;
}

export const PDToolView: React.FC<PDToolViewProps> = ({ currentUser, selectedClient, selectedCompany }) => {
  // Active Category Selection
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('kirana');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [categoriesList, setCategoriesList] = useState<BusinessCategory[]>(INITIAL_CATEGORIES);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIndustry, setNewCatIndustry] = useState('Retail');
  const [newCatMarginMin, setNewCatMarginMin] = useState<number>(15);
  const [newCatMarginMax, setNewCatMarginMax] = useState<number>(40);
  const [newProducts, setNewProducts] = useState<CategoryProduct[]>([
    { id: 'tmp-1', categoryId: '', productName: 'Core Assortment', productCategory: 'Main', revenueContributionPct: 100, inventoryType: 'FAST_MOVING', averageMarginPct: 20, businessImportance: 'HIGH' }
  ]);

  const [allProducts, setAllProducts] = useState<CategoryProduct[]>(INITIAL_PRODUCTS);

  // Application Search & 1-Click Load States
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [isAppSearchOpen, setIsAppSearchOpen] = useState(false);
  const [isAppGalleryOpen, setIsAppGalleryOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [rawWhatsappText, setRawWhatsappText] = useState('');
  const [isExtractingWhatsapp, setIsExtractingWhatsapp] = useState(false);
  const [pendingWhatsappPayload, setPendingWhatsappPayload] = useState<any>(null);
  const [selectedBankFilter, setSelectedBankFilter] = useState<string>('ALL');
  const [loadedToastMessage, setLoadedToastMessage] = useState<string | null>(null);
  const [activeAppNumber, setActiveAppNumber] = useState<string>('INF/2026/88492');
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const activeAppIdRef = useRef(activeAppId);
  useEffect(() => { activeAppIdRef.current = activeAppId; }, [activeAppId]);
  
  const [photos, setPhotos] = useState<any[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  
  // Credit Report Extraction State
  const [creditReportType, setCreditReportType] = useState('NONE');
  const [creditReportFiles, setCreditReportFiles] = useState<File[]>([]);
  const [parsedCreditReport, setParsedCreditReport] = useState<any>(null);
  const [isParsingCreditReport, setIsParsingCreditReport] = useState(false);

  const handleParseCreditReport = async () => {
    if (creditReportFiles.length === 0) return;
    setIsParsingCreditReport(true);
    try {
      let combinedAccounts: any[] = [];
      let totalAccounts = 0;
      let activeAccounts = 0;
      let totalCurrentBalance = 0;
      let totalAmountOverdue = 0;
      
      let primaryApplicantInfo = null;
      let provider = 'CRIF';
      let flags: string[] = [];

      for (const file of creditReportFiles) {
        const text = await extractTextFromPdfFile(file);
        const isCibil = creditReportType === 'CIBIL' || (creditReportType !== 'CRIF' && text.includes('CIBIL'));
        provider = isCibil ? 'CIBIL' : 'CRIF';
        
        let applicantInfo, summary, accounts;
        if (provider === 'CIBIL') {
          applicantInfo = parseCibilApplicant(text);
          summary = parseCibilSummary(text);
          accounts = parseCibilAccounts(text, applicantInfo.name);
        } else {
          applicantInfo = parseCrifApplicant(text);
          summary = parseCrifSummary(text);
          accounts = parseCrifAccounts(text, applicantInfo.name);
        }

        if (!primaryApplicantInfo) primaryApplicantInfo = applicantInfo;
        
        totalAccounts += summary.totalAccounts || 0;
        activeAccounts += summary.activeAccounts || 0;
        totalCurrentBalance += summary.totalCurrentBalance || 0;
        totalAmountOverdue += summary.totalAmountOverdue || 0;
        
        if (summary.totalAmountOverdue > 0) {
          flags.push(`File ${file.name} - Overdue: ₹${summary.totalAmountOverdue.toLocaleString('en-IN')}`);
        }
        if (summary.overdueAccounts > 0) {
          flags.push(`File ${file.name} - ${summary.overdueAccounts} account(s) overdue`);
        }
        
        combinedAccounts = [...combinedAccounts, ...accounts];
      }

      setParsedCreditReport({
        reportProvider: provider + (creditReportFiles.length > 1 ? ' (Combined)' : ''),
        reportDate: primaryApplicantInfo?.reportDate,
        creditScore: primaryApplicantInfo?.score,
        totalAccounts: totalAccounts,
        activeAccounts: activeAccounts,
        totalCurrentBalance: totalCurrentBalance,
        totalOverdueAmount: totalAmountOverdue,
        flags: flags,
        accounts: combinedAccounts
      });
      
    } catch (err) {
      console.error(err);
      alert('Failed to parse report. Make sure you uploaded valid PDFs.');
    } finally {
      setIsParsingCreditReport(false);
    }
  };
  
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
        
        // Auto-load last active app if one isn't currently loaded
        if (!activeAppIdRef.current) {
          const lastId = localStorage.getItem('lastActiveAppId');
          if (lastId) {
            const appToLoad = data.find((a: any) => a._id === lastId);
            if (appToLoad) {
              // We do a small timeout to let the initial render settle before triggering 100 state updates
              setTimeout(() => handleLoadSampleApp(appToLoad), 100);
            }
          }
        }
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

  // Set default category to Aata Chakki for Moneyboxx
  useEffect(() => {
    if (selectedClient?.name?.toLowerCase().includes('moneyboxx')) {
      const aataCat = categoriesList.find(c => c.name.toLowerCase().includes('atta chakki') || c.name.toLowerCase().includes('aata chakki'));
      if (aataCat) {
        setSelectedCategoryId(aataCat.id);
      }
    }
  }, [selectedClient, categoriesList]);

  // Form Section Tabs
  const [activeTab, setActiveTab] = useState<'profile' | 'applicant' | 'verification' | 'customer_supplier' | 'field' | 'financials' | 'decision'>(
    (localStorage.getItem('lastActiveTab') as any) || 'applicant'
  );

  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatbotText, setChatbotText] = useState('');
  const [pendingAutofillFields, setPendingAutofillFields] = useState<any>(null);

  // Editable QnA fields
  const [briefBusinessProfile, setBriefBusinessProfile] = useState('');
  const [businessVintageText, setBusinessVintageText] = useState('');
  const [staffCountText, setStaffCountText] = useState('');
  const [premiseOwnershipText, setPremiseOwnershipText] = useState('');
  const [factoryInfrastructureText, setFactoryInfrastructureText] = useState('');
  const [stockDetailsValueText, setStockDetailsValueText] = useState('');
  const [fixedAndCurrentAssetAnalysisText, setFixedAndCurrentAssetAnalysisText] = useState('');
  const [assetCreationText, setAssetCreationText] = useState('');
  const [businessInvestmentText, setBusinessInvestmentText] = useState('');
  const [agriculturalIncomeText, setAgriculturalIncomeText] = useState('');
  const [solarSavingText, setSolarSavingText] = useState('');
  const [projectedIncomeText, setProjectedIncomeText] = useState('');

  const getParsedFieldsFromMarkdown = (markdownText: string) => {
    if (!markdownText) return null;
    
    const extractTableValue = (key: string) => {
       const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
       
       // Try markdown table format: `| key | value |` or `| **key** | value |`
       const tableRegex = new RegExp(`\\|\\s*(?:\\*\\*)?${escapedKey}(?:\\*\\*)?\\s*\\|\\s*(.*?)\\s*\\|`, 'i');
       let match = markdownText.match(tableRegex);
       
       if (!match) {
         // Try key-value format: `key: value` or `key - value`
         const kvRegex = new RegExp(`${escapedKey}\\s*[:\\-]\\s*(.+)`, 'i');
         match = markdownText.match(kvRegex);
       }
       
       if (match && match[1]) {
           let val = match[1].replace(/\\*\\*/g, '').trim();
           val = val.replace(/\\|$/, '').trim(); // clean up trailing pipe if any
           return val;
       }
       return '';
    };

    const parsed: any = {};
    
    const parsedVintage = extractTableValue('Vintage of the business');
    if (parsedVintage) parsed['Business Vintage'] = parsedVintage;

    const parsedStaff = extractTableValue('Number of Staffs');
    if (parsedStaff) parsed['Staff Count'] = parsedStaff;

    const parsedPremise = extractTableValue('Is office premise on rented / owned');
    if (parsedPremise) parsed['Premise Ownership'] = parsedPremise;

    const parsedAssets = extractTableValue('Details of Office / Factory Infrastructure (Assets)');
    if (parsedAssets) parsed['Factory Infrastructure'] = parsedAssets;

    const parsedStock = extractTableValue('Stock details with estimated value');
    if (parsedStock) parsed['Stock Details'] = parsedStock;

    const parsedAnalysis = extractTableValue('Fixed & Current Asset Analysis');
    if (parsedAnalysis) parsed['Asset Analysis'] = parsedAnalysis;

    const parsedCreation = extractTableValue('Asset Creation Through Business');
    if (parsedCreation) parsed['Asset Creation'] = parsedCreation;

    const parsedInvest = extractTableValue('Business Investment');
    if (parsedInvest) parsed['Business Investment (Text)'] = parsedInvest;

    const parsedAgri = extractTableValue('Agricultural Income Details');
    if (parsedAgri) parsed['Agricultural Income'] = parsedAgri;

    const parsedSolar = extractTableValue('Solar Saving Analysis');
    if (parsedSolar) parsed['Solar Saving'] = parsedSolar;

    const parsedProjected = extractTableValue('Projected Income');
    if (parsedProjected) parsed['Projected Income'] = parsedProjected;

    const profileMatch = markdownText.match(/### Business Profile\\n([\\s\\S]*?)### Business Profile/);
    if (profileMatch && profileMatch[1]) {
       parsed['Brief Business Profile'] = profileMatch[1].trim();
    }
    
    // Parse Vintage
    const vintageMatch = markdownText.match(/vintage.*?(\\d+)\\s*years/i) || markdownText.match(/(\\d+)\\s*years/i);
    if (vintageMatch && vintageMatch[1]) {
      parsed['Years in Business'] = parseInt(vintageMatch[1]);
    }
    
    // Parse Business Investment
    const invMatch = markdownText.match(/₹(\\d+)\\s*lakh/i) || markdownText.match(/investment.*?₹(\\d+)\\s*lakh/i);
    if (invMatch && invMatch[1]) {
      parsed['Initial Investment'] = parseInt(invMatch[1]) * 100000;
    }
    
    // Parse Agriculture
    if (markdownText.match(/Agricultural Income Details/i) && markdownText.match(/bighas/i)) {
      parsed['Has Agriculture Land'] = true;
      const bighasMatch = markdownText.match(/(\\d+)\\s*bighas/i);
      if (bighasMatch && bighasMatch[1]) parsed['Agri Land Area'] = parseInt(bighasMatch[1]);
      parsed['Agri Land Unit'] = 'Bigha';
      const agriIncMatch = markdownText.match(/₹(\\d+)\\s*lakh per crop/i);
      if (agriIncMatch && agriIncMatch[1]) {
        parsed['Agri Income Min'] = parseInt(agriIncMatch[1]) * 100000;
        parsed['Agri Income Max'] = parseInt(agriIncMatch[1]) * 100000;
      }
    }
    
    // Parse Kirana store
    if (markdownText.match(/Kirana Store/i) || markdownText.match(/Other Source Income/i)) {
      parsed['Has Other Income'] = true;
      parsed['_otherIncomeSources'] = [{ id: Date.now(), source: 'Business', frequency: 'Monthly', amount: 1000 * 30, remarks: 'Kirana Store' }];
    }

    // Solar saving
    const solarMatch = markdownText.match(/(\\d+)–(\\d+)\\s*units.*?₹(\\d+)/i) || markdownText.match(/(\\d+)\\s*units.*?₹(\\d+)/i);
    if (solarMatch) {
       parsed['Power Source'] = 'Electricity';
       if (solarMatch.length === 4) {
         parsed['Monthly Energy Expense'] = parseInt(solarMatch[2]) * parseInt(solarMatch[3]) * 30;
       } else if (solarMatch.length === 3) {
         parsed['Monthly Energy Expense'] = parseInt(solarMatch[1]) * parseInt(solarMatch[2]) * 30;
       }
    }
    return parsed;
  };

  const applyParsedFields = (parsed: any) => {
    if (parsed['Business Vintage'] !== undefined) {
      setBusinessVintageText(parsed['Business Vintage']);
      const match = parsed['Business Vintage'].match(/(\\d+)/);
      if (match && match[1]) {
        setYearsInBusiness(Number(match[1]));
        setBusinessAgeYears(Number(match[1]));
      }
    }
    
    if (parsed['Staff Count'] !== undefined) {
      setStaffCountText(parsed['Staff Count']);
      const match = parsed['Staff Count'].match(/(\\d+)/);
      if (match && match[1]) setExternalStaffCount(Number(match[1]));
    }
    
    if (parsed['Premise Ownership'] !== undefined) {
      setPremiseOwnershipText(parsed['Premise Ownership']);
      const txt = parsed['Premise Ownership'].toLowerCase();
      if (txt.includes('own')) setShopOwnership('OWN');
      else if (txt.includes('rent')) setShopOwnership('RENTED');
      else if (txt.includes('family')) setShopOwnership('FAMILY');
    }
    
    if (parsed['Factory Infrastructure'] !== undefined) setFactoryInfrastructureText(parsed['Factory Infrastructure']);
    
    if (parsed['Stock Details'] !== undefined) {
      setStockDetailsValueText(parsed['Stock Details']);
      const match = parsed['Stock Details'].match(/₹?([\\d,]+)/);
      if (match && match[1]) {
        const val = Number(match[1].replace(/,/g, ''));
        if (!isNaN(val) && val > 0) setInventoryValue(val);
      }
    }
    
    if (parsed['Asset Analysis'] !== undefined) setFixedAndCurrentAssetAnalysisText(parsed['Asset Analysis']);
    if (parsed['Asset Creation'] !== undefined) setAssetCreationText(parsed['Asset Creation']);
    if (parsed['Business Investment (Text)'] !== undefined) {
      setBusinessInvestmentText(parsed['Business Investment (Text)']);
      if (parsed['Initial Investment'] === undefined) {
        const invMatch = parsed['Business Investment (Text)'].match(/₹?([\\d,]+)\\s*lakh/i);
        if (invMatch && invMatch[1]) {
           const val = Number(invMatch[1].replace(/,/g, ''));
           if (!isNaN(val)) setInitialInvestment(val * 100000);
        } else {
           const rawMatch = parsed['Business Investment (Text)'].match(/₹?([\\d,]+)/);
           if (rawMatch && rawMatch[1]) {
             const val = Number(rawMatch[1].replace(/,/g, ''));
             if (!isNaN(val) && val > 0) setInitialInvestment(val);
           }
        }
      }
    }

    if (parsed['Agricultural Income'] !== undefined) {
      setAgriculturalIncomeText(parsed['Agricultural Income']);
      if (parsed['Has Agriculture Land'] === undefined) {
        const text = parsed['Agricultural Income'].toLowerCase();
        if (text.includes('bigha') || text.includes('acre')) {
          setHasAgricultureLand(true);
          if (text.includes('bigha')) setAgriLandUnit('Bigha');
          else if (text.includes('acre')) setAgriLandUnit('Acre');
          
          const areaMatch = text.match(/(\\d+)\\s*(bigha|acre)/i);
          if (areaMatch && areaMatch[1]) setAgriLandArea(Number(areaMatch[1]));
        }
        
        const amtMatch = parsed['Agricultural Income'].match(/₹?([\\d,]+)\\s*lakh/i);
        if (amtMatch && amtMatch[1]) {
          const val = Number(amtMatch[1].replace(/,/g, '')) * 100000;
          setAgriIncomeMin(val);
          setAgriIncomeMax(val);
        } else {
          const rawMatch = parsed['Agricultural Income'].match(/₹?([\\d,]+)/);
          if (rawMatch && rawMatch[1]) {
            const val = Number(rawMatch[1].replace(/,/g, ''));
            if (!isNaN(val) && val > 0) {
              setAgriIncomeMin(val);
              setAgriIncomeMax(val);
            }
          }
        }
      }
    }

    if (parsed['Solar Saving'] !== undefined) {
      setSolarSavingText(parsed['Solar Saving']);
      if (parsed['Monthly Energy Expense'] === undefined) {
         const solarMatch = parsed['Solar Saving'].match(/(\\d+)–(\\d+)\\s*units.*?₹?([\\d,]+)/i) || parsed['Solar Saving'].match(/(\\d+)\\s*units.*?₹?([\\d,]+)/i);
         if (solarMatch) {
            setPowerSource('Electricity');
            if (solarMatch.length === 4) {
              setMonthlyEnergyExpense(parseInt(solarMatch[2]) * parseInt(solarMatch[3].replace(/,/g, '')) * 30);
            } else if (solarMatch.length === 3) {
              setMonthlyEnergyExpense(parseInt(solarMatch[1]) * parseInt(solarMatch[2].replace(/,/g, '')) * 30);
            }
         }
      }
    }

    if (parsed['Projected Income'] !== undefined) setProjectedIncomeText(parsed['Projected Income']);
    if (parsed['Brief Business Profile'] !== undefined) setBriefBusinessProfile(parsed['Brief Business Profile']);
    if (parsed['Years in Business'] !== undefined) {
      setYearsInBusiness(parsed['Years in Business']);
      setBusinessAgeYears(parsed['Years in Business']);
    }
    if (parsed['Initial Investment'] !== undefined) setInitialInvestment(parsed['Initial Investment']);
    if (parsed['Has Agriculture Land'] !== undefined) setHasAgricultureLand(parsed['Has Agriculture Land']);
    if (parsed['Agri Land Area'] !== undefined) setAgriLandArea(parsed['Agri Land Area']);
    if (parsed['Agri Land Unit'] !== undefined) setAgriLandUnit(parsed['Agri Land Unit']);
    if (parsed['Agri Income Min'] !== undefined) setAgriIncomeMin(parsed['Agri Income Min']);
    if (parsed['Agri Income Max'] !== undefined) setAgriIncomeMax(parsed['Agri Income Max']);
    if (parsed['Has Other Income'] !== undefined) setHasOtherIncome(parsed['Has Other Income']);
    if (parsed['_otherIncomeSources'] !== undefined) setOtherIncomeSources(parsed['_otherIncomeSources']);
    if (parsed['Power Source'] !== undefined) setPowerSource(parsed['Power Source']);
    if (parsed['Monthly Energy Expense'] !== undefined) setMonthlyEnergyExpense(parsed['Monthly Energy Expense']);
  };

  const parseMarkdownToFields = (markdownText: string) => {
    const parsed = getParsedFieldsFromMarkdown(markdownText);
    if (parsed) applyParsedFields(parsed);
  };

  useEffect(() => {
    localStorage.setItem('lastActiveTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (activeAppId) {
      localStorage.setItem('lastActiveAppId', activeAppId);
    }
  }, [activeAppId]);

  // Real-time categories and products sync
  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        const [fetchedCategories, fetchedProducts] = await Promise.all([
          api.getCategories(),
          api.getProducts()
        ]);
        if (isMounted) {
          if (fetchedCategories?.length) setCategoriesList(fetchedCategories);
          if (fetchedProducts?.length) setAllProducts(fetchedProducts);
        }
      } catch (error) {
        console.error('Failed to sync catalog', error);
      }
    };
    
    // Initial fetch
    fetchCatalog();
    
    // Poll every 15 seconds for real-time updates
    const interval = setInterval(fetchCatalog, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Active Category Data
  const currentCategory = useMemo(() => {
    return categoriesList.find(c => c.id === selectedCategoryId) || categoriesList[0];
  }, [selectedCategoryId]);

  // Product Mapping State
  const [productsList, setProductsList] = useState<CategoryProduct[]>([{
       id: `custom-${Date.now()}`,
       categoryId: 'custom',
       productName: '',
       productCategory: 'Custom',
       revenueContributionPct: 0,
       price: '',
       quantity: '',
       total: 0
  } as any]);

  // Itemized Income and Expenditure Lines (Price x Quantity x Days Format)
  const [incomeLines, setIncomeLines] = useState<ItemizedCalculationLine[]>(() => {
    return getCategoryDefaultItemizedLines('kirana', 45, 220, 26).income;
  });

  const [expenseLines, setExpenseLines] = useState<ItemizedCalculationLine[]>(() => {
    return getCategoryDefaultItemizedLines('kirana', 45, 220, 26).expense;
  });

  // Calculated Itemized Sums
  const itemizedMonthlyIncomeTotal = useMemo(() => {
    return incomeLines.reduce((sum, line) => sum + (line.monthlyAmount || 0), 0);
  }, [incomeLines]);

  const itemizedMonthlyExpenseTotal = useMemo(() => {
    return expenseLines.reduce((sum, line) => sum + (line.monthlyAmount || 0), 0);
  }, [expenseLines]);



  // Handlers for Itemized Income
  const handleUpdateIncomeLine = (id: string, field: keyof ItemizedCalculationLine, value: any) => {
    setIncomeLines(prev => prev.map(line => {
      if (line.id === id) {
        const newLine = { ...line, [field]: value };
        if (['quantity', 'price', 'workingDays', 'unit'].includes(field as string)) {
          const q = newLine.quantity;
          const p = newLine.price;
          const w = newLine.workingDays;
          const u = newLine.unit;

          if (!q || !p || !w || !u) {
            newLine.businessNotes = '⚠️ Error: Missing inputs (Qty, Price, Days, or Unit)';
            newLine.monthlyAmount = 0;
          } else {
            newLine.monthlyAmount = Number(q) * Number(p) * Number(w);
            newLine.businessNotes = `${q} ${u} x ₹${p} x ${w} Days`;
          }
        }
        return newLine;
      }
      return line;
    }));
  };

  const handleAddIncomeLine = () => {
    const newId = `inc-custom-${Date.now()}`;
    setIncomeLines(prev => [...prev, { 
      id: newId,
      particulars: 'New Goods / Service Product Line',
      monthlyAmount: 3000
    }]);
  };

  const handleRemoveIncomeLine = (id: string) => {
    setIncomeLines(prev => prev.filter(line => line.id !== id));
  };

  // Handlers for Itemized Expenditure
  const handleUpdateExpenseLine = (id: string, field: keyof ItemizedCalculationLine, value: any) => {
    setExpenseLines(prev => prev.map(line => {
      if (line.id === id) {
        const newLine = { ...line, [field]: value };
        if (['quantity', 'price', 'workingDays', 'unit'].includes(field as string)) {
          const q = newLine.quantity;
          const p = newLine.price;
          const w = newLine.workingDays;
          const u = newLine.unit;

          if (!q || !p || !w || !u) {
            newLine.businessNotes = '⚠️ Error: Missing inputs (Qty, Price, Days, or Unit)';
            newLine.monthlyAmount = 0;
          } else {
            newLine.monthlyAmount = Number(q) * Number(p) * Number(w);
            newLine.businessNotes = `${q} ${u} x ₹${p} x ${w} Days`;
          }
        }
        return newLine;
      }
      return line;
    }));
  };

  const handleAddExpenseLine = () => {
    const newId = `exp-custom-${Date.now()}`;
    setExpenseLines(prev => [...prev, {
      id: newId,
      particulars: 'New Operational Cost Line',
      monthlyAmount: 2000
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
    const catProds = allProducts.filter(p => p.categoryId === catId);
    if (catProds.length > 0) {
      setProductsList(catProds);
    } else {
      const cat = categoriesList.find(c => c.id === catId);
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

    const defaultLines = getCategoryDefaultItemizedLines(catId, dailyFootfall, avgTicketValue, workingDays, categoriesList);
    setIncomeLines(defaultLines.income);
    setExpenseLines(defaultLines.expense);
    setIsCategoryModalOpen(false);
  };

  const handleAddNewCategory = async () => {
    if (!newCatName.trim()) return;
    const newCatId = `custom_${Date.now()}`;
    const newCat: BusinessCategory = {
      id: newCatId,
      name: newCatName.trim(),
      icon: '✨',
      description: 'Custom added business category',
      industryGroup: newCatIndustry,
      typicalMarginMin: newCatMarginMin,
      typicalMarginMax: newCatMarginMax,
      requiredDocs: [],
      validationRules: [],
      riskParameters: []
    };

    const finalProducts = newProducts.map((p, i) => ({
      ...p,
      id: `prod-${newCatId}-${i}`,
      categoryId: newCatId
    }));

    try {
      await api.saveCategory(newCat);
      for (const p of finalProducts) {
        await api.saveProduct(p);
      }
    } catch (err) {
      console.warn('Backend disconnected, saving to local session state only', err);
    }

    setCategoriesList(prev => [...prev, newCat]);
    setAllProducts(prev => [...prev, ...finalProducts]);
    
    // Switch to new category
    setSelectedCategoryId(newCatId);
    setProductsList(finalProducts);

    // Reset form
    setNewCatName('');
    setNewCatMarginMin(15);
    setNewCatMarginMax(40);
    setNewProducts([{ id: 'tmp-1', categoryId: '', productName: 'Core Assortment', productCategory: 'Main', revenueContributionPct: 100, inventoryType: 'FAST_MOVING', averageMarginPct: 20, businessImportance: 'HIGH' }]);
    setIsAddingCategory(false);
    setIsCategoryModalOpen(false);
  };

  // Form Fields - Applicant
  const [applicantName, setApplicantName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [residenceAddress, setResidenceAddress] = useState('');
  const [residenceOwnership, setResidenceOwnership] = useState<string>('');
  const [yearsAtResidence, setYearsAtResidence] = useState(0);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [businessRemark, setBusinessRemark] = useState('');
  const [dependentsCount, setDependentsCount] = useState(0);

  // NEW STATES FOR REDESIGN
  const [caseInitiationDate, setCaseInitiationDate] = useState(new Date().toISOString().split('T')[0]);
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [coApplicants, setCoApplicants] = useState<CoApplicant[]>([]);
  const [hasFemaleCandidate, setHasFemaleCandidate] = useState(false);
  const [femaleCandidateName, setFemaleCandidateName] = useState('');
  const [femaleCandidateRelation, setFemaleCandidateRelation] = useState('Spouse');
  const [femaleCandidateOtherRelation, setFemaleCandidateOtherRelation] = useState('');
  const [loanType, setLoanType] = useState('Commercial Solar Loan');
  const [otherLoanType, setOtherLoanType] = useState('');
  const [powerSource, setPowerSource] = useState('Electricity');
  const [otherPowerSource, setOtherPowerSource] = useState('');
  const [monthlyEnergyExpense, setMonthlyEnergyExpense] = useState<number | ''>('');
  const [solarPurposes, setSolarPurposes] = useState<string[]>([]);
  const [aataChakkiData, setAataChakkiData] = useState({
    machines: [] as string[],
    attaChakki: { size: '', capacity: '', wheatKg: '', charge: '' },
    kohlu: { boltDetails: '', mustardKg: '', charge: '', khaliKg: '', khaliRate: '' },
    dhanPolisher: { size: '', paddyKg: '', charge: '', bhusiKg: '', ricePolishKg: '', bhusiRate: '', ricePolishRate: '' },
    masalaMachine: { size: '', masalaKg: '', charge: '' },
    powerSource: 'Diesel',
    powerDetails: { consumption: '', rate: '' }
  });
  const [otherSolarPurpose, setOtherSolarPurpose] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [personsMet, setPersonsMet] = useState<string[]>([]);
  const [personsMetOtherName, setPersonsMetOtherName] = useState('');
  const [personsMetOtherRelation, setPersonsMetOtherRelation] = useState('');
  const [identityProof, setIdentityProof] = useState('Aadhaar Card');
  const [otherIdentityProof, setOtherIdentityProof] = useState('');
  const [executiveName, setExecutiveName] = useState(''); // Assuming logic handles current user
  const [solarPurposeGeneratedText, setSolarPurposeGeneratedText] = useState('');

  // NEW STATES FOR VERIFICATION TAB
  const [businessAgeYears, setBusinessAgeYears] = useState<number | ''>('');
  const [businessAgeApprox, setBusinessAgeApprox] = useState(false);
  const [previousOccupation, setPreviousOccupation] = useState('');
  const [previousOccupationOther, setPreviousOccupationOther] = useState('');
  const [reasonToLeave, setReasonToLeave] = useState('');
  const [externalStaffCount, setExternalStaffCount] = useState(0);
  const [businessManagedBy, setBusinessManagedBy] = useState<string[]>([]);
  const [businessManagedByOther, setBusinessManagedByOther] = useState('');
  const [premiseOwnership, setPremiseOwnership] = useState('');
  const [premiseOwnershipOther, setPremiseOwnershipOther] = useState('');
  const [businessAssets, setBusinessAssets] = useState<any[]>([]);
  const [hasStock, setHasStock] = useState(true);
  const [stockDetails, setStockDetails] = useState<any[]>([]);
  const [currentAssets, setCurrentAssets] = useState<string[]>([]);
  const [currentAssetsOther, setCurrentAssetsOther] = useState('');
  const [businessIncomeAssetCreation, setBusinessIncomeAssetCreation] = useState(false);
  const [createdAssets, setCreatedAssets] = useState<string[]>([]);
  const [createdAssetsOther, setCreatedAssetsOther] = useState('');
  const [otherHouseholdExpenses, setOtherHouseholdExpenses] = useState(false);
  const [otherHouseholdExpensesDesc, setOtherHouseholdExpensesDesc] = useState('');
  const [initialInvestment, setInitialInvestment] = useState<number | ''>('');
  const [investmentSource, setInvestmentSource] = useState('');
  const [investmentSourceOther, setInvestmentSourceOther] = useState('');
  const [hasAgricultureLand, setHasAgricultureLand] = useState(false);
  const [agriLandArea, setAgriLandArea] = useState<number | ''>('');
  const [agriLandUnit, setAgriLandUnit] = useState('Bigha');
  const [agriLandOwnership, setAgriLandOwnership] = useState('Self-owned');
  const [agriLandOwnershipOther, setAgriLandOwnershipOther] = useState('');
  const [agriCrops, setAgriCrops] = useState<string[]>([]);
  const [agriCropsOther, setAgriCropsOther] = useState('');
  const [agriIncomeMin, setAgriIncomeMin] = useState<number | ''>('');
  const [agriIncomeMax, setAgriIncomeMax] = useState<number | ''>('');
  const [agriOwnershipDoc, setAgriOwnershipDoc] = useState('Not Provided');
  const [hasOtherIncome, setHasOtherIncome] = useState(false);
  const [otherIncomeSources, setOtherIncomeSources] = useState<any[]>([]);
  const [expectedSolarCostReductionPct, setExpectedSolarCostReductionPct] = useState<number | ''>('');
  const [expectedSolarMonthlySaving, setExpectedSolarMonthlySaving] = useState<number | ''>('');
  const [meetingAddressSource, setMeetingAddressSource] = useState<'RESIDENCE' | 'BUSINESS' | 'OTHER'>('RESIDENCE');
  const [meetingAddress, setMeetingAddress] = useState('');
  const [locatingPremisesType, setLocatingPremisesType] = useState('');
  const [locatingPremisesTypeOther, setLocatingPremisesTypeOther] = useState('');
  const [propertyOwnership, setPropertyOwnership] = useState('');
  const [propertyOwnershipOther, setPropertyOwnershipOther] = useState('');
  const [propertyRentAmount, setPropertyRentAmount] = useState<number | ''>('');
  const [propertyOwnerName, setPropertyOwnerName] = useState('');
  const [propertyArea, setPropertyArea] = useState<number | ''>('');
  const [propertyValue, setPropertyValue] = useState<number | ''>('');
  const [propertyOwnershipDoc, setPropertyOwnershipDoc] = useState('Not Provided');
  const [houseFloors, setHouseFloors] = useState<number | ''>('');
  const [houseRooms, setHouseRooms] = useState<number | ''>('');
  const [houseStructureType, setHouseStructureType] = useState('');
  const [houseStructureTypeOther, setHouseStructureTypeOther] = useState('');
  const [houseFloorPosition, setHouseFloorPosition] = useState('');
  const [houseFloorPositionOther, setHouseFloorPositionOther] = useState('');
  const [houseAdditionalDetails, setHouseAdditionalDetails] = useState('');
  const [monthlyHouseholdExpensesAmount, setMonthlyHouseholdExpensesAmount] = useState<number | ''>('');
  const [hasElectricityConnection, setHasElectricityConnection] = useState('Not Provided');
  const [electricityConnectionType, setElectricityConnectionType] = useState('');
  const [electricityConnectionTypeOther, setElectricityConnectionTypeOther] = useState('');
  const [electricityConsumerNumber, setElectricityConsumerNumber] = useState('');
  const [electricityMonthlyExpense, setElectricityMonthlyExpense] = useState<number | ''>('');
  const [neighbors, setNeighbors] = useState<any[]>([]);
  const [neighborVerificationConducted, setNeighborVerificationConducted] = useState(false);
  const [neighborResidenceConfirmed, setNeighborResidenceConfirmed] = useState('');
  const [neighborBehaviourFeedback, setNeighborBehaviourFeedback] = useState('');
  const [neighborNegativeFeedback, setNeighborNegativeFeedback] = useState(false);
  const [neighborNegativeDetails, setNeighborNegativeDetails] = useState('');
  const [gpsLat, setGpsLat] = useState<number | ''>('');
  const [gpsLng, setGpsLng] = useState<number | ''>('');
  const [residenceStatus, setResidenceStatus] = useState('');
  const [residenceStatusReason, setResidenceStatusReason] = useState('');

  // NEW STATES FOR CUSTOMER & SUPPLIER DETAILS
  const [prominentCustomers, setProminentCustomers] = useState<any[]>([{ id: 'c1', name: '', phone: '', feedback: '' }]);
  const [prominentSuppliers, setProminentSuppliers] = useState<any[]>([{ id: 's1', name: '', phone: '', feedback: '' }]);
  const [bankingDetails, setBankingDetails] = useState<any[]>([{ id: 'b1', bankName: '', branchName: '', accountType: 'Saving Account', limit: 'NA', accountNo: '', remark: '' }]);
  const [existingLoans, setExistingLoans] = useState<any[]>([{ id: 'l1', typeOfLoan: 'NA', financerName: 'NA', amountInLakhs: '', emi: '', tenure: '', balanceTenure: '', remark: 'No any existing obligation' }]);
  const [currentObligation, setCurrentObligation] = useState('No any existing obligation');
  const [businessLongitudeVerified, setBusinessLongitudeVerified] = useState(false);
  const [businessLongitudeRemarks, setBusinessLongitudeRemarks] = useState('The location was checked using the provided coordinates; however, the GPS map was unable to navigate up to the exact point.');
  const [businessNeighbourName, setBusinessNeighbourName] = useState('');
  const [businessNeighbourFeedback, setBusinessNeighbourFeedback] = useState('Neighbour verification was conducted, wherein neighbours confirmed that the applicant has been engaged in his stated business for a considerable period, indicating business stability. The feedback received was positive regarding his work, and overall reputation in the locality.');
  const [businessStatus, setBusinessStatus] = useState('Recommended');
  const [hasAdditionalBusiness, setHasAdditionalBusiness] = useState(false);
  const [additionalBusinessAddress, setAdditionalBusinessAddress] = useState('');
  const [additionalBusinessIncomeAssessment, setAdditionalBusinessIncomeAssessment] = useState('');

  // Form Fields - Business
  const [firmName, setFirmName] = useState('');
  const [noFormalBusinessName, setNoFormalBusinessName] = useState(false);
  const [constitution, setConstitution] = useState('');
  const [yearsInBusiness, setYearsInBusiness] = useState(0);
  const [shopOwnership, setShopOwnership] = useState<string>('');
  const [monthlyRent, setMonthlyRent] = useState(0);
  const [shopAreaSqFt, setShopAreaSqFt] = useState(0);
  const [inventoryValue, setInventoryValue] = useState(0);

  // Form Fields - Field Investigation
  const [dailyFootfall, setDailyFootfall] = useState(0);
  const [avgTicketValue, setAvgTicketValue] = useState(0);
  const [workingDays, setWorkingDays] = useState(0);

  // Auto-calculate Stated Monthly Sales Turnover from Itemized Income
  useEffect(() => {
    if (itemizedMonthlyIncomeTotal > 0) {
      setStatedMonthlySales(itemizedMonthlyIncomeTotal);
    }
  }, [itemizedMonthlyIncomeTotal]);
  const [neighborName, setNeighborName] = useState('');
  const [neighborFeedback, setNeighborFeedback] = useState('');
  const [landlordFeedback, setLandlordFeedback] = useState('');
  const [exifGpsLat, setExifGpsLat] = useState('');
  const [exifGpsLng, setExifGpsLng] = useState('');

  // Form Fields - Loan Scheme & Facilities
  const [appliedAmount, setAppliedAmount] = useState(0);
  const [tenureMonths, setTenureMonths] = useState(0);
  const [interestRatePct, setInterestRatePct] = useState(0);

  // Form Fields - Financial Analysis & Waterfall Numbers
  const [statedMonthlySales, setStatedMonthlySales] = useState(0);
  const [cogsMarginPct, setCogsMarginPct] = useState(0); // COGS %
  const [salariesExpense, setSalariesExpense] = useState(0);
  const [utilitiesExpense, setUtilitiesExpense] = useState(0);
  const [transportExpense, setTransportExpense] = useState(0);
  const [miscExpense, setMiscExpense] = useState(0);
  const [otherIncome, setOtherIncome] = useState(0);
  const [householdExpenses, setHouseholdExpenses] = useState(0);
  const [existingEmis, setExistingEmis] = useState(0);
  const [existingEmiNotes, setExistingEmiNotes] = useState('');
  const [householdExpensesNotes, setHouseholdExpensesNotes] = useState('');
  const [comfortableEmiNotes, setComfortableEmiNotes] = useState('');
  const [solarPurposeUsage, setSolarPurposeUsage] = useState('');
  const [riskFactor, setRiskFactor] = useState('');

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
      applicantName: '',
      categoryId: 'kirana',
      product: selectedClient.defaultScheme,
      appliedAmount: 0,
      tenureMonths: 0,
      purpose: '',
      status: 'DRAFT',
      firmName: '',
      mobileNumber: '',
      panNumber: '',
      aadhaarNumber: '',
      residenceAddress: '',
      residenceOwnership: '',
      dependentsCount: 0,
      constitution: '',
      yearsInBusiness: 0,
      shopOwnership: '',
      monthlyRent: 0,
      shopAreaSqFt: 0,
      inventoryValue: 0,
      dailyFootfall: 0,
      avgTicketValue: 0,
      workingDays: 0,
      aataChakkiData: {
        machines: [],
        attaChakki: { size: '', capacity: '', wheatKg: '', charge: '' },
        kohlu: { boltDetails: '', mustardKg: '', charge: '', khaliKg: '', khaliRate: '' },
        dhanPolisher: { size: '', paddyKg: '', charge: '', bhusiKg: '', ricePolishKg: '', bhusiRate: '', ricePolishRate: '' },
        masalaMachine: { size: '', masalaKg: '', charge: '' },
        powerSource: 'Diesel',
        powerDetails: { consumption: '', rate: '' }
      },
      neighborFeedback: '',
      landlordFeedback: '',
      interestRatePct: 0,
      statedMonthlySales: 0,
      cogsMarginPct: 0,
      salariesExpense: 0,
      utilitiesExpense: 0,
      transportExpense: 0,
      miscExpense: 0,
      otherIncome: 0,
      householdExpenses: 0,
      existingEmis: 0,
      solarPurposeUsage: '',
      riskFactor: '',
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
  const handleLoadSampleApp = (dbApp: any) => {
    let app = dbApp;
    let isRecovered = false;
    
    // Attempt to recover offline draft if it exists
    try {
      const draftStr = localStorage.getItem(`offline_draft_${dbApp._id}`);
      if (draftStr) {
        const draftData = JSON.parse(draftStr);
        app = { ...dbApp, ...draftData }; // Merge draft over DB
        isRecovered = true;
      }
    } catch (e) {
      console.error('Failed to parse offline draft', e);
    }

    handleSelectCategory(app.categoryId);
    setApplicantName(app.applicantName || '');
    setMobileNumber(app.mobileNumber || '');
    setPanNumber(app.panNumber || '');
    setResidenceAddress(app.residenceAddress || '');
    setResidenceOwnership(app.residenceOwnership || 'OWN');
    setFamilyMembers(app.familyMembers || []);
    setBusinessRemark(app.businessRemark || '');
    setDependentsCount(app.dependentsCount || 0);
    setFirmName(app.firmName || '');
    setNoFormalBusinessName(app.firmName === 'No formal business name');
    setConstitution(app.constitution || 'Proprietorship');
    setYearsInBusiness(app.yearsInBusiness || 0);
    setBusinessAgeYears(app.businessAgeYears || '');
    setBusinessAgeApprox(app.businessAgeApprox || false);
    setPreviousOccupation(app.previousOccupation || '');
    setPreviousOccupationOther(app.previousOccupationOther || '');
    setReasonToLeave(app.reasonToLeave || '');
    setShopOwnership(app.shopOwnership || 'OWN');
    setMonthlyRent(app.monthlyRent || 0);
    setShopAreaSqFt(app.shopAreaSqFt || 0);
    setInventoryValue(app.inventoryValue || 0);
    setDailyFootfall(app.dailyFootfall || 0);
    setAvgTicketValue(app.avgTicketValue || 0);
    setWorkingDays(app.workingDays || 0);
    setNeighborFeedback(app.neighborFeedback || '');
    if (app.aataChakkiData) {
      setAataChakkiData(app.aataChakkiData);
    }
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

    const defaultLines = getCategoryDefaultItemizedLines(app.categoryId, app.dailyFootfall, app.avgTicketValue, app.workingDays, categoriesList);
    setIncomeLines(app.incomeLines || defaultLines.income);
    setExpenseLines(app.expenseLines || defaultLines.expense);

    setCaseInitiationDate(app.caseInitiationDate || new Date().toISOString().split('T')[0]);
    
    if (app.coApplicants && Array.isArray(app.coApplicants)) {
      setCoApplicants(app.coApplicants);
    } else if (app.hasCoApplicant) {
      // Migrate from old single co-applicant structure
      setCoApplicants([{
        name: app.coApplicantName || '',
        relation: app.coApplicantRelation || 'Spouse',
        otherRelation: app.coApplicantOtherRelation || '',
        mobileNumber: app.coApplicantMobileNumber || '',
        inBusiness: app.coApplicantInBusiness || false,
        businessRole: app.coApplicantBusinessRole || ''
      }]);
    } else {
      setCoApplicants([]);
    }

    setActiveAppNumber(app.applicationNumber);
    setActiveAppId(app._id);
    
    if (isRecovered) {
      setLoadedToastMessage(`Application #${app.applicationNumber} recovered from unsaved offline draft for ${app.applicantName}.`);
    } else {
      setLoadedToastMessage(`Application #${app.applicationNumber} loaded for ${app.applicantName} (${app.firmName}). All 5 sections updated.`);
    }

    setIsAppSearchOpen(false);
    setIsAppGalleryOpen(false);
    setAppSearchQuery('');

    setTimeout(() => {
      setLoadedToastMessage(null);
    }, 5000);
  };

  // Auto-Save Effect
  // Optimization: Auto-save using refs to avoid massive dependency array overhead on every render
  const updateDataRef = useRef<any>(null);
  const lastSavedStrRef = useRef<string>('');

  // Keep the ref updated with the latest state without triggering re-renders
  updateDataRef.current = {
        applicantName, mobileNumber, panNumber, residenceAddress, residenceOwnership, familyMembers,
        dependentsCount, firmName, constitution, yearsInBusiness, shopOwnership, monthlyRent, businessRemark,
        shopAreaSqFt, inventoryValue, dailyFootfall, avgTicketValue, workingDays, neighborFeedback,
        landlordFeedback, appliedAmount, tenureMonths, interestRatePct, statedMonthlySales, cogsMarginPct,
        salariesExpense, utilitiesExpense, transportExpense, miscExpense, otherIncome, householdExpenses, existingEmis,
        photos, incomeLines, expenseLines, productsList,
        caseInitiationDate, visitDate, reportDate, coApplicants,
        hasFemaleCandidate, femaleCandidateName, femaleCandidateRelation, femaleCandidateOtherRelation, loanType, otherLoanType,
        powerSource, otherPowerSource, monthlyEnergyExpense, solarPurposes, otherSolarPurpose, solarPurposeGeneratedText,
        businessAddress,
        personsMet, personsMetOtherName, personsMetOtherRelation, identityProof, otherIdentityProof, executiveName,
        businessAgeYears, businessAgeApprox, previousOccupation, previousOccupationOther, reasonToLeave, externalStaffCount, businessManagedBy, businessManagedByOther,
        premiseOwnership, premiseOwnershipOther, businessAssets, hasStock, stockDetails, currentAssets, currentAssetsOther,
        businessIncomeAssetCreation, createdAssets, createdAssetsOther, otherHouseholdExpenses, otherHouseholdExpensesDesc, initialInvestment,
        investmentSource, investmentSourceOther, hasAgricultureLand, agriLandArea, agriLandUnit, agriLandOwnership, agriLandOwnershipOther,
        agriCrops, agriCropsOther, agriIncomeMin, agriIncomeMax, agriOwnershipDoc, hasOtherIncome, otherIncomeSources,
        expectedSolarCostReductionPct, expectedSolarMonthlySaving, meetingAddressSource, meetingAddress,
        locatingPremisesType, locatingPremisesTypeOther, propertyOwnership, propertyOwnershipOther,
        propertyRentAmount, propertyOwnerName, propertyArea, propertyValue, propertyOwnershipDoc, houseFloors, houseRooms, houseStructureType,
        houseStructureTypeOther, houseFloorPosition, houseFloorPositionOther, houseAdditionalDetails, monthlyHouseholdExpensesAmount,
        hasElectricityConnection, electricityConnectionType, electricityConnectionTypeOther, electricityConsumerNumber, electricityMonthlyExpense,
        neighbors, neighborVerificationConducted, neighborResidenceConfirmed, neighborBehaviourFeedback, neighborNegativeFeedback,
        neighborNegativeDetails, gpsLat, gpsLng, residenceStatus, residenceStatusReason,
        aataChakkiData,
        prominentCustomers, prominentSuppliers, bankingDetails, existingLoans, currentObligation,
        businessLongitudeVerified, businessLongitudeRemarks, businessNeighbourName,
        businessNeighbourFeedback, businessStatus, categoryId: selectedCategoryId
  };

  useEffect(() => {
    if (!activeAppId || !selectedClient?.id) return;
    
    // Auto-save loop that checks for changes every 1.5 seconds independently of state re-renders
    const interval = setInterval(() => {
      if (!updateDataRef.current) return;
      
      const currentData = updateDataRef.current;
      const currentStr = JSON.stringify(currentData);
      
      // Save local draft as a fallback instantly
      localStorage.setItem(`offline_draft_${activeAppId}`, currentStr);
      
      if (lastSavedStrRef.current !== currentStr) {
        api.updateApplicant(selectedClient.id, activeAppId, currentData)
          .then(() => {
            lastSavedStrRef.current = currentStr;
            localStorage.removeItem(`offline_draft_${activeAppId}`); // clear on successful save
          })
          .catch(err => console.error('Failed to auto-save:', err));
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeAppId, selectedClient?.id]);

  const lastAataIncomeRef = useRef(0);
  const lastAataExpenseRef = useRef(0);

  // Auto-Calculation and Generation for Aata Chakki Business Profile
  useEffect(() => {
    if (!currentCategory?.name?.toLowerCase().includes('atta chakki') && !currentCategory?.name?.toLowerCase().includes('aata chakki')) return;

    let dailyTotalIncome = 0;
    const machinesInfo = [];
    const qaPairs = [];

    // Atta Chakki calculations
    if (aataChakkiData.machines.includes('Atta Chakki') && Number(aataChakkiData.attaChakki.wheatKg) > 0) {
      const charge = Number(aataChakkiData.attaChakki.charge) || 0;
      const wheatKg = Number(aataChakkiData.attaChakki.wheatKg) || 0;
      dailyTotalIncome += wheatKg * charge;
      machinesInfo.push(`${aataChakkiData.attaChakki.size || 'Standard'}-inch Atta Chakki (${wheatKg} kg wheat/day @ ₹${charge}/kg)`);
      qaPairs.push(`Q: What is the capacity and daily output of the Atta Chakki?\nA: The ${aataChakkiData.attaChakki.size || 'Standard'}-inch machine processes ${wheatKg} kg of wheat daily at a charge of ₹${charge}/kg.`);
    }

    // Kohlu calculations
    if (aataChakkiData.machines.includes('Kohlu') && Number(aataChakkiData.kohlu.mustardKg) > 0) {
      const mustardKg = Number(aataChakkiData.kohlu.mustardKg) || 0;
      const charge = Number(aataChakkiData.kohlu.charge) || 0;
      const khaliKg = Number(aataChakkiData.kohlu.khaliKg) || 0;
      const khaliRate = Number(aataChakkiData.kohlu.khaliRate) || 0;
      dailyTotalIncome += (mustardKg * charge) + (khaliKg * khaliRate);
      machinesInfo.push(`Kohlu - ${aataChakkiData.kohlu.boltDetails || 'Standard'} (${mustardKg} kg mustard/day @ ₹${charge}/kg)`);
      qaPairs.push(`Q: How much mustard is processed daily and what are the byproducts?\nA: Approximately ${mustardKg} kg of mustard is processed daily. The process yields ${khaliKg} kg of Khali, which is sold at ₹${khaliRate}/kg.`);
    }

    // Dhan Polisher calculations
    if (aataChakkiData.machines.includes('Dhan Polisher') && Number(aataChakkiData.dhanPolisher.paddyKg) > 0) {
      const paddyKg = Number(aataChakkiData.dhanPolisher.paddyKg) || 0;
      const charge = Number(aataChakkiData.dhanPolisher.charge) || 0;
      const bhusiKg = Number(aataChakkiData.dhanPolisher.bhusiKg) || 0;
      const bhusiRate = Number(aataChakkiData.dhanPolisher.bhusiRate) || 0;
      const ricePolishKg = Number(aataChakkiData.dhanPolisher.ricePolishKg) || 0;
      const ricePolishRate = Number(aataChakkiData.dhanPolisher.ricePolishRate) || 0;
      dailyTotalIncome += (paddyKg * charge) + (bhusiKg * bhusiRate) + (ricePolishKg * ricePolishRate);
      machinesInfo.push(`${aataChakkiData.dhanPolisher.size || 'Standard'}-inch Dhan Polisher (${paddyKg} kg paddy/day)`);
      qaPairs.push(`Q: What is the output of the Dhan Polisher?\nA: The machine processes ${paddyKg} kg of paddy daily. Byproducts include ${bhusiKg} kg of Bhusi (sold at ₹${bhusiRate}/kg) and ${ricePolishKg} kg of Rice Polish (sold at ₹${ricePolishRate}/kg).`);
    }

    // Masala Machine calculations
    if (aataChakkiData.machines.includes('Masala Grinding Machine') && Number(aataChakkiData.masalaMachine.masalaKg) > 0) {
      const masalaKg = Number(aataChakkiData.masalaMachine.masalaKg) || 0;
      const charge = Number(aataChakkiData.masalaMachine.charge) || 0;
      dailyTotalIncome += masalaKg * charge;
      machinesInfo.push(`${aataChakkiData.masalaMachine.size || 'Standard'} Masala Machine (${masalaKg} kg masala/day @ ₹${charge}/kg)`);
      qaPairs.push(`Q: What is the daily output for masala grinding?\nA: The machine grinds ${masalaKg} kg of masala daily, charging ₹${charge}/kg.`);
    }

    // Engine/Motor Info
    if (aataChakkiData.machines.includes('Engine')) {
      machinesInfo.push('Engine');
    }
    if (aataChakkiData.machines.includes('Motor')) {
      machinesInfo.push('Motor');
    }

    const monthlyIncome = dailyTotalIncome * workingDays;
    
    // Calculate Expenses (Power Source)
    let dailyExpense = 0;
    const consumption = Number(aataChakkiData.powerDetails.consumption) || 0;
    const rate = Number(aataChakkiData.powerDetails.rate) || 0;
    let engineInfo = 'standard power configuration';

    if (consumption > 0) {
      dailyExpense = consumption * rate;
      engineInfo = aataChakkiData.powerSource === 'Diesel' 
        ? `Diesel Engine consuming ${consumption} litres/day @ ₹${rate}/litre` 
        : `Electric Motor consuming ${consumption} units/day @ ₹${rate}/unit`;
      qaPairs.push(`Q: What is the power consumption and cost?\nA: The facility uses a ${aataChakkiData.powerSource} source, consuming ${consumption} ${aataChakkiData.powerSource === 'Diesel' ? 'litres' : 'units'} daily at a rate of ₹${rate} per ${aataChakkiData.powerSource === 'Diesel' ? 'litre' : 'unit'}.`);
    }

    const monthlyExpense = dailyExpense * workingDays;

    // Only update lines if there's actual income/expense data to avoid overriding default template immediately on load
    if (dailyTotalIncome > 0 && lastAataIncomeRef.current !== monthlyIncome) {
      lastAataIncomeRef.current = monthlyIncome;
      setIncomeLines(prev => {
        const hasAataLine = prev.find(l => l.particulars.includes('Aata Chakki Daily Collection') || l.particulars.includes('Aata Chakki / Milling Income') || l.particulars.includes('Milling Income'));
        if (hasAataLine) {
          return prev.map(l => (l.particulars.includes('Aata Chakki') || l.particulars.includes('Milling Income')) ? { ...l, monthlyAmount: monthlyIncome, particulars: 'Aata Chakki / Milling Income' } : l);
        }
        return [...prev, { id: 'auto-income-aata', particulars: 'Aata Chakki / Milling Income', monthlyAmount: monthlyIncome }];
      });
    }

    if (consumption > 0 && rate > 0 && lastAataExpenseRef.current !== monthlyExpense) {
      lastAataExpenseRef.current = monthlyExpense;
      setExpenseLines(prev => {
        const hasPowerLine = prev.find(l => l.particulars.includes('Fuel / Electricity') || l.particulars.includes('Power / Fuel Expense') || l.particulars.includes('Power Expense'));
        if (hasPowerLine) {
          return prev.map(l => (l.particulars.includes('Fuel / Electricity') || l.particulars.includes('Power') || l.particulars.includes('Expense')) ? { ...l, monthlyAmount: monthlyExpense, particulars: 'Power / Fuel Expense' } : l);
        }
        return [...prev, { id: 'auto-expense-power', particulars: 'Power / Fuel Expense', monthlyAmount: monthlyExpense }];
      });
    }

    // Auto-Generate Business Profile & Q&A if there is some data
    if (dailyTotalIncome > 0 || consumption > 0) {
      const profileText = `Background & Setup: The applicant, ${applicantName || 'Applicant'}, operates ${firmName || 'the business'}, a milling and processing unit established ${yearsInBusiness || 0} years ago. 

Machinery & Operations: The unit is equipped with ${machinesInfo.length > 0 ? machinesInfo.join(' + ') : 'essential processing machinery'}. It is powered by a ${engineInfo}.

Income Estimation: The facility generates a daily processing revenue of approximately ₹${dailyTotalIncome.toLocaleString('en-IN')} resulting in a robust monthly turnover of ₹${monthlyIncome.toLocaleString('en-IN')} across ${workingDays} working days. The business is conducted from a ${shopOwnership === 'OWN' ? 'self-owned' : 'rented'} premises covering ${shopAreaSqFt || 200} sq.ft, demonstrating steady community demand.

--- Q&A ---
${qaPairs.join('\n\n')}`;

      // Only set if different to prevent infinite loops or losing manual edits if unchanged
      setBusinessRemark(prev => {
        if (prev === profileText) return prev;
        return profileText;
      });
    }

  }, [aataChakkiData, currentCategory, workingDays, applicantName, firmName, yearsInBusiness, shopOwnership, shopAreaSqFt]);

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
  }, [dscrRatio, foirPct, yearsInBusiness, totalProductContribPct]);

  // Direct Print Official Company Standard PD Report
  const handleDirectPrintReport = () => {
    const finalBusinessAddress = businessAddress || 'Not provided';
    const finalResidenceAddress = residenceAddress || 'Not provided';
    const finalMeetingAddress = meetingAddress || 'Not provided';
    const formattedGps = gpsLat && gpsLng ? `${gpsLat}, ${gpsLng}` : `${exifGpsLat}, ${exifGpsLng}`;

    const fbBusinessVintage = `${businessAgeApprox ? 'Approximately ' : ''}${businessAgeYears ? `${String(businessAgeYears).padStart(2, '0')} years in business.` : ''}${(businessAgeYears !== '' && businessAgeYears < 10) ? `${previousOccupation ? ` Prior to this, engaged in ${previousOccupation === 'Other' ? previousOccupationOther : previousOccupation === 'Business' ? `business (${previousOccupationOther})` : previousOccupation === 'Salaried Employment' ? `salaried employment (${previousOccupationOther})` : previousOccupation.toLowerCase()}.` : ''}${reasonToLeave ? (reasonToLeave === 'Not informed' ? ' Reason for leaving the last occupation was not informed.' : (reasonToLeave.trim() ? ` Left the last occupation due to: ${reasonToLeave.trim()}.` : '')) : ''}` : ''}`.trim() || 'NIL';
    const fbStaffCount = `${externalStaffCount === 0 ? 'No external staff/labour is engaged. ' : `${externalStaffCount} external staff/labour engaged. `}${businessManagedBy.length > 0 ? `Business operations are managed by ${businessManagedBy.map(m => m === 'Other' ? businessManagedByOther : m).join(', ')}.` : ''}`.trim() || 'NIL';
    const fbPremiseOwnership = (premiseOwnership === 'Self-Owned' ? 'Business is being operated from self-owned premises.' : `Business is being operated from ${premiseOwnership.toLowerCase()} premises.`) || 'NIL';
    const fbFactoryInfra = businessAssets.length > 0 ? `The business setup comprises ${businessAssets.map(a => `${String(a.quantity || 0).padStart(2, '0')} ${a.name} (${a.size})`).join(', ')}.` : 'NIL';
    const fbStockDetails = stockDetails.length > 0 ? `The estimated value of observed stock (${stockDetails.map(s => s.name).join(', ')}) is approximately ₹${stockDetails.reduce((sum, s) => sum + (Number(s.value) || 0), 0)}.` : 'No significant stock maintained received from customers for processing.';
    const fbAssetAnalysis = `Fixed assets comprise ${businessAssets.length > 0 ? businessAssets.map(a => a.name).join(', ') : 'standard fixtures'}. Current assets include ${currentAssets.length > 0 ? currentAssets.join(', ') : 'working capital'}.`;
    const fbAssetCreation = `As informed by the applicant, the income generated from the business has been utilized for ${createdAssets.length > 0 ? createdAssets.map(a => a === 'Other' ? createdAssetsOther : a.toLowerCase()).join(', ') : 'asset creation'}${otherHouseholdExpenses ? ', along with meeting household expenses.' : '.'}`;
    const fbBusinessInvestment = `Started with an initial investment of approx ₹${initialInvestment || 1} Lakhs.`;
    const fbAgriIncome = `Applicant owns ${agriLandArea} ${agriLandUnit} agricultural land with yearly supplementary crop income of ₹${agriIncomeMin}-${agriIncomeMax} Lakhs.`;
    const fbSolarSaving = `As informed by the applicant, machinery is presently operated through ${powerSource.toLowerCase()} setup and approximate electricity expenses are around ₹${monthlyEnergyExpense || 0} per month. Applicant expects reduction in approx. ${expectedSolarCostReductionPct || 0}% operational cost after solar installation.`;

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
      caseInitiationDate,
      visitDate,
      reportDate,
      applicantName,
      applicantPhone: mobileNumber,
      coApplicants,
      femaleCandidateDetails: hasFemaleCandidate 
        ? `Yes, the female candidate is already included in the application as ${femaleCandidateName || 'NIL'}, ${femaleCandidateRelation === 'Other' ? (femaleCandidateOtherRelation || 'NIL') : femaleCandidateRelation.toLowerCase()} of the applicant.`
        : "NIL",
      firmName: firmName || 'NIL',
      loanAmount: appliedAmount || 0,
      loanType: loanType === 'Other' ? (otherLoanType || 'NIL') : loanType,
      loanPurpose: solarPurposeGeneratedText || 'NIL',
      residenceAddress: finalResidenceAddress,
      businessAddress: finalBusinessAddress,
      meetingAddress: finalMeetingAddress,
      locatingPremisesType: locatingPremisesType === 'Other' ? locatingPremisesTypeOther : locatingPremisesType,
      metPersonName: applicantName ? `${applicantName} (Self)` : 'NIL',
      metPersonIdProof: identityProof === 'Other' ? (otherIdentityProof || 'NIL') : (identityProof || 'NIL'),
      executiveName: executiveName || 'NIL',
      familyMembers: familyMembers,

      residenceOwnership: propertyOwnership === 'Owned' ? `Owned Premises - Area ${propertyArea || 'NIL'} sq.ft Approx` : (propertyOwnership === 'Rented' ? 'Rented Premises' : 'NIL'),
      houseDetails: (houseRooms || houseStructureType || houseFloorPosition) ? `This house has ${houseRooms || 'NIL'} rooms and is a ${houseStructureType || 'NIL'} structure, comprising a ${houseFloorPosition || 'NIL'} floor.` : 'NIL',
      monthlyHouseholdExpenses: monthlyHouseholdExpensesAmount || householdExpenses || 0,
      residenceGpsCoords: formattedGps,
      residenceStatus: residenceStatus || 'NIL',
      residenceNeighborName: neighbors.length > 0 && neighbors[0].name ? neighbors.map(n => n.name).join(', ') : 'NIL',
      residenceNeighborFeedback: neighborVerificationConducted ? `Neighbour verification was conducted, wherein neighbours ${neighborResidenceConfirmed === 'Confirmed' ? 'confirmed' : neighborResidenceConfirmed.toLowerCase()} that both the applicant and co-applicant have been residing at the given address. The feedback received was ${neighborBehaviourFeedback || 'NIL'} regarding their behaviour.` : 'NIL',

      briefBusinessProfile: briefBusinessProfile || 'NIL',
      businessVintage: businessVintageText || fbBusinessVintage,
      previousOccupation: previousOccupation === 'Other' ? (previousOccupationOther || 'NIL') : (previousOccupation || 'NIL'),
      reasonToLeave: reasonToLeave || 'NIL',
      staffCount: staffCountText || fbStaffCount,
      businessPremiseOwnership: premiseOwnershipText || fbPremiseOwnership,
      factoryInfrastructure: factoryInfrastructureText || fbFactoryInfra,
      stockDetailsValue: stockDetailsValueText || fbStockDetails,
      fixedAndCurrentAssetAnalysis: fixedAndCurrentAssetAnalysisText || fbAssetAnalysis,
      assetCreationThroughBusiness: assetCreationText || fbAssetCreation,
      initialBusinessInvestment: businessInvestmentText || fbBusinessInvestment,
      agriculturalIncomeDetails: agriculturalIncomeText || fbAgriIncome,
      otherSourceIncomeDetails: hasOtherIncome ? `Applicant has other income sources: ${otherIncomeSources.map(s => s.name).join(', ')}` : 'NIL',
      operationalSavingAnalysis: solarSavingText || fbSolarSaving,

      prominentCustomers: prominentCustomers.length > 0 && prominentCustomers[0].name ? prominentCustomers : [],
      prominentSuppliers: prominentSuppliers.length > 0 && prominentSuppliers[0].name ? prominentSuppliers : [],
      bankingDetails: bankingDetails.length > 0 && bankingDetails[0].bankName ? bankingDetails : [],
      existingLoans: existingLoans.length > 0 && existingLoans[0].typeOfLoan !== 'NA' ? existingLoans : [],
      currentObligationSummary: currentObligation || 'NIL',
      businessGpsCoords: formattedGps,
      businessLocationRemarks: businessLongitudeRemarks || 'NIL',
      businessElectricityDetails: hasElectricityConnection === 'Yes' ? `Electricity verified (Consumer No: ${electricityConsumerNumber || 'NIL'}), Monthly Bill: ₹${electricityMonthlyExpense || 0}` : 'NIL',
      businessNeighborName: businessNeighbourName || 'NIL',
      businessNeighborFeedback: businessNeighbourFeedback || neighborFeedback || 'NIL',
      businessStatus: businessStatus || 'NIL',

      itemizedSales: incomeLines.map(l => ({
        particulars: l.particulars,
        businessNotes: l.businessNotes || `Monthly Estimate`,
        monthly: l.monthlyAmount,
        yearly: l.monthlyAmount * 12,
      })),
      itemizedExpenses: [
        ...(cogsAmount > 0 ? [{ particulars: 'Purchases / COGS', businessNotes: 'Cost of Goods Sold', monthly: cogsAmount, yearly: cogsAmount * 12 }] : []),
        ...(salariesExpense > 0 ? [{ particulars: 'Salary & Labour Expenses', businessNotes: 'Staff wages', monthly: salariesExpense, yearly: salariesExpense * 12 }] : []),
        ...(rentEffective > 0 ? [{ particulars: 'Business Premises Rent', businessNotes: 'Shop rent expense', monthly: rentEffective, yearly: rentEffective * 12 }] : []),
        ...(utilitiesExpense > 0 ? [{ particulars: 'Monthly Electricity & Utilities', businessNotes: 'Utility charges', monthly: utilitiesExpense, yearly: utilitiesExpense * 12 }] : []),
        ...(transportExpense > 0 ? [{ particulars: 'Transport & Freight', businessNotes: 'Logistics costs', monthly: transportExpense, yearly: transportExpense * 12 }] : []),
        ...(miscExpense > 0 ? [{ particulars: 'Other Misc Expenses', businessNotes: 'Maintenance & miscellaneous', monthly: miscExpense, yearly: miscExpense * 12 }] : []),
        ...expenseLines.filter(l => l.monthlyAmount > 0).map(l => ({
          particulars: l.particulars || 'Other Expense',
          businessNotes: l.businessNotes || `Monthly Estimate`,
          monthly: l.monthlyAmount,
          yearly: l.monthlyAmount * 12,
        }))
      ],

      totalSalesMonthly: adoptedMonthlySales,
      totalSalesYearly: adoptedMonthlySales * 12,
      workingDays: workingDays,
      totalExpensesMonthly: totalOperatingExpenses + cogsAmount,
      totalExpensesYearly: (totalOperatingExpenses + cogsAmount) * 12,
      netProfitMonthly: netBusinessIncome,
      netProfitYearly: netBusinessIncome * 12,
      existingEmiMonthly: existingEmis,
      existingEmiYearly: existingEmis * 12,
      existingEmiNotes: existingEmiNotes,
      householdExpensesMonthly: householdExpenses,
      householdExpensesYearly: householdExpenses * 12,
      householdExpensesNotes: householdExpensesNotes,
      comfortableEmiNotes: comfortableEmiNotes,
      netDisposalIncomeMonthly: postLoanSurplus,
      netDisposalIncomeYearly: postLoanSurplus * 12,

      dscrRatio: dscrRatio,
      foirPct: foirPct,
      
      
      riskScore: riskAssessment.score,
      riskLevel: riskAssessment.decision,
      strengths: riskAssessment.strengths,
      flags: riskAssessment.flags,
      riskFactor: riskFactor,
      proposedEmi: proposedEmi,
      postLoanSurplus: postLoanSurplus,
      photos: photos.map(p => ({
        id: p.id || Math.random().toString(),
        name: p.caption || 'Field Photo',
        dataUrl: p.url,
        category: p.categoryTag || 'Field Proof',
        mimeType: 'image/jpeg',
        gps: { lat: p.gpsLat || 0, lng: p.gpsLng || 0 }
      })),
      aiExecutiveSummary: `<strong>Borrower & Vintage Profile:</strong> ${applicantName} operates <strong>${firmName}</strong> (${currentCategory.name}) with an established business vintage of <strong>${yearsInBusiness} years</strong>.<br/><br/><strong>Sales & Cash Flow Waterfall:</strong> The business generates an assessed monthly revenue of <strong>₹${adoptedMonthlySales.toLocaleString('en-IN')}</strong>. Gross profit margin is assessed at <strong>${grossMarginPct}% (₹${grossProfit.toLocaleString('en-IN')})</strong>. After total business operating expenses of <strong>₹${totalOperatingExpenses.toLocaleString('en-IN')}</strong> and household living costs of <strong>₹${householdExpenses.toLocaleString('en-IN')}</strong>, net monthly disposable surplus stands at <strong>₹${postLoanSurplus.toLocaleString('en-IN')}</strong>.<br/><br/><strong>Debt Service Capacity & Policy Compliance:</strong> The requested micro-lending facility of <strong>₹${appliedAmount.toLocaleString('en-IN')}</strong> at ${interestRatePct}% for ${tenureMonths} months requires a monthly EMI of <strong>₹${proposedEmi.toLocaleString('en-IN')}</strong>. The post-loan DSCR is calculated at <strong>${dscrRatio}x</strong> (policy threshold ≥ 1.25x) with FOIR at <strong>${foirPct}%</strong> (policy cap ≤ 60%), fully satisfying institutional credit guidelines.<br/><br/><strong>Community Verification:</strong> Local market and neighbor reference checks confirm positive reputation and stable operating history.`,
      parsedCreditReport: parsedCreditReport
    });
  };

  const handleWhatsAppExtraction = async () => {
    if (!rawWhatsappText.trim()) return;
    setIsExtractingWhatsapp(true);
    try {
      const response = await fetch('/api/extract-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawWhatsappText })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to extract');
      
      const payload = data.data;
      if (payload) {
        setPendingWhatsappPayload(payload);
      }
    } catch (err: any) {
      console.error(err);
      alert('Extraction failed: ' + err.message);
    } finally {
      setIsExtractingWhatsapp(false);
    }
  };

  const handleApproveWhatsAppExtraction = () => {
    const payload = pendingWhatsappPayload;
    if (!payload) return;
    
    if (payload.generatedMarkdownProfile) {
      parseMarkdownToFields(payload.generatedMarkdownProfile);
    }
    
    // Map payload to existing state variables safely
        if (payload.BorrowerAndLoanDetails) {
          const bld = payload.BorrowerAndLoanDetails;
          if (bld.applicantName) setApplicantName(bld.applicantName);
          if (bld.mobileNumber) setMobileNumber(bld.mobileNumber);
          if (bld.panNumber) setPanNumber(bld.panNumber);
          if (bld.residenceAddress) setResidenceAddress(bld.residenceAddress);
          if (bld.residenceOwnership) setResidenceOwnership(bld.residenceOwnership);
          if (bld.yearsAtResidence) setYearsAtResidence(Number(bld.yearsAtResidence));
          if (bld.dependentsCount) setDependentsCount(Number(bld.dependentsCount));
          if (bld.businessRemark) setBusinessRemark(bld.businessRemark);
          if (bld.caseInitiationDate) setCaseInitiationDate(bld.caseInitiationDate);
          if (bld.visitDate) setVisitDate(bld.visitDate);
          if (bld.reportDate) setReportDate(bld.reportDate);
          if (bld.loanType) setLoanType(bld.loanType);
          if (bld.otherLoanType) setOtherLoanType(bld.otherLoanType);
          if (bld.powerSource) setPowerSource(bld.powerSource);
          if (bld.otherPowerSource) setOtherPowerSource(bld.otherPowerSource);
          if (bld.monthlyEnergyExpense) setMonthlyEnergyExpense(Number(bld.monthlyEnergyExpense));
          if (bld.solarPurposes) setSolarPurposes(bld.solarPurposes);
          
          if (bld.residenceAddressDetails) {
             const r = bld.residenceAddressDetails;
             if (r.residenceAddress) setResidenceAddress(r.residenceAddress);
          }
          if (bld.businessAddressDetails) {
             const b = bld.businessAddressDetails;
             if (b.businessAddress) setBusinessAddress(b.businessAddress);
          }

          if (bld.personsMet) setPersonsMet(bld.personsMet);
        }

        if (payload.BusinessAndResidenceVerification) {
          const brv = payload.BusinessAndResidenceVerification;
          if (brv.businessAgeYears) setBusinessAgeYears(Number(brv.businessAgeYears));
          if (brv.previousOccupation) setPreviousOccupation(brv.previousOccupation);
          if (brv.reasonToLeave) setReasonToLeave(brv.reasonToLeave);
          if (brv.externalStaffCount) setExternalStaffCount(Number(brv.externalStaffCount));
          if (brv.businessManagedBy) setBusinessManagedBy(brv.businessManagedBy);
          if (brv.premiseOwnership) setPremiseOwnership(brv.premiseOwnership);
          if (brv.hasStock !== null) setHasStock(brv.hasStock);
          if (brv.initialInvestment) setInitialInvestment(Number(brv.initialInvestment));
          if (brv.monthlyHouseholdExpensesAmount) setMonthlyHouseholdExpensesAmount(Number(brv.monthlyHouseholdExpensesAmount));
        }
      
      setIsWhatsAppModalOpen(false);
      setRawWhatsappText('');
      setPendingWhatsappPayload(null);
      alert(`WhatsApp data mapped successfully! Confidence: ${payload._confidence_score || 'N/A'}`);
  };

  const renderTabNavigationFooter = () => {
    const TABS_LIST: Array<{ id: 'profile' | 'applicant' | 'verification' | 'customer_supplier' | 'field' | 'financials' | 'decision'; label: string }> = [
      { id: 'applicant', label: '1. Applicant & Household' },
      { id: 'verification', label: '2. Business & Residence Verification' },
      { id: 'profile', label: '3. Business Profile & Products' },
      { id: 'customer_supplier', label: '4. Customer & Supplier Details' },
      { id: 'field', label: '5. Field Verification' },
      { id: 'financials', label: '6. Financial Analysis' },
      { id: 'decision', label: '7. Risk Score & Summary' },
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

  const filteredCategoriesModal = categoriesList.filter(c => 
    c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
    c.description.toLowerCase().includes(categorySearch.toLowerCase()) ||
    c.industryGroup.toLowerCase().includes(categorySearch.toLowerCase())
  );
  const formProgress = useMemo(() => {
    const fields = [
      applicantName, mobileNumber, panNumber, residenceAddress, firmName, yearsInBusiness,
      shopOwnership, appliedAmount, personsMet.length > 0, executiveName, 
      briefBusinessProfile, previousOccupation, reasonToLeave, photos.length > 0
    ];
    let filled = 0;
    fields.forEach(f => {
      if (typeof f === 'string' && f.trim() !== '') filled++;
      else if (typeof f === 'number' && f > 0) filled++;
      else if (typeof f === 'boolean' && f) filled++;
    });
    return Math.round((filled / fields.length) * 100);
  }, [
    applicantName, mobileNumber, panNumber, residenceAddress, firmName, yearsInBusiness,
    shopOwnership, appliedAmount, personsMet, executiveName,
    briefBusinessProfile, previousOccupation, reasonToLeave, photos
  ]);

  return (
    <div className="space-y-6 font-sans text-[#2d3e50]">
      {/* Real-time Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between sticky top-4 z-40">
        <div className="font-bold text-sm text-[#2d3e50] flex items-center gap-2">
          <svg className="w-4 h-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><polyline points="12 6 12 12 16 14"></polyline></svg>
          Form Completion Progress
        </div>
        <div className="flex items-center gap-3 w-1/2">
          <div className="flex-grow bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${formProgress}%` }}></div>
          </div>
          <span className="text-xs font-bold text-slate-600 w-8 text-right">{formProgress}%</span>
        </div>
      </div>
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
              Switch Category ({categoriesList.length})
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

      {/* Credit Report Extraction UI - Global Level */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#eb8a23]" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Credit Report Extraction</h3>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Include CRIF/CIBIL data in the final report</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer text-slate-700">
                <input type="radio" value="NONE" checked={creditReportType === 'NONE'} onChange={() => setCreditReportType('NONE')} className="text-[#eb8a23] focus:ring-[#eb8a23]" /> 
                None
              </label>
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer text-slate-700">
                <input type="radio" value="CRIF" checked={creditReportType === 'CRIF'} onChange={() => setCreditReportType('CRIF')} className="text-[#eb8a23] focus:ring-[#eb8a23]" /> 
                CRIF
              </label>
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer text-slate-700">
                <input type="radio" value="CIBIL" checked={creditReportType === 'CIBIL'} onChange={() => setCreditReportType('CIBIL')} className="text-[#eb8a23] focus:ring-[#eb8a23]" /> 
                CIBIL
              </label>
            </div>
            
            {creditReportType !== 'NONE' && (
              <div className="flex items-center gap-3">
                <input 
                  type="file" 
                  multiple
                  accept=".pdf" 
                  onChange={(e) => {
                    if (e.target.files) {
                      setCreditReportFiles(Array.from(e.target.files));
                    }
                  }} 
                  className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" 
                />
                <button 
                  onClick={handleParseCreditReport} 
                  disabled={isParsingCreditReport || creditReportFiles.length === 0}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold disabled:opacity-50 transition shadow-sm"
                >
                  {isParsingCreditReport ? 'Extracting...' : 'Extract Data'}
                </button>
              </div>
            )}
            
            {parsedCreditReport && (
              <div className="w-full mt-4 bg-slate-50 border border-emerald-200 rounded-lg p-3">
                <div className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Successfully extracted {parsedCreditReport.reportProvider} Data
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px]">
                  <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
                    <span className="text-slate-500 uppercase font-bold block mb-0.5">Report Date</span>
                    <span className="font-semibold text-slate-800">{parsedCreditReport.reportDate || 'N/A'}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
                    <span className="text-slate-500 uppercase font-bold block mb-0.5">Credit Score</span>
                    <span className="font-semibold text-slate-800">{parsedCreditReport.creditScore || 'N/A'}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
                    <span className="text-slate-500 uppercase font-bold block mb-0.5">Total Accounts</span>
                    <span className="font-semibold text-slate-800">{parsedCreditReport.totalAccounts || '0'}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
                    <span className="text-slate-500 uppercase font-bold block mb-0.5">Active Accounts</span>
                    <span className="font-semibold text-slate-800">{parsedCreditReport.activeAccounts || '0'}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
                    <span className="text-slate-500 uppercase font-bold block mb-0.5">Current Balance</span>
                    <span className="font-semibold text-slate-800">₹{parsedCreditReport.totalCurrentBalance?.toLocaleString('en-IN') || '0'}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
                    <span className="text-slate-500 uppercase font-bold block mb-0.5">Overdue Amount</span>
                    <span className={`font-semibold ${parsedCreditReport.totalOverdueAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      ₹{parsedCreditReport.totalOverdueAmount?.toLocaleString('en-IN') || '0'}
                    </span>
                  </div>
                </div>
                {parsedCreditReport.flags && parsedCreditReport.flags.length > 0 && (
                  <div className="mt-2 bg-red-50 p-2 rounded border border-red-100 text-[10px]">
                    <span className="font-bold text-red-800 uppercase block mb-1">Risk Indicators</span>
                    <ul className="list-disc list-inside text-red-700 space-y-0.5">
                      {parsedCreditReport.flags.map((flag: string, i: number) => (
                        <li key={i}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {parsedCreditReport.accounts && parsedCreditReport.accounts.length > 0 && (
                  <div className="mt-4">
                    <AccountDetailsTable accounts={parsedCreditReport.accounts} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Module Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-xs flex flex-wrap gap-1">
        {[
          { id: 'applicant', label: '1. Applicant & Household', icon: User },
          { id: 'verification', label: '2. Business & Residence Verification', icon: Store },
          { id: 'profile', label: '3. Business Profile & Products', icon: Store },
          { id: 'customer_supplier', label: '4. Customer & Supplier Details', icon: Briefcase },
          { id: 'field', label: '5. Field Investigation & EXIF', icon: Camera },
          { id: 'financials', label: '6. Waterfall Cash Flow Engine', icon: Calculator },
          { id: 'decision', label: '7. Risk Score & Decision', icon: Shield },
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
                  <option value="">Select Constitution</option>
                  <option value="Proprietorship">Sole Proprietorship</option>
                  <option value="Partnership">Registered Partnership</option>
                  <option value="Pvt Ltd">Private Limited Company</option>
                  <option value="LLP">Limited Liability Partnership</option>
                </select>
              </div>



              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Premises Ownership</label>
                <select
                  value={shopOwnership}
                  onChange={(e) => setShopOwnership(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold"
                >
                  <option value="">Select Ownership</option>
                  <option value="RENTED">Rented Premises</option>
                  <option value="OWN">Self Owned Premises</option>
                  <option value="FAMILY">Family / Ancestral Owned</option>
                  <option value="RESIDENCE_CUM_BUSINESS">Residence cum Business</option>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Business Premises Value (₹)</label>
                <input
                  type="number"
                  value={inventoryValue}
                  onChange={(e) => setInventoryValue(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold"
                />
              </div>
              
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Remark</label>
                <textarea
                  value={businessRemark}
                  onChange={(e) => setBusinessRemark(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold"
                  placeholder="Enter business remarks..."
                />
              </div>
            </div>
          </div>

          {/* AATA CHAKKI DYNAMIC SETUP */}
          {(currentCategory.name.toLowerCase().includes('atta chakki') || currentCategory.name.toLowerCase().includes('aata chakki')) && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#eb8a23]" />
                Aata Chakki Setup & Details
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Select Available Machines</label>
                <div className="flex flex-wrap gap-4">
                  {['Atta Chakki', 'Kohlu', 'Dhan Polisher', 'Masala Grinding Machine', 'Engine', 'Motor'].map(machine => (
                    <label key={machine} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <input 
                        type="checkbox" 
                        checked={aataChakkiData.machines.includes(machine)}
                        onChange={(e) => {
                          const newMachines = e.target.checked 
                            ? [...aataChakkiData.machines, machine]
                            : aataChakkiData.machines.filter(m => m !== machine);
                          setAataChakkiData({ ...aataChakkiData, machines: newMachines });
                        }}
                        className="accent-[#eb8a23]" 
                      />
                      {machine}
                    </label>
                  ))}
                </div>
              </div>

              {aataChakkiData.machines.includes('Atta Chakki') && (
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-orange-800">Atta Chakki Specifics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Machine Size (Inches)</label>
                      <input type="number" value={aataChakkiData.attaChakki.size} onChange={e => setAataChakkiData({ ...aataChakkiData, attaChakki: { ...aataChakkiData.attaChakki, size: e.target.value } })} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Capacity (Per Hr)</label>
                      <input type="number" value={aataChakkiData.attaChakki.capacity} onChange={e => setAataChakkiData({ ...aataChakkiData, attaChakki: { ...aataChakkiData.attaChakki, capacity: e.target.value } })} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Daily Wheat (Kg)</label>
                      <input type="number" value={aataChakkiData.attaChakki.wheatKg} onChange={e => setAataChakkiData({ ...aataChakkiData, attaChakki: { ...aataChakkiData.attaChakki, wheatKg: e.target.value } })} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Grinding Charge (₹/Kg)</label>
                      <input type="number" value={aataChakkiData.attaChakki.charge} onChange={e => setAataChakkiData({ ...aataChakkiData, attaChakki: { ...aataChakkiData.attaChakki, charge: e.target.value } })} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </div>
                  </div>
                </div>
              )}

              {aataChakkiData.machines.includes('Kohlu') && (
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-orange-800">Kohlu Specifics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Bolt/Patti Details</label>
                      <input type="text" value={aataChakkiData.kohlu.boltDetails} onChange={e => setAataChakkiData({ ...aataChakkiData, kohlu: { ...aataChakkiData.kohlu, boltDetails: e.target.value } })} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Daily Mustard (Kg)</label>
                      <input type="number" value={aataChakkiData.kohlu.mustardKg} onChange={e => setAataChakkiData({ ...aataChakkiData, kohlu: { ...aataChakkiData.kohlu, mustardKg: e.target.value } })} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Processing Charge (₹)</label>
                      <input type="number" value={aataChakkiData.kohlu.charge} onChange={e => setAataChakkiData({ ...aataChakkiData, kohlu: { ...aataChakkiData.kohlu, charge: e.target.value } })} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Khali Qty (Kg)</label>
                      <input type="number" value={aataChakkiData.kohlu.khaliKg} onChange={e => setAataChakkiData({ ...aataChakkiData, kohlu: { ...aataChakkiData.kohlu, khaliKg: e.target.value } })} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Khali Selling Rate (₹)</label>
                      <input type="number" value={aataChakkiData.kohlu.khaliRate} onChange={e => setAataChakkiData({ ...aataChakkiData, kohlu: { ...aataChakkiData.kohlu, khaliRate: e.target.value } })} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </div>
                  </div>
                </div>
              )}

              {aataChakkiData.machines.includes('Dhan Polisher') && (
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-orange-800">Dhan Polisher Specifics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Machine Size</label>
                      <input type="number" value={aataChakkiData.dhanPolisher.size} onChange={e => setAataChakkiData({ ...aataChakkiData, dhanPolisher: { ...aataChakkiData.dhanPolisher, size: e.target.value } })} className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Paddy (Kg)</label>
                      <input type="number" value={aataChakkiData.dhanPolisher.paddyKg} onChange={e => setAataChakkiData({ ...aataChakkiData, dhanPolisher: { ...aataChakkiData.dhanPolisher, paddyKg: e.target.value } })} className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Charge (₹)</label>
                      <input type="number" value={aataChakkiData.dhanPolisher.charge} onChange={e => setAataChakkiData({ ...aataChakkiData, dhanPolisher: { ...aataChakkiData.dhanPolisher, charge: e.target.value } })} className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Bhusi (Kg)</label>
                      <input type="number" value={aataChakkiData.dhanPolisher.bhusiKg} onChange={e => setAataChakkiData({ ...aataChakkiData, dhanPolisher: { ...aataChakkiData.dhanPolisher, bhusiKg: e.target.value } })} className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Bhusi Rate (₹)</label>
                      <input type="number" value={aataChakkiData.dhanPolisher.bhusiRate} onChange={e => setAataChakkiData({ ...aataChakkiData, dhanPolisher: { ...aataChakkiData.dhanPolisher, bhusiRate: e.target.value } })} className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Rice Polish Qty (Kg)</label>
                      <input type="number" value={aataChakkiData.dhanPolisher.ricePolishKg} onChange={e => setAataChakkiData({ ...aataChakkiData, dhanPolisher: { ...aataChakkiData.dhanPolisher, ricePolishKg: e.target.value } })} className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Rice Polish Rate (₹)</label>
                      <input type="number" value={aataChakkiData.dhanPolisher.ricePolishRate} onChange={e => setAataChakkiData({ ...aataChakkiData, dhanPolisher: { ...aataChakkiData.dhanPolisher, ricePolishRate: e.target.value } })} className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </div>
                  </div>
                </div>
              )}

              {aataChakkiData.machines.includes('Masala Grinding Machine') && (
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-orange-800">Masala Grinding Specifics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Machine Size</label>
                      <input type="number" value={aataChakkiData.masalaMachine.size} onChange={e => setAataChakkiData({ ...aataChakkiData, masalaMachine: { ...aataChakkiData.masalaMachine, size: e.target.value } })} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Daily Masala (Kg)</label>
                      <input type="number" value={aataChakkiData.masalaMachine.masalaKg} onChange={e => setAataChakkiData({ ...aataChakkiData, masalaMachine: { ...aataChakkiData.masalaMachine, masalaKg: e.target.value } })} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Processing Charge (₹)</label>
                      <input type="number" value={aataChakkiData.masalaMachine.charge} onChange={e => setAataChakkiData({ ...aataChakkiData, masalaMachine: { ...aataChakkiData.masalaMachine, charge: e.target.value } })} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-slate-700">Power Source Configuration</h4>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <input type="radio" checked={aataChakkiData.powerSource === 'Diesel'} onChange={() => setAataChakkiData({ ...aataChakkiData, powerSource: 'Diesel' })} className="accent-[#eb8a23]" /> Diesel
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <input type="radio" checked={aataChakkiData.powerSource === 'Electricity'} onChange={() => setAataChakkiData({ ...aataChakkiData, powerSource: 'Electricity' })} className="accent-[#eb8a23]" /> Electricity
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Daily Consumption ({aataChakkiData.powerSource === 'Diesel' ? 'Litres' : 'Units'})</label>
                    <input type="number" value={aataChakkiData.powerDetails.consumption} onChange={e => setAataChakkiData({ ...aataChakkiData, powerDetails: { ...aataChakkiData.powerDetails, consumption: e.target.value } })} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Rate per {aataChakkiData.powerSource === 'Diesel' ? 'Litre' : 'Unit'} (₹)</label>
                    <input type="number" value={aataChakkiData.powerDetails.rate} onChange={e => setAataChakkiData({ ...aataChakkiData, powerDetails: { ...aataChakkiData.powerDetails, rate: e.target.value } })} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product Breakdown Matrix */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-[#eb8a23]" />
                  Product Mapping & Revenue Calculation
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Editable product items with price and quantity auto-calculating to total revenue.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3 w-8 text-center"></th>
                    <th className="p-3">Product / Service Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-center">Price (₹)</th>
                    <th className="p-3 text-center">Quantity</th>
                    <th className="p-3 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium bg-white">
                  {productsList.map((prod, idx) => {
                    const currentPrice = prod.price || 0;
                    const currentQty = prod.quantity || 0;
                    const calculatedTotal = currentPrice * currentQty;

                    return (
                      <tr key={prod.id || idx} className="hover:bg-slate-50/80">
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              const updated = productsList.filter((_, i) => i !== idx);
                              setProductsList(updated);
                            }}
                            className="text-red-400 hover:text-red-600 font-bold text-lg leading-none"
                            title="Remove Product"
                          >
                            ×
                          </button>
                        </td>
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
                        <td className="p-3 text-slate-600">
                          <input
                            type="text"
                            value={prod.productCategory}
                            onChange={(e) => {
                              const updated = [...productsList];
                              updated[idx].productCategory = e.target.value as any;
                              setProductsList(updated);
                            }}
                            className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-[#eb8a23] focus:outline-none py-1"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            value={currentPrice}
                            onChange={(e) => {
                              const updated = [...productsList];
                              updated[idx].price = Number(e.target.value);
                              updated[idx].total = updated[idx].price! * (updated[idx].quantity || 0);
                              setProductsList(updated);
                            }}
                            className="w-20 text-center border border-slate-300 rounded py-1 font-bold text-[#2d3e50]"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            value={currentQty}
                            onChange={(e) => {
                              const updated = [...productsList];
                              updated[idx].quantity = Number(e.target.value);
                              updated[idx].total = (updated[idx].price || 0) * updated[idx].quantity!;
                              setProductsList(updated);
                            }}
                            className="w-16 text-center border border-slate-300 rounded py-1 font-bold text-emerald-700"
                          />
                        </td>
                        <td className="p-3 text-right text-slate-800 font-bold text-[13px]">
                          ₹{calculatedTotal.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                  {productsList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400 italic font-medium">
                        No products added. Click "+ Add Product Row" to begin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-start">
                <button
                  onClick={() => {
                    setProductsList([...productsList, {
                      id: `custom-${Date.now()}`,
                      categoryId: selectedCategoryId,
                      productName: '',
                      productCategory: 'Custom',
                      revenueContributionPct: 0,
                      price: '' as any,
                      quantity: '' as any,
                      total: 0
                    }]);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-600 text-xs font-bold rounded hover:bg-slate-100 transition flex items-center gap-1 shadow-sm"
                >
                  <span className="text-lg leading-none">+</span> Add Product Row
                </button>
              </div>
            </div>
          </div>
          {renderTabNavigationFooter()}
        </div>
      )}

      {/* TAB 2: APPLICANT & HOUSEHOLD PROFILE */}
      {activeTab === 'applicant' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2 mb-6">
              <User className="w-4 h-4 text-[#eb8a23]" />
              Applicant & Household Details
            </h3>

            {/* 1. Case Initiation Date, 2. Visit Date & 3. Report Date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">1. Case Initiation Date</label>
                <input type="date" value={caseInitiationDate} onChange={(e) => setCaseInitiationDate(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">2. Visit Date</label>
                <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">3. Report Date</label>
                <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" />
              </div>
            </div>



            {/* 3. Name of Applicant & 4. Contact Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">3. Name of Applicant *</label>
                <input type="text" required value={applicantName} onChange={(e) => setApplicantName(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="e.g. Mr. Lalbabu Sahani" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">4. Contact Number</label>
                <input type="text" maxLength={10} pattern="\d{10}" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="10-digit mobile number" />
              </div>
            </div>

            {/* 5. Business Firm Name */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700">5. Business Firm Name</label>
                <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer">
                  <input type="checkbox" checked={noFormalBusinessName} onChange={(e) => {
                    setNoFormalBusinessName(e.target.checked);
                    if (e.target.checked) setFirmName('No formal business name');
                    else setFirmName('');
                  }} className="rounded text-[#eb8a23] focus:ring-[#eb8a23]" />
                  No formal business name
                </label>
              </div>
              <input type="text" value={firmName} onChange={(e) => setFirmName(e.target.value)} disabled={noFormalBusinessName} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold disabled:bg-slate-100 disabled:text-slate-500" placeholder="Business Name" />
            </div>

            {/* 6. Co-applicant Name with Relation & 7. Contact */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">6. Co-applicant Details</label>
                <button type="button" onClick={() => setCoApplicants([...coApplicants, { name: '', relation: 'Spouse', mobileNumber: '' }])} className="px-3 py-1.5 bg-[#2d3e50] text-white text-xs font-bold rounded-lg hover:bg-[#1e293b]">
                  + Add Co-applicant
                </button>
              </div>
              
              {coApplicants.length === 0 && (
                <div className="text-xs font-semibold text-slate-500 italic p-3 text-center border border-dashed border-slate-300 rounded-lg">No Co-applicants Added</div>
              )}
              
              {coApplicants.map((coApp, idx) => (
                <div key={idx} className="relative p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <button type="button" onClick={() => setCoApplicants(coApplicants.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs font-bold">
                    Remove
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Co-applicant Name</label>
                      <input type="text" value={coApp.name} onChange={(e) => {
                        const newCoApps = [...coApplicants];
                        newCoApps[idx].name = e.target.value;
                        setCoApplicants(newCoApps);
                      }} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Name" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Relationship</label>
                      <select value={coApp.relation} onChange={(e) => {
                        const newCoApps = [...coApplicants];
                        newCoApps[idx].relation = e.target.value;
                        if (e.target.value !== 'Other') newCoApps[idx].otherRelation = '';
                        setCoApplicants(newCoApps);
                      }} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold">
                        <option value="">Select Relationship ▼</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Son">Son</option>
                        <option value="Daughter">Daughter</option>
                        <option value="Brother">Brother</option>
                        <option value="Sister">Sister</option>
                        <option value="Business Partner">Business Partner</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    {coApp.relation === 'Other' && (
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Specify Relationship</label>
                        <input type="text" value={coApp.otherRelation || ''} onChange={(e) => {
                          const newCoApps = [...coApplicants];
                          newCoApps[idx].otherRelation = e.target.value;
                          setCoApplicants(newCoApps);
                        }} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Specify" />
                      </div>
                    )}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">7. Contact Number</label>
                      <input type="text" maxLength={10} value={coApp.mobileNumber || ''} onChange={(e) => {
                        const newCoApps = [...coApplicants];
                        newCoApps[idx].mobileNumber = e.target.value.replace(/\D/g, '');
                        setCoApplicants(newCoApps);
                      }} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="10-digit number" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 8. Female Candidate */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <label className="block text-xs font-bold text-slate-700">8. Female candidate is on loan / application</label>
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => setHasFemaleCandidate(true)} className={`px-4 py-1.5 text-xs font-bold rounded-lg border ${hasFemaleCandidate ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-white text-slate-600 border-slate-300'}`}>Yes</button>
                <button type="button" onClick={() => { setHasFemaleCandidate(false); setFemaleCandidateName(''); setFemaleCandidateRelation(''); }} className={`px-4 py-1.5 text-xs font-bold rounded-lg border ${!hasFemaleCandidate ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-white text-slate-600 border-slate-300'}`}>No</button>
              </div>

              {hasFemaleCandidate && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Female Candidate Name</label>
                    <input type="text" value={femaleCandidateName} onChange={(e) => setFemaleCandidateName(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Name" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Relationship with Applicant</label>
                    <select value={femaleCandidateRelation} onChange={(e) => setFemaleCandidateRelation(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold">
                      <option value="">Select ▼</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Mother">Mother</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Sister">Sister</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {femaleCandidateRelation === 'Other' && (
                    <div className="md:col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Specify Relationship</label>
                      <input type="text" value={femaleCandidateOtherRelation} onChange={(e) => setFemaleCandidateOtherRelation(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Specify" />
                    </div>
                  )}
                  <div className="md:col-span-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs font-semibold text-blue-800">
                    Generated: Yes, the female candidate is already included in the application as {femaleCandidateName || '[Name]'}, {femaleCandidateRelation === 'Other' ? femaleCandidateOtherRelation : femaleCandidateRelation.toLowerCase()} of the applicant.
                  </div>
                </div>
              )}

              {!hasFemaleCandidate && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs font-semibold text-blue-800">
                   Generated: We need to collect KYC documents and live photograph of the female candidate.
                </div>
              )}
            </div>

            {/* 9. Quotation Amount & 10. Type of Loan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">9. Quotation Amount</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2 text-slate-500 font-bold">₹</span>
                    <input 
                      type="number" 
                      value={appliedAmount ? appliedAmount / 1000 : ''} 
                      onChange={(e) => setAppliedAmount(Number(e.target.value) * 1000)} 
                      className="w-full pl-7 pr-7 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" 
                      placeholder="Amount in '000s" 
                      disabled={appliedAmount === null} 
                    />
                    <span className="absolute right-3 top-2 text-slate-400 font-bold text-[10px]">k</span>
                  </div>
                  <button type="button" onClick={() => setAppliedAmount(appliedAmount === null ? 0 : null)} className={`px-3 py-2 text-[10px] font-bold rounded-lg border ${appliedAmount === null ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-600 border-slate-300'}`}>Not Provided</button>
                </div>
                {appliedAmount > 0 && (
                  <div className="mt-1 text-[10px] font-bold text-[#eb8a23]">
                    {numberToWordsIndian(appliedAmount)}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">10. Type of Loan</label>
                <select value={loanType} onChange={(e) => setLoanType(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold">
                  <option value="Commercial Solar Loan">Commercial Solar Loan</option>
                  <option value="Residential Solar Loan">Residential Solar Loan</option>
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Home Loan">Home Loan</option>
                  <option value="Business Loan">Business Loan</option>
                  <option value="Vehicle Loan">Vehicle Loan</option>
                  <option value="Other">Other</option>
                </select>
                {loanType === 'Other' && (
                  <input type="text" value={otherLoanType} onChange={(e) => setOtherLoanType(e.target.value)} className="w-full mt-2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Specify Loan Type" />
                )}
              </div>
            </div>

            {/* 11. Solar Purpose & Usage */}
            {loanType === 'Commercial Solar Loan' && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-4">
                <label className="block text-xs font-bold text-orange-900">11. Solar Purpose & Usage Confirmation</label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-orange-700 mb-1">Current Power / Energy Source</label>
                    <select value={powerSource} onChange={(e) => setPowerSource(e.target.value)} className="w-full px-3 py-2 text-xs border border-orange-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold bg-white">
                      <option value="Electricity">Electricity</option>
                      <option value="Electricity Engine">Electricity Engine</option>
                      <option value="Diesel Generator">Diesel Generator</option>
                      <option value="Solar">Solar</option>
                      <option value="Grid Electricity">Grid Electricity</option>
                      <option value="Other">Other</option>
                    </select>
                    {powerSource === 'Other' && (
                       <input type="text" value={otherPowerSource} onChange={(e) => setOtherPowerSource(e.target.value)} className="w-full mt-2 px-3 py-2 text-xs border border-orange-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold bg-white" placeholder="Specify Power Source" />
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-orange-700 mb-1">Approximate Monthly Expense</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-500 font-bold">₹</span>
                      <input type="number" value={monthlyEnergyExpense} onChange={(e) => setMonthlyEnergyExpense(Number(e.target.value))} className="w-full pl-7 pr-3 py-2 text-xs border border-orange-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold bg-white" placeholder="Amount" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-orange-700 mb-2">Purpose of Solar Installation</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['Reduce operational cost', 'Reduce electricity expense', 'Improve savings', 'Replace current power source', 'Improve business efficiency', 'Backup power', 'Other'].map(purpose => (
                      <label key={purpose} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <input type="checkbox" checked={solarPurposes.includes(purpose)} onChange={(e) => {
                          if (e.target.checked) setSolarPurposes([...solarPurposes, purpose]);
                          else setSolarPurposes(solarPurposes.filter(p => p !== purpose));
                        }} className="accent-[#eb8a23]" />
                        {purpose}
                      </label>
                    ))}
                  </div>
                  {solarPurposes.includes('Other') && (
                     <input type="text" value={otherSolarPurpose} onChange={(e) => setOtherSolarPurpose(e.target.value)} className="w-full mt-3 px-3 py-2 text-xs border border-orange-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold bg-white" placeholder="Specify Purpose" />
                  )}
                </div>

                <div className="p-3 bg-white border border-orange-200 rounded-lg space-y-2">
                   <div className="flex justify-between items-center">
                     <span className="text-[10px] uppercase font-bold text-slate-500">Generated Statement</span>
                     <button type="button" onClick={() => {
                        const finalSource = powerSource === 'Other' ? otherPowerSource : powerSource;
                        const finalPurposes = solarPurposes.map(p => p === 'Other' ? otherSolarPurpose : p).filter(Boolean);
                        const purposeText = finalPurposes.length > 1 ? finalPurposes.slice(0, -1).join(', ') + ' and ' + finalPurposes.slice(-1) : finalPurposes[0] || '';
                        setSolarPurposeGeneratedText(`The applicant currently operates the business using ${finalSource.toLowerCase()}, which incurs an approximate monthly expense of ₹${monthlyEnergyExpense || 0}. Therefore, the applicant is planning to install a solar setup to ${purposeText.toLowerCase()}.`);
                     }} className="text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold hover:bg-orange-200">Auto-Generate</button>
                   </div>
                   <textarea value={solarPurposeGeneratedText} onChange={(e) => setSolarPurposeGeneratedText(e.target.value)} className="w-full text-xs font-semibold text-slate-700 border-none outline-none resize-none bg-transparent" rows={3} placeholder="Click Auto-Generate to preview..." />
                </div>
              </div>
            )}

            {/* 12. Address of Residence */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">12. Address of the Residence</label>
              <div className="grid grid-cols-1 gap-3">
                <textarea value={residenceAddress} onChange={(e) => setResidenceAddress(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Enter complete residence address" rows={2} />
              </div>
            </div>

            {/* 13. Address of Business */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-700">13. Address of the Business (Applicant)</label>
                <button type="button" onClick={() => {
                  setBusinessAddress(residenceAddress);
                }} className="text-[10px] bg-slate-100 text-slate-700 px-3 py-1.5 rounded font-bold hover:bg-slate-200 border border-slate-300">Same as Residence Address</button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <textarea value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Enter complete business address" rows={2} />
              </div>
            </div>

            {/* 14. Met Person During Visit Time */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700">14. Met Person During Visit</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['Applicant', 'Co-applicant', 'Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Other'].map(person => (
                  <label key={person} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <input type="checkbox" checked={personsMet.includes(person)} onChange={(e) => {
                      if (e.target.checked) setPersonsMet([...personsMet, person]);
                      else setPersonsMet(personsMet.filter(p => p !== person));
                    }} className="accent-[#eb8a23]" />
                    {person}
                  </label>
                ))}
              </div>
              {personsMet.includes('Other') && (
                <div className="flex gap-2">
                   <input type="text" value={personsMetOtherName} onChange={(e) => setPersonsMetOtherName(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Other Name" />
                   <input type="text" value={personsMetOtherRelation} onChange={(e) => setPersonsMetOtherRelation(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Other Relationship" />
                </div>
              )}
              
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
                 <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Generated View:</span>
                 {personsMet.map(p => {
                    if (p === 'Applicant') return `${applicantName || 'Applicant'} (Self)`;
                    if (p === 'Co-applicant') {
                       const c = coApplicants[0];
                       if (c) return `${c.name || 'Co-applicant'} (${c.relation === 'Other' ? c.otherRelation : c.relation})`;
                       return 'Co-applicant';
                    }
                    if (p === 'Other') return `${personsMetOtherName} (${personsMetOtherRelation})`;
                    return p;
                 }).join(' & ') || 'No one selected'}
              </div>
            </div>

            {/* 15. Met Person Identity Proof */}
            <div className="pt-4 border-t border-slate-100">
               <label className="block text-xs font-bold text-slate-700 mb-2">15. Met Person Identity Proof</label>
               <div className="flex flex-wrap gap-3">
                 {['Aadhaar Card', 'PAN Card', 'Voter ID', 'Driving Licence', 'Passport', 'Other'].map(proof => (
                    <label key={proof} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <input type="radio" name="identityProof" checked={identityProof === proof} onChange={() => setIdentityProof(proof)} className="accent-[#eb8a23]" />
                      {proof}
                    </label>
                 ))}
               </div>
               {identityProof === 'Other' && (
                  <input type="text" value={otherIdentityProof} onChange={(e) => setOtherIdentityProof(e.target.value)} className="w-full mt-3 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Specify Identity Proof" />
               )}
            </div>

            {/* 16. Spouse and Dependencies Details */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-slate-800">16. Spouse and Dependencies Details</h4>
                <button
                  type="button"
                  onClick={() => setFamilyMembers([...familyMembers, { id: Date.now().toString(), name: '', age: 0, profession: '', qualification: '', isDependent: false, relationship: '', education: '', occupation: '', isEarning: false, monthlyIncome: 0 }])}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#eb8a23] text-white text-xs font-bold rounded hover:bg-[#d17a1f]"
                >
                  <Plus className="w-3 h-3" /> Add Member
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                    <tr>
                      <th className="px-3 py-2 border-b border-slate-200">Name</th>
                      <th className="px-3 py-2 border-b border-slate-200">Relation</th>
                      <th className="px-3 py-2 border-b border-slate-200">Age</th>
                      <th className="px-3 py-2 border-b border-slate-200">Profession</th>
                      <th className="px-3 py-2 border-b border-slate-200">Qualification</th>
                      <th className="px-3 py-2 border-b border-slate-200 text-center">Dependent</th>
                      <th className="px-3 py-2 border-b border-slate-200 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {familyMembers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3 py-4 text-center text-slate-500 italic bg-slate-50">No family members added.</td>
                      </tr>
                    ) : (
                      familyMembers.map((member, idx) => (
                        <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-2 border-r border-slate-100">
                            <input type="text" value={member.name} onChange={(e) => { const newFm = [...familyMembers]; newFm[idx].name = e.target.value; setFamilyMembers(newFm); }} className="w-full bg-transparent border-none outline-none focus:ring-0 text-xs font-semibold" placeholder="Name" />
                          </td>
                          <td className="p-2 border-r border-slate-100">
                            <input type="text" value={member.relationship || ''} onChange={(e) => { const newFm = [...familyMembers]; newFm[idx].relationship = e.target.value; setFamilyMembers(newFm); }} className="w-full bg-transparent border-none outline-none focus:ring-0 text-xs font-semibold" placeholder="Relation" />
                          </td>
                          <td className="p-2 border-r border-slate-100">
                            <input type="number" value={member.age} onChange={(e) => { const newFm = [...familyMembers]; newFm[idx].age = Number(e.target.value); setFamilyMembers(newFm); }} className="w-full bg-transparent border-none outline-none focus:ring-0 text-xs font-semibold" />
                          </td>
                          <td className="p-2 border-r border-slate-100">
                            <select value={member.profession || ''} onChange={(e) => { const newFm = [...familyMembers]; newFm[idx].profession = e.target.value as any; setFamilyMembers(newFm); }} className="w-full bg-transparent border-none outline-none focus:ring-0 text-xs font-semibold">
                              <option value="">Select...</option>
                              <option value="Student">Student</option>
                              <option value="Working professional">Working professional</option>
                              <option value="Housewife">Housewife</option>
                            </select>
                          </td>
                          <td className="p-2 border-r border-slate-100">
                            <input type="text" value={member.qualification || ''} onChange={(e) => { const newFm = [...familyMembers]; newFm[idx].qualification = e.target.value; setFamilyMembers(newFm); }} className="w-full bg-transparent border-none outline-none focus:ring-0 text-xs font-semibold" placeholder="Qualification" />
                          </td>
                          <td className="p-2 border-r border-slate-100 text-center">
                            <select value={member.isDependent ? 'Yes' : 'No'} onChange={(e) => { const newFm = [...familyMembers]; newFm[idx].isDependent = e.target.value === 'Yes'; setFamilyMembers(newFm); }} className="bg-transparent border-none outline-none focus:ring-0 text-xs font-semibold">
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </td>
                          <td className="p-2 text-center">
                            <button onClick={() => { const newFm = [...familyMembers]; newFm.splice(idx, 1); setFamilyMembers(newFm); }} className="text-red-500 hover:text-red-700 p-1">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 17. Executive Name */}
            <div className="pt-6 border-t border-slate-200">
               <label className="block text-xs font-bold text-slate-700 mb-1">17. Executive Name</label>
               <input 
                 type="text" 
                 value={executiveName} 
                 onChange={(e) => setExecutiveName(e.target.value)} 
                 placeholder="Enter Executive Name..." 
                 className="w-full md:w-1/2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold bg-white" 
               />

            </div>

          </div>
          {renderTabNavigationFooter()}
        </div>
      )}


      {/* TAB 3: FIELD INVESTIGATION & EXIF PHOTOS */}
      {activeTab === 'verification' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2 mb-6">
              <Store className="w-4 h-4 text-[#eb8a23]" />
              Business & Residence Verification
            </h3>

            {/* 1. Vintage of Business */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <label className="block text-xs font-bold text-slate-700">1. Vintage of the Business</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                   <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Business Age (Years)</label>
                   <div className="flex gap-2 items-center">
                      <input type="number" min="0" value={businessAgeYears} onChange={(e) => { const v = Number(e.target.value); if (v >= 0) setBusinessAgeYears(v); }} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" disabled={businessAgeApprox} placeholder="Years" />
                      <label className="text-[10px] font-bold text-slate-600 flex items-center gap-1 whitespace-nowrap"><input type="checkbox" checked={businessAgeApprox} onChange={(e) => setBusinessAgeApprox(e.target.checked)} className="accent-[#eb8a23]" /> Approx</label>
                   </div>
                </div>
                {(businessAgeYears !== '' && businessAgeYears < 10) && (
                  <div>
                     <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Previous Occupation / Activity</label>
                     <select value={previousOccupation} onChange={(e) => setPreviousOccupation(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold bg-white">
                        <option value="">Select...</option>
                        <option value="Agriculture">Agriculture</option>
                        <option value="Salaried Employment">Salaried Employment</option>
                        <option value="Business">Business</option>
                        <option value="Self-employed">Self-employed</option>
                        <option value="Labour">Labour</option>
                        <option value="Student">Student</option>
                        <option value="Homemaker">Homemaker</option>
                        <option value="Other">Other</option>
                     </select>
                  </div>
                )}
                {(businessAgeYears !== '' && businessAgeYears < 10) && (
                  <div>
                     <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                       {previousOccupation === 'Business' ? 'What was it about?' : 
                        previousOccupation === 'Salaried Employment' ? 'Company and Position' : 
                        'Specify Previous Occupation'}
                     </label>
                     <input type="text" value={previousOccupationOther} onChange={(e) => setPreviousOccupationOther(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder={
                       previousOccupation === 'Business' ? 'Nature of business' : 
                       previousOccupation === 'Salaried Employment' ? 'e.g., Manager at XYZ Corp' : 
                       'Specify'
                     } />
                  </div>
                )}
                {(businessAgeYears !== '' && businessAgeYears < 10) && (
                  <div>
                     <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Reason to leave the last occupation</label>
                     <select 
                       value={reasonToLeave === 'Not informed' ? 'Not informed' : (reasonToLeave ? 'Informed' : '')} 
                       onChange={(e) => setReasonToLeave(e.target.value === 'Not informed' ? 'Not informed' : (e.target.value === 'Informed' ? ' ' : ''))} 
                       className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold bg-white"
                     >
                        <option value="">Select...</option>
                        <option value="Not informed">Not informed</option>
                        <option value="Informed">Informed</option>
                     </select>
                     {(reasonToLeave !== '' && reasonToLeave !== 'Not informed') && (
                       <input type="text" value={reasonToLeave.trim()} onChange={(e) => setReasonToLeave(e.target.value || ' ')} className="w-full mt-2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="e.g., Low Income, Better Opportunity" />
                     )}
                  </div>
                )}
                <div className="md:col-span-2 lg:col-span-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-blue-800">Generated Narrative (Editable)</span>
                    <button type="button" onClick={() => setBusinessVintageText('')} className="text-[9px] text-blue-600 hover:underline font-bold">Auto-Generate</button>
                  </div>
                  <textarea value={businessVintageText || `${businessAgeApprox ? 'Approximately ' : ''}${businessAgeYears ? `${String(businessAgeYears).padStart(2, '0')} years in business.` : ''}${(businessAgeYears !== '' && businessAgeYears < 10) ? `${previousOccupation ? ` Prior to this, engaged in ${previousOccupation === 'Other' ? previousOccupationOther : previousOccupation === 'Business' ? `business (${previousOccupationOther})` : previousOccupation === 'Salaried Employment' ? `salaried employment (${previousOccupationOther})` : previousOccupation.toLowerCase()}.` : ''}${reasonToLeave ? (reasonToLeave === 'Not informed' ? ' Reason for leaving the last occupation was not informed.' : (reasonToLeave.trim() ? ` Left the last occupation due to: ${reasonToLeave.trim()}.` : '')) : ''}` : ''}`.trim()} onChange={(e) => setBusinessVintageText(e.target.value)} className="w-full bg-transparent border-0 p-0 text-xs font-semibold text-blue-900 focus:ring-0 resize-none" rows={2} />
                </div>
              </div>
            </div>

            {/* 2. Number of Staffs */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <label className="block text-xs font-bold text-slate-700">2. Number of Staffs</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Number of External Staff / Labour</label>
                   <div className="flex gap-2">
                     <input type="number" value={externalStaffCount} onChange={(e) => setExternalStaffCount(Number(e.target.value))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" />
                     <button type="button" onClick={() => setExternalStaffCount(0)} className="px-3 py-1.5 text-[10px] bg-slate-200 text-slate-700 font-bold rounded hover:bg-slate-300 whitespace-nowrap">No External Staff</button>
                   </div>
                </div>
                <div>
                   <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Who manages the business?</label>
                   <div className="flex flex-wrap gap-2">
                      {['Applicant', 'Family Members', 'Co-applicant', 'Other'].map(opt => (
                        <label key={opt} className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                          <input type="checkbox" checked={businessManagedBy.includes(opt)} onChange={(e) => {
                            if (e.target.checked) setBusinessManagedBy([...businessManagedBy, opt]);
                            else setBusinessManagedBy(businessManagedBy.filter(m => m !== opt));
                          }} className="accent-[#eb8a23]" />
                          {opt}
                        </label>
                      ))}
                   </div>
                   {businessManagedBy.includes('Other') && (
                     <input type="text" value={businessManagedByOther} onChange={(e) => setBusinessManagedByOther(e.target.value)} className="w-full mt-2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Specify" />
                   )}
                </div>
                <div className="md:col-span-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-blue-800">Generated Narrative (Editable)</span>
                    <button type="button" onClick={() => setStaffCountText('')} className="text-[9px] text-blue-600 hover:underline font-bold">Auto-Generate</button>
                  </div>
                  <textarea value={staffCountText || `${externalStaffCount === 0 ? 'No external staff/labour is engaged. ' : `${externalStaffCount} external staff/labour engaged. `}${businessManagedBy.length > 0 ? `Business operations are managed by ${businessManagedBy.map(m => m === 'Other' ? businessManagedByOther : m).join(', ')}.` : ''}`} onChange={(e) => setStaffCountText(e.target.value)} className="w-full bg-transparent border-0 p-0 text-xs font-semibold text-blue-900 focus:ring-0 resize-none" rows={2} />
                </div>
              </div>
            </div>

            {/* 3. Is Office Premise Rented / Owned */}
            <div>
               <label className="block text-xs font-bold text-slate-700 mb-2">3. Is Office Premise Rented / Owned</label>
               <div className="flex flex-wrap gap-3">
                 {['Self-Owned', 'Rented', 'Leased', 'Residence cum business', 'Other'].map(opt => (
                    <label key={opt} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <input type="radio" checked={premiseOwnership === opt} onChange={() => setPremiseOwnership(opt)} className="accent-[#eb8a23]" />
                      {opt}
                    </label>
                 ))}
               </div>
               {premiseOwnership === 'Other' && (
                  <input type="text" value={premiseOwnershipOther} onChange={(e) => setPremiseOwnershipOther(e.target.value)} className="w-full md:w-1/2 mt-3 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Specify" />
               )}
               <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex flex-col gap-1">
                 <div className="flex justify-between items-center">
                   <span className="text-[10px] uppercase font-bold text-blue-800">Generated Narrative (Editable)</span>
                   <button type="button" onClick={() => setPremiseOwnershipText('')} className="text-[9px] text-blue-600 hover:underline font-bold">Auto-Generate</button>
                 </div>
                 <textarea value={premiseOwnershipText || (premiseOwnership === 'Self-Owned' ? 'Business is being operated from self-owned premises.' : `Business is being operated from ${premiseOwnership.toLowerCase()} premises.`)} onChange={(e) => setPremiseOwnershipText(e.target.value)} className="w-full bg-transparent border-0 p-0 text-xs font-semibold text-blue-900 focus:ring-0 resize-none" rows={2} />
               </div>
            </div>

            {/* 4. Details of Office / Factory Infrastructure */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-bold text-slate-700">4. Details of Office / Factory Infrastructure (Assets)</h4>
                <button
                  type="button"
                  onClick={() => setBusinessAssets([...businessAssets, { id: Date.now(), name: '', quantity: 1, size: '', condition: 'Operational', remarks: '' }])}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-[#2d3e50] border border-slate-300 text-[10px] font-bold rounded hover:bg-slate-200"
                >
                  <Plus className="w-3 h-3" /> Add Asset
                </button>
              </div>
              <div className="space-y-2">
                 {businessAssets.map((asset, idx) => (
                    <div key={asset.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 p-2 border border-slate-200 rounded-lg bg-slate-50 items-center">
                       <input type="text" value={asset.name} onChange={(e) => { const arr = [...businessAssets]; arr[idx].name = e.target.value; setBusinessAssets(arr); }} placeholder="Asset / Machine Name" className="col-span-2 px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                       <input type="number" value={asset.quantity} onChange={(e) => { const arr = [...businessAssets]; arr[idx].quantity = Number(e.target.value); setBusinessAssets(arr); }} placeholder="Qty" className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                       <input type="text" value={asset.size} onChange={(e) => { const arr = [...businessAssets]; arr[idx].size = e.target.value; setBusinessAssets(arr); }} placeholder="Size / Capacity" className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                       <select value={asset.condition} onChange={(e) => { const arr = [...businessAssets]; arr[idx].condition = e.target.value; setBusinessAssets(arr); }} className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]">
                          <option value="Operational">Operational</option>
                          <option value="Non-Operational">Non-Operational</option>
                          <option value="Needs Repair">Needs Repair</option>
                       </select>
                       <div className="flex items-center gap-1">
                          <input type="text" value={asset.remarks} onChange={(e) => { const arr = [...businessAssets]; arr[idx].remarks = e.target.value; setBusinessAssets(arr); }} placeholder="Remarks" className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                          <button onClick={() => { const arr = [...businessAssets]; arr.splice(idx, 1); setBusinessAssets(arr); }} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    </div>
                 ))}
                 {businessAssets.length === 0 && <div className="text-xs text-slate-500 italic p-2">No assets added.</div>}
                 {businessAssets.length > 0 && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-blue-800">Generated Narrative (Editable)</span>
                        <button type="button" onClick={() => setFactoryInfrastructureText('')} className="text-[9px] text-blue-600 hover:underline font-bold">Auto-Generate</button>
                      </div>
                      <textarea value={factoryInfrastructureText || `The business setup comprises ${businessAssets.map(a => `${String(a.quantity || 0).padStart(2, '0')} ${a.name} (${a.size})`).join(', ')}.`} onChange={(e) => setFactoryInfrastructureText(e.target.value)} className="w-full bg-transparent border-0 p-0 text-xs font-semibold text-blue-900 focus:ring-0 resize-none" rows={2} />
                    </div>
                 )}
              </div>
            </div>

            {/* 5. Stock Details */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-bold text-slate-700">5. Stock Details with Estimated Value</h4>
                <div className="flex items-center gap-3">
                   <label className="text-[10px] font-bold text-slate-500">Stock Available?</label>
                   <div className="flex gap-1">
                      <button type="button" onClick={() => setHasStock(true)} className={`px-3 py-1 text-[10px] font-bold rounded ${hasStock ? 'bg-[#eb8a23] text-white' : 'bg-slate-200 text-slate-600'}`}>Yes</button>
                      <button type="button" onClick={() => setHasStock(false)} className={`px-3 py-1 text-[10px] font-bold rounded ${!hasStock ? 'bg-[#eb8a23] text-white' : 'bg-slate-200 text-slate-600'}`}>No</button>
                   </div>
                   {hasStock && (
                     <button type="button" onClick={() => setStockDetails([...stockDetails, { id: Date.now(), name: '', quantity: 0, unit: 'kg', value: 0, remarks: '' }])} className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-[#2d3e50] border border-slate-300 text-[10px] font-bold rounded hover:bg-slate-200">
                       <Plus className="w-3 h-3" /> Add Stock
                     </button>
                   )}
                </div>
              </div>
              
              {!hasStock ? (
                 <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex flex-col gap-1">
                   <div className="flex justify-between items-center">
                     <span className="text-[10px] uppercase font-bold text-blue-800">Generated Narrative (Editable)</span>
                     <button type="button" onClick={() => setStockDetailsValueText('')} className="text-[9px] text-blue-600 hover:underline font-bold">Auto-Generate</button>
                   </div>
                   <textarea value={stockDetailsValueText || 'No significant stock maintained received from customers for processing.'} onChange={(e) => setStockDetailsValueText(e.target.value)} className="w-full bg-transparent border-0 p-0 text-xs font-semibold text-blue-900 focus:ring-0 resize-none" rows={2} />
                 </div>
              ) : (
                 <div className="space-y-2">
                    {stockDetails.map((stock, idx) => (
                       <div key={stock.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 p-2 border border-slate-200 rounded-lg bg-slate-50 items-center">
                          <input type="text" value={stock.name} onChange={(e) => { const arr = [...stockDetails]; arr[idx].name = e.target.value; setStockDetails(arr); }} placeholder="Stock Name" className="col-span-2 px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                          <input type="number" value={stock.quantity} onChange={(e) => { const arr = [...stockDetails]; arr[idx].quantity = Number(e.target.value); setStockDetails(arr); }} placeholder="Qty" className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                          <input type="text" value={stock.unit} onChange={(e) => { const arr = [...stockDetails]; arr[idx].unit = e.target.value; setStockDetails(arr); }} placeholder="Unit" className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                          <div className="relative">
                             <span className="absolute left-2 top-2 text-[10px] font-bold text-slate-500">₹</span>
                             <input type="number" value={stock.value} onChange={(e) => { const arr = [...stockDetails]; arr[idx].value = Number(e.target.value); setStockDetails(arr); }} placeholder="Value" className="w-full pl-5 pr-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                          </div>
                          <div className="flex items-center gap-1">
                             <input type="text" value={stock.remarks} onChange={(e) => { const arr = [...stockDetails]; arr[idx].remarks = e.target.value; setStockDetails(arr); }} placeholder="Remarks" className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                             <button onClick={() => { const arr = [...stockDetails]; arr.splice(idx, 1); setStockDetails(arr); }} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                          </div>
                       </div>
                    ))}
                    {stockDetails.length > 0 && (
                       <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex flex-col gap-1">
                         <div className="flex justify-between items-center">
                           <span className="text-[10px] uppercase font-bold text-blue-800">Generated Narrative (Editable)</span>
                           <button type="button" onClick={() => setStockDetailsValueText('')} className="text-[9px] text-blue-600 hover:underline font-bold">Auto-Generate</button>
                         </div>
                         <textarea value={stockDetailsValueText || `The estimated value of observed stock (${stockDetails.map(s => s.name).join(', ')}) is approximately ₹${stockDetails.reduce((sum, s) => sum + (Number(s.value) || 0), 0)}.`} onChange={(e) => setStockDetailsValueText(e.target.value)} className="w-full bg-transparent border-0 p-0 text-xs font-semibold text-blue-900 focus:ring-0 resize-none" rows={2} />
                       </div>
                    )}
                 </div>
              )}
            </div>

            {/* 6. Details and confirmation of business by neighbor */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
               <label className="block text-xs font-bold text-slate-700">6. Details and confirmation of business by neighbor</label>
               <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Neighbor Name</label>
                  <input type="text" value={businessNeighbourName} onChange={(e) => setBusinessNeighbourName(e.target.value)} className="w-full md:w-1/2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]" placeholder="e.g. Adjoining neighbors" />
               </div>
               <div>
                  <div className="flex items-center justify-between mb-1">
                     <label className="block text-[10px] uppercase font-bold text-slate-500">Feedback Remark</label>
                     <button type="button" onClick={() => setBusinessNeighbourFeedback("Neighbour verification was conducted, wherein neighbours confirmed that the applicant has been engaged in his stated business for a considerable period, indicating business stability. The feedback received was positive regarding his work, and overall reputation in the locality.")} className="text-[9px] text-[#eb8a23] hover:underline font-bold">Autofill Standard Positive Remark</button>
                  </div>
                  <textarea value={businessNeighbourFeedback} onChange={(e) => setBusinessNeighbourFeedback(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] text-blue-900 bg-blue-50 font-semibold" rows={3} />
               </div>
            </div>

            {/* 7. Fixed & Current Asset Analysis */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
               <label className="block text-xs font-bold text-slate-700">7. Fixed & Current Asset Analysis</label>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <h5 className="text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200 pb-1 mb-2">Fixed Assets (Auto-populated)</h5>
                     {businessAssets.length === 0 ? <span className="text-xs italic text-slate-400">None added in Infrastructure section</span> : (
                        <ul className="list-disc pl-4 text-xs font-semibold text-slate-700">
                           {businessAssets.map(a => <li key={a.id}>{a.name}</li>)}
                        </ul>
                     )}
                  </div>
                  <div>
                     <h5 className="text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200 pb-1 mb-2">Current Assets</h5>
                     <div className="flex flex-wrap gap-2">
                        {['Working Capital', 'Stock / Inventory', 'Raw Material', 'Finished Goods', 'Other'].map(asset => (
                           <label key={asset} className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                             <input type="checkbox" checked={currentAssets.includes(asset)} onChange={(e) => {
                               if (e.target.checked) setCurrentAssets([...currentAssets, asset]);
                               else setCurrentAssets(currentAssets.filter(a => a !== asset));
                             }} className="accent-[#eb8a23]" />
                             {asset}
                           </label>
                        ))}
                     </div>
                      {currentAssets.includes('Other') && (
                         <input type="text" value={currentAssetsOther} onChange={(e) => setCurrentAssetsOther(e.target.value)} className="w-full mt-2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]" placeholder="Specify Other Current Assets" />
                      )}
                   </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-blue-800">Generated Narrative (Editable)</span>
                    <button type="button" onClick={() => setFixedAndCurrentAssetAnalysisText('')} className="text-[9px] text-blue-600 hover:underline font-bold">Auto-Generate</button>
                  </div>
                  <textarea value={fixedAndCurrentAssetAnalysisText || `Fixed assets comprise ${businessAssets.length > 0 ? businessAssets.map(a => a.name).join(', ') : 'standard fixtures'}. Current assets include ${currentAssets.length > 0 ? currentAssets.join(', ') : 'working capital'}.`} onChange={(e) => setFixedAndCurrentAssetAnalysisText(e.target.value)} className="w-full bg-transparent border-0 p-0 text-xs font-semibold text-blue-900 focus:ring-0 resize-none" rows={2} />
                </div>
             </div>

            {/* 8. Asset Creation Through Business */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
               <label className="block text-xs font-bold text-slate-700">8. Asset Creation Through Business</label>
               <div className="flex items-center gap-4">
                 <span className="text-xs font-semibold text-slate-600">Has business income been used for asset creation?</span>
                 <button type="button" onClick={() => setBusinessIncomeAssetCreation(true)} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border ${businessIncomeAssetCreation ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-white text-slate-600 border-slate-300'}`}>Yes</button>
                 <button type="button" onClick={() => { setBusinessIncomeAssetCreation(false); setCreatedAssets([]); }} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border ${!businessIncomeAssetCreation ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-white text-slate-600 border-slate-300'}`}>No</button>
               </div>

               {businessIncomeAssetCreation && (
                  <div className="space-y-4 mt-2">
                     <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">What assets were created?</label>
                        <div className="flex flex-wrap gap-2">
                           {['Residential House', 'Land', 'Vehicle', 'Business Expansion', 'Machinery', 'Other'].map(asset => (
                              <label key={asset} className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                                 <input type="checkbox" checked={createdAssets.includes(asset)} onChange={(e) => {
                                    if (e.target.checked) setCreatedAssets([...createdAssets, asset]);
                                    else setCreatedAssets(createdAssets.filter(a => a !== asset));
                                 }} className="accent-[#eb8a23]" />
                                 {asset}
                              </label>
                           ))}
                        </div>
                        {createdAssets.includes('Other') && (
                           <input type="text" value={createdAssetsOther} onChange={(e) => setCreatedAssetsOther(e.target.value)} className="w-full mt-2 md:w-1/2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]" placeholder="Specify Created Assets" />
                        )}
                     </div>

                     <div className="flex items-center gap-4 pt-2 border-t border-slate-200">
                        <span className="text-xs font-semibold text-slate-600">Other Household / Personal Expenses?</span>
                        <button type="button" onClick={() => setOtherHouseholdExpenses(true)} className={`px-3 py-1 text-[10px] font-bold rounded border ${otherHouseholdExpenses ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-white text-slate-600 border-slate-300'}`}>Yes</button>
                        <button type="button" onClick={() => { setOtherHouseholdExpenses(false); setOtherHouseholdExpensesDesc(''); }} className={`px-3 py-1 text-[10px] font-bold rounded border ${!otherHouseholdExpenses ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-white text-slate-600 border-slate-300'}`}>No</button>
                     </div>
                     {otherHouseholdExpenses && (
                        <input type="text" value={otherHouseholdExpensesDesc} onChange={(e) => setOtherHouseholdExpensesDesc(e.target.value)} className="w-full md:w-1/2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]" placeholder="Optional description..." />
                     )}

                     <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex flex-col gap-1">
                       <div className="flex justify-between items-center">
                         <span className="text-[10px] uppercase font-bold text-blue-800">Generated Narrative (Editable)</span>
                         <button type="button" onClick={() => setAssetCreationText('')} className="text-[9px] text-blue-600 hover:underline font-bold">Auto-Generate</button>
                       </div>
                       <textarea value={assetCreationText || `As informed by the applicant, the income generated from the business has been utilized for ${createdAssets.length > 0 ? createdAssets.map(a => a === 'Other' ? createdAssetsOther : a.toLowerCase()).join(', ') : 'asset creation'}${otherHouseholdExpenses ? ', along with meeting household expenses.' : '.'}`} onChange={(e) => setAssetCreationText(e.target.value)} className="w-full bg-transparent border-0 p-0 text-xs font-semibold text-blue-900 focus:ring-0 resize-none" rows={2} />
                     </div>
                  </div>
               )}
            </div>

            {/* 9. Business Investment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">9. Business Investment (Initial)</label>
                  <div className="relative">
                     <span className="absolute left-3 top-2 text-[10px] font-bold text-slate-500">₹</span>
                     <input type="number" value={initialInvestment} onChange={(e) => setInitialInvestment(Number(e.target.value))} className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Amount" />
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Investment Source</label>
                  <select value={investmentSource} onChange={(e) => setInvestmentSource(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold bg-white">
                     <option value="">Select...</option>
                     <option value="Own Funds">Own Funds</option>
                     <option value="Loan">Loan</option>
                     <option value="Family Funds">Family Funds</option>
                     <option value="Combination">Combination</option>
                     <option value="Other">Other</option>
                  </select>
                  {investmentSource === 'Other' && (
                     <input type="text" value={investmentSourceOther} onChange={(e) => setInvestmentSourceOther(e.target.value)} className="w-full mt-2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]" placeholder="Specify Source" />
                  )}
               </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-blue-800">Generated Narrative (Editable)</span>
                <button type="button" onClick={() => setBusinessInvestmentText('')} className="text-[9px] text-blue-600 hover:underline font-bold">Auto-Generate</button>
              </div>
              <textarea value={businessInvestmentText || `Started with an initial investment of approx ₹${initialInvestment || 1} Lakhs.`} onChange={(e) => setBusinessInvestmentText(e.target.value)} className="w-full bg-transparent border-0 p-0 text-xs font-semibold text-blue-900 focus:ring-0 resize-none" rows={2} />
            </div>

            {/* 10. Agricultural Income Details */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
               <label className="block text-xs font-bold text-slate-700">10. Agricultural Income Details</label>
               <div className="flex items-center gap-4">
                 <span className="text-xs font-semibold text-slate-600">Agricultural Land?</span>
                 <button type="button" onClick={() => setHasAgricultureLand(true)} className={`px-4 py-1.5 text-[10px] font-bold rounded-lg border ${hasAgricultureLand ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-white text-slate-600 border-slate-300'}`}>Yes</button>
                 <button type="button" onClick={() => setHasAgricultureLand(false)} className={`px-4 py-1.5 text-[10px] font-bold rounded-lg border ${!hasAgricultureLand ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-white text-slate-600 border-slate-300'}`}>No</button>
               </div>

               {hasAgricultureLand && (
                  <div className="space-y-4 mt-3 border-t border-slate-200 pt-4">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                           <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Land Area & Unit</label>
                           <div className="flex gap-2">
                              <input type="number" value={agriLandArea} onChange={(e) => setAgriLandArea(Number(e.target.value))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Area" />
                              <select value={agriLandUnit} onChange={(e) => setAgriLandUnit(e.target.value)} className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23] bg-white">
                                 <option value="Bigha">Bigha</option>
                                 <option value="Acre">Acre</option>
                                 <option value="Hectare">Hectare</option>
                                 <option value="Other">Other</option>
                              </select>
                           </div>
                        </div>
                        <div>
                           <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Ownership</label>
                           <select value={agriLandOwnership} onChange={(e) => setAgriLandOwnership(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23] bg-white">
                              <option value="Self-owned">Self-owned</option>
                              <option value="Family-owned">Family-owned</option>
                              <option value="Leased">Leased</option>
                              <option value="Other">Other</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Document Available?</label>
                           <select value={agriOwnershipDoc} onChange={(e) => setAgriOwnershipDoc(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23] bg-white">
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                              <option value="Not Provided">Not Provided</option>
                           </select>
                        </div>
                     </div>
                     <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2">Crops</label>
                        <div className="flex flex-wrap gap-2">
                           {['Wheat', 'Sugarcane', 'Rice', 'Mustard', 'Vegetables', 'Other'].map(crop => (
                              <label key={crop} className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                                 <input type="checkbox" checked={agriCrops.includes(crop)} onChange={(e) => {
                                    if (e.target.checked) setAgriCrops([...agriCrops, crop]);
                                    else setAgriCrops(agriCrops.filter(c => c !== crop));
                                 }} className="accent-[#eb8a23]" />
                                 {crop}
                              </label>
                           ))}
                        </div>
                        {agriCrops.includes('Other') && (
                           <input type="text" value={agriCropsOther} onChange={(e) => setAgriCropsOther(e.target.value)} className="w-full mt-2 md:w-1/2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]" placeholder="Specify Crops" />
                        )}
                     </div>
                     <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Approximate Annual Agricultural Income</label>
                        <div className="flex items-center gap-2 max-w-md">
                           <div className="relative flex-1">
                              <span className="absolute left-2 top-2 text-[10px] font-bold text-slate-500">₹</span>
                              <input type="number" value={agriIncomeMin} onChange={(e) => setAgriIncomeMin(Number(e.target.value))} className="w-full pl-5 pr-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Min" />
                           </div>
                           <span className="text-xs font-bold text-slate-400">to</span>
                           <div className="relative flex-1">
                              <span className="absolute left-2 top-2 text-[10px] font-bold text-slate-500">₹</span>
                              <input type="number" value={agriIncomeMax} onChange={(e) => setAgriIncomeMax(Number(e.target.value))} className="w-full pl-5 pr-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Max" />
                           </div>
                        </div>
                     </div>
                  </div>
               )}
               {hasAgricultureLand && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-blue-800">Generated Narrative (Editable)</span>
                      <button type="button" onClick={() => setAgriculturalIncomeText('')} className="text-[9px] text-blue-600 hover:underline font-bold">Auto-Generate</button>
                    </div>
                    <textarea value={agriculturalIncomeText || `Applicant owns ${agriLandArea} ${agriLandUnit} agricultural land with yearly supplementary crop income of ₹${agriIncomeMin}-${agriIncomeMax} Lakhs.`} onChange={(e) => setAgriculturalIncomeText(e.target.value)} className="w-full bg-transparent border-0 p-0 text-xs font-semibold text-blue-900 focus:ring-0 resize-none" rows={2} />
                  </div>
               )}
            </div>

            {/* 10. Other Source Income */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
               <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-700">10. Other source income</label>
                  <div className="flex items-center gap-2">
                     <button type="button" onClick={() => setHasOtherIncome(true)} className={`px-3 py-1 text-[10px] font-bold rounded ${hasOtherIncome ? 'bg-[#eb8a23] text-white' : 'bg-slate-200 text-slate-600'}`}>Yes</button>
                     <button type="button" onClick={() => setHasOtherIncome(false)} className={`px-3 py-1 text-[10px] font-bold rounded ${!hasOtherIncome ? 'bg-[#eb8a23] text-white' : 'bg-slate-200 text-slate-600'}`}>No</button>
                  </div>
               </div>
               
               {!hasOtherIncome ? (
                  <div className="text-xs font-semibold text-slate-500 italic">No other source of income reported.</div>
               ) : (
                  <div className="space-y-3 pt-3 border-t border-slate-200">
                     <button type="button" onClick={() => setOtherIncomeSources([...otherIncomeSources, { id: Date.now(), source: 'Salary', frequency: 'Monthly', amount: 0, remarks: '' }])} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-[#2d3e50] border border-slate-300 text-[10px] font-bold rounded hover:bg-slate-200">
                        <Plus className="w-3 h-3" /> Add Income Source
                     </button>
                     {otherIncomeSources.map((inc, idx) => (
                        <div key={inc.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-2 border border-slate-200 rounded-lg bg-white items-center">
                           <select value={inc.source} onChange={(e) => { const arr = [...otherIncomeSources]; arr[idx].source = e.target.value; setOtherIncomeSources(arr); }} className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]">
                              <option value="Salary">Salary</option>
                              <option value="Rent">Rent</option>
                              <option value="Agriculture">Agriculture</option>
                              <option value="Pension">Pension</option>
                              <option value="Business">Business</option>
                              <option value="Investment">Investment</option>
                              <option value="Other">Other</option>
                           </select>
                           <select value={inc.frequency} onChange={(e) => { const arr = [...otherIncomeSources]; arr[idx].frequency = e.target.value; setOtherIncomeSources(arr); }} className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]">
                              <option value="Monthly">Monthly</option>
                              <option value="Annual">Annual</option>
                           </select>
                           <div className="relative">
                              <span className="absolute left-2 top-2 text-[10px] font-bold text-slate-500">₹</span>
                              <input type="number" value={inc.amount} onChange={(e) => { const arr = [...otherIncomeSources]; arr[idx].amount = Number(e.target.value); setOtherIncomeSources(arr); }} placeholder="Amount" className="w-full pl-5 pr-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                           </div>
                           <div className="flex items-center gap-1 col-span-2">
                              <input type="text" value={inc.remarks} onChange={(e) => { const arr = [...otherIncomeSources]; arr[idx].remarks = e.target.value; setOtherIncomeSources(arr); }} placeholder="Remarks" className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                              <button onClick={() => { const arr = [...otherIncomeSources]; arr.splice(idx, 1); setOtherIncomeSources(arr); }} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>

            {/* 11. Solar Saving Analysis */}
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-4">
               <label className="block text-xs font-bold text-orange-900">11. Solar Saving Analysis</label>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-[10px] uppercase font-bold text-orange-700 mb-1">Expected Reduction in Operational Cost</label>
                     <div className="relative">
                        <input type="number" value={expectedSolarCostReductionPct} onChange={(e) => setExpectedSolarCostReductionPct(Number(e.target.value))} className="w-full pr-7 pl-3 py-2 text-xs border border-orange-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold bg-white" placeholder="Percentage" />
                        <span className="absolute right-3 top-2 text-slate-500 font-bold">%</span>
                     </div>
                  </div>
                  <div>
                     <label className="block text-[10px] uppercase font-bold text-orange-700 mb-1">Expected Monthly Saving</label>
                     <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-500 font-bold">₹</span>
                        <input type="number" value={expectedSolarMonthlySaving} onChange={(e) => setExpectedSolarMonthlySaving(Number(e.target.value))} className="w-full pl-7 pr-3 py-2 text-xs border border-orange-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold bg-white" placeholder="Amount" />
                     </div>
                  </div>
                  <div className="md:col-span-2 p-3 bg-white border border-orange-200 rounded-lg flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-orange-800">Generated Narrative (Editable)</span>
                      <button type="button" onClick={() => setSolarSavingText('')} className="text-[9px] text-orange-600 hover:underline font-bold">Auto-Generate</button>
                    </div>
                    <textarea value={solarSavingText || `As informed by the applicant, machinery is presently operated through ${powerSource.toLowerCase()} setup and approximate electricity expenses are around ₹${monthlyEnergyExpense || 0} per month. Applicant expects reduction in approx. ${expectedSolarCostReductionPct || 0}% operational cost after solar installation.`} onChange={(e) => setSolarSavingText(e.target.value)} className="w-full bg-transparent border-0 p-0 text-xs font-semibold text-orange-900 focus:ring-0 resize-none" rows={2} />
                  </div>
               </div>
            </div>

            {/* 12. Address of additional business with or without income assessment */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
               <div>
                  <label className="block text-xs font-bold text-slate-700">12. Address of additional business with or without income assessment</label>
               </div>
               
               <div className="space-y-4 mt-3 border-t border-slate-200 pt-3">
                  <div>
                     <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Address</label>
                     <textarea value={additionalBusinessAddress} onChange={(e) => setAdditionalBusinessAddress(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" rows={2} placeholder="Enter address of additional business" />
                  </div>
                  <div>
                     <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2">Income Assessment Details</label>
                     <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                           <input type="radio" name="incomeAssessment" value="With Income Assessment" checked={additionalBusinessIncomeAssessment === 'With Income Assessment'} onChange={(e) => setAdditionalBusinessIncomeAssessment(e.target.value)} className="w-4 h-4 text-[#eb8a23] focus:ring-[#eb8a23]" />
                           With Income Assessment
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                           <input type="radio" name="incomeAssessment" value="Without Income Assessment" checked={additionalBusinessIncomeAssessment === 'Without Income Assessment'} onChange={(e) => setAdditionalBusinessIncomeAssessment(e.target.value)} className="w-4 h-4 text-[#eb8a23] focus:ring-[#eb8a23]" />
                           Without Income Assessment
                        </label>
                     </div>
                  </div>
               </div>
            </div>

            {/* RESIDENCE VISIT DETAILS SUB-HEADER */}
            <div className="pt-6 pb-2 border-b border-slate-200">
               <h3 className="text-sm font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2">
                 <MapPin className="w-4 h-4 text-[#eb8a23]" />
                 Residence Visit Details
               </h3>
            </div>

            {/* 12. Met Person During Visit Time */}
            <div>
               <label className="block text-xs font-bold text-slate-700 mb-1">12. Met Person During Visit Time</label>
               <div className="p-3 bg-slate-100 border border-slate-300 rounded-lg flex justify-between items-center">
                  <div className="text-xs font-semibold text-slate-700">
                     {personsMet.map(p => {
                        if (p === 'Applicant') return `${applicantName || 'Applicant'} (Self)`;
                        if (p === 'Co-applicant') {
                           const c = coApplicants[0];
                           if (c) return `${c.name || 'Co-applicant'} (${c.relation === 'Other' ? c.otherRelation : c.relation})`;
                           return 'Co-applicant';
                        }
                        if (p === 'Other') return `${personsMetOtherName} (${personsMetOtherRelation})`;
                        return p;
                     }).join(' & ') || 'No persons selected in Applicant Tab.'}
                  </div>
                  <button type="button" onClick={() => setActiveTab('applicant')} className="px-3 py-1.5 text-[10px] bg-white border border-slate-300 text-slate-700 font-bold rounded shadow-sm hover:bg-slate-50">Edit Participants</button>
               </div>
            </div>

            {/* 13. Address of the Meeting */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-700">13. Address of the Meeting</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => {
                    setMeetingAddressSource('RESIDENCE');
                    setMeetingAddress(residenceAddress);
                  }} className={`text-[10px] px-3 py-1.5 rounded font-bold border ${meetingAddressSource === 'RESIDENCE' ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'}`}>Use Residence Address</button>
                  <button type="button" onClick={() => {
                    setMeetingAddressSource('BUSINESS');
                    setMeetingAddress(businessAddress);
                  }} className={`text-[10px] px-3 py-1.5 rounded font-bold border ${meetingAddressSource === 'BUSINESS' ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'}`}>Use Business Address</button>
                  <button type="button" onClick={() => {
                    setMeetingAddressSource('OTHER');
                    setMeetingAddress('');
                  }} className={`text-[10px] px-3 py-1.5 rounded font-bold border ${meetingAddressSource === 'OTHER' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'}`}>Different Address</button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 opacity-90">
                <textarea value={meetingAddress} onChange={(e) => setMeetingAddress(e.target.value)} disabled={meetingAddressSource !== 'OTHER'} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold disabled:bg-slate-100" placeholder="Enter complete meeting address" rows={2} />
              </div>
            </div>

            {/* 14. Locating Premises Type */}
            <div>
               <label className="block text-xs font-bold text-slate-700 mb-2">14. Locating Premises Type</label>
               <div className="flex flex-wrap gap-3">
                 {['Village Area', 'Urban Area', 'Semi-Urban Area', 'Industrial Area', 'Commercial Area', 'Other'].map(opt => (
                    <label key={opt} className="flex items-center gap-2 text-xs font-semibold text-slate-700 p-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                      <input type="radio" checked={locatingPremisesType === opt} onChange={() => setLocatingPremisesType(opt)} className="accent-[#eb8a23]" />
                      {opt}
                    </label>
                 ))}
               </div>
               {locatingPremisesType === 'Other' && (
                  <input type="text" value={locatingPremisesTypeOther} onChange={(e) => setLocatingPremisesTypeOther(e.target.value)} className="w-full md:w-1/2 mt-3 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Specify Premises Type" />
               )}
               {locatingPremisesType && (
                 <div className="mt-2 text-xs font-semibold text-blue-800 bg-blue-50 p-2 rounded">
                    Generated: The residence premises are located in {locatingPremisesType === 'Other' ? `a ${locatingPremisesTypeOther}` : `a ${locatingPremisesType.toLowerCase()}`}.
                 </div>
               )}
            </div>

            {/* 15. Ownership */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
               <label className="block text-xs font-bold text-slate-700">15. Ownership</label>
               <div className="flex flex-wrap gap-3">
                 {['Self-Owned', 'Rented', 'Leased', 'Family-Owned', 'Other'].map(opt => (
                    <label key={opt} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <input type="radio" checked={propertyOwnership === opt} onChange={() => setPropertyOwnership(opt)} className="accent-[#eb8a23]" />
                      {opt}
                    </label>
                 ))}
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                  {propertyOwnership === 'Rented' && (
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Monthly Rent</label>
                      <div className="relative">
                         <span className="absolute left-3 top-2 text-[10px] font-bold text-slate-500">₹</span>
                         <input type="number" value={propertyRentAmount} onChange={(e) => setPropertyRentAmount(Number(e.target.value))} className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Amount" />
                      </div>
                    </div>
                  )}
                  {propertyOwnership === 'Self-Owned' && (
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Property Owner Name</label>
                      <div className="flex gap-2">
                        <input type="text" value={propertyOwnerName} onChange={(e) => setPropertyOwnerName(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Name" />
                        <button type="button" onClick={() => setPropertyOwnerName(applicantName)} className="text-[10px] whitespace-nowrap bg-slate-200 px-2 py-1 rounded font-bold text-slate-700">Set Applicant</button>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Approximate Property Area (Sq. Ft.)</label>
                    <input type="number" value={propertyArea} onChange={(e) => setPropertyArea(Number(e.target.value))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Sq. Ft." />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Approximate Property Value</label>
                    <div className="relative">
                       <span className="absolute left-3 top-2 text-[10px] font-bold text-slate-500">₹</span>
                       <input type="number" value={propertyValue} onChange={(e) => setPropertyValue(Number(e.target.value))} className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Value" />
                    </div>
                  </div>
                  <div>
                     <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Ownership Document Available?</label>
                     <select value={propertyOwnershipDoc} onChange={(e) => setPropertyOwnershipDoc(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23] bg-white">
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                        <option value="Not Provided">Not Provided</option>
                     </select>
                  </div>
               </div>
            </div>

            {/* 16. House Details */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
               <label className="block text-xs font-bold text-slate-700">16. House Details</label>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Number of Floors</label>
                    <input type="number" value={houseFloors} onChange={(e) => setHouseFloors(Number(e.target.value))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Floors" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Number of Rooms</label>
                    <input type="number" value={houseRooms} onChange={(e) => setHouseRooms(Number(e.target.value))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Rooms" />
                  </div>
                  <div>
                     <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Structure Type</label>
                     <select value={houseStructureType} onChange={(e) => setHouseStructureType(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23] bg-white">
                        <option value="">Select...</option>
                        <option value="Single Story">Single Story</option>
                        <option value="Double Story">Double Story</option>
                        <option value="Multi Story">Multi Story</option>
                        <option value="Other">Other</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Floor</label>
                     <select value={houseFloorPosition} onChange={(e) => setHouseFloorPosition(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23] bg-white">
                        <option value="">Select...</option>
                        <option value="Ground Floor">Ground Floor</option>
                        <option value="Ground + 1">Ground + 1</option>
                        <option value="Ground + 2">Ground + 2</option>
                        <option value="Other">Other</option>
                     </select>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {houseStructureType === 'Other' && <input type="text" value={houseStructureTypeOther} onChange={(e) => setHouseStructureTypeOther(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Specify Structure Type" />}
                  {houseFloorPosition === 'Other' && <input type="text" value={houseFloorPositionOther} onChange={(e) => setHouseFloorPositionOther(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Specify Floor Position" />}
               </div>
               <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Additional Details</label>
                  <input type="text" value={houseAdditionalDetails} onChange={(e) => setHouseAdditionalDetails(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Optional details..." />
               </div>
               <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs font-semibold text-blue-800">
                 Generated: This house has {houseRooms || 0} rooms and is a {houseStructureType === 'Other' ? houseStructureTypeOther.toLowerCase() : houseStructureType.toLowerCase()} structure, comprising {houseFloorPosition === 'Other' ? houseFloorPositionOther.toLowerCase() : houseFloorPosition.toLowerCase()}.
               </div>
            </div>

            {/* 17. Family Background of the Applicant */}
            <div>
               <label className="block text-xs font-bold text-slate-700 mb-1">17. Family Background of the Applicant</label>
               <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                     <span className="text-xs font-semibold text-slate-600 italic">This table is automatically generated from the Household data.</span>
                     <button type="button" onClick={() => setActiveTab('applicant')} className="px-3 py-1.5 text-[10px] bg-white border border-slate-300 text-slate-700 font-bold rounded shadow-sm hover:bg-slate-50">Edit Family Records</button>
                  </div>
                  {familyMembers.length === 0 ? (
                     <div className="text-xs text-slate-400 p-2 text-center bg-white border border-slate-200 rounded">No family members found.</div>
                  ) : (
                     <table className="w-full text-left text-xs text-slate-600 border border-slate-200 bg-white">
                        <thead className="bg-slate-100">
                           <tr>
                              <th className="p-2 border-b">Name</th>
                              <th className="p-2 border-b">Age</th>
                              <th className="p-2 border-b">Relationship</th>
                              <th className="p-2 border-b">Qualification</th>
                              <th className="p-2 border-b">Occupation</th>
                              <th className="p-2 border-b text-center">Dependent</th>
                           </tr>
                        </thead>
                        <tbody>
                           {familyMembers.map(member => (
                              <tr key={member.id} className="border-b border-slate-100">
                                 <td className="p-2">{member.name || '-'}</td>
                                 <td className="p-2">{member.age || '-'}</td>
                                 <td className="p-2">{member.relationship || '-'}</td>
                                 <td className="p-2">{member.qualification || '-'}</td>
                                 <td className="p-2">{member.occupation || member.profession || '-'}</td>
                                 <td className="p-2 text-center">{member.isDependent ? 'Yes' : 'No'}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  )}
               </div>
            </div>

            {/* 18. Monthly Household Expenses */}
            <div>
               <label className="block text-xs font-bold text-slate-700 mb-1">18. Monthly Household Expenses</label>
               <div className="relative md:w-1/3">
                  <span className="absolute left-3 top-2 text-[10px] font-bold text-slate-500">₹</span>
                  <input type="number" value={monthlyHouseholdExpensesAmount} onChange={(e) => setMonthlyHouseholdExpensesAmount(Number(e.target.value))} className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Amount / month" />
               </div>
            </div>

            {/* 19. Electricity Connection Details */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
               <label className="block text-xs font-bold text-slate-700">19. Electricity Connection Details</label>
               <div className="flex gap-2">
                 {['Yes', 'No', 'Not Provided'].map(opt => (
                    <button key={opt} type="button" onClick={() => setHasElectricityConnection(opt)} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border ${hasElectricityConnection === opt ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-white text-slate-600 border-slate-300'}`}>{opt}</button>
                 ))}
               </div>
               
               {hasElectricityConnection === 'Yes' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-200">
                     <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Connection Type</label>
                        <select value={electricityConnectionType} onChange={(e) => setElectricityConnectionType(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23] bg-white">
                           <option value="">Select...</option>
                           <option value="Domestic">Domestic</option>
                           <option value="Commercial">Commercial</option>
                           <option value="Agricultural">Agricultural</option>
                           <option value="Other">Other</option>
                        </select>
                        {electricityConnectionType === 'Other' && (
                           <input type="text" value={electricityConnectionTypeOther} onChange={(e) => setElectricityConnectionTypeOther(e.target.value)} className="w-full mt-2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Specify Type" />
                        )}
                     </div>
                     <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Consumer Number</label>
                        <input type="text" value={electricityConsumerNumber} onChange={(e) => setElectricityConsumerNumber(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Optional" />
                     </div>
                     <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Monthly Expense</label>
                        <div className="relative">
                           <span className="absolute left-3 top-2 text-[10px] font-bold text-slate-500">₹</span>
                           <input type="number" value={electricityMonthlyExpense} onChange={(e) => setElectricityMonthlyExpense(Number(e.target.value))} className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Amount" />
                        </div>
                     </div>
                  </div>
               )}
               {hasElectricityConnection === 'No' && <div className="text-xs font-semibold text-blue-800 bg-blue-50 p-2 rounded">Generated: No Electricity Connection</div>}
            </div>

            {/* 20. Neighbor Name */}
            <div className="space-y-3">
               <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-700">20. Neighbor Name</label>
                  <button type="button" onClick={() => setNeighbors([{ id: Date.now(), name: 'Adjoining neighbors', remark: '' }])} className="text-[10px] bg-slate-100 px-2 py-1 rounded border border-slate-300 font-bold hover:bg-slate-200">No Specific Neighbor Provided</button>
               </div>
               
               <div className="space-y-2">
                  <button type="button" onClick={() => setNeighbors([...neighbors, { id: Date.now(), name: '', remark: '' }])} className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-[#2d3e50] border border-slate-300 text-[10px] font-bold rounded hover:bg-slate-200">
                     <Plus className="w-3 h-3" /> Add Neighbor
                  </button>
                  {neighbors.map((neighbor, idx) => (
                     <div key={neighbor.id} className="flex items-center gap-2">
                        <input type="text" value={neighbor.name} onChange={(e) => { const arr = [...neighbors]; arr[idx].name = e.target.value; setNeighbors(arr); }} className="w-1/2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Neighbor Name" />
                        <input type="text" value={neighbor.remark} onChange={(e) => { const arr = [...neighbors]; arr[idx].remark = e.target.value; setNeighbors(arr); }} className="w-1/2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Relationship / Location" />
                        <button onClick={() => { const arr = [...neighbors]; arr.splice(idx, 1); setNeighbors(arr); }} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                     </div>
                  ))}
               </div>
            </div>

            {/* 21. Neighbor Feedback */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
               <label className="block text-xs font-bold text-slate-700">21. Neighbor Feedback</label>
               <div className="flex items-center gap-4">
                 <span className="text-xs font-semibold text-slate-600">Neighbor Verification Conducted?</span>
                 <button type="button" onClick={() => setNeighborVerificationConducted(true)} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border ${neighborVerificationConducted ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-white text-slate-600 border-slate-300'}`}>Yes</button>
                 <button type="button" onClick={() => setNeighborVerificationConducted(false)} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border ${!neighborVerificationConducted ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-white text-slate-600 border-slate-300'}`}>No</button>
               </div>

               {neighborVerificationConducted && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                     <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Residence Confirmation</label>
                        <select value={neighborResidenceConfirmed} onChange={(e) => setNeighborResidenceConfirmed(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23] bg-white">
                           <option value="">Select...</option>
                           <option value="Confirmed">Confirmed</option>
                           <option value="Not Confirmed">Not Confirmed</option>
                           <option value="Partially Confirmed">Partially Confirmed</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Behaviour Feedback</label>
                        <select value={neighborBehaviourFeedback} onChange={(e) => setNeighborBehaviourFeedback(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23] bg-white">
                           <option value="">Select...</option>
                           <option value="Positive">Positive</option>
                           <option value="Neutral">Neutral</option>
                           <option value="Negative">Negative</option>
                           <option value="Not Provided">Not Provided</option>
                        </select>
                     </div>
                     <div className="md:col-span-2 flex items-center gap-4">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Any Negative Information?</span>
                        <button type="button" onClick={() => setNeighborNegativeFeedback(true)} className={`px-3 py-1 text-[10px] font-bold rounded border ${neighborNegativeFeedback ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-600 border-slate-300'}`}>Yes</button>
                        <button type="button" onClick={() => { setNeighborNegativeFeedback(false); setNeighborNegativeDetails(''); }} className={`px-3 py-1 text-[10px] font-bold rounded border ${!neighborNegativeFeedback ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-white text-slate-600 border-slate-300'}`}>No</button>
                     </div>
                     {neighborNegativeFeedback && (
                        <div className="md:col-span-2">
                           <textarea value={neighborNegativeDetails} onChange={(e) => setNeighborNegativeDetails(e.target.value)} className="w-full px-3 py-2 text-xs border border-red-300 rounded-lg focus:ring-red-500" placeholder="Details of negative information..." rows={2} />
                        </div>
                     )}
                     <div className="md:col-span-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs font-semibold text-blue-800">
                        Generated: Neighbour verification was conducted, wherein neighbours {neighborResidenceConfirmed === 'Confirmed' ? 'confirmed' : neighborResidenceConfirmed.toLowerCase()} that both the applicant and co-applicant have been residing at the given address. The feedback received was {neighborBehaviourFeedback.toLowerCase()} regarding their behaviour.
                     </div>
                  </div>
               )}
            </div>

            {/* 22. Latitude & Longitude */}
            <div>
               <label className="block text-xs font-bold text-slate-700 mb-2">22. Latitude & Longitude of the business premises</label>
               <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={() => {
                     if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                           (pos) => { setGpsLat(pos.coords.latitude); setGpsLng(pos.coords.longitude); },
                           (err) => { alert('Geolocation error: ' + err.message); }
                        );
                     } else {
                        alert("Geolocation is not supported by this browser.");
                     }
                  }} className="flex items-center gap-2 px-4 py-2 bg-[#2d3e50] text-white rounded-lg text-xs font-bold shadow-sm hover:bg-slate-800 transition">
                     <MapPin className="w-3.5 h-3.5" /> Get Current Location
                  </button>
                  <div className="flex items-center gap-2">
                     <input type="number" step="any" value={gpsLat} onChange={(e) => setGpsLat(Number(e.target.value))} className="w-28 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Lat (e.g. 25.6)" />
                     <input type="number" step="any" value={gpsLng} onChange={(e) => setGpsLng(Number(e.target.value))} className="w-28 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Lng (e.g. 86.1)" />
                  </div>
               </div>
            </div>

            {/* 23. Residence Status */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
               <label className="block text-xs font-bold text-slate-700">23. Residence Status</label>
               <div className="flex flex-wrap gap-2">
                 {['Recommended', 'Not Recommended', 'Pending', 'Requires Further Verification'].map(opt => (
                    <button key={opt} type="button" onClick={() => setResidenceStatus(opt)} className={`px-4 py-2 text-xs font-bold rounded-lg border ${residenceStatus === opt ? (opt === 'Recommended' ? 'bg-green-600 text-white border-green-600' : opt === 'Not Recommended' ? 'bg-red-600 text-white border-red-600' : 'bg-[#eb8a23] text-white border-[#eb8a23]') : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>
                      {opt}
                    </button>
                 ))}
               </div>
               {(residenceStatus === 'Not Recommended' || residenceStatus === 'Pending' || residenceStatus === 'Requires Further Verification') && (
                  <textarea value={residenceStatusReason} onChange={(e) => setResidenceStatusReason(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder={`Reason for ${residenceStatus}...`} rows={3} />
               )}
            </div>

          </div>
          {renderTabNavigationFooter()}
        </div>
      )}

      {activeTab === 'customer_supplier' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2 mb-6">
              <Briefcase className="w-4 h-4 text-[#eb8a23]" />
              Customer & Supplier Details
            </h3>

            {/* A. Applicant's customer and supplier details */}
            <div className="space-y-6">
              {/* Prominent Customers */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                   <h5 className="font-bold text-xs text-slate-700">Prominent Customers</h5>
                   <button type="button" onClick={() => setProminentCustomers([...prominentCustomers, { id: 'c'+Date.now(), name: '', phone: '', feedback: '' }])} className="flex items-center gap-1 px-3 py-1.5 bg-white text-[#2d3e50] border border-slate-300 text-[10px] font-bold rounded hover:bg-slate-50 shadow-sm">
                      <Plus className="w-3 h-3" /> Add Customer
                   </button>
                </div>
                <div className="overflow-x-auto p-3 bg-white">
                   <table className="w-full text-xs text-left text-slate-600">
                     <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                       <tr>
                         <th className="pb-2 w-10 text-center">Sr. No.</th>
                         <th className="pb-2">Prominent Customers (Name)</th>
                         <th className="pb-2">Customers Ph. No.</th>
                         <th className="pb-2">Feedback (Remark)</th>
                         <th className="pb-2 w-10 text-center">Action</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {prominentCustomers.map((cust, idx) => (
                           <tr key={cust.id}>
                             <td className="py-2 text-center font-bold text-slate-400">{idx + 1}</td>
                             <td className="py-2 pr-2"><input type="text" value={cust.name} onChange={(e) => { const arr = [...prominentCustomers]; arr[idx].name = e.target.value; setProminentCustomers(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="Name" /></td>
                             <td className="py-2 pr-2"><input type="text" value={cust.phone} onChange={(e) => { const arr = [...prominentCustomers]; arr[idx].phone = e.target.value.replace(/\D/g, ''); setProminentCustomers(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="Phone" maxLength={10} /></td>
                             <td className="py-2 pr-2"><input type="text" value={cust.feedback} onChange={(e) => { const arr = [...prominentCustomers]; arr[idx].feedback = e.target.value; setProminentCustomers(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="Feedback" /></td>
                             <td className="py-2 text-center"><button onClick={() => { const arr = [...prominentCustomers]; arr.splice(idx, 1); setProminentCustomers(arr); }} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4 mx-auto" /></button></td>
                           </tr>
                        ))}
                     </tbody>
                   </table>
                </div>
              </div>

              {/* Prominent Suppliers */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                   <h5 className="font-bold text-xs text-slate-700">Prominent Suppliers</h5>
                   <button type="button" onClick={() => setProminentSuppliers([...prominentSuppliers, { id: 's'+Date.now(), name: '', phone: '', feedback: '' }])} className="flex items-center gap-1 px-3 py-1.5 bg-white text-[#2d3e50] border border-slate-300 text-[10px] font-bold rounded hover:bg-slate-50 shadow-sm">
                      <Plus className="w-3 h-3" /> Add Supplier
                   </button>
                </div>
                <div className="overflow-x-auto p-3 bg-white">
                   <table className="w-full text-xs text-left text-slate-600">
                     <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                       <tr>
                         <th className="pb-2 w-10 text-center">Sr. No.</th>
                         <th className="pb-2">Prominent Suppliers (Name)</th>
                         <th className="pb-2">Supplier Ph. No.</th>
                         <th className="pb-2">Feedback (Remark)</th>
                         <th className="pb-2 w-10 text-center">Action</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {prominentSuppliers.map((sup, idx) => (
                           <tr key={sup.id}>
                             <td className="py-2 text-center font-bold text-slate-400">{idx + 1}</td>
                             <td className="py-2 pr-2"><input type="text" value={sup.name} onChange={(e) => { const arr = [...prominentSuppliers]; arr[idx].name = e.target.value; setProminentSuppliers(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="Name or 'Not applicable'" /></td>
                             <td className="py-2 pr-2"><input type="text" value={sup.phone} onChange={(e) => { const arr = [...prominentSuppliers]; arr[idx].phone = e.target.value.replace(/\D/g, ''); setProminentSuppliers(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="Phone" maxLength={10} /></td>
                             <td className="py-2 pr-2"><input type="text" value={sup.feedback} onChange={(e) => { const arr = [...prominentSuppliers]; arr[idx].feedback = e.target.value; setProminentSuppliers(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="Feedback" /></td>
                             <td className="py-2 text-center"><button onClick={() => { const arr = [...prominentSuppliers]; arr.splice(idx, 1); setProminentSuppliers(arr); }} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4 mx-auto" /></button></td>
                           </tr>
                        ))}
                     </tbody>
                   </table>
                </div>
              </div>
            </div>

            {/* B. Banking Details */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
               <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                  <h5 className="font-bold text-xs text-slate-700">Banking Details and Limit OD and CC limit with bank</h5>
                  <button type="button" onClick={() => setBankingDetails([...bankingDetails, { id: 'b'+Date.now(), bankName: '', branchName: '', accountType: 'Saving Account', limit: 'NA', accountNo: '', remark: 'The account belongs to applicant' }])} className="flex items-center gap-1 px-3 py-1.5 bg-white text-[#2d3e50] border border-slate-300 text-[10px] font-bold rounded hover:bg-slate-50 shadow-sm">
                     <Plus className="w-3 h-3" /> Add Bank
                  </button>
               </div>
               <div className="overflow-x-auto p-3 bg-white">
                  <table className="w-full text-xs text-left text-slate-600">
                    <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="pb-2">Bank Name</th>
                        <th className="pb-2">Branch Name</th>
                        <th className="pb-2">Account Types</th>
                        <th className="pb-2">CC/OD Limit</th>
                        <th className="pb-2">Account No.</th>
                        <th className="pb-2">Remark</th>
                        <th className="pb-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {bankingDetails.map((bank, idx) => (
                          <tr key={bank.id}>
                            <td className="py-2 pr-2"><input type="text" value={bank.bankName} onChange={(e) => { const arr = [...bankingDetails]; arr[idx].bankName = e.target.value; setBankingDetails(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="e.g. UCO Bank" /></td>
                            <td className="py-2 pr-2"><input type="text" value={bank.branchName} onChange={(e) => { const arr = [...bankingDetails]; arr[idx].branchName = e.target.value; setBankingDetails(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="Branch" /></td>
                            <td className="py-2 pr-2">
                               <select value={bank.accountType} onChange={(e) => { const arr = [...bankingDetails]; arr[idx].accountType = e.target.value; setBankingDetails(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23] bg-white">
                                  <option value="Saving Account">Saving Account</option>
                                  <option value="Current Account">Current Account</option>
                                  <option value="OD">OD</option>
                                  <option value="CC">CC</option>
                                  <option value="Other">Other</option>
                               </select>
                            </td>
                            <td className="py-2 pr-2"><input type="text" value={bank.limit} onChange={(e) => { const arr = [...bankingDetails]; arr[idx].limit = e.target.value; setBankingDetails(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="Limit or NA" /></td>
                            <td className="py-2 pr-2"><input type="text" value={bank.accountNo} onChange={(e) => { const arr = [...bankingDetails]; arr[idx].accountNo = e.target.value; setBankingDetails(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="*******9522" /></td>
                            <td className="py-2 pr-2"><input type="text" value={bank.remark} onChange={(e) => { const arr = [...bankingDetails]; arr[idx].remark = e.target.value; setBankingDetails(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="Remark" /></td>
                            <td className="py-2 text-center"><button onClick={() => { const arr = [...bankingDetails]; arr.splice(idx, 1); setBankingDetails(arr); }} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4 mx-auto" /></button></td>
                          </tr>
                       ))}
                    </tbody>
                  </table>
               </div>
            </div>

            {/* C. Existing Loans / Liabilities */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
               <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                  <h5 className="font-bold text-xs text-slate-700">Existing Loans / Liabilities</h5>
                  <button type="button" onClick={() => setExistingLoans([...existingLoans, { id: 'l'+Date.now(), typeOfLoan: 'NA', financerName: 'NA', amountInLakhs: '', emi: '', tenure: '', balanceTenure: '', remark: '' }])} className="flex items-center gap-1 px-3 py-1.5 bg-white text-[#2d3e50] border border-slate-300 text-[10px] font-bold rounded hover:bg-slate-50 shadow-sm">
                     <Plus className="w-3 h-3" /> Add Loan
                  </button>
               </div>
               <div className="overflow-x-auto p-3 bg-white">
                  <table className="w-full text-xs text-left text-slate-600">
                    <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="pb-2">Type of Loan</th>
                        <th className="pb-2">Financer Name</th>
                        <th className="pb-2">Loan Amount (In Lakhs)</th>
                        <th className="pb-2">EMI (Rs.)</th>
                        <th className="pb-2">Tenure (Y, M)</th>
                        <th className="pb-2">Balance Tenure</th>
                        <th className="pb-2">Remark</th>
                        <th className="pb-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {existingLoans.map((loan, idx) => (
                          <tr key={loan.id}>
                            <td className="py-2 pr-2"><input type="text" value={loan.typeOfLoan} onChange={(e) => { const arr = [...existingLoans]; arr[idx].typeOfLoan = e.target.value; setExistingLoans(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="NA" /></td>
                            <td className="py-2 pr-2"><input type="text" value={loan.financerName} onChange={(e) => { const arr = [...existingLoans]; arr[idx].financerName = e.target.value; setExistingLoans(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="NA" /></td>
                            <td className="py-2 pr-2"><input type="number" step="any" value={loan.amountInLakhs} onChange={(e) => { const arr = [...existingLoans]; arr[idx].amountInLakhs = e.target.value; setExistingLoans(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="Amount" /></td>
                            <td className="py-2 pr-2"><input type="number" step="any" value={loan.emi} onChange={(e) => { const arr = [...existingLoans]; arr[idx].emi = e.target.value; setExistingLoans(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="EMI" /></td>
                            <td className="py-2 pr-2"><input type="text" value={loan.tenure} onChange={(e) => { const arr = [...existingLoans]; arr[idx].tenure = e.target.value; setExistingLoans(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="e.g. 5, 0" /></td>
                            <td className="py-2 pr-2"><input type="text" value={loan.balanceTenure} onChange={(e) => { const arr = [...existingLoans]; arr[idx].balanceTenure = e.target.value; setExistingLoans(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="e.g. 2, 6" /></td>
                            <td className="py-2 pr-2"><input type="text" value={loan.remark} onChange={(e) => { const arr = [...existingLoans]; arr[idx].remark = e.target.value; setExistingLoans(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="No any existing obligation" /></td>
                            <td className="py-2 text-center"><button onClick={() => { const arr = [...existingLoans]; arr.splice(idx, 1); setExistingLoans(arr); }} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4 mx-auto" /></button></td>
                          </tr>
                       ))}
                    </tbody>
                  </table>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                     <label className="text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap">Current Obligation</label>
                     <input type="text" value={currentObligation} onChange={(e) => setCurrentObligation(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]" placeholder="e.g. No any existing obligation" />
                  </div>
               </div>
            </div>

            {/* D. Co-Applicant Business Details */}
            {coApplicants.length > 0 && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 mt-6">
                 <label className="block text-xs font-bold text-slate-700">Business Details of Co-applicants</label>
                 {coApplicants.map((coApp, idx) => (
                   <div key={idx} className="border-t border-slate-200 pt-3 first:border-0 first:pt-0">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] uppercase font-bold text-slate-500">{coApp.name || `Co-applicant ${idx + 1}`} ({coApp.relation})</span>
                        <div className="flex gap-2">
                           <button type="button" onClick={() => {
                             const arr = [...coApplicants];
                             arr[idx].inBusiness = true;
                             setCoApplicants(arr);
                           }} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border ${coApp.inBusiness ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}>In Business</button>
                           <button type="button" onClick={() => {
                             const arr = [...coApplicants];
                             arr[idx].inBusiness = false;
                             setCoApplicants(arr);
                           }} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border ${coApp.inBusiness === false ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}>Not involved</button>
                        </div>
                     </div>
                     {coApp.inBusiness && (
                        <div>
                           <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Details / Role in Business</label>
                           <textarea value={coApp.businessRole || ''} onChange={(e) => {
                             const arr = [...coApplicants];
                             arr[idx].businessRole = e.target.value;
                             setCoApplicants(arr);
                           }} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]" placeholder="Specify role, shareholding, responsibilities..." rows={2} />
                        </div>
                     )}
                   </div>
                 ))}
              </div>
            )}

            {/* E. Latitude & Longitude Remarks */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 mt-6">
               <label className="block text-xs font-bold text-slate-700">Latitude & Longitude of the Business Premises</label>
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                     <input type="number" step="any" value={gpsLat} onChange={(e) => setGpsLat(Number(e.target.value))} className="w-28 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Lat (e.g. 25.6)" />
                     <input type="number" step="any" value={gpsLng} onChange={(e) => setGpsLng(Number(e.target.value))} className="w-28 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Lng (e.g. 86.1)" />
                  </div>
                  <button type="button" onClick={() => {
                     if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                           (pos) => { setGpsLat(pos.coords.latitude); setGpsLng(pos.coords.longitude); },
                           (err) => { alert('Geolocation error: ' + err.message); }
                        );
                     } else {
                        alert("Geolocation is not supported by this browser.");
                     }
                  }} className="flex items-center gap-2 px-3 py-2 bg-[#2d3e50] text-white rounded-lg text-xs font-bold shadow-sm hover:bg-slate-800 transition">
                     <MapPin className="w-3 h-3" /> Get Location
                  </button>
               </div>
               <div className="border-t border-slate-200 pt-3">
                  <div className="flex items-center justify-between mb-2">
                     <label className="block text-[10px] uppercase font-bold text-slate-500">Location Verified by GPS?</label>
                     <div className="flex gap-2">
                        <button type="button" onClick={() => { setBusinessLongitudeVerified(true); setBusinessLongitudeRemarks("The location was successfully verified using the provided coordinates."); }} className={`px-3 py-1 text-[10px] font-bold rounded border ${businessLongitudeVerified ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}>Yes, Verified</button>
                        <button type="button" onClick={() => { setBusinessLongitudeVerified(false); setBusinessLongitudeRemarks("The location was checked using the provided coordinates; however, the GPS map was unable to navigate up to the exact point."); }} className={`px-3 py-1 text-[10px] font-bold rounded border ${!businessLongitudeVerified ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}>No, Navigation Failed</button>
                     </div>
                  </div>
                  <textarea value={businessLongitudeRemarks} onChange={(e) => setBusinessLongitudeRemarks(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] text-blue-900 bg-blue-50 font-semibold" rows={2} />
               </div>
            </div>


            {/* G. Business Status */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 mt-6">
               <label className="block text-xs font-bold text-slate-700">Business Status</label>
               <div className="flex flex-wrap gap-2">
                 {['Recommended', 'Not Recommended'].map(opt => (
                    <button key={opt} type="button" onClick={() => setBusinessStatus(opt)} className={`px-6 py-2.5 text-xs font-bold rounded-lg border ${businessStatus === opt ? (opt === 'Recommended' ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-red-600 text-white border-red-600 shadow-md') : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>
                      {opt}
                    </button>
                 ))}
               </div>
            </div>

          </div>
          {renderTabNavigationFooter()}
        </div>
      )}

      {activeTab === 'field' && (
        <div className="space-y-6">


          {/* EXIF GPS Photos */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-sm font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#eb8a23]" />
                GPS Geotagged Field Inspection Proofs
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Extracted GPS Latitude</label>
                <input
                  type="text"
                  value={exifGpsLat}
                  onChange={(e) => setExifGpsLat(e.target.value)}
                  placeholder="e.g. 26.9124"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Extracted GPS Longitude</label>
                <input
                  type="text"
                  value={exifGpsLng}
                  onChange={(e) => setExifGpsLng(e.target.value)}
                  placeholder="e.g. 75.7873"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]"
                />
              </div>
            </div>

            {['KYC PHOTOS', 'RESIDENCE VISIT PHOTO', 'BUSINESS VISIT PHOTO', 'BUSINESS DOCUMENTS'].map((categoryName) => (
              <div key={categoryName} className="space-y-3">
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700">{categoryName}</h4>
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-[#eb8a23] hover:bg-[#d97917] text-white rounded text-[10px] font-bold transition shadow-sm cursor-pointer">
                    {isUploadingPhoto ? (
                      <span className="animate-pulse">Uploading...</span>
                    ) : (
                      <>
                        <Upload className="w-3 h-3 text-white" />
                        Upload {categoryName}
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple
                          className="hidden" 
                          onChange={async (e) => {
                            const fileList = e.target.files;
                            if (!fileList || fileList.length === 0) return;
                            const files = Array.from(fileList) as File[];
                            setIsUploadingPhoto(true);

                            for (const file of files) {
                              let latToUse = parseFloat(exifGpsLat) || 26.9124;
                              let lngToUse = parseFloat(exifGpsLng) || 75.7873;
                              
                              try {
                                const gps = await exifr.gps(file);
                                if (gps && gps.latitude && gps.longitude) {
                                  latToUse = gps.latitude;
                                  lngToUse = gps.longitude;
                                  setExifGpsLat(`${latToUse.toFixed(4)}° N`);
                                  setExifGpsLng(`${lngToUse.toFixed(4)}° E`);
                                }
                              } catch (exifErr) {
                                console.error('EXIF extraction failed', exifErr);
                              }

                              const reader = new FileReader();
                              const readerPromise = new Promise((resolve) => {
                                reader.onloadend = async () => {
                                  try {
                                    const base64Data = reader.result as string;
                                    let res;
                                    try {
                                      res = await api.uploadPhoto(file.name, base64Data, latToUse, lngToUse);
                                    } catch (apiErr) {
                                      res = { 
                                        id: Math.random().toString(), 
                                        url: base64Data, 
                                        caption: file.name,
                                        gpsCoordinates: { latitude: latToUse, longitude: lngToUse },
                                        gps: { lat: latToUse, lng: lngToUse }
                                      };
                                    }
                                    if (res) {
                                      setPhotos(prev => [...prev, { ...res, categoryTag: categoryName }]);
                                    }
                                  } catch (err) {
                                    console.error(err);
                                  } finally {
                                    resolve(true);
                                  }
                                };
                              });
                              reader.readAsDataURL(file);
                              await readerPromise;
                            }
                            setIsUploadingPhoto(false);
                          }} 
                        />
                      </>
                    )}
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {photos.filter(p => p.categoryTag === categoryName).length === 0 ? (
                    <div className="col-span-full p-4 text-center border-2 border-dashed border-slate-200 rounded-xl">
                      <p className="text-xs text-slate-500 font-bold">No {categoryName.toLowerCase()} uploaded yet</p>
                    </div>
                  ) : (
                    photos.filter(p => p.categoryTag === categoryName).map((photo, idx) => (
                      <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 relative group">
                        <img
                          src={photo.url}
                          alt={photo.caption}
                          className="w-full h-32 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setPhotos(prev => prev.filter(p => p.id !== photo.id))}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <div className="p-2 flex flex-col gap-1 text-[10px]">
                          <div className="font-bold text-[#2d3e50] truncate">{photo.caption}</div>
                          <div className="text-slate-500 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-rose-500" />
                              GPS: {photo.gpsCoordinates?.latitude?.toFixed(4) || photo.gps?.lat?.toFixed(4)}, {photo.gpsCoordinates?.longitude?.toFixed(4) || photo.gps?.lng?.toFixed(4)}
                            </span>
                            <span className="font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                              VERIFIED
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
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
                      <th className="p-2.5">Business Notes</th>
                      <th className="p-2.5">Unit</th>
                      <th className="p-2.5 text-right">Qty</th>
                      <th className="p-2.5 text-right">Price (₹)</th>
                      <th className="p-2.5 text-right">Days/Mo</th>
                      <th className="p-2.5 text-right">Monthly (₹)</th>
                      <th className="p-2.5 text-right">Yearly (₹)</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white font-medium">
                    {incomeLines.map((line) => {
                      const monthlyLineTotal = line.monthlyAmount || 0;
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
                          <td className="p-2">
                            <input
                              type="text"
                              value={line.businessNotes || ''}
                              onChange={(e) => handleUpdateIncomeLine(line.id, 'businessNotes', e.target.value)}
                              className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-slate-600"
                              placeholder="e.g. 8 Quintal x 100 Kg x ₹1.60 x 28 Days"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={line.unit || ''}
                              onChange={(e) => handleUpdateIncomeLine(line.id, 'unit', e.target.value)}
                              className="w-20 px-2 py-1 border border-slate-300 rounded text-xs text-slate-600"
                            >
                              <option value="">Select...</option>
                              <option value="Litre">Litre</option>
                              <option value="Kg">Kg</option>
                              <option value="Piece">Piece</option>
                              <option value="Box">Box</option>
                              <option value="Dozen">Dozen</option>
                              <option value="Quintal">Quintal</option>
                              <option value="Ton">Ton</option>
                            </select>
                          </td>
                          <td className="p-2 text-right">
                            <input
                              type="number"
                              value={line.quantity || ''}
                              onChange={(e) => handleUpdateIncomeLine(line.id, 'quantity', Number(e.target.value))}
                              className="w-16 px-2 py-1 border border-slate-300 rounded text-xs text-right"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <input
                              type="number"
                              value={line.price || ''}
                              onChange={(e) => handleUpdateIncomeLine(line.id, 'price', Number(e.target.value))}
                              className="w-20 px-2 py-1 border border-slate-300 rounded text-xs text-right"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <input
                              type="number"
                              value={line.workingDays || ''}
                              onChange={(e) => handleUpdateIncomeLine(line.id, 'workingDays', Number(e.target.value))}
                              className="w-16 px-2 py-1 border border-slate-300 rounded text-xs text-right"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <input
                              type="number"
                              value={line.monthlyAmount || 0}
                              onChange={(e) => handleUpdateIncomeLine(line.id, 'monthlyAmount', Number(e.target.value))}
                              className="w-24 px-2 py-1 border border-slate-300 rounded text-xs text-right font-black text-emerald-700"
                            />
                          </td>
                          <td className="p-2 text-right font-bold text-slate-600 whitespace-nowrap">
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
                  Direct Monthly Basis
                </div>
              </div>
            </div>

            {/* Direct Monthly Expenditure Breakdown */}
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h4 className="text-xs font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-rose-600" />
                    Itemized Operating Expenditures & Direct Costs ({currentCategory.name})
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">Direct Monthly Basis format.</p>
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
                      <th className="p-2.5">Business Notes</th>
                      <th className="p-2.5">Unit</th>
                      <th className="p-2.5 text-right">Qty</th>
                      <th className="p-2.5 text-right">Price (₹)</th>
                      <th className="p-2.5 text-right">Days/Mo</th>
                      <th className="p-2.5 text-right">Monthly (₹)</th>
                      <th className="p-2.5 text-right">Yearly (₹)</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white font-medium">
                    {expenseLines.map((line) => {
                      const monthlyLineTotal = line.monthlyAmount || 0;
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
                          <td className="p-2">
                            <input
                              type="text"
                              value={line.businessNotes || ''}
                              onChange={(e) => handleUpdateExpenseLine(line.id, 'businessNotes', e.target.value)}
                              className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-slate-600"
                              placeholder="e.g. Estimated based on usage"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={line.unit || ''}
                              onChange={(e) => handleUpdateExpenseLine(line.id, 'unit', e.target.value)}
                              className="w-20 px-2 py-1 border border-slate-300 rounded text-xs text-slate-600"
                            >
                              <option value="">Select...</option>
                              <option value="Litre">Litre</option>
                              <option value="Kg">Kg</option>
                              <option value="Piece">Piece</option>
                              <option value="Box">Box</option>
                              <option value="Dozen">Dozen</option>
                              <option value="Quintal">Quintal</option>
                              <option value="Ton">Ton</option>
                            </select>
                          </td>
                          <td className="p-2 text-right">
                            <input
                              type="number"
                              value={line.quantity || ''}
                              onChange={(e) => handleUpdateExpenseLine(line.id, 'quantity', Number(e.target.value))}
                              className="w-16 px-2 py-1 border border-slate-300 rounded text-xs text-right"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <input
                              type="number"
                              value={line.price || ''}
                              onChange={(e) => handleUpdateExpenseLine(line.id, 'price', Number(e.target.value))}
                              className="w-20 px-2 py-1 border border-slate-300 rounded text-xs text-right"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <input
                              type="number"
                              value={line.workingDays || ''}
                              onChange={(e) => handleUpdateExpenseLine(line.id, 'workingDays', Number(e.target.value))}
                              className="w-16 px-2 py-1 border border-slate-300 rounded text-xs text-right"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <input
                              type="number"
                              value={line.monthlyAmount || 0}
                              onChange={(e) => handleUpdateExpenseLine(line.id, 'monthlyAmount', Number(e.target.value))}
                              className="w-24 px-2 py-1 border border-slate-300 rounded text-xs text-right font-black text-rose-700"
                            />
                          </td>
                          <td className="p-2 text-right font-bold text-slate-600 whitespace-nowrap">
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
                  Direct Monthly Basis
                </div>
              </div>
            </div>

            {/* Waterfall Input Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Stated Monthly Sales Turnover (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={statedMonthlySales}
                  onChange={(e) => { const v = Number(e.target.value); if (v >= 0) setStatedMonthlySales(v); }}
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
                  min="0"
                  value={appliedAmount}
                  onChange={(e) => { const v = Number(e.target.value); if (v >= 0) setAppliedAmount(v); }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold text-[#eb8a23]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Staff Salaries (₹/mo)</label>
                <input
                  type="number"
                  min="0"
                  value={salariesExpense}
                  onChange={(e) => { const v = Number(e.target.value); if (v >= 0) setSalariesExpense(v); }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Power & Utilities (₹/mo)</label>
                <input
                  type="number"
                  min="0"
                  value={utilitiesExpense}
                  onChange={(e) => { const v = Number(e.target.value); if (v >= 0) setUtilitiesExpense(v); }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Household Expenses (₹/mo)</label>
                <div className="space-y-2">
                  <input
                    type="number"
                    min="0"
                    value={householdExpenses}
                    onChange={(e) => { const v = Number(e.target.value); if (v >= 0) setHouseholdExpenses(v); }}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-semibold"
                  />
                  <input
                    type="text"
                    value={householdExpensesNotes}
                    onChange={(e) => setHouseholdExpensesNotes(e.target.value)}
                    placeholder="e.g. 1 earning member..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Existing EMI Notes (Report Override)</label>
                <input
                  type="text"
                  value={existingEmiNotes}
                  onChange={(e) => setExistingEmiNotes(e.target.value)}
                  placeholder="e.g. As per applicant no any existing obligation"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Comfortable EMI Notes (Report Override)</label>
                <input
                  type="text"
                  value={comfortableEmiNotes}
                  onChange={(e) => setComfortableEmiNotes(e.target.value)}
                  placeholder="e.g. Post all expenses As per Moneyboxx"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-600"
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
                {briefBusinessProfile && (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-800 whitespace-pre-wrap font-sans mb-4 shadow-sm">
                    <strong className="text-[#2d3e50] block mb-2 text-sm">Detailed Business Profile & Summary:</strong>
                    {briefBusinessProfile}
                  </div>
                )}
                <p>
                  <strong>Borrower & Vintage Profile:</strong> {applicantName} operates <strong>{firmName}</strong> ({currentCategory.name}) with an established business vintage of <strong>{yearsInBusiness} years</strong>.
                </p>
                <p>
                  <strong>Sales & Cash Flow Waterfall:</strong> The business generates an assessed monthly revenue of <strong>₹{adoptedMonthlySales.toLocaleString('en-IN')}</strong>. Gross profit margin is assessed at <strong>{grossMarginPct}% (₹{grossProfit.toLocaleString('en-IN')})</strong>. After total business operating expenses of <strong>₹{totalOperatingExpenses.toLocaleString('en-IN')}</strong> and household living costs of <strong>₹{householdExpenses.toLocaleString('en-IN')}</strong>, net monthly disposable surplus stands at <strong>₹{(postLoanSurplus + proposedEmi).toLocaleString('en-IN')}</strong>.
                </p>
                <p>
                  <strong>Debt Service Capacity & Policy Compliance:</strong> The requested micro-lending facility of <strong>₹{appliedAmount.toLocaleString('en-IN')}</strong> at {interestRatePct}% for {tenureMonths} months requires a monthly EMI of <strong>₹{proposedEmi.toLocaleString('en-IN')}</strong>. The post-loan DSCR is calculated at <strong>{dscrRatio}x</strong> (policy threshold ≥ 1.25x) with FOIR at <strong>{foirPct}%</strong> (policy cap ≤ 60%), fully satisfying institutional credit guidelines.
                </p>
                <p>
                  <strong>Community Verification:</strong> Local market and neighbor reference checks confirm positive reputation and stable operating history.
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
                <h3 className="font-bold text-sm">Select Business Category ({categoriesList.length} Profiles)</h3>
              </div>
              <button onClick={() => { setIsCategoryModalOpen(false); setIsAddingCategory(false); }} className="text-slate-300 hover:text-white font-bold text-xl">
                &times;
              </button>
            </div>

            {isAddingCategory ? (
              <div className="p-6 overflow-y-auto">
                <h4 className="text-sm font-bold text-slate-800 mb-4">Add Custom Category & Map Products</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category Name *</label>
                    <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]" placeholder="e.g. Mobile Repair Shop" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Industry Group</label>
                    <select value={newCatIndustry} onChange={(e) => setNewCatIndustry(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]">
                      <option value="Retail">Retail</option>
                      <option value="Services">Services</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Wholesale">Wholesale</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Typical Margin Min (%)</label>
                    <input type="number" value={newCatMarginMin} onChange={(e) => setNewCatMarginMin(Number(e.target.value))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Typical Margin Max (%)</label>
                    <input type="number" value={newCatMarginMax} onChange={(e) => setNewCatMarginMax(Number(e.target.value))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]" />
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                    <h5 className="font-bold text-xs text-slate-700">Map Products / Services</h5>
                    <button onClick={() => setNewProducts(prev => [...prev, { id: 'tmp-' + Date.now(), categoryId: '', productName: '', productCategory: 'Add-on', revenueContributionPct: 0, inventoryType: 'FAST_MOVING', averageMarginPct: 15, businessImportance: 'MEDIUM' }])} className="text-xs text-white bg-[#2d3e50] px-2 py-1 rounded hover:bg-[#1e293b] flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add Product
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-600">
                        <tr>
                          <th className="p-2 font-bold">Product Name</th>
                          <th className="p-2 font-bold">Rev Share %</th>
                          <th className="p-2 font-bold">Margin %</th>
                          <th className="p-2 font-bold">Inventory Type</th>
                          <th className="p-2 font-bold">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {newProducts.map((p, idx) => (
                          <tr key={p.id}>
                            <td className="p-2"><input type="text" value={p.productName} onChange={(e) => { const arr = [...newProducts]; arr[idx].productName = e.target.value; setNewProducts(arr); }} className="w-full border border-slate-300 rounded px-2 py-1" placeholder="e.g. Repairs" /></td>
                            <td className="p-2"><input type="number" value={p.revenueContributionPct} onChange={(e) => { const arr = [...newProducts]; arr[idx].revenueContributionPct = Number(e.target.value); setNewProducts(arr); }} className="w-16 border border-slate-300 rounded px-2 py-1" /></td>
                            <td className="p-2"><input type="number" value={p.averageMarginPct} onChange={(e) => { const arr = [...newProducts]; arr[idx].averageMarginPct = Number(e.target.value); setNewProducts(arr); }} className="w-16 border border-slate-300 rounded px-2 py-1" /></td>
                            <td className="p-2">
                              <select value={p.inventoryType} onChange={(e) => { const arr = [...newProducts]; arr[idx].inventoryType = e.target.value as any; setNewProducts(arr); }} className="border border-slate-300 rounded px-2 py-1">
                                <option value="FAST_MOVING">Fast Moving</option>
                                <option value="SLOW_MOVING">Slow Moving</option>
                                <option value="PERISHABLE">Perishable</option>
                                <option value="HIGH_VALUE">High Value</option>
                                <option value="SERVICE">Service</option>
                              </select>
                            </td>
                            <td className="p-2">
                              <button onClick={() => setNewProducts(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 font-bold">&times;</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 mt-4 pt-4">
                  <button onClick={() => setIsAddingCategory(false)} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">Cancel</button>
                  <button onClick={handleAddNewCategory} disabled={!newCatName.trim()} className="px-4 py-2 text-xs font-bold text-white bg-[#eb8a23] rounded-lg hover:bg-[#d97917] disabled:opacity-50">Save Category & Products</button>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0 flex items-center justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      placeholder="Search categories (e.g. Kirana, Hardware, Pharmacy, Garage...)"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb8a23]"
                    />
                  </div>
                  <button onClick={() => setIsAddingCategory(true)} className="shrink-0 flex items-center gap-1 px-3 py-2 bg-[#2d3e50] text-white text-xs font-bold rounded-lg hover:bg-[#1e293b]">
                    <Plus className="w-4 h-4 text-[#eb8a23]" /> Add New
                  </button>
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
              </>
            )}
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
                        <span className="font-bold text-slate-700">Vintage: {app.yearsInBusiness} yrs</span>
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

      {/* AI Chatbot Floating Widget */}
      <div className="fixed bottom-6 left-6 z-50">
        {isChatbotOpen ? (
          <div className="bg-white rounded-2xl shadow-2xl border border-[#eb8a23] w-80 overflow-hidden flex flex-col">
            <div className="bg-[#2d3e50] text-white p-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                 <Sparkles className="w-4 h-4 text-[#eb8a23]" />
                 <span className="font-bold text-sm">AI Autofill Assistant</span>
              </div>
              <button onClick={() => setIsChatbotOpen(false)} className="text-slate-300 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            {pendingAutofillFields ? (
              <div className="p-4 flex flex-col gap-3">
                <p className="text-xs text-slate-600 font-semibold">Please review the fields that will be filled:</p>
                <div className="w-full h-48 overflow-y-auto border border-slate-200 rounded p-2 text-xs bg-slate-50 space-y-2">
                  {Object.entries(pendingAutofillFields).filter(([k]) => !k.startsWith('_')).map(([key, value]) => (
                    <div key={key} className="flex flex-col border-b border-slate-100 pb-1">
                      <span className="font-bold text-slate-700">{key}</span>
                      <span className="text-slate-600">{String(value as any)}</span>
                    </div>
                  ))}
                  {Object.keys(pendingAutofillFields).filter(k => !k.startsWith('_')).length === 0 && (
                    <div className="text-slate-500 italic">No fields extracted.</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setPendingAutofillFields(null)}
                    className="flex-1 bg-slate-200 text-slate-700 font-bold py-2 rounded shadow hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      applyParsedFields(pendingAutofillFields);
                      alert('Autofilled fields based on the pasted profile summary and QnA!');
                      setIsChatbotOpen(false);
                      setChatbotText('');
                      setPendingAutofillFields(null);
                    }}
                    className="flex-1 bg-[#eb8a23] text-white font-bold py-2 rounded shadow hover:bg-[#d67b1a]"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 flex flex-col gap-3">
                <p className="text-xs text-slate-600 font-semibold">Paste the Business Profile Summary & QnA below to autofill form fields:</p>
                <textarea 
                  value={chatbotText} 
                  onChange={(e) => setChatbotText(e.target.value)}
                  className="w-full h-32 p-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-[#eb8a23]" 
                  placeholder="Paste markdown content here..."
                />
                <button 
                  onClick={() => {
                    if (!chatbotText) return;
                    const parsed = getParsedFieldsFromMarkdown(chatbotText);
                    setPendingAutofillFields(parsed);
                  }}
                  className="w-full bg-[#eb8a23] text-white font-bold py-2 rounded shadow hover:bg-[#d67b1a]"
                >
                  Analyze & Preview
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={() => setIsChatbotOpen(true)}
            className="bg-[#2d3e50] text-white p-4 rounded-full shadow-xl hover:scale-105 transition-transform flex items-center justify-center border-2 border-[#eb8a23]"
          >
            <Sparkles className="w-6 h-6 text-[#eb8a23]" />
          </button>
        )}
      </div>



    </div>
  );
};
export default PDToolView;
