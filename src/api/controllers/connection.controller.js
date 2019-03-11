var RequestSchema = require('../models/request.model');
const API = require('../services/api');
const response = require('../middlewares/response')
var RequestSchema = require('../models/request.model');
var url = ("mongodb://101.53.139.108:27017/unleashmetadb");


/*
Connection String API
*/
exports.connString = async (req, res, next) => {
  try {
    const requestschema = await (new RequestSchema(req.body));
    const requestschematransformed = requestschema.transform();
    var colName = requestschematransformed.collectionName;
    data = requestschematransformed.payload[0]
/*
Save connection string in mongodb
*/
if (requestschematransformed.operation == 'save') {
  //var newdata = await API.shortId(data)
  var result = await API.saveData(url,colName,data)
  return res.json(response.formatResponseTry(result))
}
/*
Find details of connection string from mongodb
*/
  else if (requestschematransformed.operation == 'getdetail') {
    var getresult= await API.getDetails(colName,url,requestschematransformed);
    return res.json(response.formatResponseTry(getresult)) 
  }
  } catch (error) {
    return res.json("Error")
  }
}
