const date = new Date();

const formattedDate = `${String(date.getDate()).padStart(2, "0")} - ${date.toLocaleDateString(
  "en-US",
  { month: "short" },
)} - ${date.getFullYear()}`;

export default function Header() {
  return (
    <header className="my-[30px] mx-[28px] min-[700px]:mx-[70px] min-[700px]:my-[60px] min-[1250px]:mx-[100px] ">
      <h1 className="text-[#195A94] font-extrabold text-[30px] leading-[33px] min-[750px]:text-[36px]">
        NEWS in English by Levels
      </h1>
      <p className="text-[#1D1D1B] font-medium text-[18px] my-2 min-[700px]:text-[22px]">
        {formattedDate}
      </p>
      <div className="bg-[#747474] h-[1px] my-3 min-[900px]:h-[2px]"></div>
    </header>
  );
}
