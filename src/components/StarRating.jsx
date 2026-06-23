import React from "react";

export default function StarRating({ value, onChange, readonly = false, size = "md" }) {
  const sizes = { sm: "text-base", md: "text-xl", lg: "text-2xl" };
  return (
    <div className={`flex gap-0.5 ${sizes[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange && onChange(star)}
          className={`transition-all ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
        >
          <span className={value >= star ? "text-[#F97316]" : "text-gray-200"}>★</span>
        </button>
      ))}
    </div>
  );
}