/* eslint-disable no-unused-vars */
let int = undefined;
let counter = 0;
const thr = document.getElementById("thead");
let currentUrl;
/**
 * Creats new data row in the table.
 * @return {HTMLElement} row element
 */
function newRow() {
  return document
    .getElementById("tbody")
    .appendChild(document.createElement("tr"));
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
      thr.childElementCount - rowList.length + 1
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
    if (thr.childElementCount == 0) addRow(thr, headRow, 1);
    addRow(newRow(), dataRow);
  } catch (e) {
    addRow(newRow(), [c, time(), getTime(), e], 2);
  }
}
