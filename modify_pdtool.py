import re

with open('src/components/PDToolView.tsx', 'r') as f:
    content = f.read()

# 1. Imports
content = content.replace("import { BusinessCategory, CategoryProduct, FinancialWaterfall } from '../types';", 
                          "import { BusinessCategory, CategoryProduct, FinancialWaterfall, FamilyMember } from '../types';")

# 2. State vars
state_search = """  const [aadhaarNumber, setAadhaarNumber] = useState('9876 5432 1098');
  const [residenceAddress, setResidenceAddress] = useState('Flat 402, Sai Residency, Station Road, Jaipur');
  const [residenceOwnership, setResidenceOwnership] = useState<'OWN' | 'RENTED' | 'FAMILY'>('OWN');
  const [yearsAtResidence, setYearsAtResidence] = useState(12);
  const [cibilScore, setCibilScore] = useState(748);"""
state_replace = """  const [residenceAddress, setResidenceAddress] = useState('Flat 402, Sai Residency, Station Road, Jaipur');
  const [residenceOwnership, setResidenceOwnership] = useState<'OWN' | 'RENTED' | 'FAMILY'>('OWN');
  const [yearsAtResidence, setYearsAtResidence] = useState(12);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [businessRemark, setBusinessRemark] = useState('');"""
content = content.replace(state_search, state_replace)

# 3. reset in handleCreateNew
reset_search = """      aadhaarNumber: '',
      residenceAddress: '',
      residenceOwnership: 'OWN',
      yearsAtResidence: 0,
      cibilScore: 0,"""
reset_replace = """      residenceAddress: '',
      residenceOwnership: 'OWN',
      yearsAtResidence: 0,
      familyMembers: [],
      businessRemark: '',"""
content = content.replace(reset_search, reset_replace)

# 4. handleLoadSampleApp
load_search = """    setAadhaarNumber(app.aadhaarNumber || '');
    setResidenceAddress(app.residenceAddress || '');
    setResidenceOwnership(app.residenceOwnership || 'OWN');
    setCibilScore(app.cibilScore || 0);"""
load_replace = """    setResidenceAddress(app.residenceAddress || '');
    setResidenceOwnership(app.residenceOwnership || 'OWN');
    setFamilyMembers(app.familyMembers || []);
    setBusinessRemark(app.businessRemark || '');"""
content = content.replace(load_search, load_replace)

# 5. auto-save dependencies
autosave_search = """        applicantName, mobileNumber, panNumber, aadhaarNumber, residenceAddress, residenceOwnership,
        cibilScore, dependentsCount, firmName, constitution, yearsInBusiness, shopOwnership, monthlyRent,"""
autosave_replace = """        applicantName, mobileNumber, panNumber, residenceAddress, residenceOwnership, familyMembers,
        dependentsCount, firmName, constitution, yearsInBusiness, shopOwnership, monthlyRent, businessRemark,"""
content = content.replace(autosave_search, autosave_replace)

autosave_dep_search = """    activeAppId, selectedClient, applicantName, mobileNumber, panNumber, aadhaarNumber, residenceAddress, residenceOwnership,
    cibilScore, dependentsCount, firmName, constitution, yearsInBusiness, shopOwnership, monthlyRent,"""
autosave_dep_replace = """    activeAppId, selectedClient, applicantName, mobileNumber, panNumber, residenceAddress, residenceOwnership, familyMembers,
    dependentsCount, firmName, constitution, yearsInBusiness, shopOwnership, monthlyRent, businessRemark,"""
content = content.replace(autosave_dep_search, autosave_dep_replace)

# 6. strengths and weaknesses for cibil
cibil_logic = """    if (cibilScore >= 720) {
      strengths.push(`Strong CIBIL score of ${cibilScore}`);
    } else if (cibilScore > 0 && cibilScore < 650) {
      flags.push(`Moderate CIBIL score (${cibilScore})`);
    }"""
content = content.replace(cibil_logic, "")

# 7. cibil dependencies in useMemo
dep_cibil = """  }, [cibilScore, dscrRatio, foirPct, yearsInBusiness, totalProductContribPct]);"""
dep_cibil_repl = """  }, [dscrRatio, foirPct, yearsInBusiness, totalProductContribPct]);"""
content = content.replace(dep_cibil, dep_cibil_repl)

# 8. print object mapping
print_search = """      applicantPhone: mobileNumber,
      firmName,
      loanAmount: appliedAmount,
      loanType: 'Commercial MSME Express Loan',
      loanPurpose: solarPurposeUsage || `Operational enhancement & working capital expansion for ${firmName}.`,
      residenceAddress,
      businessAddress: residenceAddress,
      metPersonName: `${applicantName} & Co-applicant`,
      metPersonIdProof: panNumber ? `PAN: ${panNumber}` : 'PAN Card / Aadhaar',
      executiveName: currentUser.name,
      locatingPremisesType: 'Well connected urban / semi-urban locality',
      residenceOwnership: shopOwnership === 'OWN' ? 'Owned Premises - Area 1000-1200 sq.ft Approx - Family residing since birth' : 'Rented Premises',
      houseDetails: 'Pucca house structure with standard living amenities.',
      monthlyHouseholdExpenses: householdExpenses,
      residenceElectricityDetails: 'Installed & Active',
      residenceNeighborName: 'Adjoining Neighbors',
      residenceNeighborFeedback: neighborFeedback || 'Positive verification feedback received.',
      residenceGpsCoords: '28.7041° N, 77.1025° E',
      residenceStatus: 'Recommended',
      briefBusinessProfile: `<strong>Background & Setup:</strong> The applicant, ${applicantName}, is the proprietor of <strong>${firmName}</strong> and has been successfully operating this business for approximately <strong>${yearsInBusiness} years</strong>. The enterprise is engaged in the retail trade of ${currentCategory.name.toLowerCase()} products, catering to the local community's daily needs.<br/><br/><strong>Operations & Infrastructure:</strong> The business is conducted from a ${shopOwnership === 'OWN' ? 'self-owned' : 'rented'} commercial premises covering an estimated area of ${shopAreaSqFt || 200} sq.ft. The shop is well-equipped with necessary fixtures such as display racks, storage shelves, and a billing counter. Currently, the business is primarily managed by the applicant along with family members, demonstrating self-reliance and minimal external labor dependency.<br/><br/><strong>Sales & Market Reach:</strong> Based on field observations, the business attracts a steady daily footfall of approximately <strong>${dailyFootfall} walk-in customers</strong>. With an average ticket size (per customer transaction) of <strong>₹${avgTicketValue}</strong> and operating for ${workingDays} days a month, the business demonstrates robust and consistent daily cash flow. The total available physical stock/inventory at the time of visit was estimated to be around <strong>₹${inventoryValue.toLocaleString('en-IN')}</strong>, reflecting adequate working capital circulation.`,
      businessVintage: `${yearsInBusiness} Years`,
      staffCount: 'Self Operated',
      businessPremiseOwnership: shopOwnership === 'OWN' ? 'Owned Property' : 'Rented Property',
      factoryInfrastructure: 'Standard retail shop layout with display & storage',
      stockDetailsValue: `Estimated Stock Value: ₹${inventoryValue.toLocaleString('en-IN')}`,
      fixedAndCurrentAssetAnalysis: 'Standard retail assets. Current assets comprise moving inventory.',
      assetCreationThroughBusiness: 'Income generated has been utilized for house construction, family living expenses, and inventory expansion.',
      initialBusinessInvestment: '₹2 Lakhs - ₹3 Lakhs Approx.',
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
      currentObligationSummary: existingEmis > 0 ? `Current monthly EMI obligation of ₹${existingEmis}` : 'No active external loan obligation.',
      businessGpsCoords: '28.7041° N, 77.1025° E',
      businessLocationRemarks: 'Premises physically verified and business found active.',
      businessElectricityDetails: 'Active commercial connection',
      businessNeighborName: 'Adjacent Market Shops',
      businessNeighborFeedback: neighborFeedback || 'Market reputation is found satisfactory.',
      businessStatus: 'Recommended',"""

print_replace = print_search.replace("'PAN Card / Aadhaar'", "'PAN Card'").replace("'Premises physically verified and business found active.'", "businessRemark || 'Premises physically verified and business found active.'").replace(
    "residenceOwnership: shopOwnership === 'OWN' ? 'Owned Premises - Area 1000-1200 sq.ft Approx - Family residing since birth' : 'Rented Premises',",
    "residenceOwnership: shopOwnership === 'OWN' ? `Owned Premises - Area ${shopAreaSqFt || '1000-1200'} sq.ft Approx - Family residing since birth` : `Rented Premises - Area ${shopAreaSqFt || '1000-1200'} sq.ft Approx`,"
) + "\n      familyMembers: familyMembers.length > 0 ? familyMembers.map((fm, idx) => ({ srNo: idx + 1, name: fm.name, age: `${fm.age} Yrs`, relation: fm.relationship, qualification: fm.education || fm.occupation, occupation: fm.occupation, dependent: fm.isDependent ? 'Yes' : 'No' })) : undefined,"

content = content.replace(print_search, print_replace)

# 9. JSON app output
json_app = """      cibilScore: cibilScore,"""
content = content.replace(json_app, "      familyMembers, businessRemark,")

with open('src/components/PDToolView.tsx', 'w') as f:
    f.write(content)

