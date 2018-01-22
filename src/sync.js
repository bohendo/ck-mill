import syncKitties from './sync/kitties'
import syncEvents from './sync/events'

// arg is throttle in milliseconds aka delay between eth data requests
// setting throttle too low will
// - overload the database and _pendingQueue will grow until we run out of memory & crash
// - overwhelm our eth provider and cause it to fall behind the network

syncEvents(250)
syncKitties(250)
