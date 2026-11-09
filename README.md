# TAYF — طيف

An editorial fashion storefront for an independent Egyptian label, shaped by Cairo's light, movement, and everyday rituals. The founder's supplied photos are kept in `src/assets/images/`; campaign photography is loaded from Unsplash. Built with Vite, vanilla JavaScript, GSAP, ScrollTrigger, and Lenis.

## Run locally

```bash
npm install
npm run dev
```

Vite prints the local URL after it starts. To create and preview a production build:

```bash
npm run build
npm run preview
```

## Project structure

```text
index.html
src/
  main.js
  styles.css
  assets/images/
    tayf-founder-look.jpg
    tayf-founder-portrait.jpg
  data/
    products.js
```

## Demo interactions

- Search and quick-view overlays
- Shopping bag with color variants, quantity controls, removal, subtotal, and local storage
- Wishlist saved in local storage
- Mobile navigation
- Newsletter email validation and success feedback
- Scroll reveals, image masks, subtle parallax, and reduced-motion support

## Demo limits

There is no backend, account system, checkout, or newsletter service. Form success is local demo feedback. Product details and prices are sample content. Editorial photography and Google Fonts load from Unsplash and Google Fonts, so those assets need an internet connection; replace them with licensed brand assets before launch.
