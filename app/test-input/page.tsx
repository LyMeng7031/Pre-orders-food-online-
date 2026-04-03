"use client";

import { useState } from "react";

export default function TestInput() {
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [value3, setValue3] = useState("");

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Input Test - Auto-Jump Issue</h1>

      {/* Standard HTML Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Standard HTML Input
        </label>
        <input
          type="text"
          value={value1}
          onChange={(e) => {
            console.log("Standard input changed:", e.target.value);
            setValue1(e.target.value);
          }}
          onKeyDown={(e) => {
            console.log("Key pressed:", e.key);
            if (e.key === "Tab") {
              e.preventDefault();
            }
          }}
          onFocus={() => console.log("Standard input focused")}
          onBlur={() => console.log("Standard input blurred")}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Type here and see if it auto-jumps..."
        />
        <p className="text-sm text-gray-600 mt-1">Value: "{value1}"</p>
      </div>

      {/* Input with all prevention */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Input with tab/enter prevention
        </label>
        <input
          type="text"
          value={value2}
          onChange={(e) => {
            console.log("Prevented input changed:", e.target.value);
            setValue2(e.target.value);
          }}
          onKeyDown={(e) => {
            console.log("Key pressed in prevented:", e.key);
            // Prevent ALL navigation keys
            if (
              [
                "Tab",
                "Enter",
                "ArrowUp",
                "ArrowDown",
                "ArrowLeft",
                "ArrowRight",
              ].includes(e.key)
            ) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          onFocus={() => console.log("Prevented input focused")}
          onBlur={() => console.log("Prevented input blurred")}
          autoComplete="off"
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Try typing multiple words here..."
        />
        <p className="text-sm text-gray-600 mt-1">Value: "{value2}"</p>
      </div>

      {/* Textarea */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Textarea
        </label>
        <textarea
          value={value3}
          onChange={(e) => {
            console.log("Textarea changed:", e.target.value);
            setValue3(e.target.value);
          }}
          onKeyDown={(e) => {
            console.log("Textarea key pressed:", e.key);
          }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          rows={3}
          placeholder="Type multiple sentences here..."
        />
        <p className="text-sm text-gray-600 mt-1">Value: "{value3}"</p>
      </div>

      {/* Test Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Test Instructions:</h3>
        <ol className="list-decimal list-inside text-blue-800 space-y-1">
          <li>Try typing "Hello World Test" in each field</li>
          <li>Watch console (F12) for focus/blur events</li>
          <li>Check if cursor jumps after typing one word</li>
          <li>Try typing spaces and multiple words</li>
          <li>Check if Tab/Enter keys cause jumping</li>
        </ol>

        <div className="mt-3 p-2 bg-blue-100 rounded">
          <p className="text-sm font-medium text-blue-900">What to look for:</p>
          <ul className="text-sm text-blue-800 list-disc list-inside mt-1">
            <li>Does input lose focus after typing?</li>
            <li>Does cursor jump to next field?</li>
            <li>Can you type spaces?</li>
            <li>Can you type multiple words?</li>
          </ul>
        </div>
      </div>

      {/* Browser Info */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Browser Info:</h3>
        <p className="text-sm text-gray-700">
          User Agent:{" "}
          {typeof window !== "undefined" ? navigator.userAgent : "N/A"}
        </p>
        <p className="text-sm text-gray-700">
          Try in different browser if issue persists
        </p>
      </div>
    </div>
  );
}
