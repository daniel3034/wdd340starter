// Needed Resources 
const express = require("express")
const router = new express.Router() 
const reviewController = require("../controllers/reviewController")
const utilities = require("../utilities")
const reviewValidate = require('../utilities/review-validation')

// Route to build add review view
router.get("/add/:inv_id", 
  utilities.checkLogin,
  utilities.handleErrors(reviewController.buildAddReview))

// Route to process add review
router.post("/add", 
  utilities.checkLogin,
  utilities.handleErrors(reviewController.addReview))

// Route to build review management view (Admin/Employee only)
router.get("/management", 
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(reviewController.buildReviewManagement))

// Route to update review approval status
router.post("/approve", 
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(reviewController.updateReviewApproval))

// Route to delete review
router.get("/delete/:review_id", 
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(reviewController.deleteReview))

// API route to get vehicle reviews as JSON
router.get("/vehicle/:inv_id", 
  utilities.handleErrors(reviewController.getVehicleReviewsJSON))

module.exports = router