const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const reviewController = {}

/* ***************************
 *  Build add review view
 * ************************** */
reviewController.buildAddReview = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    const nav = await utilities.getNav()
    const vehicleData = await invModel.getInventoryById(inv_id)
    
    if (!vehicleData) {
      req.flash("notice", "Vehicle not found.")
      return res.redirect("/")
    }

    // Check if user already reviewed this vehicle
    const existingReview = await reviewModel.checkExistingReview(res.locals.accountData.account_id, inv_id)
    if (existingReview) {
      req.flash("notice", "You have already reviewed this vehicle.")
      return res.redirect(`/inv/detail/${inv_id}`)
    }

    const vehicleName = `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`
    
    res.render("reviews/add-review", {
      title: `Review ${vehicleName}`,
      nav,
      vehicleData,
      vehicleName,
      errors: null,
      review_title: "",
      review_text: "",
      review_rating: ""
    })
  } catch (error) {
    console.error("buildAddReview error: " + error)
    next(error)
  }
}

/* ***************************
 *  Process add review
 * ************************** */
reviewController.addReview = async function (req, res, next) {
  try {
    console.log("Processing review submission...")
    console.log("Request body:", req.body)
    console.log("Account data:", res.locals.accountData)
    
    const { review_title, review_text, review_rating, inv_id } = req.body
    
    // Check if user is logged in
    if (!res.locals.accountData || !res.locals.accountData.account_id) {
      req.flash("notice", "You must be logged in to submit a review.")
      return res.redirect("/account/login")
    }
    
    const account_id = res.locals.accountData.account_id
    const nav = await utilities.getNav()

    console.log("Checking for existing review...")
    // Check if user already reviewed this vehicle
    const existingReview = await reviewModel.checkExistingReview(account_id, inv_id)
    if (existingReview) {
      req.flash("notice", "You have already reviewed this vehicle.")
      return res.redirect(`/inv/detail/${inv_id}`)
    }

    console.log("Adding review to database...")
    const result = await reviewModel.addReview(
      review_title,
      review_text,
      parseInt(review_rating),
      account_id,
      parseInt(inv_id)
    )

    console.log("Review result:", result)
    
    if (result) {
      req.flash("notice", "Thank you for your review! It will be published after approval.")
      res.redirect(`/inv/detail/${inv_id}`)
    } else {
      req.flash("notice", "Sorry, adding the review failed.")
      const vehicleData = await invModel.getInventoryById(inv_id)
      const vehicleName = `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`
      
      res.render("reviews/add-review", {
        title: `Review ${vehicleName}`,
        nav,
        vehicleData,
        vehicleName,
        errors: null,
        review_title,
        review_text,
        review_rating
      })
    }
  } catch (error) {
    console.error("addReview error: " + error)
    console.error("Error stack:", error.stack)
    next(error)
  }
}

/* ***************************
 *  Build review management view (Admin only)
 * ************************** */
reviewController.buildReviewManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const reviews = await reviewModel.getAllReviews()
    
    res.render("reviews/review-management", {
      title: "Review Management",
      nav,
      reviews,
      errors: null
    })
  } catch (error) {
    console.error("buildReviewManagement error: " + error)
    next(error)
  }
}

/* ***************************
 *  Update review approval status
 * ************************** */
reviewController.updateReviewApproval = async function (req, res, next) {
  try {
    const { review_id, approved } = req.body
    const result = await reviewModel.updateReviewApproval(review_id, approved === 'true')
    
    if (result) {
      req.flash("notice", `Review ${approved === 'true' ? 'approved' : 'rejected'} successfully.`)
    } else {
      req.flash("notice", "Failed to update review status.")
    }
    
    res.redirect("/reviews/management")
  } catch (error) {
    console.error("updateReviewApproval error: " + error)
    next(error)
  }
}

/* ***************************
 *  Delete review
 * ************************** */
reviewController.deleteReview = async function (req, res, next) {
  try {
    const review_id = parseInt(req.params.review_id)
    const result = await reviewModel.deleteReview(review_id)
    
    if (result) {
      req.flash("notice", "Review deleted successfully.")
    } else {
      req.flash("notice", "Failed to delete review.")
    }
    
    res.redirect("/reviews/management")
  } catch (error) {
    console.error("deleteReview error: " + error)
    next(error)
  }
}

/* ***************************
 *  Get vehicle reviews as JSON
 * ************************** */
reviewController.getVehicleReviewsJSON = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    const reviews = await reviewModel.getReviewsByVehicleId(inv_id)
    const avgRating = await reviewModel.getAverageRating(inv_id)
    
    res.json({
      reviews,
      avgRating: avgRating.avg_rating || 0,
      reviewCount: avgRating.review_count || 0
    })
  } catch (error) {
    console.error("getVehicleReviewsJSON error: " + error)
    res.status(500).json({ error: "Failed to fetch reviews" })
  }
}

module.exports = reviewController