////////////////////////////////////////
// 3rd Party Imports
import fs from 'fs'
import { Pool } from 'pg'

const pool = new Pool({ password: fs.readFileSync('/run/secrets/postgres', 'utf8')})

export default {
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  },
  connect: (callback) => {
    return pool.connect(callback)
  },
}
