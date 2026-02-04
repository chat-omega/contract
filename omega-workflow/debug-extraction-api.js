/**
 * Debug script to test extraction API endpoints
 * Run with: node debug-extraction-api.js
 */

const docId = 'e37f9df8';
const workflowId = 35;

// Test different endpoints
const endpoints = [
  `http://localhost:8000/api/documents/${docId}/extraction/results?workflow_id=${workflowId}`,
  `http://localhost:8000/api/documents/${docId}/extractions`,
];

async function testEndpoint(url) {
  console.log(`\n========================================`);
  console.log(`Testing: ${url}`);
  console.log(`========================================`);

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`\nResponse structure:`);
    console.log(`- Top-level keys:`, Object.keys(data));

    if (data.fields) {
      console.log(`- data.fields keys:`, Object.keys(data.fields).slice(0, 20));
      console.log(`- Total fields: ${Object.keys(data.fields).length}`);

      // Analyze first field
      const firstFieldId = Object.keys(data.fields)[0];
      const firstField = data.fields[firstFieldId];
      console.log(`\nFirst field (${firstFieldId}):`);
      console.log(`  - Structure:`, Object.keys(firstField));
      console.log(`  - Has extractions:`, firstField.extractions ? 'YES' : 'NO');
      if (firstField.extractions && firstField.extractions[0]) {
        console.log(`  - First extraction:`, {
          text: firstField.extractions[0].text?.substring(0, 50),
          page: firstField.extractions[0].page,
          hasBbox: !!firstField.extractions[0].bbox
        });
      }
    }

    if (data.results) {
      console.log(`- data.results keys:`, Object.keys(data.results).slice(0, 20));
      console.log(`- Total results: ${Object.keys(data.results).length}`);
    }

    console.log(`\nFull response:`);
    console.log(JSON.stringify(data, null, 2).substring(0, 1000));

  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

async function main() {
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
}

main();
