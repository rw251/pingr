/**
 * USAGE: node copyLogsToDropbox <Date>
 * 
 * optional date to execute up to from previous date run
 * - previous date run is stored in the config collection of mongo
 * 
 * 
 * 
 * Current SQL to create table
 * 
    USE [PatientSafety_Records_Test]
    GO

    CREATE TABLE [dbo].[pingr.logs](
      [sessionId] [varchar](50) NULL,
      [user] [varchar](255) NULL,
      [type] [varchar](50) NULL,
      [date] [datetime] NULL,
      [url] [varchar](255) NULL,
      [xpath] [varchar](max) NULL,
      [data.text] [varchar](max) NULL,
      [data.indicator] [varchar](max) NULL,
      [data.link] [varchar](max) NULL,
      [data.token] [varchar](50) NULL,
      [data.body] [varchar](max) NULL,
      [data.action] [varchar](max) NULL,
      [data.patientId] [varchar](20) NULL,
      [data.reasonText] [varchar](max) NULL,
      [data.indicatorId] [varchar](100) NULL,
      [data.data] [varchar](max) NULL,
      [data.patid] [varchar](20) NULL,
      [data.pathwayId] [varchar](100) NULL,
      [data.patient] [varchar](20) NULL,
      [data.reason] [varchar](max) NULL,
      [_id] [varchar](50) NOT NULL,
      [__v] [varchar](50) NULL,
      CONSTRAINT [PK_log_id] PRIMARY KEY CLUSTERED 
    (
      [_id] ASC
    )WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = ON, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
    ) ON [PRIMARY]

    GO
 */

var currentColumns =
  {
    "sessionId": [1, "SQLCHAR", 0, 50, "\"\\t\"", 1, "sessionId", "\"\""],
    "user": [2, "SQLCHAR", 0, 255, "\"\\t\"", 2, "user", "\"\""],
    "type": [3, "SQLCHAR", 0, 50, "\"\\t\"", 3, "type", "\"\""],
    "date": [4, "SQLCHAR", 0, 23, "\"\\t\"", 4, "date", "\"\""],
    "url": [5, "SQLCHAR", 0, 255, "\"\\t\"", 5, "url", "\"\""],
    "xpath": [6, "SQLCHAR", 0, 0, "\"\\t\"", 6, "xpath", "\"\""],
    "data.text": [7, "SQLCHAR", 0, 0, "\"\\t\"", 7, "data.text", "\"\""],
    "data.indicator": [8, "SQLCHAR", 0, 0, "\"\\t\"", 8, "data.indicator", "\"\""],
    "data.link": [9, "SQLCHAR", 0, 0, "\"\\t\"", 9, "data.link", "\"\""],
    "data.token": [10, "SQLCHAR", 0, 50, "\"\\t\"", 10, "data.token", "\"\""],
    "data.body": [11, "SQLCHAR", 0, 0, "\"\\t\"", 11, "data.body", "\"\""],
    "data.action": [12, "SQLCHAR", 0, 0, "\"\\t\"", 12, "data.action", "\"\""],
    "data.patientId": [13, "SQLCHAR", 0, 20, "\"\\t\"", 13, "data.patientId", "\"\""],
    "data.reasonText": [14, "SQLCHAR", 0, 0, "\"\\t\"", 14, "data.reasonText", "\"\""],
    "data.indicatorId": [15, "SQLCHAR", 0, 100, "\"\\t\"", 15, "data.indicatorId", "\"\""],
    "data.data": [16, "SQLCHAR", 0, 0, "\"\\t\"", 16, "data.data", "\"\""],
    "data.patid": [17, "SQLCHAR", 0, 20, "\"\\t\"", 17, "data.patid", "\"\""],
    "data.pathwayId": [18, "SQLCHAR", 0, 100, "\"\\t\"", 18, "data.pathwayId", "\"\""],
    "data.patient": [19, "SQLCHAR", 0, 20, "\"\\t\"", 19, "data.patient", "\"\""],
    "data.reason": [20, "SQLCHAR", 0, 0, "\"\\t\"", 20, "data.reason", "\"\""],
    "_id": [21, "SQLCHAR", 0, 50, "\"\\t\"", 21, "_id", "\"\""],
    "__v": [22, "SQLCHAR", 0, 50, "\"\\t\"", 22, "__v", "\"\""]
  }

var mongoose = require('mongoose');
var config = require('../../server/config');
mongoose.set('debug', true);
mongoose.connect(config.db.url);

var events = require('../../server/controllers/events');
var props = require('../../server/controllers/config');
var Dropbox = require('dropbox');
var dbx = new Dropbox({ accessToken: process.env.PINGR_DROPBOX_ACCESS_TOKEN });

const LASTTIMESTAMP = "LastTimestampForCopyLogs";

var filter = {
  date: {}
};

var formatDate = function (d) {
  if (!d) d = new Date('2000-01-01');
  return d.toISOString().replace(/:/g, "");
};

var padded = function(text, length) {
  return (text + "                                                                                                   ").substr(0,length);
};

var generateFormatFile = function (headings) {
  return "10.0\r\n" + headings.length + "\r\n" + headings.map(function (v, i) {
    currentColumns[v][0] = padded(i + 1, 8);
    currentColumns[v][1] = padded(currentColumns[v][1], 20);
    currentColumns[v][2] = padded(currentColumns[v][2], 8);
    currentColumns[v][3] = padded(currentColumns[v][3], 8);
    if (i === headings.length - 1) currentColumns[v][4] = "\"\\n\"";
    currentColumns[v][4] = padded(currentColumns[v][4], 9);
    currentColumns[v][5] = padded(currentColumns[v][5], 6);
    currentColumns[v][6] = padded(currentColumns[v][6], 37);
    return currentColumns[v].join("");
  }).join("\r\n")+"\r\n";
};

var generateBatchLoaderFile = function() {
// SET DB=PatientSafety_Records_Test
// SET FILE=C:\Users\richard\Desktop\2000-01-01T000000.000Z - 2017-01-01T000000.000Z.log
// SET FILE=C:\Users\richard\Desktop\2017-01-01T000000.000Z - 2017-04-01T000000.000Z.log
// SET FILE=C:\Users\richard\Desktop\2017-04-01T000000.000Z - 2017-04-20T000000.000Z.log
// SET FILE=C:\Users\richard\Desktop\2017-04-20T000000.000Z - 2017-04-21T135801.450Z.log


// sqlcmd -E -d %DB% -Q "BULK INSERT [pingr.logs] FROM '%FILE%' WITH (FORMATFILE = '%FILE%.fmt')"
};

props.get(LASTTIMESTAMP, function (err, value) {

  if (value) {
    filter.date.$gte = new Date(value.value);
  }

  if (process.argv.length > 2) {
    filter.date.$lte = new Date(process.argv[2]);
  } else {
    filter.date.$lte = new Date();
  }

  var filename = formatDate(filter.date.$gte) + " - " + formatDate(filter.date.$lte) + ".log";

  events.tab(filter, function (err, data) {
    if (!err && data.body.length > 0) {

      var formatFile = generateFormatFile(data.headings);

      dbx
        .filesUpload({ path: '/' + filename, contents: data.body })
        .then(function (response) {
          console.log(response);
          dbx
            .filesUpload({ path: '/' + filename + ".fmt", contents: formatFile })
            .then(function (response) {
              console.log(response);
              props.set(LASTTIMESTAMP, filter.date.$lte.toISOString(), function (err) {
                process.exit(0);
              });
            })
            .catch(function (error) {
              console.error(error);
              process.exit(1);
            });
        })
        .catch(function (error) {
          console.error(error);
          process.exit(1);
        });
    }
  });

});