const fs = require('fs');
const tar = require('tar-fs')
const decompress = require('decompress');
const path = require('path');
const util = require('util');
const stream = require('stream');
const es = require('event-stream');


const TGZ_DIR=path.join(__dirname,'data','tgz');
const TAR_DIR=path.join(__dirname,'data','tar');
const INDICATOR_DIR=path.join(__dirname,'data','indicators');

//refactored to user promise.all since I actually ran it so might not actually work!!
/**
 * Loops throught the tgz files in the TGZ_DIR and extracts the tars to the TAR_DIR
 */
const extractTgzFiles = () => {
  const tgzs = fs.readdirSync(TGZ_DIR);
  const tarPromises = tgzs.map((t)=>{
    const ts = t.split('.')[1];
    return decompress(path.join(TGZ_DIR,t),TAR_DIR,{
      map: file => {
          file.path = `${ts}.tar`;
          return file;
      }
    });
  });
  Promise.all(tarPromises).then(()=>{console.log('all done!');}).catch((err)=>console.log(err.stack || err));
};

/**
 * Loops through the tar files in TAR_DIR and extracts the indicator.json file
 * from each into the INDICATOR_DIR
 */
const extractIndicatorJsons = () => {
  const tars = fs.readdirSync(TAR_DIR);
  tars.forEach((t)=>{
    const ts = t.split('.')[0];
    fs.createReadStream(path.join(TAR_DIR,t)).pipe(tar.extract(INDICATOR_DIR, {
      ignore: (name) => {
        return name.indexOf('indicators.json')<0;
      },
      map: (header) => {
        header.name = ts+'.'+header.name
        return header
      }
    }));
  });
};

/**
 * For each opportunity in the indicator spit out each patient who is flagging
 * 
 * @param {object} json The indicator json object
 * @param {string} ts The timestamp as a string YYYYMMDDhhmmss
 */
const getDeets = (json,ts) => {
  let obj;
  const rtn=[];
  if(json.replace(/ /g,"")=="") return;
  try {
    obj = JSON.parse(json);
  }
  catch (e) {
    console.log(e);
      console.log(ts);
  console.log('|'+json+'|');
  return;
  }

  obj.opportunities.forEach((o) => {
    if(o.patients && o.patients.length>0) {
      o.patients.forEach((p)=>{
        rtn.push([ts.substr(0,4)+'-'+ts.substr(4,2)+'-'+ts.substr(6,2),obj.id,p,o.id]);
      });
    }
  });
  return rtn.join('\n');
};

/**
 * Get the trend data for the indicator
 * 
 * @param {object} json The indicator json object
 */
const getTrendDeets = (json) => {
  let obj;
  const rtn=[];
  if(json.replace(/ /g,"")=="") return;
  try {
    obj = JSON.parse(json);
  }
  catch (e) {
    console.log(e);
    console.log(ts);
    console.log('|'+json+'|');
    return;
  }

  if(obj.values && obj.values.length===4){
    obj.values[0].slice(1).forEach((v,idx) => {
      rtn.push([obj.practiceId, obj.id, v, obj.values[1][idx+1], obj.values[2][idx+1], obj.values[3][idx+1]].join(','));
    });
  } else if(obj.values && obj.values.length===5){
    obj.values[0].slice(1).forEach((v,idx) => {
      rtn.push([obj.practiceId, obj.id, v, obj.values[1][idx+1], obj.values[2][idx+1], obj.values[3][idx+1]].join(','));
    });
  } else {
    console.log("What.. values isn't length 4. Whoa!");
    console.log(obj);
  }
  return rtn.join('\n');
};

/**
 * Process each indicator json file in INDICATOR_DIR and extract the data in csv
 * format to output.txt
 */
const getData = () => {
  const indicators = fs.readdirSync(INDICATOR_DIR);
  var oo = fs.createWriteStream(path.join(__dirname,'data','output.txt'));
  const todo = indicators.length;
  let done = 0;
  indicators.forEach((i)=>{
    const ts = i.split('.')[0];

    var s = fs.createReadStream(path.join(INDICATOR_DIR,i));
    s.pipe(es.split())
        .pipe(es.mapSync(function(line){

            // pause the readstream
            s.pause();

            // process line here and call s.resume() when rdy
            // function below was for logging memory usage
            var deets = getDeets(line,ts);
            if(deets) {
              oo.write(deets);
              oo.write('\n');
            }

            // resume the readstream, possibly from a callback
            s.resume();
        })
        .on('error', function(err){
            console.log('Error while reading file.', err);
        })
        .on('end', function(){
          done++;
          console.log('Done' + done + ' of ' + todo);
        })
    );
  });
};

/**
 * Finds the most recent indicator.json file and extracts the trend data for each
 * practice and each indicator and writes it to trend.txt
 */
const getTrendData = () => {
  const indicators = fs.readdirSync(INDICATOR_DIR);
  var oo = fs.createWriteStream(path.join(__dirname,'data','output.txt'));
  const todo = indicators.length;
  let done = 0;
  let mostRecentIndicatorTime = 0;
  let mostRecentIndicator;
  indicators.forEach((i)=>{
    const ts = i.split('.')[0];
    if(+ts > mostRecentIndicatorTime) {
      mostRecentIndicatorTime = +ts;
      mostRecentIndicator = i;
    }    
  });

  if(mostRecentIndicator) {
    var s = fs.createReadStream(path.join(INDICATOR_DIR,mostRecentIndicator));
    var oo = fs.createWriteStream(path.join(__dirname,'data','trend.txt'));
    s.pipe(es.split())
        .pipe(es.mapSync(function(line){

            // pause the readstream
            s.pause();

            // process line here and call s.resume() when rdy
            // function below was for logging memory usage
            var deets = getTrendDeets(line);
            if(deets) {
              oo.write(deets);
              oo.write('\n');
            }

            // resume the readstream, possibly from a callback
            s.resume();
        })
        .on('error', function(err){
            console.log('Error while reading file.', err);
        })
        .on('end', function(){
          console.log('Done');
        })
    );
  }
};

//extractTgzFiles();
//extractIndicatorJsons();
//getData();

getTrendData();
