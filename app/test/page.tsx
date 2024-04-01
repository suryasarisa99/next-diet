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
    if (!date) return alert("Please enter date");
    if (!date || !section || !branch || !semester || !startYear || !courseId)
      if (
        !date ||
        isNull(section) ||
        !courseId ||
        isNull(branch) ||
        isNull(semester) ||
        !startYear
      )
        return alert("Please fill all the fields");

    router.push(
      `/update?date=${d}&section=${section}&branch=${branch}&semester=${semester}&startYear=${startYear}&courseId=${courseId}`
    );
  }

  return (
    <div className="test">
      <form onSubmit={handleSubmit}>
        <div className="row">
          <p className="title">Date: </p>
          <input
            type="date"
            name="date"
            onChange={(e) => setDate(e.target.value)}
            value={date}
          />
        </div>
        <div className="row">
          <p className="title">Section: </p>
          <input
            type="number"
            name="section"
            placeholder="Section"
            onChange={(e) => setSection(parseInt(e.target.value))}
            value={section}
          />
        </div>
        <div className="row">
          <p className="title">Branch:</p>
          <input
            type="number"
            name="branch"
            placeholder="Branch"
            onChange={(e) => setBranch(parseInt(e.target.value))}
            value={branch}
          />
        </div>
        <div className="row">
          <p className="title"> Sesester</p>
          <input
            type="number"
            name="semester"
            placeholder="Semester"
            onChange={(e) => setSemester(parseInt(e.target.value))}
            value={semester}
          />
        </div>

        <div className="row">
          <p className="title">Batch Start Year</p>
          <input
            type="number"
            name="startYear"
            placeholder="Batch"
            onChange={(e) => setStartYear(parseInt(e.target.value))}
            value={startYear}
          />
        </div>
        <div className="row">
          <p className="title">Course Type</p>
          <input
            type="number"
            name="courseId"
            placeholder="Course ID"
            onChange={(e) => setCourseId(parseInt(e.target.value))}
            value={courseId}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

function formatDate(d: string): string {
  const [year, month, day] = d.split("-");

  return day + "/" + month + "/" + year;
}

function isNull(value: any) {
  return value === null || value === undefined;
}
