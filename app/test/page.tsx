"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useUpdate from "@/context/UpdateContext";
export default function TestPage() {
  const {
    branch,
    setBranch,
    courseId,
    setCourseId,
    semester,
    setSemester,
    section,
    setSection,
    date,
    setDate,
    startYear,
  } = useUpdate();

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
      `/update?date=${date}&section=${section}&branch=${branch}&semester=${semester}&startYear=${startYear}&courseId=${courseId}`
    );
  }

  return (
    <div className="test">
      <form onSubmit={handleSubmit}>
        <div className="row">
          <p className="title">Branch : </p>
          <select value={branch} onChange={(e) => setBranch(e.target.value)}>
            <option value={1}>Civil</option>
            <option value={2}>ECE</option>
            <option value={3}>EEE</option>
            <option value={4}>CSE</option>
            <option value={13}>CSM</option>
            <option value={14}>CSD</option>
          </select>
        </div>
        <div className="row">
          <p className="title">Section : </p>
          <select value={section} onChange={(e) => setSection(e.target.value)}>
            <option value={1}> A Section</option>
            <option value={2}> B Section</option>
            <option value={3}> C Section</option>
          </select>
        </div>
        <div className="row">
          <p className="title">Semester : </p>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value={1}>1 - 1</option>
            <option value={2}>1 - 2</option>
            <option value={3}>2 - 1</option>
            <option value={4}>2 - 2</option>
            <option value={5}>3 - 1</option>
            <option value={6}>3 - 2</option>
            <option value={7}>4 - 1</option>
            <option value={8}>4 - 2</option>
          </select>
        </div>
        <div className="row">
          <p className="title">Date : </p>
          <input
            type="date"
            name="date"
            defaultValue={date}
            onChange={(e) => setDate(e.target.value)}
            value={date}
          />
        </div>

        {/* <div className="row">
          <p className="title">Batch Start Year</p>
          <input
            type="number"
            name="startYear"
            placeholder="Batch"
            onChange={(e) => setStartYear(parseInt(e.target.value))}
            value={startYear}
          />
        </div> */}
        {/* <div className="row">
          <p className="title">Course Type</p>
          <input
            type="number"
            name="courseId"
            placeholder="Course ID"
            onChange={(e) => setCourseId(parseInt(e.target.value))}
            value={courseId}
          />
        </div> */}
        <div className="btn-row">
          <button type="submit">Submit</button>
        </div>
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
