import { useState, useEffect } from "react";
import axios from "../api/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Weather from "../components/Weather";
import { motion } from "framer-motion";

const emojiMappings = {
  mood: {
    Happy: "😊",
    Tired: "😴",
    Relaxed: "😌",
    Sad: "😢",
    Excited: "🤩",
    Anxious: "😰",
  },
  condition: {
    Dry: "💧",
    Oily: "🛢️",
    Acne: "😬",
    Normal: "👌",
  },
  products: {
    Cleanser: "🧼",
    Serum: "💧",
    Moisturizer: "🧴",
    Toner: "🧪",
    Sunscreen: "🌞",
    "Hydrating Serum": "🚿",
    "Face Wash": "🫧",
    "Exfoliating Scrub": "🧂",
    "anti-aging cream": "🕰️",
    "vitamin c serum": "🍊",
    "retinol cream": "🧪",
    "eye cream": "👁️",
    "no products": "🚫",
    Other: "➕",
  },
};


const colorMappings = {
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

const renderRadio = (field, options, colorMapping, form, handleChange, labelText) => (
  <div className="mb-4">
    <label className="block font-semibold mb-1 text-sm">{labelText || field}</label>
    <div className="flex gap-2 flex-wrap">
      {options.map((val) => (
        <label
          key={val}
          className={`px-3 py-1 rounded-full cursor-pointer border font-medium transition flex items-center gap-1 ${
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
          <span>{emojiMappings[field]?.[val]}</span>
          <span>{val}</span>
        </label>
      ))}
    </div>
  </div>
);


export default function Tracker() {
  const [data, setData] = useState([]);
  const [index, setIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const userId = "user123";

  const [form, setForm] = useState({
    mood: "",
    condition: "",
    products: "",
    customProduct: "",
    progress: 1,
    timeUnit: "days",
  });

  useEffect(() => {
    axios.get(`/tracker/${userId}`).then((res) => setData(res.data));
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProgressChange = (type) => {
    setForm((prev) => ({
      ...prev,
      progress: type === "increase" ? prev.progress + 1 : Math.max(1, prev.progress - 1),
    }));
  };

  const fetchBeautyTips = async () => {
    try {
      const res = await axios.post(`/beautyTips/${userId}`, {
        mood: form.mood,
        condition: form.condition,
        products: form.products === "Other" ? form.customProduct : form.products,
        progress: `${form.progress} ${form.timeUnit}`,
      });
      return res.data.beautyTips;
    } catch (err) {
      console.error("[CLIENT] Error fetching tips:", err);
      return "Could not generate tips at the moment.";
    }
  };

  const updateTracker = async () => {
    const duration = `${form.progress} ${form.timeUnit}`;
    const selectedProduct =
      form.products === "Other" && form.customProduct.trim()
        ? form.customProduct
        : form.products;

    try {
      const tips = await fetchBeautyTips();
      const payload = {
        mood: form.mood,
        condition: form.condition,
        products: selectedProduct,
        progress: duration,
        beautyTips: tips,
      };

      let res;
      if (isEditing) {
        res = await axios.put(`/tracker/${userId}/${data[index]._id}`, payload);
        toast.success("Progress updated!");
      } else {
        res = await axios.post(`/tracker/${userId}`, payload);
        toast.success("Progress saved!");
      }

      const updated = isEditing
        ? data.map((entry) => (entry._id === data[index]._id ? res.data : entry))
        : [...data, res.data];

      setData(updated);
      setIndex(updated.length - 1);
      resetForm();
    } catch (err) {
      toast.error("Failed to save progress.");
      console.error(err);
    }
  };

  const deleteEntry = async (id) => {
    try {
      await axios.delete(`/tracker/${userId}/${id}`);
      toast.warn("Entry deleted.");
      const updated = data.filter((entry) => entry._id !== id);
      setData(updated);
      setIndex((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      toast.error("Failed to delete entry.");
      console.error(err);
    }
  };

  const handleEdit = (entry) => {
    setForm({
      mood: entry.mood,
      condition: entry.condition,
      products: entry.products,
      customProduct:
        entry.products && !Object.keys(colorMappings.products).includes(entry.products)
          ? entry.products
          : "",
      progress: parseInt(entry.progress.split(" ")[0]),
      timeUnit: entry.progress.split(" ")[1],
    });
    setIsEditing(true);
    setIndex(data.indexOf(entry));
  };

  const resetForm = () => {
    setForm({
      mood: "",
      condition: "",
      products: "",
      customProduct: "",
      progress: 1,
      timeUnit: "days",
    });
    setIsEditing(false);
  };

  const current = data[index] || {};

  return (
    <div className="p-6 max-w-full mx-auto bg-gradient-to-br from-pink-50 via-rose-100 to-pink-200 min-h-screen">
      <ToastContainer />
      <h2 className="text-2xl font-bold text-center text-pink-600 mb-2">💖 Beauty Tracker</h2>
      <p className="text-center text-gray-600 mb-4">✨ Track Your Beauty Journey ✨</p>

      <div className="flex justify-center mb-6">
        <Weather location="" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 w-full p-4 md:p-6 rounded-xl shadow text-sm bg-white/30 backdrop-blur-lg border border-white/50">
          {renderRadio("mood", Object.keys(colorMappings.mood), colorMappings.mood, form, handleChange, "what's your mood Today?")}
          {renderRadio("condition", Object.keys(colorMappings.condition), colorMappings.condition, form, handleChange)}
          {renderRadio("products", Object.keys(colorMappings.products), colorMappings.products, form, handleChange)}

          {form.products === "Other" && (
            <div className="mb-4">
              <label className="block font-semibold mb-1">📝 Specify Product</label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                placeholder="Enter product details"
                value={form.customProduct}
                onChange={(e) => handleChange("customProduct", e.target.value)}
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block font-semibold mb-1">📊 Progress</label>
            <div className="flex items-center gap-2">
              <button onClick={() => handleProgressChange("decrease")} className="bg-gray-300 p-2 rounded-full text-xs">➖</button>
              <span className="px-4">{form.progress}</span>
              <button onClick={() => handleProgressChange("increase")} className="bg-gray-300 p-2 rounded-full text-xs">➕</button>
            </div>
          </div>

          {renderRadio("timeUnit", Object.keys(colorMappings.timeUnit), colorMappings.timeUnit, form, handleChange)}

          <button
            onClick={updateTracker}
            className="w-full mt-4 bg-pink-500 hover:bg-pink-600 text-white py-2 rounded text-sm"
          >
            {isEditing ? "💾 Update Progress" : "✨ Submit Progress"}
          </button>
        </div>

        {data.length > 0 && (
          <div className="lg:col-span-1 w-full p-4 md:p-6 rounded-xl shadow flex flex-col justify-between text-sm bg-pink-100/30 backdrop-blur-lg border border-pink-200/50">
            <div>
              <h3 className="text-lg font-bold mb-2">
                Tip {index + 1} — <span className="text-sm text-gray-600">📅 {new Date(current.createdAt).toLocaleDateString()}</span>
              </h3>
              <p><strong>Mood:</strong> {current.mood}</p>
              <p><strong>Skin Condition:</strong> {current.condition}</p>
              <p><strong>Products Used:</strong> {current.products}</p>
              <p><strong>Progress:</strong> {current.progress}</p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative p-6 bg-white/40 mt-6 backdrop-blur-lg border border-white/30 rounded-2xl shadow"
            >
            <div className="max-h-48 overflow-y-auto pr-2">
              <img
                src="/beauty-avatar.png"
                alt="Beautician"
                className="float-right w-20 h-20 lg:w-24 lg:h-24 rounded-full border-4 border-pink-200 shadow-md ml-4 mb-2"
              />
              <p className="text-gray-800 text-sm italic whitespace-pre-line">
                {current.beautyTips}
              </p>
            </div>


            </motion.div>

            <div className="mt-4 flex flex-col gap-2">
              <div className="flex justify-between gap-2">
                <button onClick={() => setIndex((i) => Math.max(i - 1, 0))} disabled={index === 0} className="flex-1 bg-gray-300 py-1 rounded disabled:opacity-50 text-xs">⬅️ Previous</button>
                <button onClick={() => deleteEntry(current._id)} className="flex-1 bg-red-400 text-white py-1 rounded text-xs">🗑️ Delete</button>
                <button onClick={() => setIndex((i) => Math.min(i + 1, data.length - 1))} disabled={index === data.length - 1} className="flex-1 bg-gray-300 py-1 rounded disabled:opacity-50 text-xs">Next ➡️</button>
                <button onClick={() => handleEdit(current)} className="flex-1 bg-yellow-400 text-white py-1 rounded text-xs">✏️ Edit</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
