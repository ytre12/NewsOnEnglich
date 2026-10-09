const DATA_URL =
  "https://raw.githubusercontent.com/ytre12/NewsOnEnglich/main/data/news.json";

async function getNews() {
  const data = fetch(DATA_URL);
  return (await data).json();
}

export default getNews;
