import express from 'express';
import { createServer as createViteServer } from 'vite';
import { PKPass } from 'passkit-generator';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Normalizes PEM strings from environment variables.
 * Handles literal \n characters, surrounding quotes, and potential base64 encoding.
 */
function normalizePEM(pem?: string): string {
  if (!pem) return '';
  
  let trimmed = pem.trim();
  
  // Remove surrounding quotes if present (common in some env setups)
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || 
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    trimmed = trimmed.substring(1, trimmed.length - 1);
  }
  
  // Check if it's base64 encoded (common workaround for env vars)
  if (!trimmed.startsWith('-----') && /^[A-Za-z0-9+/=\s]+$/.test(trimmed)) {
    try {
      const decoded = Buffer.from(trimmed, 'base64').toString('utf-8');
      if (decoded.includes('-----BEGIN')) {
        trimmed = decoded;
      }
    } catch (e) {
      // Not base64, continue
    }
  }

  // Replace literal \n characters with actual newlines
  let result = trimmed.replace(/\\n/g, '\n');
  
  // If it's a single line but contains PEM headers, it might have lost its newlines
  // node-forge (used by passkit-generator) is very strict about PEM formatting.
  if (result.includes('-----BEGIN') && !result.includes('\n')) {
    // This is a last-resort fix for single-line PEMs
    result = result
      .replace(/-----BEGIN ([A-Z ]+)-----/, '-----BEGIN $1-----\n')
      .replace(/-----END ([A-Z ]+)-----/, '\n-----END $1-----')
      .replace(/([^-])(-----END)/, '$1\n$2');
  }

  return result;
}

// Cache for image buffers to speed up generation
const imageCache: Record<string, Buffer> = {};

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Route for generating .pkpass
  app.post('/api/generate-pass', async (req, res) => {
    try {
      const { concert, userName, price, area, seat, location } = req.body;

      // Normalize certificates
      const wwdr = normalizePEM(process.env.APPLE_WWDR_CERT);
      const signerCert = normalizePEM(process.env.APPLE_SIGNER_CERT);
      const signerKey = normalizePEM(process.env.APPLE_SIGNER_KEY);
      const passphrase = process.env.APPLE_SIGNER_KEY_PASSPHRASE?.trim() || undefined;

      const hasCerts = wwdr.includes('-----BEGIN') && 
                       signerCert.includes('-----BEGIN') && 
                       signerKey.includes('-----BEGIN');

      if (!hasCerts) {
        console.error('Missing or invalid certificates in environment variables');
        const missing = [];
        if (!wwdr.includes('-----BEGIN')) missing.push('APPLE_WWDR_CERT');
        if (!signerCert.includes('-----BEGIN')) missing.push('APPLE_SIGNER_CERT');
        if (!signerKey.includes('-----BEGIN')) missing.push('APPLE_SIGNER_KEY');
        
        return res.status(400).json({
          error: 'Missing or Invalid Certificates',
          message: `Apple Wallet passes (.pkpass) MUST be digitally signed. The following certificates are missing or invalid: ${missing.join(', ')}. Ensure they are in PEM format (starting with -----BEGIN) or base64 encoded PEM.`
        });
      }

      // Fetch thumbnail image (poster)
      const buffers: Record<string, Buffer> = {};
      
      // Load background image from local filesystem
      try {
        const season = concert.season || 5;
        const cacheKey = `bg-${season}`;
        
        if (imageCache[cacheKey]) {
          buffers['background.png'] = imageCache[cacheKey];
        } else {
          const bgPaths = [
            path.join(__dirname, 'public', 'imgs', `grandline${season}_bg.jpg`),
            path.join(__dirname, 'imgs', `grandline${season}_bg.jpg`),
            path.join(__dirname, `grandline${season}_bg.jpg`)
          ];
          
          const bgPath = bgPaths.find(p => fs.existsSync(p));
          
          if (bgPath) {
            // Use canvas to ensure it's a valid PNG for Apple Wallet
            const image = await loadImage(bgPath);
            const canvas = createCanvas(image.width, image.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            const buffer = canvas.toBuffer('image/png');
            imageCache[cacheKey] = buffer;
            buffers['background.png'] = buffer;
          }
        }
      } catch (e) {
        console.warn('Failed to load background image for pass', e);
      }

      // Load thumbnail image (poster) from local filesystem
      try {
        const season = concert.season || 5;
        let posterFileName = '';
        const cityMap: Record<string, string> = {
          '北京': 'beijing',
          '成都': 'chengdu',
          '海口': 'haikou',
          '上海': 'shanghai',
          '宁波': 'ningbo',
          '南京': 'nanjing',
          '深圳': 'shenzhen',
          '广州': 'guangzhou',
          '西安': 'xian',
          '横滨': 'yokohama',
          '雅加达': 'jakarta',
          '首尔': 'seoul',
          '吉隆坡': 'kualalumpur',
          '厦门': 'xiamen',
          '郑州': 'zhengzhou'
        };

        const pinyin = cityMap[concert.city] || 'beijing';

        if (season === 5 && concert.city === '北京' && concert.venue.includes('鸟巢')) {
          if (concert.date === '2025-10-06') posterFileName = 'beijing5_niaochao_day1.jpg';
          else if (concert.date === '2025-10-07') posterFileName = 'beijing5_niaochao_day2.jpg';
          else posterFileName = 'beijing5.jpg';
        } else {
          posterFileName = `${pinyin}${season}.jpg`;
        }

        const cacheKey = `poster-${season}-${posterFileName}`;
        
        if (imageCache[cacheKey]) {
          buffers['thumbnail.png'] = imageCache[cacheKey];
        } else {
          const posterPaths = [
            path.join(__dirname, 'public', 'imgs', `grandline${season}`, posterFileName),
            path.join(__dirname, 'imgs', `grandline${season}`, posterFileName),
            path.join(__dirname, posterFileName)
          ];
          
          const posterPath = posterPaths.find(p => fs.existsSync(p));

          if (posterPath) {
            const image = await loadImage(posterPath);
            const canvas = createCanvas(image.width, image.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            const buffer = canvas.toBuffer('image/png');
            imageCache[cacheKey] = buffer;
            buffers['thumbnail.png'] = buffer;
          }
        }
      } catch (e) {
        console.warn('Failed to load poster image for pass', e);
      }

      // Load logo image from local filesystem
      try {
        const cacheKey = 'logo';
        if (imageCache[cacheKey]) {
          buffers['logo.png'] = imageCache[cacheKey];
        } else {
          const logoPath = path.join(__dirname, 'public', 'imgs', 'logo.png');
          if (fs.existsSync(logoPath)) {
            const buffer = fs.readFileSync(logoPath);
            imageCache[cacheKey] = buffer;
            buffers['logo.png'] = buffer;
          }
        }
      } catch (e) {
        console.warn('Failed to load logo image for pass', e);
      }

      // Create a new pass
      const certificates = {
        wwdr: Buffer.from(wwdr, 'utf-8'),
        signerCert: Buffer.from(signerCert, 'utf-8'),
        signerKey: Buffer.from(signerKey, 'utf-8'),
        ...(passphrase ? { signerKeyPassphrase: passphrase } : {}),
      };

      const pass = new PKPass(
        buffers,
        certificates,
        {
          formatVersion: 1,
          passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID || 'pass.com.example.concert',
          teamIdentifier: process.env.APPLE_TEAM_ID || 'TEAMID123',
          organizationName: 'Chromosome Entertainment',
          serialNumber: concert.id + '-' + Date.now(),
          description: `张艺兴 大航海 · ${concert.tourName} 巡回演唱会 - ${concert.city}`,
          backgroundColor: 'rgb(124, 58, 237)',
          foregroundColor: 'rgb(255, 255, 255)',
          labelColor: 'rgb(237, 233, 254)',
          logoText: `Grandline ${concert.season} · ${concert.tourName}`,
        }
      );

      pass.type = 'eventTicket';

      // Event Ticket specific fields
      pass.primaryFields.push({
        key: 'event',
        label: '巡演主题',
        value: concert.tourName || '闹天宫'
      });

      pass.secondaryFields.push({
        key: 'location',
        label: '演出场馆',
        value: location || concert.venue
      });

      pass.auxiliaryFields.push({
        key: 'date',
        label: '演出日期',
        value: concert.date
      });

      pass.auxiliaryFields.push({
        key: 'time',
        label: '开演时间',
        value: concert.time
      });

      pass.secondaryFields.push({
        key: 'area',
        label: '观演区域',
        value: area || '内场'
      });

      pass.secondaryFields.push({
        key: 'seat',
        label: '座位号',
        value: seat || '随机'
      });

      if (userName) {
        pass.secondaryFields.push({
          key: 'holder',
          label: '持票人',
          value: userName
        });
      }

      // Header fields (visible when folded)
      pass.headerFields.push({
        key: 'header-date',
        label: '演出日期',
        value: `${concert.date.replace(/-/g, '/')} ${concert.time}`
      });

      pass.headerFields.push({
        key: 'header-location',
        label: '城市',
        value: concert.city
      });

      pass.backFields.push({
        key: 'price',
        label: '票价档位',
        value: `¥${price}`
      });

      pass.backFields.push({
        key: 'notice',
        label: '入场须知',
        value: '请凭此电子票根及有效身份证件入场。本票根仅供纪念，非官方唯一入场凭证。'
      });

      // Barcode removed as requested
      // pass.setBarcodes({ ... });

      // Generate the buffer
      const buffer = pass.getAsBuffer();

      res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
      res.setHeader('Content-Disposition', `attachment; filename="lay_zhang_${concert.city}.pkpass"`);
      res.send(buffer);

    } catch (error: any) {
      console.error('Error generating pass:', error);
      res.status(500).json({ 
        error: 'Internal Server Error', 
        message: error.message || 'An unexpected error occurred during pass generation.'
      });
    }
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
