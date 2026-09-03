const fs = require('fs');
let content = fs.readFileSync('src/utils/pdReportPrinter.ts', 'utf8');

// 1. Fix familyList assignment
content = content.replace(
  /const familyList = data\.familyMembers && data\.familyMembers\.length > 0 \? data\.familyMembers : \[[^\]]+\];/g,
  'const familyList = data.familyMembers && data.familyMembers.length > 0 ? data.familyMembers : [];'
);

// 2. Fix the familyList.map rendering
content = content.replace(
  /\$\{familyList\.map\(f => `[\s\S]*?`\)\.join\(''\)\}/g,
  `\${familyList.map((f, index) => \`
            <tr>
              <td style="border: 1px solid #000;" class="text-center">\${index + 1}</td>
              <td style="border: 1px solid #000;">\${f.name || 'null'}</td>
              <td style="border: 1px solid #000;" class="text-center">\${f.age || 'null'}</td>
              <td style="border: 1px solid #000;" class="text-center">\${f.relationship || 'null'}</td>
              <td style="border: 1px solid #000;" class="text-center">\${f.qualification || 'null'}</td>
              <td style="border: 1px solid #000;" class="text-center">\${f.occupation || f.profession || 'null'}</td>
              <td style="border: 1px solid #000;" class="text-center">\${f.isDependent ? 'Yes' : 'No'}</td>
            </tr>
          \`).join('')}`
);

// 3. Replace all || 'long fallbacks' with || 'null'
content = content.replace(/\|\|\s*'([^']*)'/g, (match, p1) => {
  if (p1 === 'Moneyboxx Finance Limited') return match; 
  if (p1 === '') return match;
  return "|| 'null'";
});

content = content.replace(/\|\|\s*`([^`]*)`/g, "|| 'null'");

fs.writeFileSync('src/utils/pdReportPrinter.ts', content, 'utf8');
console.log('Successfully replaced fallbacks with null');
