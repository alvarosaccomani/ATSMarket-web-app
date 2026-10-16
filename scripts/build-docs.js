const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'documentation');

const LANGUAGES = [
  { code: 'es', compodocLang: 'es-ES', label: '🇪🇸 Español', docsPath: 'docs/es' },
  { code: 'en', compodocLang: 'en-US', label: '🇺🇸 English', docsPath: 'docs/en' },
  { code: 'pt', compodocLang: 'pt-BR', label: '🇧🇷 Português', docsPath: 'docs/pt' }
];

/**
 * Ejecuta Compodoc para cada uno de los idiomas soportados.
 */
function buildCompodocForLanguage(lang) {
  const outputDir = path.join('documentation', lang.code);
  console.log(`\n========================================`);
  console.log(`[Compodoc] Compilando documentación: ${lang.label} (${lang.code})`);
  console.log(`[Compodoc] Directorio de salida: ${outputDir}`);
  console.log(`========================================\n`);

  const cmd = `npx @compodoc/compodoc -p tsconfig.app.json -d ${outputDir} --language ${lang.compodocLang} --includes ${lang.docsPath} -n "ATSMarket Web App"`;
  execSync(cmd, { cwd: ROOT_DIR, stdio: 'inherit' });
}

/**
 * Escanea los archivos generados en additional-documentation para armar el mapa de equivalencias.
 */
function getAdditionalDocsMap() {
  const docsMap = {};
  for (const lang of LANGUAGES) {
    const additionalDir = path.join(DOCS_DIR, lang.code, 'additional-documentation');
    if (fs.existsSync(additionalDir)) {
      docsMap[lang.code] = fs.readdirSync(additionalDir).filter(f => f.endsWith('.html'));
    } else {
      docsMap[lang.code] = [];
    }
  }
  return docsMap;
}

/**
 * Inyecta el selector interactivo de idioma y estilos en los archivos HTML generados.
 */
function injectLanguageSelector(docsMap) {
  console.log('\n[Post-Build] Inyectando selector de idioma y navegación reactiva...');

  for (const lang of LANGUAGES) {
    const langDir = path.join(DOCS_DIR, lang.code);
    if (!fs.existsSync(langDir)) continue;

    const htmlFiles = getAllHtmlFiles(langDir);
    console.log(`[Post-Build] Modificando ${htmlFiles.length} archivos HTML en ${lang.code}...`);

    for (const filePath of htmlFiles) {
      let content = fs.readFileSync(filePath, 'utf8');

      // Estilos CSS para el selector (soporta modo claro y oscuro)
      const selectorStyle = `
<style id="compodoc-lang-styles">
  .compodoc-lang-switch {
    position: fixed;
    top: 15px;
    right: calc(90px + var(--content-scrollbar-width, 0px));
    z-index: 1050;
    display: inline-block;
  }
  @media (max-width: 767px) {
    .compodoc-lang-switch {
      top: 8px;
      right: 60px;
    }
  }
  #compodoc-lang-select {
    height: 34px;
    padding: 0 12px;
    border-radius: 17px;
    border: 1px solid #d9d9d9;
    background-color: #ffffff;
    color: #1f1f1f;
    font-size: 13px;
    font-family: inherit;
    font-weight: 500;
    cursor: pointer;
    outline: none;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    padding-right: 26px;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 8px center;
    background-size: 14px;
  }
  #compodoc-lang-select:hover, #compodoc-lang-select:focus {
    border-color: #5cc0ae;
    box-shadow: 0 2px 8px rgba(92, 192, 174, 0.25);
  }
  body.dark .compodoc-lang-switch #compodoc-lang-select {
    background-color: #2c3e50;
    color: #ecf0f1;
    border: 1px solid #4a627a;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ecf0f1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  }
  body.dark .compodoc-lang-switch #compodoc-lang-select option {
    background-color: #2c3e50;
    color: #ecf0f1;
  }
</style>
`;

      // Markup del selector
      const selectorMarkup = `
<div class="compodoc-lang-switch">
  <select id="compodoc-lang-select" aria-label="Seleccionar idioma">
    <option value="es" ${lang.code === 'es' ? 'selected' : ''}>🇪🇸 Español</option>
    <option value="en" ${lang.code === 'en' ? 'selected' : ''}>🇺🇸 English</option>
    <option value="pt" ${lang.code === 'pt' ? 'selected' : ''}>🇧🇷 Português</option>
  </select>
</div>
`;

      // Script cliente para gestionar el cambio y mapeo de URLs
      const selectorScript = `
<script id="compodoc-lang-script">
(function() {
  var CURRENT_LANG = "${lang.code}";
  var ADDITIONAL_DOCS_MAP = ${JSON.stringify(docsMap)};

  var select = document.getElementById('compodoc-lang-select');
  if (!select) return;

  try {
    localStorage.setItem('compodoc_lang', CURRENT_LANG);
  } catch (e) {}

  select.addEventListener('change', function(e) {
    var targetLang = e.target.value;
    if (targetLang === CURRENT_LANG) return;

    try {
      localStorage.setItem('compodoc_lang', targetLang);
    } catch (err) {}

    var href = window.location.href;
    var pathname = window.location.pathname;

    // Manejo especial para páginas de additional-documentation
    if (pathname.indexOf('/additional-documentation/') !== -1) {
      var segments = pathname.split('/');
      var currentFile = decodeURIComponent(segments[segments.length - 1]);
      
      var currentList = ADDITIONAL_DOCS_MAP[CURRENT_LANG] || [];
      var targetList = ADDITIONAL_DOCS_MAP[targetLang] || [];
      var foundIndex = -1;

      var prefixMatch = currentFile.match(/^(\\d{2}\\.-)/);
      if (prefixMatch) {
        var prefix = prefixMatch[1];
        for (var i = 0; i < targetList.length; i++) {
          if (targetList[i].startsWith(prefix)) {
            foundIndex = i;
            break;
          }
        }
      }
      if (foundIndex === -1) {
        for (var j = 0; j < currentList.length; j++) {
          if (currentList[j] === currentFile) {
            foundIndex = j;
            break;
          }
        }
      }

      var targetFile = (foundIndex !== -1 && targetList[foundIndex]) 
        ? targetList[foundIndex] 
        : (targetList[0] || 'index.html');

      var targetSubpath = '/' + targetLang + '/additional-documentation/' + targetFile;
      var currentSubpath = '/' + CURRENT_LANG + '/additional-documentation/' + segments[segments.length - 1];

      if (href.indexOf(currentSubpath) !== -1) {
        window.location.href = href.replace(currentSubpath, targetSubpath);
        return;
      }
    }

    // Páginas estándar
    var standardReplace = href.replace('/' + CURRENT_LANG + '/', '/' + targetLang + '/');
    if (standardReplace !== href) {
      window.location.href = standardReplace;
    } else {
      var depth = (typeof COMPODOC_CURRENT_PAGE_DEPTH !== 'undefined') ? COMPODOC_CURRENT_PAGE_DEPTH : 0;
      var prefixPath = '';
      for (var k = 0; k <= depth; k++) {
        prefixPath += '../';
      }
      window.location.href = prefixPath + targetLang + '/index.html';
    }
  });
})();
</script>
`;

      // Inyección en el HTML
      if (!content.includes('id="compodoc-lang-select"')) {
        content = content.replace('</head>', `${selectorStyle}\n</head>`);
        if (content.includes('<label class="dark-mode-switch">')) {
          content = content.replace('<label class="dark-mode-switch">', `${selectorMarkup}\n          <label class="dark-mode-switch">`);
        } else {
          content = content.replace('</body>', `${selectorMarkup}\n</body>`);
        }
        content = content.replace('</body>', `${selectorScript}\n</body>`);
        fs.writeFileSync(filePath, content, 'utf8');
      }
    }
  }
}

/**
 * Obtiene todos los archivos HTML recursivamente dentro de un directorio.
 */
function getAllHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Genera el index.html raíz en documentation/ para redirección automática de idioma.
 */
function generateRootIndexHtml() {
  console.log('[Post-Build] Generando documentation/index.html con redirección inteligente...');
  const rootIndexContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=./es/index.html">
  <title>ATSMarket Documentation</title>
  <script>
    (function() {
      var storedLang = localStorage.getItem('compodoc_lang');
      var supported = ['es', 'en', 'pt'];
      var targetLang = 'es';
      if (storedLang && supported.indexOf(storedLang) !== -1) {
        targetLang = storedLang;
      } else {
        var navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
        if (navLang.startsWith('pt')) targetLang = 'pt';
        else if (navLang.startsWith('en')) targetLang = 'en';
        else targetLang = 'es';
      }
      window.location.replace('./' + targetLang + '/index.html');
    })();
  </script>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8f9fa;">
  <div style="text-align: center; padding: 2rem; border-radius: 8px; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <h2 style="color: #2c3e50; margin-bottom: 1rem;">ATSMarket Documentation</h2>
    <p style="color: #6c757d;">Redirigiendo a la documentación... <a href="./es/index.html" style="color: #5cc0ae; font-weight: bold;">Haga clic aquí si no es redirigido</a>.</p>
  </div>
</body>
</html>
`;
  fs.writeFileSync(path.join(DOCS_DIR, 'index.html'), rootIndexContent, 'utf8');
}

/**
 * Servidor HTTP estático local para documentación.
 */
function serveDocumentation(port = 8080) {
  const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.txt': 'text/plain'
  };

  const server = http.createServer((req, res) => {
    let cleanUrl = req.url.split('?')[0].split('#')[0];
    if (cleanUrl === '/' || cleanUrl === '') {
      cleanUrl = '/index.html';
    }

    let filePath = path.join(DOCS_DIR, decodeURIComponent(cleanUrl));

    // Si es un directorio, intentar servir index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('404 Not Found: ' + cleanUrl);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('500 Server Error: ' + err.message);
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });

  server.listen(port, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 [Compodoc Multi-idioma] Servidor HTTP activo en:`);
    console.log(`👉 http://localhost:${port}`);
    console.log(`   - 🇪🇸 Español:    http://localhost:${port}/es/index.html`);
    console.log(`   - 🇺🇸 English:    http://localhost:${port}/en/index.html`);
    console.log(`   - 🇧🇷 Português:  http://localhost:${port}/pt/index.html`);
    console.log(`======================================================\n`);
  });
}

// Flujo Principal
async function main() {
  const isServeOnly = process.argv.includes('--serve') && !process.argv.includes('--rebuild');

  if (!isServeOnly) {
    console.log('Iniciando construcción de documentación multilingüe de Compodoc...');
    
    // 1. Construir para cada idioma
    for (const lang of LANGUAGES) {
      buildCompodocForLanguage(lang);
    }

    // 2. Mapear additional-documentation
    const docsMap = getAdditionalDocsMap();

    // 3. Inyectar selector en todos los HTML generados
    injectLanguageSelector(docsMap);

    // 4. Generar index.html raíz
    generateRootIndexHtml();

    console.log('\n✅ ¡Documentación multi-idioma generada exitosamente!');
  }

  // 5. Servir si se especificó el flag
  if (process.argv.includes('--serve')) {
    serveDocumentation(8080);
  }
}

main().catch(err => {
  console.error('[Error en build-docs.js]:', err);
  process.exit(1);
});
