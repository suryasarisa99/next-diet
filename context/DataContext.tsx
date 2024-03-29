"use client";
import {
  RefObject,
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";

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
export type GraphDataType = {
  subject: string;
  held: string;
  attend: string;
  percent: string;
  name: string;
}[];

export type SubjectsGraphType = GraphDataType[];

export type DataProps = {
  users: UserDataType[];
  setUsers: React.Dispatch<React.SetStateAction<UserDataType[]>>;
  graphData: GraphDataType;
  setGraphData: React.Dispatch<React.SetStateAction<GraphDataType>>;
  currentUser: UserDataType | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserDataType | null>>;
  subjectsGraphData: SubjectsGraphType;
  setSubjectsGraphData: React.Dispatch<React.SetStateAction<SubjectsGraphType>>;
  rollno: string;
  setRollno: React.Dispatch<React.SetStateAction<string>>;
  attendance: AttendanceType;
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceType>>;
  cookieIsLoading: React.MutableRefObject<boolean>;
};

export type AttendanceType = {
  bio: any;
  data: SubjectAttendaceType[];
  total: SubjectAttendaceType;
};

export type SubjectAttendaceType = {
  subject: string;
  held: string;
  attend: string;
  percent: string;
};
// data: SubjectAttendaceType[];
// total: SubjectAttendaceType;
// week: string;
export type GraphResType = {
  data: { SubjectAttendaceType: string }[];
  total: SubjectAttendaceType;
  week: string;
}[];
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
    if (currentUser) localStorage.setItem("currentUser", currentUser.user);
  }, [users, currentUser]);

  //   get data from local storage
  // useEffect(() => {
  //   const users_local = JSON.parse(
  //     localStorage.getItem("users") || "[]"
  //   ) as UserDataType[];

  //   if (users_local.length > 0) {
  //     setUsers(users_local);
  //     const userId = localStorage.getItem("currentUser");
  //     if (userId) {
  //       const user = users_local.find((u) => u.user === userId);
  //       if (user) {
  //         setCurrentUser(user);
  //         setRollno(userId);
  //       }
  //     }
  //   }
  // }, []);

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
