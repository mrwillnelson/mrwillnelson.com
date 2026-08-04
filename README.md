# mrwillnelson.com

Minimal one-page personal landing page for Will Nelson.

## Local development

```sh
npm install
npm run validate
npm run dev
```

The site runs through Wrangler and serves static assets from `web/`.

## Email signup

The email form is intentionally not connected yet. Add the Beehiiv subscribe form action to `BEEHIIV_FORM_ACTION` in `web/script.js` when the endpoint is available.

Until then, the form validates email syntax and shows a truthful inline message instead of claiming a subscription succeeded.

## Deployment

```sh
npm run deploy
```

The Worker is configured with a custom domain route for `mrwillnelson.com`. Cloudflare auth and an active zone for the domain are required before deploy can create the custom domain.
