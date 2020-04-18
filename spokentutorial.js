let x = new Date();
const init = x.getTime();
const fs = require("fs");
fs.writeFile("./start.txt", init + "\n", function (err) {
  if (err) {
    return console.log(err);
  }

  console.log("The file was saved!\n");
});
const puppeteer = require("puppeteer");
const mongoose = require("mongoose");

mongoose.connect(
  "mongodb://localhost/spokentutorial",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.log("[err]" + err);
    } else {
      console.log("Connected to DB!");
    }
  }
);

let courseSchema = mongoose.Schema({
  course: String,
  title: String,
  link: String,
  foss: String,
  outline: String,
  level: String,
});

let Course = mongoose.model("Course", courseSchema);

async function getCourses(url) {
  const browser = await puppeteer.launch({
    ignoreDefaultArgs: ["--disable-extensions"],
  });
  const page = await browser.newPage();
  console.log("\nWaiting for 3 seconds\n - Opening ", url);
  await page.waitFor(3000);
  page.setDefaultNavigationTimeout(0);
  await page.goto(url, { timeout: 0, waitUntil: "networkidle0" });

  const data = await page.evaluate(() => {
    x = document.getElementById("id_search_foss");
    courses = [];
    for (i = 1; i < x.length; i++) {
      a = x.options[i].label;
      courses.push(a.substring(0, a.length - 4));
    }
    return courses;
  });
  browser.close();
  console.log(`There are ${data.length} courses!`);
  for (let i = 0; i < data.length; i++) {
    replink = data[i].replace(/ /g, "+");
    if (replink.endsWith("+")) {
      replink = replink.substring(0, replink.length - 1);
    }
    await scrape(
      `https://spoken-tutorial.org/tutorial-search/?search_foss=${replink}&search_language=English`,
      replink
    );
  }
  return data;
}

async function scrape(url, x) {
  const browser = await puppeteer.launch({
    ignoreDefaultArgs: ["--disable-extensions"],
  });
  const page = await browser.newPage();
  console.log(
    "\nWaiting for 3 seconds\n -",
    x.replace(new RegExp("[+]", "gm"), " ")
  );
  await page.waitFor(3000);
  await page.goto(url, { timeout: 0, waitUntil: "networkidle0" });

  await page.setViewport({
    width: 1200,
    height: 800,
  });

  await page.screenshot({
    path: "yoursite.png",
    fullPage: true,
  });

  const data = await page.evaluate(() => {
    resultData = [];
    results = document.querySelectorAll("div.result-record.row");
    for (let i = 0; i < results.length; i++) {
      level = results[i].children[2].innerText;
      title = results[i].children[1].children[0].innerText;
      link = results[i].children[1].children[0].querySelector("a").href;
      info = results[i].children[1].children[1].innerText.split("\n\n");
      resultData.push({
        title: title.replace(/^[0-9]{0,}(.)/, ""),
        link: link,
        foss: info[0].substr(7),
        outline: info[1].substr(9),
        level: level,
      });
    }
    return resultData;
  });
  // Writing Links in console
  x = x.replace(new RegExp("[+]", "gm"), " ");
  data.forEach((elem) => {
    elem["course"] = x;
  });
  Course.insertMany(data, () => {
    console.log(` - Saved Data to DB with length of ${data.length}`);
  });

  await browser.close();
}

getCourses(
  "https://spoken-tutorial.org/tutorial-search/?search_foss=OpenModelica+OpenIPSL&search_language=English"
).then(() => {
  let xy = new Date();
  const end = x.getTime();
  fs.appendFile("./start.txt", end, (err) => {
    console.log(err);
  });
  console.log(
    `\n\nTime Initialized : ${init}\nConcluded        : ${end}\n─────────────────────────────────\nTotal            : ${
      end - init
    }`
  );
});
