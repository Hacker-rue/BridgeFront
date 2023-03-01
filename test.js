const {enroll} = require('./FabricCa')
const fabricGateway = require('./FabricGateway')

const releAddr = "x509::/C=US/ST=North Carolina/O=Hyperledger/OU=admin/CN=org1admin::/C=US/ST=North Carolina/L=Durham/O=org1.example.com/CN=ca.org1.example.com"

async function main() {
    var user = await enroll("user1", "user1pw")
    // console.log(user)
    const gateway = await fabricGateway.startGateway(user)

    var txIdTransferToken = await fabricGateway.transferToken(gateway, "mychannel", "erc20", releAddr, 200)
    console.log(txIdTransferToken)
    var txIdVault = await fabricGateway.newTransfer(gateway, "mychannel", "0:b4c75cf26c4dfb8935325d72578b8a61afd7057fcdce0cd5d872e8a00f0e1772", 200, "erc20", txIdTransferToken)
    console.log(txIdVault)

}

main()