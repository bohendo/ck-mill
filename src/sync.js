import {core, sale, sire } from './eth/web3'
import db from './db/'

import syncKitties from './sync/kitties'
import syncEvents from './sync/events'

// To get contract instance from string eg 'core' w/out using global
const ck = { core, sale, sire }

// block at which cryptokitties was deployed
const firstBlock = 4605167

// Pause throttle milliseconds between recalling events from previous blocks
// (Because geth can't stay synced if we relentlessly request data from it)
const throttle = 100

// Activate!
syncKitties(ck, firstBlock, throttle)
syncEvents(ck, firstBlock, throttle)
