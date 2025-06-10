import Head from "next/head"

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: "website" | "article"
  publishedTime?: string
  modifiedTime?: string
}

export function SEO({
  title = "MCS - Modern Care System | AI-Powered Healthcare Assistant",
  description = "Get instant medical advice from AI specialists. Track your health journey with smart notes, reminders, and personalized care. The future of healthcare is here.",
  keywords = "AI healthcare, medical assistant, health tracking, AI doctor, telemedicine, health notes, medical advice, healthcare app, AI specialist, digital health",
  image = "/og-image.png",
  url = "https://mcs-health.vercel.app",
  type = "website",
  publishedTime,
  modifiedTime,
}: SEOProps) {
  const fullTitle = title.includes("MCS") ? title : `${title} | MCS - Modern Care System`
  const fullImageUrl = image.startsWith("http") ? image : `${url}${image}`

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="MCS - Modern Care System" />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="MCS - Modern Care System" />
      <meta property="og:locale" content="en_US" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:creator" content="@MCSHealth" />
      <meta name="twitter:site" content="@MCSHealth" />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#0070f3" />
      <meta name="msapplication-TileColor" content="#0070f3" />
      <meta name="application-name" content="MCS Health" />
      <meta name="apple-mobile-web-app-title" content="MCS Health" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* Favicons and Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MedicalWebPage",
            name: fullTitle,
            description: description,
            url: url,
            image: fullImageUrl,
            publisher: {
              "@type": "Organization",
              name: "MCS - Modern Care System",
              logo: {
                "@type": "ImageObject",
                url: `${url}/icon-512.png`,
              },
            },
            mainEntity: {
              "@type": "SoftwareApplication",
              name: "MCS - Modern Care System",
              applicationCategory: "HealthApplication",
              operatingSystem: "Web Browser",
              description: description,
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "1250",
              },
            },
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: url,
                },
              ],
            },
          }),
        }}
      />
    </Head>
  )
}
