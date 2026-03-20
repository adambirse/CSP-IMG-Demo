# CSP img-src Demo

A proof-of-concept Node.js application that demonstrates how **Content Security Policy (CSP)** can selectively control which third-party images a browser is allowed to load — without changing any page markup.

## What It Does

The application serves a single page containing images from two sources:

- **Self-hosted SVGs** served from the application's own origin
- **Third-party images** from `rightsstatements.org` (both PNG and SVG variants)

The server attaches a `Content-Security-Policy` header to every response with an `img-src` directive that whitelists specific image URLs. The browser enforces this policy, silently blocking any image not covered by the directive.

By default, only the two **PNG** versions of the rights-statement buttons are allowed. The **SVG** versions from the same domain are blocked — demonstrating that CSP operates at the URL level, not the domain level.

## How CSP img-src Works

1. The server sends a `Content-Security-Policy` HTTP header with every page response.
2. The `img-src` directive lists exactly which image sources the browser may load.
3. The browser blocks any `<img>` whose `src` is not covered by the policy — no client-side code changes required.

### Default Policy

```
default-src 'self';
img-src 'self'
  https://rightsstatements.org/files/buttons/InC.dark-white-interior-blue-type.png
  https://rightsstatements.org/files/buttons/NoC-CR.dark-white-interior-blue-type.png;
style-src 'self' 'unsafe-inline';
script-src 'self' 'unsafe-inline';
font-src 'self';
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)

### Installation

```bash
git clone https://github.com/adambirse/CSP-IMG-Demo.git
cd CSP-IMG-Demo
npm install
```

### Running the Application

```bash
npm start
```

The server starts on **http://localhost:3000**.

Open the page in a browser and check the DevTools **Console** tab to see CSP violation reports for blocked images.

## Interactive Controls

The page includes a **Try It Yourself** panel that lets you modify the `img-src` policy in real time:

| Preset | Policy Value | Effect |
|--------|-------------|--------|
| **Default** | `'self'` + two explicit PNG URLs | Allows self-hosted images and the two listed PNGs; blocks SVGs from the same domain |
| **Allow entire domain** | `'self' https://rightsstatements.org` | Allows all images from `rightsstatements.org` (PNGs and SVGs) |
| **Allow all images** | `*` | No image restrictions |
| **Self only** | `'self'` | Blocks all third-party images |
| **Block everything** | `'none'` | Blocks all images including self-hosted |

There is also a **Report-Only** toggle that switches the header from `Content-Security-Policy` to `Content-Security-Policy-Report-Only`, which logs violations to the console without actually blocking images.

## Project Structure

```
CSP-IMG-Demo/
├── server.js                  # Express server — sets CSP headers and renders the page
├── generate-placeholder.js    # Utility to regenerate the self-hosted SVG placeholders
├── public/
│   └── images/
│       ├── local-sample.svg   # Self-hosted placeholder (burgundy)
│       └── local-sample-2.svg # Self-hosted placeholder (red)
├── package.json
└── .gitignore
```

### Key Files

- **`server.js`** — The entire application. Sets the CSP header via `res.setHeader()`, builds the HTML response, and includes a small helper (`isAllowedByPolicy`) that predicts whether each image will be allowed or blocked so the UI can show inline badges.
- **`generate-placeholder.js`** — Run with `node generate-placeholder.js` to regenerate the two self-hosted SVG test images in `public/images/`.

## How the Demo Proves URL-Level Blocking

The four third-party images all come from `rightsstatements.org`:

| Image | URL | Default Policy |
|-------|-----|----------------|
| InC (PNG) | `…/InC.dark-white-interior-blue-type.png` | Allowed |
| InC (SVG) | `…/InC.dark-white-interior-blue-type.svg` | Blocked |
| NoC-CR (PNG) | `…/NoC-CR.dark-white-interior-blue-type.png` | Allowed |
| NoC-CR (SVG) | `…/NoC-CR.dark-white-interior-blue-type.svg` | Blocked |

Because the policy lists exact PNG URLs rather than the whole `rightsstatements.org` origin, the SVG variants are blocked even though they come from the same domain. This demonstrates that CSP can be used for fine-grained, URL-level image control.

## Licence

ISC
