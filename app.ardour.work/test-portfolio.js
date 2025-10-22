// Simple test to verify default portfolio
const fs = require('fs');
const path = require('path');

// Read the file as text since it's TypeScript
const filePath = path.join(__dirname, 'src', 'generated_portfolio_data.ts');
const content = fs.readFileSync(filePath, 'utf-8');

// Find the allPortfolios array definition
const match = content.match(/export const allPortfolios[^=]*=\s*\[\s*([^\]]+)\]/);
if (match) {
  const portfolios = match[1].split(',').map(p => p.trim()).filter(p => p);
  console.log('Portfolio Order:');
  portfolios.forEach((p, i) => console.log(`  ${i}: ${p}`));

  if (portfolios[0] === 'megadelta_capital_portfolio') {
    console.log('\n✅ SUCCESS: megadelta_capital_portfolio is the default (first) portfolio');
  } else {
    console.log(`\n❌ FAIL: Default portfolio is ${portfolios[0]}, expected megadelta_capital_portfolio`);
    process.exit(1);
  }
} else {
  console.log('❌ Could not parse allPortfolios array');
  process.exit(1);
}
