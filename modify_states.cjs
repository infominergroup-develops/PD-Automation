const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/PDToolView.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const statesTarget = `  // Form Fields - Applicant
  const [applicantName, setApplicantName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [residenceAddress, setResidenceAddress] = useState('');
  const [residenceOwnership, setResidenceOwnership] = useState<'OWN' | 'RENTED' | 'FAMILY'>('OWN');
  const [yearsAtResidence, setYearsAtResidence] = useState(0);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [businessRemark, setBusinessRemark] = useState('');
  const [dependentsCount, setDependentsCount] = useState(0);`;

const statesReplacement = `  // Form Fields - Applicant
  const [applicantName, setApplicantName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [residenceAddress, setResidenceAddress] = useState('');
  const [residenceOwnership, setResidenceOwnership] = useState<'OWN' | 'RENTED' | 'FAMILY'>('OWN');
  const [yearsAtResidence, setYearsAtResidence] = useState(0);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [businessRemark, setBusinessRemark] = useState('');
  const [dependentsCount, setDependentsCount] = useState(0);

  // NEW STATES FOR REDESIGN
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [hasCoApplicant, setHasCoApplicant] = useState(false);
  const [coApplicantName, setCoApplicantName] = useState('');
  const [coApplicantRelation, setCoApplicantRelation] = useState('Spouse');
  const [coApplicantOtherRelation, setCoApplicantOtherRelation] = useState('');
  const [coApplicantMobileNumber, setCoApplicantMobileNumber] = useState('');
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
  const [otherSolarPurpose, setOtherSolarPurpose] = useState('');
  const [resAddressLine1, setResAddressLine1] = useState('');
  const [resAddressLine2, setResAddressLine2] = useState('');
  const [resVillage, setResVillage] = useState('');
  const [resCity, setResCity] = useState('');
  const [resDistrict, setResDistrict] = useState('');
  const [resState, setResState] = useState('');
  const [resPin, setResPin] = useState('');
  const [busAddressLine1, setBusAddressLine1] = useState('');
  const [busAddressLine2, setBusAddressLine2] = useState('');
  const [busVillage, setBusVillage] = useState('');
  const [busCity, setBusCity] = useState('');
  const [busDistrict, setBusDistrict] = useState('');
  const [busState, setBusState] = useState('');
  const [busPin, setBusPin] = useState('');
  const [personsMet, setPersonsMet] = useState<string[]>([]);
  const [personsMetOtherName, setPersonsMetOtherName] = useState('');
  const [personsMetOtherRelation, setPersonsMetOtherRelation] = useState('');
  const [identityProof, setIdentityProof] = useState('Aadhaar Card');
  const [otherIdentityProof, setOtherIdentityProof] = useState('');
  const [executiveName, setExecutiveName] = useState(''); // Assuming logic handles current user
  const [solarPurposeGeneratedText, setSolarPurposeGeneratedText] = useState('');`;

content = content.replace(statesTarget, statesReplacement);

const autoSaveRegex = /const updateData = \{\s*applicantName[\s\S]*?expenseLines\s*\};/;
const newAutoSaveBody = `const updateData = {
        applicantName, mobileNumber, panNumber, residenceAddress, residenceOwnership, familyMembers,
        dependentsCount, firmName, constitution, yearsInBusiness, shopOwnership, monthlyRent, businessRemark,
        shopAreaSqFt, inventoryValue, dailyFootfall, avgTicketValue, workingDays, neighborFeedback,
        landlordFeedback, appliedAmount, tenureMonths, interestRatePct, statedMonthlySales, cogsMarginPct,
        salariesExpense, utilitiesExpense, transportExpense, miscExpense, otherIncome, householdExpenses, existingEmis,
        photos, incomeLines, expenseLines,
        visitDate, reportDate, hasCoApplicant, coApplicantName, coApplicantRelation, coApplicantOtherRelation, coApplicantMobileNumber,
        hasFemaleCandidate, femaleCandidateName, femaleCandidateRelation, femaleCandidateOtherRelation, loanType, otherLoanType,
        powerSource, otherPowerSource, monthlyEnergyExpense, solarPurposes, otherSolarPurpose, solarPurposeGeneratedText,
        resAddressLine1, resAddressLine2, resVillage, resCity, resDistrict, resState, resPin,
        busAddressLine1, busAddressLine2, busVillage, busCity, busDistrict, busState, busPin,
        personsMet, personsMetOtherName, personsMetOtherRelation, identityProof, otherIdentityProof, executiveName
      };`;
content = content.replace(autoSaveRegex, newAutoSaveBody);

const depsRegex = /return \(\) => clearTimeout\(timeout\);\s*\}, \[[\s\S]*?expenseLines\s*\]\);/;
const newDeps = `return () => clearTimeout(timeout);
  }, [
    activeAppId, selectedClient, applicantName, mobileNumber, panNumber, residenceAddress, residenceOwnership, familyMembers,
    dependentsCount, firmName, constitution, yearsInBusiness, shopOwnership, monthlyRent, businessRemark,
    shopAreaSqFt, inventoryValue, dailyFootfall, avgTicketValue, workingDays, neighborFeedback,
    landlordFeedback, appliedAmount, tenureMonths, interestRatePct, statedMonthlySales, cogsMarginPct,
    salariesExpense, utilitiesExpense, transportExpense, miscExpense, otherIncome, householdExpenses, existingEmis,
    photos, incomeLines, expenseLines,
    visitDate, reportDate, hasCoApplicant, coApplicantName, coApplicantRelation, coApplicantOtherRelation, coApplicantMobileNumber,
    hasFemaleCandidate, femaleCandidateName, femaleCandidateRelation, femaleCandidateOtherRelation, loanType, otherLoanType,
    powerSource, otherPowerSource, monthlyEnergyExpense, solarPurposes, otherSolarPurpose, solarPurposeGeneratedText,
    resAddressLine1, resAddressLine2, resVillage, resCity, resDistrict, resState, resPin,
    busAddressLine1, busAddressLine2, busVillage, busCity, busDistrict, busState, busPin,
    personsMet, personsMetOtherName, personsMetOtherRelation, identityProof, otherIdentityProof, executiveName
  ]);`;
content = content.replace(depsRegex, newDeps);

fs.writeFileSync(filePath, content);
