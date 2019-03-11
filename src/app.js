const { port, env } = require('./config/vars');
const app = require('./config/express');
const mongoose = require('./config/mongoose');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
app.listen(port, () => console.info(`server started on port ${port} (${env})`));

var express = require('express');
var expressWinston = require('express-winston');
var winston = require('winston');

//test
// var app = module.exports = express();

var logger = winston.createLogger({
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

app.use(require("morgan")("combined", { "stream": loggerstream }));





// app.use('/logout', function (req, res) {
//     res.send('Hi there..you have logged in')
// })

// app.listen(3000, function () {
//     console.log('Example app listening on port 3000!')
// })

module.exports = app;
