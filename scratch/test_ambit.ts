import { generateStandardPDReportHTML } from '../src/utils/templates/standardTemplate';

const data = {
  applicantName: 'Test',
  clientBankName: 'Ambit Finvest',
  hasCollateral: true,
  collateralAddress: 'Test Addr',
  collateralPropertyType: 'Residential',
  collateralPropertyArea: '1000',
  collateralPropertyUsage: 'Self',
  collateralValuation: '50L',
  collateralRemarks: 'None'
};

try {
  const html = generateStandardPDReportHTML(data as any, 'APP123');
  console.log('HTML length:', html.length);
  console.log('Success!');
} catch (e) {
  console.error('Error generating HTML:', e);
}
