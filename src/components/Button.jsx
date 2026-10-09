export default function Button({ title, level, onClick, style = "" }) {
  return (
    <button
      onClick={onClick}
      className={`${style}bg-[#195A94] rounded-xl px-2 py-2 text-[14px] font-bold text-white flex justify-between items-center gap-1 hover:scale-105 active:scale-90`}
    >
      {title}
      {level && (
        <div className="text-[17px] bg-white text-[#195A94] h-6 w-6 rounded-2xl">
          {level}
        </div>
      )}
    </button>
  );
}
