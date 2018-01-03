import {core, sale, sire } from './eth/web3'
import db from './db/'

import syncKitties from './sync/kitties'
import syncEvents from './sync/events'

// To get contract instance from string eg 'core' w/out using global
const ck = { core, sale, sire }

// block at which cryptokitties was deployed
const firstBlock = 4605167

// Activate!
// last arg is throttle in milliseconds aka delay between eth data requests
syncEvents(ck, firstBlock, 200)
syncKitties(ck, firstBlock, 5000) // basically turn this off for now..
