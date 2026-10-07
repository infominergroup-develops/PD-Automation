import React, { useState, useMemo, useEffect, useRef } from 'react';
import { INITIAL_CATEGORIES } from '../data/categoriesData';
import { INITIAL_PRODUCTS } from '../data/productsData';

import { api, authFetch, EmployeeRecord } from '../services/api';
import { ClientBank } from '../data/clientBanksData';
import { Company } from './CompanySelectionView';
import { BusinessCategory, CategoryProduct, FamilyMember } from '../types';
import type { ParsedCreditReport } from '../types/creditTypes';
import type { ApplicantRecord, CoApplicant, GalleryApplicant } from '../types/applicant';
import { Field, SUB_LABEL, updateListItem } from './pd/formControls';
import { CaseGalleryModal } from './pd/CaseGalleryModal';
import { sortLatestFirst } from './pd/caseList';
import { PdTabBar, PdTabFooter, isPdTabId, type PdTabId } from './pd/PdTabs';
import {
  EXECUTIVE_SUMMARY_TITLES,
  buildExecutiveSummary,
  describeBusinessVintage,
  describeStaffing,
  type ExecutiveSummary,
  type ExecutiveSummaryInput,
} from '../utils/pdSummaries';
import { DecisionSection } from './pd/DecisionSection';
import { CustomerSupplierSection } from './pd/customerSupplier/CustomerSupplierSection';
import { useCustomerSupplierDetails } from './pd/customerSupplier/useCustomerSupplierDetails';
import { CoApplicantBusinessSection } from './pd/coApplicantBusiness/CoApplicantBusinessSection';
import { toCoApplicantBusinessReport, useCoApplicantBusiness } from './pd/coApplicantBusiness/useCoApplicantBusiness';
import { FieldInvestigationSection } from './pd/fieldInvestigation/FieldInvestigationSection';
import { photoLocation } from './pd/fieldInvestigation/photoEvidence';
import { usePhotoEvidence } from './pd/fieldInvestigation/usePhotoEvidence';
import { GodrejDetailsPanel } from './pd/godrej/GodrejDetailsPanel';
import { useGodrejDetails } from './pd/godrej/useGodrejDetails';
import { openStandardPDReportPrintWindow, PDReportPrintData, toReportContacts } from '../utils/pdReportPrinter';
import { GoogleDriveSaveModal } from './GoogleDriveSaveModal';
import {
  Store, User, DollarSign, Sparkles, CheckCircle2, MapPin, Plus, Trash2, ArrowRight, Building,
  Search, X, Calculator, FileText, Upload, Briefcase, Building2, Zap, Printer, ChevronLeft,
  ChevronRight, Settings, Cloud, CheckCheck
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

// Applies a field edit to one itemized line; editing qty/price/days/unit recomputes the monthly amount and notes.
const updateItemizedLine = (lines: ItemizedCalculationLine[], id: string, field: keyof ItemizedCalculationLine, value: any) =>
  lines.map(line => {
    if (line.id !== id) return line;
    const newLine = { ...line, [field]: value };
    if (['quantity', 'price', 'workingDays', 'unit'].includes(field as string)) {
      const { quantity: q, price: p, workingDays: w, unit: u } = newLine;
      if (!q || !p || !w || !u) {
        newLine.businessNotes = '⚠️ Error: Missing inputs (Qty, Price, Days, or Unit)';
        newLine.monthlyAmount = 0;
      } else {
        newLine.monthlyAmount = Number(q) * Number(p) * Number(w);
        newLine.businessNotes = `${q} ${u} x ₹${p} x ${w} Days`;
      }
    }
    return newLine;
  });

const newItemizedLine = (id: string, unit: string, workingDays: number): ItemizedCalculationLine => ({
  id,
  particulars: '',
  unit,
  quantity: 1,
  price: 0,
  workingDays,
  monthlyAmount: 0
});

// Case status wording differs by lender; options are listed positive → negative → conditional
const POSITIVE_NEGATIVE_STATUS_CLIENTS = ['tata', 'sbfc'];
// Lenders whose report uses only a subset of the form; the rest of the fields are hidden for them
const SLIM_FORM_CLIENTS = ['tata', 'sbfc'];
const RECOMMENDATION_STATUSES = ['Recommended', 'Not Recommended', 'Recommended subject to demerits'];
const POSITIVE_NEGATIVE_STATUSES = ['Positive', 'Negative', 'Refer to Credit'];
const getCaseStatusOptions = (clientId?: string) =>
  POSITIVE_NEGATIVE_STATUS_CLIENTS.includes(clientId || '') ? POSITIVE_NEGATIVE_STATUSES : RECOMMENDATION_STATUSES;

const ITEMIZED_UNITS = ['Litre', 'Kg', 'Piece', 'Box', 'Dozen', 'Quintal', 'Ton'];

const ITEMIZED_ACCENTS = {
  emerald: { icon: 'text-emerald-600', amount: 'text-emerald-700', addButton: 'bg-emerald-600 hover:bg-emerald-700' },
  rose: { icon: 'text-rose-600', amount: 'text-rose-700', addButton: 'bg-rose-600 hover:bg-rose-700' }
};

interface ItemizedLinesTableProps {
  accent: keyof typeof ITEMIZED_ACCENTS;
  title: string;
  subtitle: string;
  headerRight: React.ReactNode;
  firstColumnLabel: string;
  emptyMessage: React.ReactNode;
  notesPlaceholder: string;
  deleteTitle: string;
  addLabel: string;
  lines: ItemizedCalculationLine[];
  onUpdate: (id: string, field: keyof ItemizedCalculationLine, value: any) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}

// Editable Qty × Price × Days table used for both itemized income and itemized expenditure.
const ItemizedLinesTable: React.FC<ItemizedLinesTableProps> = ({
  accent, title, subtitle, headerRight, firstColumnLabel, emptyMessage, notesPlaceholder, deleteTitle, addLabel, lines, onUpdate, onRemove, onAdd
}) => {
  const colors = ITEMIZED_ACCENTS[accent];
  return (
    <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h4 className="text-xs font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2">
            <DollarSign className={`w-4 h-4 ${colors.icon}`} />
            {title}
          </h4>
          <p className="text-[11px] text-slate-500 font-medium">{subtitle}</p>
        </div>

        {headerRight}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-200/70 text-slate-700 font-extrabold uppercase tracking-wider">
            <tr>
              <th className="p-2.5">{firstColumnLabel}</th>
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
            {lines.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-slate-400 italic bg-slate-50/50">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              lines.map((line) => (
                <tr key={line.id} className="hover:bg-slate-50">
                  <td className="p-2">
                    <input
                      type="text"
                      value={line.particulars}
                      onChange={(e) => onUpdate(line.id, 'particulars', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-bold text-[#2d3e50]"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={line.businessNotes || ''}
                      onChange={(e) => onUpdate(line.id, 'businessNotes', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-slate-600"
                      placeholder={notesPlaceholder}
                    />
                  </td>
                  <td className="p-2">
                    <select
                      value={line.unit || ''}
                      onChange={(e) => onUpdate(line.id, 'unit', e.target.value)}
                      className="w-20 px-2 py-1 border border-slate-300 rounded text-xs text-slate-600"
                    >
                      <option value="">Select...</option>
                      {ITEMIZED_UNITS.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                    </select>
                  </td>
                  <td className="p-2 text-right">
                    <input
                      type="number"
                      value={line.quantity || ''}
                      onChange={(e) => onUpdate(line.id, 'quantity', Number(e.target.value))}
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-xs text-right"
                    />
                  </td>
                  <td className="p-2 text-right">
                    <input
                      type="number"
                      value={line.price || ''}
                      onChange={(e) => onUpdate(line.id, 'price', Number(e.target.value))}
                      className="w-20 px-2 py-1 border border-slate-300 rounded text-xs text-right"
                    />
                  </td>
                  <td className="p-2 text-right">
                    <input
                      type="number"
                      value={line.workingDays || ''}
                      onChange={(e) => onUpdate(line.id, 'workingDays', Number(e.target.value))}
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-xs text-right"
                    />
                  </td>
                  <td className="p-2 text-right">
                    <input
                      type="number"
                      value={line.monthlyAmount || 0}
                      onChange={(e) => onUpdate(line.id, 'monthlyAmount', Number(e.target.value))}
                      className={`w-24 px-2 py-1 border border-slate-300 rounded text-xs text-right font-black ${colors.amount}`}
                    />
                  </td>
                  <td className="p-2 text-right font-bold text-slate-600 whitespace-nowrap">
                    ₹{((line.monthlyAmount || 0) * 12).toLocaleString('en-IN')}
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => onRemove(line.id)}
                      className="p-1 text-rose-500 hover:text-rose-700 rounded transition"
                      title={deleteTitle}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center pt-1">
        <button
          onClick={onAdd}
          className={`px-3 py-1.5 ${colors.addButton} text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5`}
        >
          <Plus className="w-3.5 h-3.5" />
          {addLabel}
        </button>
        <div className="text-xs font-bold text-slate-500">
          Direct Monthly Basis
        </div>
      </div>
    </div>
  );
};

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
  // Mirrors the server's role checks: closing, deleting and per-employee stats are management-only
  const isManagement = currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';
  const isAdmin = currentUser?.role === 'ADMIN';

  // Tab 5: Field Investigation photo evidence
  const photoEvidence = usePhotoEvidence();
  const { photos, exifGpsLat, exifGpsLng } = photoEvidence;
  const [isGoogleDriveModalOpen, setIsGoogleDriveModalOpen] = useState(false);

  // Credit Report Extraction State
  const [creditReportType, setCreditReportType] = useState('NONE');
  const [creditReportFiles, setCreditReportFiles] = useState<File[]>([]);
  const [parsedCreditReport, setParsedCreditReport] = useState<ParsedCreditReport | null>(null);
  const [isEditingCreditReport, setIsEditingCreditReport] = useState(false);
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
      const flags: string[] = [];

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

  // Godrej Specific State
  // Godrej-specific Business Profile fields
  const godrej = useGodrejDetails();
  const {
    alternateMobileNumber, applicantQualification, officeAccessibility, tenorRequested, marginsAssessed, customerGstNo,
    industryType, productType, onLoanStructure, machineryDetailsText, keyEmployeeDetailsText, groupCompanyDetailsText,
    financialDetailsText, otherBusinessPremisesText, otherStateGstText, familyInvolvedText, godrejStockLevel,
    godrejRoughStockValue, godrejLocality, godrejOfficeSetup, godrejActivityLevel, godrejOfficeSize, godrejEmployeesSeen,
    godrejThirdPartyConfirmation, godrejCourtCasePending, godrejThirdPartyComment, godrejSeparateDemarcation,
    godrejGstDisplayed, godrejPanCard, godrejGstinLegalName, godrejBusinessRegProof, godrejGstinRegDate,
    godrejElectricityBill, godrejEmployeeRegister, godrejSaleBills, godrejOtherRecords, godrejStrengths,
    godrejWeaknesses, finalStatus,
  } = godrej.values;
  const { setGodrejStrengths, setGodrejWeaknesses } = godrej;
  const [partnersDirectorsDetails, setPartnersDirectorsDetails] = useState('Not applicable');
  const [profitMargin, setProfitMargin] = useState<number | ''>('');

  // Observation Fields

  // Documents Verified Fields

  // Strengths and Weaknesses

  const [applicantsList, setApplicantsList] = useState<GalleryApplicant[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(true);

  // Helper: normalise a raw Firestore applicant document so the UI always
  // sees a consistent `applicantName` field, regardless of which version of the
  // save code wrote the record (old code used `applicantEntity` / nested `formData`).
  const normaliseApplicant = (record: ApplicantRecord): GalleryApplicant => {
    // Legacy documents carry arbitrary extra fields; only the gallery fields below are relied on
    const raw = record as Record<string, any>;
    const formData: Record<string, any> = raw.formData || {};
    const categoryId = raw.categoryId || formData.categoryId;
    const isClosedVal = raw.isClosed !== undefined ? Boolean(raw.isClosed) : (formData.isClosed !== undefined ? Boolean(formData.isClosed) : (raw.status === 'CLOSED' || formData.status === 'CLOSED'));
    return {
      ...raw,
      // Spread legacy nested formData fields so they surface at the top level
      ...formData,
      _id: record._id,
      clientId: record.clientId,
      // Ensure applicantName is always present, falling back to legacy field names
      applicantName:
        raw.applicantName ||
        formData.applicantName ||
        raw.applicantEntity ||
        '',
      // Similarly normalise firmName
      firmName: raw.firmName || formData.firmName || '',
      // Ensure applicationNumber is present
      applicationNumber: raw.applicationNumber || raw.appIdRefNo || '',
      // Case closure & delivery metadata
      isClosed: isClosedVal,
      caseDeliveryStatus: raw.caseDeliveryStatus || formData.caseDeliveryStatus || (isClosedVal ? 'DELIVERED' : 'IN_PROGRESS'),
      closedAt: raw.closedAt || formData.closedAt || null,
      closedBy: raw.closedBy || formData.closedBy || null,
      preparedBy: raw.preparedBy || formData.preparedBy || '',
      bankName: raw.bankName || raw.financialInstitute || formData.financialInstitute || selectedClient?.name || '',
      categoryName: raw.categoryName || categoriesList.find(c => c.id === categoryId)?.name || '',
      riskScore: typeof raw.riskScore === 'number' ? raw.riskScore : undefined,
      updatedAt: raw.updatedAt || formData.updatedAt || raw.createdAt || null,
      createdAt: raw.createdAt || formData.createdAt || null,
    };
  };

  useEffect(() => {
    const fetchApps = async (showLoading = false) => {
      if (!selectedClient?.id) return;
      if (showLoading) setLoadingApplicants(true);

      try {
        const rawData = await api.getApplicants(selectedClient.id);
        // Normalise every record so legacy saves show the correct name
        const data = rawData.map(normaliseApplicant);
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
    }
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
  const [activeTab, setActiveTab] = useState<PdTabId>(() => {
    const saved = localStorage.getItem('lastActiveTab');
    return isPdTabId(saved) ? saved : 'applicant';
  });

  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatbotText, setChatbotText] = useState('');
  const [pendingAutofillFields, setPendingAutofillFields] = useState<any>(null);

  // Editable QnA fields
  const [briefBusinessProfile, setBriefBusinessProfile] = useState('');
  
  // Co-Applicant Business Details States
  const coApplicantBusiness = useCoApplicantBusiness();

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
  const [statusOfCase, setStatusOfCase] = useState<string>('Recommended');

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
  // Itemized Income and Expenditure Lines (Price x Quantity x Days Format)
  const [incomeLines, setIncomeLines] = useState<ItemizedCalculationLine[]>([]);
  const [expenseLines, setExpenseLines] = useState<ItemizedCalculationLine[]>([]);

  // Calculated Itemized Sums
  const itemizedMonthlyIncomeTotal = useMemo(() => {
    return incomeLines.reduce((sum, line) => sum + (line.monthlyAmount || 0), 0);
  }, [incomeLines]);

  const itemizedMonthlyExpenseTotal = useMemo(() => {
    return expenseLines.reduce((sum, line) => sum + (line.monthlyAmount || 0), 0);
  }, [expenseLines]);



  // Handlers for Itemized Income
  const handleUpdateIncomeLine = (id: string, field: keyof ItemizedCalculationLine, value: any) => {
    setIncomeLines(prev => updateItemizedLine(prev, id, field, value));
  };

  const handleAddIncomeLine = () => {
    const newLine = newItemizedLine(`inc-custom-${Date.now()}`, 'Piece', workingDays || 26);
    setIncomeLines(prev => [...prev, newLine]);
  };

  const handleRemoveIncomeLine = (id: string) => {
    setIncomeLines(prev => prev.filter(line => line.id !== id));
  };

  // Handlers for Itemized Expenditure
  const handleUpdateExpenseLine = (id: string, field: keyof ItemizedCalculationLine, value: any) => {
    setExpenseLines(prev => updateItemizedLine(prev, id, field, value));
  };

  const handleAddExpenseLine = () => {
    const newLine = newItemizedLine(`exp-custom-${Date.now()}`, 'Month', workingDays || 26);
    setExpenseLines(prev => [...prev, newLine]);
  };

  const handleRemoveExpenseLine = (id: string) => {
    setExpenseLines(prev => prev.filter(line => line.id !== id));
  };

  // Handlers for Co-Applicant Itemized Income & Expenditures
  const [coAppIncomeLines, setCoAppIncomeLines] = useState<ItemizedCalculationLine[]>([]);
  const [coAppExpenseLines, setCoAppExpenseLines] = useState<ItemizedCalculationLine[]>([]);

  const handleUpdateCoAppIncomeLine = (id: string, field: keyof ItemizedCalculationLine, value: any) => {
    setCoAppIncomeLines(prev => updateItemizedLine(prev, id, field, value));
  };

  const handleAddCoAppIncomeLine = () => {
    const newLine = newItemizedLine(`coapp-inc-${Date.now()}`, 'Month', workingDays || 26);
    setCoAppIncomeLines(prev => [...prev, newLine]);
  };

  const handleRemoveCoAppIncomeLine = (id: string) => {
    setCoAppIncomeLines(prev => prev.filter(line => line.id !== id));
  };

  const handleUpdateCoAppExpenseLine = (id: string, field: keyof ItemizedCalculationLine, value: any) => {
    setCoAppExpenseLines(prev => updateItemizedLine(prev, id, field, value));
  };

  const handleAddCoAppExpenseLine = () => {
    const newLine = newItemizedLine(`coapp-exp-${Date.now()}`, 'Month', workingDays || 26);
    setCoAppExpenseLines(prev => [...prev, newLine]);
  };

  const handleRemoveCoAppExpenseLine = (id: string) => {
    setCoAppExpenseLines(prev => prev.filter(line => line.id !== id));
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
  const [additionalAddresses, setAdditionalAddresses] = useState<string[]>([]);
  const [personsMet, setPersonsMet] = useState<string[]>([]);
  const [personsMetOtherName, setPersonsMetOtherName] = useState('');
  const [personsMetOtherRelation, setPersonsMetOtherRelation] = useState('');
  const [identityProof, setIdentityProof] = useState('Aadhaar Card');
  const [documentsSeen, setDocumentsSeen] = useState<string[]>(['PAN Card', 'Aadhaar Card']);
  const [otherDocumentsSeen, setOtherDocumentsSeen] = useState('');
  const [otherIdentityProof, setOtherIdentityProof] = useState('');
  const [executiveName, setExecutiveName] = useState('');
  const [solarPurposeGeneratedText, setSolarPurposeGeneratedText] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('');

  // NEW STATES FOR VERIFICATION TAB
  const [businessAgeYears, setBusinessAgeYears] = useState<number | ''>('');
  const [businessAgeApprox, setBusinessAgeApprox] = useState(false);
  const [previousOccupation, setPreviousOccupation] = useState('');
  const [previousOccupationOther, setPreviousOccupationOther] = useState('');
  const [reasonToLeave, setReasonToLeave] = useState('');
  const [externalStaffCount, setExternalStaffCount] = useState(0);
  const [tataCapitalDistance, setTataCapitalDistance] = useState('');
  const [businessManagedBy, setBusinessManagedBy] = useState<string[]>([]);
  const [businessManagedByOther, setBusinessManagedByOther] = useState('');
  const [premiseOwnership, setPremiseOwnership] = useState('');
  const [premiseOwnershipOther, setPremiseOwnershipOther] = useState('');

  // Default wording for "1. Vintage" and "2. Number of Staffs" until the user edits it
  const vintageSummary = describeBusinessVintage({
    years: businessAgeYears,
    approximate: businessAgeApprox,
    previousOccupation,
    previousOccupationOther,
    reasonToLeave,
  });
  const staffingSummary = describeStaffing({
    externalStaffCount,
    managedBy: businessManagedBy,
    managedByOther: businessManagedByOther,
  });
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
  const [electricitySupplierName, setElectricitySupplierName] = useState('');
  const [electricityMonthlyExpense, setElectricityMonthlyExpense] = useState<number | ''>('');
  const [hasResElectricityConnection, setHasResElectricityConnection] = useState('Not Provided');
  const [resElectricityConnectionType, setResElectricityConnectionType] = useState('');
  const [resElectricityConnectionTypeOther, setResElectricityConnectionTypeOther] = useState('');
  const [resElectricityConsumerNumber, setResElectricityConsumerNumber] = useState('');
  const [resElectricitySupplierName, setResElectricitySupplierName] = useState('');
  const [resElectricityMonthlyExpense, setResElectricityMonthlyExpense] = useState<number | ''>('');
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
  // Tab 4: Customer & Supplier Details
  const customerSupplier = useCustomerSupplierDetails();
  const {
    prominentCustomers, prominentSuppliers, bankingDetails, existingLoans, currentObligation,
    hasCollateral, collateralAddress, collateralPropertyType, collateralPropertyArea, collateralPropertyUsage,
    collateralValuation, collateralRemarks, businessLongitudeRemarks,
  } = customerSupplier;

  // NEW STATES FOR COLLATERAL PROPERTY (Ambit)
  const [businessNeighbourName, setBusinessNeighbourName] = useState('');
  const [businessNeighbourFeedback, setBusinessNeighbourFeedback] = useState('Neighbour verification was conducted, wherein neighbours confirmed that the applicant has been engaged in his stated business for a considerable period, indicating business stability. The feedback received was positive regarding his work, and overall reputation in the locality.');
  const [businessStatus, setBusinessStatus] = useState('Recommended');

  const handleStatusChange = (val: string) => {
    setStatusOfCase(val);
    setBusinessStatus(val);
  };

  // Tata / SBFC use a slimmed-down form: only the fields their shared report prints are shown
  const isSlimForm = SLIM_FORM_CLIENTS.includes((selectedClient?.id || '').toLowerCase());

  // Keep the saved status within the selected lender's options (e.g. Recommended → Positive for Tata / SBFC)
  const caseStatusOptions = getCaseStatusOptions(selectedClient?.id);
  useEffect(() => {
    if (caseStatusOptions.includes(statusOfCase)) return;
    const otherOptions = caseStatusOptions === POSITIVE_NEGATIVE_STATUSES ? RECOMMENDATION_STATUSES : POSITIVE_NEGATIVE_STATUSES;
    const idx = otherOptions.indexOf(statusOfCase);
    handleStatusChange(caseStatusOptions[idx >= 0 ? idx : 0]);
  }, [caseStatusOptions, statusOfCase]);

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


  const [neighborName, setNeighborName] = useState('');
  const [neighborFeedback, setNeighborFeedback] = useState('');
  const [landlordFeedback, setLandlordFeedback] = useState('');

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
  const [existingEmiNotes, setExistingEmiNotes] = useState('');
  const [householdExpensesNotes, setHouseholdExpensesNotes] = useState('');
  const [comfortableEmiNotes, setComfortableEmiNotes] = useState('');
  const [solarPurposeUsage, setSolarPurposeUsage] = useState('');
  const [riskFactor, setRiskFactor] = useState('');

  // Co-Applicant Financial Assessment State
  const [coAppStatedMonthlySales, setCoAppStatedMonthlySales] = useState(0);
  const [coAppSalariesExpense, setCoAppSalariesExpense] = useState(0);
  const [coAppRentExpense, setCoAppRentExpense] = useState(0);
  const [coAppUtilitiesExpense, setCoAppUtilitiesExpense] = useState(0);
  const [coAppMiscExpense, setCoAppMiscExpense] = useState(0);

  // Total Existing EMIs
  const existingEmis = useMemo(() => {
    return (existingLoans || []).reduce((sum, loan) => sum + (Number(loan?.emi) || 0), 0);
  }, [existingLoans]);

  const generatedExistingEmiNotes = useMemo(() => {
    const validLoans = (existingLoans || []).filter(l => l?.typeOfLoan && l.typeOfLoan !== 'NA' && String(l.typeOfLoan).trim() !== '');
    if (validLoans.length > 0) {
      return `Existing obligations include ${validLoans.map(l => `${l.typeOfLoan} from ${l.financerName || 'Unknown'} (EMI: ₹${l.emi || 0})`).join(', ')}.`;
    }
    return 'As per applicant no any existing obligation.';
  }, [existingLoans]);

  const handleDeleteApplication = async (appIdOrNumber: string) => {
    if (isManagement && window.confirm(`MANAGER ACTION: Are you sure you want to delete application ${appIdOrNumber}?`)) {
      // Match by _id first (most reliable), then fall back to applicationNumber
      const applicantToDelete =
        applicantsList.find(a => a._id === appIdOrNumber) ||
        applicantsList.find(a => a.applicationNumber === appIdOrNumber);

      if (applicantToDelete && applicantToDelete._id && selectedClient) {
        try {
          await api.deleteApplicant(selectedClient.id, applicantToDelete._id);
        } catch (error) {
          console.error("Failed to delete applicant from DB", error);
        }
      }

      // Remove optimistically from local state, then re-fetch to ensure list is accurate
      setApplicantsList(prev =>
        prev.filter(a => a._id !== applicantToDelete?._id && a.applicationNumber !== appIdOrNumber)
      );

      // Re-fetch fresh list from Firestore after a brief moment
      if (selectedClient?.id) {
        setTimeout(async () => {
          try {
            const rawData = await api.getApplicants(selectedClient.id);
            setApplicantsList(rawData.map(normaliseApplicant));
          } catch (e) {
            console.error('Failed to refresh applicants after delete', e);
          }
        }, 500);
      }

      setLoadedToastMessage(`Deleted applicant ${appIdOrNumber}`);
      setTimeout(() => setLoadedToastMessage(null), 3000);
    }
  };

  const handleDeleteAllApplicants = async () => {
    if (!window.confirm(`⚠️ DANGER: This will permanently delete ALL applicants from the database across ALL clients. This action cannot be undone.\n\nAre you absolutely sure?`)) return;
    try {
      const result = await api.deleteAllApplicants();
      setApplicantsList([]);
      setActiveAppId(null);
      activeAppIdRef.current = null;
      lastSavedStrRef.current = '';
      setLoadedToastMessage(`✅ Permanently deleted ${result.deletedCount} applicants from database.`);
      setTimeout(() => setLoadedToastMessage(null), 5000);
    } catch (err) {
      console.error('Failed to delete all applicants:', err);
      alert('Failed to delete all applicants. Check console.');
    }
  };

  // TOGGLE CLOSE / REOPEN CASE (Manager / Admin only)
  const handleToggleCloseCase = async (app: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isManagement) {
      alert('Restricted: Only Managers and Admins can mark cases as closed or reopen them.');
      return;
    }

    const isCurrentlyClosed = Boolean(app.isClosed || app.status === 'CLOSED' || app.caseDeliveryStatus === 'DELIVERED');
    const newClosedState = !isCurrentlyClosed;
    const nowIso = new Date().toISOString();
    const actorName = currentUser?.name || currentUser?.email || (currentUser?.role === 'ADMIN' ? 'Admin' : 'Manager');

    const updatePayload = {
      isClosed: newClosedState,
      status: newClosedState ? 'CLOSED' : 'IN_PROGRESS',
      caseDeliveryStatus: newClosedState ? 'DELIVERED' : 'IN_PROGRESS',
      closedAt: newClosedState ? nowIso : null,
      closedBy: newClosedState ? actorName : null,
      updatedAt: nowIso
    };

    // Optimistically update local list state
    setApplicantsList(prev => prev.map(a => {
      const isMatch = (a._id && a._id === app._id) || (a.applicationNumber && a.applicationNumber === app.applicationNumber);
      return isMatch ? { ...a, ...updatePayload } : a;
    }));

    if (selectedClient?.id && app._id) {
      try {
        await api.updateApplicant(selectedClient.id, app._id, updatePayload);
      } catch (err) {
        console.error('Failed to update case closure status on server:', err);
      }
    }

    setLoadedToastMessage(
      newClosedState
        ? `✅ Case #${app.applicationNumber || app.applicantName} marked as CLOSED & Delivered to Client.`
        : `🔄 Case #${app.applicationNumber || app.applicantName} Re-opened for Editing.`
    );
    setTimeout(() => setLoadedToastMessage(null), 4000);
  };

  // CREATE NEW APPLICANT
  const handleCreateNewApplicant = async () => {
    if (!selectedClient) return;

    // handleLoadSampleApp falls back to the blank-form default for every field not listed here;
    // these are the only fields whose new-application value differs from (or bypasses) that fallback.
    const newApplicant = {
      _id: null,
      categoryId: 'kirana',
      tenureMonths: 0,
      aataChakkiData: {
        machines: [],
        attaChakki: { size: '', capacity: '', wheatKg: '', charge: '' },
        kohlu: { boltDetails: '', mustardKg: '', charge: '', khaliKg: '', khaliRate: '' },
        dhanPolisher: { size: '', paddyKg: '', charge: '', bhusiKg: '', ricePolishKg: '', bhusiRate: '', ricePolishRate: '' },
        masalaMachine: { size: '', masalaKg: '', charge: '' },
        powerSource: 'Diesel',
        powerDetails: { consumption: '', rate: '' }
      },
    };
    try {
      setActiveAppId(null);
      activeAppIdRef.current = null;
      isCreatingNewAppRef.current = false;
      lastSavedStrRef.current = ''; // reset so auto-save detects the new blank state
      handleLoadSampleApp(newApplicant);
      setLoadedToastMessage(`Started new draft application`);
      setTimeout(() => setLoadedToastMessage(null), 3000);
    } catch (err) {
      console.error('Failed to init new applicant', err);
    }
  };

  // 1-CLICK LOAD APPLICATION HANDLER
  const handleLoadSampleApp = (dbApp: any) => {
    let app = { ...dbApp, ...(dbApp.formData || {}) };
    let isRecovered = false;

    // Attempt to recover offline draft if it exists
    try {
      if (dbApp._id) {
        const draftStr = localStorage.getItem(`offline_draft_${dbApp._id}`);
        if (draftStr) {
          const draftData = JSON.parse(draftStr);
          app = { ...app, ...draftData }; // Merge draft over DB
          isRecovered = true;
        }
      }
    } catch (e) {
      console.error('Failed to parse offline draft', e);
    }

    handleSelectCategory(app.categoryId || selectedCategoryId || 'kirana');
    
    // Support legacy and top-level field names from saves
    setApplicantName(app.applicantName || app.applicantEntity || '');
    setMobileNumber(app.mobileNumber || app.contactNo || '');
    setPanNumber(app.panNumber || '');
    setResidenceAddress(app.residenceAddress || '');
    setResidenceOwnership(app.residenceOwnership || 'OWN');
    setYearsAtResidence(app.yearsAtResidence !== undefined ? app.yearsAtResidence : 0);
    setFamilyMembers(app.familyMembers || []);
    setBusinessRemark(app.businessRemark || '');
    setDependentsCount(app.dependentsCount !== undefined ? app.dependentsCount : 0);
    setFirmName(app.firmName || '');
    setNoFormalBusinessName(app.firmName === 'No formal business name' || !!app.noFormalBusinessName);
    setConstitution(app.constitution || 'Proprietorship');
    setYearsInBusiness(app.yearsInBusiness !== undefined ? app.yearsInBusiness : 0);
    setBusinessAgeYears(app.businessAgeYears !== undefined ? app.businessAgeYears : '');
    setBusinessAgeApprox(!!app.businessAgeApprox);
    setPreviousOccupation(app.previousOccupation || '');
    setPreviousOccupationOther(app.previousOccupationOther || '');
    setReasonToLeave(app.reasonToLeave || '');
    setShopOwnership(app.shopOwnership || 'OWN');
    setMonthlyRent(app.monthlyRent !== undefined ? app.monthlyRent : 0);
    setShopAreaSqFt(app.shopAreaSqFt !== undefined ? app.shopAreaSqFt : 0);
    setInventoryValue(app.inventoryValue !== undefined ? app.inventoryValue : 0);
    setDailyFootfall(app.dailyFootfall !== undefined ? app.dailyFootfall : 0);
    setAvgTicketValue(app.avgTicketValue !== undefined ? app.avgTicketValue : 0);
    setWorkingDays(app.workingDays !== undefined ? app.workingDays : 0);

    // Godrej Specific State


    // Investigation & Feedback
    setNeighborName(app.neighborName || '');
    setNeighborFeedback(app.neighborFeedback || '');
    setLandlordFeedback(app.landlordFeedback || '');
    if (app.aataChakkiData) {
      setAataChakkiData(app.aataChakkiData);
    }
    setAppliedAmount(app.appliedAmount !== undefined ? app.appliedAmount : (app.loanAmount !== undefined ? app.loanAmount : 0));
    setTenureMonths(app.tenureMonths !== undefined ? app.tenureMonths : 12);
    setInterestRatePct(app.interestRatePct !== undefined ? app.interestRatePct : 12);
    setStatedMonthlySales(app.statedMonthlySales !== undefined ? app.statedMonthlySales : 0);
    setCogsMarginPct(app.cogsMarginPct !== undefined ? app.cogsMarginPct : 0);
    setSalariesExpense(app.salariesExpense !== undefined ? app.salariesExpense : 0);
    setUtilitiesExpense(app.utilitiesExpense !== undefined ? app.utilitiesExpense : 0);
    setTransportExpense(app.transportExpense !== undefined ? app.transportExpense : 0);
    setMiscExpense(app.miscExpense !== undefined ? app.miscExpense : 0);
    setOtherIncome(app.otherIncome !== undefined ? app.otherIncome : 0);
    setHouseholdExpenses(app.householdExpenses !== undefined ? app.householdExpenses : 0);
    setExistingEmiNotes(app.existingEmiNotes || '');
    setHouseholdExpensesNotes(app.householdExpensesNotes || '');
    setComfortableEmiNotes(app.comfortableEmiNotes || '');
    setSolarPurposeUsage(app.solarPurposeUsage || '');
    setRiskFactor(app.riskFactor || '');


    setIncomeLines(app.incomeLines || []);
    setExpenseLines(app.expenseLines || []);
    if (app.productsList && Array.isArray(app.productsList)) {
      setProductsList(app.productsList);
    }

    setCoAppIncomeLines(app.coAppIncomeLines || []);
    setCoAppExpenseLines(app.coAppExpenseLines || []);
    setCoAppStatedMonthlySales(app.coAppStatedMonthlySales !== undefined ? app.coAppStatedMonthlySales : 0);
    setCoAppSalariesExpense(app.coAppSalariesExpense !== undefined ? app.coAppSalariesExpense : 0);
    setCoAppRentExpense(app.coAppRentExpense !== undefined ? app.coAppRentExpense : 0);
    setCoAppUtilitiesExpense(app.coAppUtilitiesExpense !== undefined ? app.coAppUtilitiesExpense : 0);
    setCoAppMiscExpense(app.coAppMiscExpense !== undefined ? app.coAppMiscExpense : 0);

    setCaseInitiationDate(app.caseInitiationDate || new Date().toISOString().split('T')[0]);
    setVisitDate(app.visitDate || new Date().toISOString().split('T')[0]);
    setReportDate(app.reportDate || new Date().toISOString().split('T')[0]);

    if (app.coApplicants && Array.isArray(app.coApplicants)) {
      setCoApplicants(app.coApplicants);
    } else if (app.hasCoApplicant) {
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

    setHasFemaleCandidate(!!app.hasFemaleCandidate);
    setFemaleCandidateName(app.femaleCandidateName || '');
    setFemaleCandidateRelation(app.femaleCandidateRelation || 'Spouse');
    setFemaleCandidateOtherRelation(app.femaleCandidateOtherRelation || '');
    setLoanType(app.loanType || 'Commercial Solar Loan');
    setOtherLoanType(app.otherLoanType || '');
    setPowerSource(app.powerSource || 'Electricity');
    setOtherPowerSource(app.otherPowerSource || '');
    setMonthlyEnergyExpense(app.monthlyEnergyExpense !== undefined ? app.monthlyEnergyExpense : '');
    setOtherSolarPurpose(app.otherSolarPurpose || '');
    setSolarPurposeGeneratedText(app.solarPurposeGeneratedText || '');
    setLoanPurpose(app.loanPurpose || app.endUseOfLoan || app.solarPurposeGeneratedText || '');

    setBusinessAddress(app.businessAddress || '');
    setAdditionalAddresses(app.additionalAddresses || []);
    setPersonsMet(app.personsMet || []);
    setPersonsMetOtherName(app.personsMetOtherName || '');
    setPersonsMetOtherRelation(app.personsMetOtherRelation || '');
    setIdentityProof(app.identityProof || 'Aadhaar Card');
    setDocumentsSeen(app.documentsSeen || ['PAN Card', 'Aadhaar Card']);
    setOtherDocumentsSeen(app.otherDocumentsSeen || '');
    setOtherIdentityProof(app.otherIdentityProof || '');
    setExecutiveName(app.executiveName || '');
    setTataCapitalDistance(app.tataCapitalDistance || '');

    setExternalStaffCount(app.externalStaffCount !== undefined ? app.externalStaffCount : 0);
    setBusinessManagedBy(app.businessManagedBy || []);
    setBusinessManagedByOther(app.businessManagedByOther || '');
    setPremiseOwnership(app.premiseOwnership || '');
    setPremiseOwnershipOther(app.premiseOwnershipOther || '');
    setBusinessAssets(app.businessAssets || []);
    setHasStock(app.hasStock !== undefined ? app.hasStock : true);
    setStockDetails(app.stockDetails || []);
    setCurrentAssets(app.currentAssets || []);
    setCurrentAssetsOther(app.currentAssetsOther || '');
    setBusinessIncomeAssetCreation(!!app.businessIncomeAssetCreation);
    setCreatedAssets(app.createdAssets || []);
    setCreatedAssetsOther(app.createdAssetsOther || '');
    setOtherHouseholdExpenses(!!app.otherHouseholdExpenses);
    setOtherHouseholdExpensesDesc(app.otherHouseholdExpensesDesc || '');
    setInitialInvestment(app.initialInvestment !== undefined ? app.initialInvestment : '');
    setInvestmentSource(app.investmentSource || '');
    setInvestmentSourceOther(app.investmentSourceOther || '');
    setHasAgricultureLand(!!app.hasAgricultureLand);
    setAgriLandArea(app.agriLandArea !== undefined ? app.agriLandArea : '');
    setAgriLandUnit(app.agriLandUnit || 'Bigha');
    setAgriLandOwnership(app.agriLandOwnership || 'Self-owned');
    setAgriLandOwnershipOther(app.agriLandOwnershipOther || '');
    setAgriCrops(app.agriCrops || []);
    setAgriCropsOther(app.agriCropsOther || '');
    setAgriIncomeMin(app.agriIncomeMin !== undefined ? app.agriIncomeMin : '');
    setAgriIncomeMax(app.agriIncomeMax !== undefined ? app.agriIncomeMax : '');
    setAgriOwnershipDoc(app.agriOwnershipDoc || 'Not Provided');
    setHasOtherIncome(!!app.hasOtherIncome);
    setOtherIncomeSources(app.otherIncomeSources || []);
    setExpectedSolarCostReductionPct(app.expectedSolarCostReductionPct !== undefined ? app.expectedSolarCostReductionPct : '');
    setExpectedSolarMonthlySaving(app.expectedSolarMonthlySaving !== undefined ? app.expectedSolarMonthlySaving : '');
    setMeetingAddressSource(app.meetingAddressSource || 'RESIDENCE');
    setMeetingAddress(app.meetingAddress || '');
    setLocatingPremisesType(app.locatingPremisesType || '');
    setLocatingPremisesTypeOther(app.locatingPremisesTypeOther || '');
    setPropertyOwnership(app.propertyOwnership || '');
    setPropertyOwnershipOther(app.propertyOwnershipOther || '');
    setPropertyRentAmount(app.propertyRentAmount !== undefined ? app.propertyRentAmount : '');
    setPropertyOwnerName(app.propertyOwnerName || '');
    setPropertyArea(app.propertyArea !== undefined ? app.propertyArea : '');
    setPropertyValue(app.propertyValue !== undefined ? app.propertyValue : '');
    setPropertyOwnershipDoc(app.propertyOwnershipDoc || 'Not Provided');
    setHouseFloors(app.houseFloors !== undefined ? app.houseFloors : '');
    setHouseRooms(app.houseRooms !== undefined ? app.houseRooms : '');
    setHouseStructureType(app.houseStructureType || '');
    setHouseStructureTypeOther(app.houseStructureTypeOther || '');
    setHouseFloorPosition(app.houseFloorPosition || '');
    setHouseFloorPositionOther(app.houseFloorPositionOther || '');
    setHouseAdditionalDetails(app.houseAdditionalDetails || '');
    setMonthlyHouseholdExpensesAmount(app.monthlyHouseholdExpensesAmount !== undefined ? app.monthlyHouseholdExpensesAmount : '');
    setHasElectricityConnection(app.hasElectricityConnection || 'Not Provided');
    setElectricityConnectionType(app.electricityConnectionType || '');
    setElectricityConnectionTypeOther(app.electricityConnectionTypeOther || '');
    setElectricityConsumerNumber(app.electricityConsumerNumber || '');
    setElectricityMonthlyExpense(app.electricityMonthlyExpense !== undefined ? app.electricityMonthlyExpense : '');
    setHasResElectricityConnection(app.hasResElectricityConnection || 'Not Provided');
    setResElectricityConnectionType(app.resElectricityConnectionType || '');
    setResElectricityConnectionTypeOther(app.resElectricityConnectionTypeOther || '');
    setResElectricityConsumerNumber(app.resElectricityConsumerNumber || '');
    setResElectricityMonthlyExpense(app.resElectricityMonthlyExpense !== undefined ? app.resElectricityMonthlyExpense : '');
    setNeighbors(app.neighbors || []);
    setNeighborVerificationConducted(!!app.neighborVerificationConducted);
    setNeighborResidenceConfirmed(app.neighborResidenceConfirmed || '');
    setNeighborBehaviourFeedback(app.neighborBehaviourFeedback || '');
    setNeighborNegativeFeedback(!!app.neighborNegativeFeedback);
    setNeighborNegativeDetails(app.neighborNegativeDetails || '');
    setGpsLat(app.gpsLat !== undefined ? app.gpsLat : '');
    setGpsLng(app.gpsLng !== undefined ? app.gpsLng : '');
    setResidenceStatus(app.residenceStatus || '');
    setResidenceStatusReason(app.residenceStatusReason || '');

    customerSupplier.load(app);
    godrej.load(app);
    photoEvidence.load(app);
    coApplicantBusiness.load(app);
    setPartnersDirectorsDetails(app.partnersDirectorsDetails || 'Not applicable');
    setProfitMargin(app.profitMargin !== undefined ? app.profitMargin : '');
    setBusinessNeighbourName(app.businessNeighbourName || '');
    const initialStatus = app.statusOfCase || app.businessStatus || 'Recommended';
    setBusinessStatus(initialStatus);
    setStatusOfCase(initialStatus);

    setHasAdditionalBusiness(!!app.hasAdditionalBusiness);
    setAdditionalBusinessAddress(app.additionalBusinessAddress || '');
    setAdditionalBusinessIncomeAssessment(app.additionalBusinessIncomeAssessment || '');

    setBriefBusinessProfile(app.briefBusinessProfile || '');

    setBusinessVintageText(app.businessVintageText || '');
    setStaffCountText(app.staffCountText || '');
    setPremiseOwnershipText(app.premiseOwnershipText || '');
    setFactoryInfrastructureText(app.factoryInfrastructureText || '');
    setStockDetailsValueText(app.stockDetailsValueText || '');
    setFixedAndCurrentAssetAnalysisText(app.fixedAndCurrentAssetAnalysisText || '');
    setAssetCreationText(app.assetCreationText || '');
    setBusinessInvestmentText(app.businessInvestmentText || '');
    setAgriculturalIncomeText(app.agriculturalIncomeText || '');
    setSolarSavingText(app.solarSavingText || '');
    setProjectedIncomeText(app.projectedIncomeText || '');


    setActiveAppNumber(app.applicationNumber || '');
    setActiveAppId(app._id || null);
    activeAppIdRef.current = app._id || null;
    if (app._id) {
      localStorage.setItem('lastActiveAppId', app._id);
    }

    if (isRecovered) {
      setLoadedToastMessage(`Application #${app.applicationNumber} recovered from unsaved offline draft for ${app.applicantName}.`);
    } else {
      setLoadedToastMessage(`Application #${app.applicationNumber || 'Draft'} loaded for ${app.applicantName || 'Applicant'} (${app.firmName || 'Business'}). All sections updated.`);
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
    applicantName, mobileNumber, panNumber, residenceAddress, residenceOwnership, yearsAtResidence, familyMembers,
    dependentsCount, firmName, noFormalBusinessName, constitution, yearsInBusiness, shopOwnership, monthlyRent, businessRemark,
    shopAreaSqFt, inventoryValue, dailyFootfall, avgTicketValue, workingDays, neighborName, neighborFeedback,
    landlordFeedback, ...photoEvidence.values, appliedAmount, tenureMonths, interestRatePct, statedMonthlySales, cogsMarginPct,
    salariesExpense, utilitiesExpense, transportExpense, miscExpense, otherIncome, householdExpenses, existingEmis,
    existingEmiNotes, householdExpensesNotes, comfortableEmiNotes, solarPurposeUsage, riskFactor,
    incomeLines, expenseLines, productsList,
    caseInitiationDate, visitDate, reportDate, coApplicants,
    hasFemaleCandidate, femaleCandidateName, femaleCandidateRelation, femaleCandidateOtherRelation, loanType, otherLoanType,
    powerSource, otherPowerSource, monthlyEnergyExpense, solarPurposes, otherSolarPurpose, solarPurposeGeneratedText, loanPurpose,
    businessAddress,
    additionalAddresses,
    personsMet, personsMetOtherName, personsMetOtherRelation, identityProof, documentsSeen, otherDocumentsSeen, otherIdentityProof, executiveName, tataCapitalDistance,
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
    hasResElectricityConnection, resElectricityConnectionType, resElectricityConnectionTypeOther, resElectricityConsumerNumber, resElectricityMonthlyExpense,
    neighbors, neighborVerificationConducted, neighborResidenceConfirmed, neighborBehaviourFeedback, neighborNegativeFeedback,
    neighborNegativeDetails, gpsLat, gpsLng, residenceStatus, residenceStatusReason,
    aataChakkiData,
    ...customerSupplier.values,
    businessNeighbourName,
    businessNeighbourFeedback, businessStatus,
    hasAdditionalBusiness, additionalBusinessAddress, additionalBusinessIncomeAssessment,
    briefBusinessProfile, businessVintageText, staffCountText, premiseOwnershipText, factoryInfrastructureText,
    stockDetailsValueText, fixedAndCurrentAssetAnalysisText, assetCreationText, businessInvestmentText, agriculturalIncomeText,
    solarSavingText, projectedIncomeText, statusOfCase,
    ...coApplicantBusiness.values,
    coAppIncomeLines, coAppExpenseLines, coAppStatedMonthlySales, coAppSalariesExpense, coAppRentExpense,
    coAppUtilitiesExpense, coAppMiscExpense,
    ...godrej.values,
    categoryId: selectedCategoryId,
    // Always persist these top-level indexing fields so gallery/search works correctly
    applicationNumber: activeAppNumber,
    financialInstitute: selectedClient?.name || '',
    clientId: selectedClient?.id || ''
  };

  // Ref to prevent concurrent auto-create calls for new applicants
  const isCreatingNewAppRef = useRef(false);

  useEffect(() => {
    if (!selectedClient?.id) return;

    // Auto-save loop that checks for changes every 1.5 seconds independently of state re-renders
    const interval = setInterval(() => {
      if (!updateDataRef.current) return;

      const currentData = updateDataRef.current;
      const currentStr = JSON.stringify(currentData);
      
      const currentAppId = activeAppIdRef.current;

      // Save local draft as a fallback instantly
      const storageKey = currentAppId ? `offline_draft_${currentAppId}` : 'offline_draft_new';
      localStorage.setItem(storageKey, currentStr);

      if (lastSavedStrRef.current !== currentStr) {
        lastSavedStrRef.current = currentStr;
        
        if (currentAppId) {
          // Update existing record in DB
          api.updateApplicant(selectedClient.id, currentAppId, { ...currentData, _id: currentAppId })
            .then((rawSaved) => {
              const savedApp = normaliseApplicant(rawSaved);
              localStorage.removeItem(storageKey); // clear on successful save
              // Sync with applicantsList so UI updates immediately
              setApplicantsList(prev => {
                const exists = prev.some(a => a._id === savedApp._id);
                if (exists) return prev.map(a => a._id === savedApp._id ? savedApp : a);
                return [savedApp, ...prev];
              });
            })
            .catch(err => console.error('Failed to auto-save:', err));
        } else if (currentData.applicantName && currentData.applicantName.trim() && !isCreatingNewAppRef.current) {
          // Auto-create a new DB record once the applicant has a name
          isCreatingNewAppRef.current = true;
          const payload = {
            ...currentData,
            applicantName: currentData.applicantName.trim(),
            financialInstitute: selectedClient.name,
          };
          api.createApplicant(selectedClient.id, payload)
            .then((rawSaved) => {
              const savedApp = normaliseApplicant(rawSaved);
              if (savedApp && savedApp._id) {
                setActiveAppId(savedApp._id);
                activeAppIdRef.current = savedApp._id;
                localStorage.removeItem('offline_draft_new');
                setApplicantsList(prev => {
                  const exists = prev.some(a => a._id === savedApp._id);
                  if (exists) return prev;
                  return [savedApp, ...prev];
                });
              }
            })
            .catch(err => console.error('Failed to auto-create applicant:', err))
            .finally(() => { isCreatingNewAppRef.current = false; });
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [selectedClient?.id]);

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
      setBriefBusinessProfile(prev => {
        if (prev === profileText) return prev;
        return profileText;
      });
    }

  }, [aataChakkiData, currentCategory, workingDays, applicantName, firmName, yearsInBusiness, shopOwnership, shopAreaSqFt]);

  // Search Results for Autocomplete Dropdown - sorted latest first
  const searchedApplications = useMemo(() => {
    let list = applicantsList;
    if (appSearchQuery.trim()) {
      const query = appSearchQuery.toLowerCase();
      list = list.filter(app =>
        app.applicationNumber?.toLowerCase().includes(query) ||
        app.applicantName?.toLowerCase().includes(query) ||
        app.firmName?.toLowerCase().includes(query)
      );
    }
    return sortLatestFirst(list);
  }, [appSearchQuery, applicantsList]);



  // Computed Field Investigation Cross-Check Sales
  const crossCheckMonthlySales = useMemo(() => {
    return dailyFootfall * avgTicketValue * workingDays;
  }, [dailyFootfall, avgTicketValue, workingDays]);

  // Adopted Monthly Turnover (Min of Stated and Cross-Check, or fallback to Itemized Income)
  const adoptedMonthlySales = useMemo(() => {
    // If cross check is 0 (not filled out), fallback to stated sales.
    const baseSales = crossCheckMonthlySales > 0
      ? Math.min(statedMonthlySales, crossCheckMonthlySales)
      : statedMonthlySales;

    // If there's an itemized income calculation (like Aata Chakki), ensure we don't drop below it
    // Or if stated is 0 but they filled the itemized income lines, use itemized income
    return Math.max(baseSales, itemizedMonthlyIncomeTotal || 0);
  }, [statedMonthlySales, crossCheckMonthlySales, itemizedMonthlyIncomeTotal]);

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
    return Math.max(0, grossProfit - totalOperatingExpenses);
  }, [grossProfit, totalOperatingExpenses]);

  // Effective Tenure Months (Parses Godrej 'Tenor Requested' if available)
  const effectiveTenureMonths = useMemo(() => {
    let n = tenureMonths;
    if (tenorRequested) {
      const match = tenorRequested.match(/\d+/);
      if (match) n = parseInt(match[0], 10);
    }
    return n;
  }, [tenureMonths, tenorRequested]);

  // Co-applicant Business Income Assessment calculations
  const hasCoAppInBusiness = useMemo(() => {
    return coApplicants.some(c => c.profession === 'Business' || (c as any).inBusiness === true);
  }, [coApplicants]);

  const coAppBusinessPerson = useMemo(() => {
    return coApplicants.find(c => c.profession === 'Business' || (c as any).inBusiness === true);
  }, [coApplicants]);

  const coAppItemizedMonthlyIncomeTotal = useMemo(() => {
    return coAppIncomeLines.reduce((sum, line) => sum + (line.monthlyAmount || 0), 0);
  }, [coAppIncomeLines]);

  const coAppItemizedMonthlyExpenseTotal = useMemo(() => {
    return coAppExpenseLines.reduce((sum, line) => sum + (line.monthlyAmount || 0), 0);
  }, [coAppExpenseLines]);

  const coAppAdoptedMonthlySales = useMemo(() => {
    return Math.max(coAppStatedMonthlySales, coAppItemizedMonthlyIncomeTotal || 0);
  }, [coAppStatedMonthlySales, coAppItemizedMonthlyIncomeTotal]);

  const coAppTotalOperatingExpenses = useMemo(() => {
    if (coAppExpenseLines.length > 0 && coAppExpenseLines.some(l => (Number(l.monthlyAmount) || 0) > 0)) {
      return coAppExpenseLines.reduce((sum, line) => sum + (Number(line.monthlyAmount) || 0), 0);
    }
    return coAppSalariesExpense + coAppRentExpense + coAppUtilitiesExpense + coAppMiscExpense;
  }, [coAppExpenseLines, coAppSalariesExpense, coAppRentExpense, coAppUtilitiesExpense, coAppMiscExpense]);

  const coAppNetBusinessIncome = useMemo(() => {
    return Math.max(0, coAppAdoptedMonthlySales - coAppTotalOperatingExpenses);
  }, [coAppAdoptedMonthlySales, coAppTotalOperatingExpenses]);

  // Total Household Surplus before Proposed EMI
  const netFamilySurplusBeforeEmi = useMemo(() => {
    const coAppContrib = hasCoAppInBusiness ? coAppNetBusinessIncome : 0;
    return (netBusinessIncome + coAppContrib + otherIncome) - householdExpenses - existingEmis;
  }, [netBusinessIncome, hasCoAppInBusiness, coAppNetBusinessIncome, otherIncome, householdExpenses, existingEmis]);

  // Calculated Proposed Monthly EMI Formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const proposedEmi = useMemo(() => {
    const n = effectiveTenureMonths;
    const r = (interestRatePct / 100) / 12;
    if (r === 0 || n === 0 || !appliedAmount) return 0;
    const emi = (appliedAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  }, [appliedAmount, interestRatePct, effectiveTenureMonths]);

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

  // Auto-Generation for Generic Business Profile (Non-Aata Chakki)
  useEffect(() => {
    if (currentCategory?.name?.toLowerCase().includes('atta chakki') || currentCategory?.name?.toLowerCase().includes('aata chakki')) return;

    // Only generate if we have some meaningful data to show
    if (adoptedMonthlySales === 0 && yearsInBusiness === 0) return;

    const profileText = `Background & Setup: The applicant, ${applicantName || 'Applicant'}, operates ${firmName || 'the business'} (${currentCategory?.name || 'General Business'}), established ${yearsInBusiness || 0} years ago. The business is conducted from a ${shopOwnership === 'OWN' ? 'self-owned' : 'rented'} premises.

Income Estimation: The business generates an assessed monthly revenue of approximately ₹${adoptedMonthlySales.toLocaleString('en-IN')}. With a gross profit margin of ${grossMarginPct}%, the gross profit is ₹${grossProfit.toLocaleString('en-IN')}. After accounting for operating expenses of ₹${totalOperatingExpenses.toLocaleString('en-IN')} and household expenses of ₹${householdExpenses.toLocaleString('en-IN')}, the net monthly disposable surplus stands at ₹${postLoanSurplus.toLocaleString('en-IN')}.`;

    setBriefBusinessProfile(prev => {
      if (prev === profileText) return prev;
      // Protect user edits if they've written their own completely custom text
      if (prev.trim() && !prev.startsWith('Background & Setup:')) {
        return prev;
      }
      return profileText;
    });
  }, [currentCategory, applicantName, firmName, yearsInBusiness, shopOwnership, adoptedMonthlySales, grossMarginPct, grossProfit, totalOperatingExpenses, householdExpenses, postLoanSurplus]);

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

    // 1. Residence Ownership Risk
    if (residenceOwnership?.toUpperCase() === 'OWNED') {
      strengths.push('Applicant owns their residence, demonstrating stability');
      score += 5;
    } else if (residenceOwnership?.toUpperCase() === 'RENTED') {
      flags.push('Rented residence (monitor stability)');
      score -= 5;
    }

    // 2. Business Premise Ownership Risk
    if (premiseOwnership?.toUpperCase() === 'OWNED' || shopOwnership?.toUpperCase() === 'OWNED') {
      strengths.push('Applicant owns the business premises, reducing operational risk');
      score += 5;
    } else if (premiseOwnership?.toUpperCase() === 'RENTED' || shopOwnership?.toUpperCase() === 'RENTED') {
      flags.push('Rented business premises');
      score -= 5;
    }

    // 3. Feedback Checks
    if (neighborFeedback?.toUpperCase().includes('NEGATIVE')) {
      score -= 15;
      flags.push('Negative feedback received from neighbors');
    } else if (neighborFeedback?.toUpperCase().includes('POSITIVE')) {
      strengths.push('Positive feedback received from neighbors');
    }

    if (landlordFeedback?.toUpperCase().includes('NEGATIVE')) {
      score -= 15;
      flags.push('Negative feedback received from landlord');
    }

    // Bound the score between 0 and 100
    score = Math.max(0, Math.min(100, score));

    let decision: 'APPROVED' | 'CONDITIONAL' | 'REJECTED' = 'APPROVED';
    if (score < 50 || dscrRatio < 1.0) {
      decision = 'REJECTED';
    } else if (score < 75 || dscrRatio < 1.25 || foirPct > 65) {
      decision = 'CONDITIONAL';
    }

    return { score, flags, strengths, decision };
  }, [dscrRatio, foirPct, yearsInBusiness, residenceOwnership, shopOwnership, premiseOwnership, neighborFeedback, landlordFeedback]);

  // Saved with the form (declared after it) so the case gallery can show the risk badge
  updateDataRef.current = { ...updateDataRef.current, riskScore: riskAssessment.score };

  const resolvedVintage =
    businessVintageText || vintageSummary || `The business has an established vintage of ${yearsInBusiness} years.`;
  const executiveSummaryInput: ExecutiveSummaryInput = {
    applicantName,
    firmName,
    categoryName: currentCategory.name,
    vintage: resolvedVintage,
    monthlySales: adoptedMonthlySales,
    grossMarginPct,
    grossProfit,
    operatingExpenses: totalOperatingExpenses,
    existingEmis,
    householdExpenses,
    disposableSurplus: netFamilySurplusBeforeEmi,
    appliedAmount,
    interestRatePct,
    tenureMonths: effectiveTenureMonths,
    proposedEmi,
    dscrRatio,
    foirPct,
    residenceNeighbourCheckDone: neighborVerificationConducted,
    residenceConfirmed: neighborResidenceConfirmed,
    residenceNeighbourFeedback: neighborBehaviourFeedback,
    residenceNegativeFeedback: neighborNegativeFeedback,
    residenceNegativeDetails: neighborNegativeDetails,
    businessNeighbourFeedback: businessNeighbourFeedback || neighborFeedback,
  };
  const executiveSummary = buildExecutiveSummary(executiveSummaryInput);
  const executiveSummaryHtml = (() => {
    const html = buildExecutiveSummary(executiveSummaryInput, text => `<strong>${text}</strong>`);
    return (Object.keys(EXECUTIVE_SUMMARY_TITLES) as Array<keyof ExecutiveSummary>)
      .map(key => `<strong>${EXECUTIVE_SUMMARY_TITLES[key]}:</strong> ${html[key]}`)
      .join('<br/><br/>');
  })();

  const handleSaveToDB = async () => {
    if (!selectedClient) {
      alert("Please select a client first.");
      return;
    }
    // Use the same flat data structure as the auto-save so that applicantName,
    // firmName, applicationNumber, etc. are all stored as top-level Firestore fields
    // and can be read back correctly by the gallery and load functions.
    const payload = {
      ...(updateDataRef.current || {}),
      applicationNumber: activeAppNumber,
      applicantName: applicantName || 'Draft Applicant',
      financialInstitute: selectedClient.name,
    };

    try {
      if (activeAppIdRef.current) {
        const rawUpdated = await api.updateApplicant(selectedClient.id, activeAppIdRef.current, { ...payload, _id: activeAppIdRef.current });
        const updatedApp = normaliseApplicant(rawUpdated);
        setApplicantsList(prev => prev.map(a => a._id === activeAppIdRef.current ? updatedApp : a));
        alert('Applicant data updated in database successfully!');
      } else {
        const rawSaved = await api.createApplicant(selectedClient.id, payload);
        const savedApp = normaliseApplicant(rawSaved);
        if (savedApp && savedApp._id) {
          setActiveAppId(savedApp._id);
          activeAppIdRef.current = savedApp._id;
          // Clear the 'new' offline draft now that we have a real DB record
          localStorage.removeItem('offline_draft_new');
        }
        setApplicantsList(prev => [savedApp, ...prev]);
        alert('Applicant data saved to database successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save applicant data.');
    }
  };

  // Synthesize residential house details summary based on sections 15 & 16
  const getHouseDetailsSummary = () => {
    const parts: string[] = [];

    // 1. Structure and Rooms
    const structType = houseStructureType === 'Other' ? houseStructureTypeOther : houseStructureType;
    const floorPos = houseFloorPosition === 'Other' ? houseFloorPositionOther : houseFloorPosition;
    
    if (houseRooms || structType || floorPos || houseFloors) {
      const roomText = houseRooms ? `${houseRooms} room${Number(houseRooms) > 1 ? 's' : ''}` : '';
      const structText = structType ? `${structType.toLowerCase()} structure` : '';
      const floorText = floorPos ? `comprising a ${floorPos.toLowerCase()}` : '';
      const floorsCountText = houseFloors ? `(${houseFloors} floor${Number(houseFloors) > 1 ? 's' : ''})` : '';

      const structureParts = [roomText, structText, floorText, floorsCountText].filter(Boolean);
      if (structureParts.length > 0) {
        parts.push(`This house has ${houseRooms ? `${houseRooms} rooms` : 'residential accommodation'} and is a ${structType ? structType.toLowerCase() : 'residential'} structure${floorPos ? `, comprising a ${floorPos.toLowerCase()}` : ''}${houseFloors ? ` with ${houseFloors} floor${Number(houseFloors) > 1 ? 's' : ''}` : ''}.`);
      }
    }

    // 2. Ownership details
    let ownershipDesc = '';
    if (propertyOwnership === 'Self-Owned' || propertyOwnership === 'Owned') {
      ownershipDesc = `The premises is self-owned${propertyOwnerName ? ` in the name of ${propertyOwnerName}` : ''}`;
    } else if (propertyOwnership === 'Rented') {
      ownershipDesc = `The premises is rented${propertyRentAmount ? ` with an approximate monthly rent of ₹${Number(propertyRentAmount).toLocaleString('en-IN')}` : ''}`;
    } else if (propertyOwnership === 'Family-Owned' || propertyOwnership === 'Parental') {
      ownershipDesc = `The premises is family-owned/parental property`;
    } else if (propertyOwnership === 'Leased') {
      ownershipDesc = `The premises is on lease`;
    } else if (propertyOwnership === 'Other' && propertyOwnershipOther) {
      ownershipDesc = `The premises is ${propertyOwnershipOther.toLowerCase()}`;
    } else if (propertyOwnership) {
      ownershipDesc = `The premises is ${propertyOwnership.toLowerCase()}`;
    }

    const areaValueDesc: string[] = [];
    if (propertyArea) {
      areaValueDesc.push(`having an area of approximately ${propertyArea} sq.ft.`);
    }
    if (propertyValue) {
      areaValueDesc.push(`with an estimated valuation of ₹${Number(propertyValue).toLocaleString('en-IN')}`);
    }

    if (ownershipDesc) {
      if (areaValueDesc.length > 0) {
        parts.push(`${ownershipDesc}, ${areaValueDesc.join(' and ')}.`);
      } else {
        parts.push(`${ownershipDesc}.`);
      }
    } else if (areaValueDesc.length > 0) {
      parts.push(`The property covers an approximate area of ${propertyArea ? `${propertyArea} sq.ft.` : ''}${propertyValue ? ` with an estimated valuation of ₹${Number(propertyValue).toLocaleString('en-IN')}` : ''}.`);
    }

    // 3. Ownership document confirmation
    if (propertyOwnershipDoc === 'Yes') {
      parts.push(`Ownership document is confirmed available.`);
    } else if (propertyOwnershipDoc === 'No') {
      parts.push(`Ownership document is not available.`);
    }

    // 4. Additional details
    if (houseAdditionalDetails && houseAdditionalDetails.trim()) {
      parts.push(houseAdditionalDetails.trim());
    }

    return parts.length > 0 ? parts.join(' ') : 'Not provided';
  };

  // Build complete PD Report Data object for Printing, PDF Generation & Google Drive Export
  const getCompletePDReportData = (): PDReportPrintData => {
    const finalBusinessAddress = businessAddress || 'Not provided';
    const finalResidenceAddress = residenceAddress || 'Not provided';
    const finalMeetingAddress = meetingAddress || 'Not provided';
    const formattedGps = gpsLat && gpsLng ? `${gpsLat}, ${gpsLng}` : `${exifGpsLat}, ${exifGpsLng}`;

    const fbBusinessVintage = vintageSummary || 'Not provided';
    const fbStaffCount = staffingSummary;
    const fbPremiseOwnership = (premiseOwnership === 'Self-Owned' ? 'Business is being operated from self-owned premises.' : (premiseOwnership ? `Business is being operated from ${premiseOwnership.toLowerCase()} premises.` : '')) || (shopOwnership ? `Business is being operated from ${shopOwnership.toLowerCase()} premises.` : 'Not provided');
    const fbFactoryInfra = businessAssets.length > 0 ? `The business setup comprises ${businessAssets.map(a => `${String(a.quantity || 0).padStart(2, '0')} ${a.name} (${a.size})`).join(', ')}.` : 'Not provided';
    const fbStockDetails = stockDetails.length > 0 ? `The estimated value of observed stock (${stockDetails.map(s => s.name).join(', ')}) is approximately ₹${stockDetails.reduce((sum, s) => sum + (Number(s.value) || 0), 0)}.` : 'No significant stock maintained received from customers for processing.';
    const fbAssetAnalysis = `Fixed assets comprise ${businessAssets.length > 0 ? businessAssets.map(a => a.name).join(', ') : 'standard fixtures'}. Current assets include ${currentAssets.length > 0 ? currentAssets.join(', ') : 'working capital'}.`;
    const fbAssetCreation = `As informed by the applicant, the income generated from the business has been utilized for ${createdAssets.length > 0 ? createdAssets.map(a => a === 'Other' ? createdAssetsOther : a.toLowerCase()).join(', ') : 'asset creation'}${otherHouseholdExpenses ? ', along with meeting household expenses.' : '.'}`;
    const fbBusinessInvestment = `Started with an initial investment of approx ₹${initialInvestment || 1} Lakhs.`;
    const fbAgriIncome = `Applicant owns ${agriLandArea} ${agriLandUnit} agricultural land with yearly supplementary crop income of ₹${agriIncomeMin}-${agriIncomeMax} Lakhs.`;
    const fbSolarSaving = `As informed by the applicant, machinery is presently operated through ${powerSource.toLowerCase()} setup and approximate electricity expenses are around ₹${monthlyEnergyExpense || 0} per month. Applicant expects reduction in approx. ${expectedSolarCostReductionPct || 0}% operational cost after solar installation.`;


    return {
      companyHeader: {
        id: selectedCompany.id,
        name: selectedCompany.name,
        cin: selectedCompany.id === 'infominers' ? 'U67100UP2020PTC131346' : 'U12345DL2024PTC987654',
        designation: 'Chartered Accountant & Risk Advisors',
        address: selectedCompany.id === 'infominers' ? 'Office No 410, Shree Siddhi Vinayak Trade Center - Agra- 282004' : 'Connaught Place, New Delhi - 110001'
      },
      clientBankName: selectedClient?.name || 'Moneyboxx Finance Limited',
      applicationNumber: activeAppNumber,
      statusOfCase: statusOfCase || businessStatus || 'Recommended',
      caseInitiationDate,
      visitDate,
      reportDate,
      applicantName,
      applicantPhone: mobileNumber,
      coApplicants,
      femaleCandidateDetails: hasFemaleCandidate
        ? `Yes, the female candidate is already included in the application as ${femaleCandidateName || 'Not provided'}, ${femaleCandidateRelation === 'Other' ? (femaleCandidateOtherRelation || 'Not provided') : femaleCandidateRelation.toLowerCase()} of the applicant.`
        : "Not provided",
      firmName: firmName || 'Not provided',
      yearsInBusiness: yearsInBusiness || 0,
      shopOwnership: shopOwnership || 'RENTED',
      appliedAmount: appliedAmount || 0,
      quotationAmount: appliedAmount || 0,
      loanAmount: appliedAmount || 0,
      loanType: loanType === 'Other' ? (otherLoanType || 'Not provided') : loanType,
      loanPurpose: loanPurpose || solarPurposeGeneratedText || 'Not provided',
      endUseOfLoan: loanPurpose || solarPurposeGeneratedText || 'Not provided',
      purpose: loanPurpose || solarPurposeGeneratedText || 'Not provided',
      residenceAddress: finalResidenceAddress,
      businessAddress: finalBusinessAddress,
      additionalAddresses,
      meetingAddress: finalMeetingAddress,
      locatingPremisesType: locatingPremisesType === 'Other' ? locatingPremisesTypeOther : locatingPremisesType,
      metPersonName: personsMet.length > 0 ? personsMet.map(p => {
        if (p === 'Applicant') return `${applicantName || 'Applicant'} (Self)`;
        if (p === 'Co-applicant') return coApplicants.length > 0 ? `${coApplicants[0].name || 'Co-applicant'} (${coApplicants[0].relation === 'Other' ? coApplicants[0].otherRelation : coApplicants[0].relation})` : 'Co-applicant';
        if (p === 'Other') return `${personsMetOtherName} (${personsMetOtherRelation})`;
        const fam = familyMembers.find(f => (f.relation || f.relationship) === p);
        if (fam && fam.name) return `${fam.name} (${p})`;
        return p;
      }).join(' & ') : (applicantName ? `${applicantName} (Self)` : 'Not provided'),
      personMetQualification: applicantQualification || (personsMet.length > 0 ? (() => {
        const p = personsMet[0];
        if (p === 'Applicant') return '';
        if (p === 'Co-applicant') return coApplicants.length > 0 ? (coApplicants[0] as any).qualification || '' : '';
        const fam = familyMembers.find(f => (f.relation || f.relationship) === p);
        if (fam && fam.qualification) return fam.qualification;
        return '';
      })() : ''),
      metPersonIdProof: identityProof === 'Other' ? (otherIdentityProof || 'Not provided') : (identityProof || 'Not provided'),
      executiveName: executiveName || 'Not provided',
      reportedBy: currentUser?.name || 'Not provided',
      tataCapitalDistance: tataCapitalDistance || '5-10 Km (Approx)',
      familyMembers: familyMembers,
      documentsSeen: [ ...documentsSeen.filter(d => d !== 'Other'), ...(documentsSeen.includes('Other') && otherDocumentsSeen ? [otherDocumentsSeen] : []) ],

      residenceOwnership: propertyOwnership === 'Owned' || propertyOwnership === 'Self-Owned' ? `Self-Owned Premises${propertyArea ? ` - Area ${propertyArea} sq.ft Approx` : ''}${propertyOwnerName ? ` (Owner: ${propertyOwnerName})` : ''}` : (propertyOwnership === 'Rented' ? `Rented Premises${propertyRentAmount ? ` (Rent: ₹${Number(propertyRentAmount).toLocaleString('en-IN')}/month)` : ''}` : (propertyOwnership ? `${propertyOwnership} Premises` : (residenceOwnership ? `${residenceOwnership} Premises` : 'Not provided'))),
      houseDetails: getHouseDetailsSummary(),
      residenceHouseDetails: getHouseDetailsSummary(),
      monthlyHouseholdExpensesAmount: monthlyHouseholdExpensesAmount,
      monthlyHouseholdExpenses: (monthlyHouseholdExpensesAmount !== '' && Number(monthlyHouseholdExpensesAmount) > 0) ? Number(monthlyHouseholdExpensesAmount) : 0,
      householdExpenses: householdExpenses || 0,
      residenceElectricityDetails: hasResElectricityConnection === 'Yes' ? `Electricity verified (Supplier: ${resElectricitySupplierName || 'Not provided'}, Consumer No: ${resElectricityConsumerNumber || 'Not provided'}), Monthly Bill: ₹${resElectricityMonthlyExpense || 0}` : 'Not provided',
      residenceGpsCoords: formattedGps,
      residenceStatus: residenceStatus || 'Not provided',
      residenceNeighborName: neighbors.length > 0 && neighbors[0].name ? neighbors.map(n => n.name).join(', ') : 'Not provided',
      residenceNeighborFeedback: neighborVerificationConducted ? `Neighbour verification was conducted, wherein neighbours ${neighborResidenceConfirmed === 'Confirmed' ? 'confirmed' : neighborResidenceConfirmed.toLowerCase()} that both the applicant and co-applicant have been residing at the given address. The feedback received was ${neighborBehaviourFeedback || 'Not provided'} regarding their behaviour.` : 'Not provided',

      briefBusinessProfile: briefBusinessProfile || 'Not provided',
      
      hasCoApplicantBusiness: hasCoAppInBusiness,
      ...toCoApplicantBusinessReport(coApplicantBusiness.values),

      businessVintage: businessVintageText || fbBusinessVintage,
      previousOccupation: previousOccupation === 'Other' ? (previousOccupationOther || 'Not provided') : (previousOccupation || 'Not provided'),
      reasonToLeave: reasonToLeave || 'Not provided',
      staffCount: staffCountText || fbStaffCount,
      businessPremiseOwnership: premiseOwnershipText || fbPremiseOwnership,
      factoryInfrastructure: factoryInfrastructureText || fbFactoryInfra,
      stockDetailsValue: stockDetailsValueText || fbStockDetails,
      fixedAndCurrentAssetAnalysis: fixedAndCurrentAssetAnalysisText || fbAssetAnalysis,
      assetCreationThroughBusiness: assetCreationText || fbAssetCreation,
      initialBusinessInvestment: businessInvestmentText || fbBusinessInvestment,
      agriculturalIncomeDetails: agriculturalIncomeText || fbAgriIncome,
      otherSourceIncomeDetails: hasOtherIncome && otherIncomeSources.length > 0 ? `Applicant has other income sources: ${otherIncomeSources.map(s => `${s.source} (₹${s.amount.toLocaleString('en-IN')} ${s.frequency})`).join(', ')}` : 'Not provided',
      operationalSavingAnalysis: solarSavingText || fbSolarSaving,

      prominentCustomers: toReportContacts(prominentCustomers),
      prominentSuppliers: toReportContacts(prominentSuppliers),
      bankingDetails: bankingDetails.length > 0 && bankingDetails[0].bankName ? bankingDetails : [],
      existingLoans: existingLoans.length > 0 && existingLoans[0].typeOfLoan !== 'NA' ? existingLoans : [],
      currentObligationSummary: currentObligation || 'Not provided',
      hasCollateral,
      collateralAddress: collateralAddress || 'Not provided',
      propertyAddress: collateralAddress || 'Not provided',
      collateralPropertyType: collateralPropertyType || 'Residential',
      collateralPropertyArea: collateralPropertyArea || '',
      collateralPropertyUsage: collateralPropertyUsage || '',
      collateralValuation: collateralValuation || '',
      collateralRemarks: collateralRemarks || '',
      businessGpsCoords: formattedGps,
      businessLocationRemarks: businessLongitudeRemarks || 'Not provided',
      businessElectricityDetails: hasElectricityConnection === 'Yes' ? `Electricity verified (Supplier: ${electricitySupplierName || 'Not provided'}, Consumer No: ${electricityConsumerNumber || 'Not provided'}), Monthly Bill: ₹${electricityMonthlyExpense || 0}` : 'Not provided',
      businessNeighborName: businessNeighbourName || 'Not provided',
      businessNeighborFeedback: businessNeighbourFeedback || neighborFeedback || 'Not provided',
      businessStatus: businessStatus || statusOfCase || 'Recommended',
      constitution,
      partnersDirectorsDetails,
      profitMargin,
      monthlyRent,
      shopAreaSqFt,
      inventoryValue,
      businessRemark,

      itemizedSales: incomeLines
        .filter(l => (Number(l.monthlyAmount) || 0) > 0 && l.particulars && l.particulars.trim() !== '')
        .map(l => ({
          particulars: l.particulars.trim(),
          businessNotes: l.businessNotes || (l.quantity && l.price ? `${l.quantity} ${l.unit || ''} × ₹${l.price} × ${l.workingDays || workingDays || 26} Days` : `Monthly Assessed`),
          monthly: Number(l.monthlyAmount) || 0,
          yearly: (Number(l.monthlyAmount) || 0) * 12,
        })),
      itemizedExpenses: expenseLines.filter(l => (Number(l.monthlyAmount) || 0) > 0 && l.particulars && l.particulars.trim() !== '').length > 0
        ? expenseLines.filter(l => (Number(l.monthlyAmount) || 0) > 0 && l.particulars && l.particulars.trim() !== '').map(l => ({
            particulars: l.particulars.trim(),
            businessNotes: l.businessNotes || (l.quantity && l.price ? `${l.quantity} ${l.unit || ''} × ₹${l.price} × ${l.workingDays || workingDays || 26} Days` : `Monthly Assessed`),
            monthly: Number(l.monthlyAmount) || 0,
            yearly: (Number(l.monthlyAmount) || 0) * 12,
          }))
        : [
            ...(salariesExpense > 0 ? [{ particulars: 'Salary & Labour Expenses', businessNotes: 'Staff wages', monthly: salariesExpense, yearly: salariesExpense * 12 }] : []),
            ...(rentEffective > 0 ? [{ particulars: 'Business Premises Rent', businessNotes: 'Shop rent expense', monthly: rentEffective, yearly: rentEffective * 12 }] : []),
            ...(utilitiesExpense > 0 ? [{ particulars: 'Monthly Electricity & Utilities', businessNotes: 'Utility charges', monthly: utilitiesExpense, yearly: utilitiesExpense * 12 }] : []),
          ],

      totalSalesMonthly: adoptedMonthlySales,
      totalSalesYearly: adoptedMonthlySales * 12,
      workingDays: workingDays,
      totalExpensesMonthly: expenseLines.filter(l => (Number(l.monthlyAmount) || 0) > 0 && l.particulars && l.particulars.trim() !== '').length > 0
        ? expenseLines.filter(l => (Number(l.monthlyAmount) || 0) > 0 && l.particulars && l.particulars.trim() !== '').reduce((sum, l) => sum + (Number(l.monthlyAmount) || 0), 0)
        : (salariesExpense + rentEffective + utilitiesExpense),
      totalExpensesYearly: (expenseLines.filter(l => (Number(l.monthlyAmount) || 0) > 0 && l.particulars && l.particulars.trim() !== '').length > 0
        ? expenseLines.filter(l => (Number(l.monthlyAmount) || 0) > 0 && l.particulars && l.particulars.trim() !== '').reduce((sum, l) => sum + (Number(l.monthlyAmount) || 0), 0)
        : (salariesExpense + rentEffective + utilitiesExpense)) * 12,

      // Co-Applicant Financial Assessment
      coApplicantName: coAppBusinessPerson ? coAppBusinessPerson.name : (coApplicants[0]?.name || 'Co-applicant'),
      coApplicantRelation: coAppBusinessPerson ? (coAppBusinessPerson.relation === 'Other' ? coAppBusinessPerson.otherRelation : coAppBusinessPerson.relation) : (coApplicants[0]?.relation || 'Co-applicant'),
      coApplicantPhone: coAppBusinessPerson ? (coAppBusinessPerson.mobileNumber || (coAppBusinessPerson as any).phone || '') : (coApplicants[0]?.mobileNumber || (coApplicants[0] as any)?.phone || ''),
      coApplicantItemizedSales: coAppIncomeLines
        .filter(l => (Number(l.monthlyAmount) || 0) > 0 && l.particulars && l.particulars.trim() !== '')
        .map(l => ({
          particulars: l.particulars.trim(),
          businessNotes: l.businessNotes || (l.quantity && l.price ? `${l.quantity} ${l.unit || ''} × ₹${l.price} × ${l.workingDays || workingDays || 26} Days` : `Monthly Assessed`),
          monthly: Number(l.monthlyAmount) || 0,
          yearly: (Number(l.monthlyAmount) || 0) * 12,
        })),
      coApplicantTotalSalesMonthly: coAppAdoptedMonthlySales,
      coApplicantTotalSalesYearly: coAppAdoptedMonthlySales * 12,
      coApplicantItemizedExpenses: coAppExpenseLines.filter(l => (Number(l.monthlyAmount) || 0) > 0 && l.particulars && l.particulars.trim() !== '').length > 0
        ? coAppExpenseLines.filter(l => (Number(l.monthlyAmount) || 0) > 0 && l.particulars && l.particulars.trim() !== '').map(l => ({
            particulars: l.particulars.trim(),
            businessNotes: l.businessNotes || (l.quantity && l.price ? `${l.quantity} ${l.unit || ''} × ₹${l.price} × ${l.workingDays || workingDays || 26} Days` : `Monthly Assessed`),
            monthly: Number(l.monthlyAmount) || 0,
            yearly: (Number(l.monthlyAmount) || 0) * 12,
          }))
        : [
            ...(coAppSalariesExpense > 0 ? [{ particulars: 'Salary & Labour Expenses', businessNotes: 'Staff wages', monthly: coAppSalariesExpense, yearly: coAppSalariesExpense * 12 }] : []),
            ...(coAppRentExpense > 0 ? [{ particulars: 'Business Premises Rent', businessNotes: 'Shop rent expense', monthly: coAppRentExpense, yearly: coAppRentExpense * 12 }] : []),
            ...(coAppUtilitiesExpense > 0 ? [{ particulars: 'Monthly Electricity & Utilities', businessNotes: 'Utility charges', monthly: coAppUtilitiesExpense, yearly: coAppUtilitiesExpense * 12 }] : []),
            ...(coAppMiscExpense > 0 ? [{ particulars: 'Other Operating Expenses', businessNotes: 'Misc / Maintenance', monthly: coAppMiscExpense, yearly: coAppMiscExpense * 12 }] : []),
          ],
      coApplicantTotalExpensesMonthly: coAppTotalOperatingExpenses,
      coApplicantTotalExpensesYearly: coAppTotalOperatingExpenses * 12,
      coApplicantNetProfitMonthly: coAppNetBusinessIncome,
      coApplicantNetProfitYearly: coAppNetBusinessIncome * 12,

      netProfitMonthly: netBusinessIncome,
      netProfitYearly: netBusinessIncome * 12,
      existingEmiMonthly: existingEmis,
      existingEmiYearly: existingEmis * 12,
      existingEmiNotes: existingEmiNotes || generatedExistingEmiNotes,
      householdExpensesMonthly: householdExpenses || 0,
      householdExpensesYearly: (householdExpenses || 0) * 12,
      householdExpensesNotes: householdExpensesNotes,
      comfortableEmiNotes: comfortableEmiNotes,
      netDisposalIncomeMonthly: (netBusinessIncome - (householdExpenses || 0) - existingEmis),
      netDisposalIncomeYearly: (netBusinessIncome - (householdExpenses || 0) - existingEmis) * 12,

      dscrRatio: dscrRatio,
      foirPct: foirPct,

      executiveSummary_BorrowerProfile: resolvedVintage,
      executiveSummary_SalesWaterfall: executiveSummary.salesWaterfall,
      executiveSummary_DebtService: executiveSummary.debtService,
      executiveSummary_Community: executiveSummary.community,

      // Godrej Specific Fields
      alternateMobileNumber,
      officeAccessibility,
      tenorRequested,
      marginsAssessed,
      customerGstNo,
      industryType: industryType || currentCategory?.industryGroup || '',
      businessNature: currentCategory?.name || '',
      cibilScore: parsedCreditReport?.creditScore ?? null,
      residenceMarketValue: [
        propertyArea ? `${propertyArea} sq. ft.` : '',
        propertyValue ? `approx. ₹${Number(propertyValue).toLocaleString('en-IN')}` : '',
      ].filter(Boolean).join(', '),
      productType: productType || currentCategory?.name || '',
      onLoanStructure,
      machineryDetailsText: machineryDetailsText || factoryInfrastructureText || fbFactoryInfra,
      keyEmployeeDetailsText: (keyEmployeeDetailsText === '✓ .' || !keyEmployeeDetailsText) ? (staffCountText || fbStaffCount) : keyEmployeeDetailsText,
      groupCompanyDetailsText,
      financialDetailsText,
      otherBusinessPremisesText,
      otherStateGstText,
      familyInvolvedText: familyInvolvedText || (hasCoAppInBusiness ? coApplicants.filter(c => c.profession === 'Business' || (c as any).inBusiness === true).map(c => `${c.name || 'Co-applicant'} (${c.relation})`).join(', ') : 'No other family member is involved in the business.'),
      applicantQualification: familyMembers.find(f => (f.relation || f.relationship || '').toLowerCase() === 'self')?.qualification || applicantQualification,
      godrejStockLevel: godrejStockLevel || (hasStock ? (stockDetails.length > 0 ? stockDetails.map(s => s.name).join(', ') : 'Adequate') : 'No significant stock'),
      godrejRoughStockValue: godrejRoughStockValue || (hasStock ? (stockDetails.length > 0 ? `₹${stockDetails.reduce((sum, s) => sum + (Number(s.value) || 0), 0).toLocaleString('en-IN')}` : (inventoryValue ? `₹${inventoryValue.toLocaleString('en-IN')}` : '')) : '₹0'),
      godrejLocality: godrejLocality || locatingPremisesType || '',
      godrejOfficeSetup,
      godrejActivityLevel,
      godrejOfficeSize: godrejOfficeSize || (shopAreaSqFt ? `${shopAreaSqFt} Sq. Ft.` : ''),
      godrejEmployeesSeen: (godrejEmployeesSeen === 'No external staff/labour is engaged. Business operations are managed by Applicant.' && externalStaffCount > 0) ? (staffCountText || fbStaffCount) : godrejEmployeesSeen,
      godrejThirdPartyConfirmation: godrejThirdPartyConfirmation || neighborResidenceConfirmed || '',
      godrejCourtCasePending,
      godrejThirdPartyComment: godrejThirdPartyComment || businessNeighbourFeedback || neighborFeedback || neighborBehaviourFeedback || '',
      godrejSeparateDemarcation: godrejSeparateDemarcation || (shopOwnership === 'RESIDENCE_CUM_BUSINESS' ? 'Yes' : 'NA'),
      godrejGstDisplayed,
      godrejPanCard: godrejPanCard || (documentsSeen.includes('PAN Card') ? 'Provided' : 'Not Provided'),
      godrejGstinLegalName,
      godrejBusinessRegProof: godrejBusinessRegProof || ((documentsSeen.includes('GST Certificate') || documentsSeen.includes('Udyam Certificate')) ? 'Seen' : 'Not Seen'),
      godrejGstinRegDate,
      godrejElectricityBill: godrejElectricityBill || (documentsSeen.includes('Electricity Bill') ? 'Seen' : 'Not Seen'),
      godrejEmployeeRegister,
      godrejSaleBills: godrejSaleBills || (documentsSeen.includes('Sale / Purchase Bills') ? 'Seen' : 'Not Seen'),
      godrejOtherRecords: godrejOtherRecords || (documentsSeen.includes('Other') ? 'Provided' : 'Not Provided'),
      godrejStrengths,
      godrejWeaknesses,
      finalStatus,

      riskScore: riskAssessment.score,
      riskLevel: riskAssessment.decision,
      strengths: riskAssessment.strengths,
      flags: riskAssessment.flags,
      riskFactor: riskFactor,
      proposedEmi: proposedEmi,
      postLoanSurplus: postLoanSurplus,
      photos: photos.map(p => {
        const location = photoLocation(p);
        return {
          id: p.id,
          name: p.caption || 'Field Photo',
          dataUrl: p.url,
          category: p.categoryTag || 'Field Proof',
          ...(location && { gps: { lat: location.point.latitude, lng: location.point.longitude } }),
        };
      }),
      aiExecutiveSummary: executiveSummaryHtml,
      parsedCreditReport: parsedCreditReport
    };
  };

  // Direct Print Official Company Standard PD Report
  const handleDirectPrintReport = () => {
    openStandardPDReportPrintWindow(getCompletePDReportData());
  };

  const handleOpenGoogleDriveModal = () => {
    setIsGoogleDriveModalOpen(true);
  };

  const handleWhatsAppExtraction = async () => {
    if (!rawWhatsappText.trim()) return;
    setIsExtractingWhatsapp(true);
    try {
      const response = await authFetch('/api/extract-whatsapp', {
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

  const tabFooter = (
    <PdTabFooter activeTab={activeTab} hasCoApplicantBusiness={hasCoAppInBusiness} onSelect={setActiveTab} />
  );

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
                  {searchedApplications.map((app) => {
                    const isClosed = Boolean(app.isClosed || app.status === 'CLOSED' || app.caseDeliveryStatus === 'DELIVERED');
                    return (
                      <div
                        key={app._id || app.applicationNumber}
                        onClick={() => handleLoadSampleApp(app)}
                        className={`p-3 hover:bg-amber-50/60 cursor-pointer transition flex items-center justify-between text-xs ${
                          isClosed ? 'bg-emerald-50/30' : ''
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-[#eb8a23] font-mono">
                              #{app.applicationNumber}
                            </span>
                            {isClosed && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-600 text-white uppercase tracking-wider flex items-center gap-0.5">
                                <CheckCheck className="w-2.5 h-2.5" /> CLOSED
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-[#2d3e50]">{app.applicantName}</div>
                          <div className="text-[10px] text-slate-500">{app.firmName} • {app.categoryName}</div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {app.bankName}
                          </span>
                          <div className="text-[11px] font-extrabold text-emerald-700 mt-0.5">
                            ₹{((app.appliedAmount || 0) / 100000).toFixed(2)} Lakh
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
              onClick={handleSaveToDB}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm border border-emerald-800"
            >
              <Upload className="w-4 h-4 text-white" />
              Save to DB
            </button>

            <button
              onClick={handleOpenGoogleDriveModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-sm border border-blue-700"
            >
              <Cloud className="w-4 h-4 text-white" />
              Save to Google Drive
            </button>

            <button
              onClick={handleDirectPrintReport}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2d3e50] hover:bg-[#1e293b] text-white rounded-lg text-xs font-bold transition shadow-sm border border-slate-700"
            >
              <Printer className="w-4 h-4 text-[#eb8a23]" />
              Print / Generate Report
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
                <div className="text-xs text-emerald-700 font-bold flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Successfully extracted {parsedCreditReport.reportProvider} Data
                  </div>
                  <button
                    onClick={() => setIsEditingCreditReport(!isEditingCreditReport)}
                    className="px-2 py-1 text-[10px] bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition font-medium"
                  >
                    {isEditingCreditReport ? 'Done' : 'Edit'}
                  </button>
                </div>
                {isEditingCreditReport ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px]">
                    <Field label="Report Date" labelClassName="text-slate-500 uppercase font-bold" className="bg-white p-2 rounded border border-slate-200 shadow-sm flex flex-col gap-1">
                      <input 
                        className="border rounded p-1 w-full"
                        value={parsedCreditReport.reportDate || ''}
                        onChange={(e) => setParsedCreditReport({...parsedCreditReport, reportDate: e.target.value})}
                      />
                    </Field>
                    <Field label="Credit Score" labelClassName="text-slate-500 uppercase font-bold" className="bg-white p-2 rounded border border-slate-200 shadow-sm flex flex-col gap-1">
                      <input 
                        className="border rounded p-1 w-full"
                        value={parsedCreditReport.creditScore || ''}
                        onChange={(e) => setParsedCreditReport({...parsedCreditReport, creditScore: e.target.value})}
                      />
                    </Field>
                    <Field label="Total Accounts" labelClassName="text-slate-500 uppercase font-bold" className="bg-white p-2 rounded border border-slate-200 shadow-sm flex flex-col gap-1">
                      <input 
                        className="border rounded p-1 w-full"
                        type="number"
                        value={parsedCreditReport.totalAccounts || ''}
                        onChange={(e) => setParsedCreditReport({...parsedCreditReport, totalAccounts: parseInt(e.target.value) || 0})}
                      />
                    </Field>
                    <Field label="Active Accounts" labelClassName="text-slate-500 uppercase font-bold" className="bg-white p-2 rounded border border-slate-200 shadow-sm flex flex-col gap-1">
                      <input 
                        className="border rounded p-1 w-full"
                        type="number"
                        value={parsedCreditReport.activeAccounts || ''}
                        onChange={(e) => setParsedCreditReport({...parsedCreditReport, activeAccounts: parseInt(e.target.value) || 0})}
                      />
                    </Field>
                    <Field label="Current Balance (₹)" labelClassName="text-slate-500 uppercase font-bold" className="bg-white p-2 rounded border border-slate-200 shadow-sm flex flex-col gap-1">
                      <input 
                        className="border rounded p-1 w-full"
                        type="number"
                        value={parsedCreditReport.totalCurrentBalance || ''}
                        onChange={(e) => setParsedCreditReport({...parsedCreditReport, totalCurrentBalance: parseInt(e.target.value) || 0})}
                      />
                    </Field>
                    <Field label="Overdue Amount (₹)" labelClassName="text-slate-500 uppercase font-bold" className="bg-white p-2 rounded border border-slate-200 shadow-sm flex flex-col gap-1">
                      <input 
                        className="border rounded p-1 w-full"
                        type="number"
                        value={parsedCreditReport.totalOverdueAmount || ''}
                        onChange={(e) => setParsedCreditReport({...parsedCreditReport, totalOverdueAmount: parseInt(e.target.value) || 0})}
                      />
                    </Field>
                  </div>
                ) : (
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
                )}
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
                    <AccountDetailsTable 
                      accounts={parsedCreditReport.accounts} 
                      isEditing={isEditingCreditReport}
                      onAccountsChange={(newAccounts) => setParsedCreditReport({...parsedCreditReport, accounts: newAccounts})}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Module Tabs */}
      <PdTabBar activeTab={activeTab} hasCoApplicantBusiness={hasCoAppInBusiness} onSelect={setActiveTab} />

      {/* TAB 1: BUSINESS PROFILE */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-[#eb8a23]" />
              Business Profile & Establishment Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Firm / Trade Name *">
                <input
                  type="text"
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold"
                />
              </Field>

              <Field label="Business Constitution">
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
              </Field>

              {['tata', 'sbfc'].includes(selectedClient?.id || '') && (
                <Field label="Details of Partners/Directors">
                  <input type="text" value={partnersDirectorsDetails} onChange={(e) => setPartnersDirectorsDetails(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Not applicable" />
                </Field>
              )}

              <Field label="Business Status (Recommendation)">
                <select
                  value={statusOfCase}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold"
                >
                  {caseStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </Field>



              <Field label="Premises Ownership">
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
              </Field>

              {shopOwnership === 'RENTED' && (
                <Field label="Monthly Shop Rent (₹)">
                  <input
                    type="number"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold"
                  />
                </Field>
              )}

              {/* Additional fields requested in Business Profile */}
              <Field label="GSTIN – Legal Trade Name">
                <input type="text" value={godrejGstinLegalName} onChange={(e) => godrej.setField('godrejGstinLegalName', e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" />
              </Field>
              <Field label="GSTIN – Date of Registration">
                <input type="text" value={godrejGstinRegDate} onChange={(e) => godrej.setField('godrejGstinRegDate', e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" />
              </Field>
              <Field label="Employee Register">
                <input type="text" value={godrejEmployeeRegister} onChange={(e) => godrej.setField('godrejEmployeeRegister', e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" />
              </Field>

              <Field label="Carpet Area (Sq. Ft.)">
                <input
                  type="number"
                  value={shopAreaSqFt}
                  onChange={(e) => setShopAreaSqFt(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold"
                />
              </Field>

              <Field label="Estimated Business Premises Value (₹)">
                <input
                  type="number"
                  value={inventoryValue}
                  onChange={(e) => setInventoryValue(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold"
                />
              </Field>

              <Field label="Business Remark" className="md:col-span-3">
                <textarea
                  value={businessRemark}
                  onChange={(e) => setBusinessRemark(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold"
                  placeholder="Enter business remarks..."
                />
              </Field>

              <div className="md:col-span-3 pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Strengths, Weaknesses & Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Field label="Strengths" labelClassName="block text-xs font-bold text-slate-700" className="flex justify-between items-center mb-2">
                      <button onClick={() => setGodrejStrengths([...godrejStrengths, { id: Date.now().toString(), text: '' }])} className="text-[10px] text-white bg-[#eb8a23] px-2 py-1 rounded">Add</button>
                    </Field>
                    <textarea 
                      placeholder="Paste numbered list here to auto-fill..."
                      onChange={(e) => {
                        const text = e.target.value;
                        if (!text.trim()) return;
                        const parts = text.split(/\n|(?:\s|^)\d+[\.\)]\s+/).map(p => p.trim()).filter(Boolean);
                        setGodrejStrengths(parts.map((p, i) => ({ id: Date.now().toString() + i, text: p })));
                        e.target.value = '';
                      }}
                      className="w-full px-3 py-1.5 text-xs border border-dashed border-slate-300 rounded focus:ring-2 focus:ring-[#eb8a23] mb-2 bg-slate-50"
                      rows={1}
                    />
                    {godrejStrengths.map((s, idx) => (
                      <div key={s.id} className="flex gap-2 mb-2">
                        <input type="text" value={s.text} onChange={(e) => updateListItem(godrejStrengths, setGodrejStrengths, idx, 'text', e.target.value)} className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-[#eb8a23]" />
                        <button onClick={() => { const st = [...godrejStrengths]; st.splice(idx, 1); setGodrejStrengths(st); }} className="text-red-500 hover:text-red-700"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                  <div>
                    <Field label="Weaknesses" labelClassName="block text-xs font-bold text-slate-700" className="flex justify-between items-center mb-2">
                      <button onClick={() => setGodrejWeaknesses([...godrejWeaknesses, { id: Date.now().toString(), text: '' }])} className="text-[10px] text-white bg-[#eb8a23] px-2 py-1 rounded">Add</button>
                    </Field>
                    <textarea 
                      placeholder="Paste numbered list here to auto-fill..."
                      onChange={(e) => {
                        const text = e.target.value;
                        if (!text.trim()) return;
                        const parts = text.split(/\n|(?:\s|^)\d+[\.\)]\s+/).map(p => p.trim()).filter(Boolean);
                        setGodrejWeaknesses(parts.map((p, i) => ({ id: Date.now().toString() + i, text: p })));
                        e.target.value = '';
                      }}
                      className="w-full px-3 py-1.5 text-xs border border-dashed border-slate-300 rounded focus:ring-2 focus:ring-[#eb8a23] mb-2 bg-slate-50"
                      rows={1}
                    />
                    {godrejWeaknesses.map((w, idx) => (
                      <div key={w.id} className="flex gap-2 mb-2">
                        <input type="text" value={w.text} onChange={(e) => updateListItem(godrejWeaknesses, setGodrejWeaknesses, idx, 'text', e.target.value)} className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-[#eb8a23]" />
                        <button onClick={() => { const wk = [...godrejWeaknesses]; wk.splice(idx, 1); setGodrejWeaknesses(wk); }} className="text-red-500 hover:text-red-700"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Field label="Final Status" className="mt-4 w-1/3">
                  <select
                    value={finalStatus}
                    onChange={(e) => godrej.setField('finalStatus', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold"
                  >
                    <option value="POSITIVE">POSITIVE</option>
                    <option value="NEGATIVE">NEGATIVE</option>
                  </select>
                </Field>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Business Profile & Summary (Executive Appraisal)</label>
                <textarea
                  value={briefBusinessProfile}
                  onChange={(e) => setBriefBusinessProfile(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold"
                  placeholder="Enter detailed business profile and executive summary..."
                />
              </div>
            </div>
          </div>

          {/* AATA CHAKKI DYNAMIC SETUP */}
          {!isSlimForm && (currentCategory.name.toLowerCase().includes('atta chakki') || currentCategory.name.toLowerCase().includes('aata chakki')) && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#eb8a23]" />
                Aata Chakki Setup & Details
              </h3>

              <Field label="Select Available Machines" labelClassName="block text-xs font-bold text-slate-700 mb-2">
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
              </Field>

              {aataChakkiData.machines.includes('Atta Chakki') && (
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-orange-800">Atta Chakki Specifics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Field label="Machine Size (Inches)" labelClassName={SUB_LABEL}>
                      <input type="number" value={aataChakkiData.attaChakki.size} onChange={e => setAataChakkiData({ ...aataChakkiData, attaChakki: { ...aataChakkiData.attaChakki, size: e.target.value } })} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </Field>
                    <Field label="Capacity (Per Hr)" labelClassName={SUB_LABEL}>
                      <input type="number" value={aataChakkiData.attaChakki.capacity} onChange={e => setAataChakkiData({ ...aataChakkiData, attaChakki: { ...aataChakkiData.attaChakki, capacity: e.target.value } })} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </Field>
                    <Field label="Daily Wheat (Kg)" labelClassName={SUB_LABEL}>
                      <input type="number" value={aataChakkiData.attaChakki.wheatKg} onChange={e => setAataChakkiData({ ...aataChakkiData, attaChakki: { ...aataChakkiData.attaChakki, wheatKg: e.target.value } })} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </Field>
                    <Field label="Grinding Charge (₹/Kg)" labelClassName={SUB_LABEL}>
                      <input type="number" value={aataChakkiData.attaChakki.charge} onChange={e => setAataChakkiData({ ...aataChakkiData, attaChakki: { ...aataChakkiData.attaChakki, charge: e.target.value } })} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </Field>
                  </div>
                </div>
              )}

              {aataChakkiData.machines.includes('Kohlu') && (
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-orange-800">Kohlu Specifics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Field label="Bolt/Patti Details" labelClassName={SUB_LABEL}>
                      <input type="text" value={aataChakkiData.kohlu.boltDetails} onChange={e => setAataChakkiData({ ...aataChakkiData, kohlu: { ...aataChakkiData.kohlu, boltDetails: e.target.value } })} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </Field>
                    <Field label="Daily Mustard (Kg)" labelClassName={SUB_LABEL}>
                      <input type="number" value={aataChakkiData.kohlu.mustardKg} onChange={e => setAataChakkiData({ ...aataChakkiData, kohlu: { ...aataChakkiData.kohlu, mustardKg: e.target.value } })} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </Field>
                    <Field label="Processing Charge (₹)" labelClassName={SUB_LABEL}>
                      <input type="number" value={aataChakkiData.kohlu.charge} onChange={e => setAataChakkiData({ ...aataChakkiData, kohlu: { ...aataChakkiData.kohlu, charge: e.target.value } })} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </Field>
                    <Field label="Khali Qty (Kg)" labelClassName={SUB_LABEL}>
                      <input type="number" value={aataChakkiData.kohlu.khaliKg} onChange={e => setAataChakkiData({ ...aataChakkiData, kohlu: { ...aataChakkiData.kohlu, khaliKg: e.target.value } })} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </Field>
                    <Field label="Khali Selling Rate (₹)" labelClassName={SUB_LABEL}>
                      <input type="number" value={aataChakkiData.kohlu.khaliRate} onChange={e => setAataChakkiData({ ...aataChakkiData, kohlu: { ...aataChakkiData.kohlu, khaliRate: e.target.value } })} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </Field>
                  </div>
                </div>
              )}

              {aataChakkiData.machines.includes('Dhan Polisher') && (
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-orange-800">Dhan Polisher Specifics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    <Field label="Machine Size" labelClassName="block text-[9px] uppercase font-bold text-slate-500 mb-1">
                      <input type="number" value={aataChakkiData.dhanPolisher.size} onChange={e => setAataChakkiData({ ...aataChakkiData, dhanPolisher: { ...aataChakkiData.dhanPolisher, size: e.target.value } })} className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </Field>
                    <Field label="Paddy (Kg)" labelClassName="block text-[9px] uppercase font-bold text-slate-500 mb-1">
                      <input type="number" value={aataChakkiData.dhanPolisher.paddyKg} onChange={e => setAataChakkiData({ ...aataChakkiData, dhanPolisher: { ...aataChakkiData.dhanPolisher, paddyKg: e.target.value } })} className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </Field>
                    <Field label="Charge (₹)" labelClassName="block text-[9px] uppercase font-bold text-slate-500 mb-1">
                      <input type="number" value={aataChakkiData.dhanPolisher.charge} onChange={e => setAataChakkiData({ ...aataChakkiData, dhanPolisher: { ...aataChakkiData.dhanPolisher, charge: e.target.value } })} className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </Field>
                    <Field label="Bhusi (Kg)" labelClassName="block text-[9px] uppercase font-bold text-slate-500 mb-1">
                      <input type="number" value={aataChakkiData.dhanPolisher.bhusiKg} onChange={e => setAataChakkiData({ ...aataChakkiData, dhanPolisher: { ...aataChakkiData.dhanPolisher, bhusiKg: e.target.value } })} className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </Field>
                    <Field label="Bhusi Rate (₹)" labelClassName="block text-[9px] uppercase font-bold text-slate-500 mb-1">
                      <input type="number" value={aataChakkiData.dhanPolisher.bhusiRate} onChange={e => setAataChakkiData({ ...aataChakkiData, dhanPolisher: { ...aataChakkiData.dhanPolisher, bhusiRate: e.target.value } })} className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </Field>
                    <Field label="Rice Polish Qty (Kg)" labelClassName="block text-[9px] uppercase font-bold text-slate-500 mb-1">
                      <input type="number" value={aataChakkiData.dhanPolisher.ricePolishKg} onChange={e => setAataChakkiData({ ...aataChakkiData, dhanPolisher: { ...aataChakkiData.dhanPolisher, ricePolishKg: e.target.value } })} className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </Field>
                    <Field label="Rice Polish Rate (₹)" labelClassName="block text-[9px] uppercase font-bold text-slate-500 mb-1">
                      <input type="number" value={aataChakkiData.dhanPolisher.ricePolishRate} onChange={e => setAataChakkiData({ ...aataChakkiData, dhanPolisher: { ...aataChakkiData.dhanPolisher, ricePolishRate: e.target.value } })} className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </Field>
                  </div>
                </div>
              )}

              {aataChakkiData.machines.includes('Masala Grinding Machine') && (
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-orange-800">Masala Grinding Specifics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Machine Size" labelClassName={SUB_LABEL}>
                      <input type="number" value={aataChakkiData.masalaMachine.size} onChange={e => setAataChakkiData({ ...aataChakkiData, masalaMachine: { ...aataChakkiData.masalaMachine, size: e.target.value } })} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </Field>
                    <Field label="Daily Masala (Kg)" labelClassName={SUB_LABEL}>
                      <input type="number" value={aataChakkiData.masalaMachine.masalaKg} onChange={e => setAataChakkiData({ ...aataChakkiData, masalaMachine: { ...aataChakkiData.masalaMachine, masalaKg: e.target.value } })} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </Field>
                    <Field label="Processing Charge (₹)" labelClassName={SUB_LABEL}>
                      <input type="number" value={aataChakkiData.masalaMachine.charge} onChange={e => setAataChakkiData({ ...aataChakkiData, masalaMachine: { ...aataChakkiData.masalaMachine, charge: e.target.value } })} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    </Field>
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

          {/* GODREJ SPECIFIC DETAILS */}
          {selectedClient?.name?.toLowerCase().includes('godrej') && <GodrejDetailsPanel form={godrej} />}

          {tabFooter}
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

            {/* Application ID & Status of Case */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Application ID">
                <input type="text" value={activeAppNumber} onChange={(e) => setActiveAppNumber(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="e.g. INF/2026/88492" />
              </Field>
              <Field label="Status of the Case">
                <select value={statusOfCase} onChange={(e) => handleStatusChange(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold">
                  {caseStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </Field>
            </div>

            {/* 1. Case Initiation Date, 2. Visit Date & 3. Report Date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="1. Case Initiation Date">
                <input type="date" value={caseInitiationDate} onChange={(e) => setCaseInitiationDate(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" />
              </Field>
              <Field label="2. Visit Date">
                <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" />
              </Field>
              <Field label="3. Report Date">
                <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" />
              </Field>
            </div>



            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="3. Name of Applicant *">
                <input type="text" required value={applicantName} onChange={(e) => setApplicantName(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="e.g. Mr. Lalbabu Sahani" />
              </Field>
              <Field label="4. Contact Number">
                <input type="text" maxLength={10} pattern="\d{10}" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="10-digit mobile number" />
              </Field>
            </div>

            <div>
              <Field label="5. Business Firm Name" labelClassName="block text-xs font-bold text-slate-700" className="flex justify-between items-center mb-1">
                <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer">
                  <input type="checkbox" checked={noFormalBusinessName} onChange={(e) => {
                    setNoFormalBusinessName(e.target.checked);
                    if (e.target.checked) setFirmName('No formal business name');
                    else setFirmName('');
                  }} className="rounded text-[#eb8a23] focus:ring-[#eb8a23]" />
                  No formal business name
                </label>
              </Field>
              <input type="text" value={firmName} onChange={(e) => setFirmName(e.target.value)} disabled={noFormalBusinessName} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold disabled:bg-slate-100 disabled:text-slate-500" placeholder="Business Name" />
            </div>

            {/* 6. Co-applicant Name with Relation & 7. Contact */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <Field label="6. Co-applicant Details" labelClassName="block text-xs font-bold text-slate-700" className="flex items-center justify-between">
                <button type="button" onClick={() => setCoApplicants([...coApplicants, { name: '', relation: 'Spouse', mobileNumber: '' }])} className="px-3 py-1.5 bg-[#2d3e50] text-white text-xs font-bold rounded-lg hover:bg-[#1e293b]">
                  + Add Co-applicant
                </button>
              </Field>

              {coApplicants.length === 0 && (
                <div className="text-xs font-semibold text-slate-500 italic p-3 text-center border border-dashed border-slate-300 rounded-lg">No Co-applicants Added</div>
              )}

              {coApplicants.map((coApp, idx) => (
                <div key={idx} className="relative p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <button type="button" onClick={() => setCoApplicants(coApplicants.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs font-bold">
                    Remove
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                    <Field label="Co-applicant Name" labelClassName={SUB_LABEL}>
                      <input type="text" value={coApp.name} onChange={(e) => updateListItem(coApplicants, setCoApplicants, idx, 'name', e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Name" />
                    </Field>
                    <Field label="Relationship" labelClassName={SUB_LABEL}>
                      <select value={coApp.relation} onChange={(e) => {
                        const newCoApps = [...coApplicants];
                        newCoApps[idx].relation = e.target.value;
                        if (e.target.value !== 'Other') newCoApps[idx].otherRelation = '';
                        setCoApplicants(newCoApps);
                      }} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold">
                        <option value="">Select Relationship ▼</option>
                        {['Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Business Partner', 'Other'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </Field>
                    {coApp.relation === 'Other' && (
                      <Field label="Specify Relationship" labelClassName={SUB_LABEL}>
                        <input type="text" value={coApp.otherRelation || ''} onChange={(e) => updateListItem(coApplicants, setCoApplicants, idx, 'otherRelation', e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Specify" />
                      </Field>
                    )}
                    <Field label="7. Contact Number" labelClassName={SUB_LABEL}>
                      <input type="text" maxLength={10} value={coApp.mobileNumber || ''} onChange={(e) => updateListItem(coApplicants, setCoApplicants, idx, 'mobileNumber', e.target.value.replace(/\D/g, ''))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="10-digit number" />
                    </Field>
                    <Field label="Profession" labelClassName={SUB_LABEL}>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => updateListItem(coApplicants, setCoApplicants, idx, 'profession', 'Salaried')} className={`flex-1 px-3 py-2 text-[10px] font-bold rounded-lg border ${coApp.profession === 'Salaried' ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}>Salaried</button>
                        <button type="button" onClick={() => updateListItem(coApplicants, setCoApplicants, idx, 'profession', 'Business')} className={`flex-1 px-3 py-2 text-[10px] font-bold rounded-lg border ${coApp.profession === 'Business' ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}>Business</button>
                        <button type="button" onClick={() => updateListItem(coApplicants, setCoApplicants, idx, 'profession', 'Other')} className={`flex-1 px-3 py-2 text-[10px] font-bold rounded-lg border ${coApp.profession === 'Other' || !coApp.profession ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}>Other</button>
                      </div>
                    </Field>
                  </div>
                </div>
              ))}
            </div>

            {/* 8. Female Candidate */}
            {!isSlimForm && (
            <Field label="8. Female candidate is on loan / application" labelClassName="block text-xs font-bold text-slate-700" className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => setHasFemaleCandidate(true)} className={`px-4 py-1.5 text-xs font-bold rounded-lg border ${hasFemaleCandidate ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-white text-slate-600 border-slate-300'}`}>Yes</button>
                <button type="button" onClick={() => { setHasFemaleCandidate(false); setFemaleCandidateName(''); setFemaleCandidateRelation(''); }} className={`px-4 py-1.5 text-xs font-bold rounded-lg border ${!hasFemaleCandidate ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-white text-slate-600 border-slate-300'}`}>No</button>
              </div>

              {hasFemaleCandidate && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <Field label="Female Candidate Name" labelClassName={SUB_LABEL}>
                    <input type="text" value={femaleCandidateName} onChange={(e) => setFemaleCandidateName(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Name" />
                  </Field>
                  <Field label="Relationship with Applicant" labelClassName={SUB_LABEL}>
                    <select value={femaleCandidateRelation} onChange={(e) => setFemaleCandidateRelation(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold">
                      <option value="">Select ▼</option>
                      {['Spouse', 'Mother', 'Daughter', 'Sister', 'Other'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </Field>
                  {femaleCandidateRelation === 'Other' && (
                    <Field label="Specify Relationship" labelClassName={SUB_LABEL} className="md:col-span-2">
                      <input type="text" value={femaleCandidateOtherRelation} onChange={(e) => setFemaleCandidateOtherRelation(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Specify" />
                    </Field>
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
            </Field>
            )}

            {/* 9. Quotation Amount & 10. Type of Loan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="9. Quotation Amount">
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
              </Field>
              <Field label="10. Type of Loan">
                <select value={loanType} onChange={(e) => setLoanType(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold">
                  {['Commercial Solar Loan', 'Residential Solar Loan', 'Personal Loan', 'Home Loan', 'Business Loan', 'Vehicle Loan', 'LAP', 'Micro Buisness Loan', 'Education Loan', 'Other'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {loanType === 'Other' && (
                  <input type="text" value={otherLoanType} onChange={(e) => setOtherLoanType(e.target.value)} className="w-full mt-2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Specify Loan Type" />
                )}
              </Field>
            </div>

            {/* Purpose of Loan (as per applicant) */}
            <Field label="Purpose of Loan (as per applicant)">
              <textarea
                value={loanPurpose}
                onChange={(e) => setLoanPurpose(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold"
                placeholder="e.g. Business Expansion / Working Capital Requirement / Solar plant installation"
                rows={2}
              />
            </Field>

            {/* 11. Solar Purpose & Usage */}
            {!isSlimForm && loanType === 'Commercial Solar Loan' && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-4">
                <label className="block text-xs font-bold text-orange-900">11. Solar Purpose & Usage Confirmation</label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Current Power / Energy Source" labelClassName="block text-[10px] uppercase font-bold text-orange-700 mb-1">
                    <select value={powerSource} onChange={(e) => setPowerSource(e.target.value)} className="w-full px-3 py-2 text-xs border border-orange-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold bg-white">
                      {['Electricity', 'Electricity Engine', 'Diesel Generator', 'Solar', 'Grid Electricity', 'Other'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    {powerSource === 'Other' && (
                      <input type="text" value={otherPowerSource} onChange={(e) => setOtherPowerSource(e.target.value)} className="w-full mt-2 px-3 py-2 text-xs border border-orange-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold bg-white" placeholder="Specify Power Source" />
                    )}
                  </Field>
                  <Field label="Approximate Monthly Expense" labelClassName="block text-[10px] uppercase font-bold text-orange-700 mb-1">
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-500 font-bold">₹</span>
                      <input type="number" value={monthlyEnergyExpense} onChange={(e) => setMonthlyEnergyExpense(Number(e.target.value))} className="w-full pl-7 pr-3 py-2 text-xs border border-orange-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold bg-white" placeholder="Amount" />
                    </div>
                  </Field>
                </div>

                <Field label="Purpose of Solar Installation" labelClassName="block text-[10px] uppercase font-bold text-orange-700 mb-2">
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
                </Field>

                <div className="p-3 bg-white border border-orange-200 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Generated Statement</span>
                    <button type="button" onClick={() => {
                      const finalSource = powerSource === 'Other' ? otherPowerSource : powerSource;
                      const finalPurposes = solarPurposes.map(p => p === 'Other' ? otherSolarPurpose : p).filter(Boolean);
                      const purposeText = finalPurposes.length > 1 ? finalPurposes.slice(0, -1).join(', ') + ' and ' + finalPurposes.slice(-1) : finalPurposes[0] || '';
                      const genText = `The applicant currently operates the business using ${finalSource.toLowerCase()}, which incurs an approximate monthly expense of ₹${monthlyEnergyExpense || 0}. Therefore, the applicant is planning to install a solar setup to ${purposeText.toLowerCase()}.`;
                      setSolarPurposeGeneratedText(genText);
                      if (!loanPurpose) {
                        setLoanPurpose(genText);
                      }
                    }} className="text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold hover:bg-orange-200">Auto-Generate</button>
                  </div>
                  <textarea value={solarPurposeGeneratedText} onChange={(e) => setSolarPurposeGeneratedText(e.target.value)} className="w-full text-xs font-semibold text-slate-700 border-none outline-none resize-none bg-transparent" rows={3} placeholder="Click Auto-Generate to preview..." />
                </div>
              </div>
            )}

            {/* 12. Address of Residence */}
            <Field label="12. Address of the Residence" labelClassName="block text-xs font-bold text-slate-700" className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <textarea value={residenceAddress} onChange={(e) => setResidenceAddress(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Enter complete residence address" rows={2} />
              </div>
            </Field>

            {/* 13. Address of Business */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <Field label="13. Address of the Business (Applicant)" labelClassName="block text-xs font-bold text-slate-700" className="flex justify-between items-center">
                <button type="button" onClick={() => {
                  setBusinessAddress(residenceAddress);
                }} className="text-[10px] bg-slate-100 text-slate-700 px-3 py-1.5 rounded font-bold hover:bg-slate-200 border border-slate-300">Same as Residence Address</button>
              </Field>
              <div className="grid grid-cols-1 gap-3">
                <textarea value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Enter complete business address" rows={2} />
              </div>

              <div className="space-y-2">
                <Field label="Additional Addresses" labelClassName="text-xs font-semibold text-slate-700" className="flex items-center justify-between">
                  <button type="button" onClick={() => setAdditionalAddresses([...additionalAddresses, ''])} className="text-xs text-blue-600 hover:text-blue-800 flex items-center font-semibold">
                    <Plus className="w-3 h-3 mr-1" /> Add Address
                  </button>
                </Field>
                {additionalAddresses.map((addr, idx) => (
                  <div key={idx} className="flex space-x-2 items-center mb-2">
                    <input type="text" value={addr} onChange={(e) => { const newAddrs = [...additionalAddresses]; newAddrs[idx] = e.target.value; setAdditionalAddresses(newAddrs); }} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]" placeholder={`Additional Address ${idx + 1}`} />
                    <button type="button" onClick={() => { const newAddrs = additionalAddresses.filter((_, i) => i !== idx); setAdditionalAddresses(newAddrs); }} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 14. Met Person During Visit Time */}
            <Field label="14. Met Person During Visit" labelClassName="block text-xs font-bold text-slate-700" className="space-y-3 pt-4 border-t border-slate-100">
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
            </Field>

            {/* 15. Met Person Identity Proof */}
            <Field label="15. Met Person Identity Proof" labelClassName="block text-xs font-bold text-slate-700 mb-2" className="pt-4 border-t border-slate-100">
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
            </Field>

            {/* 15.1 Documents Seen */}
            <Field label="15.1 Documents Seen" labelClassName="block text-xs font-bold text-slate-700 mb-2" className="pt-6 border-t border-slate-100">
              <div className="flex flex-wrap gap-3">
                {['PAN Card', 'Udyam Certificate', 'GST Certificate', 'Aadhaar Card', 'Manual Records', 'Buisness Invoices', 'Other'].map(doc => (
                  <label key={doc} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <input 
                      type="checkbox" 
                      checked={documentsSeen.includes(doc)} 
                      onChange={(e) => {
                        if (e.target.checked) setDocumentsSeen([...documentsSeen, doc]);
                        else setDocumentsSeen(documentsSeen.filter(d => d !== doc));
                      }} 
                      className="accent-[#eb8a23]" 
                    />
                    {doc}
                  </label>
                ))}
              </div>
              {documentsSeen.includes('Other') && (
                <input type="text" value={otherDocumentsSeen} onChange={(e) => setOtherDocumentsSeen(e.target.value)} className="w-full mt-3 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Specify Other Documents Seen" />
              )}
            </Field>

            {/* 16. Spouse and Dependencies Details */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-slate-800">16. Spouse and Dependencies Details</h4>
                <button
                  type="button"
                  onClick={() => setFamilyMembers([...familyMembers, { id: Date.now().toString(), name: '', age: 0, profession: '', qualification: '', isDependent: true, relationship: '', education: '', occupation: '', isEarning: false, monthlyIncome: 0 }])}
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
                            <input type="text" value={member.name} onChange={(e) => updateListItem(familyMembers, setFamilyMembers, idx, 'name', e.target.value)} className="w-full bg-transparent border-none outline-none focus:ring-0 text-xs font-semibold" placeholder="Name" />
                          </td>
                          <td className="p-2 border-r border-slate-100">
                            {!member._otherRelation ? (
                              <select 
                                value={member.relationship || ''} 
                                onChange={(e) => { 
                                  const newFm = [...familyMembers]; 
                                  if (e.target.value === 'Other') {
                                    newFm[idx]._otherRelation = true;
                                    newFm[idx].relationship = '';
                                  } else {
                                    newFm[idx].relationship = e.target.value; 
                                  }
                                  setFamilyMembers(newFm); 
                                }} 
                                className="w-full bg-transparent border-none outline-none focus:ring-0 text-xs font-semibold"
                              >
                                <option value="">Select...</option>
                                {['Self', 'Father', 'Mother', 'Spouse', 'Son', 'Daughter', 'Brother', 'Sister', 'Mother in law', 'Father in law', 'Sister in law', 'Brother in law', 'Neice', 'Nephew', 'Grand Mother', 'Grand Father', 'Other'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            ) : (
                              <div className="flex items-center gap-1">
                                <input type="text" value={member.relationship || ''} onChange={(e) => updateListItem(familyMembers, setFamilyMembers, idx, 'relationship', e.target.value)} className="w-full bg-transparent border-none outline-none focus:ring-0 text-xs font-semibold border-b border-slate-300" placeholder="Please specify..." autoFocus />
                                <button onClick={() => { const newFm = [...familyMembers]; newFm[idx]._otherRelation = false; newFm[idx].relationship = ''; setFamilyMembers(newFm); }} className="text-slate-400 hover:text-slate-600">×</button>
                              </div>
                            )}
                          </td>
                          <td className="p-2 border-r border-slate-100">
                            <input type="number" value={member.age} onChange={(e) => updateListItem(familyMembers, setFamilyMembers, idx, 'age', Number(e.target.value))} className="w-full bg-transparent border-none outline-none focus:ring-0 text-xs font-semibold" />
                          </td>
                          <td className="p-2 border-r border-slate-100">
                            {!member._otherProfession ? (
                              <select 
                                value={member.profession || ''} 
                                onChange={(e) => { 
                                  const newFm = [...familyMembers]; 
                                  if (e.target.value === 'Other') {
                                    newFm[idx]._otherProfession = true;
                                    newFm[idx].profession = '';
                                  } else {
                                    newFm[idx].profession = e.target.value; 
                                  }
                                  setFamilyMembers(newFm); 
                                }} 
                                className="w-full bg-transparent border-none outline-none focus:ring-0 text-xs font-semibold"
                              >
                                <option value="">Select...</option>
                                {['Student', 'Working professional', 'Housewife', 'Business', 'Salaried', 'Retired', 'Other'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            ) : (
                              <div className="flex items-center gap-1">
                                <input type="text" value={member.profession || ''} onChange={(e) => updateListItem(familyMembers, setFamilyMembers, idx, 'profession', e.target.value)} className="w-full bg-transparent border-none outline-none focus:ring-0 text-xs font-semibold border-b border-slate-300" placeholder="Please specify..." autoFocus />
                                <button onClick={() => { const newFm = [...familyMembers]; newFm[idx]._otherProfession = false; newFm[idx].profession = ''; setFamilyMembers(newFm); }} className="text-slate-400 hover:text-slate-600">×</button>
                              </div>
                            )}
                          </td>
                          <td className="p-2 border-r border-slate-100">
                            {!member._otherQualification ? (
                              <select 
                                value={member.qualification || ''} 
                                onChange={(e) => { 
                                  const newFm = [...familyMembers]; 
                                  if (e.target.value === 'Other') {
                                    newFm[idx]._otherQualification = true;
                                    newFm[idx].qualification = '';
                                  } else {
                                    newFm[idx].qualification = e.target.value; 
                                  }
                                  setFamilyMembers(newFm); 
                                }} 
                                className="w-full bg-transparent border-none outline-none focus:ring-0 text-xs font-semibold"
                              >
                                <option value="">Select...</option>
                                {['10th Pass', '12th Pass', 'Graduate', 'Post Graduate', 'Illiterate', 'Other'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            ) : (
                              <div className="flex items-center gap-1">
                                <input type="text" value={member.qualification || ''} onChange={(e) => updateListItem(familyMembers, setFamilyMembers, idx, 'qualification', e.target.value)} className="w-full bg-transparent border-none outline-none focus:ring-0 text-xs font-semibold border-b border-slate-300" placeholder="Please specify..." autoFocus />
                                <button onClick={() => { const newFm = [...familyMembers]; newFm[idx]._otherQualification = false; newFm[idx].qualification = ''; setFamilyMembers(newFm); }} className="text-slate-400 hover:text-slate-600">×</button>
                              </div>
                            )}
                          </td>
                          <td className="p-2 border-r border-slate-100 text-center">
                            <select value={member.isDependent !== false ? 'Yes' : 'No'} onChange={(e) => updateListItem(familyMembers, setFamilyMembers, idx, 'isDependent', e.target.value === 'Yes')} className="bg-transparent border-none outline-none focus:ring-0 text-xs font-semibold">
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
            <Field label="17. Executive Name" className="pt-6 border-t border-slate-200">
              <input
                type="text"
                value={executiveName}
                onChange={(e) => setExecutiveName(e.target.value)}
                placeholder="Enter Executive Name..."
                className="w-full md:w-1/2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold bg-white"
              />
            </Field>

            {/* 18. Tata Capital Distance (Conditional) */}
            {selectedClient?.name === 'Tata Capital Limited' && (
              <Field label="18. Distance from Tata Capital Office (In Km's)" className="pt-6 border-t border-slate-200">
                <input
                  type="text"
                  value={tataCapitalDistance}
                  onChange={(e) => setTataCapitalDistance(e.target.value)}
                  placeholder="e.g. 5-10 Km (Approx)"
                  className="w-full md:w-1/2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold bg-white"
                />
              </Field>
            )}

          </div>
          {tabFooter}
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
            <Field label="1. Vintage of the Business" labelClassName="block text-xs font-bold text-slate-700" className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Business Age (Years)" labelClassName={SUB_LABEL}>
                  <div className="flex gap-2 items-center">
                    <input type="number" min="0" value={businessAgeYears} onChange={(e) => { const v = Number(e.target.value); if (v >= 0) setBusinessAgeYears(v); }} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" disabled={businessAgeApprox} placeholder="Years" />
                    <label className="text-[10px] font-bold text-slate-600 flex items-center gap-1 whitespace-nowrap"><input type="checkbox" checked={businessAgeApprox} onChange={(e) => setBusinessAgeApprox(e.target.checked)} className="accent-[#eb8a23]" /> Approx</label>
                  </div>
                </Field>
                {(businessAgeYears !== '' && businessAgeYears < 10) && (
                  <Field label="Previous Occupation / Activity" labelClassName={SUB_LABEL}>
                    <select value={previousOccupation} onChange={(e) => setPreviousOccupation(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold bg-white">
                      <option value="">Select...</option>
                      {['Agriculture', 'Salaried Employment', 'Business', 'Self-employed', 'Labour', 'Student', 'Homemaker', 'Other'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </Field>
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
                  <Field label="Reason to leave the last occupation" labelClassName={SUB_LABEL}>
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
                  </Field>
                )}
                <div className="md:col-span-2 lg:col-span-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-blue-800">Generated Narrative (Editable)</span>
                    <button type="button" onClick={() => setBusinessVintageText('')} className="text-[9px] text-blue-600 hover:underline font-bold">Auto-Generate</button>
                  </div>
                  <textarea value={businessVintageText || vintageSummary} onChange={(e) => setBusinessVintageText(e.target.value)} className="w-full bg-transparent border-0 p-0 text-xs font-semibold text-blue-900 focus:ring-0 resize-none" rows={2} />
                </div>
              </div>
            </Field>

            {/* 2. Number of Staffs */}
            <Field label="2. Number of Staffs" labelClassName="block text-xs font-bold text-slate-700" className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Number of External Staff / Labour" labelClassName={SUB_LABEL}>
                  <div className="flex gap-2">
                    <input type="number" value={externalStaffCount} onChange={(e) => setExternalStaffCount(Number(e.target.value))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" />
                    <button type="button" onClick={() => setExternalStaffCount(0)} className="px-3 py-1.5 text-[10px] bg-slate-200 text-slate-700 font-bold rounded hover:bg-slate-300 whitespace-nowrap">No External Staff</button>
                  </div>
                </Field>
                <Field label="Who manages the business?" labelClassName={SUB_LABEL}>
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
                </Field>
                <div className="md:col-span-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-blue-800">Generated Narrative (Editable)</span>
                    <button type="button" onClick={() => setStaffCountText('')} className="text-[9px] text-blue-600 hover:underline font-bold">Auto-Generate</button>
                  </div>
                  <textarea value={staffCountText || staffingSummary} onChange={(e) => setStaffCountText(e.target.value)} className="w-full bg-transparent border-0 p-0 text-xs font-semibold text-blue-900 focus:ring-0 resize-none" rows={2} />
                </div>
              </div>
            </Field>

            {/* 3. Is Office Premise Rented / Owned */}
            <Field label="3. Is Office Premise Rented / Owned" labelClassName="block text-xs font-bold text-slate-700 mb-2">
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
            </Field>

            {/* 4. Details of Office / Factory Infrastructure */}
            {!isSlimForm && (
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
                    <input type="text" value={asset.name} onChange={(e) => updateListItem(businessAssets, setBusinessAssets, idx, 'name', e.target.value)} placeholder="Asset / Machine Name" className="col-span-2 px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    <input type="number" value={asset.quantity} onChange={(e) => updateListItem(businessAssets, setBusinessAssets, idx, 'quantity', Number(e.target.value))} placeholder="Qty" className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    <input type="text" value={asset.size} onChange={(e) => updateListItem(businessAssets, setBusinessAssets, idx, 'size', e.target.value)} placeholder="Size / Capacity" className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                    <select value={asset.condition} onChange={(e) => updateListItem(businessAssets, setBusinessAssets, idx, 'condition', e.target.value)} className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]">
                      <option value="Operational">Operational</option>
                      <option value="Non-Operational">Non-Operational</option>
                      <option value="Needs Repair">Needs Repair</option>
                    </select>
                    <div className="flex items-center gap-1">
                      <input type="text" value={asset.remarks} onChange={(e) => updateListItem(businessAssets, setBusinessAssets, idx, 'remarks', e.target.value)} placeholder="Remarks" className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
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
            )}

            {/* 5. Stock Details */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-bold text-slate-700">5. Stock Details with Estimated Value</h4>
                <Field label="Stock Available?" labelClassName="text-[10px] font-bold text-slate-500" className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <button type="button" onClick={() => setHasStock(true)} className={`px-3 py-1 text-[10px] font-bold rounded ${hasStock ? 'bg-[#eb8a23] text-white' : 'bg-slate-200 text-slate-600'}`}>Yes</button>
                    <button type="button" onClick={() => setHasStock(false)} className={`px-3 py-1 text-[10px] font-bold rounded ${!hasStock ? 'bg-[#eb8a23] text-white' : 'bg-slate-200 text-slate-600'}`}>No</button>
                  </div>
                  {hasStock && (
                    <button type="button" onClick={() => setStockDetails([...stockDetails, { id: Date.now(), name: '', quantity: 0, unit: 'kg', value: 0, remarks: '' }])} className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-[#2d3e50] border border-slate-300 text-[10px] font-bold rounded hover:bg-slate-200">
                      <Plus className="w-3 h-3" /> Add Stock
                    </button>
                  )}
                </Field>
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
                      <input type="text" value={stock.name} onChange={(e) => updateListItem(stockDetails, setStockDetails, idx, 'name', e.target.value)} placeholder="Stock Name" className="col-span-2 px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                      <input type="number" value={stock.quantity} onChange={(e) => updateListItem(stockDetails, setStockDetails, idx, 'quantity', Number(e.target.value))} placeholder="Qty" className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                      <input type="text" value={stock.unit} onChange={(e) => updateListItem(stockDetails, setStockDetails, idx, 'unit', e.target.value)} placeholder="Unit" className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                      <div className="relative">
                        <span className="absolute left-2 top-2 text-[10px] font-bold text-slate-500">₹</span>
                        <input type="number" value={stock.value} onChange={(e) => updateListItem(stockDetails, setStockDetails, idx, 'value', Number(e.target.value))} placeholder="Value" className="w-full pl-5 pr-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                      </div>
                      <div className="flex items-center gap-1">
                        <input type="text" value={stock.remarks} onChange={(e) => updateListItem(stockDetails, setStockDetails, idx, 'remarks', e.target.value)} placeholder="Remarks" className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
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

            {/* 6-11: fields not used by Tata/SBFC reports */}
            {!isSlimForm && (<>
            {/* 6. Details and confirmation of business by neighbor */}
            <Field label="6. Details and confirmation of business by neighbor" labelClassName="block text-xs font-bold text-slate-700" className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <Field label="Neighbor Name" labelClassName={SUB_LABEL}>
                <input type="text" value={businessNeighbourName} onChange={(e) => setBusinessNeighbourName(e.target.value)} className="w-full md:w-1/2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]" placeholder="e.g. Adjoining neighbors" />
              </Field>
              <div>
                <Field label="Feedback Remark" labelClassName="block text-[10px] uppercase font-bold text-slate-500" className="flex items-center justify-between mb-1">
                  <button type="button" onClick={() => setBusinessNeighbourFeedback("Neighbour verification was conducted, wherein neighbours confirmed that the applicant has been engaged in his stated business for a considerable period, indicating business stability. The feedback received was positive regarding his work, and overall reputation in the locality.")} className="text-[9px] text-[#eb8a23] hover:underline font-bold">Autofill Standard Positive Remark</button>
                </Field>
                <textarea value={businessNeighbourFeedback} onChange={(e) => setBusinessNeighbourFeedback(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] text-blue-900 bg-blue-50 font-semibold" rows={3} />
              </div>
            </Field>

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
            <Field label="8. Asset Creation Through Business" labelClassName="block text-xs font-bold text-slate-700" className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-slate-600">Has business income been used for asset creation?</span>
                <button type="button" onClick={() => setBusinessIncomeAssetCreation(true)} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border ${businessIncomeAssetCreation ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-white text-slate-600 border-slate-300'}`}>Yes</button>
                <button type="button" onClick={() => { setBusinessIncomeAssetCreation(false); setCreatedAssets([]); }} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border ${!businessIncomeAssetCreation ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-white text-slate-600 border-slate-300'}`}>No</button>
              </div>

              {businessIncomeAssetCreation && (
                <div className="space-y-4 mt-2">
                  <Field label="What assets were created?" labelClassName={SUB_LABEL}>
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
                  </Field>

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
            </Field>

            {/* 9. Business Investment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="9. Business Investment (Initial)">
                <div className="relative">
                  <span className="absolute left-3 top-2 text-[10px] font-bold text-slate-500">₹</span>
                  <input type="number" value={initialInvestment} onChange={(e) => setInitialInvestment(Number(e.target.value))} className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Amount" />
                </div>
              </Field>
              <Field label="Investment Source">
                <select value={investmentSource} onChange={(e) => setInvestmentSource(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold bg-white">
                  <option value="">Select...</option>
                  {['Own Funds', 'Loan', 'Family Funds', 'Combination', 'Other'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {investmentSource === 'Other' && (
                  <input type="text" value={investmentSourceOther} onChange={(e) => setInvestmentSourceOther(e.target.value)} className="w-full mt-2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]" placeholder="Specify Source" />
                )}
              </Field>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-blue-800">Generated Narrative (Editable)</span>
                <button type="button" onClick={() => setBusinessInvestmentText('')} className="text-[9px] text-blue-600 hover:underline font-bold">Auto-Generate</button>
              </div>
              <textarea value={businessInvestmentText || `Started with an initial investment of approx ₹${initialInvestment || 1} Lakhs.`} onChange={(e) => setBusinessInvestmentText(e.target.value)} className="w-full bg-transparent border-0 p-0 text-xs font-semibold text-blue-900 focus:ring-0 resize-none" rows={2} />
            </div>

            {/* 10. Agricultural Income Details */}
            <Field label="10. Agricultural Income Details" labelClassName="block text-xs font-bold text-slate-700" className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
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
                          {['Bigha', 'Acre', 'Hectare', 'Other'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                    </div>
                    <Field label="Ownership" labelClassName={SUB_LABEL}>
                      <select value={agriLandOwnership} onChange={(e) => setAgriLandOwnership(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23] bg-white">
                        {['Self-owned', 'Family-owned', 'Leased', 'Other'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </Field>
                    <Field label="Document Available?" labelClassName={SUB_LABEL}>
                      <select value={agriOwnershipDoc} onChange={(e) => setAgriOwnershipDoc(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23] bg-white">
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                        <option value="Not Provided">Not Provided</option>
                      </select>
                    </Field>
                  </div>
                  <Field label="Crops" labelClassName="block text-[10px] uppercase font-bold text-slate-500 mb-2">
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
                  </Field>
                  <Field label="Approximate Annual Agricultural Income" labelClassName={SUB_LABEL}>
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
                  </Field>
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
            </Field>

            {/* 10. Other Source Income */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <Field label="10. Other source income" labelClassName="block text-xs font-bold text-slate-700" className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setHasOtherIncome(true)} className={`px-3 py-1 text-[10px] font-bold rounded ${hasOtherIncome ? 'bg-[#eb8a23] text-white' : 'bg-slate-200 text-slate-600'}`}>Yes</button>
                  <button type="button" onClick={() => setHasOtherIncome(false)} className={`px-3 py-1 text-[10px] font-bold rounded ${!hasOtherIncome ? 'bg-[#eb8a23] text-white' : 'bg-slate-200 text-slate-600'}`}>No</button>
                </div>
              </Field>

              {!hasOtherIncome ? (
                <div className="text-xs font-semibold text-slate-500 italic">No other source of income reported.</div>
              ) : (
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <button type="button" onClick={() => setOtherIncomeSources([...otherIncomeSources, { id: Date.now(), source: 'Salary', frequency: 'Monthly', amount: 0, remarks: '' }])} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-[#2d3e50] border border-slate-300 text-[10px] font-bold rounded hover:bg-slate-200">
                    <Plus className="w-3 h-3" /> Add Income Source
                  </button>
                  {otherIncomeSources.map((inc, idx) => (
                    <div key={inc.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-2 border border-slate-200 rounded-lg bg-white items-center">
                      <select value={inc.source} onChange={(e) => updateListItem(otherIncomeSources, setOtherIncomeSources, idx, 'source', e.target.value)} className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]">
                        {['Salary', 'Rent', 'Agriculture', 'Pension', 'Business', 'Investment', 'Other'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                      <select value={inc.frequency} onChange={(e) => updateListItem(otherIncomeSources, setOtherIncomeSources, idx, 'frequency', e.target.value)} className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]">
                        <option value="Monthly">Monthly</option>
                        <option value="Annual">Annual</option>
                      </select>
                      <div className="relative">
                        <span className="absolute left-2 top-2 text-[10px] font-bold text-slate-500">₹</span>
                        <input type="number" value={inc.amount} onChange={(e) => updateListItem(otherIncomeSources, setOtherIncomeSources, idx, 'amount', Number(e.target.value))} placeholder="Amount" className="w-full pl-5 pr-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                      </div>
                      <div className="flex items-center gap-1 col-span-2">
                        <input type="text" value={inc.remarks} onChange={(e) => updateListItem(otherIncomeSources, setOtherIncomeSources, idx, 'remarks', e.target.value)} placeholder="Remarks" className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                        <button onClick={() => { const arr = [...otherIncomeSources]; arr.splice(idx, 1); setOtherIncomeSources(arr); }} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 11. Solar Saving Analysis */}
            <Field label="11. Solar Saving Analysis" labelClassName="block text-xs font-bold text-orange-900" className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Expected Reduction in Operational Cost" labelClassName="block text-[10px] uppercase font-bold text-orange-700 mb-1">
                  <div className="relative">
                    <input type="number" value={expectedSolarCostReductionPct} onChange={(e) => setExpectedSolarCostReductionPct(Number(e.target.value))} className="w-full pr-7 pl-3 py-2 text-xs border border-orange-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold bg-white" placeholder="Percentage" />
                    <span className="absolute right-3 top-2 text-slate-500 font-bold">%</span>
                  </div>
                </Field>
                <Field label="Expected Monthly Saving" labelClassName="block text-[10px] uppercase font-bold text-orange-700 mb-1">
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-500 font-bold">₹</span>
                    <input type="number" value={expectedSolarMonthlySaving} onChange={(e) => setExpectedSolarMonthlySaving(Number(e.target.value))} className="w-full pl-7 pr-3 py-2 text-xs border border-orange-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold bg-white" placeholder="Amount" />
                  </div>
                </Field>
                <div className="md:col-span-2 p-3 bg-white border border-orange-200 rounded-lg flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-orange-800">Generated Narrative (Editable)</span>
                    <button type="button" onClick={() => setSolarSavingText('')} className="text-[9px] text-orange-600 hover:underline font-bold">Auto-Generate</button>
                  </div>
                  <textarea value={solarSavingText || `As informed by the applicant, machinery is presently operated through ${powerSource.toLowerCase()} setup and approximate electricity expenses are around ₹${monthlyEnergyExpense || 0} per month. Applicant expects reduction in approx. ${expectedSolarCostReductionPct || 0}% operational cost after solar installation.`} onChange={(e) => setSolarSavingText(e.target.value)} className="w-full bg-transparent border-0 p-0 text-xs font-semibold text-orange-900 focus:ring-0 resize-none" rows={2} />
                </div>
              </div>
            </Field>
            </>)}

            {/* 12. Address of additional business with or without income assessment */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <Field label="12. Address of additional business with or without income assessment" labelClassName="block text-xs font-bold text-slate-700">
              </Field>

              <div className="space-y-4 mt-3 border-t border-slate-200 pt-3">
                <Field label="Address" labelClassName={SUB_LABEL}>
                  <textarea value={additionalBusinessAddress} onChange={(e) => setAdditionalBusinessAddress(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" rows={2} placeholder="Enter address of additional business" />
                </Field>
                <Field label="Income Assessment Details" labelClassName="block text-[10px] uppercase font-bold text-slate-500 mb-2">
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
                </Field>
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
            <Field label="12. Met Person During Visit Time">
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
            </Field>

            {/* 13. Address of the Meeting */}
            <div className="space-y-3">
              <Field label="13. Address of the Meeting" labelClassName="block text-xs font-bold text-slate-700" className="flex justify-between items-center">
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
              </Field>
              <div className="grid grid-cols-1 gap-3 opacity-90">
                <textarea value={meetingAddress} onChange={(e) => setMeetingAddress(e.target.value)} disabled={meetingAddressSource !== 'OTHER'} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold disabled:bg-slate-100" placeholder="Enter complete meeting address" rows={2} />
              </div>
            </div>

            {/* 14. Locating Premises Type */}
            <Field label="14. Locating Premises Type" labelClassName="block text-xs font-bold text-slate-700 mb-2">
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
            </Field>

            {/* 15. Ownership */}
            <Field label="15. Ownership" labelClassName="block text-xs font-bold text-slate-700" className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
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
                  <Field label="Monthly Rent" labelClassName={SUB_LABEL}>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-[10px] font-bold text-slate-500">₹</span>
                      <input type="number" value={propertyRentAmount} onChange={(e) => {
                        const val = Number(e.target.value);
                        setPropertyRentAmount(val);
                        setMonthlyRent(val);
                        const rentExpIndex = expenseLines.findIndex(exp => exp.particulars.toLowerCase().includes('rent'));
                        if (rentExpIndex > -1) {
                           const newExp = [...expenseLines];
                           newExp[rentExpIndex].monthlyAmount = val;
                           setExpenseLines(newExp);
                        } else {
                           setExpenseLines([...expenseLines, { id: 'rent-exp-' + Date.now(), particulars: 'Rent Expense', monthlyAmount: val }]);
                        }
                      }} className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Amount" />
                    </div>
                  </Field>
                )}
                {propertyOwnership === 'Self-Owned' && (
                  <Field label="Property Owner Name" labelClassName={SUB_LABEL}>
                    <div className="flex gap-2">
                      <input type="text" value={propertyOwnerName} onChange={(e) => setPropertyOwnerName(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Name" />
                      <button type="button" onClick={() => setPropertyOwnerName(applicantName)} className="text-[10px] whitespace-nowrap bg-slate-200 px-2 py-1 rounded font-bold text-slate-700">Set Applicant</button>
                    </div>
                  </Field>
                )}

                <Field label="Approximate Property Area (Sq. Ft.)" labelClassName={SUB_LABEL}>
                  <input type="number" value={propertyArea} onChange={(e) => setPropertyArea(Number(e.target.value))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Sq. Ft." />
                </Field>
                <Field label="Approximate Property Value" labelClassName={SUB_LABEL}>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-[10px] font-bold text-slate-500">₹</span>
                    <input type="number" value={propertyValue} onChange={(e) => setPropertyValue(Number(e.target.value))} className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Value" />
                  </div>
                </Field>
                <Field label="Ownership Document Available?" labelClassName={SUB_LABEL}>
                  <select value={propertyOwnershipDoc} onChange={(e) => setPropertyOwnershipDoc(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23] bg-white">
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Not Provided">Not Provided</option>
                  </select>
                </Field>
              </div>
            </Field>

            {/* 16. House Details */}
            <Field label="16. House Details" labelClassName="block text-xs font-bold text-slate-700" className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="Number of Floors" labelClassName={SUB_LABEL}>
                  <input type="number" value={houseFloors} onChange={(e) => setHouseFloors(Number(e.target.value))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Floors" />
                </Field>
                <Field label="Number of Rooms" labelClassName={SUB_LABEL}>
                  <input type="number" value={houseRooms} onChange={(e) => setHouseRooms(Number(e.target.value))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Rooms" />
                </Field>
                <Field label="Structure Type" labelClassName={SUB_LABEL}>
                  <select value={houseStructureType} onChange={(e) => setHouseStructureType(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23] bg-white">
                    <option value="">Select...</option>
                    {['Single Story', 'Double Story', 'Multi Story', 'Other'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </Field>
                <Field label="Floor" labelClassName={SUB_LABEL}>
                  <select value={houseFloorPosition} onChange={(e) => setHouseFloorPosition(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23] bg-white">
                    <option value="">Select...</option>
                    {['Ground Floor', 'Ground + 1', 'Ground + 2', 'Other'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {houseStructureType === 'Other' && <input type="text" value={houseStructureTypeOther} onChange={(e) => setHouseStructureTypeOther(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Specify Structure Type" />}
                {houseFloorPosition === 'Other' && <input type="text" value={houseFloorPositionOther} onChange={(e) => setHouseFloorPositionOther(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Specify Floor Position" />}
              </div>
              <Field label="Additional Details" labelClassName={SUB_LABEL}>
                <input type="text" value={houseAdditionalDetails} onChange={(e) => setHouseAdditionalDetails(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Optional details..." />
              </Field>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs font-semibold text-blue-800">
                <span className="font-bold">Generated Summary:</span> {getHouseDetailsSummary()}
              </div>
            </Field>

            {/* 17. Family Background of the Applicant */}
            <Field label="17. Family Background of the Applicant">
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
            </Field>

            {/* 18. Monthly Household Expenses */}
            <Field label="18. Monthly Household Expenses">
              <div className="relative md:w-1/3">
                <span className="absolute left-3 top-2 text-[10px] font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  value={monthlyHouseholdExpensesAmount}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Number(e.target.value);
                    setMonthlyHouseholdExpensesAmount(val);
                  }}
                  className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold"
                  placeholder="Amount / month"
                />
              </div>
            </Field>

            {/* 19A-21: electricity & neighbor fields not used by Tata/SBFC reports */}
            {!isSlimForm && (<>
            {/* 19A. Residence Electricity Connection Details */}
            <Field label="19A. Residence Electricity Connection Details" labelClassName="block text-xs font-bold text-slate-700" className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div className="flex gap-2">
                {['Yes', 'No', 'Not Provided'].map(opt => (
                  <button key={opt} type="button" onClick={() => setHasResElectricityConnection(opt)} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border ${hasResElectricityConnection === opt ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-white text-slate-600 border-slate-300'}`}>{opt}</button>
                ))}
              </div>

              {hasResElectricityConnection === 'Yes' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 border-t border-slate-200">
                  <Field label="Connection Type" labelClassName={SUB_LABEL}>
                    <select value={resElectricityConnectionType} onChange={(e) => setResElectricityConnectionType(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23] bg-white">
                      <option value="">Select...</option>
                      {['Domestic', 'Commercial', 'Agricultural', 'Other'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    {resElectricityConnectionType === 'Other' && (
                      <input type="text" value={resElectricityConnectionTypeOther} onChange={(e) => setResElectricityConnectionTypeOther(e.target.value)} className="w-full mt-2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Specify Type" />
                    )}
                  </Field>
                  <Field label="Supplier Name" labelClassName={SUB_LABEL}>
                    <input type="text" value={resElectricitySupplierName} onChange={(e) => setResElectricitySupplierName(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="e.g. BSES, Tata Power" />
                  </Field>
                  <Field label="Consumer Number" labelClassName={SUB_LABEL}>
                    <input type="text" value={resElectricityConsumerNumber} onChange={(e) => setResElectricityConsumerNumber(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Optional" />
                  </Field>
                  <Field label="Monthly Expense" labelClassName={SUB_LABEL}>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-[10px] font-bold text-slate-500">₹</span>
                      <input type="number" value={resElectricityMonthlyExpense} onChange={(e) => setResElectricityMonthlyExpense(Number(e.target.value))} className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Amount" />
                    </div>
                  </Field>
                </div>
              )}
              {hasResElectricityConnection === 'No' && <div className="text-xs font-semibold text-blue-800 bg-blue-50 p-2 rounded">Generated: No Electricity Connection at Residence</div>}
            </Field>

            {/* 19B. Business Electricity Connection Details */}
            <Field label="19B. Business Electricity Connection Details" labelClassName="block text-xs font-bold text-slate-700" className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div className="flex gap-2">
                {['Yes', 'No', 'Not Provided'].map(opt => (
                  <button key={opt} type="button" onClick={() => setHasElectricityConnection(opt)} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border ${hasElectricityConnection === opt ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-white text-slate-600 border-slate-300'}`}>{opt}</button>
                ))}
              </div>

              {hasElectricityConnection === 'Yes' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 border-t border-slate-200">
                  <Field label="Connection Type" labelClassName={SUB_LABEL}>
                    <select value={electricityConnectionType} onChange={(e) => setElectricityConnectionType(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23] bg-white">
                      <option value="">Select...</option>
                      {['Domestic', 'Commercial', 'Agricultural', 'Other'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    {electricityConnectionType === 'Other' && (
                      <input type="text" value={electricityConnectionTypeOther} onChange={(e) => setElectricityConnectionTypeOther(e.target.value)} className="w-full mt-2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Specify Type" />
                    )}
                  </Field>
                  <Field label="Supplier Name" labelClassName={SUB_LABEL}>
                    <input type="text" value={electricitySupplierName} onChange={(e) => setElectricitySupplierName(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="e.g. BSES, Tata Power" />
                  </Field>
                  <Field label="Consumer Number" labelClassName={SUB_LABEL}>
                    <input type="text" value={electricityConsumerNumber} onChange={(e) => setElectricityConsumerNumber(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Optional" />
                  </Field>
                  <Field label="Monthly Expense" labelClassName={SUB_LABEL}>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-[10px] font-bold text-slate-500">₹</span>
                      <input type="number" value={electricityMonthlyExpense} onChange={(e) => setElectricityMonthlyExpense(Number(e.target.value))} className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Amount" />
                    </div>
                  </Field>
                </div>
              )}
              {hasElectricityConnection === 'No' && <div className="text-xs font-semibold text-blue-800 bg-blue-50 p-2 rounded">Generated: No Electricity Connection at Business</div>}
            </Field>

            {/* 20. Neighbor Name */}
            <div className="space-y-3">
              <Field label="20. Neighbor Name" labelClassName="block text-xs font-bold text-slate-700" className="flex justify-between items-center">
                <button type="button" onClick={() => setNeighbors([{ id: Date.now(), name: 'Adjoining neighbors', remark: '' }])} className="text-[10px] bg-slate-100 px-2 py-1 rounded border border-slate-300 font-bold hover:bg-slate-200">No Specific Neighbor Provided</button>
              </Field>

              <div className="space-y-2">
                <button type="button" onClick={() => setNeighbors([...neighbors, { id: Date.now(), name: '', remark: '' }])} className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-[#2d3e50] border border-slate-300 text-[10px] font-bold rounded hover:bg-slate-200">
                  <Plus className="w-3 h-3" /> Add Neighbor
                </button>
                {neighbors.map((neighbor, idx) => (
                  <div key={neighbor.id} className="flex items-center gap-2">
                    <input type="text" value={neighbor.name} onChange={(e) => updateListItem(neighbors, setNeighbors, idx, 'name', e.target.value)} className="w-1/2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Neighbor Name" />
                    <input type="text" value={neighbor.remark} onChange={(e) => updateListItem(neighbors, setNeighbors, idx, 'remark', e.target.value)} className="w-1/2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Relationship / Location" />
                    <button onClick={() => { const arr = [...neighbors]; arr.splice(idx, 1); setNeighbors(arr); }} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* 21. Neighbor Feedback */}
            <Field label="21. Neighbor Feedback" labelClassName="block text-xs font-bold text-slate-700" className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-slate-600">Neighbor Verification Conducted?</span>
                <button type="button" onClick={() => setNeighborVerificationConducted(true)} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border ${neighborVerificationConducted ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-white text-slate-600 border-slate-300'}`}>Yes</button>
                <button type="button" onClick={() => setNeighborVerificationConducted(false)} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border ${!neighborVerificationConducted ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-white text-slate-600 border-slate-300'}`}>No</button>
              </div>

              {neighborVerificationConducted && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <Field label="Residence Confirmation" labelClassName={SUB_LABEL}>
                    <select value={neighborResidenceConfirmed} onChange={(e) => setNeighborResidenceConfirmed(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23] bg-white">
                      <option value="">Select...</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Not Confirmed">Not Confirmed</option>
                      <option value="Partially Confirmed">Partially Confirmed</option>
                    </select>
                  </Field>
                  <Field label="Behaviour Feedback" labelClassName={SUB_LABEL}>
                    <select value={neighborBehaviourFeedback} onChange={(e) => setNeighborBehaviourFeedback(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23] bg-white">
                      <option value="">Select...</option>
                      {['Positive', 'Neutral', 'Negative', 'Not Provided'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </Field>
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
            </Field>
            </>)}

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
            <Field label="23. Residence Status" labelClassName="block text-xs font-bold text-slate-700" className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex flex-wrap gap-2">
                {['Recommended', 'Not Recommended', 'Recommended subjects to demerits'].map(opt => (
                  <button key={opt} type="button" onClick={() => setResidenceStatus(opt)} className={`px-4 py-2 text-xs font-bold rounded-lg border ${residenceStatus === opt ? (opt === 'Recommended' ? 'bg-green-600 text-white border-green-600' : opt === 'Not Recommended' ? 'bg-red-600 text-white border-red-600' : 'bg-[#eb8a23] text-white border-[#eb8a23]') : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>
                    {opt}
                  </button>
                ))}
              </div>
              {(residenceStatus === 'Not Recommended' || residenceStatus === 'Recommended subjects to demerits') && (
                <textarea value={residenceStatusReason} onChange={(e) => setResidenceStatusReason(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder={`Reason for ${residenceStatus}...`} rows={3} />
              )}
            </Field>

          </div>
          {tabFooter}
        </div>
      )}

      {activeTab === 'customer_supplier' && (
        <CustomerSupplierSection
          details={customerSupplier}
          showCollateral={['ambit', 'abhiyan', 'lap'].some(key => (selectedClient?.name || '').toLowerCase().includes(key))}
          coApplicants={coApplicants}
          setCoApplicants={setCoApplicants}
          gpsLat={gpsLat}
          gpsLng={gpsLng}
          setGpsLat={setGpsLat}
          setGpsLng={setGpsLng}
          statusOptions={caseStatusOptions}
          status={statusOfCase}
          onStatusChange={handleStatusChange}
          footer={tabFooter}
        />
      )}

      {activeTab === 'field' && (
        <FieldInvestigationSection evidence={photoEvidence} footer={tabFooter} />
      )}

      {/* TAB 5.1: CO-APPLICANT BUSINESS */}
      {activeTab === 'coapp_business' && (
        <CoApplicantBusinessSection form={coApplicantBusiness} footer={tabFooter} />
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
            </div>

            {selectedClient?.name?.toLowerCase().includes('godrej') && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
                <Field label="Tenor Requested">
                  <input type="text" value={tenorRequested} onChange={(e) => godrej.setField('tenorRequested', e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="e.g. 36 Months" />
                </Field>
                <Field label="Margins Assessed">
                  <input type="text" value={marginsAssessed} onChange={(e) => godrej.setField('marginsAssessed', e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="e.g. 20%" />
                </Field>
                <Field label="Customer GST No.">
                  <input type="text" value={customerGstNo} onChange={(e) => godrej.setField('customerGstNo', e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="e.g. 27ABCDE1234F1Z5" />
                </Field>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-2 mb-4">
              <Field label="Profit Margin (%)">
                <input type="number" value={profitMargin} onChange={(e) => setProfitMargin(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="e.g. 20" />
              </Field>
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
            <ItemizedLinesTable
              accent="emerald"
              title={`Itemized Income & Goods Revenue (${currentCategory.name})`}
              subtitle="Editable Price × Quantity per Day × Working Days format."
              headerRight={
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
              }
              firstColumnLabel="Item / Particulars"
              emptyMessage={<>No itemized product lines added yet. Click &quot;+ Add Income Item Line&quot; to specify itemized quantities and rates, or use the Stated Monthly Sales Turnover below.</>}
              notesPlaceholder="e.g. 8 Quintal x 100 Kg x ₹1.60 x 28 Days"
              deleteTitle="Delete Item Line"
              addLabel="Add Income Item Line"
              lines={incomeLines}
              onUpdate={handleUpdateIncomeLine}
              onRemove={handleRemoveIncomeLine}
              onAdd={handleAddIncomeLine}
            />

            {/* Direct Monthly Expenditure Breakdown */}
            <ItemizedLinesTable
              accent="rose"
              title={`Itemized Operating Expenditures & Direct Costs (${currentCategory.name})`}
              subtitle="Direct Monthly Basis format."
              headerRight={
                <div className="text-xs font-extrabold px-3 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-lg">
                  Itemized Expense Total: ₹{itemizedMonthlyExpenseTotal.toLocaleString('en-IN')} / mo
                </div>
              }
              firstColumnLabel="Expenditure / Cost Line"
              emptyMessage="No custom expense lines added. Standard operating expenses (COGS, Salaries, Rent, Utilities, etc.) configured below will be included in the assessment."
              notesPlaceholder="e.g. Estimated based on usage"
              deleteTitle="Delete Expense Line"
              addLabel="Add Expenditure Line"
              lines={expenseLines}
              onUpdate={handleUpdateExpenseLine}
              onRemove={handleRemoveExpenseLine}
              onAdd={handleAddExpenseLine}
            />

            {/* Assessment of the monthly income of the co-applicant */}
            {hasCoAppInBusiness && (
              <div className="border-2 border-indigo-200 bg-indigo-50/40 rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200 pb-3">
                  <div>
                    <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-indigo-600" />
                      Assessment of the monthly income of the co-applicant {coAppBusinessPerson?.name ? `(${coAppBusinessPerson.name})` : ''}
                    </h4>
                    <p className="text-[11px] text-indigo-700 font-medium">Income and expenditure assessment for co-applicant business operations.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-xs font-extrabold px-3 py-1 bg-indigo-100 text-indigo-900 border border-indigo-300 rounded-lg">
                      Co-App Net Profit: ₹{coAppNetBusinessIncome.toLocaleString('en-IN')} / mo
                    </div>
                  </div>
                </div>

                {/* Live Waterfall cards for Co-applicant */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white border border-indigo-200 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Co-App Monthly Sales (A)</p>
                    <div className="text-lg font-black text-indigo-950 mt-0.5">₹{coAppAdoptedMonthlySales.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="bg-white border border-indigo-200 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Co-App Monthly Expenses (B)</p>
                    <div className="text-lg font-black text-rose-700 mt-0.5">₹{coAppTotalOperatingExpenses.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="bg-white border border-indigo-200 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Co-App Net Profit (A - B)</p>
                    <div className="text-lg font-black text-emerald-700 mt-0.5">₹{coAppNetBusinessIncome.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                {/* Itemized Co-Applicant Sales */}
                <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h5 className="text-xs font-bold text-slate-700 uppercase">Co-Applicant Sales / Revenue Line Items</h5>
                    <button
                      type="button"
                      onClick={handleAddCoAppIncomeLine}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-bold transition flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Co-App Income Line
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                        <tr>
                          <th className="p-2">Particulars</th>
                          <th className="p-2">Business Notes</th>
                          <th className="p-2 text-right">Monthly (₹)</th>
                          <th className="p-2 text-right">Yearly (₹)</th>
                          <th className="p-2 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {coAppIncomeLines.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-3 text-center text-slate-400 italic">
                              No itemized lines added. You can add lines or enter Stated Monthly Sales below.
                            </td>
                          </tr>
                        ) : (
                          coAppIncomeLines.map(line => (
                            <tr key={line.id}>
                              <td className="p-1.5">
                                <input
                                  type="text"
                                  value={line.particulars}
                                  onChange={e => handleUpdateCoAppIncomeLine(line.id, 'particulars', e.target.value)}
                                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-bold"
                                  placeholder="e.g. Retail Sales / Service Fees"
                                />
                              </td>
                              <td className="p-1.5">
                                <input
                                  type="text"
                                  value={line.businessNotes || ''}
                                  onChange={e => handleUpdateCoAppIncomeLine(line.id, 'businessNotes', e.target.value)}
                                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                                  placeholder="e.g. Daily average ₹2,000"
                                />
                              </td>
                              <td className="p-1.5 text-right">
                                <input
                                  type="number"
                                  value={line.monthlyAmount || 0}
                                  onChange={e => handleUpdateCoAppIncomeLine(line.id, 'monthlyAmount', Number(e.target.value))}
                                  className="w-24 px-2 py-1 border border-slate-300 rounded text-xs text-right font-bold text-emerald-700"
                                />
                              </td>
                              <td className="p-1.5 text-right font-bold text-slate-600">
                                ₹{((line.monthlyAmount || 0) * 12).toLocaleString('en-IN')}
                              </td>
                              <td className="p-1.5 text-center">
                                <button type="button" onClick={() => handleRemoveCoAppIncomeLine(line.id)} className="text-rose-500 hover:text-rose-700">
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

                {/* Itemized Co-Applicant Expenses */}
                <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h5 className="text-xs font-bold text-slate-700 uppercase">Co-Applicant Operating Expenses Line Items</h5>
                    <button
                      type="button"
                      onClick={handleAddCoAppExpenseLine}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold transition flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Co-App Expense Line
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                        <tr>
                          <th className="p-2">Particulars</th>
                          <th className="p-2">Business Notes</th>
                          <th className="p-2 text-right">Monthly (₹)</th>
                          <th className="p-2 text-right">Yearly (₹)</th>
                          <th className="p-2 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {coAppExpenseLines.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-3 text-center text-slate-400 italic">
                              No custom expense lines added. Direct expenses entered below will be assessed.
                            </td>
                          </tr>
                        ) : (
                          coAppExpenseLines.map(line => (
                            <tr key={line.id}>
                              <td className="p-1.5">
                                <input
                                  type="text"
                                  value={line.particulars}
                                  onChange={e => handleUpdateCoAppExpenseLine(line.id, 'particulars', e.target.value)}
                                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-bold"
                                  placeholder="e.g. Purchases / Rent / Salaries"
                                />
                              </td>
                              <td className="p-1.5">
                                <input
                                  type="text"
                                  value={line.businessNotes || ''}
                                  onChange={e => handleUpdateCoAppExpenseLine(line.id, 'businessNotes', e.target.value)}
                                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                                  placeholder="e.g. Monthly shop rent"
                                />
                              </td>
                              <td className="p-1.5 text-right">
                                <input
                                  type="number"
                                  value={line.monthlyAmount || 0}
                                  onChange={e => handleUpdateCoAppExpenseLine(line.id, 'monthlyAmount', Number(e.target.value))}
                                  className="w-24 px-2 py-1 border border-slate-300 rounded text-xs text-right font-bold text-rose-700"
                                />
                              </td>
                              <td className="p-1.5 text-right font-bold text-slate-600">
                                ₹{((line.monthlyAmount || 0) * 12).toLocaleString('en-IN')}
                              </td>
                              <td className="p-1.5 text-center">
                                <button type="button" onClick={() => handleRemoveCoAppExpenseLine(line.id)} className="text-rose-500 hover:text-rose-700">
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

                {/* Direct Quick Inputs for Co-applicant */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                  <Field label="Co-App Stated Monthly Turnover (₹)" labelClassName="block text-[11px] font-bold text-slate-700 mb-1">
                    <input
                      type="number"
                      min="0"
                      value={coAppStatedMonthlySales}
                      onChange={e => { const v = Number(e.target.value); if (v >= 0) setCoAppStatedMonthlySales(v); }}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-bold text-indigo-900"
                    />
                  </Field>
                  <Field label="Co-App Staff Salaries (₹/mo)" labelClassName="block text-[11px] font-bold text-slate-700 mb-1">
                    <input
                      type="number"
                      min="0"
                      value={coAppSalariesExpense}
                      onChange={e => { const v = Number(e.target.value); if (v >= 0) setCoAppSalariesExpense(v); }}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-semibold"
                    />
                  </Field>
                  <Field label="Co-App Premises Rent (₹/mo)" labelClassName="block text-[11px] font-bold text-slate-700 mb-1">
                    <input
                      type="number"
                      min="0"
                      value={coAppRentExpense}
                      onChange={e => { const v = Number(e.target.value); if (v >= 0) setCoAppRentExpense(v); }}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-semibold"
                    />
                  </Field>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Co-App Utilities & Misc (₹/mo)</label>
                    <input
                      type="number"
                      min="0"
                      value={coAppUtilitiesExpense}
                      onChange={e => { const v = Number(e.target.value); if (v >= 0) setCoAppUtilitiesExpense(v); }}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Waterfall Input Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <Field label="Stated Monthly Sales Turnover (₹)">
                <input
                  type="number"
                  min="0"
                  value={statedMonthlySales}
                  onChange={(e) => { const v = Number(e.target.value); if (v >= 0) setStatedMonthlySales(v); }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold"
                />
              </Field>

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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Proposed {(selectedClient?.name?.toLowerCase().includes('godrej') || selectedClient?.name?.toLowerCase().includes('tata')) ? 'Quotation' : 'Loan'} Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={appliedAmount}
                  onChange={(e) => { const v = Number(e.target.value); if (v >= 0) setAppliedAmount(v); }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold text-[#eb8a23]"
                />
              </div>

              <Field label="Staff Salaries (₹/mo)">
                <input
                  type="number"
                  min="0"
                  value={salariesExpense}
                  onChange={(e) => { const v = Number(e.target.value); if (v >= 0) setSalariesExpense(v); }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-semibold"
                />
              </Field>

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

              <Field label="Household Expenses (₹/mo)">
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
              </Field>

              <Field label="Existing EMI Notes (Report Override)">
                <div className="text-[10px] text-blue-600 font-semibold mb-1">Auto-calculated: {generatedExistingEmiNotes}</div>
                <input
                  type="text"
                  value={existingEmiNotes}
                  onChange={(e) => setExistingEmiNotes(e.target.value)}
                  placeholder="Leave blank to use auto-calculated notes above"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-600"
                />
              </Field>

              <Field label="Comfortable EMI Notes (Report Override)">
                <input
                  type="text"
                  value={comfortableEmiNotes}
                  onChange={(e) => setComfortableEmiNotes(e.target.value)}
                  placeholder="e.g. Post all expenses As per Moneyboxx"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-600"
                />
              </Field>
            </div>

            {/* LIVE FINANCIAL RATIOS CARD */}
            {!isSlimForm && (
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
                <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${dscrRatio >= 1.25 && foirPct <= 60 ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                  }`}>
                  {dscrRatio >= 1.25 && foirPct <= 60 ? 'Policy Compliant' : 'Conditional Approval Needed'}
                </span>
              </div>
            </div>
            )}
          </div>
          {tabFooter}
        </div>
      )}

      {/* TAB 5: AUTOMATED RISK SCORE & AUTOMATIC EXECUTIVE SUMMARY REPORT */}
      {activeTab === 'decision' && (
        <DecisionSection
          applicantName={applicantName}
          firmName={firmName}
          riskAssessment={riskAssessment}
          summary={executiveSummary}
          dscrRatio={dscrRatio}
          foirPct={foirPct}
          appliedAmount={appliedAmount}
          figures={{ monthlySales: adoptedMonthlySales, netBusinessIncome, proposedEmi, postLoanSurplus }}
          managerRole={isManagement ? currentUser?.role ?? null : null}
          footer={tabFooter}
        />
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
                  <Field label="Category Name *">
                    <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]" placeholder="e.g. Mobile Repair Shop" />
                  </Field>
                  <Field label="Industry Group">
                    <select value={newCatIndustry} onChange={(e) => setNewCatIndustry(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]">
                      {['Retail', 'Services', 'Manufacturing', 'Wholesale', 'Other'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </Field>
                  <Field label="Typical Margin Min (%)">
                    <input type="number" value={newCatMarginMin} onChange={(e) => setNewCatMarginMin(Number(e.target.value))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]" />
                  </Field>
                  <Field label="Typical Margin Max (%)">
                    <input type="number" value={newCatMarginMax} onChange={(e) => setNewCatMarginMax(Number(e.target.value))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]" />
                  </Field>
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
                            <td className="p-2"><input type="text" value={p.productName} onChange={(e) => updateListItem(newProducts, setNewProducts, idx, 'productName', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1" placeholder="e.g. Repairs" /></td>
                            <td className="p-2"><input type="number" value={p.revenueContributionPct} onChange={(e) => updateListItem(newProducts, setNewProducts, idx, 'revenueContributionPct', Number(e.target.value))} className="w-16 border border-slate-300 rounded px-2 py-1" /></td>
                            <td className="p-2"><input type="number" value={p.averageMarginPct} onChange={(e) => updateListItem(newProducts, setNewProducts, idx, 'averageMarginPct', Number(e.target.value))} className="w-16 border border-slate-300 rounded px-2 py-1" /></td>
                            <td className="p-2">
                              <select value={p.inventoryType} onChange={(e) => updateListItem(newProducts, setNewProducts, idx, 'inventoryType', e.target.value as any)} className="border border-slate-300 rounded px-2 py-1">
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
                      className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${selectedCategoryId === cat.id
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
      {isAppGalleryOpen && (
        <CaseGalleryModal
          applicants={applicantsList}
          loading={loadingApplicants}
          canManageCases={isManagement}
          canDeleteAll={isAdmin}
          onClose={() => setIsAppGalleryOpen(false)}
          onLoad={handleLoadSampleApp}
          onToggleClosed={handleToggleCloseCase}
          onDelete={app => handleDeleteApplication(app._id || app.applicationNumber)}
          onDeleteAll={handleDeleteAllApplicants}
        />
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

      {/* Google Drive Save Modal */}
      <GoogleDriveSaveModal
        isOpen={isGoogleDriveModalOpen}
        onClose={() => setIsGoogleDriveModalOpen(false)}
        reportData={getCompletePDReportData()}
      />

    </div>
  );
};
export default PDToolView;
