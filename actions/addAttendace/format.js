"use server";
const cheerio = require("cheerio");

export async function parseTableAsObjects(html) {
  const data = [];
  const subjects = [];

  let $ = cheerio.load(html);
  let table = $("table");

  let trs = table.find("tr");

  const doa = $("#spndate").text();
  const tableName = $(table).attr("name");

  // * Loop Over td ( cell ) in  Subjects Row:
  const subjectsRow = trs.eq(1);
  //  td contain select box and inside option contain subject name
  subjectsRow
    .find("td")
    .slice(2)
    .each((i, td) => {
      //  selected subject
      let SelectedSubject = $(td).find("option:selected");

      let subject = {
        name: SelectedSubject.text(),
        id: SelectedSubject.attr("value"),
        subjectType: SelectedSubject.attr("title"),
      };
      subjects.push(subject);
    });

  //* Loop over Attendace Rows:
  trs.slice(4).each((_, tr) => {
    let tds = $(tr).find("td");
    const item = {};
    const result = [];
    const firstElm = $(tds[0]);
    const secondElm = $(tds[1]);
    item.batch = firstElm.attr("name");
    item.index = +firstElm.text();
    item.id = secondElm.attr("name");
    item.rollNo = secondElm.text();

    // get name from tr  attributes
    item.name = Object.entries($(tr).attr())
      .filter(([key, value]) => value == "")
      .reduce((prv, [key, value]) => {
        if (prv) return prv + " " + key;
        return key;
      }, "");

    // * Loop Over Each Table Cell in row
    tds.slice(2).each((_, td) => {
      let input = $(td).find("input").first();
      const status = input.attr("checked") ? true : false;
      result.push(status);
    });
    item.result = result;
    data.push(item);
  });

  return {
    subjects,
    data,
    doa,
    tableName,
  };
  // console.log(typeof table);
}

parseTableAsObjects();
