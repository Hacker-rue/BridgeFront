const FabricCaServices = require("fabric-ca-client")
const config = require('./configCa.json')

const caClient = new FabricCaServices(config.url, {
    trustedRoots: config.tlsCACerts.pem,
    verify: false
}, config.caName)

async function enroll(login, password) {
    const user = await caClient.enroll({
        enrollmentID: login,
        enrollmentSecret: password
    })

    return {
        userCert: user.certificate,
        userKey: user.key.toBytes()
    }
}

module.exports = {
    enroll
}