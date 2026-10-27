# Engineering portal introduction

This branch adds a Portale-inspired two-screen introduction to **Mario Shyomal De Silva's** existing portfolio without converting the existing static HTML site to React.

## Experience

- White MS preloader with a percentage counter that waits for the hero photograph and Geist font weights, with a timeout fallback.
- Full-screen telecom field photography (`4.JPG`) that scales into view.
- Responsive navigation and a large word-by-word intro headline.
- Glass engineering panel that turns toward the visitor, glows and fills with white light during a pinned, reversible GSAP ScrollTrigger transition.
- White second screen with a pale-blue network illustration, animated typography, and metrics based on the existing portfolio (400+ sites, 7 countries, 120 km regional study).
- Normal scrolling continues into the existing navigation, field gallery, profile, experience, projects, skills, education and contact details.
- Mobile styles, reduced-motion crossfade, a pointer-follow glass disc on fine-pointer devices, and print exclusion.
- Existing image gallery, logos, text, HTML and CSS remain in place.

## Files

- `index.html`: new scoped HTML intro at the top plus stylesheet and JS references.
- `assets/portfolio-portal.css`: all new design rules scoped to `#ms-portal-root`.
- `assets/portfolio-portal.js`: progressive image loading and GSAP animation logic.

The intro deliberately uses the existing `4.JPG` photo rather than the fictional banking brand's desert/card imagery.

## Local review

From a working copy of this branch, run `python -m http.server 8000` and open `http://localhost:8000`. Serving via HTTP matters: the intro loads the photograph using `fetch()`, which may fail when a local HTML file is opened through `file://`.

Check desktop and narrow/mobile viewport widths, forward/reverse scrolling, direct links such as `/#projects`, reduced-motion settings, printing and page-load behavior with a slow connection.

The intro uses GSAP 3.15.0 and ScrollTrigger from jsDelivr. If the CDN is unavailable, its JavaScript renders a static photo-based hero instead of leaving a blank page.

## Rollout

The changes are on a separate feature branch. **The production website remains unchanged until the branch is merged.** After reviewing, merge the pull request into `main` to allow the existing hosting/deployment pipeline to publish the updated site.
