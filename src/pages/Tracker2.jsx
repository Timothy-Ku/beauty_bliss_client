import { useState, useEffect } from "react";
import axios from "../api/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Weather from "../components/Weather";

// Color mappings
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
    "Other": "bg-gray-200",
  },
  timeUnit: {
    days: "bg-gray-300",
    weeks: "bg-green-300",
    months: "bg-blue-300",
  },
};

// Reusable radio button renderer
const renderRadio = (field, options, colorMapping, form, handleChange) => (
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

  // Fetch all tracker entries on load
  useEffect(() => {
    axios.get(`/tracker/${userId}`).then((res) => setData(res.data));
  }, []);

  // Form field update
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Progress counter
  const handleProgressChange = (type) => {
    setForm((prev) => ({
      ...prev,
      progress: type === "increase" ? prev.progress + 1 : Math.max(1, prev.progress - 1),
    }));
  };

  // Fetch AI beauty tips
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

  // Submit or update progress entry
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

  // Delete an entry
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

  // Edit mode
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
    <div className="p-4 max-w-7xl mx-auto">
      <ToastContainer />
      <h2 className="text-3xl font-bold text-center text-pink-600 mb-6">Beauty Tracker</h2>

      <div className="flex justify-center">
        <Weather location="" />
      </div>

      <div className="flex flex-col md:flex-row gap-6 mt-6">
        {/* Form Section */}
        <div className="w-full md:w-1/2 bg-white p-6 rounded shadow">
          {renderRadio("mood", Object.keys(colorMappings.mood), colorMappings.mood, form, handleChange)}
          {renderRadio("condition", Object.keys(colorMappings.condition), colorMappings.condition, form, handleChange)}
          {renderRadio("products", Object.keys(colorMappings.products), colorMappings.products, form, handleChange)}

          {form.products === "Other" && (
            <div className="mb-4">
              <label className="block font-semibold mb-1">Specify Product</label>
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
            <label className="block font-semibold mb-1">Progress</label>
            <div className="flex items-center gap-2">
              <button onClick={() => handleProgressChange("decrease")} className="bg-gray-300 p-2 rounded-full">-</button>
              <span className="px-4">{form.progress}</span>
              <button onClick={() => handleProgressChange("increase")} className="bg-gray-300 p-2 rounded-full">+</button>
            </div>
          </div>

          {renderRadio("timeUnit", Object.keys(colorMappings.timeUnit), colorMappings.timeUnit, form, handleChange)}

          <button
            onClick={updateTracker}
            className="w-full mt-4 bg-pink-500 hover:bg-pink-600 text-white py-2 rounded"
          >
            {isEditing ? "Update Progress" : "Submit Progress"}
          </button>
        </div>

        {/* Tracker Card */}
        {data.length > 0 && (
          <div className="w-full md:w-1/2 bg-pink-50 p-6 rounded shadow flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">
                Tip {index + 1} —{" "}
               <div></div> <span className="text-sm text-gray-600">
                  Date {new Date(current.createdAt).toLocaleDateString()}
                </span>
              </h3>
              <p><strong>Mood:</strong> {current.mood}</p>
              <p><strong>Skin Condition:</strong> {current.condition}</p>
              <p><strong>Products Used:</strong> {current.products}</p>
              <p><strong>Progress:</strong> {current.progress}</p>
            </div>

            <div className="w-full bg-white mt-4 p-4 rounded shadow overflow-y-auto max-h-[500px]">
              <h3 className="text-xl font-semibold mb-2 text-pink-600">Personalized Beauty Tips</h3>
              {current.beautyTips ? (
                <p className="text-sm text-gray-700 whitespace-pre-line">{current.beautyTips}</p>
              ) : (
                <p className="text-sm text-gray-500">No tips available for this entry.</p>
              )}
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between gap-2">
                <button onClick={() => setIndex((i) => Math.max(i - 1, 0))} disabled={index === 0} className="flex-1 bg-gray-300 py-2 rounded disabled:opacity-50">⬅️ Previous</button>
                <button onClick={() => deleteEntry(current._id)} className="flex-1 bg-red-400 text-white py-2 rounded">🗑️ Delete</button>
                <button onClick={() => setIndex((i) => Math.min(i + 1, data.length - 1))} disabled={index === data.length - 1} className="flex-1 bg-gray-300 py-2 rounded disabled:opacity-50">Next ➡️</button>
                <button onClick={() => handleEdit(current)} className="flex-1 bg-yellow-400 text-white py-2 rounded">✏️ Edit</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
