"use client";
import { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

const getFromLocalStorage = () => {
  if (typeof window !== "undefined") {
    const value = localStorage.getItem("theme");
    return value || "light";
  }
  return "light"; // SSR fallback
};

export const ThemeContextProvider = ({ children }) => {
  const [theme, setTheme] = useState("light"); // default for SSR

  useEffect(() => {
    const localTheme = getFromLocalStorage();
    setTheme(localTheme);
  }, []);

  const toggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  }

  useEffect(() => {
    localStorage.setItem("theme", theme);
  },[theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};
