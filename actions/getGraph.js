"use server";

import getAttendence from "./getAttendance";

export default async function getGraph({
  cookie,
  rollNo,
  excludeOtherSubjects,
  from = "",
}) {
  const groupDays = 7;
  const fromMonths = 2;

  function FormatDate(date) {
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = String(date.getUTCFullYear());
    return `${day}/${month}/${year}`;
  }

  function ToIstTime(timestamp) {
    const date = new Date(timestamp);
    const ISTOffset = 330; // 5.5 hours in minutes
    date.setMinutes(date.getMinutes() + ISTOffset);
    return date;
  }

  let prvMonth = new Date();

  if (from) {
    prvMonth = new Date(from);
    prvMonth.setHours(0, 0, 0, 0);
    prvMonth = ToIstTime(prvMonth.getTime());
  } else {
    prvMonth.setMonth(prvMonth.getMonth() - fromMonths);
    prvMonth.setDate(1);
    prvMonth.setHours(0, 0, 0, 0);

    prvMonth = ToIstTime(prvMonth.getTime());
    console.log(prvMonth);
  }
  //   prvMonth.setMinutes(prvMonth.getMinutes() - prvMonth.getTimezoneOffset());
  const today = new Date();

  //* Creating a range of dates
  let dates = [];
  let currentDate = prvMonth;

  console.log(prvMonth, from);
  while (currentDate < today) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + groupDays);
  }
  console.log("graph: requests ", dates.length);
  console.log("graph: dates ", dates);

  // * Getting Attendence
  let attendencePromises = dates.map((date) => {
    let toDate = new Date(date);
    toDate.setDate(toDate.getDate() + groupDays - 1);
    toDate = FormatDate(toDate);

    return getAttendence({
      from: FormatDate(date),
      to: toDate,
      rollNo,
      cookie,
      excludeOtherSubjects,
    });
  });

  let attendence = await Promise.all(attendencePromises).catch((err) => {
    console.log("err: ", err);
  });

  // * Maping Data
  return attendence.map((item, i) => {
    return {
      data: item.data,
      total: item.total,
      week: dates[i],
    };
  });
}
