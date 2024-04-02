"use server";
import axios from "axios";
import { parseTableAsObjects } from "./format";
export default async function getAttendenceReport(
  {
    semester = "6",
    section = "1",
    date = "08/01/2024",
    courseId = "1",
    branchId = "4",
  },
  cookie
) {
  // note: semesterId is 0 indexed, 6 semester means give 5
  // course id: 1 for btech, 5 for diploma
  // section 1 means "A", 2 means "B", 3 means "C"
  // branches:
  //  1: civil
  //  2: eee
  //  3: ece
  //  4: cse
  //  13: csm
  //  14: csd

  const body = `courseId=${courseId}\r\nbranchId=${branchId}\r\nsemesterId=${
    semester - 1
  }\r\nsection=${section}\r\ndoa=${date}\r\nallowNew=false\r\nallowEdit=true\r\ncheckType=A`;

  return axios
    .post(
      "http://103.138.0.69/ECAP/ajax/Academics_onlineattendance,App_Web_h1yiqvjw.ashx?_method=ShowPeriodsAndStudents&_session=r",
      body,
      {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.9",
          Connection: "keep-alive",
          "Content-Type": "text/plain;charset=UTF-8",
          Cookie: cookie,
          Origin: "http://103.138.0.69",
          Referer:
            "http://103.138.0.69/ecap/ACADEMICS/onlineattendance.aspx?scrid=237",
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        },
      }
    )
    .then((res) => {
      let cleaned = res.data.replace(/\\\'/g, "");
      return parseTableAsObjects(cleaned).then((data) => {
        data.semesterId = semester - 1;
        data.section = section;
        data.courseId = courseId;
        data.branchId = branchId;
        return data;
      });
      // await fs.writeFile("res4.html", cleaned);
    });
}
