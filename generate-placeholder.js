// Generates a simple 200x200 BMP placeholder image (no dependencies needed)
const fs = require('fs');
const path = require('path');

// Create a minimal 1x1 PNG (red pixel) as a self-hosted test image
// This is the smallest valid PNG possible
const pngHeader = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A  // PNG signature
]);

// We'll use a data-URI SVG approach instead — write an SVG file
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
  <rect width="300" height="200" fill="#56002a"/>
  <text x="150" y="105" text-anchor="middle" fill="#ffbe16" font-family="Arial" font-size="20">Self-Hosted Image</text>
</svg>`;

fs.writeFileSync(path.join(__dirname, 'public', 'images', 'local-sample.svg'), svg);

const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
  <rect width="300" height="200" fill="#C30046"/>
  <text x="150" y="105" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="20">Another Local Image</text>
</svg>`;

fs.writeFileSync(path.join(__dirname, 'public', 'images', 'local-sample-2.svg'), svg2);

console.log('Placeholder images generated.');
