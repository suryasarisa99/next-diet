"use client";

import { getFakeData, getTodo } from "@/actions/utility";
import { Suspense, useRef, useState, useEffect } from "react";
import { MdOutlineCalendarMonth, MdCalendarMonth } from "react-icons/md";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useData from "@/context/DataContext";
import { FormatDate } from "@/context/DataContext";

export default function Home() {
  const router = useRouter();
  const [month, setMonth] = useState("");
  const [date, setDate] = useState({
    from: "",
    to: "",
  });
  const inputFrom = useRef<HTMLInputElement>(null);
  const inputTo = useRef<HTMLInputElement>(null);
  const weekLastItem = useRef<HTMLDivElement>(null);
  const lastMonth = useRef(null);
  const { rollno, setRollno, currentUser } = useData();
  const monthRef = useRef<HTMLInputElement>(null);
  const week = [
    { name: "b Weeek", to: `/result?rollno=${rollno}&week=bweek` },
    { name: "This Week", to: `/result?rollno=${rollno}&week=this` },
    { name: "Yesterday", to: `/result?rollno=${rollno}&week=yesterday` },
    { name: "Today", to: `/result?rollno=${rollno}&week=today` },
  ];

  useEffect(() => {
    if (!currentUser) router.replace("/login");
    // scroll to last element
    if (!weekLastItem.current) return;
    weekLastItem.current.scrollIntoView({ block: "end" });
  }, [currentUser]);

  function handleAttendance() {
    const from = FormatDate(date.from);
    const to = FormatDate(date.to);
    router.push(`/result?rollno=${rollno}&from=${from}&to=${to}`);
  }

  function onMonthChange(e: React.ChangeEvent<HTMLInputElement>) {
    const month = FormatDate(e.target.value);
    router.push(`/result/?rollno=${rollno}&month=${month}`);
  }

  return (
    <div className="home-page">
      <input
        type="text"
        placeholder="ID"
        value={rollno}
        className="rollNo-input"
        autoCorrect="off"
        spellCheck={false}
        onChange={(e) => setRollno(e.target.value)}
      />

      {/* <input
        type="checkbox"
        checked={excludeOtherSubjects}
        onChange={(e) => {
          setExcludeOtherSubjects(e.target.checked);
        }}
      /> */}

      <div className="section2 mobile">
        <div className="title">Range:</div>

        <div className="buttons-row">
          <button
            className="date-input from-btn"
            onClick={() => {
              if (inputFrom.current) inputFrom.current.click();
            }}
          >
            {date.from || "From"}
            <MdOutlineCalendarMonth size={22} />
          </button>

          <button
            className="date-input to-btn"
            onClick={() => {
              if (inputTo.current) {
                inputTo.current.focus();
                inputTo.current.click();
              }
            }}
          >
            {date.to || "To"}
            <MdOutlineCalendarMonth size={22} />
          </button>
        </div>
      </div>
      <div className="section2 pc">
        <div className="title">Range:</div>

        <div className="buttons-row">
          <input
            ref={inputFrom}
            type="date"
            className="from-input"
            defaultValue={date.from}
            onChange={(e) => {
              setDate({ ...date, from: e.target.value });
            }}
          />
          <input
            ref={inputTo}
            type="date"
            className="to-input"
            defaultValue={date.to}
            onChange={(e) => {
              setDate({ ...date, to: e.target.value });
            }}
          />
        </div>
      </div>

      {/* MONTH */}

      <div className="section2 month">
        <div className="title">Month:</div>
        <div className="buttons-row">
          <button
            className="date-input"
            onClick={() => {
              if (monthRef.current) monthRef.current.click();
            }}
          >
            {month || "Month"}
            <MdCalendarMonth size={22} />
          </button>

          <input
            ref={monthRef}
            type="month"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              onMonthChange(e);
            }}
          />
        </div>
      </div>

      <div className="section-outer">
        <div className="section">
          {week.map((w, week_index) => {
            if (week_index == week.length - 1) {
              return (
                <div
                  ref={weekLastItem}
                  key={w.name}
                  onClick={() => router.push(w.to)}
                >
                  {w.name}
                </div>
              );
            } else {
              return (
                <div key={w.name} onClick={() => router.push(w.to)}>
                  {w.name}
                </div>
              );
            }
          })}
        </div>
      </div>
      <button onClick={handleAttendance} className="attendance-button">
        Attendance
      </button>
    </div>
  );
}

// getCookie("21u41a0546", "18122001").then((cookiRes) => {
// console.log(cookiRes);
// getAttendence({
//   cookie: cookiRes.cookie,
//   rollNo: "21u41a0546",
//   from: "",
//   to: "",
//   excludeOtherSubjects: true,
// }).then((res) => {
//   console.log(res);
// });
// getGraph({
//   rollNo: "21u41a0546",
//   cookie: cookiRes.cookie,
//   excludeOtherSubjects: true,
// }).then((res) => {
//   console.log(res);
// });
// });
