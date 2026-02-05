import fs from 'fs';
import path from 'path';
import { IMAGE_VERSION } from '../../config/images.js';

export async function GET(request) {
  try {
    // Read from the configured version folder (V1 or V2)
    const publicDir = path.join(process.cwd(), 'public', 'MY_BABY', IMAGE_VERSION);
    const files = fs.readdirSync(publicDir).filter(file =>
      file.match(/\.(png|jpe?g|gif|webp|avif|svg)$/i)
    );
    return new Response(JSON.stringify({ images: files, version: IMAGE_VERSION }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to read images' }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}