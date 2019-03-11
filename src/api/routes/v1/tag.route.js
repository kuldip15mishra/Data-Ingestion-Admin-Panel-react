const express = require('express');
const controller = require('../../controllers/tag.controller');
const router = express.Router();


/*
Tag data route
*/


router.route ('/signal')
.get(controller.signalNames)


router.route('/tagmeta?:tagName?:tagPath')
  .get(controller.tagData)

router.route('/metav1?:tagName?:tagPath')
  .get(controller.tagDataElastic)



router.route('/tagvalue/:name')
  .get(controller.tagValue)


router.route('/getdata')
  .post(controller.dataExplorer)


router.route('/excelexport')
  .post(controller.dataExport)

router.route('/tagdata')
  .post(controller.tagBrowserList)

  
router.route('/tagdata/1hr')
  .post(controller.SignalOneHourData)
router.route('/tagdata/current')
  .post(controller.SignalCurrentData)
router.route('/tagdata/1hravg')
  .post(controller.SignalHourAvgData)
router.route('/tagdata/24hravg')
  .post(controller.Signal24HourAvgData)




module.exports = router;
