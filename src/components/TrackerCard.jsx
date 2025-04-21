import React from 'react';

export default function TrackerCard({ progress, mood, skinState, productsUsed, date }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-4 border">
      <h3 className="text-xl font-semibold text-pink-600">Progress:</h3>
      <p className="text-gray-800">{progress}</p>
      {/* Display Mood */}
      <h3 className="text-xl font-semibold text-pink-600 mt-2">Mood:</h3>
      <p className="text-gray-800">{mood}</p>

      {/* Display Skin State */}
      <h3 className="text-xl font-semibold text-pink-600 mt-2">Skin State:</h3>
      <p className="text-gray-800">{skinState}</p>

      {/* Display Products Used */}
      <h3 className="text-xl font-semibold text-pink-600 mt-2">Products Used:</h3>
      <p className="text-gray-800">{productsUsed}</p>

      <p className="mt-2 text-sm text-gray-500">
        <strong>Date:</strong> {new Date(date).toLocaleDateString()}
      </p>
    </div>
  );
}
