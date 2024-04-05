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

  const CourseToBranchMap = {
    1: {
      name: "Btech",
      branches: {
        1: "Civil",
        2: "EEE",
        3: "ECE",
        4: "CSE",
        13: "CSM",
        14: "CSD",
      },
      semesters: {
        0: "1 - 1",
        1: "1 - 2",
        2: "2 - 1",
        3: "2 - 2",
        4: "3 - 1",
        5: "3 - 2",
        6: "4 - 1",
        7: "4 - 2",
      },
    },
    5: {
      name: "Diploma",
      branches: {
        // 1: "Civil",
        // 4: "CSE",
        10: "ECE",
        12: "EEE",
      },
      semesters: {
        21: "1 - 1",
        22: "1 - 2",
        23: "2 - 1",
        24: "2 - 2",
        25: "3 - 1",
        26: "3 - 2",
      },
    },
    3: {
      name: "MBA",
      branches: {
        5: "MBA",
      },
      semesters: {
        14: "1 MBA  1-Sem",
        15: "1 MBA  2-Sem",
        16: "2 MBA  1-Sem",
        17: "2 MBA  2-Sem",
      },
    },
  };

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
          <p className="title">Course : </p>
          <select
            value={courseId}
            onChange={(e) => {
              let c = +e.target.value as 1 | 5 | 3;
              setSemester(Object.keys(CourseToBranchMap[c].semesters)[0]);
              setBranch(Object.keys(CourseToBranchMap[c].branches)[0]);
              setCourseId(c);
            }}
          >
            <option value={1}>Btech</option>
            <option value={5}>Diploma</option>
            <option value={3}>MBA</option>
          </select>
        </div>
        <div className="row">
          <p className="title">Branch : </p>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            disabled={isNull(branch)}
          >
            {Object.entries(CourseToBranchMap[courseId].branches).map(
              ([k, value]) => {
                return (
                  <option key={k} value={k}>
                    {value}
                  </option>
                );
              }
            )}
          </select>
        </div>
        <div className="row">
          <p className="title">Smester : </p>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            {Object.entries(CourseToBranchMap[courseId].semesters).map(
              ([k, value]) => {
                return (
                  <option key={k} value={k}>
                    {value}
                  </option>
                );
              }
            )}
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
