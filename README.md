
# Usage

## Getting setup with Docker & an Ethereum Provider

This project is powered by Docker. To use it, you need to have created a registry at Docker.io and have docker installed. If/when these are both complete, make sure you login by running

`docker login`

By default, deployment scripts use your system username as your docker.io username. There is a `me` variable in any relevant `*-build.sh` or `*-deploy.sh` script that you can change to your docker.io username if these aren't the same.

First, you need to have a docker-ized ethereum provider. These are available from [my ethprovider repo](https://github.com/bohendo/ethprovider).

```
git clone https://github.com/bohendo/ethprovider
cd ethprovider
bash build-geth.sh && bash deploy-geth.sh
```

In general, it's not a good idea to blindly run scripts you find online. Luckily, these build/deploy scripts are very simple, about 30 and 15 lines respectively and most of this is just an embedded Dockerfile or docker-compose.yml. Edit these to tweak your docker.io username, command line options, etc

## Build & Deploy ck-mill

Once you have an ethprovider container running, you're ready to build & deploy ck-mill. First, grab the code:

```
git clone https://github.com/bohendo/ck-mill
cd ck-mill
```

To deploy locally:

```
make
bash scripts/deploy-ckmill.sh
```

To deploy to a remote server:

```
make deploy
scp scripts/deploy-ckmill.sh remoteServer:~
ssh remoteServer bash deploy-ckmill.sh
```

Where `remoteServer` is the hostname of some machine you have ssh access to. Make sure you've deployed an ethprovider to this machine first.

If you want to autobirth, you'll need to import an account to the ethprovider serving your ck-mill. To do this, I created a dedicated autobirther account on MetaMask and imported the private key into geth using the [`personal_importRawKey` RPC method](https://github.com/ethereum/go-ethereum/wiki/Management-APIs#personal_importrawkey). It looked something like:

` echo '{"jsonrpc":"2.0","method":"personal_importRawKey","params":["secretKey","secretPassword"],"id":1}' | sudo nc -U /var/lib/docker/volumes/ethprovider_ipc/_data/geth.ipc`

Protip: Putting a space before the command means your secrets won't get saved to `~/.bash_history`

Once your ethprovider has an account, you'll have to create a docker secret called `autobirther` to store the password.

`echo "secretPassword" | tr -d '\n\r' | docker secret create autobirther -`

Then you can run the following on whichever machine you want to autobirth.

`bash scripts/deploy-autobirther.sh`

## Cryptokitties Smart-Contract Developer Cheat-Sheet

# KittyCore Contract: [0x06012c8cf97BEaD5deAe237070F9587f8E7A266d](https://etherscan.io/address/0x06012c8cf97bead5deae237070f9587f8e7a266d#code)

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
 - `getKitty(uint256)`: returns [isPregnant [bool], isReady [bool], coolDownIndex [uint256], nextActionTime [uint256],
      SiringWith [uint256], birthTime [uint256], matronID [uint256], sireID [uint256], generation [uint256], genes [uint256]]

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

### Storage aka `eth.getStorageAt(core.address, i)` where `i =`
 0. ceoAddress: `0x000000000000000000000000af1e54b359b0897133f437fc961dd16f20c045e1`
 1. cfoAddress: `0x0000000000000000000000002041bb7d8b49f0bde3aa1fa7fb506ac6c539394c`
 2. cooAddress: `0x000000000000000000000000a1e12defa6dbc8e900a6596083322946c03f01e3`
 3. first half of cooldowns array: `0x0000384000001c2000000e1000000708000002580000012c000000780000003c`
 4. second half of cooldowns array: `0x000000000000000000093a80000546000002a300000151800000e10000007080`
 5. seconds per block: `0x000000000000000000000000000000000000000000000000000000000000000f`
 6. kitties: length eg `0x00000000000000000000000000000000000000000000000000000000000682cb`
 7. kittyIndexToOwner 
 8. ownershipTokenCount
 9. ownershipTokenCount
 10. sireAllowedToAddress
 11. saleAuction(?): `0x000000000000000000000000b1690c08e213a35ed9bab7b318de14420fb57d8c`
 12. sireAuction(?): `0x000000000000000000000000c7af99fe5513eb6710e6d5f44f9989da40f27f26`
 13. ???

(Above labels are according to order of declared variables in kitty core contract source code)

# KittySales Contract: [0xb1690C08E213a35Ed9bAb7B318DE14420FB57d8C](https://etherscan.io/address/0xb1690C08E213a35Ed9bAb7B318DE14420FB57d8C#code)

### Calls/Reads
 - `getAuction(kittyID [uint256])`: returns [seller [address], startPrice [uint256], endPrice [uint256], duration [uint256], startTime [uint256]]

### Events
 - `AuctionCreated(kittyID [uint256], startPrice [uint256], endPrice [uint256], duration [uint256])`
 - `AuctionSuccessful(kittyID [uint256], price [uint256], winner [address])`
 - `AuctionCancelled(kittyID [uint256])`

# KittySires Contract: [0xC7af99Fe5513eB6710e6D5f44F9989dA40F27F26](https://etherscan.io/address/0xC7af99Fe5513eB6710e6D5f44F9989dA40F27F26#code)

### Calls/Reads
 - `getAuction(kittyID [uint256])`: returns [seller [address], startPrice [uint256], endPrice [uint256], duration [uint256], startTime [uint256]]

### Events
 - `AuctionCreated(kittyID [uint256], startPrice [uint256], endPrice [uint256], duration [uint256])`
 - `AuctionSuccessful(kittyID [uint256], price [uint256], winner [address])`
 - `AuctionCancelled(kittyID [uint256])`

