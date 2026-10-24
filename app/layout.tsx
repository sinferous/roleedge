import type { Metadata, Viewport } from "next";
import { site } from "@/lib/site";
import { Icons } from "@/components/site/Icons";
import "./site.css";
import "./pages.css";
import "./home.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Career and admissions guidance`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  icons: { icon: { url: "/assets/favicon.png", type: "image/png" } },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_IN",
    title: `${site.name} — Career and admissions guidance`,
    description: "Career and admissions mentorship shaped around your experience, your goals, and what comes next.",
  },
  robots: site.indexable ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f7f6f2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* The v1 styles show no-JS fallbacks unless this class is present. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <link rel="preload" href="/assets/fonts/dm-sans-regular.ttf" as="font" type="font/ttf" crossOrigin="" />
      </head>
      <body>
        <Icons />
        {children}
      </body>
    </html>
  );
}
