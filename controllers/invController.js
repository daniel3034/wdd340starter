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
  
  // Add the classification select list
  const classificationSelect = await utilities.buildClassificationList();
  
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect, // Add this to pass the select list to the view
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.deleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price
  })
}

/* ***************************
 *  Process Delete Inventory
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inv_id = parseInt(req.body.inv_id)
  
  const deleteResult = await invModel.deleteInventoryItem(inv_id)
  
  if (deleteResult) {
    req.flash("notice", "The inventory item was successfully deleted.")
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    res.redirect("/inv/delete/" + inv_id)
  }
}

invCont.buildManagement = buildManagement;
invCont.buildAddClassification = buildAddClassification;
invCont.addClassification = addClassification;
invCont.buildAddInventory = buildAddInventory;
invCont.addInventory = addInventory;

module.exports = invCont;
