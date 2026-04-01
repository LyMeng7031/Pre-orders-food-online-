"use client";

import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function Input({
  label,
  name,
  value,
  onChange,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-bold text-gray-900 mb-2">
          {label}
        </label>
      )}

      <input
        name={name}
        value={value ?? ""} // ✅ prevent uncontrolled bug
        onChange={(e) => onChange?.(e)} // ✅ pass FULL event
        className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...props}
      />
    </div>
  );
}