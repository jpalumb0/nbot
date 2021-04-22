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
        //let price = await network.getLatestPrice_PTA_USDT();
        let price = await  network.executeBookOrder("PTA/USDT", 1, 1);
        console.log("\n" + price +"\n");
        let len = price.length - 2;
        price = parseFloat(price) - (2 / Math.pow(10, (len)));
        price = price.toFixed(len);
        let side = 1;
        let market = constant.Market_PTAUSDT;
        let signedMessag = signMessage(volumePTAUSDT, price, market, side);

        let order = await network.executeOrder(signedMessag, volumePTAUSDT, price, market, side);
        //console.log(order);
       
        await sleep(paused/10);
        

        //price = 0.006400;
        //price = await network.getLatestPrice_PTA_USDT();
        side = 2;
        //volume = 10;
        signedMessag = signMessage(volumePTAUSDT, price, market, side);
        order = await network.executeOrder(signedMessag, volumePTAUSDT, price, market, side);
        await sleep(paused/2);

        //The below is for BTC
        /*
        price = await network.getLatestPrice_PTA_BTC();
        side = 1;
        market = constant.Market_PTABTC;
        rslt = signMessage(volumePTABTC, price, market, side);
        order = await network.executeOrder(rslt, volumePTABTC, price, market, side);
        //console.log(order);
        await sleep(6000);
        //price = 0.006400;
        price = await network.getLatestPrice_PTA_BTC();
        side = 2;
        //volume = 10;
        rslt = signMessage(volumePTABTC, price, market, side);
        console.log(rslt);
        console.log("Price: "+ price);
        order = await network.executeOrder(rslt, volumePTABTC, price, market, side);
    */
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