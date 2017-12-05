const { Pool } = require('pg')
const pool = new Pool()

const fakeDB = []

const hasSales = (block) => {
  return fakeDB.indexOf(block) !== -1
}

const saveSales = (events) => {
  console.log(JSON.stringify(events))
}

module.exports = {
  hasSales,
  saveSales,
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  }
}
