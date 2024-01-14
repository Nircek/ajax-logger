/* eslint-disable no-unused-vars */
let int = undefined;
let counter = 0;
const thead = document.getElementById("thead");
const tbody = document.getElementById("tbody");
let firstRun = undefined;

/**
 * Updates and returns first run date.
 * @return {string}
 */
function firstRunDate() {
  return (firstRun = firstRun ?? new Date().toISOString().split("T")[0]);
}
let currentUrl;
/**
 * Creats new data row in the table.
 * @return {HTMLElement} row element
 */
function newRow() {
  return tbody.appendChild(document.createElement("tr"));
}
/**
 * Adds new cells in the row.
 * @param {HTMLElement} rowElement
 * @param {any[]} rowList array of data
 * @param {0|1|2} variant 0->data, 1->header, 2->error
 */
function addRow(rowElement, rowList, variant = 0) {
  rowList.forEach((e) =>
    rowElement
      .appendChild(document.createElement(variant == 1 ? "th" : "td"))
      .appendChild(document.createTextNode(e))
  );

  if (variant == 2) {
    rowElement.lastChild.setAttribute(
      "colspan",
      thead.childElementCount - rowList.length + 1
    );
  }
}
/**
 * @return {string} current time in 12:00:00,000 format
 */
function getTime() {
  return new Date().toLocaleTimeString("pl", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });
}
/**
 * Stops logging.
 */
function stop() {
  clearInterval(int);
}

/**
 * Starts logging.
 */
function start() {
  stop();
  firstRunDate();
  int = setInterval(performRequest, 1000);
  currentUrl = document.getElementById("url").value;
}
/**
 * Sort keys and return corresponding arrays of keys and values.
 * @param {object} obj any object
 * @return {[str[], any[]]} (keys array, value array)
 */
function unzip(obj) {
  return Object.entries(obj)
    .sort()
    .reduce(
      (o, c) => [
        [...o[0], c[0]],
        [...o[1], c[1]],
      ],
      [[], []]
    );
}
/**
 * Perform request and store it in the table.
 */
async function performRequest() {
  const c = counter++;
  const t0 = performance.now();
  const time = () => performance.now() - t0;
  try {
    const response = await fetch(currentUrl, { cache: "no-cache" });
    const data = await response.json();
    data[".i"] = c;
    data[".time"] = time();
    data[".timestamp"] = getTime();
    const [headRow, dataRow] = unzip(data);
    if (thead.childElementCount == 0) addRow(thead, headRow, 1);
    addRow(newRow(), dataRow);
  } catch (e) {
    addRow(newRow(), [c, time(), getTime(), e], 2);
  }
}

/**
 * Make a download dialog of virtual file.
 * @param {string} filename
 * @param {string} text
 */
function download(filename, text) {
  // https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/csv;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
/**
 * Export all data from table to CSV file.
 */
function exportCSV() {
  const csv = [
    [...thead.getElementsByTagName("th")].map((e) => e.innerText),
    ...[...tbody.getElementsByTagName("tr")].map((e) =>
      [...e.getElementsByTagName("td")]
        .map((e) => `"${e.innerText.replace('"', '""')}"`)
        .join()
    ),
  ].join("\n");
  download(`ajax-logger-${firstRunDate()}.csv`, csv);
}

/**
 * Drop database.
 */
function clearData() {
  if (!window.confirm("Do you really want to clear all data?")) return;
  counter = 0;
  thead.replaceChildren();
  tbody.replaceChildren();
}
