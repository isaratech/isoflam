// This is a simple test script to verify that rectangle styles are applied correctly
// Run this script in the browser console when the application is running

// Function to create rectangles with different styles
function testRectangleStyles() {
  // Get the scene from the window
  const scene = window.__ISOFLAM_DEBUG__.getScene();
  
  // Create rectangles with different styles
  const solidRectangle = {
    id: 'test-solid-rectangle',
    from: { x: 0, y: 0 },
    to: { x: 2, y: 2 },
    style: 'SOLID'
  };
  
  const dottedRectangle = {
    id: 'test-dotted-rectangle',
    from: { x: 3, y: 0 },
    to: { x: 5, y: 2 },
    style: 'DOTTED'
  };
  
  const dashedRectangle = {
    id: 'test-dashed-rectangle',
    from: { x: 6, y: 0 },
    to: { x: 8, y: 2 },
    style: 'DASHED'
  };
  
  // Create the rectangles
  scene.createRectangle(solidRectangle);
  scene.createRectangle(dottedRectangle);
  scene.createRectangle(dashedRectangle);
  
  console.log('Created test rectangles with different styles:');
  console.log('- Solid rectangle:', solidRectangle);
  console.log('- Dotted rectangle:', dottedRectangle);
  console.log('- Dashed rectangle:', dashedRectangle);
  
  // Log instructions for verification
  console.log('Please verify that:');
  console.log('1. The solid rectangle has a solid border');
  console.log('2. The dotted rectangle has a dotted border');
  console.log('3. The dashed rectangle has a dashed border');
}

// Run the test
testRectangleStyles();