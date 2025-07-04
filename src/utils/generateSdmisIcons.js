const fs = require('fs');
const path = require('path');

// Function to recursively get all PNG files from a directory
function getAllPngFiles(dir, baseDir = dir) {
  let files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files = files.concat(getAllPngFiles(fullPath, baseDir));
    } else if (path.extname(item).toLowerCase() === '.png') {
      files.push({
        fullPath,
        relativePath: path.relative(baseDir, fullPath),
        name: path.basename(item, '.png'),
        category: path.relative(baseDir, path.dirname(fullPath))
      });
    }
  }

  return files;
}

// Function to generate icon ID from filename
function generateIconId(filename, category) {
  // Clean the filename and create a unique ID
  const cleanName = filename
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  const cleanCategory = category
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  return `sdmis_${cleanCategory}_${cleanName}`.toLowerCase();
}

// Function to generate display name from filename
function generateDisplayName(filename) {
  return filename
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

// Main function to generate SDMIS icons
function generateSdmisIcons() {
  const sdmisDir = path.join(__dirname, '..', 'assets', 'Banque icones SDMIS');

  if (!fs.existsSync(sdmisDir)) {
    return;
  }

  const pngFiles = getAllPngFiles(sdmisDir);
  const icons = [];

  for (const file of pngFiles) {
    const iconId = generateIconId(file.name, file.category);
    const displayName = generateDisplayName(file.name);
    const collection = file.category.split(path.sep)[0] || 'SDMIS';

    // Convert Windows path to URL path
    const urlPath = file.relativePath.replace(/\\/g, '/');

    icons.push({
      id: iconId,
      name: displayName,
      url: `./assets/Banque icones SDMIS/${urlPath}`,
      collection: `SDMIS-${collection}`,
      isIsometric: true
    });
  }

  // Generate import statements for each PNG file
  const imports = [];
  const iconEntries = [];

  for (let i = 0; i < icons.length; i++) {
    const icon = icons[i];
    const importName = `icon${i}`;
    const urlPath = icon.url.replace('./assets/', '../assets/');

    imports.push(`import ${importName} from '${urlPath}';`);
    iconEntries.push({
      ...icon,
      url: importName
    });
  }

  // Generate the TypeScript file with proper imports
  const tsContent = `// Auto-generated SDMIS icons
// Generated on ${new Date().toISOString()}
// Total icons: ${icons.length}

import { Icons } from '../types';

${imports.join('\n')}

export const sdmisIcons: Icons = ${JSON.stringify(iconEntries, null, 2).replace(/"icon(\d+)"/g, 'icon$1')};

export default sdmisIcons;
`;

  // Write the file
  const outputPath = path.join(__dirname, '..', 'fixtures', 'sdmisIcons.ts');
  fs.writeFileSync(outputPath, tsContent);
}

// Run the generator
generateSdmisIcons();
