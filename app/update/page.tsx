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

  const section = params.get("section");
  const branchId = params.get("branch");
  const semester = params.get("semester");
  const courseId = params.get("courseId");
  const date = params.get("date");
  const batch = params.get("startYear");
  const cookieRef = useRef("");

  // const section = "2";
  // const branchId = "4";
  // const semester = "6";
  // const courseId = "1";
  // const date = "01/02/2024";
  // const batch = "2021";
  // const cookieRef = useRef("");

  const [totalData, setTotalData] = useState<AttendaceReportType>({
    data: [],
    subjects: [],
    doa: "",
    tableName: "",
    semesterId: 0,
    section: 0,
    courseId: 0,
    branchId: 0,
  });

  useEffect(() => {
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
        request(cookieRes.cookie);
      });
    } else {
      cookieRef.current = cookie.cookie;
      request(cookie.cookie);
    }
  }, []);

  function request(cookie: string) {
    // getAttendence({
    //   cookie: cookie,
    //   from: "",
    //   to: "",
    //   excludeOtherSubjects: true,
    //   rollNo: "21u41a0506",
    // }).then((res) => {
    //   console.log(res);
    // });
    if (!date || !section || !courseId || !branchId || !semester || !batch)
      return;
    getAttendaceReq(
      {
        date: date,
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
    if (!date || !section || !courseId || !branchId || !semester || !batch)
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

  return (
    <div className="update page">
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
          <p>{date}</p>
        </div>
      </div>
      <div className="table">
        <div className="row head">
          {[{ name: "", id: "x", subjectType: "" }, ...subjects].map(
            (sub, sIndex) => {
              if (sIndex == 0) {
                return (
                  <p key={sIndex} className="subject">
                    <span className="short-roll">rno</span>
                    <span className="long-roll">Roll No</span>
                  </p>
                );
              } else {
                return (
                  <p key={sIndex} className="subject">
                    {sub.name}
                  </p>
                );
              }
            }
          )}
        </div>
        {studentAtt.map((std, stdInd) => {
          return (
            <div className="student row" key={std.id}>
              <p className="roll-no short-roll">{std.rollNo?.substring(8)}</p>
              <p className="roll-no long-roll">{std.rollNo}</p>
              {/* <p className="roll-no long-roll">{std.name}</p> */}
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
