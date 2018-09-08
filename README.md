[![npm version](https://badge.fury.io/js/async-self-cert.svg)](https://badge.fury.io/js/async-self-cert)

# Help you creating self-signing SSL Certificate
Simple tool to help you creating self-signing SSL Certificate for develop env based on openssl.

**Do not use in production env**

```
npm i -D async-self-cert
```

## Description
### Root SSL certificate
Generate a RSA-2048 key for Root SSL certificate using `genRootCAKey()`:
```js
// Normal
var [error, stdout, stderr] = await genRootCAKey('rootCA.key')
// You can read your password form file as below
var [error, stdout, stderr] = await genRootCAKey('rootCA.key', 'file', 'rootCA.pass')
```

Create a new Root SSL certificate `rootCA.pem` by `rootCA.key` with config (must) using `reqRootCA()`:
```js
// Normal
var [error, stdout, stderr] = await reqRootCA('rootCA.key', 'rootCA.pem', 'rootCA.cnf')
// You can read your password form file as below
var [error, stdout, stderr] = await reqRootCA('rootCA.key', 'rootCA.pem', 'rootCA.cnf', 'file', 'rootCA.pass')
```
Content of config file `rootCA.cnf` like this:
```cnf
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn

[dn]
C=TW
ST=Taiwan R.O.C
L=Kaohsiung
O=Dev Test Organization
OU=Dev Test Organization Uint
emailAddress=YOUR Email Address
CN = Test Common Name
```

#### Trust the root SSL certificate
You need to to tell your OS to trust your root certificate so all individual certificates issued by it are also trusted.

##### MAC
1. Open Keychain Access then go to the Certificates category in your System keychain.
2. Import the `rootCA.pem` using **File > Import Items**.
3. Double click the imported certificate and change the *“When using this certificate:”* dropdown to Always Trust in the Trust section.

##### Windows
See [Deploying the CA certificate manually](https://docs.microsoft.com/en-us/previous-versions/tn-archive/dd441069(v%3dtechnet.10)#deploying-the-ca-certificate-manually)

### Domain SSL certificate
 Generate CSR and key using `genDomainCSR()`, you have to create `domainName.csr.cnf` under same folder before execute:
```js
  var [error, stdout, stderr] = await genDomainCSR('test.domain.dev')
  if(error) throw error
  console.log(`${stdout}`, `${stderr}`)
```
For example, it will read config `test.domain.dev.csr.cnf` to generate `test.domain.dev.csr` and `test.domain.dev.key` for domain `test.domain.dev`.

Content of config file `test.domain.dev.csr.cnf` like this:
```cnf
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn

[dn]
C=TW
ST=Taiwan R.O.C
L=Kaohsiung
O=Dev Test Organization
OU=Dev Test Organization Uint
emailAddress=YOUR Email Address
CN = test.domain.dev
```

Create a domain certificate by CSR and key using `reqX509V3Cert()`, you have to create `domainName.v3.ext` under same folder before execute:
```js
// Normal for first sign
var [error, stdout, stderr] = await reqX509V3Cert('test.domain.dev', 'rootCA.key', 'rootCA.pem')
// You can read your password form file as below
var [error, stdout, stderr] = await reqX509V3Cert('test.domain.dev', 'rootCA.key', 'rootCA.pem', null, 'file', 'rootCA.pass')
```
It will create `domainName.crt` after execute. Content of config file `domainName.v3.ext` like this:
```ext
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = domainName
```

The first time you use your Root CA to sign a domain certificate, it will create a file (like `rootCA.srl`) containing a serial number. 

You are probably going to create more certificate, and the next time you will have to use `reqX509V3Cert()` as below :
```js
// Normal after first sign
var [error, stdout, stderr] = await reqX509V3Cert('second.domain.dev', 'rootCA.key', 'rootCA.pem', 'rootCA.srl')
// You can read your password form file as below
var [error, stdout, stderr] = await reqX509V3Cert('second.domain.dev', 'rootCA.key', 'rootCA.pem', 'rootCA.srl', 'file', 'rootCA.pass')
```

You can see example in `test.js`.

## Documentation

### `async function genRootCAKey(fileName, passout, passoutArg)`
Generate a RSA-2048 key for Root SSL certificate.
- `fileName` : Specific key file name
- `passout` & `passoutArg` : (Optional) see the **PASS PHRASE ARGUMENTS** section in [openssl](https://www.openssl.org/docs/man1.0.2/apps/openssl.html)
- **return** a fulfilled or rejected `Promise` with value `[error, stdout, stderr]`

### `async function reqRootCA(keyFile, fileName, config, passin, passoutArg)`
Generate a RSA-2048 key for Root SSL certificate.
- `keyFile` : root key file name
- `fileName` : root cert file name
- `config` : root config file name
- `passin` & `passoutArg` : (Optional) see the **PASS PHRASE ARGUMENTS** section in [openssl](https://www.openssl.org/docs/man1.0.2/apps/openssl.html)
- **return** a fulfilled or rejected `Promise` with value `[error, stdout, stderr]`

### `async function genDomainCSR (domainName)`
Generate a RSA-2048 key for Root SSL certificate.
- `domainName` : Specific an domain name
- **return** a fulfilled or rejected `Promise` with value `[error, stdout, stderr]`

### `async function reqX509V3Cert (domainName, rootCAKey, rootCACert, rootCAserial, passin, passoutArg)`
Generate a RSA-2048 key for Root SSL certificate.
- `domainName` : domain name
- `rootCAKey` : root key file name
- `rootCACert` : root cert file name
- `rootCAserial` : (Optional) root srl file name,  need after first sign.
- `passin` & `passoutArg` : (Optional) see the **PASS PHRASE ARGUMENTS** section in [openssl](https://www.openssl.org/docs/man1.0.2/apps/openssl.html)
- **return** a fulfilled or rejected `Promise` with value `[error, stdout, stderr]`