// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/");
const invValidate = require('../utilities/inventory-validation');

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Vehicle detail route
router.get("/detail/:invId", utilities.handleErrors(invController.buildDetailView))

// Route to get inventory items by classification_id as JSON
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Intentional error route
router.get("/trigger-error", utilities.handleErrors(invController.triggerError))

// Management view
router.get("/", utilities.handleErrors(invController.buildManagement));

// Deliver add-classification view
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));

// Handle classification form submission
router.post(
  "/add-classification",
  invValidate.classificationRules(),  // validation rules
  invValidate.checkClassificationData, // check validation results
  utilities.handleErrors(invController.addClassification)      // controller logic
);

// Deliver add-inventory form
router.get('/add-inventory', utilities.handleErrors(invController.buildAddInventory));

// Process add-inventory submission
router.post(
  '/add-inventory',
  invValidate.inventoryRules(), // server-side validation rules
  invValidate.checkInventoryData, // validation result check & re-render on error
  utilities.handleErrors(invController.addInventory)
);

module.exports = router;
