/*
  backgrounds.js
  Exports a `backgrounds` array and an `initBackgrounds()` helper that
  generates thumbnail elements inside #bg-thumbnails and exposes a lookup
  used by the page script to apply backgrounds.
*/
const backgrounds = [
  {
    id: 'default',
    title: 'Default',
    thumb: "data:image/svg+xml;utf8,<svg width='48' height='48' xmlns='http://www.w3.org/2000/svg'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='%23f5f7fa' offset='0'/><stop stop-color='%23c3cfe2' offset='1'/></linearGradient></defs><rect width='48' height='48' rx='8' fill='url(%23g)'/></svg>",
    url: null,
  },
  {
    id: 'Beach - Australia',
    title: 'Beach - Australia',
    thumb: 'https://images.pexels.com/photos/27135841/pexels-photo-27135841.jpeg',
    url: 'https://images.pexels.com/photos/27135841/pexels-photo-27135841.jpeg',
  },
  {
    id: 'City - Shanghai',
    title: 'City - Shanghai',
    thumb: 'https://images.pexels.com/photos/683940/pexels-photo-683940.jpeg',
    url: 'https://images.pexels.com/photos/683940/pexels-photo-683940.jpeg',
  },
  {
    id: 'Dubai - United Arab Emirates',
    title: 'Dubai - United Arab Emirates',
    thumb: 'https://images.pexels.com/photos/219692/pexels-photo-219692.jpeg',
    url: 'https://images.pexels.com/photos/219692/pexels-photo-219692.jpeg',
  },
  {
    id: 'Flower Field Under Pink Sky',
    title: 'Flower Field Under Pink Sky',
    thumb: 'https://images.pexels.com/photos/1166209/pexels-photo-1166209.jpeg',
    url: 'https://images.pexels.com/photos/1166209/pexels-photo-1166209.jpeg',
  },
  {
    id: 'Night Sky - Mountain Peak',
    title: 'Night Sky - Mountain Peak',
    thumb: 'https://images.pexels.com/photos/1775777/pexels-photo-1775777.jpeg',
    url: 'https://images.pexels.com/photos/1775777/pexels-photo-1775777.jpeg',
  },
  {
    id: 'Night Sky - Tree',
    title: 'Night Sky - Tree',
    thumb: 'https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg',
    url: 'https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg',
  },
  {
    id: 'Huangshan - Anhui',
    title: 'Huangshan - Anhui',
    thumb: 'https://images.pexels.com/photos/1586205/pexels-photo-1586205.jpeg',
    url: 'https://images.pexels.com/photos/1586205/pexels-photo-1586205.jpeg',
  },
  {
    id: 'Skyline At Night - Hong Kong',
    title: 'Skyline At Night - Hong Kong',
    thumb: 'https://images.pexels.com/photos/2481190/pexels-photo-2481190.jpeg',
    url: 'https://images.pexels.com/photos/2481190/pexels-photo-2481190.jpeg',
  },
  {
    id: 'Slovenia',
    title: 'Slovenia',
    thumb: 'https://images.pexels.com/photos/547125/pexels-photo-547125.jpeg',
    url: 'https://images.pexels.com/photos/547125/pexels-photo-547125.jpeg',
  },
  {
    id: 'Water Beside Forest',
    title: 'Water Beside Forest',
    thumb: 'https://images.pexels.com/photos/1144176/pexels-photo-1144176.jpeg',
    url: 'https://images.pexels.com/photos/1144176/pexels-photo-1144176.jpeg',
  },
];

function initBackgrounds() {
  const container = document.getElementById('bg-thumbnails');
  if (!container) return;
  container.innerHTML = '';
  backgrounds.forEach((bg) => {
    const img = document.createElement('img');
    img.className = 'bg-thumb';
    img.setAttribute('data-bg', bg.id);
    img.src = bg.thumb;
    img.title = bg.title;
    img.alt = bg.title;
    container.appendChild(img);
  });
}

function findBackgroundUrlById(id) {
  const b = backgrounds.find((x) => x.id === id);
  return b ? b.url : null;
}

// Initialize as soon as possible so the inline script can use the thumbnails
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBackgrounds);
} else {
  initBackgrounds();
}

// Expose for other scripts (non-module global)
window._backgrounds = backgrounds;
window._initBackgrounds = initBackgrounds;
window._findBackgroundUrlById = findBackgroundUrlById;
