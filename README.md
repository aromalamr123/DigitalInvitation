# Olivia & Noah — wedding invitation

A responsive, mobile-first Christian wedding invitation made with plain HTML, CSS, and JavaScript. It is ready to deploy to Vercel as a static site. The reference-video inspired envelope opens on tap, the date can be scratched into view on touch or mouse, and page sections reveal gently as guests scroll. The countdown appears after the date is revealed. After the envelope opens, a gold ring rests on each side of the screen. As guests scroll, the rings tumble gently along the edges, then glide together and interlock in the "Joined in love" section near the end, which then reveals the ring photo. Scrolling back up separates them again. Opening the envelope starts the included wedding song; guests can mute or unmute it with the fixed headphone button. Reduced-motion preferences are respected, and the date can also be revealed with a button or keyboard.

## Personalize before sharing

Search and replace the example couple names, date, city, chapel, reception venue, and Scripture references in `index.html` and `script.js`. Update the Google Maps links to the real venues. Wedding media is stored in the `asset/` folder.

## Deploy to Vercel

Import this folder as a project in Vercel. No build command or framework preset is needed; the site is served directly from `index.html`. Alternatively, install Vercel CLI and run `vercel` from this folder, then `vercel --prod` to publish.

The reference videos and palette image in `asset/` are kept for design reference only; `.vercelignore` keeps them out of the deployed site.
