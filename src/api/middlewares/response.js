
exports.formatResponseTry= (response)=>{
  var result={}
  result['status'] = 'true'
  result['code'] = 200
  Current_Time = Math.floor(Date.now() / 1000);
  result['timestamp'] = Current_Time
  result['payload'] = response
  result['error'] = []
  result['message'] = 'Success'
  
  return result 
}

exports.formatResponseCatch= (response)=>{
 var result={}
   result['status'] = 'false'
  result['code'] = response.code
  Current_Time =  Math.floor(Date.now() / 1000);
  result['timestamp'] = Current_Time
  result['payload'] = []
  result['error'] = error
  result['message'] = 'Failed'
  
  return result 
}