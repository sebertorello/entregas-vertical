// ===== utilidades básicas =====
const $ = (sel) => document.querySelector(sel);
const yy = () => new Date().getFullYear();

const slugify = (str) =>
  str.toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const fileToDataURL = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

// ===== estado de recortes =====
let portadaPos = { x: 50, y: 50 };
let previewsPos = [];

// ===== constructor de la landing final (HTML) =====
const buildLandingHTML = ({ cliente, slug, linkPhotos, portada64, previews64 }) => {
  const title = `Entrega – ${cliente} | Vertical Producciones`;
  const ogImage = portada64 || "";

  const previewsHtml = (previews64 || [])
    .map((src, i) => {
      const pos = previewsPos?.[i] || { x: 50, y: 50 };
      return `<img src="${src}" alt="Preview" style="object-fit:cover;object-position:${pos.x}% ${pos.y}%">`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="Tus fotos están listas.">
  <meta property="og:title" content="${title}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:url" content="https://verticalproducciones.com.ar/entregas/${slug}" />
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap" rel="stylesheet">

  <!-- Favicon/brand para la landing (rutas relativas desde /entregas/slug.html) -->
  <link rel="icon" type="image/svg+xml" href="../img/logo.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="../img/favicon-32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="../img/favicon-16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="../img/apple-touch-icon.png">

  <style>
    :root{--dark:#333333;--light:#F1F1F1;--accent:#FFFF00}
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:var(--light);color:var(--dark);font-family:'Montserrat',sans-serif}
    a{color:inherit}
    .wrap{max-width:1024px;margin:auto;padding:24px}

    header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
    .brand{display:flex;align-items:center;gap:12px}
    .logoSquare{height:72px;width:auto;display:block;border-radius:12px}
    .brandBlock{display:grid;row-gap:6px;align-items:center;margin-left:-6px}
    .wordmark{height:44px;width:auto;display:block}

    .card{background:#fff;border-radius:20px;box-shadow:0 10px 30px rgba(0,0,0,.08);padding:20px}
    .hero{position:relative;border-radius:20px;overflow:hidden;margin-bottom:20px;background:#000}
    .hero img{width:100%;height:52svh;object-fit:cover;object-position:${portadaPos.x}% ${portadaPos.y}%;filter:brightness(.85)}

    .title{font-size:1.6rem;font-weight:900;margin-bottom:8px}
    .subtitle{font-weight:700;opacity:.8;margin-bottom:14px}
    .cta{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:12px}
    .btn{padding:14px 18px;border:none;border-radius:14px;font-weight:800;cursor:pointer;text-decoration:none}
    .btn-primary{background:var(--accent);color:var(--dark);box-shadow:0 10px 24px rgba(255,255,0,.25)}

    .previews{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
    .previews img{width:100%;aspect-ratio:1/1;border-radius:12px}
    @media(max-width:1024px){.previews{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:620px){ .previews{grid-template-columns:1fr} }

    footer{margin-top:20px;font-size:.85rem;display:flex;justify-content:space-between;align-items:center;color:#555}
    .social{display:flex;gap:16px;align-items:center}
    .ico{display:inline-flex;gap:8px;align-items:center;text-decoration:none;color:inherit}
    .ico img{width:22px;height:22px;object-fit:contain;display:block}
    .ico span{font-weight:600}

    @media(max-width:720px){
      .hero img{height:46svh}
      .wordmark{height:38px}
      .logoSquare{height:60px}
    }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <div class="brand">
        <img class="logoSquare" src="../img/logo.svg" alt="Logo Vertical">
        <div class="brandBlock">
          <img class="wordmark" src="../img/verticalproducciones.svg" alt="Vertical Producciones">
          <small>Entrega de fotos</small>
        </div>
      </div>
      <div><small>Río Cuarto, Córdoba</small></div>
    </header>

    <section class="hero">
      ${portada64 ? `<img src="${portada64}" alt="Portada">` : ""}
    </section>

    <div class="card">
      <h2 class="title">¡Tus fotos están listas, ${cliente}!</h2>
      <p class="subtitle">Gracias por confiar en nosotros. Preparé esta página para que tengas tu entrega de forma elegante y simple.</p>

      <div class="cta">
        <a class="btn btn-primary" href="${linkPhotos}" target="_blank" rel="noopener">
          Descargar galería (Google Photos)
        </a>
      </div>

      <div class="previews">
        ${previewsHtml}
      </div>
    </div>

    <footer>
      <div class="social">
        <a class="ico" href="https://www.instagram.com/verticalproducciones" target="_blank" aria-label="Instagram">
          <img src="../img/insta.png" alt="" />
          <span>Instagram</span>
        </a>
        <a class="ico" href="https://wa.me/543584235933" target="_blank" aria-label="WhatsApp">
          <img src="../img/wpp.png" alt="" />
          <span>WhatsApp</span>
        </a>
      </div>
      <span>© ${yy()} Vertical Producciones</span>
    </footer>
  </div>
</body>
</html>`;
};

// ===== llamada al endpoint de publicación en Vercel =====
async function publicarLanding(slug, htmlFinal) {
  // 👉 Cambiá el dominio si tu proyecto Vercel tiene otro:
  const ENDPOINT = 'https://entregas-vertical.vercel.app/api/publish';

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug, html: htmlFinal })
  });

  let data = {};
  try { data = await res.json(); } catch (_) {}

  if (!res.ok) {
    const msg = data.error || data.detail || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  // data.url -> https://entregas.verticalproducciones.com.ar/<slug>
  return data.url;
}

// ===== app =====
window.addEventListener("DOMContentLoaded", () => {
  $("#y").textContent = yy();

  const miniHero = $("#miniHero");
  const miniGrid = $("#miniGrid");
  const portadaX = $("#portadaX");
  const portadaY = $("#portadaY");
  const submitBtn = $('#form button[type="submit"]');

  $("#portada").addEventListener("change", async (e) => {
    const f = e.target.files?.[0];
    if (!f) { miniHero.textContent = "Sin portada"; return; }
    const src = await fileToDataURL(f);
    miniHero.innerHTML = `<img id="miniHeroImg" src="${src}" alt="Portada"
      style="object-fit:cover;object-position:${portadaPos.x}% ${portadaPos.y}%">`;
  });

  miniHero.addEventListener("click", (e) => {
    const img = $("#miniHeroImg"); if (!img) return;
    const rect = img.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    portadaPos = { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
    img.style.objectPosition = `${portadaPos.x}% ${portadaPos.y}%`;
    portadaX.value = Math.round(portadaPos.x);
    portadaY.value = Math.round(portadaPos.y);
  });

  portadaX.addEventListener("input", () => {
    const img = $("#miniHeroImg"); if (!img) return;
    portadaPos.x = Number(portadaX.value);
    img.style.objectPosition = `${portadaPos.x}% ${portadaPos.y}%`;
  });
  portadaY.addEventListener("input", () => {
    const img = $("#miniHeroImg"); if (!img) return;
    portadaPos.y = Number(portadaY.value);
    img.style.objectPosition = `${portadaPos.x}% ${portadaPos.y}%`;
  });

  $("#previews").addEventListener("change", async (e) => {
    miniGrid.innerHTML = "";
    const files = Array.from(e.target.files || []).slice(0, 6);
    previewsPos = [];
    for (let i = 0; i < files.length; i++) {
      const src = await fileToDataURL(files[i]);
      const img = document.createElement("img");
      img.src = src;
      img.style.objectFit = "cover";
      img.style.objectPosition = "50% 50%";
      previewsPos[i] = { x: 50, y: 50 };
      img.addEventListener("click", (ev) => {
        const r = img.getBoundingClientRect();
        const x = ((ev.clientX - r.left) / r.width) * 100;
        const y = ((ev.clientY - r.top) / r.height) * 100;
        previewsPos[i] = { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
        img.style.objectPosition = `${previewsPos[i].x}% ${previewsPos[i].y}%`;
      });
      miniGrid.appendChild(img);
    }
  });

  $("#limpiar").addEventListener("click", () => {
    $("#form").reset();
    miniHero.textContent = "Sin portada";
    miniGrid.innerHTML = "";
    portadaPos = { x: 50, y: 50 };
    previewsPos = [];
    portadaX.value = 50; portadaY.value = 50;
  });

  $("#form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const cliente    = $("#cliente").value.trim();
    const linkPhotos = $("#linkPhotos").value.trim();
    const slugInput  = $("#slug").value.trim();
    const slug       = slugInput || slugify(cliente);

    if (!cliente || !linkPhotos) {
      alert("Completá Cliente y Link de Google Photos.");
      return;
    }

    // armo imágenes
    const portadaFile = $("#portada").files?.[0];
    const portada64 = portadaFile ? await fileToDataURL(portadaFile) : "";

    const previewFiles = Array.from($("#previews").files || []).slice(0, 6);
    const previews64 = [];
    for (const f of previewFiles) previews64.push(await fileToDataURL(f));

    // compilo HTML final
    const html = buildLandingHTML({ cliente, slug, linkPhotos, portada64, previews64 });

    // descarga local (backup)
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${slug}.html`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);
    a.remove();

    // publicación automática a Vercel -> GitHub Pages
    try {
      submitBtn.disabled = true;
      const txtOrig = submitBtn.textContent;
      submitBtn.textContent = "Publicando...";
      const urlPublica = await publicarLanding(slug, html);
      submitBtn.textContent = txtOrig;
      submitBtn.disabled = false;

      alert(`✅ Listo: ${urlPublica}`);
      window.open(urlPublica, "_blank");
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Generar landing";
      console.error(err);
      alert(`⚠️ No se pudo publicar automáticamente.\nDescargaste el HTML y podés subirlo manualmente.\nDetalle: ${err.message}`);
    }
  });
});
