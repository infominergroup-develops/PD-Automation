const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/PDToolView.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetAnchorStart = `  const handleDirectPrintReport = () => {`;
const targetAnchorEnd = `    openStandardPDReportPrintWindow({`;

if (content.indexOf(targetAnchorStart) === -1) {
  console.log("Could not find start anchor");
  process.exit(1);
}

const customScript = `  const handleDirectPrintReport = () => {
    // Smart Autofill Extractors
    const coApp = familyMembers.find(f => f.relation.toLowerCase() === 'spouse' || f.relation.toLowerCase() === 'co-applicant');
    const autoCoAppName = coApp ? coApp.name : (coApplicantInBusiness ? coApplicantBusinessRole : 'Mrs. Rubi Devi (Spouse)');
    const autoCoAppPhone = 'Not provided';
    const finalBusinessAddress = businessAddress || addressOfMeeting || 'Not provided';
    const finalResidenceAddress = addressOfMeeting || 'Not provided';
    const formattedGps = gpsLat && gpsLng ? \`\${gpsLat}, \${gpsLng}\` : \`\${exifGpsLat}, \${exifGpsLng}\`;

    openStandardPDReportPrintWindow({`;

content = content.replace(`  const handleDirectPrintReport = () => {\n    openStandardPDReportPrintWindow({`, customScript);

const mappingTarget = `      coApplicantName: 'Mrs. Rubi Devi (Spouse)',
      coApplicantPhone: '8252240942',
      firmName,
      loanAmount: appliedAmount,
      loanType: \`\${currentCategory.name} Facility\`,
      loanPurpose: solarPurposeUsage || \`Operational enhancement & working capital expansion for \${firmName}.\`,
      residenceAddress: 'Dumari, Parora Garhpura Begusarai 848204 Br',
      businessAddress: 'Dumari, Parora Garhpura Begusarai 848204 Br',`;

const mappingReplacement = `      coApplicantName: autoCoAppName,
      coApplicantPhone: autoCoAppPhone,
      firmName,
      loanAmount: appliedAmount,
      loanType: \`\${currentCategory.name} Facility\`,
      loanPurpose: solarPurposeUsage || \`Operational enhancement & working capital expansion for \${firmName}.\`,
      residenceAddress: finalResidenceAddress,
      businessAddress: finalBusinessAddress,`;

content = content.replace(mappingTarget, mappingReplacement);

const mappingTarget2 = `      businessVintage: \`\${yearsInBusiness} Years\`,
      staffCount: 'Managed by family members with zero external staff dependency',
      businessPremiseOwnership: shopOwnership === 'OWN' ? 'Self-Owned Premises' : \`Rented Premises (Rent: ₹\${monthlyRent}/mo)\`,
      factoryInfrastructure: 'Display racks, storage shelves, weighing scales, counter, and necessary processing fixtures',
      stockDetailsValue: \`Estimated inventory value of ₹\${inventoryValue.toLocaleString('en-IN')}\`,
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
        { typeOfLoan: 'NA', financerName: 'NA', loanAmountLakhs: '0', emiRs: \`\${existingEmis}\`, tenureYearsMonths: 'NA', balanceTenure: 'NA', remark: existingEmis > 0 ? \`Active monthly EMI of ₹\${existingEmis}\` : 'No existing loan obligation' }
      ],
      currentObligationSummary: existingEmis > 0 ? \`Monthly EMI of ₹\${existingEmis}\` : 'No existing obligation',
      businessGpsCoords: \`\${exifGpsLat}, \${exifGpsLng}\`,
      businessElectricityDetails: 'Active commercial electricity connection verified',
      businessNeighborName: 'Adjoining market shopkeepers',
      businessNeighborFeedback: neighborFeedback || 'Neighbour verification confirmed applicant business presence and stable local reputation.',
      businessStatus: 'Recommended',`;

const mappingReplacement2 = `      businessVintage: businessVintage || \`\${yearsInBusiness} Years\`,
      staffCount: businessStaffing || 'Managed by family members with zero external staff dependency',
      businessPremiseOwnership: businessPremiseOwnership || (shopOwnership === 'OWN' ? 'Self-Owned Premises' : \`Rented Premises (Rent: ₹\${monthlyRent}/mo)\`),
      factoryInfrastructure: businessInfrastructure || 'Display racks, storage shelves, weighing scales, counter, and necessary processing fixtures',
      stockDetailsValue: businessStockDetails || \`Estimated inventory value of ₹\${inventoryValue.toLocaleString('en-IN')}\`,
      fixedAndCurrentAssetAnalysis: businessFixedCurrentAssets || 'Fixed assets comprise shop furniture, display racks, and fixtures. Current assets include stock inventory and working capital.',
      assetCreationThroughBusiness: assetCreationDetails || 'Income generated has been utilized for house construction, family living expenses, and inventory expansion.',
      initialBusinessInvestment: initialBusinessInvestment || 'Started with an initial investment of approx ₹1 Lakh to ₹3 Lakhs.',
      agriculturalIncomeDetails: agriculturalIncomeDetails || 'Applicant owns agricultural land with yearly supplementary crop income.',
      otherSourceIncomeDetails: otherSourceIncomeDetails || 'Not applicable / Rental Income',
      operationalSavingAnalysis: solarSavingAnalysis || 'Working capital stock expansion will reduce unit procurement cost and optimize monthly profit margins.',

      prominentCustomers: prominentCustomers.length > 0 && prominentCustomers[0].name ? prominentCustomers : [
        { name: 'Local Retail Walk-in Customers', phone: 'Multiple', remark: 'Satisfactory daily cash & digital UPI sales' }
      ],
      prominentSuppliers: prominentSuppliers.length > 0 && prominentSuppliers[0].name ? prominentSuppliers : [
        { name: 'Regional Wholesale Stock Supplier', phone: '9811002233', remark: 'Regular stock supplier with favorable credit terms' }
      ],
      bankingDetails: bankingDetails.length > 0 && bankingDetails[0].bankName ? bankingDetails : [
        { bankName: selectedClient?.name || 'UCO Bank', branchName: 'Main Branch', accountType: 'Saving / Current Account', ccOdLimit: 'NA', accountNo: '**********9522', remark: 'Active operating account belonging to applicant' }
      ],
      existingLoans: existingLoans.length > 0 && existingLoans[0].typeOfLoan !== 'NA' ? existingLoans : [
        { typeOfLoan: 'NA', financerName: 'NA', loanAmountLakhs: '0', emiRs: \`\${existingEmis}\`, tenureYearsMonths: 'NA', balanceTenure: 'NA', remark: existingEmis > 0 ? \`Active monthly EMI of ₹\${existingEmis}\` : 'No existing loan obligation' }
      ],
      currentObligationSummary: currentObligation || (existingEmis > 0 ? \`Monthly EMI of ₹\${existingEmis}\` : 'No existing obligation'),
      businessGpsCoords: formattedGps,
      businessLocationRemarks: businessLongitudeRemarks,
      businessElectricityDetails: hasElectricityConnection === 'Yes' ? \`Electricity verified (Consumer No: \${electricityConsumerNumber || 'NA'}), Monthly Bill: ₹\${electricityMonthlyExpense || 0}\` : 'Not provided',
      businessNeighborName: businessNeighbourName || neighborName || 'Adjoining market shopkeepers',
      businessNeighborFeedback: businessNeighbourFeedback || neighborFeedback || 'Neighbour verification confirmed applicant business presence and stable local reputation.',
      businessStatus: businessStatus || 'Recommended',`;

content = content.replace(mappingTarget2, mappingReplacement2);

const mappingTarget3 = `      residenceOwnership: shopOwnership === 'OWN' ? 'Owned Premises - Area 1000-1200 sq.ft Approx - Family residing since birth' : 'Rented Premises',
      houseDetails: 'Single-story structure comprising ground floor residential units.',
      monthlyHouseholdExpenses: householdExpenses,
      residenceGpsCoords: \`\${exifGpsLat}, \${exifGpsLng}\`,
      residenceStatus: 'Recommended',`;

const mappingReplacement3 = `      residenceOwnership: locatingPremisesOwnership || (shopOwnership === 'OWN' ? 'Owned Premises - Area 1000-1200 sq.ft Approx - Family residing since birth' : 'Rented Premises'),
      houseDetails: \`This house has \${houseRooms} rooms and is a \${houseStructureType} structure, comprising a \${houseFloorPosition} floor.\`,
      monthlyHouseholdExpenses: monthlyHouseholdExpensesAmount || householdExpenses,
      residenceGpsCoords: formattedGps,
      residenceStatus: residenceStatus || 'Recommended',`;

content = content.replace(mappingTarget3, mappingReplacement3);

// Family Members mapping
const familyMembersTarget = `      metPersonIdProof: panNumber ? \`PAN: \${panNumber}\` : 'PAN Card / Aadhaar',
      executiveName: 'Mr. Sumit (Infominer Field Inspector)',`;

const familyMembersReplacement = `      metPersonIdProof: panNumber ? \`PAN: \${panNumber}\` : 'PAN Card / Aadhaar',
      executiveName: 'Mr. Sumit (Infominer Field Inspector)',
      familyMembers: familyMembers,`;

content = content.replace(familyMembersTarget, familyMembersReplacement);

fs.writeFileSync(filePath, content);
