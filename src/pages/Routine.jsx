import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "../api/axios";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ReactGridLayout = WidthProvider(Responsive);

const Routines = () => {
  const [productInput, setProductInput] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("morning");
  const [morningRoutine, setMorningRoutine] = useState([]);
  const [nightRoutine, setNightRoutine] = useState([]);
  const [savedRoutines, setSavedRoutines] = useState([]); // Ensure this is an array
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [routinesPerPage] = useState(5); // Number of routines per page

  const userId = "user123"; // Temporary static userId

  useEffect(() => {
    fetchSavedRoutines();
  }, [currentPage]);

  const fetchSavedRoutines = async () => {
    try {
      const res = await axios.get(`/routine/${userId}`);
      if (Array.isArray(res.data)) {
        setSavedRoutines(res.data); // Ensure response is an array
      } else {
        console.error("Error: Response is not an array");
      }
    } catch (error) {
      console.error("Error fetching routines:", error);
    }
  };

  const handleAddProduct = () => {
    if (!productInput.trim()) return;
    const newProduct = productInput.trim();
    if (timeOfDay === "morning") {
      setMorningRoutine(prev => [...prev, newProduct]);
    } else {
      setNightRoutine(prev => [...prev, newProduct]);
    }
    setProductInput("");
  };

  const handleSaveRoutine = async () => {
    const routineToSave = {
      id: uuidv4(),
      userId,
      timeOfDay,
      routine: timeOfDay === "morning" ? morningRoutine : nightRoutine,
      createdAt: new Date().toISOString(),
    };
    try {
      await axios.post(`/routine/${userId}`, routineToSave);
      setSavedRoutines(prev => [...prev, routineToSave]);
      setMorningRoutine([]);
      setNightRoutine([]);
    } catch (error) {
      console.error("Error saving routine:", error);
    }
  };

  const handleDeleteRoutine = async (id) => {
    try {
      await axios.delete(`/routine/${userId}/${id}`);
      setSavedRoutines(prev => prev.filter(routine => routine.id !== id));
    } catch (error) {
      console.error("Error deleting routine:", error);
    }
  };

  const handleEditRoutine = async (routine) => {
    const newProducts = prompt("Edit your routine (comma separated):", routine.routine.join(", "));
    if (!newProducts) return;
    const updatedRoutine = { ...routine, routine: newProducts.split(",").map(item => item.trim()) };
    try {
      await axios.put(`/api/routines/${userId}/${routine.id}`, updatedRoutine);
      setSavedRoutines(prev => prev.map(r => r.id === routine.id ? updatedRoutine : r));
    } catch (error) {
      console.error("Error editing routine:", error);
    }
  };

  const generateRoutine = async () => {
    try {
      setLoading(true);
      const res = await axios.post("/routineSuggestions/suggestions", { time: timeOfDay });
      if (timeOfDay === "morning") {
        setMorningRoutine(res.data.suggestions);
      } else {
        setNightRoutine(res.data.suggestions);
      }
    } catch (error) {
      console.error("Error generating suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  // Pagination Logic
  const indexOfLastRoutine = currentPage * routinesPerPage;
  const indexOfFirstRoutine = indexOfLastRoutine - routinesPerPage;
  const currentRoutines = Array.isArray(savedRoutines) ? savedRoutines.slice(indexOfFirstRoutine, indexOfLastRoutine) : [];

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-100 via-pink-200 to-purple-200 p-6">
      <h1 className="text-4xl font-extrabold text-center text-pink-600 mb-8">🌸 Build Your Skin Routine</h1>

      {/* Input Section */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <input
          value={productInput}
          onChange={(e) => setProductInput(e.target.value)}
          placeholder="Enter a product..."
          className="border border-pink-300 rounded-full px-4 py-2 w-full focus:ring-2 focus:ring-pink-400"
        />
        <select
          value={timeOfDay}
          onChange={(e) => setTimeOfDay(e.target.value)}
          className="border border-pink-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-pink-400"
        >
          <option value="morning">Morning</option>
          <option value="night">Night</option>
        </select>
        <button
          onClick={handleAddProduct}
          className="bg-pink-400 hover:bg-pink-500 text-white font-bold py-2 px-6 rounded-full"
        >
          Add
        </button>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={generateRoutine}
          disabled={loading}
          className="bg-purple-400 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full"
        >
          {loading ? "Generating..." : "Generate Routine"}
        </button>
      </div>

      {/* Morning and Night Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Morning */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-pink-500 mb-4">Morning Routine ☀️</h2>
          <ReactGridLayout
            className="layout"
            layouts={{ lg: [] }}
            breakpoints={{ lg: 1200 }}
            cols={{ lg: 12 }}
            rowHeight={60}
          >
            {morningRoutine.map((product, index) => (
              <div key={product + index} data-grid={{ i: `${product}-${index}`, x: 0, y: index, w: 12, h: 1 }}>
                <div className="bg-pink-100 text-center p-2 rounded-lg text-sm shadow">{product}</div>
              </div>
            ))}
          </ReactGridLayout>
        </div>

        {/* Night */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-purple-500 mb-4">Night Routine 🌙</h2>
          <ReactGridLayout
            className="layout"
            layouts={{ lg: [] }}
            breakpoints={{ lg: 1200 }}
            cols={{ lg: 12 }}
            rowHeight={60}
          >
            {nightRoutine.map((product, index) => (
              <div key={product + index} data-grid={{ i: `${product}-${index}`, x: 0, y: index, w: 12, h: 1 }}>
                <div className="bg-purple-100 text-center p-2 rounded-lg text-sm shadow">{product}</div>
              </div>
            ))}
          </ReactGridLayout>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-center mb-10">
        <button
          onClick={handleSaveRoutine}
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full"
        >
          Save Routine
        </button>
      </div>

      {/* Saved Routines Section */}
      <h2 className="text-3xl text-center text-pink-600 font-bold mb-6">✨ Saved Routines ✨</h2>
      {Array.isArray(savedRoutines) && savedRoutines.length === 0 ? (
        <p className="text-center text-gray-500">No routines saved yet.</p>
      ) : (
        <div className="space-y-6">
          {currentRoutines.map(routine => (
            <div key={routine.id} className="bg-white p-4 rounded-2xl shadow space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-pink-500">{routine.timeOfDay.toUpperCase()} Routine</h3>
                <span className="text-gray-400 text-sm">{formatDate(routine.createdAt)}</span>
              </div>
              <p className="text-gray-700">{routine.routine.join(", ")}</p>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => handleEditRoutine(routine)}
                  className="bg-blue-400 hover:bg-blue-500 text-white py-1 px-4 rounded-full text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteRoutine(routine.id)}
                  className="bg-red-400 hover:bg-red-500 text-white py-1 px-4 rounded-full text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-8">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-6 rounded-full mx-2"
        >
          Previous
        </button>
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage * routinesPerPage >= savedRoutines.length}
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-6 rounded-full mx-2"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Routines;
