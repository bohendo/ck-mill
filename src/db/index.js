////////////////////////////////////////
// 3rd Party Imports
import fs from 'fs'
import { Pool } from 'pg'

const err = (msg) => { console.error(`Error: ${msg}`); process.exit(1) }

const pool = new Pool({ password: fs.readFileSync('/run/secrets/postgres', 'utf8')})

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

// Initialize Sales Table
pool.query(`CREATE TABLE IF NOT EXISTS sales(
  txid        CHAR(64)    PRIMARY KEY,
  block       INT         NOT NULL,
  kittyId     INT         NOT NULL,
  sale        BOOLEAN     NOT NULL,
  sire        BOOLEAN     NOT NULL,
  value       NUMERIC(24) NOT NULL,
  lastSynced  TIMESTAMP   NOT NULL
);`).catch(err)

// Initialize Kitties Table
pool.query(`CREATE TABLE IF NOT EXISTS kitties (
  id             INT          PRIMARY KEY,
  isGestating    BOOLEAN      NOT NULL,
  isReady        BOOLEAN      NOT NULL,
  birthTime      TIMESTAMP    NOT NULL,
  nextActionAt   TIMESTAMP    NOT NULL,
  cooldownIndex  INT          NOT NULL,
  siringWithId   INT          NOT NULL,
  matronId       INT          NOT NULL,
  sireId         INT          NOT NULL,
  generation     INT          NOT NULL,
  genes          NUMERIC(80)  NOT NULL,
  forSale        BOOLEAN      NOT NULL,
  forSire        BOOLEAN      NOT NULL,
  currentPrice   NUMERIC(24),
  startPrice     NUMERIC(24), 
  endPrice       NUMERIC(24),
  duration       INT,
  startedAt      TIMESTAMP,
  lastSynced     TIMESTAMP    NOT NULL
);`).catch(err)

export default {
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  },
  connect: (callback) => {
    return pool.connect(callback)
  },
}
