const fs = require('fs');
const path = require('path');

const viewPath = path.join(__dirname, 'src/components/PDToolView.tsx');
let viewContent = fs.readFileSync(viewPath, 'utf8');

const saveTarget = `    const newCat: BusinessCategory = {
      id: newCatId,
      name: newCatName.trim(),
      icon: '✨',
      description: 'Custom added business category',
      industryGroup: newCatIndustry,
      typicalMarginMin: newCatMarginMin,
      typicalMarginMax: newCatMarginMax,
      requiredDocs: [],
      validationRules: [],
      riskParameters: []
    };`;

const saveReplacement = `    const newCat: BusinessCategory = {
      id: newCatId,
      name: newCatName.trim(),
      icon: '✨',
      description: 'Custom added business category',
      industryGroup: newCatIndustry,
      typicalMarginMin: newCatMarginMin,
      typicalMarginMax: newCatMarginMax,
      customNumber: newCatNumber,
      customSize: newCatSize,
      customUsage: newCatUsage,
      customCharges: newCatCharges,
      requiredDocs: [],
      validationRules: [],
      riskParameters: []
    };`;

if (viewContent.includes(saveTarget)) {
    viewContent = viewContent.replace(saveTarget, saveReplacement);
}

const uiTarget = `                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Industry Group</label>`;

const uiReplacement = `                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Number</label>
                    <input type="text" value={newCatNumber} onChange={(e) => setNewCatNumber(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]" placeholder="e.g. 10" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Size</label>
                    <input type="text" value={newCatSize} onChange={(e) => setNewCatSize(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]" placeholder="e.g. Large" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Usage</label>
                    <input type="text" value={newCatUsage} onChange={(e) => setNewCatUsage(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]" placeholder="e.g. Commercial" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Charges</label>
                    <input type="text" value={newCatCharges} onChange={(e) => setNewCatCharges(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb8a23]" placeholder="e.g. ₹500/day" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Industry Group</label>`;

if (viewContent.includes(uiTarget) && !viewContent.includes("newCatNumber}")) {
    viewContent = viewContent.replace(uiTarget, uiReplacement);
}

// Ensure the clear function resets the new fields
const clearTarget = `    setNewCatMarginMin(15);
    setNewCatMarginMax(40);`;
const clearReplacement = `    setNewCatMarginMin(15);
    setNewCatMarginMax(40);
    setNewCatNumber('');
    setNewCatSize('');
    setNewCatUsage('');
    setNewCatCharges('');`;

if (viewContent.includes(clearTarget)) {
    viewContent = viewContent.replace(clearTarget, clearReplacement);
}

fs.writeFileSync(viewPath, viewContent);
