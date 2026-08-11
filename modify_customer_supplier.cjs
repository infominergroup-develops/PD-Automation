const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/PDToolView.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Insert new states
const statesTarget = `  const [residenceStatusReason, setResidenceStatusReason] = useState('');`;

const statesReplacement = `  const [residenceStatusReason, setResidenceStatusReason] = useState('');

  // NEW STATES FOR CUSTOMER & SUPPLIER DETAILS
  const [prominentCustomers, setProminentCustomers] = useState<any[]>([{ id: 'c1', name: '', phone: '', feedback: '' }]);
  const [prominentSuppliers, setProminentSuppliers] = useState<any[]>([{ id: 's1', name: '', phone: '', feedback: '' }]);
  const [bankingDetails, setBankingDetails] = useState<any[]>([{ id: 'b1', bankName: '', branchName: '', accountType: 'Saving Account', limit: 'NA', accountNo: '', remark: '' }]);
  const [existingLoans, setExistingLoans] = useState<any[]>([{ id: 'l1', typeOfLoan: 'NA', financerName: 'NA', amountInLakhs: '', emi: '', tenure: '', balanceTenure: '', remark: 'No any existing obligation' }]);
  const [currentObligation, setCurrentObligation] = useState('No any existing obligation');
  const [coApplicantInBusiness, setCoApplicantInBusiness] = useState(false);
  const [coApplicantBusinessRole, setCoApplicantBusinessRole] = useState('');
  const [businessLongitudeVerified, setBusinessLongitudeVerified] = useState(false);
  const [businessLongitudeRemarks, setBusinessLongitudeRemarks] = useState('The location was checked using the provided coordinates; however, the GPS map was unable to navigate up to the exact point.');
  const [businessNeighbourName, setBusinessNeighbourName] = useState('Adjoining neighbors');
  const [businessNeighbourFeedback, setBusinessNeighbourFeedback] = useState('Neighbour verification was conducted, wherein neighbours confirmed that the applicant has been engaged in his stated business for a considerable period, indicating business stability. The feedback received was positive regarding his work, and overall reputation in the locality.');
  const [businessStatus, setBusinessStatus] = useState('Recommended');`;

content = content.replace(statesTarget, statesReplacement);

// 2. Insert into auto-save
const autoSaveTarget = `neighborNegativeDetails, gpsLat, gpsLng, residenceStatus, residenceStatusReason`;
const autoSaveReplacement = `neighborNegativeDetails, gpsLat, gpsLng, residenceStatus, residenceStatusReason,
        prominentCustomers, prominentSuppliers, bankingDetails, existingLoans, currentObligation, coApplicantInBusiness,
        coApplicantBusinessRole, businessLongitudeVerified, businessLongitudeRemarks, businessNeighbourName,
        businessNeighbourFeedback, businessStatus`;

content = content.split(autoSaveTarget).join(autoSaveReplacement);

// 3. Update tabs navigation array
const tabsFooterRegex = /\{ id: 'verification', label: '3. Business & Residence Verification' \},/;
const tabsFooterReplacement = `{ id: 'verification', label: '3. Business & Residence Verification' },
      { id: 'customer_supplier', label: '4. Customer & Supplier Details' },`;
content = content.replace(tabsFooterRegex, tabsFooterReplacement);

const tabsHeaderRegex = /\{ id: 'verification', label: '3. Business & Residence Verification', icon: Store \},/;
const tabsHeaderReplacement = `{ id: 'verification', label: '3. Business & Residence Verification', icon: Store },
          { id: 'customer_supplier', label: '4. Customer & Supplier Details', icon: Briefcase },`;
content = content.replace(tabsHeaderRegex, tabsHeaderReplacement);

// 4. Update tab active type signature
const activeTabRegex = /activeTab, setActiveTab\] = useState\<'profile' \| 'applicant' \| 'verification' \| 'field' \| 'financials' \| 'decision'\>/;
const activeTabReplacement = `activeTab, setActiveTab] = useState<'profile' | 'applicant' | 'verification' | 'customer_supplier' | 'field' | 'financials' | 'decision'>`;
content = content.replace(activeTabRegex, activeTabReplacement);

// Also TABS_LIST type definition
const tabsListTypeRegex = /Array\<\{ id: 'profile' \| 'applicant' \| 'verification' \| 'field' \| 'financials' \| 'decision'; label: string \}\>/;
const tabsListTypeReplacement = `Array<{ id: 'profile' | 'applicant' | 'verification' | 'customer_supplier' | 'field' | 'financials' | 'decision'; label: string }>`;
content = content.replace(tabsListTypeRegex, tabsListTypeReplacement);


fs.writeFileSync(filePath, content);
