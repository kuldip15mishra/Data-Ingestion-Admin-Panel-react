var RequestSchema = require('../models/request.model');
const API = require('../services/api');
const response = require('../middlewares/response')
var RequestSchema = require('../models/connector.model');


exports.connectorList = async (req, res, next) => {
    try {
        var result = await API.connectorList();
        var result = response.formatResponseTry(result)
        return res.json(result)
    } catch (error) {
        return next(error)
    }
}

exports.connectorOperation = async (req, res, next) => {
    try {
      const requestschema = await (new RequestSchema(req.body));
      const requestschematransformed = requestschema.transform();
      data = requestschematransformed.payload[0]
      let connectionname = data.connectionname
      
      if (requestschematransformed.operation == 'createconnection') {
        var getresult = await API.createConnection(data);
        await new Promise(done => setTimeout(done, 2000));
        return res.json(response.formatResponseTry(getresult))
      }

      else if (requestschematransformed.operation == 'startconnection') {
        var getresult = await API.startConnection(connectionname);
        return res.json(response.formatResponseTry(getresult))
      }

      else if (requestschematransformed.operation == 'stopconnection')  {
        var getresult = await API.stopConnection(connectionname);
        return res.json(response.formatResponseTry(getresult))
      }

      else if (requestschematransformed.operation == 'restartconnection')  {
        var getresult = await API.restartConnection(connectionname);
        return res.json(response.formatResponseTry(getresult))
      }

    } catch (error) {
        return res.json("Error")
      }
    };