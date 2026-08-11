const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/PDToolView.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const startTag = `{activeTab === 'applicant' && (`;
const endTag = `      {activeTab === 'field' && (`;

const startIndex = content.indexOf(startTag);
const endIndex = content.lastIndexOf("      )}", content.indexOf(endTag));

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find start or end tags", startIndex, endIndex);
  process.exit(1);
}

const replacement = `{activeTab === 'applicant' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2 mb-6">
              <User className="w-4 h-4 text-[#eb8a23]" />
              Applicant & Household Details
            </h3>

            {/* 1. Visit Date & 2. Report Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">1. Visit Date</label>
                <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">2. Report Date</label>
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
                <input type="text" maxLength={10} pattern="\\d{10}" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value.replace(/\\D/g, ''))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="10-digit mobile number" />
              </div>
            </div>

            {/* 5. Business Firm Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">5. Business Firm Name</label>
              <input type="text" value={firmName} onChange={(e) => setFirmName(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Business Name" />
            </div>

            {/* 6. Co-applicant Name with Relation & 7. Contact */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <label className="block text-xs font-bold text-slate-700">6. Co-applicant Name with Relation</label>
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-slate-600">Co-applicant present?</span>
                <button type="button" onClick={() => setHasCoApplicant(true)} className={\`px-4 py-1.5 text-xs font-bold rounded-lg border \${hasCoApplicant ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-white text-slate-600 border-slate-300'}\`}>Yes</button>
                <button type="button" onClick={() => { setHasCoApplicant(false); setCoApplicantName(''); setCoApplicantRelation(''); setCoApplicantMobileNumber(''); }} className={\`px-4 py-1.5 text-xs font-bold rounded-lg border \${!hasCoApplicant ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-white text-slate-600 border-slate-300'}\`}>No</button>
              </div>
              
              {!hasCoApplicant && (
                <div className="text-xs font-semibold text-slate-500 italic">No Co-applicant</div>
              )}
              
              {hasCoApplicant && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Co-applicant Name</label>
                    <input type="text" value={coApplicantName} onChange={(e) => setCoApplicantName(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Name" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Relationship</label>
                    <select value={coApplicantRelation} onChange={(e) => setCoApplicantRelation(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold">
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
                  {coApplicantRelation === 'Other' && (
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Specify Relationship</label>
                      <input type="text" value={coApplicantOtherRelation} onChange={(e) => setCoApplicantOtherRelation(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Specify" />
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">7. Contact Number</label>
                    <input type="text" maxLength={10} value={coApplicantMobileNumber} onChange={(e) => setCoApplicantMobileNumber(e.target.value.replace(/\\D/g, ''))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="10-digit number" />
                  </div>
                </div>
              )}
            </div>

            {/* 8. Female Candidate */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <label className="block text-xs font-bold text-slate-700">8. Female candidate is on loan / application</label>
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => setHasFemaleCandidate(true)} className={\`px-4 py-1.5 text-xs font-bold rounded-lg border \${hasFemaleCandidate ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-white text-slate-600 border-slate-300'}\`}>Yes</button>
                <button type="button" onClick={() => { setHasFemaleCandidate(false); setFemaleCandidateName(''); setFemaleCandidateRelation(''); }} className={\`px-4 py-1.5 text-xs font-bold rounded-lg border \${!hasFemaleCandidate ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-white text-slate-600 border-slate-300'}\`}>No</button>
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
            </div>

            {/* 9. Loan Amount & 10. Type of Loan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">9. Loan Amount</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2 text-slate-500 font-bold">₹</span>
                    <input type="number" value={appliedAmount || ''} onChange={(e) => setAppliedAmount(Number(e.target.value))} className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Amount" disabled={appliedAmount === null} />
                  </div>
                  <button type="button" onClick={() => setAppliedAmount(appliedAmount === null ? 0 : null)} className={\`px-3 py-2 text-[10px] font-bold rounded-lg border \${appliedAmount === null ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-600 border-slate-300'}\`}>Not Provided</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">10. Type of Loan</label>
                <select value={loanType} onChange={(e) => setLoanType(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold">
                  <option value="Commercial Solar Loan">Commercial Solar Loan</option>
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
                        setSolarPurposeGeneratedText(\`The applicant currently operates the business using \${finalSource.toLowerCase()}, which incurs an approximate monthly expense of ₹\${monthlyEnergyExpense || 0}. Therefore, the applicant is planning to install a solar setup to \${purposeText.toLowerCase()}.\`);
                     }} className="text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold hover:bg-orange-200">Auto-Generate</button>
                   </div>
                   <textarea value={solarPurposeGeneratedText} onChange={(e) => setSolarPurposeGeneratedText(e.target.value)} className="w-full text-xs font-semibold text-slate-700 border-none outline-none resize-none bg-transparent" rows={3} placeholder="Click Auto-Generate to preview..." />
                </div>
              </div>
            )}

            {/* 12. Address of Residence */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">12. Address of the Residence</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" value={resAddressLine1} onChange={(e) => setResAddressLine1(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold md:col-span-2" placeholder="Address Line 1" />
                <input type="text" value={resAddressLine2} onChange={(e) => setResAddressLine2(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold md:col-span-2" placeholder="Address Line 2" />
                <input type="text" value={resVillage} onChange={(e) => setResVillage(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Village / Locality" />
                <input type="text" value={resCity} onChange={(e) => setResCity(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="City" />
                <input type="text" value={resDistrict} onChange={(e) => setResDistrict(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="District" />
                <select value={resState} onChange={(e) => setResState(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold">
                  <option value="">Select State</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  {/* Additional states can be loaded via a constants file */}
                </select>
                <input type="text" maxLength={6} pattern="\\d{6}" value={resPin} onChange={(e) => setResPin(e.target.value.replace(/\\D/g, ''))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="PIN Code (6 digits)" />
              </div>
            </div>

            {/* 13. Address of Business */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-700">13. Address of the Business (Applicant)</label>
                <button type="button" onClick={() => {
                  setBusAddressLine1(resAddressLine1);
                  setBusAddressLine2(resAddressLine2);
                  setBusVillage(resVillage);
                  setBusCity(resCity);
                  setBusDistrict(resDistrict);
                  setBusState(resState);
                  setBusPin(resPin);
                }} className="text-[10px] bg-slate-100 text-slate-700 px-3 py-1.5 rounded font-bold hover:bg-slate-200 border border-slate-300">Same as Residence Address</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" value={busAddressLine1} onChange={(e) => setBusAddressLine1(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold md:col-span-2" placeholder="Address Line 1" />
                <input type="text" value={busAddressLine2} onChange={(e) => setBusAddressLine2(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold md:col-span-2" placeholder="Address Line 2" />
                <input type="text" value={busVillage} onChange={(e) => setBusVillage(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Village / Locality" />
                <input type="text" value={busCity} onChange={(e) => setBusCity(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="City" />
                <input type="text" value={busDistrict} onChange={(e) => setBusDistrict(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="District" />
                <select value={busState} onChange={(e) => setBusState(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold">
                  <option value="">Select State</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                </select>
                <input type="text" maxLength={6} pattern="\\d{6}" value={busPin} onChange={(e) => setBusPin(e.target.value.replace(/\\D/g, ''))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="PIN Code (6 digits)" />
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
                    if (p === 'Applicant') return \`\${applicantName || 'Applicant'} (Self)\`;
                    if (p === 'Co-applicant') return \`\${coApplicantName || 'Co-applicant'} (\${coApplicantRelation === 'Other' ? coApplicantOtherRelation : coApplicantRelation})\`;
                    if (p === 'Other') return \`\${personsMetOtherName} (\${personsMetOtherRelation})\`;
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
                        <td colSpan={6} className="px-3 py-4 text-center text-slate-500 italic bg-slate-50">No family members added.</td>
                      </tr>
                    ) : (
                      familyMembers.map((member, idx) => (
                        <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-2 border-r border-slate-100">
                            <input type="text" value={member.name} onChange={(e) => { const newFm = [...familyMembers]; newFm[idx].name = e.target.value; setFamilyMembers(newFm); }} className="w-full bg-transparent border-none outline-none focus:ring-0 text-xs font-semibold" placeholder="Name" />
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
               {currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER' ? (
                  <select value={executiveName} onChange={(e) => setExecutiveName(e.target.value)} className="w-full md:w-1/2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold bg-white">
                     <option value={currentUser.name}>{currentUser.name} (Self)</option>
                     <option value="Mr. Sumit">Mr. Sumit</option>
                     <option value="Rajat Kumar">Rajat Kumar</option>
                     {/* Dynamic options would load here */}
                  </select>
               ) : (
                  <input type="text" value={currentUser?.name || executiveName} readOnly className="w-full md:w-1/2 px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-100 text-slate-500 font-semibold" />
               )}
            </div>

          </div>
        </div>
      )}
`;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex + 8); // skipping '      )}'

fs.writeFileSync(filePath, content);
