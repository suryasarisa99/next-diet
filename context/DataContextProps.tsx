// @types
export type UserDataType = {
  user: string;
  password: string;
  role: string;
  cookie: string;
  expire: string;
};

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
  validateCookie: () => void;
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

export type GraphResType = {
  data: { SubjectAttendaceType: string }[];
  total: SubjectAttendaceType;
  week: string;
}[];

export type GraphDataType = {
  subject: string;
  held: string;
  attend: string;
  percent: string;
  name: string;
}[];

export type SubjectsGraphType = GraphDataType[];
