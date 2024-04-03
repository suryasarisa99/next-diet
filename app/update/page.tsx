"use client";

import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  Suspense,
} from "react";
import getAttendaceReq from "@/actions/getReq";
import temp from "@/actions/addAttendace/temp.json";
import PostAttendanceUpdate from "@/actions/postReq";
import { useSearchParams } from "next/navigation";
import getCookie from "@/actions/getCookie";
import getAttendence from "@/actions/getAttendance";
import useUpdate from "@/context/UpdateContext";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa6";
// doa: '08-Jan-2024',
// tableName: 'tblBTech_4_5_1',
// semesterId: 6,
// section: 1,
// courseId: 1,
// branchId: 4
export type AttendaceReportType = {
  data: StudentAttedanceType[];
  subjects: StudentAttedanceType[];
  doa: string;
  tableName: string;
  semesterId: number;
  section: number;
  courseId: number;
  branchId: number;
};
type SubjectAttendaceType = {
  name: string;
  id: string;
  subjectType: string;
};
type StudentAttedanceType = {
  name: string;
  index: number;
  batch: string;
  id: string;
  rollNo: string;
  result: boolean[];
};

export default function Page() {
  return (
    <Suspense>
      <UpdatePage />
    </Suspense>
  );
}

function UpdatePage() {
  const [studentAtt, setStudentAtt] = useState<StudentAttedanceType[]>([]);
  const [subjects, setSubjects] = useState<SubjectAttendaceType[]>([]);
  const [clicks, setClicks] = useState(0);
  const params = useSearchParams();
  const { date, setDate } = useUpdate();
  const section = params.get("section");
  const branchId = params.get("branch");
  const semester = params.get("semester");
  const courseId = params.get("courseId");
  const dateFromUrl = params.get("date");
  const dateRef = useRef(formatDate(dateFromUrl as string));
  const batch = params.get("startYear");
  const cookieRef = useRef("");

  // const section = "2";
  // const branchId = "4";
  // const semester = "6";
  // const courseId = "1";
  // const date = "01/02/2024";
  // const batch = "2021";
  // const cookieRef = useRef("");

  const defaultTotalData = {
    data: [],
    subjects: [],
    doa: "",
    tableName: "",
    semesterId: 0,
    section: 0,
    courseId: 0,
    branchId: 0,
  };
  const [totalData, setTotalData] =
    useState<AttendaceReportType>(defaultTotalData);

  useEffect(() => {
    console.log("renderd again");
  }, []);

  useEffect(() => {
    setTotalData(defaultTotalData);
    setStudentAtt([]);
    setSubjects([]);
  }, [date]);

  useEffect(() => {
    if (date && date != dateRef.current) {
      setDate(date);
      dateRef.current = formatDate(date);
    }
    const cookie = JSON.parse(localStorage.getItem("teacher-cookie") || "null");
    console.log(cookie);
    if (
      !cookie ||
      new Date(cookie.expire).getTime() + 1000 * 60 * 60 * 4 < Date.now()
    ) {
      getCookie("606", "1234").then((cookieRes) => {
        console.log("cookie expired in update page");
        localStorage.setItem("teacher-cookie", JSON.stringify(cookieRes));
        cookieRef.current = cookieRes.cookie;
        // console.log(dateRef.current, date);
        request(cookieRes.cookie);
      });
    } else {
      cookieRef.current = cookie.cookie;
      // console.log(dateRef.current, date);
      request(cookie.cookie);
    }
  }, [date]);

  function request(cookie: string) {
    if (
      !dateRef.current ||
      !section ||
      !courseId ||
      !branchId ||
      !semester ||
      !batch
    )
      return;
    console.log(dateRef.current);
    getAttendaceReq(
      {
        date: dateRef.current,
        section: section,
        courseId: courseId,
        semester: semester,
        branchId: branchId,
      },
      cookie
    )
      .then((res) => {
        console.log(res);
        setTotalData(res as AttendaceReportType);
        setStudentAtt(res.data);
        setSubjects(res.subjects);
      })
      .catch((err) => {
        console.warn("some error occured");
        console.log(err);
      });
  }

  function handleSubmit() {
    const supportedBranchIds = ["4", "13", "14"];
    if (studentAtt.length === 0 || subjects.length == 0) return;
    if (
      !dateRef.current ||
      !section ||
      !courseId ||
      !branchId ||
      !semester ||
      !batch
    )
      return;
    if (!supportedBranchIds.includes(branchId))
      return alert(
        "Currently I Don't Know How to Format Data To Post the Attendance, For Your Branch"
      );

    PostAttendanceUpdate(
      {
        data: studentAtt,
        subjects: subjects,
        doa: totalData.doa,
        tableName: totalData.tableName,
        semesterId: totalData.semesterId,
        section: totalData.section,
        courseId: totalData.courseId,
        branchId: totalData.branchId,
      },
      batch || undefined,
      cookieRef.current
    )
      .then((res) => {
        console.log(res);
        if (res === "''") alert("Update Sucessfully");
      })
      .catch((err) => {
        alert(err.message);
      });
  }

  function handleCheckBox(
    e: React.ChangeEvent<HTMLInputElement>,
    id: string,
    stdIndex: number,
    resIndex: number
  ) {
    console.log(e.target.checked);
    setClicks((prv) => prv + 1);
    setStudentAtt((prv) => {
      const item = prv[stdIndex];
      if (item) {
        item.result[resIndex] = !item.result[resIndex];
        return [
          ...prv.slice(0, stdIndex),
          { ...item },
          ...prv.slice(stdIndex + 1),
        ];
      }
      return prv;
    });
  }

  function handleDateChange(e: ChangeEvent<HTMLInputElement>) {
    setDate(e.target.value);
    const d = new Date(e.target.value);
    dateRef.current = formatDate(d.toISOString().substring(0, 10));
  }

  function handleNextDate() {
    let d = new Date(date);
    d.setDate(d.getDate() + 1);
    if (d.getDay() == 0) d.setDate(d.getDate() + 1);
    let dstr = d.toISOString().substring(0, 10);
    setDate(dstr);
    dateRef.current = formatDate(dstr);
  }

  function handlePrevDate() {
    let d = new Date(date);
    d.setDate(d.getDate() - 1);
    if (d.getDay() == 0) d.setDate(d.getDate() - 1);
    let dstr = d.toISOString().substring(0, 10);
    setDate(dstr);
    dateRef.current = formatDate(dstr);
  }

  return (
    <div className="update page">
      <div className="head-row">
        <button onClick={handlePrevDate} className="prv-next-btn">
          <FaChevronLeft className="icon" />
        </button>

        <input type="date" onChange={handleDateChange} value={date} />
        <button onClick={handleNextDate} className="prv-next-btn">
          <FaChevronRight className="icon" />
        </button>
      </div>

      <div className="top-row">
        <div className="part">
          <p>Branch: </p>
          <p>{branchId}</p>
        </div>
        <div className="part">
          <p>Section: </p>
          <p>{section}</p>
        </div>
        <div className="part short-roll">
          <p>RollNo: </p>
          <p>{studentAtt?.[0]?.rollNo.substring(0, 8)}</p>
        </div>
        <div className="part">
          <p>Date: </p>
          <p>{totalData.doa}</p>
        </div>
      </div>
      <div className="table">
        {subjects.length > 0 && (
          <div className="row head">
            {[
              { name: "roll", id: "x", subjectType: "" },
              { name: "name", id: "y", subjectType: "" },
              ...subjects,
            ].map((sub, sIndex) => {
              if (sIndex == 0) {
                return (
                  <p key={sIndex} className="subject">
                    <span className="short-roll">R</span>
                    <span className="long-roll">Roll No</span>
                  </p>
                );
              } else if (sIndex == 1) {
                return (
                  <p key={sIndex} className="x">
                    <span className="xlong-roll y">Name</span>
                  </p>
                );
              } else {
                return (
                  <p key={sIndex} className="subject">
                    {sub.name}
                  </p>
                );
              }
            })}
          </div>
        )}
        {studentAtt.map((std, stdInd) => {
          return (
            <div className="student row" key={std.id}>
              <p className="roll-no short-roll">{std.rollNo?.substring(8)}</p>
              <p className="roll-no long-roll">{std.rollNo}</p>
              <p className="name xlong-roll">{std.name}</p>
              {std.result.map((res, resInd) => {
                return (
                  <input
                    key={resInd}
                    className="subject"
                    type="checkbox"
                    checked={res}
                    onChange={(e) => handleCheckBox(e, std.id, stdInd, resInd)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="bottom-row">
        <p> Total Clicks {clicks}</p>
        <button className="btn" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}

function isNull(value: any) {
  return value === null || value === undefined;
}

function originalDate(d: string): string {
  const [year, month, day] = d.split("/");

  return day + "-" + month + "-" + year;
}

function formatDate(d: string): string {
  const [year, month, day] = d.split("-");

  return day + "/" + month + "/" + year;
}
