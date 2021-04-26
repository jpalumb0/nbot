const fetch = require('node-fetch');

const constant = require("../constant/index.js");
const secret = require("../constant/secrets.js");

//populate secret with keys

async function getLatestPrice_PTA_BTC() {
    //curl --data "market=PTA/BTC" "https://api.hotbit.io/v2/p1/market.last"
    try {
        let resp = await fetch(constant.BaseUrl_P1 + "market.last", {method: 'POST', body: 'market=PTA/BTC'});
        let data = await resp.json();
        if(!data.err) {
            console.log(data);
            console.log(parseFloat(data.result));        
            return parseFloat(data.result);
        }
        return null; 

    } catch(err) {
        console.error("Error message" + err);
    }

}

async function getLatestPrice_PTA_USDT() {
    //curl --data "market=PTA/USDT" "https://api.hotbit.io/v2/p1/market.last"
    try {
        let resp = await fetch(constant.BaseUrl_P1 + "market.last", { method: 'POST', body: 'market=PTA/USDT' });
        let data = await resp.json();
        if (!data.err) {
            console.log(parseFloat(data.result));
            console.log(data);
            return parseFloat(data.result);
        }
        return null;

    } catch(err) {
        console.error("Error message" + err);
    }
}

async function executeOrder(signedMessage, volume, price, market, side){
    let url = constant.BaseUrl_P2 + "order.put_limit"; 
    let body = `amount=${volume}&api_key=${secret.API_Key}&isfee=0&market=${market}&price=${price}&sign=${signedMessage}&side=${side}`;
    try {
        let resp = await fetch(url, {method: 'POST', body: body});
        let data = await resp.json();
        return data;
    } catch(err) {
        console.error("Error message" + err);
    }

}

async function executeBookOrder(market, side, total){
    //curl --data  "market=PTA/USDT&side=1&offset=0&limit=1" "https://api.hotbit.io/v2/p1/order.book"
    let url = constant.BaseUrl_P1 + "order.book"; 
    try {
        let body = `market=${market}&side=${side}&offset=0&limit=${total}`;
        let resp = await fetch(url, {method: 'POST', body: body});
        let data = await resp.json();
        return data.result.orders[0].price;
    } catch(err) {
        console.error("Error message" + err);
    }

}


module.exports = {
    executeOrder: executeOrder,
    executeBookOrder: executeBookOrder,
    getLatestPrice_PTA_USDT: getLatestPrice_PTA_USDT,
    getLatestPrice_PTA_BTC: getLatestPrice_PTA_BTC

}


