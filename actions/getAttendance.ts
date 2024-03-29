"use server";

import axios from "axios";
import cheerio from "cheerio";
import { parseBioTable, parseTableAsObjects } from "@/actions/utility";

type getAttendenceProps = {
  cookie: string;
  rollNo: string;
  from: string | null | undefined;
  to: string | null | undefined;
  excludeOtherSubjects: boolean;
};

export default async function getAttendence({
  cookie,
  rollNo,
  from = "",
  to = "",
  excludeOtherSubjects = true,
}: getAttendenceProps) {
  console.log(" $getAttendance: ");
  let body = `rollNo=${rollNo}\r\nfromDate=${from}\r\ntoDate=${to}\r\nexcludeothersubjects=${excludeOtherSubjects}`;

  return new Promise((resolve, reject) => {
    axios
      .post(
        "http://103.138.0.69/ECAP/ajax/StudentAttendance,App_Web_h1yiqvjw.ashx?_method=ShowAttendance&_session=no",
        body,
        {
          headers: {
            Accept: "*/*",
            "Accept-Language": "en-US,en;q=0.9",
            Connection: "keep-alive",
            "Content-Type": "text/plain;charset=UTF-8",
            Cookie: cookie,
            Origin: "http://103.138.0.69",
            Referer:
              "http://103.138.0.69/ecap/Academics/StudentAttendance.aspx?scrid=3&showtype=SA",
            "User-Agent":
              "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0",
          },
        }
      )
      .then(async (res) => {
        let cleaned = res.data.replace(/\\\'/g, "");
        // resolve(cleaned);
        const $ = cheerio.load(cleaned);

        let bioTable = $("table").eq(2);
        let table = $("table").eq(3);
        let { total, data } = await parseTableAsObjects(table, $);
        let bio = await parseBioTable(bioTable, $);

        if (excludeOtherSubjects)
          data = data.filter((d) => {
            return d.held != 0;
          });

        resolve({
          data,
          total,
          bio,
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
}
