const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
// const compress = require('compression');
// const methodOverride = require('method-override');
const cors = require('cors');
// const helmet = require('helmet');
const passport = require('passport');
const routes = require('../api/routes/v1');
const { logs } = require('./vars');
const strategies = require('./passport');
const error = require('../api/middlewares/error');

var allowMethods = require('allow-methods');


/**
* Express instance
* @public
*/
const app = express();
var winston = require('winston');

var expressWinston= require('express-winston')

// request logging. dev: console | production: file
app.use(morgan(logs));

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var httpContext = require('express-http-context');


// gzip compression
// app.use(compress());

// lets you use HTTP verbs such as PUT or DELETE
// in places where the client doesn't support it
// app.use(methodOverride());

// secure apps by setting various HTTP headers
// app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// enable authentication
app.use(passport.initialize());
passport.use('jwt', strategies.jwt);

// mount api routes
// var winston = require('winston');
// app.use(winston.logger());

var loggers = winston.createLogger({
    transports: [
       new winston.transports.File({
      level: 'debug',
      filename: './logs/all-logs.log',
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      colorize: false,
      timestamp: true
    }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
}),

    loggerstream = {
        write: function (message, encoding) {
            logger.info(message);
        }
    };

    var formatMessage = function(message) {
   var reqId = httpContext.get('reqId');
    message = reqId ? message + " reqId: " + reqId : message;
    return message;
};



var logger = {
    log: function(level, message) {
        loggers.log(level, formatMessage(message));
    },
    error: function(message) {
        loggers.error(formatMessage(message));
    },
    warn: function(message) {
        loggers.warn(formatMessage(message));
    },
    verbose: function(message) {
        loggers.verbose(formatMessage(message));
    },
    info: function(message) {
        loggers.info(formatMessage(message));
    },
    debug: function(message) {
        loggers.debug(formatMessage(message));
    },
    silly: function(message) {
        loggers.silly(formatMessage(message));
    }
};

app.use(require("morgan")("combined", { "stream": loggerstream }));

app.use('/api', routes);

// app.use(function(req, res, next) {
//     httpContext.set('reqId', uuid.v1());
//     next();
// });

// winston.createLogger('/api', routes)



// if error is not an instanceOf APIError, convert it.
app.use(error.converter);

// catch 404 and forward to error handler
app.use(error.notFound);

// error handler, send stacktrace only during development
app.use(error.handler);

app.all(allowMethods(['get', 'head']))


module.exports = app;
