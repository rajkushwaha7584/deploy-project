# Riddhi Siddhi Enterprises portfolio

A responsive, no-build static portfolio designed for GitHub Pages. The hero includes an animated 3D purifier, built with Three.js; a CSS illustration remains available when WebGL or the CDN is unavailable. The rest of the site has no build step.

## Update the business details

Edit `content.js` to set the correct public phone number, dialable phone number and email address. The details in the supplied poster were used as the phone number; the email is a placeholder and should be replaced before publishing.

Update the copy, service descriptions and project examples directly in `index.html`. The recent-work tiles are original illustrative mockups, not photographs of completed customer installations. Replace their markup/artwork with real projects as they become available.

## Feedback and contact forms

GitHub Pages serves static files and does not process form submissions. The contact and feedback forms validate their required fields and open the visitor's email app with a prefilled message addressed to the email in `content.js`. Visitors still need to press Send in their email app. If you later want on-page form delivery, connect a form service or your own backend.

## Publish on GitHub Pages

1. Put these files in the repository root (or the directory selected for Pages).
2. In GitHub, open **Settings → Pages**.
3. Select **Deploy from a branch**, choose your publishing branch and `/ (root)`, then save.
4. Open the Pages URL shown in repository settings.

No build command is required.

The interactive 3D scenes are in `three-scene.js` and `product-scenes.js`; they load Three.js from jsDelivr. They need an internet connection for that library. The CSS purifier artwork and uploaded product photos remain as fallbacks if WebGL or the CDN is unavailable. `theme.css` contains the dark visual theme, and `script.js` handles the responsive navigation and small interactions.

Visitors can switch between dark and light appearance with the navigation theme button. Their choice is saved in local storage.

The photo river uses all five supplied images. The optional water ambience is synthesized in the browser and starts only when the visitor presses its button. The Hindi slogan can also be spoken on demand using the browser's Hindi speech voice when available.


## Uploaded images

The images/ folder contains the supplied purifier and commercial equipment photos. The product and solutions sections reference these files directly, so keep the folder alongside index.html when publishing to GitHub Pages.
