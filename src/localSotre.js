const FAVORITES_KEY = "favorite";

function readList(key) {
  try {
    const value = localStorage.getItem(key);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeToStorage(key, items) {
  localStorage.setItem(key, JSON.stringify(items));
}

export function getFavorites() {
  return readList(FAVORITES_KEY);
}

export function removeFavoriteItem(id) {
  const updated = getFavorites().filter((savedId) => savedId !== id);

  writeToStorage(FAVORITES_KEY, updated);
  return updated;
}

export function toggleFavorite(id) {
  const favorites = getFavorites();

  const updated = favorites.includes(id)
    ? favorites.filter((savedId) => savedId !== id)
    : [...favorites, id];

  writeToStorage(FAVORITES_KEY, updated);
  return updated;
}
