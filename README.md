# S–AIM

Studio homepage in English and Russian. Static files live in `dist/`; no build step or package installation is needed. Run `python3 -m http.server 4173 --directory dist` for a local preview.

## Design and interaction

Desktop homepage inspired by the Havu reference: monochrome typography, generous spacing, pixel artwork, letter-by-letter heading reveals, scroll transitions, moving marquees, six expanding service columns, animated diagram, full-screen navigation, light/dark themes, FAQ accordion and a keyboard-playable pixel breakout footer. Original pixel assets are rendered in canvas and SVG. Reduced motion and a manual motion toggle are supported.

## Content

Services, the studio’s 15+ years in business, inventory systems installed on customer servers, team disciplines, process, FAQ and contact section. No fictional clients, project results or employee identities are presented.

Phone `+7 (000) 000-00-00` and `hello@s-aim.example` are placeholders. The form previews a brief locally and can download it; it does not send or store submissions on a server. Connect a real inbox/form endpoint before accepting enquiries.

## Languages

English is at `/` and Russian at `/ru/`. The RU / EN switch preserves the current section. Each page has localized metadata, accessibility labels, form preview text and game controls, plus canonical and hreflang links. Shared styles and behaviour support both locales. Turkish remains planned.

## Preserved version

The earlier green Russian design is preserved in Git at tag `saved-green-v1`, commit `6e14403df2270af9ba48999d6bdcbb81b3e90c3b`. Its three generated CGI images remain in `dist/assets/` for reuse but are not loaded by this homepage.

## Services interaction

The services section follows the Moremedia reference: equal vertical columns expand on hover, with readable lists and links to the contact form. Keyboard and tap controls are available; narrow screens use a vertical accordion. Selecting an offering preselects its service category in the local brief. The complete bilingual version before this change is preserved at Git tag `saved-bilingual-before-service-panels` and saved Site version 3.

## Experimental testimonials

A four-column editorial block is placed after the team and before FAQ in both languages. Every testimonial is explicitly marked as sample content, with placeholder author labels; no actual client feedback is claimed. Native disclosures show the full sample text. Remove the `section#reviews` element from both pages to omit this experiment.

Three decorative images were created with built-in Imagegen: `dist/assets/review-mountain.png`, `dist/assets/review-birds.png`, `dist/assets/review-leaf.png`. Exact prompts are recorded in `review-image-prompts.txt`. The fourth card reuses `dist/assets/project-system.png` from the earlier design, rendered in grayscale through CSS. These images do not depict customers or delivered projects.
