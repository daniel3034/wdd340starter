const { body, validationResult } = require("express-validator");
const utilities = require('./index');

const classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a classification name.")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Classification name cannot contain spaces or special characters."),
  ];
};

const checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: errors.array(),
    });
    return;
  }
  next();
};

function inventoryRules() {
  return [
    body('classification_id')
      .trim()
      .notEmpty()
      .withMessage('Please select a classification.'),
    body('inv_make')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Make is required (at least 2 chars)')
      .matches(/^[A-Za-z0-9\s\-\']+$/)
      .withMessage('Make contains invalid characters.'),
    body('inv_model')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Model is required.'),
    body('inv_year')
      .trim()
      .isInt({ min: 1886, max: new Date().getFullYear() + 1 })
      .withMessage('Please provide a valid year.'),
    body('inv_price')
      .trim()
      .isFloat({ min: 0 })
      .withMessage('Please provide a valid price.'),
    body('inv_description')
      .trim()
      .isLength({ min: 10 })
      .withMessage('A longer description is required.'),
    body('inv_image')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Please provide an image path.'),
    body('inv_thumbnail')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Please provide a thumbnail path.'),
  ];
}

async function checkInventoryData(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // rebuild classificationList with the selected value so the select remains sticky
    const classificationList = await utilities.buildClassificationList(req.body.classification_id);

    // render add-inventory view with errors and sticky fields
    return res.render('inventory/add-inventory', {
      title: 'Add New Inventory',
      classificationList,
      nav: await utilities.getNav(),
      errors: errors.array(),
      // pass back each field so locals.<field> is available in view
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_price: req.body.inv_price,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      classification_id: req.body.classification_id,
    });
  }
  next();
}

/* ******************************
 * Check data and return errors or continue to update inventory item
 * ***************************** */
async function checkUpdateData(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // rebuild classificationList with the selected value so the select remains sticky
    const classificationSelect = await utilities.buildClassificationList(req.body.classification_id);

    // get the item name for the title
    const itemName = `${req.body.inv_make} ${req.body.inv_model}`;

    // render edit-inventory view with errors and sticky fields
    return res.render('inventory/edit-inventory', {
      title: 'Edit ' + itemName,
      classificationSelect,
      nav: await utilities.getNav(),
      errors: errors.array(),
      // pass back each field so locals.<field> is available in view
      inv_id: req.body.inv_id,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_price: req.body.inv_price,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      classification_id: req.body.classification_id,
    });
  }
  next();
}

module.exports = { classificationRules, checkClassificationData, inventoryRules, checkInventoryData, checkUpdateData };
