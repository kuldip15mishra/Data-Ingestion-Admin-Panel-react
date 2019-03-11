module.exports.apiURL = {
  NEW_SERVER_URL:"https://api.signal.ddriven.in:1111/trender/signals",
  
  NEW_SERVERDATA_URL:"https://api.signal.ddriven.in:1111/trender/signaldata",
  NEW_EXPRESSIONDATA_URL:"https://api.signal.ddriven.in:1111/trender/signaldata/expression",
  SERVER_URL: "https://api.signal.ddriven.in:1111",
  CONNECTION_URL: "https://api.connection.ddriven.in:2124",
  CONNECTION : "/connections",
  START_CONNECTION : "/startConnection",
  STOP_CONNECTION : "/stopConnection",
  RESTART_CONNECTION : "restartConnection",
  SIGNAL_META:"/SignalAPI/signals",
  Actualdata:"/trender/signaldata",
  SIGNAL_META_V1:"/trender/signals",
  TAG_CURRENT_DATA:"/tags/point/current",
  NAME_SEARCH:"?name=",
  SWAGGERHUB_CONNECTORLIST: "http://virtserver.swaggerhub.com/dDrivenSG/Unleash.PlatformServices.ResourceAPI/1.0/connections",
  LOGIN_URL: "http://101.53.138.176:5000/api/login",
  TAG_HISTORY_DATA:"/tags/history/",
  TAG_PATH_VALUE:"optimization_second:",
  REDUCTIONPOINTS:"&maxReductionPoints=100",
  REPRESENTATIONALGORITHM:"&RepresentationAlgorithm=average",
  TIMEOFFSET:"timeOffset=UTC+05:30",
  ELASTICSEARCH:"http://localhost:9200/metasearchv15/_search"
};


 module.exports.alertMessage = {
  MESSAGE:"",
  ADD_MONGODB : "Data successfuly added in mongodb",
  UPDATE_MONGODB : "Data successfuly updated in mongodb",
  DELETE_TREND_MONGODB : "Trend successfuly deleted from mongodb",
  LOGIN_INVALID_EMAIL : "Invalid email",
  LOGIN_SUCCESS : "Logged in successfully",
  LOGIN_INVALID_CREDENTIALS: "Username & Password do not match"
}


module.exports.utilities = {
  LIMIT:"?limit=",
  SKIP:"&skip=",
  TAGNAME:"tagName",
  TAGPATH:'?tagPath=',
  TAGPATHNEW:'tagPath',
  PERIODFROM:'&periodFrom=',
  PERIODTO:'&periodTo='


}
