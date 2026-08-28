import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { generateSsrSeoHtml } from './src/server/ssrSeo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'cinejoy-ssr-seo-server',
      timestamp: new Date().toISOString(),
      environment: isProd ? 'production' : 'development'
    });
  });

  // SEO Diagnostic / Preview Endpoint for debugging crawler responses
  app.get('/api/seo/debug', async (req, res) => {
    try {
      const hostname = (req.headers['x-forwarded-host'] || req.headers.host || 'cinejoy.to') as string;
      const targetUrl = (req.query.url as string) || '/';
      const sampleHtml = '<html><head><title>Original</title></head><body></body></html>';
      const rendered = await generateSsrSeoHtml(sampleHtml, targetUrl, hostname);
      res.type('html').send(rendered);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  let vite: any = null;

  if (!isProd) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
  }

  // Handle all other routes with SSR SEO injection
  app.get('*', async (req, res, next) => {
    // Skip static assets or internal paths
    if (req.path.includes('.') && !req.path.endsWith('.html')) {
      return next();
    }

    try {
      const hostname = (req.headers['x-forwarded-host'] || req.headers.host || 'cinejoy.to') as string;
      const url = req.originalUrl || req.url;

      let template: string;
      if (!isProd && vite) {
        // Read index.html from project root and transform with Vite plugins
        const indexPath = path.resolve(process.cwd(), 'index.html');
        template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
      } else {
        // Read pre-built index.html from dist
        const indexPath = path.resolve(process.cwd(), 'dist', 'index.html');
        template = fs.readFileSync(indexPath, 'utf-8');
      }

      // Inject dynamic SSR SEO meta tags, title, OpenGraph, Twitter cards & Schema.org JSON-LD
      const finalHtml = await generateSsrSeoHtml(template, url, hostname);

      res.status(200)
        .set({
          'Content-Type': 'text/html; charset=utf-8',
          'X-Powered-By': 'Cinejoy SSR SEO Engine',
          'Cache-Control': isProd ? 'public, max-age=60, s-maxage=300' : 'no-cache',
        })
        .send(finalHtml);
    } catch (error: any) {
      if (!isProd && vite) {
        vite.ssrFixStacktrace(error);
      }
      console.error('[SSR Server Error]', error);
      res.status(500).end(error.stack || error.message);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Cinejoy SSR SEO Server] running on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[Server Startup Failure]', err);
  process.exit(1);
});
