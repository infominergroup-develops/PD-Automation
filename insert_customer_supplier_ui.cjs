const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/PDToolView.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const anchor = `      {activeTab === 'field' && (`;

if (content.indexOf(anchor) === -1) {
  console.log("Could not find anchor");
  process.exit(1);
}

const replacement = `      {activeTab === 'customer_supplier' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-[#2d3e50] uppercase tracking-wider flex items-center gap-2 mb-6">
              <Briefcase className="w-4 h-4 text-[#eb8a23]" />
              Customer & Supplier Details
            </h3>

            {/* A. Applicant's customer and supplier details */}
            <div className="space-y-6">
              {/* Prominent Customers */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                   <h5 className="font-bold text-xs text-slate-700">Prominent Customers</h5>
                   <button type="button" onClick={() => setProminentCustomers([...prominentCustomers, { id: 'c'+Date.now(), name: '', phone: '', feedback: '' }])} className="flex items-center gap-1 px-3 py-1.5 bg-white text-[#2d3e50] border border-slate-300 text-[10px] font-bold rounded hover:bg-slate-50 shadow-sm">
                      <Plus className="w-3 h-3" /> Add Customer
                   </button>
                </div>
                <div className="overflow-x-auto p-3 bg-white">
                   <table className="w-full text-xs text-left text-slate-600">
                     <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                       <tr>
                         <th className="pb-2 w-10 text-center">Sr. No.</th>
                         <th className="pb-2">Prominent Customers (Name)</th>
                         <th className="pb-2">Customers Ph. No.</th>
                         <th className="pb-2">Feedback (Remark)</th>
                         <th className="pb-2 w-10 text-center">Action</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {prominentCustomers.map((cust, idx) => (
                           <tr key={cust.id}>
                             <td className="py-2 text-center font-bold text-slate-400">{idx + 1}</td>
                             <td className="py-2 pr-2"><input type="text" value={cust.name} onChange={(e) => { const arr = [...prominentCustomers]; arr[idx].name = e.target.value; setProminentCustomers(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="Name" /></td>
                             <td className="py-2 pr-2"><input type="text" value={cust.phone} onChange={(e) => { const arr = [...prominentCustomers]; arr[idx].phone = e.target.value.replace(/\\D/g, ''); setProminentCustomers(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="Phone" maxLength={10} /></td>
                             <td className="py-2 pr-2"><input type="text" value={cust.feedback} onChange={(e) => { const arr = [...prominentCustomers]; arr[idx].feedback = e.target.value; setProminentCustomers(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="Feedback" /></td>
                             <td className="py-2 text-center"><button onClick={() => { const arr = [...prominentCustomers]; arr.splice(idx, 1); setProminentCustomers(arr); }} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4 mx-auto" /></button></td>
                           </tr>
                        ))}
                     </tbody>
                   </table>
                </div>
              </div>

              {/* Prominent Suppliers */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                   <h5 className="font-bold text-xs text-slate-700">Prominent Suppliers</h5>
                   <button type="button" onClick={() => setProminentSuppliers([...prominentSuppliers, { id: 's'+Date.now(), name: '', phone: '', feedback: '' }])} className="flex items-center gap-1 px-3 py-1.5 bg-white text-[#2d3e50] border border-slate-300 text-[10px] font-bold rounded hover:bg-slate-50 shadow-sm">
                      <Plus className="w-3 h-3" /> Add Supplier
                   </button>
                </div>
                <div className="overflow-x-auto p-3 bg-white">
                   <table className="w-full text-xs text-left text-slate-600">
                     <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                       <tr>
                         <th className="pb-2 w-10 text-center">Sr. No.</th>
                         <th className="pb-2">Prominent Suppliers (Name)</th>
                         <th className="pb-2">Supplier Ph. No.</th>
                         <th className="pb-2">Feedback (Remark)</th>
                         <th className="pb-2 w-10 text-center">Action</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {prominentSuppliers.map((sup, idx) => (
                           <tr key={sup.id}>
                             <td className="py-2 text-center font-bold text-slate-400">{idx + 1}</td>
                             <td className="py-2 pr-2"><input type="text" value={sup.name} onChange={(e) => { const arr = [...prominentSuppliers]; arr[idx].name = e.target.value; setProminentSuppliers(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="Name or 'Not applicable'" /></td>
                             <td className="py-2 pr-2"><input type="text" value={sup.phone} onChange={(e) => { const arr = [...prominentSuppliers]; arr[idx].phone = e.target.value.replace(/\\D/g, ''); setProminentSuppliers(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="Phone" maxLength={10} /></td>
                             <td className="py-2 pr-2"><input type="text" value={sup.feedback} onChange={(e) => { const arr = [...prominentSuppliers]; arr[idx].feedback = e.target.value; setProminentSuppliers(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="Feedback" /></td>
                             <td className="py-2 text-center"><button onClick={() => { const arr = [...prominentSuppliers]; arr.splice(idx, 1); setProminentSuppliers(arr); }} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4 mx-auto" /></button></td>
                           </tr>
                        ))}
                     </tbody>
                   </table>
                </div>
              </div>
            </div>

            {/* B. Banking Details */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
               <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                  <h5 className="font-bold text-xs text-slate-700">Banking Details and Limit OD and CC limit with bank</h5>
                  <button type="button" onClick={() => setBankingDetails([...bankingDetails, { id: 'b'+Date.now(), bankName: '', branchName: '', accountType: 'Saving Account', limit: 'NA', accountNo: '', remark: 'The account belongs to applicant' }])} className="flex items-center gap-1 px-3 py-1.5 bg-white text-[#2d3e50] border border-slate-300 text-[10px] font-bold rounded hover:bg-slate-50 shadow-sm">
                     <Plus className="w-3 h-3" /> Add Bank
                  </button>
               </div>
               <div className="overflow-x-auto p-3 bg-white">
                  <table className="w-full text-xs text-left text-slate-600">
                    <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="pb-2">Bank Name</th>
                        <th className="pb-2">Branch Name</th>
                        <th className="pb-2">Account Types</th>
                        <th className="pb-2">CC/OD Limit</th>
                        <th className="pb-2">Account No.</th>
                        <th className="pb-2">Remark</th>
                        <th className="pb-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {bankingDetails.map((bank, idx) => (
                          <tr key={bank.id}>
                            <td className="py-2 pr-2"><input type="text" value={bank.bankName} onChange={(e) => { const arr = [...bankingDetails]; arr[idx].bankName = e.target.value; setBankingDetails(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="e.g. UCO Bank" /></td>
                            <td className="py-2 pr-2"><input type="text" value={bank.branchName} onChange={(e) => { const arr = [...bankingDetails]; arr[idx].branchName = e.target.value; setBankingDetails(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="Branch" /></td>
                            <td className="py-2 pr-2">
                               <select value={bank.accountType} onChange={(e) => { const arr = [...bankingDetails]; arr[idx].accountType = e.target.value; setBankingDetails(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23] bg-white">
                                  <option value="Saving Account">Saving Account</option>
                                  <option value="Current Account">Current Account</option>
                                  <option value="OD">OD</option>
                                  <option value="CC">CC</option>
                                  <option value="Other">Other</option>
                               </select>
                            </td>
                            <td className="py-2 pr-2"><input type="text" value={bank.limit} onChange={(e) => { const arr = [...bankingDetails]; arr[idx].limit = e.target.value; setBankingDetails(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="Limit or NA" /></td>
                            <td className="py-2 pr-2"><input type="text" value={bank.accountNo} onChange={(e) => { const arr = [...bankingDetails]; arr[idx].accountNo = e.target.value; setBankingDetails(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="*******9522" /></td>
                            <td className="py-2 pr-2"><input type="text" value={bank.remark} onChange={(e) => { const arr = [...bankingDetails]; arr[idx].remark = e.target.value; setBankingDetails(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="Remark" /></td>
                            <td className="py-2 text-center"><button onClick={() => { const arr = [...bankingDetails]; arr.splice(idx, 1); setBankingDetails(arr); }} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4 mx-auto" /></button></td>
                          </tr>
                       ))}
                    </tbody>
                  </table>
               </div>
            </div>

            {/* C. Existing Loans / Liabilities */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
               <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                  <h5 className="font-bold text-xs text-slate-700">Existing Loans / Liabilities</h5>
                  <button type="button" onClick={() => setExistingLoans([...existingLoans, { id: 'l'+Date.now(), typeOfLoan: 'NA', financerName: 'NA', amountInLakhs: '', emi: '', tenure: '', balanceTenure: '', remark: '' }])} className="flex items-center gap-1 px-3 py-1.5 bg-white text-[#2d3e50] border border-slate-300 text-[10px] font-bold rounded hover:bg-slate-50 shadow-sm">
                     <Plus className="w-3 h-3" /> Add Loan
                  </button>
               </div>
               <div className="overflow-x-auto p-3 bg-white">
                  <table className="w-full text-xs text-left text-slate-600">
                    <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="pb-2">Type of Loan</th>
                        <th className="pb-2">Financer Name</th>
                        <th className="pb-2">Loan Amount (In Lakhs)</th>
                        <th className="pb-2">EMI (Rs.)</th>
                        <th className="pb-2">Tenure (Y, M)</th>
                        <th className="pb-2">Balance Tenure</th>
                        <th className="pb-2">Remark</th>
                        <th className="pb-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {existingLoans.map((loan, idx) => (
                          <tr key={loan.id}>
                            <td className="py-2 pr-2"><input type="text" value={loan.typeOfLoan} onChange={(e) => { const arr = [...existingLoans]; arr[idx].typeOfLoan = e.target.value; setExistingLoans(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="NA" /></td>
                            <td className="py-2 pr-2"><input type="text" value={loan.financerName} onChange={(e) => { const arr = [...existingLoans]; arr[idx].financerName = e.target.value; setExistingLoans(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="NA" /></td>
                            <td className="py-2 pr-2"><input type="number" step="any" value={loan.amountInLakhs} onChange={(e) => { const arr = [...existingLoans]; arr[idx].amountInLakhs = e.target.value; setExistingLoans(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="Amount" /></td>
                            <td className="py-2 pr-2"><input type="number" step="any" value={loan.emi} onChange={(e) => { const arr = [...existingLoans]; arr[idx].emi = e.target.value; setExistingLoans(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="EMI" /></td>
                            <td className="py-2 pr-2"><input type="text" value={loan.tenure} onChange={(e) => { const arr = [...existingLoans]; arr[idx].tenure = e.target.value; setExistingLoans(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="e.g. 5, 0" /></td>
                            <td className="py-2 pr-2"><input type="text" value={loan.balanceTenure} onChange={(e) => { const arr = [...existingLoans]; arr[idx].balanceTenure = e.target.value; setExistingLoans(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="e.g. 2, 6" /></td>
                            <td className="py-2 pr-2"><input type="text" value={loan.remark} onChange={(e) => { const arr = [...existingLoans]; arr[idx].remark = e.target.value; setExistingLoans(arr); }} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#eb8a23]" placeholder="No any existing obligation" /></td>
                            <td className="py-2 text-center"><button onClick={() => { const arr = [...existingLoans]; arr.splice(idx, 1); setExistingLoans(arr); }} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4 mx-auto" /></button></td>
                          </tr>
                       ))}
                    </tbody>
                  </table>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                     <label className="text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap">Current Obligation</label>
                     <input type="text" value={currentObligation} onChange={(e) => setCurrentObligation(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]" placeholder="e.g. No any existing obligation" />
                  </div>
               </div>
            </div>

            {/* D. Co-Applicant Business Details */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 mt-6">
               <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-700">Business Details of Co-applicants</label>
                  <div className="flex gap-2">
                     <button type="button" onClick={() => setCoApplicantInBusiness(true)} className={\`px-3 py-1.5 text-[10px] font-bold rounded-lg border \${coApplicantInBusiness ? 'bg-[#eb8a23] text-white border-[#eb8a23]' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}\`}>Co-applicant is in Business</button>
                     <button type="button" onClick={() => setCoApplicantInBusiness(false)} className={\`px-3 py-1.5 text-[10px] font-bold rounded-lg border \${!coApplicantInBusiness ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}\`}>Not involved</button>
                  </div>
               </div>
               {coApplicantInBusiness && (
                  <div>
                     <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Details / Role in Business</label>
                     <textarea value={coApplicantBusinessRole} onChange={(e) => setCoApplicantBusinessRole(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]" placeholder="Specify role, shareholding, responsibilities..." rows={2} />
                  </div>
               )}
            </div>

            {/* E. Latitude & Longitude Remarks */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 mt-6">
               <label className="block text-xs font-bold text-slate-700">Latitude & Longitude of the Business Premises</label>
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                     <input type="number" step="any" value={gpsLat} onChange={(e) => setGpsLat(Number(e.target.value))} className="w-28 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Lat (e.g. 25.6)" />
                     <input type="number" step="any" value={gpsLng} onChange={(e) => setGpsLng(Number(e.target.value))} className="w-28 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-[#eb8a23]" placeholder="Lng (e.g. 86.1)" />
                  </div>
                  <button type="button" onClick={() => {
                     if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                           (pos) => { setGpsLat(pos.coords.latitude); setGpsLng(pos.coords.longitude); },
                           (err) => { alert('Geolocation error: ' + err.message); }
                        );
                     } else {
                        alert("Geolocation is not supported by this browser.");
                     }
                  }} className="flex items-center gap-2 px-3 py-2 bg-[#2d3e50] text-white rounded-lg text-xs font-bold shadow-sm hover:bg-slate-800 transition">
                     <MapPin className="w-3 h-3" /> Get Location
                  </button>
               </div>
               <div className="border-t border-slate-200 pt-3">
                  <div className="flex items-center justify-between mb-2">
                     <label className="block text-[10px] uppercase font-bold text-slate-500">Location Verified by GPS?</label>
                     <div className="flex gap-2">
                        <button type="button" onClick={() => { setBusinessLongitudeVerified(true); setBusinessLongitudeRemarks("The location was successfully verified using the provided coordinates."); }} className={\`px-3 py-1 text-[10px] font-bold rounded border \${businessLongitudeVerified ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}\`}>Yes, Verified</button>
                        <button type="button" onClick={() => { setBusinessLongitudeVerified(false); setBusinessLongitudeRemarks("The location was checked using the provided coordinates; however, the GPS map was unable to navigate up to the exact point."); }} className={\`px-3 py-1 text-[10px] font-bold rounded border \${!businessLongitudeVerified ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}\`}>No, Navigation Failed</button>
                     </div>
                  </div>
                  <textarea value={businessLongitudeRemarks} onChange={(e) => setBusinessLongitudeRemarks(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] text-blue-900 bg-blue-50 font-semibold" rows={2} />
               </div>
            </div>

            {/* F. Neighbor Name & Feedback */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 mt-6">
               <label className="block text-xs font-bold text-slate-700">Neighbor Feedback (Business)</label>
               <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Neighbor Name</label>
                  <input type="text" value={businessNeighbourName} onChange={(e) => setBusinessNeighbourName(e.target.value)} className="w-full md:w-1/2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]" placeholder="e.g. Adjoining neighbors" />
               </div>
               <div>
                  <div className="flex items-center justify-between mb-1">
                     <label className="block text-[10px] uppercase font-bold text-slate-500">Feedback Remark</label>
                     <button type="button" onClick={() => setBusinessNeighbourFeedback("Neighbour verification was conducted, wherein neighbours confirmed that the applicant has been engaged in his stated business for a considerable period, indicating business stability. The feedback received was positive regarding his work, and overall reputation in the locality.")} className="text-[9px] text-[#eb8a23] hover:underline font-bold">Autofill Standard Positive Remark</button>
                  </div>
                  <textarea value={businessNeighbourFeedback} onChange={(e) => setBusinessNeighbourFeedback(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23] text-blue-900 bg-blue-50 font-semibold" rows={3} />
               </div>
            </div>

            {/* G. Business Status */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 mt-6">
               <label className="block text-xs font-bold text-slate-700">Business Status</label>
               <div className="flex flex-wrap gap-2">
                 {['Recommended', 'Not Recommended'].map(opt => (
                    <button key={opt} type="button" onClick={() => setBusinessStatus(opt)} className={\`px-6 py-2.5 text-xs font-bold rounded-lg border \${businessStatus === opt ? (opt === 'Recommended' ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-red-600 text-white border-red-600 shadow-md') : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}\`}>
                      {opt}
                    </button>
                 ))}
               </div>
            </div>

          </div>
        </div>
      )}
`;

content = content.replace(anchor, replacement + "\n" + anchor);

fs.writeFileSync(filePath, content);
