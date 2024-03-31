"use client";

import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  Suspense,
} from "react";
import getAttendaceReq from "@/actions/addAttendace/getReq";
import temp from "@/actions/addAttendace/temp.json";
import PostAttendanceUpdate from "@/actions/addAttendace/postReq";
import { useSearchParams } from "next/navigation";
import getCookie from "@/actions/getCookie";
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
  const params = useSearchParams();

  const section = parseInt(params.get("section") || "2");
  const branchId = parseInt(params.get("branch") || "4");
  const semester = parseInt(params.get("semester") || "6");
  const courseId = parseInt(params.get("courseId") || "1");
  const date = params.get("date") || "01/02/2024";
  const batch = params.get("startYear") || "2021";
  const cookieRef = useRef("");

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
    if (cookie) {
      const expire = new Date(cookie.expire).getTime() + 1000 * 60 * 60 * 4;
      if (expire < Date.now()) {
        getCookie("892", "1234").then((cookieRes) => {
          console.log("cookie expired in update page");
          localStorage.setItem("teacher-cookie", JSON.stringify(cookieRes));
          cookieRef.current = cookieRes.cookie;
          request(cookieRes.cookie);
        });
      } else {
        cookieRef.current = cookie.cookie;
        request(cookie.cookie);
      }
    } else {
      console.log("no cookie in  update page");
      getCookie("892", "1234").then((cookieRes) => {
        localStorage.setItem("teacher-cookie", JSON.stringify(cookieRes));
        cookieRef.current = cookieRes.cookie;
        request(cookieRes.cookie);
      });
    }
  }, []);

  function request(cookie: string) {
    getAttendaceReq(
      {
        date,
        section,
        courseId,
        semester,
        branchId,
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
    if (studentAtt.length === 0 || subjects.length == 0) return;
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
      batch,
      cookieRef.current
    ).then((res) => {
      console.log(res);
    });
  }

  function handleCheckBox(
    e: React.ChangeEvent<HTMLInputElement>,
    id: string,
    stdIndex: number,
    resIndex: number
  ) {
    console.log(e.target.checked);
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
      <p>{date}</p>
      <div className="table">
        <div className="row head">
          {[{ name: "", id: "x", subjectType: "" }, ...subjects].map(
            (sub, sIndex) => {
              return (
                <p key={sub.id} className="subject">
                  {sub.name}
                </p>
              );
            }
          )}
        </div>
        {studentAtt.map((std, stdInd) => {
          return (
            <div className="student row" key={std.id}>
              <p className="roll-no">{std.rollNo?.substring(8)}</p>
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

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
