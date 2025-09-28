// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/");

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Vehicle detail route
router.get("/detail/:invId", utilities.handleErrors(invController.buildDetailView))

// Intentional error route
router.get("/trigger-error", utilities.handleErrors(invController.triggerError))

module.exports = router;
