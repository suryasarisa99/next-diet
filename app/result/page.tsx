"use client";
import { useState, useEffect, useCallback, Suspense, useRef } from "react";
import getAttendence from "@/actions/getAttendance";
import getGraph from "@/actions/getGraph";
import getCookie from "@/actions/getCookie";
import Skeleton from "react-loading-skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { FormatDate } from "@/context/DataContext";

import {
  AttendanceType,
  GraphDataType,
  GraphResType,
  SubjectsGraphType,
} from "@/context/DataContextProps";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import useData from "@/context/DataContext";

export default function Wrapper() {
  return (
    <Suspense>
      <ResultPage />
    </Suspense>
  );
}

function ResultPage() {
  const params = useSearchParams();
  const rollno = params.get("rollno") || "";
  const from = params.get("from");
  const to = params.get("to");
  const month = params.get("month");
  const week = params.get("week");
  const showGraphs = params.get("graphs");
  const subjectGraphRef = useRef<HTMLDivElement>(null);
  const [selectedSubject, setSelectedSubject] = useState<number>(0);
  const router = useRouter();
  const {
    currentUser,
    attendance,
    setAttendance,
    setGraphData,
    setSubjectsGraphData,
    users,
    setUsers,
    graphData,
    subjectsGraphData,
    setCurrentUser,
    cookieIsLoading,
    validateCookie,
  } = useData();

  type SortONType = "subject" | "held" | "attend" | "percent";

  const [sortOn, setSortOn] = useState<SortONType>("percent");
  const [graphsLoading, setGraphsLoading] = useState(false);

  const handleAttendance = useCallback(
    (
      from: string | null = "",
      to: string | null = "",
      cookie_param: string | null = ""
    ) => {
      if (cookieIsLoading.current) {
        console.warn("returning 1: May be Cookie Is Loading");
        return;
      }

      validateCookie();

      if (!rollno || !currentUser?.cookie || cookieIsLoading.current) {
        console.warn("returning 2: May Be Cookie is Loading");
        return;
      }

      console.log("@get-attendace");
      getAttendence({
        rollNo: rollno,
        cookie: cookie_param || currentUser?.cookie || "",
        from: from,
        to: to,
        excludeOtherSubjects: true,
      }).then((res) => {
        console.log("@finished get attendance");
        const data = res as AttendanceType;

        if (data.total.held == "Password") {
          console.warn("refecthing: cookie expired, got held = Password");
          getCookie(currentUser.user, currentUser?.password).then((res) => {
            if (res) {
              currentUser.cookie = res.cookie;
              currentUser.expire = res.expire;
              setCurrentUser({ ...currentUser });
              return;
            }
          });
        } else {
          setAttendance(data);
        }
      });

      // console.log("@get-graphs");

      let graphs = JSON.parse(localStorage.getItem("graphs") || "{}") as {
        [key: string]: GraphResType;
      };
      const userGraph = graphs[rollno.toLowerCase()];
      if (userGraph) {
        setGraphData(FormatGraphData(userGraph));
        setSubjectsGraphData(FormatSubjects(userGraph));

        handleGraphData(
          rollno,
          currentUser?.cookie || "",
          userGraph[userGraph.length - 1].week,
          true
        );
      } else {
        if (showGraphs === "yes") {
          setGraphsLoading(true);
          handleGraphData(rollno, currentUser?.cookie || "");
        }
      }
    },
    [rollno, currentUser]
  );

  function handleGraphData(
    rollno: string,
    cookie: string,
    from: string = "",
    update: boolean = false
  ) {
    getGraph({
      rollNo: rollno,
      cookie: cookie,
      excludeOtherSubjects: false,
      from: from,
    })
      .then((res) => {
        if (!update) {
          if (res?.[0]?.total?.held == "Password") return;
          const graphData = FormatGraphData(res as GraphResType);
          const subjectsGraphData = FormatSubjects(res as GraphResType);
          setGraphData(graphData);
          setSubjectsGraphData(subjectsGraphData);
          console.log("graph added of id: ", rollno.toLowerCase());
          let graphs = JSON.parse(localStorage.getItem("graphs") || "{}") as {
            [key: string]: GraphResType;
          };
          graphs[rollno.toLowerCase()] = res as GraphResType;
          localStorage.setItem("graphs", JSON.stringify(graphs));
        } else {
          // update
          console.log("graph updated of id: ", rollno.toLowerCase());
          let graphs = JSON.parse(localStorage.getItem("graphs") || "{}") as {
            [key: string]: GraphResType;
          };
          let userGraph = graphs[rollno.toLowerCase()];
          userGraph = userGraph.slice(0, userGraph.length - 1);
          userGraph = userGraph.concat(res);
          graphs[rollno.toLowerCase()] = userGraph;
          const graphData = FormatGraphData(userGraph as GraphResType);
          const subjectsGraphData = FormatSubjects(userGraph as GraphResType);
          setGraphData(graphData);
          setSubjectsGraphData(subjectsGraphData);
          console.log("new updated");
          console.log(graphs);
          localStorage.setItem("graphs", JSON.stringify(graphs));
        }
      })
      .catch((e) => {
        alert("Error: " + e.message);
      });
  }

  useEffect(() => {
    if (!currentUser?.cookie) router.replace("/login");
    return () => {
      setAttendance({
        data: [],
        bio: {},
        total: {
          subject: "",
          held: "",
          attend: "",
          percent: "",
        },
      });
      setGraphData([]);
      setSubjectsGraphData([]);
    };
  }, [currentUser]);

  useEffect(() => {
    console.log(" <> === Result UsEffect ===  <>");

    function fetchData() {
      if (month) {
        console.log("month: ", month);
      } else if (week) {
        switch (week) {
          case "today": {
            getTodayAttendace();
            break;
          }
          case "yesterday": {
            getYesterdayAttendace();
            break;
          }
          case "this": {
            getThisWeekAttendace();
            break;
          }
          case "bweek": {
            getBWeekAttendace();
            break;
          }
        }
      } else {
        console.log("fetching from and to: ");
        handleAttendance(from, to);
      }
    }
    fetchData();
  }, [currentUser]);

  function getTodayAttendace() {
    let date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setMinutes(0);
    let d = FormatDate(date.toLocaleString());
    handleAttendance(d, d);
  }

  function getYesterdayAttendace() {
    console.log("get Yesterday attendance");
    let date = new Date();
    date.setDate(date.getDate() - 1);
    date.setHours(0, 0, 0, 0);
    date.setMinutes(0);
    let d = FormatDate(date.toLocaleString());
    handleAttendance(d, d);
  }

  function getThisWeekAttendace() {
    /*
        - 6 and + 1 are for making monday as first of week, instead of sunday.
        if todya is sunday, means day is 0, so we subtract 6 to get prv monday
        else subtract the day + 1 to get monday
    */

    let date = new Date();
    let day = date.getDay();
    let from = new Date(date);
    let to = new Date(date);
    if (day == 0) {
      from.setDate(date.getDate() - 6);
      to.setDate(date.getDate());
    } else {
      from.setDate(date.getDate() - day + 1);
      to.setDate(date.getDate() + (6 - day + 1));
    }
    from.setHours(0, 0, 0, 0);
    from.setMinutes(0);
    to.setHours(0, 0, 0, 0);
    to.setMinutes(0);
    console.log(from, to);
    handleAttendance(FormatDate(from.toString()), FormatDate(to.toString()));
  }

  function getBWeekAttendace() {
    let date = new Date();
    let day = date.getDay();
    let from = new Date(date);
    let to = new Date(date);
    if (day == 0) {
      from.setDate(date.getDate() - 6 - 7);
      to.setDate(date.getDate() - 6 - 1);
    } else {
      from.setDate(date.getDate() - day - 7 + 1);
      to.setDate(date.getDate() - day + 1 + 1);
    }
    from.setHours(0, 0, 0, 0);
    from.setMinutes(0);
    to.setHours(0, 0, 0, 0);
    to.setMinutes(0);
    console.log(from, to);
    handleAttendance(FormatDate(from.toString()), FormatDate(to.toString()));
  }

  if (attendance.bio.RollNo != rollno) {
    return (
      <div className="loading-page">
        <span className="loader"></span>
      </div>
    );
  }

  return (
    <div className="results-page">
      {(graphsLoading || graphData.length > 0) && (
        <div className="graph-boxes">
          <div className="graph">
            {graphData.length > 0 ? (
              <ResponsiveContainer width={"100%"} height={320}>
                <LineChart data={graphData}>
                  <Line
                    type="monotone"
                    dataKey="held"
                    stroke="#82ca9d"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="attend"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                  <CartesianGrid stroke="#4d4d4d9c" />
                  {/* <XAxis dataKey="name" /> */}

                  <YAxis
                    allowDataOverflow={true}
                    allowDecimals={true}
                    domain={[0, 60]}
                    hide={true}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#2a2a2a",
                      border: "0px",
                      borderRadius: "8px",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="skt-lg">
                <div className="skt"></div>
              </div>
            )}
          </div>

          <div className="subjects">
            {subjectsGraphData.length > 0
              ? subjectsGraphData
                  .filter((subjectGraphData) => {
                    return subjectGraphData.some((subject) => {
                      return +subject.held > 0;
                    });
                  })
                  .map((subjectGraphData, sub_index) => {
                    return (
                      <p
                        key={subjectGraphData[0].subject}
                        className={
                          selectedSubject == sub_index ? "selected" : ""
                        }
                        onClick={() => {
                          if (subjectGraphRef.current)
                            subjectGraphRef.current.scrollIntoView({
                              behavior: "smooth",
                              block: "nearest",
                            });
                          setSelectedSubject(sub_index);
                        }}
                      >
                        {subjectGraphData[0].subject}{" "}
                      </p>
                    );
                  })
              : Array(9)
                  .fill(0)
                  .map((_, i) => {
                    return (
                      <div className="skt-sm" key={i}>
                        <div className="skt"> </div>
                      </div>
                    );
                  })}
          </div>

          <div className="graph" ref={subjectGraphRef}>
            {selectedSubject > -1 && subjectsGraphData.length > 0 ? (
              <ResponsiveContainer
                width={"100%"}
                height={320}
                key={subjectsGraphData[selectedSubject][0].subject}
              >
                <LineChart
                  key={subjectsGraphData[selectedSubject][0].subject}
                  data={subjectsGraphData[selectedSubject]}
                >
                  <Line
                    type="monotone"
                    dataKey="held"
                    stroke="#82ca9d"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="attend"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                  <CartesianGrid stroke="#6a6a6a77" />
                  {/* <XAxis dataKey="name" /> */}

                  {/* <YAxis
                  allowDataOverflow={false}
                  allowDecimals={true}
                  domain={[0, 8]}
                /> */}
                  <Tooltip
                    key={
                      subjectsGraphData[selectedSubject][0].subject + "tooltip"
                    }
                    contentStyle={{
                      backgroundColor: "#2a2a2a",
                      border: "0px",
                      borderRadius: "8px",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="skt-lg">
                <div className="skt"></div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="right-side">
        <div className="bio">
          <div className="name">
            <p className="label">Name</p>
            <p className="value">{attendance.bio.StudentName}</p>
          </div>
          <div className="rollNo">
            <p className="label">Roll No</p>
            <p className="value">{attendance.bio.RollNo}</p>
          </div>
          {/* <div className="bio-row"> */}
          <div className="course">
            <p className="label">Course</p>
            <p className="value">{attendance.bio.Course}</p>
          </div>
          <div className="semester">
            <p className="label">Semester</p>
            <p className="value">{attendance.bio.Semester?.substr(0, 2)}</p>
          </div>
          {/* </div> */}
        </div>

        <div className="results-table">
          <div className={"row head"}>
            <div
              className={
                "cell subject " + (sortOn == "subject" ? "active" : "")
              }
              onClick={() => setSortOn("subject")}
            >
              Subject
            </div>
            <div
              className={"cell cnt " + (sortOn == "held" ? "active" : "")}
              onClick={() => setSortOn("held")}
            >
              Held
            </div>
            <div
              className={"cell cnt " + (sortOn == "attend" ? "active" : "")}
              onClick={() => setSortOn("attend")}
            >
              Attend
            </div>
            <div
              className={
                "cell percentage " + (sortOn == "percent" ? "active" : "")
              }
              onClick={() => setSortOn("percent")}
            >
              Percent
            </div>
          </div>
          {(!sortOn
            ? attendance.data
            : attendance.data.sort((a, b) => {
                if (sortOn == "subject") {
                  return a.subject.localeCompare(b.subject);
                } else {
                  return +b[sortOn] - +a[sortOn];
                }
              })
          ).map((row, i) => {
            return (
              <div
                key={row.subject}
                className={"row " + (i % 2 == 0 ? " even" : "odd")}
              >
                <div className="cell subject">{row.subject}</div>
                <div className="cell cnt">{row.held}</div>
                <div className="cell cnt">{row.attend}</div>
                <div className="cell percentage">{row.percent}</div>
              </div>
            );
          })}
          <div key={"total"} className={"row total"}>
            <div className="cell subject">{attendance.total.subject}</div>
            <div className="cell cnt">{attendance.total.held}</div>
            <div className="cell cnt">{attendance.total.attend}</div>
            <div className="cell percentage">{attendance.total.percent}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormatSubjects(data: GraphResType) {
  let temp: any[][] = [];
  data[0].data.forEach((item, i) => {
    temp.push([]);
  });

  data.forEach((item, i) => {
    item.data.forEach((subject, j) => {
      const item = subject as any;
      item.name = FormatDate(item.name);
      temp[j].push(item);
    });
  });
  return temp as SubjectsGraphType;
}

function FormatGraphData(data: GraphResType) {
  return data.map((item, i) => {
    return {
      // name: "week " + i,
      name: FormatDate(item.week),
      attend: item.total.attend,
      held: item.total.held,
      percent: item.total.percent,
    };
  }) as GraphDataType;
}
