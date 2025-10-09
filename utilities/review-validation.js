const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
 *  Review Data Validation Rules
 * ********************************* */
validate.reviewRules = () => {
  return [
    // Review title is required and must be string
    body("review_title")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 3, max: 100 })
      .withMessage("Review title must be between 3 and 100 characters."),

    // Review text is required
    body("review_text")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Review must be between 10 and 1000 characters."),

    // Rating is required and must be 1-5
    body("review_rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5 stars."),

    // Vehicle ID must be valid integer
    body("inv_id")
      .isInt({ min: 1 })
      .withMessage("Invalid vehicle ID.")
  ]
}

/* ******************************
 * Check data and return errors or continue to add review
 * ***************************** */
validate.checkReviewData = async (req, res, next) => {
  const { review_title, review_text, review_rating, inv_id } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const invModel = require("../models/inventory-model")
    const vehicleData = await invModel.getInventoryById(inv_id)
    const vehicleName = vehicleData ? 
      `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}` : 
      "Unknown Vehicle"
    
    res.render("reviews/add-review", {
      errors,
      title: `Review ${vehicleName}`,
      nav,
      vehicleData,
      vehicleName,
      review_title,
      review_text,
      review_rating
    })
    return
  }
  next()
}

module.exports = validate