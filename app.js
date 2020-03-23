import express from "express";
import csv from "csv-parser";
import fs from "fs";
import moment from "moment";

import aiaData from "./static-data/AIA_Data_23032020";

const app = express();
const port = 3000;

moment.locale("en-SG");

const getAiaDataByYear = year => {
  return aiaData
    .filter(
      ({ points, awardedDate }) =>
        (points === "50" || points === "100") && awardedDate.includes(year)
    )
    .map(({ awardedDate }) => awardedDate)
    .map(each => moment(each, "YYYY-MM-DD").startOf("day"));
};

const padZero = number => number.toString().padStart(2, "0");

// Methods
app.get("/", (req, res) => {
  const now = moment();
  const path = `./static-data/${now.year()}_${padZero(now.month() + 1)}.csv`;
  const result = [];
  // Reads CSV for particular year and month
  fs.createReadStream(path)
    .pipe(csv())
    .on("data", row =>
      result.push({
        date: moment(row[0], "D/M/YYYY").startOf("day"),
        steps: row[2] ? Number(row[2].replace(",", "")) : null
      })
    )
    .on("end", () => {
      const aiaData = getAiaDataByYear(now.year());
      const fitbitData = result.slice(1, result.length - 1);
      // In Fitbit but not in AIA
      const diff = fitbitData
        .filter(
          ({ date, steps }) =>
            steps >= 10000 && !aiaData.find(aiaDate => aiaDate.isSame(date))
        )
        .map(each => ({
          steps: each.steps,
          date: each.date.toLocaleString()
        }));

      res.status(200).send({
        fitbit: fitbitData,
        aia: aiaData,
        diff
      });
    });
});

app.get("/:year/:month", (req, res) => {
  const yearParam = req.params.year;
  const monthParam = req.params.month;

  const path = `./static-data/${yearParam}_${monthParam}.csv`;
  const result = [];
  // Reads CSV for particular year and month
  fs.createReadStream(path)
    .pipe(csv())
    .on("data", row =>
      result.push({
        date: moment(row[0], "D/M/YYYY").startOf("day"),
        steps: row[2] ? Number(row[2].replace(",", "")) : null
      })
    )
    .on("end", () => {
      const aiaData = getAiaDataByYear(yearParam);
      const fitbitData = result.slice(1, result.length - 1);
      // In Fitbit but not in AIA
      const diff = fitbitData
        .filter(
          ({ date, steps }) =>
            steps >= 10000 && !aiaData.find(aiaDate => aiaDate.isSame(date))
        )
        .map(each => ({
          steps: each.steps,
          date: each.date.toLocaleString()
        }));

      res.status(200).send({
        fitbit: fitbitData,
        aia: aiaData,
        diff
      });
    });
});

app.listen(port, () => {
  console.log(`Server Running on: ${port}`);
});
