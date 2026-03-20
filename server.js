const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Parse form data for CSP config
app.use(express.urlencoded({ extended: false }));

// Serve static files (self-hosted images)
app.use('/static', express.static(path.join(__dirname, 'public')));

// Main page — accepts optional query params to control CSP
app.get('/', (req, res) => {
  // Default: allow self + only the two specific PNG URLs from rightsstatements.org
  const defaultImgSrc = "'self' https://rightsstatements.org/files/buttons/InC.dark-white-interior-blue-type.png https://rightsstatements.org/files/buttons/NoC-CR.dark-white-interior-blue-type.png";
  const imgSrc = req.query['img-src'] || defaultImgSrc;
  const reportOnly = req.query['report-only'] === 'true';

  // Set CSP header
  const headerName = reportOnly
    ? 'Content-Security-Policy-Report-Only'
    : 'Content-Security-Policy';

  res.setHeader(headerName, `default-src 'self'; img-src ${imgSrc}; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; font-src 'self';`);

  res.send(buildPage(imgSrc, reportOnly));
});

function buildPage(currentImgSrc, reportOnly) {
  const defaultImgSrc = "'self' https://rightsstatements.org/files/buttons/InC.dark-white-interior-blue-type.png https://rightsstatements.org/files/buttons/NoC-CR.dark-white-interior-blue-type.png";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CSP img-src Demo — Selectively Blocking Third-Party Images</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; color: #1a1a1a; background: #fff; padding: 24px; max-width: 1100px; margin: 0 auto; }
    h1 { color: #56002a; border-bottom: 3px solid #C30046; padding-bottom: 8px; margin-bottom: 16px; }
    h2 { color: #56002a; border-bottom: 2px solid #ffa316; padding-bottom: 6px; margin: 32px 0 12px; }
    h4 { color: #C30046; margin-bottom: 8px; }
    p { line-height: 1.6; margin-bottom: 12px; }

    .intro {
      background: #f1f1ef; border-left: 4px solid #ffa316; padding: 16px 20px; margin-bottom: 24px;
    }
    .intro p { margin-bottom: 8px; }
    .intro p:last-child { margin-bottom: 0; }

    .how-it-works { margin-bottom: 24px; }
    .how-it-works ol { padding-left: 24px; line-height: 1.8; }
    .how-it-works code { background: #f1f1ef; padding: 2px 6px; font-family: Consolas, 'Courier New', monospace; font-size: 13px; color: #56002a; }

    .active-policy {
      background: #f1f1ef; padding: 16px; border-left: 4px solid #56002a; margin-bottom: 24px;
    }
    .active-policy strong { color: #56002a; }
    .active-policy code { font-family: Consolas, 'Courier New', monospace; font-size: 13px; word-break: break-all; }
    .mode-badge { display: inline-block; padding: 2px 8px; font-size: 12px; border-radius: 3px; margin-left: 8px; }
    .mode-enforce { background: #C30046; color: #fff; }
    .mode-report { background: #ffa316; color: #1a1a1a; }

    .image-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .image-card {
      border: 1px solid #e4e3e0; padding: 12px; background: #fff;
    }
    .image-card h3 { color: #56002a; font-size: 14px; margin-bottom: 4px; }
    .image-card .source { font-size: 12px; color: #666; font-family: Consolas, 'Courier New', monospace; margin-bottom: 8px; word-break: break-all; }
    .image-card img {
      max-width: 100%; height: 120px; object-fit: contain; background: #f1f1ef; display: block;
    }
    .image-card .status { margin-top: 8px; font-size: 13px; font-weight: bold; }
    .status-loaded { color: green; }
    .status-blocked { color: #C30046; }
    .status-pending { color: #999; }

    .expect-badge {
      display: inline-block; padding: 2px 8px; font-size: 11px; border-radius: 3px; margin-left: 8px; font-weight: normal;
    }
    .expect-allowed { background: #e6f4ea; color: #137333; }
    .expect-blocked { background: #fce8e6; color: #c5221f; }

    .try-it {
      background: #f1f1ef; border-left: 4px solid #ffa316; padding: 16px 20px; margin-top: 32px;
    }
    .try-it label { font-weight: bold; display: block; margin-bottom: 4px; }
    .try-it input[type="text"] { width: 100%; max-width: 700px; padding: 8px; font-size: 14px; font-family: Consolas, monospace; border: 1px solid #e4e3e0; }
    .try-it .hint { font-size: 12px; color: #666; margin-top: 4px; }
    .try-it button { margin-top: 8px; padding: 8px 20px; background: #56002a; color: #ffbe16; border: none; cursor: pointer; font-size: 14px; }
    .try-it button:hover { background: #C30046; }
    .try-it .checkbox-row { margin-top: 8px; }
    .try-it .checkbox-row label { display: inline; font-weight: normal; }

    .presets { margin-top: 12px; }
    .presets button { margin-right: 6px; margin-bottom: 4px; padding: 4px 10px; font-size: 12px; background: #fff; border: 1px solid #56002a; color: #56002a; cursor: pointer; }
    .presets button:hover { background: #56002a; color: #ffbe16; }
  </style>
</head>
<body>

  <h1>CSP Demo: Selectively Blocking Third-Party Images</h1>

  <div class="intro">
    <p><strong>What is this?</strong> A proof-of-concept showing how <strong>Content Security Policy (CSP)</strong> can selectively control which images from <em>rightsstatements.org</em> are allowed to load on our pages.</p>
    <p>The default policy allows our own images plus <strong>only the two PNG</strong> versions of the rights statement buttons. The SVG versions from the same site are <strong>blocked</strong> because they are not explicitly listed in the policy.</p>
  </div>

  <div class="how-it-works">
    <h4>How it works</h4>
    <ol>
      <li>The server sends a <code>Content-Security-Policy</code> HTTP header with every page response.</li>
      <li>The <code>img-src</code> directive in that header lists exactly which image sources the browser is allowed to load.</li>
      <li>The browser silently blocks any image whose URL is not covered by the policy — no code changes needed on the page itself.</li>
    </ol>
  </div>

  <div class="active-policy">
    <strong>Active policy (img-src):</strong>
    <span class="mode-badge ${reportOnly ? 'mode-report' : 'mode-enforce'}">${reportOnly ? 'Report-Only' : 'Enforcing'}</span><br><br>
    <code>${escapeHtml(currentImgSrc)}</code>
  </div>

  <h2>Images from rightsstatements.org</h2>
  <p>All four images below come from the same domain. The badge on each card shows whether the active policy allows or blocks that specific URL.</p>
  <div class="image-grid">
    ${imageCard('InC (PNG)', 'https://rightsstatements.org/files/buttons/InC.dark-white-interior-blue-type.png', currentImgSrc)}
    ${imageCard('InC (SVG)', 'https://rightsstatements.org/files/buttons/InC.dark-white-interior-blue-type.svg', currentImgSrc)}
    ${imageCard('NoC-CR (PNG)', 'https://rightsstatements.org/files/buttons/NoC-CR.dark-white-interior-blue-type.png', currentImgSrc)}
    ${imageCard('NoC-CR (SVG)', 'https://rightsstatements.org/files/buttons/NoC-CR.dark-white-interior-blue-type.svg', currentImgSrc)}
  </div>

  <h2>Self-Hosted Images</h2>
  <p>These are served from our own origin and are always allowed by the <code>'self'</code> keyword in the policy.</p>
  <div class="image-grid">
    ${imageCard('Local SVG #1', '/static/images/local-sample.svg', currentImgSrc)}
    ${imageCard('Local SVG #2', '/static/images/local-sample-2.svg', currentImgSrc)}
  </div>

  <h2>Try It Yourself</h2>
  <div class="try-it">
    <p>Change the <code>img-src</code> value below and click <strong>Apply</strong> to see how different policies affect which images load.</p>
    <form method="GET" action="/">
      <label for="img-src">img-src value:</label>
      <input type="text" id="img-src" name="img-src" value="${escapeHtml(currentImgSrc)}" />
      <div class="hint">Space-separated values. Use the preset buttons below for quick examples.</div>

      <div class="checkbox-row">
        <input type="checkbox" id="report-only" name="report-only" value="true" ${reportOnly ? 'checked' : ''} />
        <label for="report-only">Report-Only mode (log violations to console instead of blocking)</label>
      </div>

      <button type="submit">Apply</button>
    </form>

    <div class="presets">
      <strong>Presets:</strong>
      <button onclick="setPreset('\\'self\\' https://rightsstatements.org/files/buttons/InC.dark-white-interior-blue-type.png https://rightsstatements.org/files/buttons/NoC-CR.dark-white-interior-blue-type.png')">Default (Self + PNGs only)</button>
      <button onclick="setPreset('\\'self\\' https://rightsstatements.org')">Allow entire domain</button>
      <button onclick="setPreset('*')">Allow all images</button>
      <button onclick="setPreset('\\'self\\'')">Self only (block all third-party)</button>
      <button onclick="setPreset('\\'none\\'')">Block everything</button>
    </div>
  </div>

  <script>
    document.querySelectorAll('.image-card img').forEach(img => {
      const statusEl = img.parentElement.querySelector('.status');
      img.addEventListener('load', () => {
        statusEl.textContent = 'Loaded';
        statusEl.className = 'status status-loaded';
      });
      img.addEventListener('error', () => {
        statusEl.textContent = 'Blocked / Failed';
        statusEl.className = 'status status-blocked';
      });
    });

    function setPreset(value) {
      document.getElementById('img-src').value = value;
    }
  </script>

</body>
</html>`;
}

function isAllowedByPolicy(imgSrc, policySrc) {
  const tokens = policySrc.split(/\s+/);
  for (const token of tokens) {
    if (token === '*') return true;
    if (token === "'none'") return false;
    // 'self' allows same-origin (paths starting with /)
    if (token === "'self'" && imgSrc.startsWith('/')) return true;
    // Exact URL match
    if (imgSrc === token) return true;
    // Origin match: token is an origin like https://example.com and img starts with it
    if (!token.startsWith("'") && imgSrc.startsWith(token + '/')) return true;
    if (!token.startsWith("'") && imgSrc.startsWith(token) && imgSrc === token) return true;
  }
  return false;
}

function imageCard(title, src, imgSrcPolicy) {
  const allowed = isAllowedByPolicy(src, imgSrcPolicy);
  const badgeClass = allowed ? 'expect-allowed' : 'expect-blocked';
  const badgeText = allowed ? 'Allowed by policy' : 'Not in policy — will be blocked';
  return `
    <div class="image-card">
      <h3>${title} <span class="expect-badge ${badgeClass}">${badgeText}</span></h3>
      <div class="source">${escapeHtml(src.length > 100 ? src.substring(0, 100) + '...' : src)}</div>
      <img src="${escapeHtml(src)}" alt="${escapeHtml(title)}" />
      <div class="status status-pending">Loading...</div>
    </div>`;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

app.listen(PORT, () => {
  console.log(`CSP img-src test bed running at http://localhost:${PORT}`);
  console.log('Open your browser DevTools console to see CSP violation reports.');
});
