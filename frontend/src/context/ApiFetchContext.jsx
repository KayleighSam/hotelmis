// ApiFetchContext.jsx
import React, { createContext } from "react";

export const ApiFetchContext = createContext();

export const ApiFetchProvider = ({ children }) => {
  const baseURL = "http://127.0.0.1:8000/api";

  // POST with optional multipart + token
  const post = async (url, data, multipart = false, token = null) => {
    const headers = {};
    if (!multipart) headers["Content-Type"] = "application/json";
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${baseURL}${url}`, {
      method: "POST",
      headers,
      body: multipart ? data : JSON.stringify(data),
    });

    return await res.json();
  };

  return (
    <ApiFetchContext.Provider value={{ baseURL, post }}>
      {children}
    </ApiFetchContext.Provider>
  );
};
