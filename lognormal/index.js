function getRandomArbitrary(n1, n2) {
    let max;
    let min;
    if(n1 < n2) {
        max = n2;
        min = n1;
    } else {
        max = n1;
        min = n2;
    }
    return Math.random() * (max - min) + min;
}
  
function lognormal(m, v) {
    let arr = [];
    let phi = Math.sqrt(v + m**2);
    let mu = Math.log(m**2/phi);
    let sigma = Math.sqrt(Math.log(phi**2/m**2));
    for(let i = 0; i < 25; i++) {
        let x = getRandomArbitrary(mu, sigma);
        let y = Math.exp(x);
        let y_dec_2 = y.toFixed(2);
        arr.push(y_dec_2);
    }
    return arr;
}

module.exports = {
    lognormal: lognormal
}