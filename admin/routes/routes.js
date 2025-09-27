var express = require('express');
var router = express.Router();
var sampleRoutes = require('../controller/mainCtrl'); // Ensure path is correct

// Define routes
// router.post('/postCompanydetails', sampleRoutes.postCompanyCtrl); // Route for company registration
// router.get('/getCompanydetails', sampleRoutes.getCompanydetailsCtrl); // Route for fetching customer details

router.post('/login', sampleRoutes.loginCtrl); 
router.post('/insertCustomer', sampleRoutes.createCustomerCtrl); 
router.get('/customerDtls', sampleRoutes.customerdetailsCtrl); 
router.get('/statusesDtls', sampleRoutes.statusdetailsCtrl); 
router.get('/runnerDtls', sampleRoutes.runnerdetailsCtrl); 
 router.get('/customerByid', sampleRoutes.customerByidCtrl); 
router.post('/scheduleBulk', sampleRoutes.scheduleBulkCtrl); 

router.get('/orderCustomerdetails', sampleRoutes.orderCustomerdetailsCtrl); 
router.post('/assignRunner', sampleRoutes.assignRunnerCtrl)
router.post('/postWeightCategories', sampleRoutes.postWeightCategoriesCtrl) //weight pending
router.get('/getWeightCategories', sampleRoutes.getWeightCategoriesCtrl);//weight pending

router.post('/deleteWeightCategories', sampleRoutes.deleteWeightCategoriesCtrl);//weight pending

//order
router.post('/postOrder', sampleRoutes.postOrderCtrl);//orders apin add one table       
router.post('/assignRunner', sampleRoutes.assignRunnerCtrl);

router.post('/updateCollection', sampleRoutes.updateCollectionCtrl);

// gifts
router.post('/insertGift', sampleRoutes.insertGiftCtrl);
router.get('/getGifts', sampleRoutes.getGiftsCtrl);
router.post('/deleteGifts', sampleRoutes.deleteGiftsCtrl);

router.post('/insertGiftStock', sampleRoutes.insertGiftStockCtrl);




module.exports = router;
