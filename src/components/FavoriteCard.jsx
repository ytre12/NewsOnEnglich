import Button from "./Button";

export default function FavoriteCard({
  title,
  date,
  openNewsPage,
  onRemoveFavorite,
}) {
  return (
    <section className="bg-[#FFFFFF] rounded-2xl px-6 py-6 max-w-[480px] min-[900px]:px-9 min-[900px]:py-9 min-[900px]:max-w-[520px]">
      <h1 className="text-[#195A94] font-semibold text-[24px] mb-2 mt-2 min-[750px]:text-[26px]">
        {title}
      </h1>
      <p className="text-[11px] text-[#747474] font-medium my-2 min-[750px]:text-[13px]">
        {date}
      </p>
      <div className="bg-[#747474] h-[1px] my-3 min-[900px]:h-[2px]"></div>
      <div className="flex justify-between items-center my-6">
        <Button title="Remove favorite" onClick={onRemoveFavorite} />
        <Button title="Open News" onClick={openNewsPage} />
      </div>
    </section>
  );
}
