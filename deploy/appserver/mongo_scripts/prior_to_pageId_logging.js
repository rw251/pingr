// Need to add a pageId. Bit like a session id e.g. when you visit a page you get a pageId
// which remains until you visit a new page at which point you get a new pageId

// OVERVIEW
//
// We extract all the events from PINGR, process them, then load them into
// a temporary collection. After verifying that all is well we then drop the
// temp collection and repeat the import but into the real collection.

// 1. Stop PINGR to ensure no new events are created
// 2. Install node-uuid
// npm install --save uuid
// 2. Extract the events collection
// mongoexport -d pingr -c events --sort '{date:1}' --out events.json
// 3. Run this script to process the events
// node prior_to_pageId_logging.js
// 4. Imprt back into mongo
// mongoimport -d pingr -c events2 --drop events.processed.json
// 5. Add indexes
// mongo pingr
// db.events2.createIndex({user:1, date:1})
// db.events2.createIndex({date:1})
// 6. Run entire test script below (changing the dates sent to the functions inNewChec.. and
//    inExistCh.. to ensure it doesn't take forever):

// var checked = 0;
// var inExistingCheckNew = function(dt){
//   checked =0 ;
//   db.events.find({date:{$gt:dt}}).forEach(function(e){
//     var query = {};
//     Object.keys(e).forEach(function(k){
//       if(k==='_id' || k==='data' || k==='pageId') {

//       } else if(k==='date') {
//         query.date = new Date(e[k]);
//       } else {
//         query[k] = e[k];
//       }
//     });
//     var i = 0;
//    if(!query.type || query.type.indexOf('email') < 0) {
//       if(query.type==='navigate') query.type=new RegExp("navigate");
//     db.events2.find(query).forEach(function(match){
//       if(i>0) {
//         print("We have a problem where this query matches more than one entry:")
//         print(JSON.stringify(query));
//       }
//       if(match._id.toString()!==e._id.toString()) {
//         print("We have a problem where the object id in events mismatches with events2:")
//         print(JSON.stringify(query));
//       }
//       i++;
//      checked++
//    if(checked%500===0) print(checked);
//     });
//     if(i===0) {
//         print("We have a problem where this query matches nothing:")
//         print(JSON.stringify(query));
//     }
//   }
//   });
// };

// var inNewCheckExisting = function(){
//   checked =0 ;
//   db.events2.find({date:{$gt:dt}}).forEach(function(e){
//     var query = {};
//     Object.keys(e).forEach(function(k){
//       if(k==='_id' || k==='data' || k==='pageId') {

//       } else if(k==='date') {
//         query.date = new Date(e[k]);
//       } else {
//         query[k] = e[k];
//       }
//     });
//     var i = 0;
//   if(!query.type || query.type.indexOf('email') < 0) {
//     if(query.type==='navigate' || query.type==='navigate-tab') query.type=new RegExp("navigate");
//     delete query.pageId;
//     db.events.find(query).forEach(function(match){
//       if(i>0) {
//         print("We have a problem where this query matches more than one entry:")
//         print(JSON.stringify(query));
//       }
//       if(match._id.toString()!==e._id.toString()) {
//         print("We have a problem where the object id in events mismatches with events2:")
//         print(JSON.stringify(query));
//       }
//       i++;
//      checked++
//    if(checked%500===0) print(checked);
//     });
//     if(i===0) {
//         print("We have a problem where this query matches nothing:")
//         print(JSON.stringify(query));
//     }
//   }
//   });
// };

// inExistingCheckNew(new Date(2018,3,1));
// db.events.find({date:{$gt:new Date(2018,3,1)}}).count();
// print ("In existing Checked: " + checked + " new");

// inNewCheckExisting(new Date(2018,3,1));
// db.events2.find({date:{$gt:new Date(2018,3,1)}}).count();

// print ("In new checked: " + checked + " existing");
// print ("Id no errors then you're good to go!")

// 7. drop events2 collection and then replace events collection for real
// db.events2.drop()
// exit
// mongoimport -d pingr -c events --drop events.processed.json

// 8. Add indexes again
// mongo pingr
// db.events.createIndex({user:1, date:1})
// db.events.createIndex({date:1})

const fs = require('fs');
const uuidv4 = require('uuid/v4');
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
          jLine.pageId = uuidv4();
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
