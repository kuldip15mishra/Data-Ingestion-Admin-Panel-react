var ExplorerSchema = require('../models/dataexplorer.model');
var ExpSchema = require ('../models/dataexp.model')
const moment = require('moment');
const API = require('../services/api');
const response = require('../middlewares/response')
var express = require('express')
var app = express()
var Excel = require('exceljs');
var tempfile = require('tempfile');
var count = 0;
var xlsx = require('xlsx')
var  _  =  require('underscore');



exports.signalNames = async (req, res, next) => {
  try {
    var result = await API.getSignalNames();
    var result = response.formatResponseTry(result)
    return res.json(result)
  } catch (error) {
    return next(error)
  }
}


 /*
Retrieve Tag details of particular tag
*/
exports.tagData = async (req, res, next) => {
  try {
    var tagPath = req.query.tagPath
    var tagName = req.query.tagName
    var result = await API.getTagCredentials(tagPath, tagName);
    var result = response.formatResponseTry(result)
    return res.json(result)
  } catch (error) {
    return next(error)
  }
}

exports.V1tagDataV1 = async (req, res, next) => {
  try {

    var tagPath = req.query.tagPath
    var tagName = req.query.tagName
    var result = await API.getTagCredentialsV1(tagPath, tagName);
    var result1 = response.formatResponseTry(result)
    return res.json(result1)
  } catch (error) {
    return next(error)
  }
}

/*
Retrieve point value of particular tag
*/
exports.tagValue = async (req, res, next) => {
  try {
    var tagname = req.params.name
    var newresult = await API.tagvalue(tagname);
    var result = response.formatResponseTry(newresult)
    return res.json(result)
  } catch (error) {
    return next(error)
  }
}


/*
Tagdata Explorer API
*/
exports.dataExplorer = async (req, res, next) => {
  try {
    let myUrls = []
    let pointUrls = []
    let tagname = []; let tagdescription = []; let UOM = []
    //Data explorer data request format

    const explorerschema = await (new ExplorerSchema(req.body));
    
    const tagschema = explorerschema.transform();
    //Retrieving paprameters from the request
    BaseURL = tagschema.connString;
    moment.suppressDeprecationWarnings = true;
    tagname.push(tagschema.payload.tag)
    tagdescription.push(tagschema.payload.tag.description)
    UOM.push(tagschema.payload.tag.UOM)
    let userid = tagschema.payload.userID;
    let sessionid = tagschema.payload.sessionID;
    let appid = tagschema.payload.resource;

    //Time period and start time end time validation
    serviceURL = tagschema.connString;
    var timeValues = await API.timeConfig(tagschema);

    //Connection String
    var getUrlList = await API.multipleURL(tagschema, timeValues, myUrls);
    //External service call
    if (getUrlList) {
      var result = await API.getDataExplorer(getUrlList, tagschema, tagname, tagdescription, UOM, userid,sessionid,appid);
      var timestampResult = await API.convertTimestamp(result)
      var timestampResult = response.formatResponseTry(timestampResult)
      return res.send(timestampResult)
    }
  } catch (error) {
    return next(error)
  }
}



/*
Retrieve Tag Browser List
*/
exports.tagBrowserList = async (req, res, next) => {
  try {
    const expschema = await (new ExpSchema(req.body));
    const dataschema = expschema.transform();
    var result = await API.getTagBrowserList(dataschema);
     
    return res.json(response.formatResponseTry(result))
  } catch (error) {
    return next(error)
  }
}

exports.SignalOneHourData = async (req, res, next) => {
  try {
    const expschema = await (new ExpSchema(req.body));
    const dataschema = expschema.transform();
    var result = await API.getSignalOneHourValues(dataschema);
    var result = response.formatResponseTry(result)
    return res.json(result)
  } catch (error) {
    return next(error)
  }
}

exports.SignalCurrentData = async (req, res, next) => {
  try {
    const expschema = await (new ExpSchema(req.body));
    const dataschema = expschema.transform();
    var result = await API.getSignalCurrentValues(dataschema);
    var result = response.formatResponseTry(result)
    return res.json(result)
  } catch (error) {
    return next(error)
  }
}
exports.SignalHourAvgData = async (req, res, next) => {
  try {
    const expschema = await (new ExpSchema(req.body));
    const dataschema = expschema.transform();
    var result = await API.getSignalOneHourAvgValues(dataschema);
    var result = response.formatResponseTry(result)
    return res.json(result)
  } catch (error) {
    return next(error)
  }
}
exports.Signal24HourAvgData = async (req, res, next) => {
  try {
    const expschema = await (new ExpSchema(req.body));
    const dataschema = expschema.transform();
    var result = await API.getSignal24HourAvgValues(dataschema);
    var result = response.formatResponseTry(result)
    return res.json(result)
  } catch (error) {
    return next(error)
  }
}


exports.dataExport = async (req, res, next) => {
  try {
    myUrls = []
    pointUrls = []
    tagname = []; tagdescription = []; UOM = []
    //Data explorer data request format
    const explorerschema = await (new ExplorerSchema(req.body));
    const tagschema = explorerschema.transform();
    BaseURL = tagschema.connString;
    let userid = tagschema.payload.userID;
    let sessionid = tagschema.payload.sessionID;
    let appid = tagschema.payload.resource;
    moment.suppressDeprecationWarnings = true;
    //var tagname = tagschema.payload.tags[0].name

    for (var i = 0; i < tagschema.payload.tag.length; i++) {

      tagname.push(tagschema.payload.tag[i].name)
      tagdescription.push(tagschema.payload.tag[i].description)
      UOM.push(tagschema.payload.tag[i].UOM)
      
    }
  
    serviceURL = tagschema.connString;

    var timeValues = await API.timeConfig(tagschema);

    //Connection String
    var newresultdata = {};
   var   getUrl=[];
    var getUrlList=[];
    var getUrlExp=[];

    for (var i = 0; i < tagschema.payload.tag.length; i++) {
  
      if(tagschema.payload.tag[i].isExpression==false){
    
        getUrl.push(await API.multiURL(tagschema, tagschema.payload.tag[i].name, timeValues, serviceURL, myUrls));

      
      }
     
  
      else{
     
        
        getUrl.push(await API.multiExpression(tagschema, tagschema.payload.tag[i], timeValues,serviceURL, myUrls));
        
      }
    }
    
  

    // var getUrlList = await API.multiURL(tagschema, timeValues, myUrls);
    var finalData=[];
   
      var result = await API.getDataExplorerExpression(getUrl, tagschema, tagname, tagdescription, UOM, userid,sessionid,appid);
    
      var timestampResult = await API.convertTimestamp(result)
      var timestampResult = response.formatResponseTry(timestampResult)
      newresultdata=timestampResult.payload.data

    

    
    finalData.push(newresultdata)

    // if(getUrlExp){
    //   var result = await API.getDataExplorerExpression(getUrlExp, tagschema, tagname, tagdescription, UOM);
    
    //   var timestampResult = await API.convertTimestamp(result)
    //   var timestampResult = response.formatResponseTry(timestampResult)
    //   newresultExpdata=timestampResult.payload.data
    // }

    
    // finalData.push(newresultExpdata)

   

    for(var a=0; a<finalData.length;a++){
    for (var b = 0; b < finalData[a].length; b++) {

      var tempName = finalData[a][b].name;
      for (var x = b + 1; x < finalData[a].length; x++) {
        if (finalData[a][x].name == tempName) {
          finalData[a][x].name = "";
          finalData[a][x].tagdescription = ""
          finalData[a][x].UOM = ""
        }
      }
    }
  }

    var workbook = new Excel.Workbook();
    var wsheet = [];
    for(var i=0; i<finalData.length;i++){
    for (var k = 0; k < finalData[i].length; k++) {
      if (finalData[i][k].name != '') {
        // var index= 
        var name= finalData[i][k].name
      
        var sheet = workbook.addWorksheet(name.substring(name.indexOf(':')+1,(name.length-1)), { properties: { tabColor: { argb: 'FFC0000' } } })
        wsheet = sheet
        var rowValues = [];
        rowValues[0] = 'Name';
        rowValues[1] = finalData[i][k].name;

        sheet.addRow(rowValues);

        var rowDesc = [];
        rowDesc[0] = 'TagDescription';
        rowDesc[1] = finalData[i][k].tagdescription;

        sheet.addRow(rowDesc);

        sheet.addRow()
        var rowHead = [];
        rowHead[0] = 'Value';
        rowHead[1] = 'Quality'
        rowHead[2] = 'Timestamp';
        sheet.addRow(rowHead)
      }

      var rowTemp = [];
      rowTemp[0] = finalData[i][k].value;
      rowTemp[1] = (finalData[i][k].quality)
      rowTemp[2] = (finalData[i][k].timestamp);
      wsheet.addRow(rowTemp)
      //
      // sheet.addRow(newresultdata[k].quality);
      // sheet.addRow(newresultdata[k]);
    }
  }
    var tempFilePath = tempfile('.xlsx');
    var fileName = 'FileName.xlsx';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader("Content-Disposition", "attachment; filename=" + fileName);
    return workbook.xlsx.write(res).then(function () {
      res.end();
    });
  } catch (error) {
    return next(error)
  }
}

/*Retrieve Tag details of particular tag
*/
exports.tagDataElastic = async (req, res, next) => {
  try {
    var tagPath = req.query.tagPath
    var tagName = req.query.tagName
    var result = await API.getTagCredentialsElastic(tagPath, tagName);
    var result = response.formatResponseTry(result)
    return res.json(result)
  } catch (error) {
    return next(error)
  }
}