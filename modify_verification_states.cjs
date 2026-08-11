const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/PDToolView.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Insert new states
const statesTarget = `  const [solarPurposeGeneratedText, setSolarPurposeGeneratedText] = useState('');`;

const statesReplacement = `  const [solarPurposeGeneratedText, setSolarPurposeGeneratedText] = useState('');

  // NEW STATES FOR VERIFICATION TAB
  const [businessAgeYears, setBusinessAgeYears] = useState<number | ''>('');
  const [businessAgeApprox, setBusinessAgeApprox] = useState(false);
  const [previousOccupation, setPreviousOccupation] = useState('');
  const [previousOccupationOther, setPreviousOccupationOther] = useState('');
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
  const [meetAddressLine1, setMeetAddressLine1] = useState('');
  const [meetAddressLine2, setMeetAddressLine2] = useState('');
  const [meetVillage, setMeetVillage] = useState('');
  const [meetCity, setMeetCity] = useState('');
  const [meetDistrict, setMeetDistrict] = useState('');
  const [meetState, setMeetState] = useState('');
  const [meetPin, setMeetPin] = useState('');
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
  const [residenceStatusReason, setResidenceStatusReason] = useState('');`;

content = content.replace(statesTarget, statesReplacement);

// 2. Insert into auto-save
const autoSaveTarget = `personsMet, personsMetOtherName, personsMetOtherRelation, identityProof, otherIdentityProof, executiveName`;
const autoSaveReplacement = `personsMet, personsMetOtherName, personsMetOtherRelation, identityProof, otherIdentityProof, executiveName,
        businessAgeYears, businessAgeApprox, previousOccupation, previousOccupationOther, externalStaffCount, businessManagedBy, businessManagedByOther,
        premiseOwnership, premiseOwnershipOther, businessAssets, hasStock, stockDetails, currentAssets, currentAssetsOther,
        businessIncomeAssetCreation, createdAssets, createdAssetsOther, otherHouseholdExpenses, otherHouseholdExpensesDesc, initialInvestment,
        investmentSource, investmentSourceOther, hasAgricultureLand, agriLandArea, agriLandUnit, agriLandOwnership, agriLandOwnershipOther,
        agriCrops, agriCropsOther, agriIncomeMin, agriIncomeMax, agriOwnershipDoc, hasOtherIncome, otherIncomeSources,
        expectedSolarCostReductionPct, expectedSolarMonthlySaving, meetingAddressSource, meetAddressLine1, meetAddressLine2, meetVillage,
        meetCity, meetDistrict, meetState, meetPin, locatingPremisesType, locatingPremisesTypeOther, propertyOwnership, propertyOwnershipOther,
        propertyRentAmount, propertyOwnerName, propertyArea, propertyValue, propertyOwnershipDoc, houseFloors, houseRooms, houseStructureType,
        houseStructureTypeOther, houseFloorPosition, houseFloorPositionOther, houseAdditionalDetails, monthlyHouseholdExpensesAmount,
        hasElectricityConnection, electricityConnectionType, electricityConnectionTypeOther, electricityConsumerNumber, electricityMonthlyExpense,
        neighbors, neighborVerificationConducted, neighborResidenceConfirmed, neighborBehaviourFeedback, neighborNegativeFeedback,
        neighborNegativeDetails, gpsLat, gpsLng, residenceStatus, residenceStatusReason`;

// Note: Need to replace it in both the object construction and the dependency array
content = content.split(autoSaveTarget).join(autoSaveReplacement);

// 3. Update tabs navigation array
const tabsFooterRegex = /\{ id: 'applicant', label: '2. Applicant & Household' \},/;
const tabsFooterReplacement = `{ id: 'applicant', label: '2. Applicant & Household' },
      { id: 'verification', label: '3. Business & Residence Verification' },`;
content = content.replace(tabsFooterRegex, tabsFooterReplacement);

const tabsHeaderRegex = /\{ id: 'applicant', label: '2. Applicant & Household', icon: User \},/;
const tabsHeaderReplacement = `{ id: 'applicant', label: '2. Applicant & Household', icon: User },
          { id: 'verification', label: '3. Business & Residence Verification', icon: Store },`;
content = content.replace(tabsHeaderRegex, tabsHeaderReplacement);

// 4. Update tab active type signature
const activeTabRegex = /activeTab, setActiveTab\] = useState\<'profile' \| 'applicant' \| 'field' \| 'financials' \| 'decision'\>/;
const activeTabReplacement = `activeTab, setActiveTab] = useState<'profile' | 'applicant' | 'verification' | 'field' | 'financials' | 'decision'>`;
content = content.replace(activeTabRegex, activeTabReplacement);

// Also TABS_LIST type definition
const tabsListTypeRegex = /Array\<\{ id: 'profile' \| 'applicant' \| 'field' \| 'financials' \| 'decision'; label: string \}\>/;
const tabsListTypeReplacement = `Array<{ id: 'profile' | 'applicant' | 'verification' | 'field' | 'financials' | 'decision'; label: string }>`;
content = content.replace(tabsListTypeRegex, tabsListTypeReplacement);


fs.writeFileSync(filePath, content);
