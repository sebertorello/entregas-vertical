/************************************************************
 * Generador de Landing de Entregas – Vertical Producciones
 * Con compresión/redimensión de imágenes y paths corregidos
 * a /entregas/<slug>.html para GitHub Pages.
 ************************************************************/

// ===== Utilidades básicas =====
const $ = (sel) => document.querySelector(sel);
const yy = () => new Date().getFullYear();

// Slug seguro a partir del nombre de cliente (quita acentos/espacios)
const slugify = (str) =>
  str.toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

// === Redimensionar & comprimir a DataURL (JPEG) ===
async function fileToDataURLResized(file, { maxSide = 1920, quality = 0.82, forceJPEG = true } = {}) {
  const origDataURL = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

  const img = new Image();
  img.decoding = "async";
  img.loading = "eager";

  const loadPromise = new Promise((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
  });
  img.src = origDataURL;

  try { await loadPromise; } catch { return origDataURL; }

  const { naturalWidth: w, naturalHeight: h } = img;
  const side = Math.max(w, h);

  let destW = w, destH = h;
  if (side > maxSide) {
    const scale = maxSide / side;
    destW = Math.round(w * scale);
    destH = Math.round(h * scale);
  } else if (!forceJPEG) {
    return origDataURL;
  }

  const canvas = document.createElement("canvas");
  canvas.width = destW; canvas.height = destH;
  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, destW, destH);
  ctx.drawImage(img, 0, 0, destW, destH);

  const out = canvas.toDataURL("image/jpeg", quality);
  return out || origDataURL;
}

// ===== Estado de recortes/foco =====
let portadaPos = { x: 50, y: 50 };
let previewsPos = [];

/****************************************************************
 * buildLandingHTML()
 * HTML completo de la landing (CSS inline, 2 cols en mobile).
 * IMPORTANTE: canonical y og:url en /entregas/<slug>.html
 ****************************************************************/
const buildLandingHTML = ({ cliente, slug, linkPhotos, portada64, previews64 }) => {
  const title = `Entrega – ${cliente} | Vertical Producciones`;
  const publicPath = `https://entregas.verticalproducciones.com.ar/entregas/${slug}.html`;
  const ogImage = `https://entregas.verticalproducciones.com.ar/img/share.jpg`;

  const previewsHtml = (previews64 || [])
    .map((src, i) => {
      const pos = previewsPos?.[i] || { x: 50, y: 50 };
      return `<img src="${src}" alt="Preview ${i + 1}" loading="lazy" style="object-fit:cover;object-position:${pos.x}% ${pos.y}%">`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<meta name="description" content="Tus fotos están listas.">
<link rel="canonical" href="${publicPath}" />

<meta property="og:title" content="${title}" />
<meta property="og:image" content="${ogImage}" />
<meta property="og:url" content="${publicPath}" />
<meta property="og:type" content="website" />

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap" rel="stylesheet">

<link rel="icon" type="image/svg+xml" href="/img/logo.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/img/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/img/favicon-16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/img/apple-touch-icon.png">

<style>
  :root{--dark:#333333;--light:#F1F1F1;--accent:#FFFF00}
  *{box-sizing:border-box;margin:0;padding:0}
  img{max-width:100%;height:auto;display:block}
  body{background:var(--light);color:var(--dark);font-family:'Montserrat',sans-serif}
  a{color:inherit;text-decoration:none}
  .wrap{max-width:1024px;margin:auto;padding:24px}

  header{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:16px;flex-wrap:wrap}
  .brand{display:flex;align-items:center;gap:10px;min-width:0}
  .logoSquare{height:64px;width:auto;border-radius:12px;flex:0 0 auto}
  .brandBlock{display:grid;row-gap:6px;align-items:center;min-width:0}
  .wordmark{height:42px;width:auto}
  header small{white-space:nowrap;opacity:.8}
  .loc small{opacity:.8}

  .card{background:#fff;border-radius:20px;box-shadow:0 10px 30px rgba(0,0,0,.08);padding:20px}
  .hero{position:relative;border-radius:20px;overflow:hidden;margin-bottom:20px;background:#000}
  .hero img{width:100%;height:48svh;object-fit:cover;object-position:${portadaPos.x}% ${portadaPos.y}%;filter:brightness(.85)}

  .title{font-weight:900;font-size:clamp(1.25rem,1.2rem + 1.2vw,1.8rem);margin-bottom:8px;line-height:1.15}
  .subtitle{font-weight:700;opacity:.85;margin-bottom:14px;line-height:1.35}
  .cta{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:14px}
  .btn{padding:12px 16px;border:none;border-radius:14px;font-weight:800;cursor:pointer;transition:.15s}
  .btn:hover{transform:translateY(-1px);box-shadow:0 10px 24px rgba(0,0,0,.1)}
  .btn-primary{background:var(--accent);color:#111;box-shadow:0 10px 24px rgba(255,255,0,.25)}

  .previews{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
  .previews img{width:100%;aspect-ratio:1/1;border-radius:12px;object-fit:cover;box-shadow:0 4px 10px rgba(0,0,0,.06)}

  footer{margin-top:20px;font-size:.95rem;display:flex;justify-content:space-between;align-items:center;gap:12px;color:#555;flex-wrap:wrap}
  .social{display:flex;gap:16px;align-items:center;flex-wrap:wrap}
  .ico{display:inline-flex;gap:8px;align-items:center;padding:4px 6px;border-radius:8px}
  .ico:hover{background:rgba(0,0,0,.05)}
  .ico img{width:20px;height:20px;object-fit:contain}
  .ico span{font-weight:600}

  @media (max-width:900px){
    header{flex-direction:column;align-items:flex-start;gap:6px}
    .loc{margin-top:2px}
    .hero img{height:42svh}
    .previews{grid-template-columns:repeat(2,1fr)}
    footer{flex-direction:column;align-items:flex-start;gap:10px}
    .social{gap:14px;row-gap:8px}
  }
  @media (max-width:420px){
    .wrap{padding:16px}
    .logoSquare{height:52px}
    .wordmark{height:34px}
    .title{font-size:clamp(1.1rem, 1rem + 3vw, 1.6rem)}
    .btn{padding:12px 14px}
    .previews{grid-template-columns:repeat(2,1fr)}
  }
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <div class="brand">
        <img class="logoSquare" src="/img/logo.svg" alt="Logo Vertical">
        <div class="brandBlock">
          <img class="wordmark" src="/img/verticalproducciones.svg" alt="Vertical Producciones">
          <small>Entrega de fotos</small>
        </div>
      </div>
      <div class="loc"><small>Río Cuarto, Córdoba</small></div>
    </header>

    <section class="hero">
      ${portada64 ? `<img src="${portada64}" alt="Portada">` : ""}
    </section>

    <div class="card">
      <h2 class="title">¡Tus fotos están listas, ${cliente}!</h2>
      <p class="subtitle">Gracias por confiar en nosotros. Preparé esta página para que tengas tu entrega de forma elegante y simple.</p>

      <div class="cta">
        <a class="btn btn-primary" href="${linkPhotos}" target="_blank" rel="noopener noreferrer">
          Descargar galería (Google Photos)
        </a>
      </div>

      <div class="previews">
        ${previewsHtml}
      </div>
    </div>

    <footer>
      <div class="social">
        <a class="ico" href="https://www.instagram.com/vertical.producciones" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <img src="/img/insta.png" alt="" />
          <span>@vertical.producciones</span>
        </a>
        <a class="ico" href="https://wa.me/543584235933" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
          <img src="/img/wpp.png" alt="" />
          <span>WhatsApp</span>
        </a>
      </div>
      <span>© ${yy()} Vertical Producciones</span>
    </footer>
  </div>
</body>
</html>`;
};

// ===== publicar a Vercel (que commitea al repo) =====
// Si querés evitar CORS: const ENDPOINT = '/api/publish';
async function publicarLanding(slug, htmlFinal) {
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
  return data.url; // la API puede devolver /slug.html (sin carpeta)
}

// ===== app =====
window.addEventListener("DOMContentLoaded", () => {
  $("#y").textContent = yy();

  const miniHero = $("#miniHero");
  const miniGrid = $("#miniGrid");
  const portadaX = $("#portadaX");
  const portadaY = $("#portadaY");
  const submitBtn = $('#form button[type="submit"]');

  // ----- Portada: cargar + compresión -----
  $("#portada").addEventListener("change", async (e) => {
    const f = e.target.files?.[0];
    if (!f) { miniHero.textContent = "Sin portada"; return; }
    const src = await fileToDataURLResized(f, { maxSide: 1920, quality: 0.82, forceJPEG: true });
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

  // ----- Previews: cargar (máx 6), compresión y foco -----
  $("#previews").addEventListener("change", async (e) => {
    miniGrid.innerHTML = "";
    const files = Array.from(e.target.files || []).slice(0, 6);
    previewsPos = [];

    for (let i = 0; i < files.length; i++) {
      const src = await fileToDataURLResized(files[i], { maxSide: 1200, quality: 0.8, forceJPEG: true });
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

  // ----- Limpiar -----
  $("#limpiar").addEventListener("click", () => {
    $("#form").reset();
    miniHero.textContent = "Sin portada";
    miniGrid.innerHTML = "";
    portadaPos = { x: 50, y: 50 };
    previewsPos = [];
    portadaX.value = 50; portadaY.value = 50;
  });

  // ----- Submit: compilar, descargar y publicar -----
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

  const portadaImgEl = $("#miniHeroImg");
  const portada64 = portadaImgEl ? portadaImgEl.src : "";
  const previews64 = Array.from(document.querySelectorAll("#miniGrid img")).map(i => i.src);

  // Compilar HTML final
  const html = buildLandingHTML({ cliente, slug, linkPhotos, portada64, previews64 });

  // Descarga local (backup)
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${slug}.html`;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(a.href);
  a.remove();

  // Publicación automática (opcional si la API está OK)
  try {
    const submitBtn = $('#form button[type="submit"]');
    submitBtn.disabled = true;
    const txtOrig = submitBtn.textContent;
    submitBtn.textContent = "Publicando...";

    try {
      await publicarLanding(slug, html); // hace el commit
    } catch (_) {
      console.warn("Publicación automática falló, pero seguimos con la URL local.");
    }

    submitBtn.textContent = txtOrig;
    submitBtn.disabled = false;

    // Construimos SIEMPRE la URL final correcta en /entregas/<slug>.html
    const finalUrl = new URL(`/entregas/${slug}.html`, location.origin).href;

    // === Modal con botón de copiar para WhatsApp ===
    const mensaje = `Muchas gracias por elegirnos 💛
Desde el siguiente link podrás ver y compartir tus fotos:

${finalUrl}`;

    const contenedorMsg = document.createElement("div");
    contenedorMsg.style.cssText = `
      position:fixed;inset:0;display:flex;align-items:center;justify-content:center;
      background:rgba(0,0,0,.5);z-index:9999;
    `;
    contenedorMsg.innerHTML = `
      <div style="background:white;padding:24px 28px;border-radius:16px;max-width:420px;text-align:center;font-family:Montserrat,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.2)">
        <h3 style="margin-bottom:12px;font-weight:900;color:#333">¡Landing creada con éxito!</h3>
        <p style="font-size:15px;line-height:1.5;margin-bottom:16px;">Muchas gracias por elegirnos 💛<br>Desde el siguiente link podrás compartir tus fotos:</p>
        <p style="word-break:break-all;font-weight:600;color:#333;margin-bottom:18px">${finalUrl}</p>
        <button id="copyMsg" style="background:#FFFF00;border:none;border-radius:10px;padding:10px 16px;font-weight:800;cursor:pointer;">📋 Copiar texto para WhatsApp</button>
        <br><br>
        <button id="cerrarMsg" style="background:#333;color:#fff;border:none;border-radius:10px;padding:8px 14px;font-weight:600;cursor:pointer;">Cerrar</button>
      </div>
    `;
    document.body.appendChild(contenedorMsg);

    // copiar al portapapeles
    $("#copyMsg").addEventListener("click", async () => {
      await navigator.clipboard.writeText(mensaje);
      alert("✅ Mensaje copiado. Pegalo en WhatsApp 📱");
    });

    // cerrar modal
    $("#cerrarMsg").addEventListener("click", () => contenedorMsg.remove());

    // abrir la landing en nueva pestaña
    window.open(finalUrl, "_blank");

  } catch (err) {
    const submitBtn = $('#form button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.textContent = "Generar landing";
    console.error(err);
    alert(`⚠️ No se pudo publicar automáticamente.\nDescargaste el HTML y podés subirlo manualmente.\nDetalle: ${err.message}`);
  }
}); // <-- cierra el listener de submit

}); // <-- cierra el DOMContentLoaded
