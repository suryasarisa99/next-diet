"use server";

export default async function PostAttendanceUpdate(
  data,
  batch = "2021",
  cookie
) {
  let arrSubjectId = data.subjects.map((subject) => subject.id).join(",");
  const arrElectivies =
    "[" + Array(data.subjects.length).fill('"-"').join(",") + "]";
  const arrLabs =
    data.labs.length > 0
      ? "[" +
        data.labs
          .map((lab, i) => {
            if (!lab["1"].input && !lab["2"].input) {
              return `"-"`;
            } else if (lab["1"].input && lab["2"].input) {
              return `"1,${lab["1"].value}~2,${lab["2"].value}~"`;
            } else if (lab["1"].input && !lab["2"].input) {
              // return `"1,${lab["1"].value}~2,${lab["1"].value}~"`;
              return `"1,${lab["1"].value}~"`;
              // return `"1,${lab["1"].value}~2,${lab["2"].value}~"`;
            }
          })
          .join(",") +
        "]"
      : arrElectivies;
  const arrNoOfPeriods = Array(data.subjects.length).fill(1).join(",");
  const arrPeriod = Array(data.subjects.length)
    .fill(0)
    .map((_, i) => i + 1)
    .join(",");
  const arrStudentId = data.data.map((student) => student.id);
  let arrAbsentees =
    "[" +
    data.data
      .map((std) => {
        return (
          std.result.reduce((state, current) => {
            return (state += current ? "A," : "P,");
          }, '"') + '"'
        );
      })
      .join(",") +
    "]";
  //   const tableName = `tblBtech_${branchId}_${semesterId}_${section}`;
  const arrStudentBatch = data.data.map((student) => student.batch).join(",");
  const arrSubjectType =
    "[" +
    data.subjects.map((subject) => '"' + subject.subjectType + '"').join(",") +
    "]";

  // const arrLabs1 = `["-","-","-","-","1,1629~","1,1629~","1,1629~"]`;
  // arrSubjectId = `1623,1624,1625,1627,-1,-1,-1`;
  const body = `doa=${data.doa}\r\narrPeriod=${arrPeriod}\r\narrSubjectId=${arrSubjectId}\r\narrLabs=${arrLabs}\r\narrNoOfPeriods=${arrNoOfPeriods}\r\narrStudentId=${arrStudentId}\r\narrAbsentees=${arrAbsentees}\r\ntableName=${data.tableName}\r\narrStudentBatch=${arrStudentBatch}\r\narrElectives=${arrElectivies}\r\ncourseid=${data.courseId}\r\nbranchid=${data.branchId}\r\nsemesterid=${data.semesterId}\r\nbatch=${batch}\r\narrsubjecttype=${arrSubjectType}\r\nmode=Update`;
  // return body;
  // return data.labs;
  return fetch(
    "http://103.138.0.69/ECAP/ajax/Academics_onlineattendance,App_Web_h1yiqvjw.ashx?_method=SaveOnLineAttendance&_session=r",
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
      body: body,
    }
  ).then((res) => res.text());
}
