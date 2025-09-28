const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  const inv_id = req.params.invId
  const itemData = await invModel.getInventoryById(inv_id)
  let nav = await utilities.getNav()
  const itemHTML = await utilities.buildDetailView(itemData)
  const name = `${itemData.inv_year} ${itemData.inv_make} ${itemData.inv_model}`
  
  res.render("./inventory/detail", {
    title: name,
    nav,
    item: itemHTML,
  })
}

// Intentional error for testing (Task 3)
invCont.triggerError = async function (req, res, next) {
  try {
    throw new Error("This is an intentional 500 error for testing.")
  } catch (error) {
    next(error) // Pass error to middleware
  }
}

module.exports = invCont
