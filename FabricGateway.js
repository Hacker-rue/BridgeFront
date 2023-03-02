const { connect ,signers } = require("@hyperledger/fabric-gateway")
const grpc = require("@grpc/grpc-js")
const crypto = require('crypto')
const utfDecode = new TextDecoder()
const config = require('./configGateway.json')

const vaultName = "vault2"

module.exports = {
    startGateway,
    newTransfer,
    transferToken,
    getAccountId,
    mintToken,
    getUserTransfers,
    getTransfer
}

async function startGateway(userCerts) {

    const peer = config.peers[reqName(config.peers)]
    // console.log(peer)
    const mspId = config.organizations[reqName(config.organizations)].mspid

    return connect({
        client: newGrpcClient(peer.url, peer.grpcOptions.hostnameOverride, peer.tlsCACerts.pem),
        identity: newIdentity(mspId, userCerts.userCert),
        signer: newSigner(userCerts.userKey)
    })
}

//Создание заявки
async function newTransfer(gateway, channelName, to, amount, tokenType, txId) {
    const network = gateway.getNetwork(channelName)
    const contract = network.getContract(vaultName)
    const transaction = await contract.submitAsync("newTransfer", {
        arguments: [to, String(amount), tokenType, txId]
    })
    return transaction.getTransactionId()
}

//перевод токенов
async function transferToken(gateway, channelName, tokenType, to, amount) {
    const network = gateway.getNetwork(channelName)
    const contract = network.getContract(tokenType)
    const transaction = await contract.submitAsync("Transfer", {
        arguments: [to, String(amount)]
    })
    return transaction.getTransactionId()
}

//Получить акаунт id
async function getAccountId(gateway) {
    const network = gateway.getNetwork("mychannel")
    const contract = network.getContract("erc20")
    const transaction = await contract.submitAsync("ClientAccountID")
    return utfDecode.decode(transaction.getResult())
}

//получить токены на аккаунт
async function mintToken(gateway, tokenType, amount) {
    const network = gateway.getNetwork("mychannel")
    const contract = network.getContract(tokenType)
    const transaction = await contract.submitAsync("Mint", {
        arguments: [String(amount)]
    })
    return utfDecode.decode(transaction.getResult())
}

async function getUserTransfers(gateway) {
    try {
        var result = []
        const network = gateway.getNetwork("mychannel")
        const contract = network.getContract(vaultName)
        const userTransfersId = JSON.parse(utfDecode.decode(await contract.evaluateTransaction("getUserTransfersId")))
        
        for(var i = 0; i < userTransfersId.transfers.length; i++) {
            var transfer = JSON.parse(utfDecode.decode(await contract.evaluateTransaction("getTransfer", userTransfersId.transfers[i])))
            result.push(transfer)
        }
        return result
    } catch(er) {
        throw er
    }
}

async function getTransfer(gateway, txId) {
    const network = gateway.getNetwork("mychannel")
    const contract = network.getContract(vaultName)
    try {
        const transfer = JSON.parse(utfDecode.decode(await contract.evaluateTransaction("getTransfer", txId)))
        return transfer
    } catch(er) {
        throw er
    }
}


function newGrpcClient(peerEndpoint, peerHostAlias, tlsRootCert) {
    const tlsCredentials = grpc.credentials.createSsl(new Buffer(tlsRootCert))
    return new grpc.Client(peerEndpoint, tlsCredentials, {
        "grpc.ssl_target_name_override": peerHostAlias
    })
}

function newIdentity(mspId, credentials) {
    return { mspId, credentials: new Buffer(credentials) }
}

function newSigner(privateKeyPem) {
    const privateKey = crypto.createPrivateKey(new Buffer(privateKeyPem));
    return signers.newPrivateKeySigner(privateKey);
}

function reqName(obj) {
    for(var x in obj) {
        if(x) {
            return x
        }
    }
    return undefined
}