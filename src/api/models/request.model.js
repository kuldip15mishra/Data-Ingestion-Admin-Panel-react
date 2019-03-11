const mongoose = require('mongoose');

/*
Tagdata  request schema
*/
const requestSchema = new mongoose.Schema({
    collectionName: String,
    operation: String,
    payload: [{}]
    
});


/*
Method to make an object of parameters of tagdata request
*/
requestSchema.method({
    transform() {
      const transformed = [];
      const fields = ['collectionName','operation','payload'];
  
      fields.forEach((field) => {
        transformed[field] = this[field];
      });
  
      return transformed;
    },
});

module.exports = mongoose.model('RequestSchema', requestSchema);

