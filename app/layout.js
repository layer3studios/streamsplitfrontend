import '../styles/globals.css';
import AppBootstrap from '../components/AppBootstrap';
import ClientProviders from '../components/ClientProviders';
const BRAND = require('../lib/brand');

export const metadata = {
  title: BRAND.seo.title,
  description: BRAND.seo.description,
  keywords: BRAND.seo.keywords,
  icons: { icon: BRAND.favicon },
  openGraph: {
    title: BRAND.seo.title,
    description: BRAND.seo.description,
    siteName: BRAND.name,
    images: [BRAND.seo.ogImage],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang={BRAND.defaultLanguage} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#F6F1E8" />
        {/* Theme initialization script — runs before paint to prevent flash */}
        <script dangerouslySetInnerHTML={{
          __html: `
          (function(){
            try {
              var t = localStorage.getItem('theme');
              if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.setAttribute('data-theme', 'dark');
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body style={{ position: 'relative', zIndex: 1 }}>
        <ClientProviders>
          <AppBootstrap />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
