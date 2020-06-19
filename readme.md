# Youtube GameBar Search Server
A simple server to implement YTGBO's Search feature, using node-ytsr library.

## Usage
* 1: Clone this repository.  
* 2: On repository's root, run `npm install`.  
* 3: To run the server, use: `node index.js`  

Server will be listening at port 54522 and will output log to `status.log` file inside repository's root.

## Tips
It is highly recommended to use the `pm2` process manager to recover from internal failures and automatize the service providing.

## Licensing
MIT License.
