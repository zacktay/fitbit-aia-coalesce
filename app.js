import express from "express";
import csv from "csv-parser";
import fs from "fs";
import moment from "moment";

import aiaData from "./static-data/AIA_Data";

const app = express();
const port = 3000;

const padZero = number => number.toString().padStart(2, "0");

const processRow = row => ({
  date: moment(row[0], "D/MM/YYYY").endOf("day"),
  steps: row[2] ? Number(row[2].replace(",", "")) : null
});

const getAiaDataByYearAndMonth = (year, month) => {
  const startOfMonth = moment([year, month])
    .startOf("month")
    .startOf("day");
  const endOfMonth = moment([year, month])
    .endOf("month")
    .endOf("day");

  return aiaData
    .filter(({ points }) => points === "50" || points === "100")
    .map(({ awardedDate }) => moment(awardedDate, "YYYY-MM-DD").endOf("day"))
    .filter(
      each =>
        each.isSameOrAfter(startOfMonth) && each.isSameOrBefore(endOfMonth)
    );
};

const getDiff = (aiaData, result) => {
  const fitbitData = result.slice(1, result.length - 1);
  // In Fitbit but not in AIA
  const diff = fitbitData
    .filter(
      ({ date, steps }) =>
        steps >= 10000 && !aiaData.find(aiaDate => aiaDate.isSame(date, "day"))
    )
    .map(({ date, steps }) => ({
      steps: steps,
      date: date.toLocaleString()
    }));

  return {
    fitbit: fitbitData,
    aia: aiaData,
    diff
  };
};

// Methods
// Default - Current Year and Month
app.get("/", (req, res) => {
  const now = moment();
  const path = `./static-data/${now.year()}_${padZero(now.month() + 1)}.csv`;
  const result = [];

  fs.createReadStream(path)
    .pipe(csv())
    .on("data", row => result.push(processRow(row)))
    .on("end", () => {
      const aiaData = getAiaDataByYearAndMonth(now.year(), now.month());
      const response = getDiff(aiaData, result);

      res.status(200).send(response);
    });
});

// Specific Year and Month
app.get("/:year/:month", (req, res) => {
  const yearParam = req.params.year;
  const monthParam = req.params.month;
  const path = `./static-data/${yearParam}_${monthParam}.csv`;
  const result = [];

  fs.createReadStream(path)
    .pipe(csv())
    .on("data", row => result.push(processRow(row)))
    .on("end", () => {
      const aiaData = getAiaDataByYearAndMonth(yearParam, monthParam - 1);
      const response = getDiff(aiaData, result);

      res.status(200).send(response);
    });
});

app.listen(port, () => {
  moment.locale("en-SG");
  console.log(`Server Running on Port: ${port} and Locale: ${moment.locale()}`);
});
