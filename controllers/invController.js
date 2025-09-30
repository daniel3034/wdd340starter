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

/* ****************************************
*  Deliver management view
* *************************************** */
async function buildManagement(req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
  });
}

/* ****************************************
*  Deliver add-classification view
* *************************************** */
async function buildAddClassification(req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  });
}

/* ****************************************
*  Process add-classification
* *************************************** */
async function addClassification(req, res, next) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;

  try {
    const addResult = await invModel.addClassification(classification_name);

    if (addResult) {
      req.flash("notice", `The classification ${classification_name} was successfully added.`);
      nav = await utilities.getNav(); // refresh nav to show new classification
      res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav,
        errors: null,
      });
    } else {
      req.flash("notice", "Sorry, the insert failed.");
      res.status(501).render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null,
      });
    }
  } catch (error) {
    console.error(error);
    req.flash("notice", "An error occurred.");
    res.status(500).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
    });
  }
}

async function buildAddInventory(req, res, next) {
  try {
    const classificationList = await utilities.buildClassificationList();
    const nav = await utilities.getNav();
    res.render('inventory/add-inventory', {
      title: 'Add New Inventory',
      nav,
      classificationList,
      classification_id: "",
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_price: "",
      inv_image: "",
      inv_thumbnail: "",
      errors: null,
    });
  } catch (error) {
    next(error);
  }
}

async function addInventory(req, res, next) {
  try {
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_image,
      inv_thumbnail,
    } = req.body;

    // Call model function to insert
    const result = await invModel.addInventory(
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_image,
      inv_thumbnail
    );

    if (result) {
      req.flash('notice', `The ${inv_make} ${inv_model} was added successfully.`);
      const nav = await utilities.getNav(); // refresh nav so new classification/items show
      return res.status(201).render('inventory/management', {
        title: 'Inventory Management',
        nav,
      });
    } else {
      // insertion failed
      const classificationList = await utilities.buildClassificationList(classification_id);
      req.flash('notice', 'Sorry, adding the inventory item failed.');
      return res.status(501).render('inventory/add-inventory', {
        title: 'Add New Inventory',
        nav: await utilities.getNav(),
        classificationList,
        errors: null,
        // return sticky fields
        classification_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_price,
        inv_image,
        inv_thumbnail,
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
}

invCont.buildManagement = buildManagement;
invCont.buildAddClassification = buildAddClassification;
invCont.addClassification = addClassification;
invCont.buildAddInventory = buildAddInventory;
invCont.addInventory = addInventory;

module.exports = invCont;
