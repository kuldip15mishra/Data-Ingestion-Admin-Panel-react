const User = require('../models/login.model');
const moment = require('moment-timezone');
const { jwtExpirationInterval } = require('../../config/vars');
const response = require('../middlewares/response')
const API = require('../services/api');
var RequestSchema = require('../models/request.model');
var url = ("mongodb://101.53.139.108:27017/unleashmetadb");


/*
Generate token
*/
function generateTokenResponse(user, accessToken) {
  const tokenType = 'Bearer';

  const expiresIn = moment().add(jwtExpirationInterval, 'minutes');
  return {
    tokenType, accessToken, expiresIn,
  };
}


/*
Workbench user administration
*/

exports.userdetails = async (req, res, next) => {
  try {
    const requestschema = await (new RequestSchema(req.body));
    const requestschematransformed = requestschema.transform();
    var colName = requestschematransformed.collectionName;
    data = requestschematransformed.payload[0]
    const user = await (new User(req.body));
    const token = generateTokenResponse(user, user.token());


    /*
    Save user details in mongodb
    */
    if (requestschematransformed.operation == 'save') {
      //var newdata = await API.shortId(data)
      var result = await API.saveData(url, colName, data)
      return res.json(response.formatResponseTry(result))
    }
    /*
    Retrieve user details from mongodb
    */
    else if (requestschematransformed.operation == 'getdata') {
      API.getData(colName, url).then(function (resultdata) {
        if (resultdata) {
          var results = response.formatResponseTry(resultdata)
          return res.json(results)
        }
      })
    }
    /*
    Update user details in mongodb
    */
    else if (requestschematransformed.operation == 'update') {
      var result = await API.updateData(url, colName, requestschematransformed)
      return res.json(response.formatResponseTry(result))
    }
    /*
    User Login
    */
    else if (requestschematransformed.operation == 'login') {
      API.loginAPI(url, colName, requestschematransformed).then(function (result) {
      if (result.Message == 'Logged in successfully') {
        res.set({
          'content-type': 'application/json','content-length': '150','Bearer': token.accessToken
        });
        return res.json(response.formatResponseTry(result))
      } else {
        return res.json(response.formatResponseTry(result))
      }
    })
  }
    } catch (error) {
    return res.json("Error")
  }
}


