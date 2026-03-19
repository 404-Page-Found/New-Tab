/*
  backgrounds.js
  Exports a `backgrounds` array and an `initBackgrounds()` helper that
  generates thumbnail elements inside #bg-thumbnails and exposes a lookup
  used by the page script to apply backgrounds.
*/
// Convert to object map for faster lookup
const backgroundsMap = {
  'Beach - Australia': {
    title: 'Beach - Australia',
    thumb: 'background/thumbs/Beach_-_Australia.jpeg',
    url: 'background/Beach_-_Australia.jpeg',
  },
  'Canion Mountains on Night Sky': {
    title: 'Canion Mountains on Night Sky',
    thumb: 'background/thumbs/Canion_Mountains_on_Night_Sky.jpeg',
    url: 'background/Canion_Mountains_on_Night_Sky.jpeg',
  },
  'City - Shanghai': {
    title: 'City - Shanghai',
    thumb: 'background/thumbs/City_-_Shanghai.jpeg',
    url: 'background/City_-_Shanghai.jpeg',
  },
  'Close-up Photo of Glowing Blue Butterflies': {
    title: 'Close-up Photo of Glowing Blue Butterflies',
    thumb: 'background/thumbs/Close-up_Photo_of_Glowing_Blue_Butterflies.jpeg',
    url: 'background/Close-up_Photo_of_Glowing_Blue_Butterflies.jpeg',
  },
  'Desert during Nighttime': {
    title: 'Desert during Nighttime',
    thumb: 'background/thumbs/Desert_during_Nighttime.jpeg',
    url: 'background/Desert_during_Nighttime.jpeg',
  },
  'Dubai - United Arab Emirates': {
    title: 'Dubai - United Arab Emirates',
    thumb: 'background/thumbs/Dubai_-_United_Arab_Emirates.jpeg',
    url: 'background/Dubai_-_United_Arab_Emirates.jpeg',
  },
  'Flower Field Under Pink Sky': {
    title: 'Flower Field Under Pink Sky',
    thumb: 'background/thumbs/Flower_Field_Under_Pink_Sky.jpeg',
    url: 'background/Flower_Field_Under_Pink_Sky.jpeg',
  },
  'Full Moon': {
    title: 'Full Moon',
    thumb: 'background/thumbs/Full_Moon.jpeg',
    url: 'background/Full_Moon.jpeg',
  },
  'High-rise Buildings During Nighttime': {
    title: 'High-rise Buildings During Nighttime',
    thumb: 'background/thumbs/High-rise_Buildings_During_Nighttime.jpeg',
    url: 'background/High-rise_Buildings_During_Nighttime.jpeg',
  },
  'Huangshan - Anhui': {
    title: 'Huangshan - Anhui',
    thumb: 'background/thumbs/Huangshan_-_Anhui.jpeg',
    url: 'background/Huangshan_-_Anhui.jpeg',
  },
  'Mountain Covered Snow Under Star': {
    title: 'Mountain Covered Snow Under Star',
    thumb: 'background/thumbs/Mountain_Covered_Snow_Under_Star.jpeg',
    url: 'background/Mountain_Covered_Snow_Under_Star.jpeg',
  },
  'Mountain Covered With Snow during Nighttime': {
    title: 'Mountain Covered With Snow during Nighttime',
    thumb: 'background/thumbs/Mountain_Covered_With_Snow_during_Nighttime.jpeg',
    url: 'background/Mountain_Covered_With_Snow_during_Nighttime.jpeg',
  },
  'Night Sky - Mountain Peak': {
    title: 'Night Sky - Mountain Peak',
    thumb: 'background/thumbs/Night_Sky_-_Mountain_Peak.jpeg',
    url: 'background/Night_Sky_-_Mountain_Peak.jpeg',
  },
  'Night Sky - Tree': {
    title: 'Night Sky - Tree',
    thumb: 'background/thumbs/Night_Sky_-_Tree.jpeg',
    url: 'background/Night_Sky_-_Tree.jpeg',
  },
  'Autumn leaves (Pexels)': {
    title: 'Autumn leaves (Pexels)',
    thumb: 'background/thumbs/Pexels_autumn_leaves_34484989.jpeg',
    url: 'background/Pexels_autumn_leaves_34484989.jpeg',
  },
  'City skyline (Pexels)': {
    title: 'City skyline (Pexels)',
    thumb: 'background/thumbs/Pexels_city_skyline_35720257.jpeg',
    url: 'background/Pexels_city_skyline_35720257.jpeg',
  },
  'Desert sand (Pexels)': {
    title: 'Desert sand (Pexels)',
    thumb: 'background/thumbs/Pexels_desert_sand_33935832.jpeg',
    url: 'background/Pexels_desert_sand_33935832.jpeg',
  },
  'Forest trees (Pexels)': {
    title: 'Forest trees (Pexels)',
    thumb: 'background/thumbs/Pexels_forest_trees_18979363.jpeg',
    url: 'background/Pexels_forest_trees_18979363.jpeg',
  },
  'Mountains sunset (Pexels)': {
    title: 'Mountains sunset (Pexels)',
    thumb: 'background/thumbs/Pexels_mountains_sunset_36491955.jpeg',
    url: 'background/Pexels_mountains_sunset_36491955.jpeg',
  },
  'Nature landscape (Pexels)': {
    title: 'Nature landscape (Pexels)',
    thumb: 'background/thumbs/Pexels_nature_landscape_36146953.jpeg',
    url: 'background/Pexels_nature_landscape_36146953.jpeg',
  },
  'Northern lights (Pexels)': {
    title: 'Northern lights (Pexels)',
    thumb: 'background/thumbs/Pexels_northern_lights_16747790.jpeg',
    url: 'background/Pexels_northern_lights_16747790.jpeg',
  },
  'Ocean beach (Pexels)': {
    title: 'Ocean beach (Pexels)',
    thumb: 'background/thumbs/Pexels_ocean_beach_30363420.jpeg',
    url: 'background/Pexels_ocean_beach_30363420.jpeg',
  },
  'Starry night sky (Pexels)': {
    title: 'Starry night sky (Pexels)',
    thumb: 'background/thumbs/Pexels_starry_night_sky_34048431.jpeg',
    url: 'background/Pexels_starry_night_sky_34048431.jpeg',
  },
  'Waterfall (Pexels)': {
    title: 'Waterfall (Pexels)',
    thumb: 'background/thumbs/Pexels_waterfall_21624064.jpeg',
    url: 'background/Pexels_waterfall_21624064.jpeg',
  },
  'Photo of Starry Night': {
    title: 'Photo of Starry Night',
    thumb: 'background/thumbs/Photo_of_Starry_Night.jpeg',
    url: 'background/Photo_of_Starry_Night.jpeg',
  },
  'Skyline At Night - Hong Kong': {
    title: 'Skyline At Night - Hong Kong',
    thumb: 'background/thumbs/Skyline_At_Night_-_Hong_Kong.jpeg',
    url: 'background/Skyline_At_Night_-_Hong_Kong.jpeg',
  },
  'Slovenia': {
    title: 'Slovenia',
    thumb: 'background/thumbs/Slovenia.jpeg',
    url: 'background/Slovenia.jpeg',
  },
  'Water Beside Forest': {
    title: 'Water Beside Forest',
    thumb: 'background/thumbs/Water_Beside_Forest.jpeg',
    url: 'background/Water_Beside_Forest.jpeg',
  },
};



// Convert map to array when needed
const backgrounds = Object.keys(backgroundsMap).map(id => ({ id, ...backgroundsMap[id] }));

function initBackgrounds() {
  const container = document.getElementById('bg-thumbnails');
  if (!container) return;
  container.innerHTML = '';
  backgrounds.forEach((bg) => {
    const img = document.createElement('img');
    img.className = 'bg-thumb';
    img.setAttribute('data-bg', bg.id);
    img.src = bg.thumb;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.title = bg.title;
    img.alt = bg.title;
    container.appendChild(img);
  });
}

function findBackgroundUrlById(id) {
  return backgroundsMap[id] ? backgroundsMap[id].url : null;
}



// Expose for other scripts (non-module global)
window._backgrounds = backgrounds;
window._initBackgrounds = initBackgrounds;
window._findBackgroundUrlById = findBackgroundUrlById;
