"use server";
const cheerio = require("cheerio");

export async function parseTableAsObjects(html) {
  const data = [];
  const subjects = [];
  console.log(html);

  let $ = cheerio.load(html);
  const table = $("table");

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

  const labs = formatLabs(table, $);

  const studentRows = table.find("tr[name='student']");
  console.log("len:", studentRows.length);

  //* Loop over Attendace Rows:
  studentRows.each((_, tr) => {
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
    labs,
  };
  // console.log(typeof table);
}

function formatLabs(table, $) {
  const trLabs = $(table).find("tr#trlabs");

  if (
    trLabs.attr("style") === "display:none" ||
    trLabs.attr("style") === "display: none" ||
    trLabs.attr("style") === "display: none;" ||
    trLabs.attr("style") === "display:none;"
  ) {
    console.log("Labs not available");
    return [];
  }

  const labsRow = $("tr#trlabs>td").slice(2);

  if (labsRow.length === 0) {
    console.log("No labs found");
    return;
  }
  const labs = [];

  labsRow.each((_, lab) => {
    const trs = $(lab).find("tr");
    const ob = {};
    trs.each((_, tr) => {
      const tds = $(tr).find("td");
      const input = tds.eq(0).find("input");
      const selected = tds.eq(1).find("select option:selected");
      ob[_ + 1] = {
        input: input.attr("checked") ? true : false,
        selected: selected.text(),
        value: selected.attr("value"),
      };
    });
    labs.push(ob);
  });
  return labs;
}
