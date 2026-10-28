# Optional URLhaus reputation checks

ScamLens always performs its existing URL structure analysis locally. The optional URLhaus lookup is a separate user-initiated check.

## Configure locally

1. Create an account and obtain an API key from the official URLhaus/abuse.ch authentication portal: https://auth.abuse.ch/
2. Copy `.env.example` to `.env.local`.
3. Set `URLHAUS_AUTH_KEY` in `.env.local`. Never prefix this variable with `NEXT_PUBLIC_`.
4. Restart the development server with `pnpm dev`.

The same variable must be configured as a server-side environment secret on the deployment platform. Do not commit `.env.local` or the actual key.

## What the lookup sends

When the user explicitly clicks **Check URLhaus reputation**, ScamLens sends the normalized HTTP/HTTPS URL to the URLhaus Community API through the server route `POST /api/threat-intel`. The request can include the URL path and query string. The interface warns users not to submit private, password-reset or one-time links. URLs containing embedded username/password credentials are rejected.

ScamLens does not visit the submitted website. The server only sends the URL as form data to the fixed URLhaus endpoint. The server does not log or persist lookup URLs. The endpoint uses a timeout, a small best-effort in-memory rate limit and no-store responses. In-memory limits are per running instance and are not a replacement for platform-level rate limiting.

## Interpreting results

- **Match:** URLhaus has a record for the URL in its malware-distribution dataset. Treat it as dangerous.
- **No match:** URLhaus did not find a record. This does not mean the URL is safe and does not rule out phishing.
- **Unavailable / unconfigured:** Reputation information could not be retrieved. The local structure check remains available.

URLhaus focuses on known malware-distribution URLs. It is not a complete phishing-reputation service. External lookups may reveal the URL to the provider, so the feature is optional and only runs after the user clicks the button.

Official API documentation: https://urlhaus.abuse.ch/api/
