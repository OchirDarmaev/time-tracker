import { quickTimeReporturl } from "./features/quickTimeReport/quickTimeReporturl";

const res = quickTimeReporturl({
  query: {
    date: new Date().toISOString().split("T")[0],
  },
});

console.log(res);
