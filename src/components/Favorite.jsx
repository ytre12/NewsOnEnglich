import FavoriteCard from "./FavoriteCard";

export default function Favorite({
  articles,
  favorites,
  removeFavorite,
  openNewsPage,
}) {
  const newsToRender = articles.filter((article) =>
    favorites.includes(article.id),
  );

  return (
    <section>
      <div className="flex justify-around mb-4 bg-white mx-6 rounded-2xl py-2">
        <h2 className="text-[18px] font-medium text-[#195A94]">Favorite</h2>
      </div>
      {newsToRender.length === 0 && (
        <p className="text-center my-6 text-[#195A94]">
          No favorite articles yet.
        </p>
      )}
      {/* <div className="bg-[#747474] h-[1px] my-3 min-[900px]:h-[2px]"></div> */}
      <div className="w-full mx-auto flex justify-center">
        <div className="grid min-[1100px]:grid-cols-2 mx-6 gap-6 min-[1000px]:gap-15">
          {newsToRender.map((article) => (
            <FavoriteCard
              key={article.id}
              title={article.title}
              date={article.date}
              onRemoveFavorite={() => removeFavorite(article.id)}
              openNewsPage={() => openNewsPage(article.id, 1)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
