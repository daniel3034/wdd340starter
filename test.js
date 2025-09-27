const db = require("./database")

async function testDb() {
  try {
    const result = await db.query("SELECT NOW()")
    console.log("Database time:", result.rows[0])
  } catch (err) {
    console.error("DB connection error:", err)
  }
}

testDb()
