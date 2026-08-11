const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/PDToolView.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const anchor = `      {activeTab === 'field' && (`;

if (content.indexOf(anchor) === -1) {
  console.log("Could not find anchor");
  process.exit(1);
}

const replacement = `      {activeTab === 'verification' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2 mb-6">
              <Store className="w-4 h-4 text-[#eb8a23]" />
              Business & Residence Verification
            </h3>

            {/* 1. Vintage of Business */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <label className="block text-xs font-bold text-slate-700">1. Vintage of the Business</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                   <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Business Age (Years)</label>
                   <div className="flex gap-2 items-center">
                      <input type="number" value={businessAgeYears} onChange={(e) => setBusinessAgeYears(Number(e.target.value))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" disabled={businessAgeApprox} placeholder="Years" />
                      <label className="text-[10px] font-bold text-slate-600 flex items-center gap-1 whitespace-nowrap"><input type="checkbox" checked={businessAgeApprox} onChange={(e) => setBusinessAgeApprox(e.target.checked)} className="accent-[#eb8a23]" /> Approx</label>
                   </div>
                </div>
                <div>
                   <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Previous Occupation / Activity</label>
                   <select value={previousOccupation} onChange={(e) => setPreviousOccupation(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold bg-white">
                      <option value="">Select...</option>
                      <option value="Agriculture">Agriculture</option>
                      <option value="Salaried Employment">Salaried Employment</option>
                      <option value="Business">Business</option>
                      <option value="Self-employed">Self-employed</option>
                      <option value="Labour">Labour</option>
                      <option value="Student">Student</option>
                      <option value="Homemaker">Homemaker</option>
                      <option value="Other">Other</option>
                   </select>
                </div>
                {previousOccupation === 'Other' && (
                  <div>
                     <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Specify Previous Occupation</label>
                     <input type="text" value={previousOccupationOther} onChange={(e) => setPreviousOccupationOther(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Specify" />
                  </div>
                )}
                <div className="md:col-span-2 lg:col-span-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs font-semibold text-blue-800">
                  Generated: {businessAgeApprox ? 'Approximately ' : ''}{businessAgeYears ? \`\${String(businessAgeYears).padStart(2, '0')} years in business.\` : ''} {previousOccupation ? \`Prior to this, engaged in \${previousOccupation === 'Other' ? previousOccupationOther : previousOccupation.toLowerCase()}.\` : ''}
                </div>
              </div>
            </div>

            {/* 2. Number of Staffs */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <label className="block text-xs font-bold text-slate-700">2. Number of Staffs</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Number of External Staff / Labour</label>
                   <div className="flex gap-2">
                     <input type="number" value={externalStaffCount} onChange={(e) => setExternalStaffCount(Number(e.target.value))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" />
                     <button type="button" onClick={() => setExternalStaffCount(0)} className="px-3 py-1.5 text-[10px] bg-slate-200 text-slate-700 font-bold rounded hover:bg-slate-300 whitespace-nowrap">No External Staff</button>
                   </div>
                </div>
                <div>
                   <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Who manages the business?</label>
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
                </div>
                <div className="md:col-span-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs font-semibold text-blue-800">
                  Generated: {externalStaffCount === 0 ? 'No external staff/labour is engaged. ' : \`\${externalStaffCount} external staff/labour engaged. \`}
                  {businessManagedBy.length > 0 && \`Business operations are managed by \${businessManagedBy.map(m => m === 'Other' ? businessManagedByOther : m).join(', ')}.\`}
                </div>
              </div>
            </div>

            {/* 3. Is Office Premise Rented / Owned */}
            <div>
               <label className="block text-xs font-bold text-slate-700 mb-2">3. Is Office Premise Rented / Owned</label>
               <div className="flex flex-wrap gap-3">
                 {['Self-Owned', 'Rented', 'Leased', 'Other'].map(opt => (
                    <label key={opt} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <input type="radio" checked={premiseOwnership === opt} onChange={() => setPremiseOwnership(opt)} className="accent-[#eb8a23]" />
                      {opt}
                    </label>
                 ))}
               </div>
               {premiseOwnership === 'Other' && (
                  <input type="text" value={premiseOwnershipOther} onChange={(e) => setPremiseOwnershipOther(e.target.value)} className="w-full md:w-1/2 mt-3 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Specify" />
               )}
               {premiseOwnership === 'Self-Owned' && (
                  <div className="mt-2 text-xs font-semibold text-blue-800 bg-blue-50 p-2 rounded">Generated: Business is being operated from self-owned premises.</div>
               )}
            </div>

            {/* 4. Details of Office / Factory Infrastructure */}
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
                       <input type="text" value={asset.name} onChange={(e) => { const arr = [...businessAssets]; arr[idx].name = e.target.value; setBusinessAssets(arr); }} placeholder="Asset / Machine Name" className="col-span-2 px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                       <input type="number" value={asset.quantity} onChange={(e) => { const arr = [...businessAssets]; arr[idx].quantity = Number(e.target.value); setBusinessAssets(arr); }} placeholder="Qty" className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                       <input type="text" value={asset.size} onChange={(e) => { const arr = [...businessAssets]; arr[idx].size = e.target.value; setBusinessAssets(arr); }} placeholder="Size / Capacity" className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                       <select value={asset.condition} onChange={(e) => { const arr = [...businessAssets]; arr[idx].condition = e.target.value; setBusinessAssets(arr); }} className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]">
                          <option value="Operational">Operational</option>
                          <option value="Non-Operational">Non-Operational</option>
                          <option value="Needs Repair">Needs Repair</option>
                       </select>
                       <div className="flex items-center gap-1">
                          <input type="text" value={asset.remarks} onChange={(e) => { const arr = [...businessAssets]; arr[idx].remarks = e.target.value; setBusinessAssets(arr); }} placeholder="Remarks" className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                          <button onClick={() => { const arr = [...businessAssets]; arr.splice(idx, 1); setBusinessAssets(arr); }} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    </div>
                 ))}
                 {businessAssets.length === 0 && <div className="text-xs text-slate-500 italic p-2">No assets added.</div>}
                 {businessAssets.length > 0 && (
                    <div className="mt-2 text-xs font-semibold text-blue-800 bg-blue-50 p-3 rounded-lg">
                       Generated: The business setup comprises {businessAssets.map(a => \`\${String(a.quantity || 0).padStart(2, '0')} \${a.name} (\${a.size})\`).join(', ')}.
                    </div>
                 )}
              </div>
            </div>

            {/* 5. Stock Details */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-bold text-slate-700">5. Stock Details with Estimated Value</h4>
                <div className="flex items-center gap-3">
                   <label className="text-[10px] font-bold text-slate-500">Stock Available?</label>
                   <div className="flex gap-1">
                      <button type="button" onClick={() => setHasStock(true)} className={\`px-3 py-1 text-[10px] font-bold rounded \${hasStock ? 'bg-[#eb8a23] text-white' : 'bg-slate-200 text-slate-600'}\`}>Yes</button>
                      <button type="button" onClick={() => setHasStock(false)} className={\`px-3 py-1 text-[10px] font-bold rounded \${!hasStock ? 'bg-[#eb8a23] text-white' : 'bg-slate-200 text-slate-600'}\`}>No</button>
                   </div>
                   {hasStock && (
                     <button type="button" onClick={() => setStockDetails([...stockDetails, { id: Date.now(), name: '', quantity: 0, unit: 'kg', value: 0, remarks: '' }])} className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-[#2d3e50] border border-slate-300 text-[10px] font-bold rounded hover:bg-slate-200">
                       <Plus className="w-3 h-3" /> Add Stock
                     </button>
                   )}
                </div>
              </div>
              
              {!hasStock ? (
                 <div className="text-xs font-semibold text-blue-800 bg-blue-50 p-3 rounded-lg">Generated: No stock observed / available.</div>
              ) : (
                 <div className="space-y-2">
                    {stockDetails.map((stock, idx) => (
                       <div key={stock.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 p-2 border border-slate-200 rounded-lg bg-slate-50 items-center">
                          <input type="text" value={stock.name} onChange={(e) => { const arr = [...stockDetails]; arr[idx].name = e.target.value; setStockDetails(arr); }} placeholder="Stock Name" className="col-span-2 px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                          <input type="number" value={stock.quantity} onChange={(e) => { const arr = [...stockDetails]; arr[idx].quantity = Number(e.target.value); setStockDetails(arr); }} placeholder="Qty" className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                          <input type="text" value={stock.unit} onChange={(e) => { const arr = [...stockDetails]; arr[idx].unit = e.target.value; setStockDetails(arr); }} placeholder="Unit" className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                          <div className="relative">
                             <span className="absolute left-2 top-2 text-[10px] font-bold text-slate-500">₹</span>
                             <input type="number" value={stock.value} onChange={(e) => { const arr = [...stockDetails]; arr[idx].value = Number(e.target.value); setStockDetails(arr); }} placeholder="Value" className="w-full pl-5 pr-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                          </div>
                          <div className="flex items-center gap-1">
                             <input type="text" value={stock.remarks} onChange={(e) => { const arr = [...stockDetails]; arr[idx].remarks = e.target.value; setStockDetails(arr); }} placeholder="Remarks" className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                             <button onClick={() => { const arr = [...stockDetails]; arr.splice(idx, 1); setStockDetails(arr); }} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                          </div>
                       </div>
                    ))}
                    {stockDetails.length > 0 && (
                       <div className="mt-2 text-xs font-semibold text-blue-800 bg-blue-50 p-3 rounded-lg">
                          Generated: The estimated value of observed stock ({stockDetails.map(s => s.name).join(', ')}) is approximately ₹{stockDetails.reduce((sum, s) => sum + (Number(s.value) || 0), 0)}.
                       </div>
                    )}
                 </div>
              )}
            </div>

            {/* 6. Fixed & Current Asset Analysis */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
               <label className="block text-xs font-bold text-slate-700">6. Fixed & Current Asset Analysis</label>
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
            </div>

            {/* 7. Asset Creation Through Business */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
               <label className="block text-xs font-bold text-slate-700">7. Asset Creation Through Business</label>
               <div className="flex items-center gap-4">
                 <span className="text-xs font-semibold text-slate-600">Has business income been used for asset creation?</span>
                 <button type="button" onClick={() => setBusinessIncomeAssetCreation(true)} className={\`px-3 py-1.5 text-[10px] font-bold rounded-lg border \${businessIncomeAssetCreation ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-white text-slate-600 border-slate-300'}\`}>Yes</button>
                 <button type="button" onClick={() => { setBusinessIncomeAssetCreation(false); setCreatedAssets([]); }} className={\`px-3 py-1.5 text-[10px] font-bold rounded-lg border \${!businessIncomeAssetCreation ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-white text-slate-600 border-slate-300'}\`}>No</button>
               </div>

               {businessIncomeAssetCreation && (
                  <div className="space-y-4 mt-2">
                     <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">What assets were created?</label>
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
                     </div>

                     <div className="flex items-center gap-4 pt-2 border-t border-slate-200">
                        <span className="text-xs font-semibold text-slate-600">Other Household / Personal Expenses?</span>
                        <button type="button" onClick={() => setOtherHouseholdExpenses(true)} className={\`px-3 py-1 text-[10px] font-bold rounded border \${otherHouseholdExpenses ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-white text-slate-600 border-slate-300'}\`}>Yes</button>
                        <button type="button" onClick={() => { setOtherHouseholdExpenses(false); setOtherHouseholdExpensesDesc(''); }} className={\`px-3 py-1 text-[10px] font-bold rounded border \${!otherHouseholdExpenses ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-white text-slate-600 border-slate-300'}\`}>No</button>
                     </div>
                     {otherHouseholdExpenses && (
                        <input type="text" value={otherHouseholdExpensesDesc} onChange={(e) => setOtherHouseholdExpensesDesc(e.target.value)} className="w-full md:w-1/2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]" placeholder="Optional description..." />
                     )}

                     <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs font-semibold text-blue-800">
                        Generated: As informed by the applicant, the income generated from the business has been utilized for {createdAssets.length > 0 ? createdAssets.map(a => a === 'Other' ? createdAssetsOther : a.toLowerCase()).join(', ') : 'asset creation'}{otherHouseholdExpenses ? ', along with meeting household expenses.' : '.'}
                     </div>
                  </div>
               )}
            </div>

            {/* 8. Business Investment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">8. Business Investment (Initial)</label>
                  <div className="relative">
                     <span className="absolute left-3 top-2 text-[10px] font-bold text-slate-500">₹</span>
                     <input type="number" value={initialInvestment} onChange={(e) => setInitialInvestment(Number(e.target.value))} className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Amount" />
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Investment Source</label>
                  <select value={investmentSource} onChange={(e) => setInvestmentSource(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold bg-white">
                     <option value="">Select...</option>
                     <option value="Own Funds">Own Funds</option>
                     <option value="Loan">Loan</option>
                     <option value="Family Funds">Family Funds</option>
                     <option value="Combination">Combination</option>
                     <option value="Other">Other</option>
                  </select>
                  {investmentSource === 'Other' && (
                     <input type="text" value={investmentSourceOther} onChange={(e) => setInvestmentSourceOther(e.target.value)} className="w-full mt-2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]" placeholder="Specify Source" />
                  )}
               </div>
            </div>

            {/* 9. Agricultural Income Details */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
               <label className="block text-xs font-bold text-slate-700">9. Agricultural Income Details</label>
               <div className="flex items-center gap-4">
                 <span className="text-xs font-semibold text-slate-600">Agricultural Land?</span>
                 <button type="button" onClick={() => setHasAgricultureLand(true)} className={\`px-4 py-1.5 text-[10px] font-bold rounded-lg border \${hasAgricultureLand ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-white text-slate-600 border-slate-300'}\`}>Yes</button>
                 <button type="button" onClick={() => setHasAgricultureLand(false)} className={\`px-4 py-1.5 text-[10px] font-bold rounded-lg border \${!hasAgricultureLand ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-white text-slate-600 border-slate-300'}\`}>No</button>
               </div>

               {hasAgricultureLand && (
                  <div className="space-y-4 mt-3 border-t border-slate-200 pt-4">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                           <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Land Area & Unit</label>
                           <div className="flex gap-2">
                              <input type="number" value={agriLandArea} onChange={(e) => setAgriLandArea(Number(e.target.value))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Area" />
                              <select value={agriLandUnit} onChange={(e) => setAgriLandUnit(e.target.value)} className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23] bg-white">
                                 <option value="Bigha">Bigha</option>
                                 <option value="Acre">Acre</option>
                                 <option value="Hectare">Hectare</option>
                                 <option value="Other">Other</option>
                              </select>
                           </div>
                        </div>
                        <div>
                           <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Ownership</label>
                           <select value={agriLandOwnership} onChange={(e) => setAgriLandOwnership(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23] bg-white">
                              <option value="Self-owned">Self-owned</option>
                              <option value="Family-owned">Family-owned</option>
                              <option value="Leased">Leased</option>
                              <option value="Other">Other</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Document Available?</label>
                           <select value={agriOwnershipDoc} onChange={(e) => setAgriOwnershipDoc(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23] bg-white">
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                              <option value="Not Provided">Not Provided</option>
                           </select>
                        </div>
                     </div>
                     <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2">Crops</label>
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
                     </div>
                     <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Approximate Annual Agricultural Income</label>
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
                     </div>
                  </div>
               )}
            </div>

            {/* 10. Other Source Income */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
               <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-700">10. Other source income</label>
                  <div className="flex items-center gap-2">
                     <button type="button" onClick={() => setHasOtherIncome(true)} className={\`px-3 py-1 text-[10px] font-bold rounded \${hasOtherIncome ? 'bg-[#eb8a23] text-white' : 'bg-slate-200 text-slate-600'}\`}>Yes</button>
                     <button type="button" onClick={() => setHasOtherIncome(false)} className={\`px-3 py-1 text-[10px] font-bold rounded \${!hasOtherIncome ? 'bg-[#eb8a23] text-white' : 'bg-slate-200 text-slate-600'}\`}>No</button>
                  </div>
               </div>
               
               {!hasOtherIncome ? (
                  <div className="text-xs font-semibold text-slate-500 italic">No other source of income reported.</div>
               ) : (
                  <div className="space-y-3 pt-3 border-t border-slate-200">
                     <button type="button" onClick={() => setOtherIncomeSources([...otherIncomeSources, { id: Date.now(), source: 'Salary', frequency: 'Monthly', amount: 0, remarks: '' }])} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-[#2d3e50] border border-slate-300 text-[10px] font-bold rounded hover:bg-slate-200">
                        <Plus className="w-3 h-3" /> Add Income Source
                     </button>
                     {otherIncomeSources.map((inc, idx) => (
                        <div key={inc.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-2 border border-slate-200 rounded-lg bg-white items-center">
                           <select value={inc.source} onChange={(e) => { const arr = [...otherIncomeSources]; arr[idx].source = e.target.value; setOtherIncomeSources(arr); }} className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]">
                              <option value="Salary">Salary</option>
                              <option value="Rent">Rent</option>
                              <option value="Agriculture">Agriculture</option>
                              <option value="Pension">Pension</option>
                              <option value="Business">Business</option>
                              <option value="Investment">Investment</option>
                              <option value="Other">Other</option>
                           </select>
                           <select value={inc.frequency} onChange={(e) => { const arr = [...otherIncomeSources]; arr[idx].frequency = e.target.value; setOtherIncomeSources(arr); }} className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]">
                              <option value="Monthly">Monthly</option>
                              <option value="Annual">Annual</option>
                           </select>
                           <div className="relative">
                              <span className="absolute left-2 top-2 text-[10px] font-bold text-slate-500">₹</span>
                              <input type="number" value={inc.amount} onChange={(e) => { const arr = [...otherIncomeSources]; arr[idx].amount = Number(e.target.value); setOtherIncomeSources(arr); }} placeholder="Amount" className="w-full pl-5 pr-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                           </div>
                           <div className="flex items-center gap-1 col-span-2">
                              <input type="text" value={inc.remarks} onChange={(e) => { const arr = [...otherIncomeSources]; arr[idx].remarks = e.target.value; setOtherIncomeSources(arr); }} placeholder="Remarks" className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" />
                              <button onClick={() => { const arr = [...otherIncomeSources]; arr.splice(idx, 1); setOtherIncomeSources(arr); }} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>

            {/* 11. Solar Saving Analysis */}
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-4">
               <label className="block text-xs font-bold text-orange-900">11. Solar Saving Analysis</label>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-[10px] uppercase font-bold text-orange-700 mb-1">Expected Reduction in Operational Cost</label>
                     <div className="relative">
                        <input type="number" value={expectedSolarCostReductionPct} onChange={(e) => setExpectedSolarCostReductionPct(Number(e.target.value))} className="w-full pr-7 pl-3 py-2 text-xs border border-orange-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold bg-white" placeholder="Percentage" />
                        <span className="absolute right-3 top-2 text-slate-500 font-bold">%</span>
                     </div>
                  </div>
                  <div>
                     <label className="block text-[10px] uppercase font-bold text-orange-700 mb-1">Expected Monthly Saving</label>
                     <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-500 font-bold">₹</span>
                        <input type="number" value={expectedSolarMonthlySaving} onChange={(e) => setExpectedSolarMonthlySaving(Number(e.target.value))} className="w-full pl-7 pr-3 py-2 text-xs border border-orange-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold bg-white" placeholder="Amount" />
                     </div>
                  </div>
                  <div className="md:col-span-2 p-3 bg-white border border-orange-100 rounded-lg text-xs font-semibold text-orange-800">
                    Generated: As informed by the applicant, machinery is presently operated through {powerSource.toLowerCase()} setup and approximate electricity expenses are around ₹{monthlyEnergyExpense || 0} per month. Applicant expects reduction in approx. {expectedSolarCostReductionPct || 0}% operational cost after solar installation.
                  </div>
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
            <div>
               <label className="block text-xs font-bold text-slate-700 mb-1">12. Met Person During Visit Time</label>
               <div className="p-3 bg-slate-100 border border-slate-300 rounded-lg flex justify-between items-center">
                  <div className="text-xs font-semibold text-slate-700">
                     {personsMet.map(p => {
                        if (p === 'Applicant') return \`\${applicantName || 'Applicant'} (Self)\`;
                        if (p === 'Co-applicant') return \`\${coApplicantName || 'Co-applicant'} (\${coApplicantRelation === 'Other' ? coApplicantOtherRelation : coApplicantRelation})\`;
                        if (p === 'Other') return \`\${personsMetOtherName} (\${personsMetOtherRelation})\`;
                        return p;
                     }).join(' & ') || 'No persons selected in Applicant Tab.'}
                  </div>
                  <button type="button" onClick={() => setActiveTab('applicant')} className="px-3 py-1.5 text-[10px] bg-white border border-slate-300 text-slate-700 font-bold rounded shadow-sm hover:bg-slate-50">Edit Participants</button>
               </div>
            </div>

            {/* 13. Address of the Meeting */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-700">13. Address of the Meeting</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => {
                    setMeetingAddressSource('RESIDENCE');
                    setMeetAddressLine1(resAddressLine1); setMeetAddressLine2(resAddressLine2);
                    setMeetVillage(resVillage); setMeetCity(resCity); setMeetDistrict(resDistrict);
                    setMeetState(resState); setMeetPin(resPin);
                  }} className={\`text-[10px] px-3 py-1.5 rounded font-bold border \${meetingAddressSource === 'RESIDENCE' ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'}\`}>Use Residence Address</button>
                  <button type="button" onClick={() => {
                    setMeetingAddressSource('BUSINESS');
                    setMeetAddressLine1(busAddressLine1); setMeetAddressLine2(busAddressLine2);
                    setMeetVillage(busVillage); setMeetCity(busCity); setMeetDistrict(busDistrict);
                    setMeetState(busState); setMeetPin(busPin);
                  }} className={\`text-[10px] px-3 py-1.5 rounded font-bold border \${meetingAddressSource === 'BUSINESS' ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'}\`}>Use Business Address</button>
                  <button type="button" onClick={() => {
                    setMeetingAddressSource('OTHER');
                    setMeetAddressLine1(''); setMeetAddressLine2(''); setMeetVillage(''); setMeetCity(''); setMeetDistrict(''); setMeetState(''); setMeetPin('');
                  }} className={\`text-[10px] px-3 py-1.5 rounded font-bold border \${meetingAddressSource === 'OTHER' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'}\`}>Different Address</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-90">
                <input type="text" value={meetAddressLine1} onChange={(e) => setMeetAddressLine1(e.target.value)} disabled={meetingAddressSource !== 'OTHER'} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold md:col-span-2 disabled:bg-slate-100" placeholder="Address Line 1" />
                <input type="text" value={meetAddressLine2} onChange={(e) => setMeetAddressLine2(e.target.value)} disabled={meetingAddressSource !== 'OTHER'} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold md:col-span-2 disabled:bg-slate-100" placeholder="Address Line 2" />
                <input type="text" value={meetVillage} onChange={(e) => setMeetVillage(e.target.value)} disabled={meetingAddressSource !== 'OTHER'} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold disabled:bg-slate-100" placeholder="Village / Locality" />
                <input type="text" value={meetCity} onChange={(e) => setMeetCity(e.target.value)} disabled={meetingAddressSource !== 'OTHER'} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold disabled:bg-slate-100" placeholder="City" />
                <input type="text" value={meetDistrict} onChange={(e) => setMeetDistrict(e.target.value)} disabled={meetingAddressSource !== 'OTHER'} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold disabled:bg-slate-100" placeholder="District" />
                <select value={meetState} onChange={(e) => setMeetState(e.target.value)} disabled={meetingAddressSource !== 'OTHER'} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold disabled:bg-slate-100">
                  <option value="">Select State</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                </select>
                <input type="text" maxLength={6} value={meetPin} onChange={(e) => setMeetPin(e.target.value.replace(/\\D/g, ''))} disabled={meetingAddressSource !== 'OTHER'} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold disabled:bg-slate-100" placeholder="PIN Code" />
              </div>
            </div>

            {/* 14. Locating Premises Type */}
            <div>
               <label className="block text-xs font-bold text-slate-700 mb-2">14. Locating Premises Type</label>
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
                    Generated: The residence premises are located in {locatingPremisesType === 'Other' ? \`a \${locatingPremisesTypeOther}\` : \`a \${locatingPremisesType.toLowerCase()}\`}.
                 </div>
               )}
            </div>

            {/* 15. Ownership */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
               <label className="block text-xs font-bold text-slate-700">15. Ownership</label>
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
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Monthly Rent</label>
                      <div className="relative">
                         <span className="absolute left-3 top-2 text-[10px] font-bold text-slate-500">₹</span>
                         <input type="number" value={propertyRentAmount} onChange={(e) => setPropertyRentAmount(Number(e.target.value))} className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Amount" />
                      </div>
                    </div>
                  )}
                  {propertyOwnership === 'Self-Owned' && (
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Property Owner Name</label>
                      <div className="flex gap-2">
                        <input type="text" value={propertyOwnerName} onChange={(e) => setPropertyOwnerName(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Name" />
                        <button type="button" onClick={() => setPropertyOwnerName(applicantName)} className="text-[10px] whitespace-nowrap bg-slate-200 px-2 py-1 rounded font-bold text-slate-700">Set Applicant</button>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Approximate Property Area (Sq. Ft.)</label>
                    <input type="number" value={propertyArea} onChange={(e) => setPropertyArea(Number(e.target.value))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Sq. Ft." />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Approximate Property Value</label>
                    <div className="relative">
                       <span className="absolute left-3 top-2 text-[10px] font-bold text-slate-500">₹</span>
                       <input type="number" value={propertyValue} onChange={(e) => setPropertyValue(Number(e.target.value))} className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Value" />
                    </div>
                  </div>
                  <div>
                     <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Ownership Document Available?</label>
                     <select value={propertyOwnershipDoc} onChange={(e) => setPropertyOwnershipDoc(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23] bg-white">
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                        <option value="Not Provided">Not Provided</option>
                     </select>
                  </div>
               </div>
            </div>

            {/* 16. House Details */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
               <label className="block text-xs font-bold text-slate-700">16. House Details</label>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Number of Floors</label>
                    <input type="number" value={houseFloors} onChange={(e) => setHouseFloors(Number(e.target.value))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Floors" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Number of Rooms</label>
                    <input type="number" value={houseRooms} onChange={(e) => setHouseRooms(Number(e.target.value))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Rooms" />
                  </div>
                  <div>
                     <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Structure Type</label>
                     <select value={houseStructureType} onChange={(e) => setHouseStructureType(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23] bg-white">
                        <option value="">Select...</option>
                        <option value="Single Story">Single Story</option>
                        <option value="Double Story">Double Story</option>
                        <option value="Multi Story">Multi Story</option>
                        <option value="Other">Other</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Floor</label>
                     <select value={houseFloorPosition} onChange={(e) => setHouseFloorPosition(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23] bg-white">
                        <option value="">Select...</option>
                        <option value="Ground Floor">Ground Floor</option>
                        <option value="Ground + 1">Ground + 1</option>
                        <option value="Ground + 2">Ground + 2</option>
                        <option value="Other">Other</option>
                     </select>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {houseStructureType === 'Other' && <input type="text" value={houseStructureTypeOther} onChange={(e) => setHouseStructureTypeOther(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Specify Structure Type" />}
                  {houseFloorPosition === 'Other' && <input type="text" value={houseFloorPositionOther} onChange={(e) => setHouseFloorPositionOther(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Specify Floor Position" />}
               </div>
               <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Additional Details</label>
                  <input type="text" value={houseAdditionalDetails} onChange={(e) => setHouseAdditionalDetails(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Optional details..." />
               </div>
               <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs font-semibold text-blue-800">
                 Generated: This house has {houseRooms || 0} rooms and is a {houseStructureType === 'Other' ? houseStructureTypeOther.toLowerCase() : houseStructureType.toLowerCase()} structure, comprising {houseFloorPosition === 'Other' ? houseFloorPositionOther.toLowerCase() : houseFloorPosition.toLowerCase()}.
               </div>
            </div>

            {/* 17. Family Background of the Applicant */}
            <div>
               <label className="block text-xs font-bold text-slate-700 mb-1">17. Family Background of the Applicant</label>
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
            </div>

            {/* 18. Monthly Household Expenses */}
            <div>
               <label className="block text-xs font-bold text-slate-700 mb-1">18. Monthly Household Expenses</label>
               <div className="relative md:w-1/3">
                  <span className="absolute left-3 top-2 text-[10px] font-bold text-slate-500">₹</span>
                  <input type="number" value={monthlyHouseholdExpensesAmount} onChange={(e) => setMonthlyHouseholdExpensesAmount(Number(e.target.value))} className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] font-semibold" placeholder="Amount / month" />
               </div>
            </div>

            {/* 19. Electricity Connection Details */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
               <label className="block text-xs font-bold text-slate-700">19. Electricity Connection Details</label>
               <div className="flex gap-2">
                 {['Yes', 'No', 'Not Provided'].map(opt => (
                    <button key={opt} type="button" onClick={() => setHasElectricityConnection(opt)} className={\`px-3 py-1.5 text-[10px] font-bold rounded-lg border \${hasElectricityConnection === opt ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-white text-slate-600 border-slate-300'}\`}>{opt}</button>
                 ))}
               </div>
               
               {hasElectricityConnection === 'Yes' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-200">
                     <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Connection Type</label>
                        <select value={electricityConnectionType} onChange={(e) => setElectricityConnectionType(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23] bg-white">
                           <option value="">Select...</option>
                           <option value="Domestic">Domestic</option>
                           <option value="Commercial">Commercial</option>
                           <option value="Agricultural">Agricultural</option>
                           <option value="Other">Other</option>
                        </select>
                        {electricityConnectionType === 'Other' && (
                           <input type="text" value={electricityConnectionTypeOther} onChange={(e) => setElectricityConnectionTypeOther(e.target.value)} className="w-full mt-2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Specify Type" />
                        )}
                     </div>
                     <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Consumer Number</label>
                        <input type="text" value={electricityConsumerNumber} onChange={(e) => setElectricityConsumerNumber(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Optional" />
                     </div>
                     <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Monthly Expense</label>
                        <div className="relative">
                           <span className="absolute left-3 top-2 text-[10px] font-bold text-slate-500">₹</span>
                           <input type="number" value={electricityMonthlyExpense} onChange={(e) => setElectricityMonthlyExpense(Number(e.target.value))} className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Amount" />
                        </div>
                     </div>
                  </div>
               )}
               {hasElectricityConnection === 'No' && <div className="text-xs font-semibold text-blue-800 bg-blue-50 p-2 rounded">Generated: No Electricity Connection</div>}
            </div>

            {/* 20. Neighbor Name */}
            <div className="space-y-3">
               <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-700">20. Neighbor Name</label>
                  <button type="button" onClick={() => setNeighbors([{ id: Date.now(), name: 'Adjoining neighbors', remark: '' }])} className="text-[10px] bg-slate-100 px-2 py-1 rounded border border-slate-300 font-bold hover:bg-slate-200">No Specific Neighbor Provided</button>
               </div>
               
               <div className="space-y-2">
                  <button type="button" onClick={() => setNeighbors([...neighbors, { id: Date.now(), name: '', remark: '' }])} className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-[#2d3e50] border border-slate-300 text-[10px] font-bold rounded hover:bg-slate-200">
                     <Plus className="w-3 h-3" /> Add Neighbor
                  </button>
                  {neighbors.map((neighbor, idx) => (
                     <div key={neighbor.id} className="flex items-center gap-2">
                        <input type="text" value={neighbor.name} onChange={(e) => { const arr = [...neighbors]; arr[idx].name = e.target.value; setNeighbors(arr); }} className="w-1/2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Neighbor Name" />
                        <input type="text" value={neighbor.remark} onChange={(e) => { const arr = [...neighbors]; arr[idx].remark = e.target.value; setNeighbors(arr); }} className="w-1/2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Relationship / Location" />
                        <button onClick={() => { const arr = [...neighbors]; arr.splice(idx, 1); setNeighbors(arr); }} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                     </div>
                  ))}
               </div>
            </div>

            {/* 21. Neighbor Feedback */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
               <label className="block text-xs font-bold text-slate-700">21. Neighbor Feedback</label>
               <div className="flex items-center gap-4">
                 <span className="text-xs font-semibold text-slate-600">Neighbor Verification Conducted?</span>
                 <button type="button" onClick={() => setNeighborVerificationConducted(true)} className={\`px-3 py-1.5 text-[10px] font-bold rounded-lg border \${neighborVerificationConducted ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-white text-slate-600 border-slate-300'}\`}>Yes</button>
                 <button type="button" onClick={() => setNeighborVerificationConducted(false)} className={\`px-3 py-1.5 text-[10px] font-bold rounded-lg border \${!neighborVerificationConducted ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-white text-slate-600 border-slate-300'}\`}>No</button>
               </div>

               {neighborVerificationConducted && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                     <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Residence Confirmation</label>
                        <select value={neighborResidenceConfirmed} onChange={(e) => setNeighborResidenceConfirmed(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23] bg-white">
                           <option value="">Select...</option>
                           <option value="Confirmed">Confirmed</option>
                           <option value="Not Confirmed">Not Confirmed</option>
                           <option value="Partially Confirmed">Partially Confirmed</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Behaviour Feedback</label>
                        <select value={neighborBehaviourFeedback} onChange={(e) => setNeighborBehaviourFeedback(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23] bg-white">
                           <option value="">Select...</option>
                           <option value="Positive">Positive</option>
                           <option value="Neutral">Neutral</option>
                           <option value="Negative">Negative</option>
                           <option value="Not Provided">Not Provided</option>
                        </select>
                     </div>
                     <div className="md:col-span-2 flex items-center gap-4">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Any Negative Information?</span>
                        <button type="button" onClick={() => setNeighborNegativeFeedback(true)} className={\`px-3 py-1 text-[10px] font-bold rounded border \${neighborNegativeFeedback ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-600 border-slate-300'}\`}>Yes</button>
                        <button type="button" onClick={() => { setNeighborNegativeFeedback(false); setNeighborNegativeDetails(''); }} className={\`px-3 py-1 text-[10px] font-bold rounded border \${!neighborNegativeFeedback ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-white text-slate-600 border-slate-300'}\`}>No</button>
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
            </div>

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
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
               <label className="block text-xs font-bold text-slate-700">23. Residence Status</label>
               <div className="flex flex-wrap gap-2">
                 {['Recommended', 'Not Recommended', 'Pending', 'Requires Further Verification'].map(opt => (
                    <button key={opt} type="button" onClick={() => setResidenceStatus(opt)} className={\`px-4 py-2 text-xs font-bold rounded-lg border \${residenceStatus === opt ? (opt === 'Recommended' ? 'bg-green-600 text-white border-green-600' : opt === 'Not Recommended' ? 'bg-red-600 text-white border-red-600' : 'bg-[#eb8a23] text-white border-[#eb8a23]') : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}\`}>
                      {opt}
                    </button>
                 ))}
               </div>
               {(residenceStatus === 'Not Recommended' || residenceStatus === 'Pending' || residenceStatus === 'Requires Further Verification') && (
                  <textarea value={residenceStatusReason} onChange={(e) => setResidenceStatusReason(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder={\`Reason for \${residenceStatus}...\`} rows={3} />
               )}
            </div>

          </div>
        </div>
      )}
`;

content = content.replace(anchor, replacement + "\n" + anchor);

fs.writeFileSync(filePath, content);
