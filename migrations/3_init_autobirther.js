
var KittyCore = artifacts.require("./KittyCore.sol");

var Autobirther = artifacts.require("./Autobirther.sol");

module.exports = function(deployer, network, accounts) {

  if (network === "live") {

    deployer.deploy(Autobirther);

  } else if (network === "development") {

    deployer.link(KittyCore, Autobirther)

    deployer.deploy(Autobirther);

  }

};
