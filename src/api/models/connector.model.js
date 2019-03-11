const mongoose = require('mongoose');

/*
Connector request schema
*/
const requestschema = new mongoose.Schema({
    operation: String,
    payload: [{}]   
});


/*
Method to make an object of parameters of tagdata request
*/
requestschema.method({
    transform() {
      const transformed = [];
      const fields = ['operation','payload'];
  
      fields.forEach((field) => {
        transformed[field] = this[field];
      });
      return transformed;
    },
});

module.exports = mongoose.model('Requestschema', requestschema);