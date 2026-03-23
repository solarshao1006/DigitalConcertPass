import express from 'express';
import fs from 'fs';
import { PKPass } from 'passkit-generator';
import path from 'path';
import { fileURLToPath } from 'url';

type PassConcert = {
  id: string;
  city: string;
  date: string;
  time: string;
  venue: string;
  tourName: string;
  season: number;
  type?: 'concert' | 'drama';
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imageCache: Record<string, Buffer> = {};

function isDramaConcert(concert: PassConcert): boolean {
  return concert.type === 'drama';
}

function normalizePEM(pem?: string): string {
  if (!pem) return '';

  let trimmed = pem.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.substring(1, trimmed.length - 1);
  }

  if (!trimmed.startsWith('-----') && /^[A-Za-z0-9+/=\s]+$/.test(trimmed)) {
    try {
      const decoded = Buffer.from(trimmed, 'base64').toString('utf-8');
      if (decoded.includes('-----BEGIN')) {
        trimmed = decoded;
      }
    } catch {
      // Keep original text if it was not base64.
    }
  }

  let result = trimmed.replace(/\\n/g, '\n');

  if (result.includes('-----BEGIN') && !result.includes('\n')) {
    result = result
      .replace(/-----BEGIN ([A-Z ]+)-----/, '-----BEGIN $1-----\n')
      .replace(/-----END ([A-Z ]+)-----/, '\n-----END $1-----')
      .replace(/([^-])(-----END)/, '$1\n$2');
  }

  return result;
}

function safePassFilename(city?: string): string {
  const normalizedCity = (city || 'concert')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return `lay_zhang_${normalizedCity || 'concert'}.pkpass`;
}

function getCurrencyForConcert(concert: Pick<PassConcert, 'city'>): string {
  if (concert.city === '吉隆坡') return 'RM';
  if (concert.city === '雅加达') return 'Rp';
  if (concert.city === '横滨') return '円';
  if (concert.city === '首尔') return '₩';
  return '¥';
}

function getFrontAreaText(area?: string): string {
  const normalized = (area || '').trim().replace(/\s+/g, ' ');
  if (!normalized) {
    return '内场';
  }

  const directPatterns = [/[A-Za-z0-9]+\s*区/u, /VIP/u, /内场/u, /看台/u, /GA/u];

  for (const pattern of directPatterns) {
    const match = normalized.match(pattern);
    if (match?.[0]) {
      return match[0].replace(/\s+/g, '');
    }
  }

  const compact = normalized.replace(/\s+/g, '');
  if (compact.length <= 6) {
    return compact;
  }

  return `${compact.slice(0, 6)}…`;
}

function getPassAssetBuffer(cacheKey: string, candidates: string[]): Buffer | undefined {
  if (imageCache[cacheKey]) {
    return imageCache[cacheKey];
  }

  const assetPath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!assetPath) {
    return undefined;
  }

  const buffer = fs.readFileSync(assetPath);
  imageCache[cacheKey] = buffer;
  return buffer;
}

function getPassBackgroundCandidates(concert: PassConcert): string[] {
  if (isDramaConcert(concert)) {
    return [
      path.join(__dirname, 'public', 'imgs', 'pass', 'background_dunhuang.png'),
      path.join(__dirname, 'public', 'imgs', 'pass', 'backgroud_dunhuang.png'),
      path.join(__dirname, 'imgs', 'pass', 'background_dunhuang.png'),
      path.join(__dirname, 'imgs', 'pass', 'backgroud_dunhuang.png'),
    ];
  }

  const season = concert.season || 5;
  return [
    path.join(__dirname, 'public', 'imgs', 'pass', `grandline${season}_bg.png`),
    path.join(__dirname, 'imgs', 'pass', `grandline${season}_bg.png`),
  ];
}

function getPassPosterCandidates(concert: PassConcert): string[] {
  if (isDramaConcert(concert)) {
    return [
      path.join(__dirname, 'public', 'imgs', 'pass', 'dunhuang', 'poster.png'),
      path.join(__dirname, 'imgs', 'pass', 'dunhuang', 'poster.png'),
    ];
  }

  const cityMap: Record<string, string> = {
    北京: 'beijing',
    成都: 'chengdu',
    海口: 'haikou',
    上海: 'shanghai',
    宁波: 'ningbo',
    南京: 'nanjing',
    深圳: 'shenzhen',
    广州: 'guangzhou',
    西安: 'xian',
    横滨: 'yokohama',
    雅加达: 'jakarta',
    首尔: 'seoul',
    吉隆坡: 'kualalumpur',
    厦门: 'xiamen',
    郑州: 'zhengzhou',
    兰州: 'lanzhou',
  };

  const season = concert.season || 5;
  const pinyin = cityMap[concert.city] || 'beijing';
  let posterFileName = `${pinyin}${season}.jpg`;

  if (season === 5 && concert.city === '北京' && concert.venue.includes('鸟巢')) {
    if (concert.date === '2025-10-06') posterFileName = 'beijing5_niaochao_day1.jpg';
    else if (concert.date === '2025-10-07') posterFileName = 'beijing5_niaochao_day2.jpg';
    else posterFileName = 'beijing5.jpg';
  }

  const posterStem = posterFileName.replace(/\.jpg$/i, '');
  return [
    path.join(__dirname, 'public', 'imgs', 'pass', `grandline${season}`, `${posterStem}.png`),
    path.join(__dirname, 'imgs', 'pass', `grandline${season}`, `${posterStem}.png`),
  ];
}

function getPassHeaderTitle(concert: PassConcert): string {
  if (isDramaConcert(concert)) {
    return 'Dunhuang · Drama';
  }

  if (concert.season === 4) {
    return 'Grandline4 · Step';
  }

  if (concert.season === 5) {
    return 'Grandline5 · 闹天宫';
  }

  return `Grandline${concert.season} · ${concert.tourName}`;
}

function getPassDescription(concert: PassConcert): string {
  if (isDramaConcert(concert)) {
    return `话剧《${concert.tourName}》 - ${concert.city}`;
  }

  return `张艺兴大航海${concert.season} · ${concert.tourName} - ${concert.city}`;
}

function getFullEventTitle(concert: PassConcert): string {
  const year = concert.date?.slice(0, 4) || '2025';

  if (isDramaConcert(concert)) {
    return `${year} 话剧《${concert.tourName}》 ${concert.city}场`;
  }

  return `${year} 张艺兴 [大航海${concert.season}·${concert.tourName || '闹天宫'}]巡回演唱会 ${concert.city}站`;
}

function getShortEventTitle(concert: PassConcert): string {
  if (isDramaConcert(concert)) {
    return `话剧《${concert.tourName}》 ${concert.city}场`;
  }

  return `大航海${concert.season}·${concert.tourName || '闹天宫'} ${concert.city}站`;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  app.post('/api/generate-pass', async (req, res) => {
    try {
      const { concert, userName, price, area, seat } = req.body as {
        concert: PassConcert;
        userName?: string;
        price?: string;
        area?: string;
        seat?: string;
      };

      const wwdr = normalizePEM(process.env.APPLE_WWDR_CERT);
      const signerCert = normalizePEM(process.env.APPLE_SIGNER_CERT);
      const signerKey = normalizePEM(process.env.APPLE_SIGNER_KEY);
      const passphrase = process.env.APPLE_SIGNER_KEY_PASSPHRASE?.trim() || undefined;

      const hasCerts =
        wwdr.includes('-----BEGIN') &&
        signerCert.includes('-----BEGIN') &&
        signerKey.includes('-----BEGIN');

      if (!hasCerts) {
        const missing: string[] = [];
        if (!wwdr.includes('-----BEGIN')) missing.push('APPLE_WWDR_CERT');
        if (!signerCert.includes('-----BEGIN')) missing.push('APPLE_SIGNER_CERT');
        if (!signerKey.includes('-----BEGIN')) missing.push('APPLE_SIGNER_KEY');

        return res.status(400).json({
          error: 'Missing or Invalid Certificates',
          message: `Apple Wallet passes (.pkpass) must be signed. Missing or invalid values: ${missing.join(', ')}.`,
        });
      }

      const buffers: Record<string, Buffer> = {};

      try {
        const backgroundKey = isDramaConcert(concert)
          ? 'bg-dunhuang'
          : `bg-${concert.season || 5}`;
        const backgroundBuffer = getPassAssetBuffer(backgroundKey, getPassBackgroundCandidates(concert));
        if (backgroundBuffer) {
          buffers['background.png'] = backgroundBuffer;
        }
      } catch (error) {
        console.warn('Failed to load background image for pass', error);
      }

      try {
        const posterKey = isDramaConcert(concert)
          ? 'poster-dunhuang'
          : `poster-${concert.season || 5}-${concert.city}-${concert.date}`;
        const posterBuffer = getPassAssetBuffer(posterKey, getPassPosterCandidates(concert));
        if (posterBuffer) {
          buffers['thumbnail.png'] = posterBuffer;
        }
      } catch (error) {
        console.warn('Failed to load poster image for pass', error);
      }

      try {
        const logoBuffer = getPassAssetBuffer('logo', [
          path.join(__dirname, 'public', 'imgs', 'logo.png'),
          path.join(__dirname, 'imgs', 'logo.png'),
          path.join(__dirname, 'public', 'imgs', 'icon.png'),
          path.join(__dirname, 'imgs', 'icon.png'),
        ]);

        if (logoBuffer) {
          buffers['logo.png'] = logoBuffer;
        }
      } catch (error) {
        console.warn('Failed to load logo image for pass', error);
      }

      try {
        const icon1x = getPassAssetBuffer('icon-1x', [
          path.join(__dirname, 'public', 'imgs', 'pass', 'icon.png'),
          path.join(__dirname, 'imgs', 'pass', 'icon.png'),
        ]);
        const icon2x = getPassAssetBuffer('icon-2x', [
          path.join(__dirname, 'public', 'imgs', 'pass', 'icon@2x.png'),
          path.join(__dirname, 'imgs', 'pass', 'icon@2x.png'),
        ]);
        const icon3x = getPassAssetBuffer('icon-3x', [
          path.join(__dirname, 'public', 'imgs', 'pass', 'icon@3x.png'),
          path.join(__dirname, 'imgs', 'pass', 'icon@3x.png'),
        ]);

        if (icon1x) buffers['icon.png'] = icon1x;
        if (icon2x) buffers['icon@2x.png'] = icon2x;
        if (icon3x) buffers['icon@3x.png'] = icon3x;
      } catch (error) {
        console.warn('Failed to load icon images for pass', error);
      }

      const certificates = {
        wwdr: Buffer.from(wwdr, 'utf-8'),
        signerCert: Buffer.from(signerCert, 'utf-8'),
        signerKey: Buffer.from(signerKey, 'utf-8'),
        ...(passphrase ? { signerKeyPassphrase: passphrase } : {}),
      };

      const pass = new PKPass(buffers, certificates, {
        formatVersion: 1,
        passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID || 'pass.com.example.concert',
        teamIdentifier: process.env.APPLE_TEAM_ID || 'TEAMID123',
        organizationName: 'Chromosome Entertainment',
        serialNumber: `${concert.id}-${Date.now()}`,
        description: getPassDescription(concert),
        backgroundColor: 'rgb(236, 228, 248)',
        foregroundColor: 'rgb(255, 255, 255)',
        labelColor: 'rgb(255, 255, 255)',
        logoText: getPassHeaderTitle(concert),
      });

      pass.type = 'eventTicket';

      pass.primaryFields.push({
        key: 'event',
        label: isDramaConcert(concert) ? '剧目' : '巡演',
        value: getShortEventTitle(concert),
      });

      pass.secondaryFields.push({
        key: 'area',
        label: '区域',
        value: getFrontAreaText(area),
      });

      pass.secondaryFields.push({
        key: 'seat',
        label: '座位',
        value: seat || '随机',
      });

      pass.secondaryFields.push({
        key: 'location',
        label: '场馆',
        value: concert.venue,
      });

      pass.auxiliaryFields.push({
        key: 'price',
        label: '票档',
        value: `${getCurrencyForConcert(concert)}${price || ''}`,
      });

      if (userName) {
        pass.auxiliaryFields.push({
          key: 'holder',
          label: '持票',
          value: userName,
        });
      }

      pass.headerFields.push({
        key: 'header-date',
        label: '时间',
        value: `${concert.date.replace(/-/g, '/')} ${concert.time}`,
      });

      pass.headerFields.push({
        key: 'header-location',
        label: '城市',
        value: concert.city,
      });

      pass.backFields.push({
        key: 'event-title',
        label: isDramaConcert(concert) ? '剧目' : '巡演',
        value: getFullEventTitle(concert),
      });

      pass.backFields.push({
        key: 'area-full',
        label: '区域',
        value: area || '内场',
      });

      pass.backFields.push({
        key: 'time-full',
        label: '时间',
        value: `${concert.date.replace(/-/g, '/')} ${concert.time}`,
      });

      pass.backFields.push({
        key: 'notice',
        label: '须知',
        value: '请凭此电子票根及有效身份证件入场。本票根仅供纪念，非官方唯一入场凭证。',
      });

      const buffer = pass.getAsBuffer();

      res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
      res.setHeader('Content-Disposition', `attachment; filename="${safePassFilename(concert.city)}"`);
      res.send(buffer);
    } catch (error: any) {
      console.error('Error generating pass:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'An unexpected error occurred during pass generation.',
      });
    }
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
