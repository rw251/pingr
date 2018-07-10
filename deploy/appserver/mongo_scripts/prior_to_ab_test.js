// Need to add a pageId. Bit like a session id e.g. when you visit a page you get a pageId
// which remains until you visit a new page at which point you get a new pageId

// 1. Stop PINGR to ensure no new events are created
// 2. Install node-uuid
// npm install --save uuid
// 2. Extract the events collection
// mongoexport -d pingr -c events --sort '{date:1}' --out events.json
// 3. Run this script to process the events
// 4. Imprt back into mongo
// mongoimport -d pingr -c events2 --drop events.processed.json
// 5. Run test script TODO
// var props = {};
// var props2 = {};
// db.events.find().forEach(function(e){ Object.keys(e).forEach(function(p){if(!props[p]) props[p]=1; else props[p]+=1;});})
// db.events2.find().forEach(function(e){ Object.keys(e).forEach(function(p){if(!props2[p]) props2[p]=1; else props2[p]+=1;});})
// print("The only thing printed below should be a line mentioning 'pageId'")
// Object.keys(props2).forEach(function(p){if(!props[p]) print("This should only happen for 'pageId':" + p);})
// Object.keys(props).forEach(function(p){if(!props2[p]) print("This should never print.");})
// 6. export events2 and then replace events collectoin for real

const fs = require('fs');
const uuidv1 = require('uuid/v4');
const lineReader = require('readline').createInterface({
  input: fs.createReadStream('events.json'),
  output: fs.createWriteStream('events.processed.json'),
});

let lastDate = new Date(2000, 1, 1);
let sessionPage = {};

const ifNewDateResetSessionObject = (dateAsString) => {
  const jYear = +dateAsString.substr(0, 4);
  const jMonth = -1 + +dateAsString.substr(5, 2);
  const jDay = +dateAsString.substr(8, 2);
  if (jYear !== lastDate.getFullYear() ||
    jMonth !== lastDate.getMonth() ||
    jDay !== lastDate.getDate()) {
    sessionPage = {};
    lastDate = new Date(jYear, jMonth, jDay);
  }
};

lineReader
  .on('line', function a(line) {
    const jLine = JSON.parse(line);

    ifNewDateResetSessionObject(jLine.date.$date);

    if (jLine.type === 'navigate') {
      if (['#processIndicators', '#outcomeIndicators',
        '#indicator-trend', '#indicator-benchmark', '#indicator-patient-list',
        '#processIndicatorsQS', '#outcomeIndicatorsQS'].indexOf(jLine.url) < 0) {
        if (sessionPage[jLine.sessionId] && sessionPage[jLine.sessionId].url === jLine.url) {
          jLine.pageId = sessionPage[jLine.sessionId].pageId;
        } else {
          jLine.pageId = uuidv1();
          sessionPage[jLine.sessionId] = { url: jLine.url, pageId: jLine.pageId };
        }
      } else {
        jLine.type = 'navigate-tab';
        jLine.pageId = sessionPage[jLine.sessionId] ? sessionPage[jLine.sessionId].pageId : '';
      }
    } else if (sessionPage[jLine.sessionId]) {
      jLine.pageId = sessionPage[jLine.sessionId].pageId;
    }

    this.output.write(`${JSON.stringify(jLine)}\n`);
  })
  .on('close', function b() {
    console.log(`Created "${this.output.path}"`);
  });
