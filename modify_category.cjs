const fs = require('fs');
const path = require('path');

// 1. Update src/types.ts
const typesPath = path.join(__dirname, 'src/types.ts');
let typesContent = fs.readFileSync(typesPath, 'utf8');

const typeTarget = `  requiredDocs: string[];`;
const typeReplacement = `  customNumber?: string;
  customSize?: string;
  customUsage?: string;
  customCharges?: string;
  requiredDocs: string[];`;
if(typesContent.includes(typeTarget) && !typesContent.includes("customNumber?: string;")) {
    typesContent = typesContent.replace(typeTarget, typeReplacement);
    fs.writeFileSync(typesPath, typesContent);
}

// 2. Update PDToolView.tsx
const viewPath = path.join(__dirname, 'src/components/PDToolView.tsx');
let viewContent = fs.readFileSync(viewPath, 'utf8');

const stateTarget = `  const [newCatName, setNewCatName] = useState('');`;
const stateReplacement = `  const [newCatName, setNewCatName] = useState('');
  const [newCatNumber, setNewCatNumber] = useState('');
  const [newCatSize, setNewCatSize] = useState('');
  const [newCatUsage, setNewCatUsage] = useState('');
  const [newCatCharges, setNewCatCharges] = useState('');`;

if(viewContent.includes(stateTarget) && !viewContent.includes("newCatNumber")) {
    viewContent = viewContent.replace(stateTarget, stateReplacement);
}

const saveTarget = `    const newCategory: any = { // using any since original types lack some fields or we mock it
      id: 'cat-' + Date.now(),
      name: newCatName,
      industryGroup: newCatIndustry,
      description: 'Custom added business category',
      typicalMarginMin: newCatMarginMin,
      typicalMarginMax: newCatMarginMax,
      icon: 'Store',
      requiredDocs: [],
      validationRules: []
    };`;

const saveTargetAlternative = `    const newCategory: any = {
      id: 'cat-' + Date.now(),
      name: newCatName,
      industryGroup: newCatIndustry,
      description: 'Custom added business category',
      typicalMarginMin: newCatMarginMin,
      typicalMarginMax: newCatMarginMax,
      icon: 'Store',
      requiredDocs: [],
      validationRules: []
    };`;

// Wait, let's just grep the actual construction in PDToolView
