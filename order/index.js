const md5 = require('md5');
const lognormal = require("../lognormal/index.js");
const constant = require("../constant/index.js");
const network = require("../network/index.js");
const secret = require("../constant/secrets.js");


function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
} 

function signMessageExecute(volume, price, market, side){
    let message = `amount=${volume}&api_key=${secret.API_Key}&isfee=0&market=${market}&price=${price}&side=${side}&secret_key=${secret.Secret}`;
    return md5(message).toUpperCase();
}

function signMessageCancel(market, order_id){
    let message = `api_key=${secret.API_Key}&market=${market}&order_id=${order_id}&secret_key=${secret.Secret}`;
    return md5(message).toUpperCase();
}

function signMessageFill(order_id){
    let message = `api_key=${secret.API_Key}&offset=0&order_id=${order_id}&secret_key=${secret.Secret}`;
    return md5(message).toUpperCase();
}

// get price from book
// place order for one, based on book
// check fill on order for one
// if fill < price, reset price from fill
// else use price

//get price
//place order for one
//check fill
//decide which price to use
//place order for full

async function setOrderPrice(price, market){
    //let price = await  network.executeBookOrder(market, 1, 1);
    if (market == 'PTA/USDT'){
        var priceLen = 6;
    } else if (market == 'PTA/BTC'){
        var priceLen = 10;
    }
    price = parseFloat(price).toFixed(priceLen);
    //console.log("refPrice: " + price);
    let len = price.toString().length - 2;
    //console.log("len: " + len)
    let ranNumber = Math.floor((Math.random()*7)+1);
    price = price - (ranNumber / Math.pow(10, (len)));
    price = price.toFixed(len);
    return price;
}

async function placeOrder(volume, paused, price, market) {
    try {
        //USDT pair
        // get price
        //let price = await  network.executeBookOrder("PTA/USDT", 1, 1);
        //let len = price.length - 2;
        //let ranNumber = Math.floor((Math.random()*7)+1);
        //price = parseFloat(price) - (ranNumber / Math.pow(10, (len)));
        //price = price.toFixed(len);
        let side = 1; //sell
        //let market = constant.Market_PTAUSDT;
        let signedMessag = signMessageExecute(volume, price, market, side);
        //enter order
        let order = await network.executeOrder(signedMessag, volume, price, market, side);
        //console.log(order.result);
        sellId = order.result.id;
        //console.log(sellId);
       
        await sleep(paused/10);
        

        side = 2; //buy
        signedMessag = signMessageExecute(volume, price, market, side);
        //enter buy order
        order = await network.executeOrder(signedMessag, volume, price, market, side);
        buyId = order.result.id;
        //console.log(buyId);
        await sleep(paused/2);

        //The below is for BTC
        
        // price = await network.executeBookOrder("PTA/BTC", 1, 1);
        // len = price.length - 2;
        // ranNumber = Math.floor((Math.random()*11)+1);
        // price = parseFloat(price) - (ranNumber / Math.pow(10, (len)));
        // price = price.toFixed(len);
        // side = 1;
        // market = constant.Market_PTABTC;
        // signedMessag = signMessage(volumePTABTC, price, market, side);
        // order = await network.executeOrder(signedMessag, volumePTABTC, price, market, side);
        // BTCSellId = order.result.id;
        // console.log(BTCSellId);
        // await sleep(paused/10);


        // side = 2;
        // signedMessag = signMessage(volumePTABTC, price, market, side);
        // order = await network.executeOrder(signedMessag, volumePTABTC, price, market, side);
        // BTCBuyId = order.result.id;
        // console.log(BTCBuyId);
        // await sleep(paused/2);

    } catch(err) {
        console.error("Error message" + err);
        await sleep(paused/2);

    }
    //return order ids
    return [sellId, buyId];
}

async function cancelAllOrders(orders, market){
    try{
        for(let i = 0; i<orders.length; i++){
            
            let order_id = orders[i];
            //console.log(order_id);
            //console.log(market);
            let signedMessage = signMessageCancel(market, order_id)
            
            let cancel = await network.cancelOrder(signedMessage, market, order_id);
            //console.log(cancel);
            
        }

    } catch(err) {
        console.error("Error message" + err);
    }
}

async function orderLoop(pause, dailyVolume, market){
    let volumePerHour = dailyVolume/24;
    let StandardDeviation = 0.2*volumePerHour;

    while(true) {
        let arrayVariables = lognormal.lognormal(volumePerHour, StandardDeviation);
        //let arrayBTCVariables = lognormal.lognormal(volumePerHour, StandardDeviation);
        for(let i = 0; i <= 24; i++) {
            let sellVolume = arrayVariables[i];
            //let sellPTABTCVolume = arrayBTCVariables[i];
            try {
                // place sell order, and check that it was successful
                
                //console.log(priceLen);
                let refPrice = await  network.executeBookOrder(market, 1, 1);
                //console.log("Ref price: " + refPrice);
                
                let price = await setOrderPrice(refPrice, market);
                //console.log("order price: " + price);
                //console.log(price);
                let buyProbe = await placeOrder(1, pause/6, price, market);
                let buyOrderId = buyProbe[1];
                //console.log(buyOrderId + "_" + typeof buyOrderId);
                let signedMessage = signMessageFill(buyOrderId);
                //console.log(signedMessage);
                await sleep(pause/2);
                let fill = await network.getFill(signedMessage, buyOrderId);
                //console.log(fill);
                if (fill.result.price < price){
                    price = await setOrderPrice(fill.result.price);
                }

                let buyExecuted = await placeOrder(Math.ceil(sellVolume), pause, price, market);
                console.log(buyExecuted);
                await sleep(pause/10);
                try {
                    let cancelled = await cancelAllOrders(buyExecuted);
                    //console.log(cancelled);
                } catch(err){
                    console.error(err);
                }
            } catch(err) {
                console.error(err);
            }


        }
        await sleep(pause/2);
        
    }
}

module.exports = {
    orderLoop: orderLoop
}
//orderLoop(10000, 7000);