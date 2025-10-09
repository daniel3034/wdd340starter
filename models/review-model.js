const pool = require("../database/")

/* ***************************
 *  Add new review
 * ************************** */
async function addReview(review_title, review_text, review_rating, account_id, inv_id) {
  try {
    const sql = `INSERT INTO review 
      (review_title, review_text, review_rating, account_id, inv_id) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *`
    const result = await pool.query(sql, [review_title, review_text, review_rating, account_id, inv_id])
    return result.rows[0]
  } catch (error) {
    console.error("addReview error: " + error)
    return null
  }
}

/* ***************************
 *  Get all approved reviews for a vehicle
 * ************************** */
async function getReviewsByVehicleId(inv_id) {
  try {
    const sql = `SELECT r.*, a.account_firstname, a.account_lastname 
      FROM review r
      JOIN account a ON r.account_id = a.account_id
      WHERE r.inv_id = $1 AND r.review_approved = true
      ORDER BY r.review_date DESC`
    const result = await pool.query(sql, [inv_id])
    return result.rows
  } catch (error) {
    console.error("getReviewsByVehicleId error: " + error)
    return []
  }
}

/* ***************************
 *  Get average rating for a vehicle
 * ************************** */
async function getAverageRating(inv_id) {
  try {
    const sql = `SELECT 
      ROUND(AVG(review_rating), 1) as avg_rating,
      COUNT(*) as review_count
      FROM review 
      WHERE inv_id = $1 AND review_approved = true`
    const result = await pool.query(sql, [inv_id])
    return result.rows[0]
  } catch (error) {
    console.error("getAverageRating error: " + error)
    return { avg_rating: 0, review_count: 0 }
  }
}

/* ***************************
 *  Check if user already reviewed this vehicle
 * ************************** */
async function checkExistingReview(account_id, inv_id) {
  try {
    const sql = `SELECT * FROM review WHERE account_id = $1 AND inv_id = $2`
    const result = await pool.query(sql, [account_id, inv_id])
    return result.rowCount > 0
  } catch (error) {
    console.error("checkExistingReview error: " + error)
    return false
  }
}

/* ***************************
 *  Get all reviews for admin management
 * ************************** */
async function getAllReviews() {
  try {
    const sql = `SELECT r.*, a.account_firstname, a.account_lastname, 
      i.inv_make, i.inv_model, i.inv_year
      FROM review r
      JOIN account a ON r.account_id = a.account_id
      JOIN inventory i ON r.inv_id = i.inv_id
      ORDER BY r.review_date DESC`
    const result = await pool.query(sql)
    return result.rows
  } catch (error) {
    console.error("getAllReviews error: " + error)
    return []
  }
}

/* ***************************
 *  Update review approval status
 * ************************** */
async function updateReviewApproval(review_id, approved) {
  try {
    const sql = `UPDATE review SET review_approved = $1 WHERE review_id = $2 RETURNING *`
    const result = await pool.query(sql, [approved, review_id])
    return result.rows[0]
  } catch (error) {
    console.error("updateReviewApproval error: " + error)
    return null
  }
}

/* ***************************
 *  Delete review
 * ************************** */
async function deleteReview(review_id) {
  try {
    const sql = `DELETE FROM review WHERE review_id = $1`
    const result = await pool.query(sql, [review_id])
    return result.rowCount > 0
  } catch (error) {
    console.error("deleteReview error: " + error)
    return false
  }
}

/* ***************************
 *  Get featured reviews for homepage
 * ************************** */
async function getFeaturedReviews(limit = 3) {
  try {
    const sql = `SELECT r.*, a.account_firstname, a.account_lastname,
      i.inv_make, i.inv_model, i.inv_year
      FROM review r
      JOIN account a ON r.account_id = a.account_id
      JOIN inventory i ON r.inv_id = i.inv_id
      WHERE r.review_approved = true AND r.review_rating >= 4
      ORDER BY r.review_rating DESC, r.review_date DESC
      LIMIT $1`
    const result = await pool.query(sql, [limit])
    return result.rows
  } catch (error) {
    console.error("getFeaturedReviews error: " + error)
    return []
  }
}

module.exports = {
  addReview,
  getReviewsByVehicleId,
  getAverageRating,
  checkExistingReview,
  getAllReviews,
  updateReviewApproval,
  deleteReview,
  getFeaturedReviews
}
