import React, { useEffect, useState } from "react";
import axios from "../api/axios"; // Adjust import if necessary

export default function Routine() {
  const [routine, setRoutine] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/routine/testuser") // Make sure the route matches the server
      .then((res) => {
        setRoutine(res.data.routine); // Receiving the routine data from backend
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error fetching routine:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold text-center mb-6">Your Beauty Routine</h2>

      {loading ? (
        <p>Loading your routine...</p>
      ) : (
        <ul className="list-disc pl-5">
          {routine.length > 0 ? (
            routine.map((step, index) => (
              <li key={index} className="mb-3">
                <p className="text-lg font-medium">{step}</p>
              </li>
            ))
          ) : (
            <li>No routine available.</li>
          )}
        </ul>
      )}
    </div>
  );
}
