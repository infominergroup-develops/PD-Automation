const fs = require('fs');
const path = require('path');

// Fix EmployeeManagementView.tsx
const empPath = path.join(__dirname, 'src/components/EmployeeManagementView.tsx');
let empContent = fs.readFileSync(empPath, 'utf8');

empContent = empContent.replace(
  /{key: 'CREDIT_MANAGER'[^}]*},/g, ''
).replace(
  /{key: 'FIELD_OFFICER'[^}]*},/g, ''
).replace(
  /{key: 'AUDITOR'[^}]*},/g, ''
);

// Roles in select
const selectRolesOld = `<option value="ADMIN">Admin</option>
                    <option value="CREDIT_MANAGER">Credit Manager</option>
                    <option value="FIELD_OFFICER">Field Officer</option>
                    <option value="AUDITOR">Auditor</option>`;
const selectRolesNew = `<option value="ADMIN">Admin</option>
                    <option value="MANAGER">Manager</option>
                    <option value="EMPLOYEE">Employee</option>`;
empContent = empContent.replace(selectRolesOld, selectRolesNew);

// Filter tabs
empContent = empContent.replace(
  /\['ALL', 'ADMIN', 'CREDIT_MANAGER', 'FIELD_OFFICER', 'AUDITOR'\]/g,
  "['ALL', 'ADMIN', 'MANAGER', 'EMPLOYEE']"
);

// roles enum mapping (lines 125+)
const mapOld = `    ADMIN: { label: 'Admin', bg: 'bg-purple-100 border-purple-300', text: 'text-purple-800' },
    CREDIT_MANAGER: { label: 'Credit Manager', bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-800' },
    FIELD_OFFICER: { label: 'Field Officer', bg: 'bg-blue-100 border-blue-300', text: 'text-blue-800' },
    AUDITOR: { label: 'Auditor', bg: 'bg-amber-100 border-amber-300', text: 'text-amber-800' },
    MANAGER: { label: 'Manager', bg: 'bg-amber-100 border-amber-300', text: 'text-amber-800' },
    EMPLOYEE: { label: 'Employee', bg: 'bg-slate-100 border-slate-300', text: 'text-slate-800' }`;
const mapNew = `    ADMIN: { label: 'Admin', bg: 'bg-purple-100 border-purple-300', text: 'text-purple-800' },
    MANAGER: { label: 'Manager', bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-800' },
    EMPLOYEE: { label: 'Employee', bg: 'bg-blue-100 border-blue-300', text: 'text-blue-800' }`;
empContent = empContent.replace(mapOld, mapNew);

fs.writeFileSync(empPath, empContent);

// Fix PDToolView.tsx
const pdPath = path.join(__dirname, 'src/components/PDToolView.tsx');
let pdContent = fs.readFileSync(pdPath, 'utf8');

pdContent = pdContent.replace(`label: '3. Field Verification'`, `label: '5. Field Verification'`)
  .replace(`label: '4. Financial Analysis'`, `label: '6. Financial Analysis'`)
  .replace(`label: '5. Risk Score & Summary'`, `label: '7. Risk Score & Summary'`)
  .replace(`label: '3. Field Investigation & EXIF'`, `label: '5. Field Investigation & EXIF'`)
  .replace(`label: '4. Waterfall Cash Flow Engine'`, `label: '6. Waterfall Cash Flow Engine'`)
  .replace(`label: '5. Risk Score & Decision'`, `label: '7. Risk Score & Decision'`);

fs.writeFileSync(pdPath, pdContent);

