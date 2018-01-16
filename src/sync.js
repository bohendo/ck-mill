import syncKitties from './sync/kitties'
import syncEvents from './sync/events'

// arg is throttle in milliseconds aka delay between eth data requests
syncEvents(100)
syncKitties(1000)
