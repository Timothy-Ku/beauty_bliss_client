import { useEffect, useState } from "react";
import axios from "axios";

export default function Weather({ onWeatherDataFetched }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWeatherFromBackend = async (lat, lon) => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/weather/by-coords?lat=${lat}&lon=${lon}`
        );
        setWeather(res.data);
        if (typeof onWeatherDataFetched === "function") {
          onWeatherDataFetched(res.data);
        }
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch weather:", err);
        setError("Failed to fetch weather");
        setLoading(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherFromBackend(latitude, longitude);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError("Location access denied.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation not supported.");
      setLoading(false);
    }
  }, [onWeatherDataFetched]);

  const getWeatherIcon = (desc) => {
    if (!desc) return "❓";
    const lowered = desc.toLowerCase();
    if (lowered.includes("cloud")) return "☁️";
    if (lowered.includes("rain")) return "🌧️";
    if (lowered.includes("clear")) return "☀️";
    if (lowered.includes("snow")) return "❄️";
    if (lowered.includes("storm")) return "🌩️";
    return "🌤️";
  };

  if (loading || error || !weather) return null;

  const icon = getWeatherIcon(weather.weather[0].description);

  return (
    <div className="w-full overflow-hidden">
      <div className="whitespace-nowrap animate-marquee text-sm text-gray-800 py-1">
        <span className="mx-4">{icon}</span>
        <span className="mx-4">City: {weather.name}</span>
        <span className="mx-4">Temp: {weather.main.temp}°C</span>
        <span className="mx-4 capitalize">
          Condition: {weather.weather[0].description}
        </span>
        <span className="mx-4">{icon}</span>
      </div>
    </div>
  );
}
