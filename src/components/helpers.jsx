// src/utils/helpers.js

export const colorMappings = {
    mood: {
      Happy: "bg-yellow-400",
      Tired: "bg-gray-400",
      Relaxed: "bg-green-400",
      Sad: "bg-blue-400",
      Excited: "bg-red-400",
      Anxious: "bg-orange-400",
    },
    condition: {
      Dry: "bg-blue-400",
      Oily: "bg-yellow-500",
      Acne: "bg-red-500",
      Normal: "bg-green-400",
    },
    products: {
      Cleanser: "bg-teal-400",
      Serum: "bg-purple-400",
      Moisturizer: "bg-pink-400",
      Toner: "bg-indigo-400",
      Sunscreen: "bg-orange-300",
      "Hydrating Serum": "bg-blue-300",
      "Face Wash": "bg-lime-300",
      "Exfoliating Scrub": "bg-rose-300",
      "anti-aging cream": "bg-emerald-300",
      "vitamin c serum": "bg-cyan-300",
      "retinol cream": "bg-violet-300",
      "eye cream": "bg-fuchsia-300",
      "no products": "bg-gray-500",
      Other: "bg-gray-200",
    },
    timeUnit: {
      days: "bg-gray-300",
      weeks: "bg-green-300",
      months: "bg-blue-300",
    },
  };
  
  export const renderRadio = (field, options, colorMapping, form, handleChange) => (
    <div className="mb-4">
      <label className="block font-semibold capitalize mb-1">{field}</label>
      <div className="flex gap-2 flex-wrap">
        {options.map((val) => (
          <label
            key={val}
            className={`px-3 py-1 rounded-full cursor-pointer border font-medium transition ${
              form[field] === val ? `${colorMapping[val]} text-white` : "bg-gray-100"
            }`}
          >
            <input
              type="radio"
              name={field}
              value={val}
              onChange={() => handleChange(field, val)}
              className="hidden"
            />
            {val}
          </label>
        ))}
      </div>
    </div>
  );
  