# S–AIM

English-first studio homepage. Static files live in `dist/`; no build step or package installation is needed. Run `python3 -m http.server 4173 --directory dist` for a local preview.

## Design and interaction

Desktop homepage inspired by the Havu reference: monochrome typography, generous spacing, pixel artwork, letter-by-letter heading reveals, scroll transitions, moving marquees, sticky service cards, animated diagram, full-screen navigation, light/dark themes, FAQ accordion and a keyboard-playable pixel breakout footer. Original pixel assets are rendered in canvas and SVG. Reduced motion and a manual motion toggle are supported.

## Content

Services, the studio’s 15+ years in business, inventory systems installed on customer servers, team disciplines, process, FAQ and contact section. No fictional clients, project results or employee identities are presented.

Phone `+7 (000) 000-00-00` and `hello@s-aim.example` are placeholders. The form previews a brief locally and can download it; it does not send or store submissions on a server. Connect a real inbox/form endpoint before accepting enquiries.

## Languages

The current page, metadata and interface are in English (`lang=en`). Russian and Turkish are planned; no inactive language links are shown. Markup, style and behaviour are separate so localized routes can reuse the visual system. Future translations must include metadata, accessibility labels and script-generated interface text.

## Preserved version

The earlier green Russian design is preserved in Git at tag `saved-green-v1`, commit `6e14403df2270af9ba48999d6bdcbb81b3e90c3b`. Its three generated CGI images remain in `dist/assets/` for reuse but are not loaded by this homepage.
