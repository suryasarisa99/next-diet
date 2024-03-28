"use client";
import { createContext, useContext, useEffect, useState } from "react";

export default function useData() {
  return useContext(DataContext);
}

// @types
export type UserDataType = {
  user: string;
  password: string;
  role: string;
  cookie: string;
  expire: string;
};
export type GraphDataType = {};
export type DataProps = {
  users: UserDataType[];
  setUsers: React.Dispatch<React.SetStateAction<UserDataType[]>>;
  graph: GraphDataType[];
  setGraph: React.Dispatch<React.SetStateAction<GraphDataType[]>>;
  currentUser: UserDataType | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserDataType | null>>;
  subjectsGraphData: GraphDataType[];
  setSubjectsGraphData: React.Dispatch<React.SetStateAction<GraphDataType[]>>;
  rollno: string;
  setRollno: React.Dispatch<React.SetStateAction<string>>;
  attendance: AttendanceType;
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceType>>;
};
export type AttendanceType = {
  bio: any;
  data: any[];
  total: any;
};

export const DataContext = createContext<DataProps>({} as DataProps);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<UserDataType[]>([]);
  const [graph, setGraph] = useState<GraphDataType[]>([]);
  const [attendance, setAttendance] = useState<AttendanceType>({
    bio: {},
    data: [],
    total: {},
  });
  const [currentUser, setCurrentUser] = useState<UserDataType | null>(null);
  const [subjectsGraphData, setSubjectsGraphData] = useState<GraphDataType[]>(
    []
  );
  const [rollno, setRollno] = useState("");

  useEffect(() => {
    if (users.length > 0) localStorage.setItem("users", JSON.stringify(users));
    if (currentUser) localStorage.setItem("currentUser", currentUser.user);
  }, [users, currentUser]);

  //   get data from local storage
  useEffect(() => {
    const users_local = JSON.parse(
      localStorage.getItem("users") || "[]"
    ) as UserDataType[];

    if (users_local.length > 0) {
      setUsers(users_local);
      const userId = localStorage.getItem("currentUser");
      if (userId) {
        const user = users_local.find((u) => u.user === userId);
        if (user) {
          setCurrentUser(user);
          setRollno(userId);
        }
      }
    }
  }, []);

  const value = {
    users,
    setUsers,
    graph,
    setGraph,
    currentUser,
    setCurrentUser,
    subjectsGraphData,
    setSubjectsGraphData,
    rollno,
    setRollno,
    attendance,
    setAttendance,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function FormatDate(d: string) {
  if (!d) return "";
  const date = new Date(d);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = String(date.getUTCFullYear());
  return `${day}/${month}/${year}`;
}
