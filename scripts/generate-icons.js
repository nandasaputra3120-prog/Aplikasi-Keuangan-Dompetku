import fs from 'fs';
import zlib from 'zlib';

function createSolidPng(width, height, r, g, b, a = 255) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type 6: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image data with scanline filter bytes
  const scanlineSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * scanlineSize);

  for (let y = 0; y < height; y++) {
    const offset = y * scanlineSize;
    rawData[offset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelOffset = offset + 1 + x * 4;

      // Draw rounded card motif
      const cx = width / 2;
      const cy = height / 2;
      const dx = Math.abs(x - cx);
      const dy = Math.abs(y - cy);
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Emerald & Teal gradient
      const gradRatio = (x + y) / (width + height);
      let pr = Math.round(5 + gradRatio * 8);
      let pg = Math.round(150 + gradRatio * 50);
      let pb = Math.round(105 + gradRatio * 31);
      let pa = 255;

      // Inside wallet card
      if (dx < width * 0.35 && dy < height * 0.25) {
        pr = 15;
        pg = 23;
        pb = 42;
      }
      // Coin badge
      const coinDist = Math.sqrt(Math.pow(x - width * 0.65, 2) + Math.pow(y - height * 0.52, 2));
      if (coinDist < width * 0.1) {
        pr = 52;
        pg = 211;
        pb = 153;
      }

      rawData[pixelOffset] = pr;
      rawData[pixelOffset + 1] = pg;
      rawData[pixelOffset + 2] = pb;
      rawData[pixelOffset + 3] = pa;
    }
  }

  const idatData = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', idatData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crc = Buffer.alloc(4);
  crc.writeInt32BE(crc32(body), 0);

  return Buffer.concat([len, body, crc]);
}

// Standard CRC32 table
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return crc ^ -1;
}

if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
}

fs.writeFileSync('./public/pwa-192x192.png', createSolidPng(192, 192, 16, 185, 129));
fs.writeFileSync('./public/pwa-512x512.png', createSolidPng(512, 512, 16, 185, 129));
fs.writeFileSync('./public/pwa-maskable-512x512.png', createSolidPng(512, 512, 16, 185, 129));
fs.writeFileSync('./public/apple-touch-icon.png', createSolidPng(180, 180, 16, 185, 129));

console.log('PNG Icons generated successfully in ./public');
