const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const jwt = require('jwt-simple');
const uuidv4 = require('uuid/v4');
const APIError = require('../utils/APIError');
const { env, jwtSecret, jwtExpirationInterval } = require('../../config/vars');

const dataexplorerSchema = new mongoose.Schema({
    connString: String,
    
    payload: {
        timePeriod : String,
        startTime : String,
        endTime : String,
        tag:[],
        skip: Number,
        take: Number,
        maxReductionPoints:Number,
        userID: String,
        sessionID: String,
        resource: String
    }
});

dataexplorerSchema.method({
    transform() {
      const transformed = {};
      const fields = ['connString','payload'];

      fields.forEach((field) => {
        transformed[field] = this[field];
      });

      return transformed;
    },
});

module.exports = mongoose.model('DataExplorerSchema', dataexplorerSchema);
