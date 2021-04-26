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

function signMessage(volume, price, market, side){
    let message = `amount=${volume}&api_key=${secret.API_Key}&isfee=0&market=${market}&price=${price}&side=${side}&secret_key=${secret.Secret}`;
    return md5(message).toUpperCase();
}

async function placeOrder(volumePTAUSDT, volumePTABTC, paused) {
    try {
        //USDT pair
        let price = await  network.executeBookOrder("PTA/USDT", 1, 1);
        let len = price.length - 2;
        let ranNumber = Math.floor((Math.random()*7)+1);
        price = parseFloat(price) - (ranNumber / Math.pow(10, (len)));
        price = price.toFixed(len);
        let side = 1;
        let market = constant.Market_PTAUSDT;
        let signedMessag = signMessage(volumePTAUSDT, price, market, side);

        let order = await network.executeOrder(signedMessag, volumePTAUSDT, price, market, side);
       
        await sleep(paused/10);
        

        side = 2;
        signedMessag = signMessage(volumePTAUSDT, price, market, side);
        order = await network.executeOrder(signedMessag, volumePTAUSDT, price, market, side);
        await sleep(paused/2);

        //The below is for BTC
        
        price = await network.executeBookOrder("PTA/BTC", 1, 1);
        len = price.length - 2;
        ranNumber = Math.floor((Math.random()*9)+1);
        price = parseFloat(price) - (ranNumber / Math.pow(10, (len)));
        price = price.toFixed(len);
        side = 1;
        market = constant.Market_PTABTC;
        signedMessag = signMessage(volumePTABTC, price, market, side);
        order = await network.executeOrder(signedMessag, volumePTABTC, price, market, side);
        console.log(order);
        await sleep(paused/10);


        side = 2;
        signedMessag = signMessage(volumePTABTC, price, market, side);
        order = await network.executeOrder(signedMessag, volumePTABTC, price, market, side);
        console.log(order);

    } catch(err) {
        console.error("Error message" + err);

    }
}

async function orderLoop(pause, dailyVolume){
    let volumePerHour = (dailyVolume*3) / 6;
    const StandardDeviation = 700;

    while(true) {
        let arrayUSDTVariables = lognormal.lognormal(volumePerHour, StandardDeviation);
        let arrayBTCVariables = lognormal.lognormal(volumePerHour, StandardDeviation);
        for(let i = 0; i <= 24; i++) {
            let sellPTAUSDTVolume = arrayUSDTVariables[i];
            let sellPTABTCVolume = arrayBTCVariables[i];
            try {
                // place sell order, and check that it was successful
                let buyExecuted = await placeOrder(Math.ceil(sellPTAUSDTVolume), Math.ceil(sellPTABTCVolume), pause);
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