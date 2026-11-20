Lettavia — sito statico (HTML/CSS, nessuna build, nessun JavaScript)

Deploy: Cloudflare Pages, "Direct upload" o repository; build command vuoto, output directory = questa cartella.

Segnaposto da compilare (cercare in tutti i file):
  [LINK APP STORE]      index.html, hero-b/, header e CTA: href="#" + badge ufficiale Apple
  [EMAIL DI SUPPORTO]   supporto/index.html
  [DA COMPLETARE]       privacy/, termini/, supporto/ (testi legali e passaggi di dettaglio)
  [PREZZO]              nessun prezzo scritto: resta "Prezzo sull'App Store"
  og:image / og:url / canonical / sitemap: servono l'URL definitivo del dominio

hero-b/index.html: variante alternativa della hero (noindex). Eliminare la cartella se non serve.
Font Literata e Inter: self-hosted (licenza SIL OFL), sottoinsieme latino in assets/fonts/.
Immagini: schermate dai test dell'app (libri di esempio): sostituire con screenshot reali da iPhone.

Anteprima su GitHub Pages (https://nick2001-ln.github.io/lettavia-sito/):
  - ogni pagina HTML ha <meta name="robots" content="noindex, nofollow">
  - robots.txt è "Disallow: /": entrambi vanno modificati al lancio
  - 404.html usa percorsi assoluti con prefisso /lettavia-sito/ perché
    un project site di GitHub Pages vive sotto quel path. Se il sito
    va su Cloudflare Pages alla radice del dominio, quei percorsi
    vanno riportati a / (es. /assets/style.css, href="/").
