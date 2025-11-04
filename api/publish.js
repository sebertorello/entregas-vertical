// api/publish.js

export const config = {
  api: {
    bodyParser: {
      // aceptá HTMLs con imágenes embebidas
      sizeLimit: '8mb',
    },
  },
};

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { slug, html } = req.body || {};
    if (!slug || !html) return res.status(400).json({ error: 'Missing slug or html' });

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER   = process.env.REPO_OWNER;   // e.g. "sebertorello"
    const REPO_NAME    = process.env.REPO_NAME;    // e.g. "entregas-vertical"

    if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
      return res.status(500).json({ error: 'Missing GitHub env vars' });
    }

    const path = `entregas/${slug}.html`;
    const apiBase = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodeURIComponent(path)}`;

    // ¿ya existe? (para obtener SHA y hacer update)
    let sha = undefined;
    {
      const r = await fetch(apiBase, {
        headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github+json' }
      });
      if (r.ok) {
        const j = await r.json();
        if (j && j.sha) sha = j.sha;
      }
    }

    const contentB64 = Buffer.from(html, 'utf8').toString('base64');

    const commitRes = await fetch(apiBase, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: sha ? `update landing ${slug}` : `create landing ${slug}`,
        content: contentB64,
        sha,
        branch: 'main'
      })
    });

    if (!commitRes.ok) {
      const err = await safeJson(commitRes);
      return res.status(commitRes.status).json({ error: err?.message || 'GitHub commit failed' });
    }

    // URL final en tu dominio
    const publicUrl = `https://entregas.verticalproducciones.com.ar/${encodeURIComponent(slug)}.html`;
    return res.status(200).json({ url: publicUrl });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Unexpected error' });
  }
}

async function safeJson(r) {
  try { return await r.json(); } catch { return null; }
}
