import Button from "./Button";

export default function NewsCard({ title, date, onLevelClick, mainText = "" }) {
  return (
    <div className="bg-[#FFFFFF] rounded-2xl px-6 py-6 max-w-[480px] min-[900px]:px-9 min-[900px]:py-9 min-[900px]:max-w-[520px]">
      <h1 className="text-[#195A94] font-semibold text-[24px] mb-2 mt-2 min-[750px]:text-[26px]">
        {title}
      </h1>
      <div className="h-[1px] w-full bg-[#747474]"></div>
      <p className="text-[11px] text-[#747474] font-medium my-2 min-[750px]:text-[13px]">
        {date}
      </p>
      <p className="text-justify text-[#747474] text-[15px] min-[750px]:text-[17px]">
        {mainText.slice(0, 200)}
        {"..."}
      </p>
      <div className="flex gap-2 justify-end mt-7">
        <Button
          title={"Level"}
          level={1}
          onClick={() => {
            onLevelClick(1);
          }}
        />
        <Button
          title={"Level"}
          level={2}
          onClick={() => {
            onLevelClick(2);
          }}
        />
        <Button
          title={"Level"}
          level={3}
          onClick={() => {
            onLevelClick(3);
          }}
        />
      </div>
    </div>
  );
}
