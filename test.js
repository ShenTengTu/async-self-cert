const {
  genRootCAKey,
  reqRootCA,
  genDomainCSR,
  reqX509V3Cert
} = require('./index')

async function run() {
  try {
    //Generate a RSA-2048 key for Root SSL certificate
    var [error, stdout, stderr] = await genRootCAKey('rootCA.key', 'file', 'rootCA.pass')
    if(error) throw error
    console.log(`${stdout}`, `${stderr}`)

    //Create a new Root SSL certificate with config and pass file
    var [error, stdout, stderr] = await reqRootCA('rootCA.key', 'rootCA.pem', 'rootCA.cnf', 'file', 'rootCA.pass')
    if(error) throw error
    console.log(`${stdout}`, `${stderr}`)


    //Generate CSR and key for test.domain.dev
    var [error, stdout, stderr] = await genDomainCSR('test.domain.dev')
    if(error) throw error
    console.log(`${stdout}`, `${stderr}`)

    //Create SSL certificate for test.domain.dev with Root cert and Root pass file (first sign)
    var [error, stdout, stderr] = await reqX509V3Cert('test.domain.dev', 'rootCA.key', 'rootCA.pem', null, 'file', 'rootCA.pass')
    if(error) throw error
    console.log(`${stdout}`, `${stderr}`)


    //Generate CSR and key for second.domain.dev
    var [error, stdout, stderr] = await genDomainCSR('second.domain.dev')
    if(error) throw error
    console.log(`${stdout}`, `${stderr}`)

    //Create SSL certificate for second.domain.dev with Root cert and Root pass file (after first sign)
    var [error, stdout, stderr] = await reqX509V3Cert('second.domain.dev', 'rootCA.key', 'rootCA.pem', 'rootCA.srl', 'file', 'rootCA.pass')
    if(error) throw error
    console.log(`${stdout}`, `${stderr}`)

  } catch (error) {
    console.log(`${error}`)
  }
}

run()