import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODELS = [
  { id: 'hilux', name: 'Toyota Hilux Revo', color: '#E32636' },
  { id: 'fortuner', name: 'Toyota Fortuner', color: '#1A3B5C' },
  { id: 'corolla', name: 'Toyota Corolla e170', color: '#4A4A4A' },
  { id: 'land-cruiser', name: 'Toyota Land Cruiser', color: '#E8E8E8', text: '#333' },
  { id: 'supra', name: 'Toyota GR Supra', color: '#FFD700', text: '#333' }
];

const FRAMES = 36;
const carsDir = path.join(__dirname, 'public', 'cars');

if (!fs.existsSync(carsDir)) {
  fs.mkdirSync(carsDir, { recursive: true });
}

function generateSVG(model, frameIndex) {
  const angle = (frameIndex / FRAMES) * 360;
  const textColor = model.text || '#FFFFFF';
  
  // A sleek minimalist representation of a car that rotates
  return `<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="#f4f4f4" rx="20" />
    
    <!-- Rotating Platform -->
    <ellipse cx="400" cy="450" rx="300" ry="60" fill="#e0e0e0" />
    <path d="M ${400 + Math.cos(angle * Math.PI / 180) * 300} ${450 + Math.sin(angle * Math.PI / 180) * 60} L 400 450" stroke="${model.color}" stroke-width="4" opacity="0.5" />
    
    <!-- Car Representation (Abstract rotating cube/box) -->
    <g transform="translate(400, 300)">
      <!-- Add a rotation effect using a combination of scale and skew based on angle -->
      <g transform="scale(${0.8 + Math.abs(Math.cos(angle * Math.PI / 180)) * 0.4}, 1) skewY(${Math.sin(angle * Math.PI / 180) * 15})">
        <rect x="-200" y="-100" width="400" height="200" rx="40" fill="${model.color}" opacity="0.9" />
        <rect x="-150" y="-150" width="200" height="100" rx="20" fill="rgba(0,0,0,0.4)" />
        <text x="0" y="20" font-family="sans-serif" font-size="32" font-weight="bold" fill="${textColor}" text-anchor="middle">${model.name}</text>
        <text x="0" y="60" font-family="sans-serif" font-size="20" fill="${textColor}" opacity="0.7" text-anchor="middle">Angle: ${Math.round(angle)}°</text>
      </g>
    </g>
    
    <!-- Mock UI Overlay -->
    <text x="40" y="50" font-family="sans-serif" font-size="24" font-weight="bold" fill="#333">CMS Image Mode</text>
    <text x="40" y="80" font-family="sans-serif" font-size="16" fill="#666">Frame ${frameIndex.toString().padStart(2, '0')} / 35</text>
  </svg>`;
}

for (const model of MODELS) {
  const modelDir = path.join(carsDir, model.id);
  if (!fs.existsSync(modelDir)) {
    fs.mkdirSync(modelDir, { recursive: true });
  }

  for (let i = 0; i < FRAMES; i++) {
    // Generate as .jpg extension for the ImageViewer360 component but it's actually SVG content
    // We should save as .jpg if the component expects it, or modify component to expect .svg
    // Wait, browsers parse SVG even if extension is wrong, but it's better to be correct.
    const framePath = path.join(modelDir, `frame_${i.toString().padStart(2, '0')}.svg`);
    fs.writeFileSync(framePath, generateSVG(model, i));
  }
  console.log(`Generated 36 SVG frames for ${model.name}`);
}
