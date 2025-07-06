// Test script to verify the sharing functionality
const LZString = require('lz-string');

// Function to create a test model with a specified number of items
function createTestModel(itemCount) {
  const model = {
    version: '1.0',
    title: 'Test Model',
    description: 'A test model for sharing functionality',
    items: [],
    views: [
      {
        id: 'view1',
        name: 'Test View',
        description: 'A test view',
        items: [],
        rectangles: [],
        connectors: [],
        textBoxes: []
      }
    ],
    icons: [],
    colors: [
      {
        id: 'color1',
        value: '#000000'
      }
    ]
  };

  // Add the specified number of items
  for (let i = 0; i < itemCount; i++) {
    const item = {
      id: `item${i}`,
      tile: { x: i, y: i },
      labelHeight: 80,
      scaleFactor: 1,
      color: 'color1',
      mirrorHorizontal: false,
      mirrorVertical: false
    };
    model.views[0].items.push(item);
  }

  return model;
}

// Function to compress a model and check if it fits within the URL limit
function testCompression(itemCount) {
  const model = createTestModel(itemCount);
  const modelJson = JSON.stringify(model);
  const compressedData = LZString.compressToEncodedURIComponent(modelJson);
  const url = `https://example.com?share=${compressedData}`;
  
  console.log(`Model with ${itemCount} items:`);
  console.log(`- JSON size: ${modelJson.length} characters`);
  console.log(`- Compressed size: ${compressedData.length} characters`);
  console.log(`- URL length: ${url.length} characters`);
  console.log(`- Fits within 2048 character limit: ${url.length <= 2048}`);
  console.log('');
  
  return url.length <= 2048;
}

// Test with different numbers of items
console.log('Testing sharing functionality with different scene sizes...');
console.log('');

testCompression(1);   // Very small scene
testCompression(10);  // Small scene
testCompression(50);  // Medium scene
testCompression(100); // Large scene
testCompression(200); // Very large scene
testCompression(300); // Extremely large scene

// Find the maximum number of items that can fit within the URL limit
let min = 1;
let max = 1000;
let maxItems = 0;

while (min <= max) {
  const mid = Math.floor((min + max) / 2);
  if (testCompression(mid)) {
    maxItems = mid;
    min = mid + 1;
  } else {
    max = mid - 1;
  }
}

console.log(`Maximum number of items that can fit within the URL limit: ${maxItems}`);