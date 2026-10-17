import { useState, useEffect } from "react";
import getNews from "./fetch";
import { getFavorites, toggleFavorite, removeFavoriteItem } from "./localSotre";

import Header from "./components/Header";
import NewsCard from "./components/NewsCard";
import Button from "./components/Button";
import FullNews from "./components/FullNews";
import Favorite from "./components/Favorite";

function getTodayKey() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();

  return `${day}-${month}-${year}`;
}

function App() {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentNews, setCurrentNews] = useState(true);
  const [currentNewsId, setCurrentNewsId] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(getFavorites);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState(false);
  const [todayKey] = useState(getTodayKey);

  useEffect(() => {
    getNews()
      .then(setData)
      .catch((error) => {
        console.error(error);
        setError(error.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const articlesWithWords = data.filter(
    (article) =>
      typeof article.levels?.["1"]?.words === "string" &&
      article.levels["1"].words.trim(),
  );

  const todayNews = articlesWithWords.filter(
    (article) =>
      typeof article.date === "string" && article.date.startsWith(todayKey),
  );
  const newsToShow = today ? todayNews : articlesWithWords;

  const postsPerPage = 10;
  const totalPages = Math.ceil(newsToShow.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;

  const visibleNews = newsToShow.slice(
    startIndex,
    startIndex + postsPerPage,
  );

  function openNewsPage(id, level) {
    setCurrentNews(false);
    setCurrentNewsId(id);
    setCurrentLevel(level);
  }

  function closeNewsPage() {
    setCurrentNews(true);
    setCurrentNewsId(1);
  }

  function openFavoritePage() {
    setMenuIsOpen(true);
    setCurrentNews(true);
  }

  function closeFavoritePage() {
    setMenuIsOpen(false);
    setCurrentNews(true);
  }

  function handleToggleFavorite(id) {
    setFavoriteIds(toggleFavorite(id));
  }

  function handleRemoveFavorite(id) {
    setFavoriteIds(removeFavoriteItem(id));
  }

  function toggleTodayNews() {
    setToday((current) => !current);
    setCurrentPage(1);
  }

  return (
    <>
      <Header
        openFavorite={openFavoritePage}
        closeFavorite={closeFavoritePage}
        menuIsOpen={menuIsOpen}
        todayNews={today}
        toggleToday={toggleTodayNews}
      />

      {loading && (
        <div className="flex justify-center p-8 font-semibold">
          <p>Loading ...</p>
        </div>
      )}

      {error && (
        <div className="flex justify-center p-8 font-semibold">
          <p>{error}</p>
        </div>
      )}

      {currentNews && menuIsOpen && !loading && !error && (
        <Favorite
          articles={articlesWithWords}
          favorites={favoriteIds}
          removeFavorite={handleRemoveFavorite}
          openNewsPage={openNewsPage}
        />
      )}

      {!currentNews && (
        <FullNews
          data={data}
          id={currentNewsId}
          level={currentLevel}
          setLevel={setCurrentLevel}
          addToFavorite={handleToggleFavorite}
          isFavorite={favoriteIds.includes(currentNewsId)}
          closeWindow={() => closeNewsPage()}
        />
      )}

      <div className="w-full mx-auto flex justify-center">
        <div className="grid min-[1100px]:grid-cols-2 mx-6 gap-6 min-[1000px]:gap-15">
          {currentNews &&
            !menuIsOpen &&
            visibleNews.map((article) => (
              <NewsCard
                key={article.id}
                title={article.title}
                date={article.date}
                mainText={article.levels?.[1]?.content ?? ""}
                levels={Object.keys(article.levels ?? {}).filter(
                  (level) =>
                    typeof article.levels[level]?.words === "string" &&
                    article.levels[level].words.trim(),
                )}
                onLevelClick={(level) => openNewsPage(article.id, level)}
              />
            ))}
        </div>
      </div>
      {currentNews && !menuIsOpen && (
        <div className="flex justify-center gap-3 mb-12 mt-8">
          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;

            return (
              <Button
                title={" " + pageNumber + " "}
                level={false}
                style={`w-10 h-10 flex justify-center ${
                  pageNumber === currentPage ? "scale-85" : ""
                } `}
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
              />
            );
          })}
        </div>
      )}
      {currentNews && !menuIsOpen && today && todayNews.length === 0 && !loading && (
        <p className="text-center p-8">No news published today.</p>
      )}
    </>
  );
}

export default App;
