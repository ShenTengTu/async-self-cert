
const { exec } = require('child_process');

function execCmd (cmd) {
  return new Promise((resolve, reject) => {

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject([error, stdout, stderr])
      } else {
        resolve([null, stdout, stderr])
      } 
    })

  }).then(r => r).catch(r => r)
}

function passArg(type, pass, arg) {
  let passArg = ['pass', 'env', 'file', 'fd', 'stdin']
  let extra = ''
  switch(pass) {
    case passArg[0]:
    case passArg[1]:
    case passArg[2]:
    case passArg[3]:
      return `-${type} ${pass}:${arg}`
    break
    case passArg[4]:
      return `-${type} ${pass}`
    break
    default:
      return ''
    break
  }
}

async function genRootCAKey(fileName, passout, passoutArg) {
  let extra = passArg('passout', passout, passoutArg)
  let cmd = `openssl genrsa -des3 -out ${fileName} ${extra} 2048`
  
  console.log(cmd)
  return execCmd(cmd)
}

async function reqRootCA(keyFile, fileName, config, passin, passoutArg) {
  let extra = passArg('passin',  passin, passoutArg)
  let cmd = `openssl req -x509 -new -nodes -key ${keyFile} -sha256 -out ${fileName} -days 36500 -config ${config} ${extra}`
  console.log(cmd)
  return execCmd(cmd)
}

async function genDomainCSR (domainName) {
  let cmd = `openssl req -new -sha256 -nodes -out ${domainName}.csr -newkey rsa:2048 -keyout ${domainName}.key -config ${domainName}.csr.cnf`

  console.log(cmd)
  return execCmd(cmd)
}

async function reqX509V3Cert (domainName, rootCAKey, rootCACert, rootCAserial, passin, passoutArg) {
  let extra = passArg('passin',  passin, passoutArg)
  let serial = '-CAcreateserial'
  if(rootCAserial) serial = `-CAserial ${rootCAserial}`
  let cmd = `openssl x509 -req -sha256 -days 36500 -in ${domainName}.csr -out ${domainName}.crt -extfile ${domainName}.v3.ext -CA ${rootCACert} -CAkey ${rootCAKey} ${serial} ${extra}`

  console.log(cmd)
  return execCmd(cmd)
}

module.exports = {
  genRootCAKey,
  reqRootCA,
  genDomainCSR,
  reqX509V3Cert
}