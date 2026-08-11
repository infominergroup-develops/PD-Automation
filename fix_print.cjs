const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'src/components/PDToolView.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const target1 = `    const finalBusinessAddress = businessAddress || addressOfMeeting || 'Not provided';
    const finalResidenceAddress = addressOfMeeting || 'Not provided';`;
const rep1 = `    const compositeAddress = [meetAddressLine1, meetAddressLine2, meetVillage, meetCity, meetDistrict, meetState, meetPin].filter(Boolean).join(', ');
    const finalBusinessAddress = compositeAddress || 'Not provided';
    const finalResidenceAddress = compositeAddress || 'Not provided';`;
content = content.replace(target1, rep1);

const target2 = `      businessVintage: businessVintage || \`\${yearsInBusiness} Years\`,
      staffCount: businessStaffing || 'Managed by family members with zero external staff dependency',
      businessPremiseOwnership: businessPremiseOwnership || (shopOwnership === 'OWN' ? 'Self-Owned Premises' : \`Rented Premises (Rent: ₹\${monthlyRent}/mo)\`),
      factoryInfrastructure: businessInfrastructure || 'Display racks, storage shelves, weighing scales, counter, and necessary processing fixtures',
      stockDetailsValue: businessStockDetails || \`Estimated inventory value of ₹\${inventoryValue.toLocaleString('en-IN')}\`,
      fixedAndCurrentAssetAnalysis: businessFixedCurrentAssets || 'Fixed assets comprise shop furniture, display racks, and fixtures. Current assets include stock inventory and working capital.',
      assetCreationThroughBusiness: assetCreationDetails || 'Income generated has been utilized for house construction, family living expenses, and inventory expansion.',
      initialBusinessInvestment: initialBusinessInvestment || 'Started with an initial investment of approx ₹1 Lakh to ₹3 Lakhs.',
      agriculturalIncomeDetails: agriculturalIncomeDetails || 'Applicant owns agricultural land with yearly supplementary crop income.',
      otherSourceIncomeDetails: otherSourceIncomeDetails || 'Not applicable / Rental Income',
      operationalSavingAnalysis: solarSavingAnalysis || 'Working capital stock expansion will reduce unit procurement cost and optimize monthly profit margins.',`;

const rep2 = `      businessVintage: \`\${yearsInBusiness} Years\`,
      staffCount: 'Managed by family members with zero external staff dependency',
      businessPremiseOwnership: shopOwnership === 'OWN' ? 'Self-Owned Premises' : \`Rented Premises (Rent: ₹\${monthlyRent}/mo)\`,
      factoryInfrastructure: 'Display racks, storage shelves, weighing scales, counter, and necessary processing fixtures',
      stockDetailsValue: \`Estimated inventory value of ₹\${inventoryValue.toLocaleString('en-IN')}\`,
      fixedAndCurrentAssetAnalysis: 'Fixed assets comprise shop furniture, display racks, and fixtures. Current assets include stock inventory and working capital.',
      assetCreationThroughBusiness: 'Income generated has been utilized for house construction, family living expenses, and inventory expansion.',
      initialBusinessInvestment: \`Started with an initial investment of approx ₹\${initialInvestment || 1} Lakhs.\`,
      agriculturalIncomeDetails: hasAgricultureLand ? \`Applicant owns \${agriLandArea} \${agriLandUnit} agricultural land with yearly supplementary crop income of ₹\${agriIncomeMin}-\${agriIncomeMax} Lakhs.\` : 'Applicant owns agricultural land with yearly supplementary crop income.',
      otherSourceIncomeDetails: hasOtherIncome ? \`Applicant has other income sources: \${otherIncomeSources.map(s => s.name).join(', ')}\` : 'Not applicable / Rental Income',
      operationalSavingAnalysis: expectedSolarMonthlySaving ? \`Expected monthly saving of ₹\${expectedSolarMonthlySaving} (~\${expectedSolarCostReductionPct}% reduction).\` : 'Working capital stock expansion will reduce unit procurement cost and optimize monthly profit margins.',`;
content = content.replace(target2, rep2);

const target3 = `      residenceOwnership: locatingPremisesOwnership || (shopOwnership === 'OWN' ? 'Owned Premises - Area 1000-1200 sq.ft Approx - Family residing since birth' : 'Rented Premises'),`;
const rep3 = `      residenceOwnership: propertyOwnership === 'Owned' ? \`Owned Premises - Area \${propertyArea} sq.ft Approx - Family residing since birth\` : 'Rented Premises',`;
content = content.replace(target3, rep3);

fs.writeFileSync(filePath, content);
