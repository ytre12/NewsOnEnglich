import Button from "./Button";

export default function FullNews({ data, id, closeWindow, level, setLevel }) {
  const article = data.find((item) => item.id === id);

  if (!article) {
    return <p>News not found</p>;
  }

  return (
    <div className="my-[30px] mx-[28px] flex justify-center">
      <section className="bg-[#FFFFFF] rounded-2xl px-6 py-6 max-w-[750px]">
        <h1 className="text-[#195A94] font-semibold text-[26px] mb-3 min-[750px]:text-[28px]">
          {article.title}
        </h1>
        <div className="h-[1px] w-full bg-[#747474]"></div>
        <div className="flex justify-between items-center">
          <p className="text-[11px] text-[#747474] font-medium my-5 min-[750px]:text-[13px]">
            {article.date}
          </p>
          <h3 className="text-[#195A94] font-semibold text-[18px] min-[750px]:text-[20px]">
            Level {level}
          </h3>
        </div>
        <p className="text-justify text-[#747474] text-[15px] mb-8 min-[750px]:text-[17px]">
          {article.levels[level].content}
        </p>
        <div className="text-justify text-[#747474] text-[15px] mb-5 min-[750px]:text-[17px]">
          <span className="inline-block text-[#195A94] font-bold text-[14px] pr-2 min-[750px]:text-[17px]">
            Words:
          </span>

          <span
            dangerouslySetInnerHTML={{
              __html: article.levels?.[level]?.words ?? "",
            }}
          />
        </div>
        <div className="flex gap-2 justify-end mt-5 mb-9">
          <Button title={"Level"} level={1} onClick={() => setLevel(1)} />
          <Button title={"Level"} level={2} onClick={() => setLevel(2)} />
          <Button title={"Level"} level={3} onClick={() => setLevel(3)} />
        </div>
        <Button onClick={() => closeWindow()} title={"< Back to Menu"} />
      </section>
    </div>
  );
}
