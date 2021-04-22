
const prompt = require('prompt');
const order = require('./order/index');


async function main() {
    try {
        const promptMessage = 'How much USD volume per day?';
        const result = await prompt.get([promptMessage]);
        let pause = 60*100*2; 
        //Test used 
        console.log(result[promptMessage]);
        order.orderLoop(pause, parseInt(result[promptMessage]));
    } catch(err) {
        console.error("Prompt Failure: "+ err);
    }

}

main();