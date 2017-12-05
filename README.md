
## Cryptokitties Smart-Contract Cheat-Sheet

# KittyCore: [0x06012c8cf97BEaD5deAe237070F9587f8E7A266d](https://etherscan.io/address/0x06012c8cf97bead5deae237070f9587f8e7a266d#code)

### Dependencies/External Calls
 - `saleAuction()`: address of sales-auction contract aka "0xb1690C08E213a35Ed9bAb7B318DE14420FB57d8C"
 - `siringAuction()`: address of siring-auction contract aka "0xC7af99Fe5513eB6710e6D5f44F9989dA40F27F26"
 - `geneScience()`: address of gene-science contract aka "0xf97e0A5b616dfFC913e72455Fde9eA8bBe946a2B"

### Calls/Reads
 - `autoBirthFee()`: variable storing birth fee
 - `pregnantKitties()`: number of kitties currently pregnant
 - `totalSupply()`: total number of kittens created so far
 - `gen0CreatedCount()`: returns number of generation 0 cats created so far
 - `balanceOf(address)`: number of kittens owned by some address
 - `tokensOfOwner(address)`: returns array of kittyIDs owned by some address
 - `isPregnant(uint256)`: true if the given kittyID is pregnant
 - `isReadyToBreed(uint256)`: true if kittyID can breed
 - `canBreedWith(uint256,uint256)`: true if two kittyIDs can breed together
 - `ownerOf(uint256)`: returns address that owns some kittyID
 - `getKitty(uint256)`: returns all relevant info for some kittyID []

### Methods/Transactions/Writes
 - `createSaleAuction(kittyID [uint256], startingPrice [uint256], endPrice [uint256], duration [uint256])`: Put kittyID up for sale
 - `createSiringAuction(kittyID [uint256], startingPrice [uint256], endPrice [uint256], duration [uint256])`: Put kittyID up for sire
 - `breedWithAuto(kittyID [uint256], kittyID [uint256])`: Breed two kittyIDs that you own
 - `giveBirth(kittyID [uint256])`: Handler for pregnant kittyID who is ready to deliver
 - `transfer(recipient [address], kittyID [uint256])`: give some recipient address one of the kittyIDs you own
 - `bidOnSiringAuction(sireID [uint256], matronID [uint256])`: ends some siring auction for sireID by bidding & breeding w our matronID

### Events
 - `Transfer(from [address], to [address], kittyID [uint256])`
 - `Approval(owner [address], approved [address], kittyID [uint256])`
 - `Birth(owner [address], kittyID [uint256], matronID [uint256], sireID [uint256], genes [uint256])`
 - `Pregnant(owner [address], matronID [uint256], sireID [uint256], cooldownEndBlock [uint256])`

# KittySales: [0xb1690C08E213a35Ed9bAb7B318DE14420FB57d8C](https://etherscan.io/address/0xb1690C08E213a35Ed9bAb7B318DE14420FB57d8C#code)

### Calls/Reads
### Methods/Transactions/Writes
### Events
 - `AuctionCreated(kittyID [uint256], startPrice [uint256], endPrice [uint256], duration [uint256])`
 - `AuctionSuccessful(kittyID [uint256], price [uint256], winner [address])`
 - `AuctionCancelled(kittyID [uint256])`

# KittySires: [0xC7af99Fe5513eB6710e6D5f44F9989dA40F27F26](https://etherscan.io/address/0xC7af99Fe5513eB6710e6D5f44F9989dA40F27F26#code)

### Calls/Reads
### Methods/Transactions/Writes
### Events
 - `AuctionCreated(kittyID [uint256], startPrice [uint256], endPrice [uint256], duration [uint256])`
 - `AuctionSuccessful(kittyID [uint256], price [uint256], winner [address])`
 - `AuctionCancelled(kittyID [uint256])`

