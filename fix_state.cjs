const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/PDToolView.tsx');
let content = fs.readFileSync(file, 'utf8');

const target = "  const [newCatName, setNewCatName] = useState('');";
const rep = `  const [newCatName, setNewCatName] = useState('');
  const [newCatNumber, setNewCatNumber] = useState('');
  const [newCatSize, setNewCatSize] = useState('');
  const [newCatUsage, setNewCatUsage] = useState('');
  const [newCatCharges, setNewCatCharges] = useState('');`;

if(content.indexOf(target) !== -1) {
    content = content.replace(target, rep);
    fs.writeFileSync(file, content);
} else {
    console.log("Could not find the target string!");
}
