import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const publicDir = path.join(process.cwd(), 'public', 'MY_BABY');
    const files = fs.readdirSync(publicDir).filter(file =>
      file.match(/\.(png|jpe?g|gif|webp|avif|svg)$/i)
    );
    return new Response(JSON.stringify({ images: files }), {
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