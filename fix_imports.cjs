const fs = require('fs');
const path = require('path');

const files = [
  'regularization.api.ts',
  'profile.api.ts',
  'internship.api.ts',
  'claims.api.ts'
];

for (const file of files) {
  const filePath = path.join(__dirname, 'src', 'api', file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace("import api from './api';", "import api from './axios';");
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed ${file}`);
}
