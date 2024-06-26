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
import { useRouter, useSearchParams } from "next/navigation";
import getCookie from "@/actions/getCookie";
import getAttendence from "@/actions/getAttendance";
import useUpdate from "@/context/UpdateContext";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa6";
import { createPortal } from "react-dom";

export type AttendaceReportType = {
  data: StudentAttedanceType[];
  subjects: StudentAttedanceType[];
  labs: LabsType;
  doa: string;
  tableName: string;
  semesterId: number;
  section: number;
  courseId: number;
  branchId: number;
};

export type LabsSubType = {
  input: boolean;
  selected: string;
  value: string;
};
export type LabsType = {
  0: LabsSubType;
  1: LabsSubType;
}[];

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

type ChangeType = {
  name: string;
  rollno: string;
  changes: number;
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
  const [changes, setChanges] = useState<ChangeType[]>([]);
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
  const router = useRouter();

  const defaultTotalData = {
    data: [],
    subjects: [],
    labs: [],
    doa: "",
    tableName: "",
    semesterId: 0,
    section: 0,
    courseId: 0,
    branchId: 0,
  };

  const [totalData, setTotalData] =
    useState<AttendaceReportType>(defaultTotalData);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showInvalidDate, setShowInvalidDate] = useState(true);

  useEffect(() => {
    setDate(dateFromUrl as string);
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") closeOverlay();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (date && date != dateRef.current) {
      setDate(date);
      dateRef.current = formatDate(date);
    }
    setTotalData(defaultTotalData);
    setStudentAtt([]);
    setSubjects([]);
  }, [date]);

  useEffect(() => {
    const cookie = JSON.parse(localStorage.getItem("teacher-cookie") || "null");
    if (cookie) {
      console.log(
        "Cookie is expired for: ",
        (
          (new Date(cookie.expire).getTime() +
            1000 * 60 * 60 * 2 -
            Date.now()) /
          (1000 * 60 * 60)
        ).toFixed(2),
        " hrs"
      );
    }
    if (
      !cookie ||
      new Date(cookie.expire).getTime() + 1000 * 60 * 60 * 2 < Date.now()
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
    console.log("Attendace Req is processing....");
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
        console.log(res.labs);
        setTotalData(res as AttendaceReportType);
        setStudentAtt(JSON.parse(JSON.stringify(res.data)));
        setSubjects(res.subjects);
      })
      .catch((err) => {
        console.warn("some error occured");
        setShowInvalidDate(true);
        openOverlay();
        console.log(err.message);
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

    setChanges(compareArr(studentAtt, totalData.data));
    setShowConfirmPopup(true);
    openOverlay();
  }

  function handleConfirm() {
    setShowConfirmPopup(false);
    closeOverlay();
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
        labs: totalData.labs,
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

  function handleCancelConfirm() {
    setShowConfirmPopup(false);
    closeOverlay();
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
  function handleViewResult(rollno: string) {
    // router.push(`/result?rollno=${rollno}&from=''&to=''`);
    window.open(
      `https://999-diet.vercel.app/result?rollno=${rollno}&from=''&to=''`,
      "__blank"
    );
    // window.open(
    //   `http://localhost:3000/result?rollno=${rollno}&from=''&to=''&graphs=no`,
    //   "__blank"
    // );
  }
  function closeOverlay() {
    console.log("close");
    const overlay = document.getElementById("overlay") as HTMLElement;
    overlay.className = "hidden";
    const body = document.querySelector("body") as HTMLElement;
    body.style.overflow = "auto";
  }

  function openOverlay() {
    const overlay = document.getElementById("overlay") as HTMLElement;
    overlay.className = "visible";
    const body = document.querySelector("body") as HTMLElement;
    body.style.overflow = "hidden";
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

      {showInvalidDate &&
        createPortal(
          <div className="dialog invalid-date-dialog">
            <p className="title">Invalid Date</p>
            <div className="desc">
              {/* Invalid date selection(holiday/not in acadamiccalender/exam held) */}
              Invalid Date Selection, there May Be a Holiday or Exam Held or Not
              in Academic Calender
            </div>

            <div className="flex">
              <button
                className="confirm ok-btn"
                onClick={() => {
                  setShowInvalidDate(false);
                  closeOverlay();
                }}
              >
                Ok
              </button>
            </div>
          </div>,
          document.getElementById("overlay") as HTMLElement
        )}

      {showConfirmPopup &&
        createPortal(
          <div className="dialog">
            <p className="title">Update</p>
            <div className="desc">
              Please Confirm The Changes You Made to Attedance
            </div>
            <div className="list">
              {changes.map((change, index) => {
                return (
                  <div className="item-outer" key={index}>
                    <div className="item">
                      <div className="roll">{change.rollno}</div>
                      <div className="name">{change.name}</div>
                    </div>
                    <span className="count-value">
                      {change.changes > 0 && "+"}
                      {change.changes}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="changes">
              Total Changes:
              <span className="changes-value">
                {changes.reduce(
                  (state, current) => (state += current.changes),
                  0
                )}
              </span>
            </div>
            <div className="flex">
              <button className="cancel" onClick={handleCancelConfirm}>
                Cancel
              </button>
              <button className="confirm" onClick={handleConfirm}>
                Confirm
              </button>
            </div>
          </div>,
          document.getElementById("overlay") as HTMLElement
        )}

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
              <p
                className="roll-no short-roll"
                onClick={() => handleViewResult(std.rollNo)}
              >
                {std.rollNo?.substring(8)}
              </p>
              <p
                className="roll-no long-roll"
                onClick={() => handleViewResult(std.rollNo)}
              >
                {std.rollNo}
              </p>
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

function compareArr(a1: StudentAttedanceType[], a2: StudentAttedanceType[]) {
  const result = [];
  for (let i = 0; i < a1.length; i++) {
    let obj = { name: "", rollno: "", changes: 0 };
    for (let j = 0; j < a1[i].result?.length; j++) {
      if (a1[i].result[j] !== a2[i].result[j]) {
        obj.name = a1[i].name;
        obj.rollno = a1[i].rollNo;
        obj.changes++;
      }
    }
    if (obj.changes > 0) {
      result.push(obj);
    }
  }
  return result;
}
