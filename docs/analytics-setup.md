# Analytics Setup

CineCards AI supports two optional production-only setup values:

- Cloudflare Web Analytics for privacy-friendly traffic analytics.
- Google Search Console site verification for SEO indexing and search queries.

## Environment variables

Add these values in the deployment environment, not in source control:

```bash
PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN=
PUBLIC_GOOGLE_SITE_VERIFICATION=
```

`PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` is the site token from the Cloudflare Web Analytics beacon snippet.
`PUBLIC_GOOGLE_SITE_VERIFICATION` is only the `content` value from the Google Search Console HTML tag, not the full tag.

## Validation checklist

Before considering analytics done:

- Production HTML includes `<meta name="google-site-verification" ...>` when the Google value is set.
- Production HTML includes `https://static.cloudflareinsights.com/beacon.min.js` when the Cloudflare token is set.
- No analytics token or verification value is hardcoded in the repository.
- Cloudflare Web Analytics shows page views after deployment.
- Google Search Console verifies the `https://cinecards.ai` property after deployment.

## Notes

Local product events still use the privacy-safe `lib/analytics.ts` emitter and remain on the visitor's device. Cloudflare Web Analytics is only for aggregate site traffic, while Search Console is for Google indexing and search performance.
