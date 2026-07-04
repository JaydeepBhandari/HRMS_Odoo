const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = walk(srcDir);

// Emoji regex (basic ranges)
const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Remove 3-line block comments
  content = content.replace(/\/\/\s*=+\r?\n\/\/\s*.*?\r?\n\/\/\s*=+\r?\n/g, '');

  // Remove single line separator comments e.g. // ====================
  content = content.replace(/\/\/\s*=+\r?\n/g, '');

  // Remove other common UI section comments like // Logo, // Form, // Helpers
  content = content.replace(/^\s*\/\/\s*(Logo & Header|Form|Demo Quick Access|Logo|Mobile Menu|Desktop Nav Tabs|Right side|Avatar \+ Dropdown|Main Content|Top Navigation|Helpers|Determine tabs|Calculate totals).*?\r?\n/gm, '');

  // Remove emojis
  content = content.replace(emojiRegex, '');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Cleaned ${file}`);
  }
});
console.log('Done');
