/**
     * Express Config module integrated to specify
     * different conditions that needs to be logged
     * in loger file specified.

     **/



     (function (expressConfig) {

  //var logger = require("../api/middlewares/logger");

  var path = require('path');
  // var expressValidator = require('express-validator');

  expressConfig.init = function (app, express) {

    api = express.Router();

    api.use(clientErrorHandler);

    function clientErrorHandler(err, req, res, next) {
     // logger.log("error","Something wrong with an XHR request",err.stack);

      if (req.xhr) {
        res.send(500, { error: 'Something blew up!' });
      } else {
         next(err);
      }
    }

    //setup view engine
  //  logger.debug("Setting 'Vash' as view engine");
    app.set("view engine", "vash");

 //   logger.debug("Setting 'Views' folder");
    var viewsFolder = path.dirname(module.parent.filename) + '/views';
    app.set('views', viewsFolder);

 //   logger.debug("Enabling GZip compression.");
    var compression = require('compression');
    app.use(compression({
      threshold: 512
    }));

  //  logger.debug("Setting 'Public' folder with maxAge: 1 Day.");
    var publicFolder = path.dirname(module.parent.filename)  + "/public";
    var oneYear = 31557600000;
    app.use(express.static(publicFolder, { maxAge: oneYear }));

    // app.use(expressValidator());

   // logger.debug("Setting parse urlencoded request bodies into req.body.");
    var bodyParser = require('body-parser');
    app.use(bodyParser.urlencoded());
    app.use(bodyParser.json());


   // logger.debug("Overriding 'Express' logger");
 //   app.use(require('morgan')({ "stream": logger.stream }));

    app.use(function (req, res, next) {
  // Listen for response event and log
  onHeaders(res, function () {
    // logger.info({
    //     _id: req.id,
    //     client: {
    //         ip: function () {
    //             return req.ip
    //                 || req._remoteAddress
    //                 || (req.connection && req.connection.remoteAddress)
    //                 || undefined
    //         }()
    //     },
    //     method: req.method,
    //     url: req.url,
    //     statusCode: res.statusCode,
    //     time: (Date.now() - req.start),
    //     'res-length': res._headers['content-length'] || 0,
    //     'req-length': req.headers['content-length'] || 0
    // });
  });

  next();
});


  };

})(module.exports);