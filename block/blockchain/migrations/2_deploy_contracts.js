const userId = artifacts.require("./userId");

module.exports = function(deployer) {
  deployer.deploy(userId);
};
