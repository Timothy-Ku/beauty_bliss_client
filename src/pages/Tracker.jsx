import { useState, useEffect } from "react";
import axios from "../api/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Weather from "../components/Weather";

const colorMappings = {
  mood: {
    Happy: "bg-pink-300",
    Tired: "bg-gray-300",
    Relaxed: "bg-teal-300",
    Sad: "bg-blue-300",
    Excited: "bg-yellow-300",
    Anxious: "bg-orange-300",
  },
  condition: {
    Dry: "bg-blue-200",
    Oily: "bg-yellow-300",
    Acne: "bg-red-300",
    Normal: "bg-green-300",
  },
  products: {
    Cleanser: "bg-teal-200",
    Serum: "bg-purple-200",
    Moisturizer: "bg-pink-200",
    Toner: "bg-indigo-200",
    Sunscreen: "bg-orange-200",
    Other: "bg-gray-200",
  },
  timeUnit: {
    days: "bg-gray-100",
    weeks: "bg-green-100",
    months: "bg-blue-100",
  },
};

const renderRadio = (field, options, colorMapping, form, handleChange, label) => (
  <div className="mb-4">
    <label className="block font-semibold text-lg text-gray-700 mb-1">{label}</label>
    <div className="flex gap-2 flex-wrap">
      {options.map((val) => (
        <label
          key={val}
          className={`px-4 py-2 rounded-full cursor-pointer border font-medium transition ${
            form[field] === val ? `${colorMapping[val]} text-white` : "bg-gray-200"
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
    <div className="p-6 max-w-6xl mx-auto flex justify-between items-start">
        
      <ToastContainer />
      {/* Left column: Input Form */}
      <div className="w-full lg:w-3/4 my:20px p-6 bg-white rounded-3xl shadow-xl border border-pink-100">
        <h3 className="text-2xl font-semibold mb-6 text-pink-500">Your Beauty Journey</h3>
        

        {renderRadio("mood", Object.keys(colorMappings.mood), colorMappings.mood, form, handleChange, "💖 What is your mood today?")}
        {renderRadio("condition", Object.keys(colorMappings.condition), colorMappings.condition, form, handleChange, "🌸 What is your skin condition today?")}
        {renderRadio("products", Object.keys(colorMappings.products), colorMappings.products, form, handleChange, "Products used")}

        {form.products === "Other" && (
          <div className="mb-4">
            <label className="block font-semibold mb-1">Specify Product</label>
            <input
              type="text"
              className="w-full border p-2 rounded-xl"
              placeholder="Enter product details"
              value={form.customProduct}
              onChange={(e) => handleChange("customProduct", e.target.value)}
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block font-semibold mb-1">How long have you used the product?</label>
          <div className="flex items-center gap-2">
            <button onClick={() => handleProgressChange("decrease")} className="bg-gray-200 p-2 rounded-full">-</button>
            <span className="px-4">{form.progress}</span>
            <button onClick={() => handleProgressChange("increase")} className="bg-gray-200 p-2 rounded-full">+</button>
          </div>
        </div>

        {renderRadio("timeUnit", Object.keys(colorMappings.timeUnit), colorMappings.timeUnit, form, handleChange, "Duration")}

        <button
          onClick={updateTracker}
          className="w-full mt-4 bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-2xl"
        >
          {isEditing ? "Update Progress" : "Submit Progress"}
        </button>
      </div>

      {/* Right column: Beauty Tips */}
      <div className="w-full ml-6 lg:w-1/3 bg-pink-50 p-6 rounded-2xl shadow-xl border border-pink-100 flex flex-col justify-between">
        <h3 className="text-xl font-bold mb-2">
          Tip {index + 1} —{" "}
          <span className="text-sm text-gray-600">
            Date {new Date(current.createdAt).toLocaleDateString()}
          </span>
        </h3>
        <p><strong>Mood:</strong> {current.mood}</p>
        <p><strong>Skin Condition:</strong> {current.condition}</p>
        <p><strong>Products Used:</strong> {current.products}</p>
        <p><strong>Duration:</strong> {current.progress}</p>

        <div className="w-full bg-white mt-4 p-4 rounded-xl shadow overflow-y-auto max-h-[300px]">
          <h3 className="text-xl font-semibold mb-2 text-pink-600">Personalized Beauty Tips</h3>
          {current.beautyTips ? (
            <p className="text-sm text-gray-700 whitespace-pre-line">{current.beautyTips}</p>
          ) : (
            <p className="text-sm text-gray-500">No tips available for this entry.</p>
          )}
        </div>

        <div className="mt-4">
            <Weather />
            </div>


        <div className="mt-6 space-y-2">
          <div className="flex justify-between gap-2">
          <button
                onClick={() => setIndex((i) => Math.max(i - 1, 0))}
                disabled={index === 0}
                className="flex-1 bg-gray-200 py-1 px-4 rounded-xl disabled:opacity-50 text-xs"
                >
                <span className="text-sm">⬅️</span> Previous
                </button>
                <button
                onClick={() => deleteEntry(current._id)}
                className="flex-1 bg-red-400 text-white py-1 px-4 rounded-xl text-xs"
                >
                <span className="text-sm">🗑️</span> Delete
                </button>
                <button
                onClick={() => setIndex((i) => Math.min(i + 1, data.length - 1))}
                disabled={index === data.length - 1}
                className="flex-1 bg-gray-200 py-1 px-4 rounded-xl disabled:opacity-50 text-xs"
                >
                Next <span className="text-sm">➡️</span>
                </button>
                <button
                onClick={() => handleEdit(current)}
                className="flex-1 bg-yellow-300 text-white py-1 px-4 rounded-xl text-xs"
                >
                <span className="text-sm">✏️</span> Edit
                </button>
  
          </div>
        </div>
      </div>
    </div>
  );
}
