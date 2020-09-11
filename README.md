
### Getting started:
- ```docker build -t imatrix/cert```
- ```docker run -p 443:443 imatrix/cert```

### For running integration tests:
- set TEST value to IMATRIX_ENVIRONMENT system variable and run the server
- ```npm run test``` or ```yarn test```

### For generating Root CA and server certs:
- ```export OPENSSL_CONF="openssl.cnf"```
- ```openssl ecparam -out rootCA.key -name secp256r1 -genkey```
- ```openssl req -new -x509 -days 12784  -subj "/C=US/ST=Nevada/L=Zephyr Cove/O=iMatrix Systems Inc./OU=Internet of Things/CN=*.imatrixsys.com" -reqexts SAN -key rootCA.key -out rootCA.crt```
- ```openssl ecparam -out server.key -name secp256r1 -genkey```
- ```openssl req -new -sha256 -config server.cnf -key server.key -out server.csr```
- ```openssl x509 -req -extfile server.cnf -extensions v3_req -days 12784 -in server.csr -CA rootCA.crt -CAkey rootCA.key -CAcreateserial -out server.crt```
- openssl.cnf and server.cnf in certs directory

### For signing clients CSR:
- ```openssl x509 -req -extfile client.cnf -extensions v3_req -days 12784 -in client.csr -CA rootCA.crt -CAkey rootCA.key -CAcreateserial```
- client.cnf in certs/client-certs, for each manufacturer different config is using


