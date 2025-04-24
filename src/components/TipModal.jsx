// TipModal.jsx
import { useEffect, useState } from "react";

export default function TipModal({ tip, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 10000); // auto-hide after 10s
    return () => clearTimeout(timer);
  }, []);

  if (!visible || !tip) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-pink-100 text-gray-800 border border-pink-300 rounded-lg shadow-lg w-[90%] md:w-1/2 z-50 px-6 py-4 transition-all animate-slide-down">
      <div className="flex items-start justify-between">
        <div className="pr-4">
          <p className="text-sm italic whitespace-pre-line">{tip}</p>
        </div>
        <button
          onClick={() => {
            setVisible(false);
            if (typeof onClose === "function") onClose();
          }}
          className="text-pink-600 font-bold ml-4"
        >
          ✖
        </button>
      </div>
    </div>
  );
}
