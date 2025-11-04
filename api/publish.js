// Crea/actualiza entregas/<slug>/index.html en tu repo usando la API de GitHub.
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    return res.status(204).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { slug, html } = await req.json();
    if (!slug || !html) return res.status(400).json({ error: 'slug y html son requeridos' });

    const owner = process.env.REPO_OWNER;     // p.ej. "sebertorello"
    const repo  = process.env.REPO_NAME;      // p.ej. "entregas-vertical"
    const token = process.env.GITHUB_TOKEN;   // tu token (secreto en Vercel)
    const path  = `entregas/${slug}/index.html`;

    // ¿Existe ya? -> obtener sha para update
    let sha = null;
    const getResp = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
      { headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'vertical-publisher' } }
    );
    if (getResp.ok) {
      const data = await getResp.json();
      sha = data.sha;
    }

    // Crear/actualizar archivo
    const putResp = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'vertical-publisher'
        },
        body: JSON.stringify({
          message: `publish: entrega ${slug}`,
          content: Buffer.from(html, 'utf8').toString('base64'),
          sha,
          committer: { name: 'Vertical Bot', email: 'bot@vertical.com' },
          author:    { name: 'Vertical Bot', email: 'bot@vertical.com' }
        })
      }
    );

    if (!putResp.ok) {
      const err = await putResp.text();
      return res.status(500).json({ error: 'GitHub error', detail: err });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ ok: true, url: `https://entregas.verticalproducciones.com.ar/${slug}/` });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
