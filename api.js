var _ = require('underscore');
const axios = require('axios');
const moment = require('moment');
var MongoClient = require('mongodb').MongoClient;
var queryString = require('query-string');
var constants = require('../../config/constants');

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: 'http://localhost:9200',
  log: 'debug'
});


exports.getSignalNames = async () => {
  var result = await axios.get(constants.apiURL.NEW_SERVER_URL);
  let tagnames = _.pluck(result.data.data, constants.utilities.TAGNAME)
  return tagnames;
};


/*
External API (platform serivces) call
*/
exports.getCredentials = async (UserDetails) => {
  const status = false;
  const result = await axios.post(constants.apiURL.LOGIN_URL, UserDetails);
  return result;
};


exports.getTagBrowserList = async (dataschema) => {
  let limit = dataschema.limit
  let skip = dataschema.skip
  let pagenum = dataschema.pageNum;
  let signalurl = constants.apiURL.NEW_SERVER_URL + constants.utilities.LIMIT + limit + constants.utilities.SKIP + skip
  const result = await axios.get(signalurl);
  for (i = 0; i < result.data.data.length; i++) {
    result.data.data[i].displaytagName =pagenum + "_" +signalName[i]
    result.data.data[i].tagPath =signalPath[i];
    result.data.data[i].tagName =signalName[i];
  }
  return result.data
};

exports.getSignalOneHourValues = async (dataschema) => {
  let hourlydata1;
  let limit = dataschema.limit
  let skip = dataschema.skip
  let timeperiod = dataschema.timeperiod
  let signalurl = constants.apiURL.NEW_SERVER_URL + constants.utilities.LIMIT + limit + constants.utilities.SKIP + skip
  const result = await axios.get(signalurl);
  let signalnames = _.pluck(result.data.data, constants.utilities.TAGPATHNEW)

  if (timeperiod.includes("1HOUR")) {
    hourlydata1 = await hourlyValue(signalnames, limit, skip);
  }

  for (i = 0; i < (hourlydata1.length) - 1; i++) {
    hourlydata1[i].name = signalnames[i]
  }
  let tagmeta = []; let signaldata = {};

  for (i = 0; i < signalnames.length; i++) {
    tagmeta.push(hourlydata1[i])
  }
  signaldata.data = tagmeta
  signaldata.APItime = hourlydata1[(hourlydata1.length) - 1]
  signaldata.period = "1HOUR"
  return signaldata
};

exports.getSignalCurrentValues = async (dataschema) => {
  let currentdata1=[];
  let limit = dataschema.limit
  let skip = dataschema.skip
  let timeperiod = dataschema.timeperiod
  let signalurl = constants.apiURL.NEW_SERVER_URL + constants.utilities.LIMIT + limit + constants.utilities.SKIP + skip
  const result = await axios.get(signalurl);
  let signalnames = _.pluck(result.data.data, constants.utilities.TAGPATHNEW)

  if (timeperiod.includes("CURRENT")) {
    currentdata1 = await currentValue(signalnames);
  }
  for (i = 0; i < (currentdata1.length) - 1; i++) {
    currentdata1[i].name = signalnames[i];
  }
  let tagmeta = []; let signaldata = {};
  
  for (i = 0; i < signalnames.length; i++) {
    tagmeta.push(currentdata1[i])
  }
  signaldata.data = tagmeta
  signaldata.APItime = currentdata1[(currentdata1.length) - 1]
  signaldata.period = "CURRENT"
  return signaldata
  };



exports.getSignalOneHourAvgValues = async (dataschema) => {

  let limit = dataschema.limit
  let skip = dataschema.skip
  let timeperiod = dataschema.timeperiod
  let signalurl = constants.apiURL.NEW_SERVER_URL + constants.utilities.LIMIT + limit + constants.utilities.SKIP + skip
  const result = await axios.get(signalurl);
  let signalnames = _.pluck(result.data.data, constants.utilities.TAGPATHNEW)

  if (timeperiod.includes('1HOURAVG')) {
    avgdata1 = await avg1HrValue(signalnames);
  }

  for (i = 0; i < (avgdata1.length) - 1; i++) {
    avgdata1[i].name = signalnames[i]
  }
  let tagmeta = []; let signaldata = {};

  for (i = 0; i < signalnames.length; i++) {
    tagmeta.push(avgdata1[i])
  }
  signaldata.data = tagmeta
  signaldata.APItime = avgdata1[(avgdata1.length) - 1]
  signaldata.period = "1HOURAVG"
  return signaldata
};

exports.getSignal24HourAvgValues = async (dataschema) => {
  let limit = dataschema.limit
  let skip = dataschema.skip
  let timeperiod = dataschema.timeperiod
  let signalurl = constants.apiURL.NEW_SERVER_URL + constants.utilities.LIMIT + limit + constants.utilities.SKIP + skip
  const result = await axios.get(signalurl);
  let signalnames = _.pluck(result.data.data, constants.utilities.TAGPATHNEW)


  if (timeperiod.includes('24HOURAVG')) {
    avg24data1 = await avg24HrValue(signalnames);
  }
  

  let tagmeta = []; let signaldata = {};

  for (i = 0; i < (avg24data1.length) - 1; i++) {
    avg24data1[i].name = signalnames[i]
  }

  for (i = 0; i < signalnames.length; i++) {
    tagmeta.push(avg24data1[i])
  }
  signaldata.data = tagmeta
  signaldata.APItime = avg24data1[(avg24data1.length) - 1]
  signaldata.period = "24HOURAVG"
  return signaldata
};

const hourlyValue = (signalnames, limit, skip) => {
   let start = (moment(new Date(+new Date() - (1 * 60 * 60000))).unix())*1000;
   let end = (moment(new Date()).unix())*1000;

  let myUrls = []; let dataList = []; let data = []; let hourobj = []; let temp = [];  var tv = []

  for (i = 0; i < signalnames.length; i++) {
    let serviceURL = 'https://api.signal.ddriven.in:1111/trender/signaldata?tagPath=' + signalnames[i] + '&periodFrom=' + start + '&periodTo=' + end + '&limit=60&skip=0&RepresentationAlgorithm=average&maxReductionPoints=100&timeOffset=UTC%252B05%25'
    myUrls.push(serviceURL)
  }
  return new Promise((resolve, reject) => {
    let starttime = new Date().getTime();
    getallList(myUrls)
      .then(function (results) {
        let endtime = new Date().getTime();
        let execution_time = endtime - starttime
        results.map((r) => {
          data = generateData(r.data.data, null);
          dataList.push(data);
       });
        for (i = 0; i < dataList.length; i++) {
          var objs = dataList[i].map(function (x) {
            return {
              timestamp: x[0],
              value: x[1]
            };
          });
          hourobj.push(objs)
        }
        
        for (i = 0; i < hourobj.length; i++){
          var rv = {};
          rv.name = signalnames[i]
        rv.oneHourSparkline = hourobj[i]
        tv.push(rv)
        }
        tv.push(execution_time)
        resolve(tv)
      }).catch(function (err) { reject(err); })
  })
}

const currentValue = (signalnames) => {
  let myUrls = []; let dataList = []; let data = []; let obj = []; let tv=[]
  var i;
  for (i = 0; i < signalnames.length; i++) {
    let serviceURL = 'https://api.signal.ddriven.in:1111/trender/signaldata?tagPath=' + signalnames[i]
    myUrls.push(serviceURL)
  }
  return new Promise((resolve, reject) => {
    let starttime = new Date().getTime();
    getallList(myUrls)
      .then(function (results) {
        let endtime = new Date().getTime();
        let execution_time = endtime - starttime
        results.map((r) => {
          data = dataGenerate(r.data.data, r.data.tagName);
          dataList.push(data);
        });
        var merged = [].concat.apply([], dataList);
        for (i = 0; i < dataList.length; i++){
          var rv = {};
          rv.name = signalnames[i]
        rv.current = dataList[i]
        tv.push(rv)
        }
        tv.push(execution_time)
        resolve(tv)
      }).catch(function (err) { reject(err); })
  })
}

const avg1HrValue = (signalnames) => {

  let start = (moment(new Date(+new Date() - (1 * 60 * 60000))).unix())*1000;
  let end = (moment(new Date()).unix())*1000;

  let requestlist = []; let list = []; let tv=[]
  let avgdata = []

  var i;
  for (i = 0; i < signalnames.length; i++) {
    var obj = {}
    obj = {
      "expression": '(' + signalnames[i] + ').AVG()',
      "retrievalOptions": {
        "timeOffset": "UTC+05:30",
        "periodFrom": start,
        "periodTo": end,
        "maxReductionPoints": 1000,
        "RepresentationAlgorithm": "average"
      },
      "pagination": {
        "skip": 0,
        "limit": 1000
      }
    }
    requestlist.push(obj)
  }
  var j;
  for (j = 0; j < requestlist.length; j++) {
    var obj = {}
    obj = {
      "method": 'post',
      "url": 'https://api.signal.ddriven.in:1111/trender/signaldata/expression',
      "data": requestlist[j]
    }
    list.push(obj)
  }
  return new Promise((resolve, reject) => {
    let starttime = new Date().getTime();
    postallList(list)
      .then(function (results) {
        let endtime = new Date().getTime();
        let execution_time = endtime - starttime
        var k;
        var arr=[]
        for (k = 0; k < results.length; k++) {
          avgdata=[]
          avgdata.push(results[k].data.data[0])
          arr.push(avgdata)
        }

        for (i = 0; i < arr.length; i++){
          var rv = {};
          rv.name = signalnames[i]
        rv.oneHourAverage = arr[i]
        tv.push(rv)
        }
        tv.push(execution_time)
        resolve(tv)
      }).catch(function (err) { reject(err); })
  })
}


const avg24HrValue = (signalnames) => {

  let start = (moment(new Date(+new Date() - (24 * 60 * 60000))).unix())*1000;
   let end = (moment(new Date()).unix())*1000;

  let requestlist = []; let list = []; let tv=[]
  let avgdata = []

  var i;
  for (i = 0; i < signalnames.length; i++) {
    var obj = {}
    obj = {
      "expression": '(' + signalnames[i] + ').AVG()',
      "retrievalOptions": {
        "timeOffset": "UTC+05:30",
        "periodFrom": start,
        "periodTo": end,
        "maxReductionPoints": 1000,
        "RepresentationAlgorithm": "average"
      },
      "pagination": {
        "skip": 0,
        "limit": 1000
      }
    }
    requestlist.push(obj)
  }
  var j;
  for (j = 0; j < requestlist.length; j++) {
    var obj = {}
    obj = {
      "method": 'post',
      "url": 'https://api.signal.ddriven.in:1111/trender/signaldata/expression',
      "data": requestlist[j]
    }
    list.push(obj)
  }
  
  return new Promise((resolve, reject) => {
    let starttime = new Date().getTime();
    postallList(list)
      .then(function (results) {
        let endtime = new Date().getTime();
        let execution_time = endtime - starttime
        var k;
        var arr=[]
        for (k = 0; k < results.length; k++) {
          avgdata=[]
          avgdata.push(results[k].data.data[0])
          arr.push(avgdata)
        }

        for (i = 0; i < arr.length; i++){
          var rv = {};
          rv.name = signalnames[i]
        rv.oneDayAverage = arr[i]
        tv.push(rv)
        }
        tv.push(execution_time)
        resolve(tv)
      }).catch(function (err) { reject(err); })
  })
}




const dataGenerate = (seriesData, seriesMeta) => {
  let data = [];
  for (let m = 0; m < seriesData.length; m++) {
    let obj = {}
    obj.timestamp = seriesData[m].timestamp;
    obj.value = seriesData[m].value;
    obj.name = seriesMeta
    data.push(obj);
  }
  return data
}




/*
Get meta of given tagname
*/
exports.getTagCredentials = async (tagPath, tagName) => {
  const result = await axios.get(constants.apiURL.NEW_SERVER_URL, {
    params: {
      tagPath: tagPath,
      tagName: tagName
    }
  });
  var i;

  for (i = 0; i < result.data.data.length; i++) {
    result.data.data[i].name = result.data.data[i][constants.utilities.TAGNAME];
    delete result.data.data[i].tagName;
  }
  return result.data;
};


exports.getTagCredentialsV1 = async (tagPath, tagName) => {
  const results = await axios.get(constants.apiURL.NEW_SERVER_URL, {
    params: {
      tagPath: tagPath,
      tagName: tagName
    }
  });
  var i;

  for (i = 0; i < results.data.data.length; i++) {
    results.data.data[i].name = results.data.data[i][constants.utilities.TAGNAME];
    delete results.data.data[i].tagName;
  }
  return results.data;
};


/*
Get point value of given tagname
*/
exports.tagvalue = async (tagname) => {
  temp = {}
  pointvalueurl = constants.apiURL.NEW_SERVER_URL + constants.utilities.TAGPATH + tagname
  const pointresult = await axios.get(pointvalueurl)

  return pointresult.data
}


/*
Tagdata explorer service call
*/
exports.getDataExplorer = async (newurl, tagschema, tagname, tagdescription, UOM) => {
  let dataList = [];
  let data = [];

  return new Promise((resolve, reject) => {
    postallList(newurl)
      .then(function (results) {
        results.map((r) => {
          data = generateData(r.data.data, null);
          dataList.push(data);
        });

        var total = 0
        for (var i = 0; i < dataList.length; i++) {
          total = total + dataList[i].length
        }
        datacount = total
        var temp = []
        for (var j = 0; j < dataList.length; j++) {
          var name = tagname[j]
          var description = tagdescription[j]
          var Unit = UOM[j]
          for (var k = 0; k < dataList[j].length; k++) {
            temp.push({
              "name": name,
              "value": dataList[j][k][1],
              "timestamp": dataList[j][k][0],
              "quality": dataList[j][k][2],
              "tagdescription": description,
              "UOM": Unit
            })
          }
        }

        let user = {};
        user = {
          "totalcount": datacount,
          "data": temp
        }
        resolve(user)
      }).catch(function (err) { reject(err); })
  })
};


// exports.getDataExplorerExpression = async (newurl, tagschema, tagname, tagdescription, UOM) => {
//   let dataList = [];
//   var list = []
//   var j;

//   for (j = 0; j < newurl.length; j++) {
//     var obj = {}
//     if (newurl[j].expression) {
//       obj = {
//         "method": 'post',
//         "url": constants.apiURL.NEW_EXPRESSIONDATA_URL,
//         "data": newurl[j]
//       }
//     }
//     else {
//       obj = {
//         "method": 'get',
//         "url": newurl[j],
//       }
//     }
//     list.push(obj)
//   }
//   return new Promise((resolve, reject) => {

//     postallList(list)
//       .then(function (results) {
//         var k;
//         for (k = 0; k < results.length; k++) {
//           dataList.push(results[k].data.data)
//         }
//         var total = 0
//         for (var i = 0; i < dataList.length; i++) {
//           total = total + dataList[i].length
//         }
//         datacount = total
//         var temp = []

//         //Tagdata Explorer Data massaging according to requirement
//         for (var j = 0; j < dataList.length; j++) {
//           var name = tagname[j]
//           var description = tagdescription[j]
//           var Unit = UOM[j]
//           for (var k = 0; k < dataList[j].length; k++) {
//             temp.push({
//               "name": name,
//               "value": dataList[j][k].value,
//               "timestamp": dataList[j][k].timestamp * 1000,
//               "quality": dataList[j][k].quality,
//               "tagdescription": description,
//               "UOM": Unit
//             })
//           }
//         }

//         let user = {};
//         user = {
//           "totalcount": datacount,
//           "data": temp
//         }
//         resolve(user)
//       }).catch(function (err) { reject(err); })
//   })
// }


/*
Save data in mongodb
*/
exports.saveData = async (url, colName, newdata) => {
  var result = {}
  MongoClient.connect(url, function (err, db) {
    currentdate = moment().valueOf();
    newdata = Object.assign({ date: currentdate }, newdata);
    db.collection(colName).save(newdata)
  })
  result = { "Message": "Data successfuly added in mongodb" }
  return result
}



/*
Update data in mongodb
*/
exports.updateData = async (url, colName, requestschematransformed) => {
  var result = {}
  {
    MongoClient.connect(url, function (err, db) {
      currentdate = moment().valueOf();
      requestschematransformed.payload[0].date = currentdate
      db.collection(colName).update({ "_id": requestschematransformed.payload[0]._id }, requestschematransformed.payload[0], (err) => {
      });
    });
  }
  result = { "Message": "Data successfuly updated in mongodb" }
  return result
}


/*
Login
*/
exports.loginAPI = async (url, colName, requestschematransformed) => {
  var loginresult = {}
  return new Promise((resolve, reject) => {
    MongoClient.connect(url)
      .then(function (db) {
        db.collection(colName).find({ "email": requestschematransformed.payload[0].email }).toArray(function (err, userdetail) {
          if (err) throw err;
            if (userdetail.length == 0) {
              loginresult = { 'Message': 'Invalid email' }
              resolve(loginresult);
            }
            else if (userdetail[0].email == requestschematransformed.payload[0].email && userdetail[0].password == requestschematransformed.payload[0].password) {
              loginresult = { 'Message': 'Logged in successfully' }
              resolve(loginresult);
            } else {
              loginresult = { 'Message': 'Username & Password do not match' }
              resolve(loginresult);
            }
          
        });
      }).catch(function (err) { reject(err); })
  });
}


exports.getSeriesDataForCustomData = (resultdata) => {

  let timeStamplist = {};
  timeStamplist.timestamp1 = resultdata[0].startTime;
  timeStamplist.timestamp2 = resultdata[0].endTime;
  let linksArr = [];
  let dataList = [];
  if (resultdata != "" && resultdata[0].config != "" && resultdata[0].config.length > 0) {
    for (let i = 0; i < resultdata[0].config.length; i++) {
      linksArr.push(generateReterivalMode(resultdata[0].config[i].retrivalMode, resultdata[0].config[i], timeStamplist))
    }
  }

  return getallList(linksArr)
    .then(function (results) {
      results.map((r) => {
        let data = generateData(r.data.data, null);
        dataList.push(data)
      });
      return dataList;
    }).catch(error => {
      console.log(error);
    });
}

const getallList = (requestList) => {
  return axios.all(requestList.map(l => axios.get(l)));
}

const postallList = (requestList) => {
  return axios.all(requestList.map(l => axios.request(l)));
}


const generateData = (seriesData, seriesMeta) => {


  if (seriesMeta != null)
    seriesData = seriesData.filter(l => l.name == seriesMeta.name);
  let data = [];
  for (let m = 0; m < seriesData.length; m++) {
    let obj = {}
    obj.x = seriesData[m].timestamp * 1000;
    obj.y = seriesData[m].value;
    obj.z = seriesData[m].quality
    data.push(Object.values(obj));
  }
  return data
}

const generateReterivalMode = (reterivalType, seriesMeta, timeStamplist) => {
  switch (reterivalType) {
    case "raw": //raw
      return generateUrlForRaw(reterivalType, seriesMeta, timeStamplist);
      break;
    case "interpolate": //interpolate
      return generateUrlForInterPolate(reterivalType, seriesMeta, timeStamplist);
      break;
    default: //min,max,avg
      return generateUrlForAggregate(reterivalType, seriesMeta, timeStamplist);
  }
}

const generateUrlForRaw = (reterivalType, seriesMeta, timeStamplist) => {
  let QueryJson = {}
  QueryJson.name = seriesMeta.name;
  QueryJson.rawType = "Original"
  QueryJson.timestamp1 = timeStamplist.timestamp1
  QueryJson.timestamp2 = timeStamplist.timestamp2

  let url = generateUrl(reterivalType, QueryJson);
  return url;
}

//generate querystring for interpolate
const generateUrlForInterPolate = (reterivalType, seriesMeta, timeStamplist) => {
  let QueryJson = {}
  QueryJson.name = seriesMeta.name;
  QueryJson.timestamp1 = timeStamplist.timestamp1
  QueryJson.timestamp2 = timeStamplist.timestamp2
  QueryJson.interval = timeStamplist.timeinterval

  let url = generateUrl(reterivalType, QueryJson);

  return url;
}

//generate querystring for aggregate (min,max,avg)
const generateUrlForAggregate = (aggregateType, seriesMeta, timeStamplist) => {
  let QueryJson = {}
  QueryJson.name = seriesMeta.name;
  QueryJson.rawType = "Original"
  QueryJson.timestamp1 = timeStamplist.timestamp1
  QueryJson.timestamp2 = timeStamplist.timestamp2
  QueryJson.interval = timeStamplist.timeinterval;
  QueryJson.function = aggregateType;
  return url;
}

const generateUrl = (type, urlParramData) => {
  type = type + "?"

  return ((constants.apiURL.NEW_SERVER_URL).concat('tags/history/').concat(type).concat(queryString.stringify(urlParramData)))
}



/*
Function to prepare config according to timeperiod or start time and end time
*/
exports.timeConfig = async (tagschema) => {
  var time = []
  moment.suppressDeprecationWarnings = true;

  if (tagschema.payload.timePeriod == "") {
    mode = "history"
    time.push(tagschema.payload.startTime, tagschema.payload.endTime, mode)
  }
  else {
    var h_duration_term = tagschema.payload.timePeriod;

    // Time periods conversion
    var MS_PER_MINUTE = 60000;
    let start, end = new Date();

    switch (h_duration_term) {
      case '8 hour': {
        start = new Date(+end - (8 * 60 * MS_PER_MINUTE));
      } break;
      case '1 hour': {
        start = new Date(+end - (1 * 60 * MS_PER_MINUTE));
      } break;
      case '1 day': {
        start = new Date(+end - (1 * 1440 * MS_PER_MINUTE));
      } break;
      case '1 week': {
        start = new Date(+end - (1 * 7 * 1440 * MS_PER_MINUTE));
      } break;
      case '1 month': {
        start = new Date(+end - (1 * 30 * 1440 * MS_PER_MINUTE));
      } break;
    }
    mode = "point"
    start = moment(start).unix();
    end = moment(end).unix();
    time.push(start, end, mode)
  }
  return time
}



/*
Function to prepare connection string and append URL's
*/
exports.multipleURL = async (tagschema, timeValues, myUrls) => {

  var tags = tagschema.payload.tags;
  myUrls = [];
  newurl = []

  //tagschema.connString = BaseURL + timeValues[2] + "/" + tagschema.payload.tags[i].retrivalMode;
  tagschema.connString = BaseURL;
  myUrls = tagschema.connString + "?tagPath=" + tagschema.payload.tag
  if (tagschema.payload.take == null && tagschema.payload.skip == null && tagschema.payload.maxReductionPoints == null) {
    serviceURL = myUrls + "&periodFrom=" + timeValues[0] + "&periodTo=" + timeValues[1]+"&RepresentationAlgorithm=average";
  }
  else if (tagschema.payload.maxReductionPoints == null) {
    serviceURL = myUrls + "&periodFrom=" + timeValues[0] + "&periodTo=" + timeValues[1] + "&limit=" + tagschema.payload.take + "&skip=" + tagschema.payload.skip+"&RepresentationAlgorithm=average"
  }
  else if (tagschema.payload.take == null && tagschema.payload.skip == null) {
    serviceURL = myUrls + "&periodFrom=" + timeValues[0] + "&periodTo=" + timeValues[1] + "&maxReductionPoints=" + tagschema.payload.maxReductionPoints+"&RepresentationAlgorithm=average";
  }
  else {
    serviceURL = myUrls + "&periodFrom=" + timeValues[0] + "&periodTo=" + timeValues[1] + "&limit=" + tagschema.payload.take + "&skip=" + tagschema.payload.skip + "&maxReductionPoints=" + tagschema.payload.maxReductionPoints+"&RepresentationAlgorithm=average";
  }
  newurl.push(serviceURL)
  return newurl
}


exports.multiURL = async (tagschema, tagValue, timeValues, serviceURL, myUrls) => {

  // var tags = tagschema.payload.tag;
  myUrls = [];
  newurl = []


  //tagschema.connString = BaseURL + timeValues[2] + "/" + tagschema.payload.tags[i].retrivalMode;
  tagschema.connString = BaseURL;
  myUrls = tagschema.connString + "?tagPath=" + tagValue
  if (tagschema.payload.take == null && tagschema.payload.skip == null && tagschema.payload.maxReductionPoints == null) {
    serviceURL = myUrls + "&periodFrom=" + timeValues[0] + "&periodTo=" + timeValues[1]+"&RepresentationAlgorithm=average"
  }
  else if (tagschema.payload.maxReductionPoints == null) {
    serviceURL = myUrls + "&periodFrom=" + timeValues[0] + "&periodTo=" + timeValues[1] + "&limit=" + tagschema.payload.take + "&skip=" + tagschema.payload.skip +"&RepresentationAlgorithm=average"
  }
  else if (tagschema.payload.take == null && tagschema.payload.skip == null) {
    serviceURL = myUrls + "&periodFrom=" + timeValues[0] + "&periodTo=" + timeValues[1] + "&maxReductionPoints=" + tagschema.payload.maxReductionPoints +"&RepresentationAlgorithm=average";
  }
  else {


    serviceURL = myUrls + "&periodFrom=" + timeValues[0] + "&periodTo=" + timeValues[1] + "&limit=" + tagschema.payload.take + "&skip=" + tagschema.payload.skip + "&maxReductionPoints=" + tagschema.payload.maxReductionPoints +"&RepresentationAlgorithm=average";
  }

  return serviceURL
}



exports.multiExpression = async (tagschema, tagValue, timeValues, serviceURL, myUrls) => {
  // var tags = tagschema.payload.tag;
  let requestlist = [];
  var obj = {}
  obj = {
    "expression": tagValue,
    "retrievalOptions": {
      "timeOffset": "UTC+05:30",
      "periodFrom": timeValues[0],
      "periodTo": timeValues[1],
      "maxRepresentationPoints": 250,
      "RepresentationAlgorithm":"average"
    },
    "pagination": {
      "skip": 0,
      "limit": 2000
    }
  }
  requestlist.push(obj)
  return requestlist[0]
}





/*
Function to convert date to specific time format
*/
exports.convertTimestamp = async (result) => {
  for (var i = 0; i < result.data.length; i++) {
    result.data[i].timestamp = moment(result.data[i].timestamp / 1000).format('DD MMM YYYY  h:mm A');
  }
  return result;
};



/*
generic Function to get details
*/
exports.getDetails = async (colName, url, requestschematransformed) => { //to be optimized
  test = []

  return new Promise((resolve, reject) => {
    MongoClient.connect(url)
      .then(function (db) {
        db.collection(colName).find({ "type": requestschematransformed.payload[0].type }).toArray(function (err, detail) {
          if (err) reject(err);
          test = detail
          resolve(test);
        });
      }).catch(function (err) { reject(err); })
  });

}


exports.getDetailv1 = async (colName, url, requestschematransformed) => {
  test = []
  return new Promise((resolve, reject) => {
    MongoClient.connect(url)
      .then(function (db) {
        db.collection(colName).find({ "_id": requestschematransformed.payload[0]._id }).toArray(function (err, detail) {
          if (err) reject(err);
          test = detail
          resolve(test);
        });
      }).catch(function (err) { reject(err); })
  });
}


exports.getDetail = async (colName, url, requestschematransformed) => { //to be optimized
  test = []
  MongoClient.connect(url, function (err, db) {
    db.collection(colName).find({ "_id": requestschematransformed.payload[0]._id }).toArray(function (err, detail) {
      if (err) throw err;
      test = detail
    });
  });
  await new Promise(done => setTimeout(done, 100));
  return test
}



exports.deleteData = async (colName, url, requestschematransformed) => { //to be optimized
  var result = {}
  MongoClient.connect(url, function (err, db) {
    db.collection(colName).remove({ "_id": requestschematransformed.payload[0]._id })
  })
  result = { "Message": "Trend successfuly deleted from mongodb" }
  return result
}



/*
generic Function to get data of user
*/
exports.getData = async (colName, url, res) => {
  test = []
  return new Promise((resolve, reject) => {
    MongoClient.connect(url)
      .then(function (db) {
        db.collection(colName).find().toArray(function (err, detail) {
          if (err) reject(err);
          test = detail
          resolve(test);
        });
      }).catch(function (err) { reject(err); })
  });
}


/*
Get trend id and names from mongodb
*/
exports.searchData = async (colName, url, data, res) => {
  results = []; let iddata = []; let date = []; let trendname = []; let authorid = []; let test = [];
  MongoClient.connect(url, function (err, db) {
    db.collection(colName).find({ "userid": data.payload[0].userid }).toArray(function (err, detail) {
      if (err) throw err;
      test = detail
    });
  });
  await new Promise(done => setTimeout(done, 300));
  iddata = _.pluck(test, '_id');
  authorid = _.pluck(test, 'userid');
  trendname = _.pluck(test, 'trendName');
  date = _.pluck(test, 'date');

  for (let i = 0; i < iddata.length; i++) {
    results.push({
      "id": iddata[i],
      "userid": authorid[i],
      "name": trendname[i],
      "date": date[i]
    })
  }
  function mySort(a, b) {
    return (b.date - a.date);
  }
  results = results.sort(mySort);
  return results
}


/*
Get meta of given tagname
*/
exports.getTagCredentialsElastic = async (tagPath, tagName) => {
  var fields =tagName && tagName !==""  ?["tagName","tagPath"] :["tagPath"]
  var finalresult ={};
  // const result = await client.search({
  //   index: 'metasearchv7',
  //   type: 'signals',
  //   body: {
  //     "query": {
  //       "simple_query_string" : {
  //           "query" : tagName && tagName !==""  ?tagName +"*" : tagPath +"*",
  //           "fields" : fields,
  //           "flags" : "OR|AND|PREFIX"
  //       }
  //   }
  // }
  // });
const body = {
  "size" : 50,
  "query": {
    "simple_query_string" : {
        "query" : tagName && tagName !==""  ?tagName +"*" : tagPath +"*",
        "fields" : fields,
        "flags" : "OR|AND|PREFIX"
    }
   
}
}

const body1 = {
  "query": {
      "match_phrase_prefix" : {
          "tagName" : tagName && tagName !==""  ?tagName +"*" : tagPath +"*",
      }
  }
}
  const body2 = {
    "query": {
        "match" : {
            "tagName" : tagName && tagName !==""  ?tagName  : tagPath 
        }
    }
  }

  const body3 =   {
    "query": {
        "more_like_this" : {
            "fields" : ["tagName", "tagPath"],
            "like" : tagName && tagName !==""  ?tagName  : tagPath ,
            "min_term_freq" : 1,
            "max_query_terms" : 15
        }
    }
}

const body4={ "query": {
  "wildcard" : {
      "tagName" : tagName && tagName !==""  ? "*" + tagName +"*" : tagPath +"*",
 }
}
}

const body5={
  "query": {
    "bool": {
      "must": [
        {
          "multi_match": {
            "query": tagName && tagName !==""  ?tagName  : tagPath ,
            "fields": [
              "tagName^5",
              "tagName.ngram"
            ]
          }
        }
      ]
    }
  }
}

const body6={
  "query": {
    "match": {
      "tagName.edgengram": tagName && tagName !==""  ?tagName  : tagPath ,
    }
  }
}
  const result = await axios.post(constants.apiURL.ELASTICSEARCH, body6);

  finalresult['data']= result.data.hits.hits.map(searchHitToResult);
  finalresult['totalCount']=result.data.hits.hits.length;
 return finalresult;
};

const searchHitToResult = (hit) => {
  return {
    _score: hit._score,
    _id: hit._id,
    tagName: hit._source.tagName,
    description:hit._source.description,
    tagPath :hit._source.tagPath,
    slug: hit._source.slug,
    unit:hit._source.unit,
    source:hit._source.source,
    type :hit._source.type
  };
}