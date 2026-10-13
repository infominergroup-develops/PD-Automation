import { describe, expect, it } from 'vitest';
import { formProfileFor } from '../src/components/pd/formProfiles';

describe('formProfileFor', () => {
  it('maps each lender to its form profile', () => {
    expect(formProfileFor('tata').id).toBe('tataSbfc');
    expect(formProfileFor('SBFC').id).toBe('tataSbfc');
    expect(formProfileFor('ambit_salaried').id).toBe('salaried');
    expect(formProfileFor('godrej').id).toBe('godrej');
    expect(formProfileFor('ambit').id).toBe('standard');
    expect(formProfileFor(undefined).id).toBe('standard');
  });

  it('Godrej asks only for what its business-only report prints', () => {
    const show = formProfileFor('godrej').sections;
    // Printed by the Godrej report
    expect(show.godrejPanel).toBe(true);
    expect(show.constitution).toBe(true);
    expect(show.premisesAndRegistration).toBe(true);
    expect(show.strengthsWeaknesses).toBe(true);
    expect(show.otherSourceIncome).toBe(true);
    expect(show.staffCount).toBe(true);
    // Not printed (or asked directly in the Godrej panel)
    for (const section of [
      'residenceAddress', 'residenceVisit', 'residenceElectricity', 'residenceNeighbours', 'residenceGpsAndStatus',
      'initiationAndReportDates', 'documentsSeen', 'loanType', 'stockDetails', 'assetAnalysis', 'neighbourConfirmation',
      'factoryInfrastructure', 'businessElectricity', 'businessGps', 'existingEmiNotes', 'comfortableEmiNotes',
    ] as const) {
      expect(show[section], section).toBe(false);
    }
  });

  it('keeps the full form for lenders without a tailored report', () => {
    const show = formProfileFor('moneyboxx').sections;
    expect(show.residenceVisit && show.assetAnalysis && show.factoryInfrastructure).toBe(true);
    expect(show.godrejPanel || show.quickFactoryAssets || show.earningMembers).toBe(false);
  });
});
