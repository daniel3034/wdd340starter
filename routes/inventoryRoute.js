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
router.get("/", utilities.checkAccountType, utilities.handleErrors(invController.buildManagement));

// Deliver add-classification view
router.get("/add-classification", utilities.checkAccountType, utilities.handleErrors(invController.buildAddClassification));

// Handle classification form submission
router.post(
  "/add-classification",
  utilities.checkAccountType,
  invValidate.classificationRules(),  // validation rules
  invValidate.checkClassificationData, // check validation results
  utilities.handleErrors(invController.addClassification)      // controller logic
);

// Deliver add-inventory form
router.get('/add-inventory', utilities.checkAccountType, utilities.handleErrors(invController.buildAddInventory));

// Process add-inventory submission
router.post(
  '/add-inventory',
  utilities.checkAccountType,
  invValidate.inventoryRules(), // server-side validation rules
  invValidate.checkInventoryData, // validation result check & re-render on error
  utilities.handleErrors(invController.addInventory)
);

// Route to deliver edit inventory view
router.get("/edit/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.editInventoryView));

// Process inventory update submission
router.post(
  "/update/",
  utilities.checkAccountType,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// Route to deliver delete confirmation view
router.get("/delete/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.deleteInventoryView));

// Process inventory deletion
router.post("/delete/", utilities.checkAccountType, utilities.handleErrors(invController.deleteInventory));

module.exports = router;
