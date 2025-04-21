import axios from "../api/axios";
import { useState } from "react";

export default function TryOn() {
  const [response, setResponse] = useState("");

  const sendImage = async () => {
    // For now, mock data (no image upload yet)
    try {
      const res = await axios.post("/tryon", { image: "base64ImageOrUrl" });
      setResponse(res.data.message);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Virtual Try-On</h2>
      <button onClick={sendImage} className="bg-pink-400 text-white px-4 py-2 mt-4 rounded">
        Try On
      </button>
      <p className="mt-4">{response}</p>
    </div>
  );
}
