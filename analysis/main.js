const fs = require('fs');
const tar = require('tar-fs')
const decompress = require('decompress');
const path = require('path');
const util = require('util');
const stream = require('stream');
const es = require('event-stream');


const IN_DIR=path.join(__dirname,'data','in');
const OUT_DIR=path.join(__dirname,'data','out');
const INDICATOR_DIR=path.join(__dirname,'data','indicators');

//refactored to user promise.all since I actually ran it so might not actually work!!
const extractTgzFiles = () => {
  const tgzs = fs.readdirSync(IN_DIR);
  const tarPromises = tgzs.map((t)=>{
    const ts = t.split('.')[1];
    return decompress(path.join(IN_DIR,t),OUT_DIR,{
      map: file => {
          file.path = `${ts}.tar`;
          return file;
      }
    });
  });
  Promise.all(tarPromises).then(()=>{console.log('all done!');}).catch((err)=>console.log(err.stack || err));
};

const extractIndicatorJsons = () => {
  const tars = fs.readdirSync(OUT_DIR);
  tars.forEach((t)=>{
    const ts = t.split('.')[0];
    fs.createReadStream(path.join(OUT_DIR,t)).pipe(tar.extract(INDICATOR_DIR, {
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

//extractTgzFiles();
//extractIndicatorJsons();
getData();
