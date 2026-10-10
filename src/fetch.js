const DATA_URL =
  "https://raw.githubusercontent.com/ytre12/NewsOnEnglich/main/data/news.json";

async function getNews() {
  const response = await fetch(DATA_URL);

  if (!response.ok) {
    throw new Error(`Loading error: ${response.status}`);
  }

  return response.json();
}

export default getNews;
