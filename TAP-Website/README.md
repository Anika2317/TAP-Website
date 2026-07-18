# The Acoustic Project (TAP) Website

This is the front-end source code for The Acoustic Project, a student-run club based at Del Norte High School in San Diego, CA. 

## Technical Architecture
This website is built as a lightweight **Single Page Application (SPA)** using pure HTML, CSS, and Vanilla JavaScript. 
- **No frameworks** (no React, Vue, etc.)
- **No build step** (no npm, Webpack, Vite)
- **Instant deployment** (Ready for GitHub Pages, Netlify, Vercel, or standard FTP)

## File Structure
1. `index.html` - Contains the navigation, the SPA container, and all individual page sections (hidden/shown via JS).
2. `style.css` - Contains the design system, typography (Google Fonts), color variables, grid layouts, and CSS animations.
3. `script.js` - Contains the routing logic to switch pages without reloading, handles mobile menu toggling, form submission mocks, and the dynamic Canvas API background animation for the hero section.

## How to Edit Pages
Open `index.html`. Inside the `<main id="app">` tag, you will see sections with IDs (e.g., `<section id="about" class="page">`). Simply edit the text within these HTML tags. Because it's an SPA, you only need to edit one file to update the entire site structure.

## Deployment
Because there is no build step, you can simply upload these files to any web host. 
For free, fast hosting, you can drag and drop the folder containing these files into [Netlify Drop](https://app.netlify.com/drop).