module.exports = {
  compilers: {
    solc: {
      version: "0.8.0", // Use the desired Solidity version
    },
  },
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: ganache-cli)
      port: 7545,            // Ganache's default RPC port
      network_id: "*",       // Match any network ID
    },
  },
  // ... other Truffle configuration options
};
