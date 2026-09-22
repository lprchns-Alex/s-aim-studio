# S–AIM

Source storage: public GitHub repository. Live website: https://lprchns-alex.github.io/s-aim-studio/ru/. GitHub Pages publishes the dist directory. See AGENTS.md for publishing restrictions. Canonical and hreflang metadata must be configured after a production domain is approved.

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

## Review styling update

The review section now reuses the team’s canvas pixel icon system, solid hairline rules, shared text links and site typography. The four visual panels retain staggered heights. The former photographic review layout is preserved at tag `saved-photo-reviews` and saved Site version 4. Its raster assets remain available but are not loaded by the current page. Both locales, themes and disclosure behaviour are supported.

## Hero IT team

The opening scene uses the same monochrome pixel grid as the rest of the site. A developer types and completes a build, a designer assembles a wireframe, and a technician checks a server rack. Small packets connect the stations. Narrow screens show two stations. The existing motion pause, reduced-motion preference, offscreen visibility and light/dark theme behaviours are preserved. The prior scene is saved at tag `saved-before-pixel-it-team` and Site version 5.

The wordmark now uses `<s-aim/>`. Studio facts use a shared large-number treatment: 15+ years, 6 service areas, 1 team. The opening section rules align on desktop.

Review illustrations are four fictional monochrome pixel portraits, matching the studio tile grid. Sample testimonial labels remain visible.

## Deferred company copy
The Approach and Connection sections were removed from both homepages at the user’s request. Their full Russian and English copy is preserved in `content-archive/company-copy.md`, with original section markup alongside it. Keep this content for a future placement; do not reinsert automatically.
