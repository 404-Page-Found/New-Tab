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
  thumb: 'background/Beach_-_Australia.jpeg',
  url: 'background/Beach_-_Australia.jpeg',
  },
  {
    id: 'Canion Mountains on Night Sky',
    title: 'Canion Mountains on Night Sky',
  thumb: 'background/Canion_Mountains_on_Night_Sky.jpeg',
  url: 'background/Canion_Mountains_on_Night_Sky.jpeg',
  },
  {
    id: 'City - Shanghai',
    title: 'City - Shanghai',
  thumb: 'background/City_-_Shanghai.jpeg',
  url: 'background/City_-_Shanghai.jpeg',
  },
  {
    id: 'Close-up Photo of Glowing Blue Butterflies',
    title: 'Close-up Photo of Glowing Blue Butterflies',
  thumb: 'background/Close-up_Photo_of_Glowing_Blue_Butterflies.jpeg',
  url: 'background/Close-up_Photo_of_Glowing_Blue_Butterflies.jpeg',
  },
  {
    id: 'Desert during Nighttime',
    title: 'Desert during Nighttime',
  thumb: 'background/Desert_during_Nighttime.jpeg',
  url: 'background/Desert_during_Nighttime.jpeg',
  },
  {
    id: 'Dubai - United Arab Emirates',
    title: 'Dubai - United Arab Emirates',
  thumb: 'background/Dubai_-_United_Arab_Emirates.jpeg',
  url: 'background/Dubai_-_United_Arab_Emirates.jpeg',
  },
  {
    id: 'Flower Field Under Pink Sky',
    title: 'Flower Field Under Pink Sky',
  thumb: 'background/Flower_Field_Under_Pink_Sky.jpeg',
  url: 'background/Flower_Field_Under_Pink_Sky.jpeg',
  },
  {
    id: 'Full Moon',
    title: 'Full Moon',
  thumb: 'background/Full_Moon.jpeg',
  url: 'background/Full_Moon.jpeg',
  },
  {
    id: 'High-rise Buildings During Nighttime',
    title: 'High-rise Buildings During Nighttime',
  thumb: 'background/High-rise_Buildings_During_Nighttime.jpeg',
  url: 'background/High-rise_Buildings_During_Nighttime.jpeg',
  },
  {
    id: 'Huangshan - Anhui',
    title: 'Huangshan - Anhui',
  thumb: 'background/Huangshan_-_Anhui.jpeg',
  url: 'background/Huangshan_-_Anhui.jpeg',
  },
  {
    id: 'Mountain Covered Snow Under Star',
    title: 'Mountain Covered Snow Under Star',
  thumb: 'background/Mountain_Covered_Snow_Under_Star.jpeg',
  url: 'background/Mountain_Covered_Snow_Under_Star.jpeg',
  },
  {
    id: 'Mountain Covered With Snow during Nighttime',
    title: 'Mountain Covered With Snow during Nighttime',
  thumb: 'background/Mountain_Covered_With_Snow_during_Nighttime.jpeg',
  url: 'background/Mountain_Covered_With_Snow_during_Nighttime.jpeg',
  },
  {
    id: 'Night Sky - Mountain Peak',
    title: 'Night Sky - Mountain Peak',
  thumb: 'background/Night_Sky_-_Mountain_Peak.jpeg',
  url: 'background/Night_Sky_-_Mountain_Peak.jpeg',
  },
  {
    id: 'Night Sky - Tree',
    title: 'Night Sky - Tree',
  thumb: 'background/Night_Sky_-_Tree.jpeg',
  url: 'background/Night_Sky_-_Tree.jpeg',
  },
  {
    id: 'Photo of Starry Night',
    title: 'Photo of Starry Night',
  thumb: 'background/Photo_of_Starry_Night.jpeg',
  url: 'background/Photo_of_Starry_Night.jpeg',
  },
  {
    id: 'Skyline At Night - Hong Kong',
    title: 'Skyline At Night - Hong Kong',
  thumb: 'background/Skyline_At_Night_-_Hong_Kong.jpeg',
  url: 'background/Skyline_At_Night_-_Hong_Kong.jpeg',
  },
  {
    id: 'Slovenia',
    title: 'Slovenia',
  thumb: 'background/Slovenia.jpeg',
  url: 'background/Slovenia.jpeg',
  },
  {
    id: 'Water Beside Forest',
    title: 'Water Beside Forest',
  thumb: 'background/Water_Beside_Forest.jpeg',
  url: 'background/Water_Beside_Forest.jpeg',
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
