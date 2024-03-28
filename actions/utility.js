"use server";

import cheerio from "cheerio";

export async function parseTableAsObjects(table, $) {
  let trs = table.find("tr");
  console.log("trs length: ", trs.length);
  let data = [];
  const keys = ["subject", "held", "attend", "percent"];

  let lastRow = trs.last();

  console.log("inside parseTableAs Objects fun: ");

  trs
    .slice(1)
    .slice(0, -1)
    .each((_, tr) => {
      let tds = $(tr).find("td");
      let tdData = {};
      tds.slice(1).each((i, td) => {
        console.log($(td).text());
        if (i > 0) {
          tdData[keys[i]] = +$(td).text();
        } else {
          tdData[keys[i]] = $(td).text();
        }
      });
      data.push(tdData);
    });

  // for Total
  let tdData = {};
  let lastRowTds = lastRow.find("td");
  lastRowTds.each((i, td) => {
    tdData[keys[i]] = $(td).text();
  });
  console.log("data", data);

  return {
    data,
    total: tdData,
  };
}

export async function parseBioTable(table, $) {
  let trs = table.find("tr");
  let data = [];

  let obj = {};
  trs.each((i, tr) => {
    let $tr = $(tr);
    let tds = $tr.find("td");
    let key = $(tds[0]).text().replace(" ", "");
    let value = $(tds[2]).text();
    obj[key] = value;
  });
  return obj;
}

export async function getTodo(n) {
  return fetch(`https://jsonplaceholder.typicode.com/todos/${n}`)
    .then((response) => response.json())
    .then((json) => json);
}

export async function getFakeData() {
  return await new Promise((resolve, reject) => {
    setTimeout(() => resolve("Data is Resolved  @Surya"), 4000);
  });
}
