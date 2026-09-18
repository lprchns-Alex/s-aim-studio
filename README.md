# S–AIM

Studio homepage in English and Russian. Static files live in `dist/`; no build step or package installation is needed. Run `python3 -m http.server 4173 --directory dist` for a local preview.

## Design and interaction

Desktop homepage inspired by the Havu reference: monochrome typography, generous spacing, pixel artwork, letter-by-letter heading reveals, scroll transitions, moving marquees, sticky service cards, animated diagram, full-screen navigation, light/dark themes, FAQ accordion and a keyboard-playable pixel breakout footer. Original pixel assets are rendered in canvas and SVG. Reduced motion and a manual motion toggle are supported.

## Content

Services, the studio’s 15+ years in business, inventory systems installed on customer servers, team disciplines, process, FAQ and contact section. No fictional clients, project results or employee identities are presented.

Phone `+7 (000) 000-00-00` and `hello@s-aim.example` are placeholders. The form previews a brief locally and can download it; it does not send or store submissions on a server. Connect a real inbox/form endpoint before accepting enquiries.

## Languages

English is at `/` and Russian at `/ru/`. The RU / EN switch preserves the current section. Each page has localized metadata, accessibility labels, form preview text and game controls, plus canonical and hreflang links. Shared styles and behaviour support both locales. Turkish remains planned.

## Preserved version

The earlier green Russian design is preserved in Git at tag `saved-green-v1`, commit `6e14403df2270af9ba48999d6bdcbb81b3e90c3b`. Its three generated CGI images remain in `dist/assets/` for reuse but are not loaded by this homepage.
