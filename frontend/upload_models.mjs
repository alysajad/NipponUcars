import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Extract keys from backend/.env manually to avoid dotenv dependency
const envPath = path.resolve('../backend/.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

const getEnv = (key) => {
  const match = envContent.match(new RegExp(`${key}=(.*)`));
  return match ? match[1].trim() : null;
};

cloudinary.config({
  cloud_name: getEnv('CLOUDINARY_CLOUD_NAME'),
  api_key: getEnv('CLOUDINARY_API_KEY'),
  api_secret: getEnv('CLOUDINARY_API_SECRET')
});

const filesToUpload = [
  "hilux-ultra.glb"
];

async function uploadModels() {
  const urls = {};
  
  for (const filename of filesToUpload) {
    const filePath = path.join(process.cwd(), 'public', filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found, skipping: ${filename}`);
      continue;
    }
    
    console.log(`Uploading ${filename}...`);
    try {
      const res = await cloudinary.uploader.upload(filePath, {
        resource_type: 'raw',
        folder: '3d_models',
        use_filename: true,
        unique_filename: false
      });
      urls[filename] = res.secure_url;
      console.log(`Success: ${res.secure_url}`);
    } catch (err) {
      console.error(`Failed to upload ${filename}:`, err);
    }
  }
  
  fs.writeFileSync('urls.json', JSON.stringify(urls, null, 2));
  console.log('Finished. URLs saved to urls.json');
}

uploadModels();
