const fetch = require('node-fetch');
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);


const constant = require("../constant/index.js");
const secret = require("../constant/secrets.js");

//populate secret with keys
//
async function getLatestPrice(market) {
    //curl --data "market=PTA/BTC" "https://api.hotbit.io/v2/p1/market.last"
    try {
        let resp = await execFile('curl', ['--data', 'market=' + market, constant.BaseUrl_P1 + "market.last"]);
        console.log(resp);
        //let resp = await fetch(constant.BaseUrl_P1 + "market.last", {method: 'POST', body: 'market=PTA/BTC'});
        //let data = await resp.json();
        let data = JSON.parse(resp.stdout);
        if(!data.err) {    
            return parseFloat(data.result);
        }
        return null; 

    } catch(err) {
        console.error("Error message" + err);
    }

}

async function getLatestPriceStatus(period=2,market) {
    //curl --data "market=PTA/BTC" "https://api.hotbit.io/v2/p1/market.last"
    let url = constant.BaseUrl_P1 + "market.status"; 
    let body = `&market=${market}&period=${period}`;
    

    try {
        let resp = await execFile('curl', ['--data', body, url]);
        console.log(resp);
        //let resp = await fetch(constant.BaseUrl_P1 + "market.last", {method: 'POST', body: 'market=PTA/BTC'});
        //let data = await resp.json();
        let data = JSON.parse(resp.stdout);
        if(!data.err) {    
            return parseFloat(data.result.last);
        }
        return null; 

    } catch(err) {
        console.error("Error message" + err);
    }

}

// gets LAST price
async function getLatestPrice_PTA_USDT() {
    //curl --data "market=PTA/USDT" "https://api.hotbit.io/v2/p1/market.last"
    try {
        let resp = await execFile('curl', ['--data', 'market=PTA/USDT', constant.BaseUrl_P1 + "market.last"]);
        //let resp = await fetch(constant.BaseUrl_P1 + "market.last", { method: 'POST', body: 'market=PTA/USDT' });
        //let data = await resp.json();
        let data = JSON.parse(resp.stdout);
        if (!data.err) { 
            return parseFloat(data.result);
        }
        return null;

    } catch(err) {
        console.error("Error message" + err);
    }
}

//enters limit order
async function executeOrder(signedMessage, volume, price, market, side){
    let url = constant.BaseUrl_P2 + "order.put_limit"; 
    let body = `amount=${volume}&api_key=${secret.API_Key}&isfee=0&market=${market}&price=${price}&sign=${signedMessage}&side=${side}`;
    try {
        //let resp = await fetch(url, {method: 'POST', body: body});
        let resp = await execFile('curl', ['--data', body, url]);
        //let data = await resp.json();
        let data = JSON.parse(resp.stdout);
        return data;
    } catch(err) {
        console.error("Error message" + err);
    }
}

// gets low ask/high bid
async function executeBookOrder(market, side, total){
    //curl --data  "market=PTA/USDT&side=1&offset=0&limit=1" "https://api.hotbit.io/v2/p1/order.book"
    let url = constant.BaseUrl_P1 + "order.book"; 
    try {
        let body = `market=${market}&side=${side}&offset=0&limit=${total}`;
        let resp = await execFile('curl', ['--data', body, url]);
        //let resp = await fetch(url, {method: 'POST', body: body});
        //console.log(resp.body)
        //let data = await resp.json();
        let data = JSON.parse(resp.stdout);

        return data.result.orders[0].price;
    } catch(err) {
        console.error("Error message <executeBookOrder> " + err);
    }
}

//cancels unfilled orders
async function cancelOrder(signedMessage, market, order_id){
    let url = constant.BaseUrl_P2 + "order.cancel"; 
    let body = `api_key=${secret.API_Key}&sign=${signedMessage}&market=${market}&order_id=${order_id}`;
    try {
        //let resp = await fetch(url, {method: 'POST', body: body});
        let resp = await execFile('curl', ['--data', body, url]);
        //let data = await resp.json();
        let data = JSON.parse(resp.stdout);
        return data;
    } catch(err) {
        console.error("Error message" + err);
    }
}

//returns finished orders and checks for filled price
async function getFill(signedMessage, order_id){
    let url = constant.BaseUrl_P2 + "order.finished_detail"; 
    let body = `api_key=${secret.API_Key}&sign=${signedMessage}&offset=0&order_id=${order_id}`;
    try {
        //let resp = await fetch(url, {method: 'POST', body: body});
        let resp = await execFile('curl', ['--data', body, url]);
        //let data = await resp.json();
        let data = JSON.parse(resp.stdout);
        return data;
    } catch(err) {
        console.error("Error message" + err);
        console.log("getFill Error time")
    }
}


module.exports = {
    executeOrder: executeOrder,
    executeBookOrder: executeBookOrder,
    cancelOrder: cancelOrder,
    getFill: getFill,
    getLatestPrice: getLatestPrice,
    getLatestPriceStatus: getLatestPriceStatus
    //getLatestPrice_PTA_BTC: getLatestPrice_PTA_BTC

}