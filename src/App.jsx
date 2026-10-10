import { useState, useEffect } from "react";
import getNews from "./fetch";

import Header from "./components/Header";
import NewsCard from "./components/NewsCard";
import Button from "./components/Button";
import FullNews from "./components/FullNews";

function App() {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentNews, setCurrentNews] = useState(true);
  const [currentNewsId, setCurrentNewsId] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNews()
      .then(setData)
      .catch((error) => {
        console.error(error);
        setError(error.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const postsPerPage = 10;
  const totalPages = Math.ceil(data.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;

  const visibleNews = data?.slice(startIndex, startIndex + postsPerPage) ?? [];

  function openNewsPage(id, level) {
    setCurrentNews(false);
    setCurrentNewsId(id);
    setCurrentLevel(level);
  }

  function closeNewsPage() {
    setCurrentNews(true);
    setCurrentNewsId(1);
  }

  return (
    <>
      <Header />
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

      {!currentNews && (
        <FullNews
          data={data}
          id={currentNewsId}
          level={currentLevel}
          setLevel={setCurrentLevel}
          closeWindow={() => closeNewsPage()}
        />
      )}
      <div className="w-full mx-auto flex justify-center">
        <div className="grid min-[1100px]:grid-cols-2 mx-6 gap-6 min-[1000px]:gap-15 mt-6">
          {currentNews &&
            visibleNews.map((article) => (
              <NewsCard
                key={article.id}
                title={article.title}
                date={article.date}
                mainText={article.levels?.[1]?.content ?? ""}
                onLevelClick={(level) => openNewsPage(article.id, level)}
              />
            ))}
        </div>
      </div>
      {currentNews && (
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
    </>
  );
}

export default App;
