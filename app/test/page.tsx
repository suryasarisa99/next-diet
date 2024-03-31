"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
export default function TestPage() {
  const [date, setDate] = useState("");
  const [section, setSection] = useState(2);
  const [branch, setBranch] = useState(4);
  const [semester, setSemester] = useState(6);
  const [startYear, setStartYear] = useState(2021);
  const [courseId, setCourseId] = useState(1);

  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("submitting", date, section, branch, semester, startYear);
    let d = formatDate(date);
    router.push(
      `/update?date=${d}&section=${section}&branch=${branch}&semester=${semester}&startYear=${startYear}&courseId=${courseId}`
    );
  }

  return (
    <div className="test">
      <form onSubmit={handleSubmit}>
        <input
          type="date"
          name="date"
          onChange={(e) => setDate(e.target.value)}
          value={date}
        />
        <input
          type="number"
          name="section"
          placeholder="Section"
          onChange={(e) => setSection(parseInt(e.target.value))}
          value={section}
        />
        <input
          type="number"
          name="branch"
          placeholder="Branch"
          onChange={(e) => setBranch(parseInt(e.target.value))}
          value={branch}
        />
        <input
          type="number"
          name="semester"
          placeholder="Semester"
          onChange={(e) => setSemester(parseInt(e.target.value))}
          value={semester}
        />
        <input
          type="number"
          name="startYear"
          placeholder="Batch Start Year"
          onChange={(e) => setStartYear(parseInt(e.target.value))}
          value={startYear}
        />
        <input
          type="number"
          name="courseId"
          placeholder="Course ID"
          onChange={(e) => setCourseId(parseInt(e.target.value))}
          value={courseId}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

function formatDate(d: string): string {
  const [year, month, day] = d.split("-");

  return day + "/" + month + "/" + year;
}
