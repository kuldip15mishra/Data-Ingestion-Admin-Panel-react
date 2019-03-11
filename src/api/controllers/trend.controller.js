var RequestSchema = require('../models/request.model');
const response = require('../middlewares/response')
var url = ("mongodb://101.53.139.108:27017/unleashmetadb");
const API = require('../services/api');

exports.trendData = async (req, res, next) => {
  try {
    const requestschema = await (new RequestSchema(req.body));
    const requestschematransformed = requestschema.transform();
    var colName = requestschematransformed.collectionName;
    data = requestschematransformed.payload[0]

    /*
    Save trender details in mongodb
    */
    if (requestschematransformed.operation == 'save') {
      //var newdata = await API.shortId(data)
      var result = await API.saveData(url, colName, data)
      return res.json(response.formatResponseTry(result))
    }

    /*
    Get trender details from mongodb
    */
    else if (requestschematransformed.operation == 'getdetailv1') {
      API.getDetailv1(colName, url, requestschematransformed).then(function (resultmeta) {
        if (resultmeta) {
          API.getSeriesDataForCustomData(resultmeta).then(function (newresultdata){
            if (newresultdata){
              for (i=0;i<resultmeta[0].config.length;i++){
                resultmeta[0].config[i].data = newresultdata[i]
              }
              return res.json(response.formatResponseTry(resultmeta))
            }
          }
          )
        }
      })
    }


    else if (requestschematransformed.operation == 'getdetail') {
      var getresult = await API.getDetail(colName, url, requestschematransformed);
      await new Promise(done => setTimeout(done, 100));
      return res.json(response.formatResponseTry(getresult))
    }



    /*
    Delete trender details from mongodb
    */
    else if (requestschematransformed.operation == 'delete') {
      API.deleteData(colName, url, requestschematransformed).then(function (resultdata) {
        if (resultdata) {
          var results = response.formatResponseTry(resultdata)
          return res.json(results)
        }
      })
    }


    /*
      Search trend id and name in mongodb
      */
     else if (requestschematransformed.operation == 'search') {
      var arr = await API.searchData(colName, url, requestschematransformed, res);
      await new Promise(done => setTimeout(done, 300));
      var results = response.formatResponseTry(arr)
      return res.json(results)
    }





    else if (requestschematransformed.operation == 'update') {
      var result = await API.updateData(url, colName, requestschematransformed)
      return res.json(response.formatResponseTry(result))
    }
  } catch (error) {
    return res.json("Error")
  }
};
