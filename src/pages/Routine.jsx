import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import axios from "../api/axios";

const Routines = () => {
  const [morningRoutine, setMorningRoutine] = useState([]);
  const [nightRoutine, setNightRoutine] = useState([]);
  const [productInput, setProductInput] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("morning");
  const [savedRoutines, setSavedRoutines] = useState([]);
  const [currentPageMorning, setCurrentPageMorning] = useState(1);
  const [currentPageNight, setCurrentPageNight] = useState(1);
  const userId = "user123"; // Use the userId here

  const routinesPerPage = 3; // Number of routines per page

  useEffect(() => {
    const fetchSavedRoutines = async () => {
      try {
        const res = await axios.get(`/routine/${userId}`);
        console.log("Fetched routines:", res.data); // Log the data to check if it's in the expected format
        setSavedRoutines(res.data); // Update the state with the fetched data
      } catch (error) {
        console.error("Error fetching saved routines:", error);
      }
    };
  
    fetchSavedRoutines();
  }, [userId]);

  const handleAddProduct = () => {
    if (!productInput.trim()) return;
    const newProduct = productInput.trim();
    if (timeOfDay === "morning") {
      setMorningRoutine((prev) => [...prev, newProduct]);
    } else {
      setNightRoutine((prev) => [...prev, newProduct]);
    }
    setProductInput("");
  };

  const handleDragEnd = (result, type) => {
    if (!result.destination) return;
    const items = Array.from(type === "morning" ? morningRoutine : nightRoutine);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    if (type === "morning") {
      setMorningRoutine(items);
    } else {
      setNightRoutine(items);
    }
  };

  const handleSaveRoutine = async () => {
    const newRoutine = {
      id: uuidv4(),
      userId: userId,
      timeOfDay: timeOfDay,
      routine: timeOfDay === "morning" ? morningRoutine : nightRoutine,
      date: new Date().toISOString(), // Ensure date is stored as an ISO string
    };
    try {
      await axios.post(`/routine/${userId}`, newRoutine);
      // After saving, log the updated state to see if it's updating correctly
      setSavedRoutines((prev) => [...prev, newRoutine]);
      console.log("Updated saved routines:", savedRoutines); // Log after state update
      setMorningRoutine([]);
      setNightRoutine([]);
      setCurrentPageMorning(1);
      setCurrentPageNight(1);
    } catch (error) {
      console.error("Error saving routine:", error);
    }
  };

  const handleDeleteRoutine = async (id) => {
    try {
      // Check if the id is valid
      if (!id) {
        console.error("No ID provided for deletion");
        return;
      }
  
      // Make the delete request with the correct id
      await axios.delete(`/routine/${userId}/${id}`);
      setSavedRoutines((prev) => prev.filter((routine) => routine.id !== id)); // Remove the deleted routine from the state
    } catch (error) {
      console.error("Error deleting routine:", error);
    }
  };
  

  const handleEditRoutine = async (id) => {
    const routineToEdit = savedRoutines.find((routine) => routine.id === id);
    const newProduct = prompt("Edit your routine product:", routineToEdit.routine.join(", "));
    if (newProduct) {
      const updatedRoutine = {
        ...routineToEdit,
        routine: newProduct.split(",").map((item) => item.trim()),
      };
      try {
        await axios.put(`/routine/${userId}/${id}`, updatedRoutine);
        setSavedRoutines((prev) =>
          prev.map((routine) => (routine.id === id ? updatedRoutine : routine))
        );
      } catch (error) {
        console.error("Error updating routine:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) {
      return "Invalid Date";
    }
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const generateRoutine = async () => {
    try {
      const response = await axios.post("/routineSuggestions/suggestions", {
        time: timeOfDay, // "morning" or "night"
      });
  
      console.log("Generated Routine:", response.data.suggestions);
      if (timeOfDay === "morning") {
        setMorningRoutine(response.data.suggestions); // Set the morning routine
      } else {
        setNightRoutine(response.data.suggestions); // Set the night routine
      }
    } catch (error) {
      console.error("Error generating routine:", error);
    }
  };
  

  // Separate the saved routines into morning and night routines
  const morningRoutines = savedRoutines.filter((routine) => routine.timeOfDay === "morning");
  const nightRoutines = savedRoutines.filter((routine) => routine.timeOfDay === "night");

  // Pagination for morning and night routines
  const indexOfLastMorningRoutine = currentPageMorning * routinesPerPage;
  const indexOfFirstMorningRoutine = indexOfLastMorningRoutine - routinesPerPage;
  const currentMorningRoutines = morningRoutines.slice(indexOfFirstMorningRoutine, indexOfLastMorningRoutine);

  const indexOfLastNightRoutine = currentPageNight * routinesPerPage;
  const indexOfFirstNightRoutine = indexOfLastNightRoutine - routinesPerPage;
  const currentNightRoutines = nightRoutines.slice(indexOfFirstNightRoutine, indexOfLastNightRoutine);

  const totalPagesMorning = Math.ceil(morningRoutines.length / routinesPerPage);
  const totalPagesNight = Math.ceil(nightRoutines.length / routinesPerPage);

  const paginate = (type, direction) => {
    if (type === "morning") {
      if (direction === "next" && currentPageMorning < totalPagesMorning) {
        setCurrentPageMorning((prev) => prev + 1);
      } else if (direction === "prev" && currentPageMorning > 1) {
        setCurrentPageMorning((prev) => prev - 1);
      }
    } else if (type === "night") {
      if (direction === "next" && currentPageNight < totalPagesNight) {
        setCurrentPageNight((prev) => prev + 1);
      } else if (direction === "prev" && currentPageNight > 1) {
        setCurrentPageNight((prev) => prev - 1);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-pink-500 text-center mb-8">🌸 Build Your Skin Routine</h1>

      {/* Product Input Section */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Enter a product..."
          value={productInput}
          onChange={(e) => setProductInput(e.target.value)}
          className="border border-pink-300 rounded-full px-5 py-2 w-full focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        <select
          value={timeOfDay}
          onChange={(e) => setTimeOfDay(e.target.value)}
          className="border border-pink-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
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

      {/* Generate Routine Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={generateRoutine}
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full"
        >
          Generate Routine
        </button>
      </div>

      {/* Drag & Drop Routines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Morning Routine */}
        <div>
          <h2 className="text-xl font-bold text-pink-400 mb-4">Morning Routine ☀️</h2>
          <DragDropContext onDragEnd={(result) => handleDragEnd(result, "morning")}>
            <Droppable droppableId="morning">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-pink-50 p-4 rounded-2xl min-h-[120px]"
                >
                  {morningRoutine.map((product, index) => (
                    <Draggable key={product + index} draggableId={product + index} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-2 rounded-xl shadow-sm mb-2 text-gray-700"
                        >
                          {product}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Night Routine */}
        <div>
          <h2 className="text-xl font-bold text-pink-400 mb-4">Night Routine 🌙</h2>
          <DragDropContext onDragEnd={(result) => handleDragEnd(result, "night")}>
            <Droppable droppableId="night">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-pink-50 p-4 rounded-2xl min-h-[120px]"
                >
                  {nightRoutine.map((product, index) => (
                    <Draggable key={product + index} draggableId={product + index} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-2 rounded-xl shadow-sm mb-2 text-gray-700"
                        >
                          {product}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>

      {/* Save Routine Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={handleSaveRoutine}
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full"
        >
          Save Routine
        </button>
      </div>

      {/* Saved Routines */}
      <h2 className="text-2xl font-bold text-pink-400 text-center mb-4">Saved Routines</h2>

      {/* Morning Routines */}
{/* Morning Routines */}
<div>
  <h3 className="font-bold text-lg text-pink-400 mb-4">Morning Routines</h3>
  {morningRoutine.length === 0 && currentMorningRoutines.length === 0 ? (
    <p>No saved morning routines.</p>
  ) : (
    <div>
      {currentMorningRoutines.map((routine) => (
        <div key={routine.id} className="border border-gray-300 p-4 rounded-lg mb-4">
          <p className="text-lg font-semibold">{routine.timeOfDay} Routine</p>
          <p>{routine.routine.join(", ")}</p>
          <p>{formatDate(routine.date)}</p>
          <div className="flex gap-4 mt-2">
            <button
              onClick={() => handleEditRoutine(routine.id)} // Pass routine id to edit
              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-full"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteRoutine(routine.id)} // Pass routine id to delete
              className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-full"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {/* Pagination Controls */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => paginate("morning", "prev")}
          disabled={currentPageMorning === 1}
          className="bg-gray-300 hover:bg-gray-400 text-black py-1 px-4 rounded-full mr-2"
        >
          Prev
        </button>
        <span>{currentPageMorning} of {totalPagesMorning}</span>
        <button
          onClick={() => paginate("morning", "next")}
          disabled={currentPageMorning === totalPagesMorning}
          className="bg-gray-300 hover:bg-gray-400 text-black py-1 px-4 rounded-full ml-2"
        >
          Next
        </button>
      </div>
    </div>
  )}
</div>

{/* Night Routines */}
<div>
  <h3 className="font-bold text-lg text-pink-400 mb-4">Night Routines</h3>
  {nightRoutine.length === 0 && currentNightRoutines.length === 0 ? (
    <p>No saved night routines.</p>
  ) : (
    <div>
      {currentNightRoutines.map((routine) => (
        <div key={routine.id} className="border border-gray-300 p-4 rounded-lg mb-4">
          <p className="text-lg font-semibold">{routine.timeOfDay} Routine</p>
          <p>{routine.routine.join(", ")}</p>
          <p>{formatDate(routine.date)}</p>
          <div className="flex gap-4 mt-2">
            <button
              onClick={() => handleEditRoutine(routine.id)} // Pass routine id to edit
              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-full"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteRoutine(routine.id)} // Pass routine id to delete
              className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-full"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {/* Pagination Controls */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => paginate("night", "prev")}
          disabled={currentPageNight === 1}
          className="bg-gray-300 hover:bg-gray-400 text-black py-1 px-4 rounded-full mr-2"
        >
          Prev
        </button>
        <span>{currentPageNight} of {totalPagesNight}</span>
        <button
          onClick={() => paginate("night", "next")}
          disabled={currentPageNight === totalPagesNight}
          className="bg-gray-300 hover:bg-gray-400 text-black py-1 px-4 rounded-full ml-2"
        >
          Next
        </button>
      </div>
    </div>
  )}
</div>


    </div>
  );
};

export default Routines;
