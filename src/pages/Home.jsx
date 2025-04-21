import { useState, useEffect } from "react";
import axios from "../api/axios"; // Ensure this points to your custom axios instance

export default function Home() {
  const [routine, setRoutine] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/routine/testuser") // This makes a request to http://localhost:5000/api/routine/testuser
      .then((res) => {
        setRoutine(res.data.routine); // Assuming backend returns `{ routine: [...] }`
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ API Error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="flex flex-col items-center justify-center text-center px-6 py-20 bg-gradient-to-b from-pink-50 to-white min-h-[calc(100vh-120px)]">
      <h2 className="text-4xl md:text-5xl font-bold text-pink-600 mb-4">
        Discover Your Perfect Beauty Routine ✨
      </h2>
      <p className="text-gray-600 text-lg max-w-xl mb-8">
        Try on looks virtually, build your personalized skincare routine, and track your beauty progress – all in one place.
      </p>
      
      {loading ? (
        <p className="text-gray-500">Loading your routine...</p>
      ) : (
        <>
          <p className="text-lg mb-4">Your Suggested Routine:</p>
          <ul className="text-gray-600">
            {routine.map((step, index) => (
              <li key={index} className="mb-2">{step}</li>
            ))}
          </ul>
        </>
      )}
      
      <div className="flex gap-4">
        <a
          href="/tryon"
          className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow"
        >
          Try It Now
        </a>
        <a
          href="/routine"
          className="border border-pink-400 text-pink-500 hover:bg-pink-100 px-6 py-2 rounded-full text-sm font-semibold shadow"
        >
          Build Routine
        </a>
      </div>
    </main>
  );
}
