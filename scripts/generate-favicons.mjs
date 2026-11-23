import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function main() {
  const inputPath = path.resolve('app/xosominhluan-favicon.png');
  const size = 1024;

  // Mask out the opaque checkerboard corners outside the circular gold rim (r=502)
  const circleMask = Buffer.from(
    `<svg width="${size}" height="${size}">
      <circle cx="512" cy="512" r="502" fill="white" />
    </svg>`
  );

  const transparent1024Buffer = await sharp(inputPath)
    .resize(size, size)
    .ensureAlpha()
    .composite([{ input: circleMask, blend: 'dest-in' }])
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();

  // Save clean transparent PNGs
  fs.writeFileSync('public/xosominhluan-favicon.png', transparent1024Buffer);
  fs.writeFileSync('public/favicon-logo.png', transparent1024Buffer);
  fs.writeFileSync(
    'public/apple-icon.png',
    await sharp(transparent1024Buffer).resize(180, 180).png().toBuffer()
  );

  const p48 = await sharp(transparent1024Buffer).resize(48, 48).png().toBuffer();
  const p32 = await sharp(transparent1024Buffer).resize(32, 32).png().toBuffer();
  const p16 = await sharp(transparent1024Buffer).resize(16, 16).png().toBuffer();

  fs.writeFileSync('public/favicon-48x48.png', p48);
  fs.writeFileSync('public/favicon-32x32.png', p32);
  fs.writeFileSync('public/favicon-16x16.png', p16);
  fs.writeFileSync('public/icon-light-32x32.png', p32);
  fs.writeFileSync('public/icon-dark-32x32.png', p32);

  // Build transparent 32x32 PNG-in-ICO
  const icoHeader = Buffer.alloc(22);
  icoHeader.writeUInt16LE(0, 0);
  icoHeader.writeUInt16LE(1, 2);
  icoHeader.writeUInt16LE(1, 4);
  icoHeader.writeUInt8(32, 6);
  icoHeader.writeUInt8(32, 7);
  icoHeader.writeUInt8(0, 8);
  icoHeader.writeUInt8(0, 9);
  icoHeader.writeUInt16LE(1, 10);
  icoHeader.writeUInt16LE(32, 12);
  icoHeader.writeUInt32LE(p32.length, 14);
  icoHeader.writeUInt32LE(22, 18);

  const icoBuffer = Buffer.concat([icoHeader, p32]);
  fs.writeFileSync('public/favicon.ico', icoBuffer);
  fs.writeFileSync('app/favicon.ico', icoBuffer);

  console.log('Generated all transparent favicons from app/xosominhluan-favicon.png');
}

main().catch(console.error);
