"use client";
import {
  RefObject,
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import {
  DataProps,
  AttendanceType,
  GraphDataType,
  GraphResType,
  UserDataType,
  SubjectAttendaceType,
  SubjectsGraphType,
} from "./DataContextProps";

import getCookie from "@/actions/getCookie";

export default function useData() {
  return useContext(DataContext);
}

export const DataContext = createContext<DataProps>({} as DataProps);

export function DataProvider({ children }: { children: React.ReactNode }) {
  // const [users, setUsers] = useState<UserDataType[]>([]);
  // const [currentUser, setCurrentUser] = useState<UserDataType | null>(null);
  // const [rollno, setRollno] = useState("");
  const [users, setUsers] = useState<UserDataType[]>(() => {
    if (typeof window !== "undefined") {
      const users_local = JSON.parse(
        localStorage.getItem("users") || "[]"
      ) as UserDataType[];
      return users_local;
    }
    return [];
  });

  const [currentUser, setCurrentUser] = useState<UserDataType | null>(() => {
    if (typeof window !== "undefined") {
      const users_local = JSON.parse(
        localStorage.getItem("users") || "[]"
      ) as UserDataType[];
      const userId = localStorage.getItem("currentUser");
      if (userId) {
        const user = users_local.find((u) => u.user === userId);
        return user ? user : null;
      }
    }
    return null;
  });

  const [rollno, setRollno] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const userId = localStorage.getItem("currentUser");
      return userId ? userId : "";
    } else return "";
  });
  const [graphData, setGraphData] = useState<GraphDataType>([]);
  const [attendance, setAttendance] = useState<AttendanceType>({
    bio: {},
    data: [],
    total: {
      subject: "",
      held: "",
      attend: "",
      percent: "",
    },
  });
  const [subjectsGraphData, setSubjectsGraphData] = useState<SubjectsGraphType>(
    []
  );
  const cookieIsLoading = useRef<boolean>(false);

  useEffect(() => {
    if (users.length > 0) localStorage.setItem("users", JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", currentUser.user);
      setUsers((prvUsers) => {
        return prvUsers.map((user) => {
          if (user.user == currentUser.user) {
            user = currentUser;
          }
          return user;
        });
      });
    }
  }, [currentUser]);

  function validateCookie() {
    if (!currentUser) return;
    const expireDate =
      new Date(currentUser.expire).getTime() + 1000 * 60 * 60 * 4;

    if (expireDate < Date.now()) {
      console.warn("expired, ", currentUser?.expire);
      cookieIsLoading.current = true;
      getCookie(currentUser.user, currentUser?.password).then((res) => {
        if (res) {
          console.log("new Cookie Created");
          currentUser.cookie = res.cookie;
          currentUser.expire = res.expire;
          setCurrentUser({ ...currentUser });
          cookieIsLoading.current = false;
        }
      });
    } else {
      console.log(
        "valid for: ",
        ((expireDate - Date.now()) / (1000 * 60 * 60)).toFixed(2),
        " hrs"
      );
    }
  }

  const value = {
    users,
    setUsers,
    graphData,
    setGraphData,
    currentUser,
    setCurrentUser,
    subjectsGraphData,
    setSubjectsGraphData,
    rollno,
    setRollno,
    attendance,
    setAttendance,
    cookieIsLoading,
    validateCookie,
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
