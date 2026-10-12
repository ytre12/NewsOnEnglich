const FAVORITES_KEY = "favorite";
const HISTORY_KEY = "history";

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

export function getHistory() {
  return readList(HISTORY_KEY);
}

export function removeFavoriteItem(id) {
  const updated = getFavorites().filter((savedId) => savedId !== id);

  writeToStorage(FAVORITES_KEY, updated);
  return updated;
}

export function removeHistoryItem(id) {
  const updated = getHistory().filter((savedId) => savedId !== id);

  writeToStorage(HISTORY_KEY, updated);
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

export function addHistoryItem(id) {
  const history = getHistory();

  const updated = [id, ...history.filter((savedId) => savedId !== id)].slice(
    0,
    20,
  );

  writeToStorage(HISTORY_KEY, updated);
  return updated;
}
