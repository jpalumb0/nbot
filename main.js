const prompt = require('prompt');
const order = require('./order/index');


async function main() {
    try {
        const promptMessage = 'How much USD volume per day?';
        const result = await prompt.get([promptMessage]);
        const promptProbe = 'Would you like to probe for hidden orders? If yes, enter 1';
        const resultProbe = await prompt.get([promptProbe]);
        let pause = 60*100*2; 
        //Test used 
        console.log(result[promptMessage]);
        order.orderLoop(pause, parseInt(result[promptMessage]), 'PTA/USDT', parseInt(resultProbe[promptProbe]));
        order.orderLoop(pause, parseInt(result[promptMessage]), 'PTA/BTC', parseInt(resultProbe[promptProbe]));
    } catch(err) {
        console.error("Prompt Failure: "+ err);
    }

}

main();