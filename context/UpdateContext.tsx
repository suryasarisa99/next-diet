"use client";
import React, { useState, useEffect, createContext, useContext } from "react";

type UpdateContextProps = {
  date: string;
  section: string;
  branch: string;
  semester: string;
  startYear: number;
  courseId: 1 | 5 | 3;
  setDate: React.Dispatch<React.SetStateAction<string>>;
  setSection: React.Dispatch<React.SetStateAction<string>>;
  setBranch: React.Dispatch<React.SetStateAction<string>>;
  setSemester: React.Dispatch<React.SetStateAction<string>>;
  setStartYear: React.Dispatch<React.SetStateAction<number>>;
  setCourseId: React.Dispatch<React.SetStateAction<1 | 5 | 3>>;
};

export const UpdateContext = createContext<UpdateContextProps>(
  {} as UpdateContextProps
);

export default function useUpdate() {
  return useContext(UpdateContext);
}

export function UpdateProvider({ children }: { children: React.ReactNode }) {
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [section, setSection] = useState("1");
  const [branch, setBranch] = useState("4");
  const [semester, setSemester] = useState("5");
  const [startYear, setStartYear] = useState(2021);
  const [courseId, setCourseId] = useState<1 | 5 | 3>(1);

  const value = {
    date,
    section,
    branch,
    semester,
    startYear,
    courseId,
    setDate,
    setSection,
    setBranch,
    setSemester,
    setStartYear,
    setCourseId,
  };
  return (
    <UpdateContext.Provider value={value}>{children}</UpdateContext.Provider>
  );
}
