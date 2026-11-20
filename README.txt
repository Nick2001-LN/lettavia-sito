Lettavia — sito statico (HTML, CSS e un piccolo script vanilla; nessuna build, nessuna libreria)

Deploy: Cloudflare Pages, "Direct upload" o repository; build command vuoto, output directory = questa cartella.
Il sito è progressivo: senza JavaScript tutto il contenuto resta visibile (cambiano solo le animazioni).
Animazioni: assets/style.css + assets/site.js. Tutte disattivate con prefers-reduced-motion.
_headers: CSP con script-src 'self' (solo assets/site.js). GitHub Pages ignora _headers; Cloudflare Pages lo applica.

Segnaposto da compilare (cercare in tutti i file):
  [LINK APP STORE]      index.html, header e CTA: href="#" + badge ufficiale Apple
  [EMAIL DI SUPPORTO]   supporto/index.html
  [DA COMPLETARE]       privacy/, termini/, supporto/ (testi legali e passaggi di dettaglio)
  [PREZZO]              nessun prezzo scritto: resta "Prezzo sull'App Store"
  og:image / og:url / canonical / sitemap: servono l'URL definitivo del dominio

Font Literata e Inter: self-hosted (licenza SIL OFL), sottoinsieme latino in assets/fonts/.
Immagini: schermate dai test dell'app (libri di esempio): sostituire con screenshot reali da iPhone.
Le schermate timer, catalogo e scheda libro esistono solo in tema chiaro (in tema scuro sono attenuate via CSS): rifarle in scuro.
I numeri della sezione Progressi (60%, 3 su 6, 14,8 pagine al giorno) sono i valori d'esempio delle schermate.

Anteprima su GitHub Pages (https://nick2001-ln.github.io/lettavia-sito/):
  - ogni pagina HTML ha <meta name="robots" content="noindex, nofollow">
  - robots.txt è "Disallow: /": entrambi vanno modificati al lancio
  - 404.html usa percorsi con prefisso /lettavia-sito/ (un project site di GitHub Pages vive sotto /lettavia-sito/).
    Su Cloudflare Pages alla radice del dominio i percorsi devono essere "/" (es. /assets/style.css).
  - La vecchia variante hero-b è stata rimossa nella v2. Dalla v4 le funzioni sono in un'unica sezione a schede (tablist ARIA).
