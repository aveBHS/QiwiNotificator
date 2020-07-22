const request = require('request');
const { currencyTypes } = require("./const.js");
const fs = require("fs");

exports.renderPayment = function (data, paymentBox, qiwiLogin){
    let title, body, commission = '';
    let comment = '';
    let sender = '';

    if(data.commission.amount > 0){
        commission = `<br>Комиссия опперации: ${data.commission.amount} ${currencyTypes[data.commission.currency.toString()]}`;
    }
    if(data.comment != null){
        comment = `<br>Комментарий: ${data.comment}`;
    }
    if(data.view.account != ''){
        if(data.view.account.substring(2) != qiwiLogin.substring(1)){
            sender = `<br>Отправитель: ${data.view.account}${comment}`;
        }
    }
    if(data.type == 'IN'){
        title = "<h2>Пополнение Qiwi кошелька</h2>";
        body = `Приход: ${data.sum.amount} ${currencyTypes[data.sum.currency.toString()]}${commission}` + 
        `${sender}` +
        `<br>Дата: ${data.date.split('+')[0].replace('T', ' в ')}`;
    }
    else{
        title = `<h2>${data.view.title}</h2>`;
        body = `Сумма перевода: ${data.total.amount} ${currencyTypes[data.total.currency.toString()]}${commission}` + 
        `<br>Получатель: ${data.view.account}${comment}` + 
        `<br>Дата: ${data.date.split('+')[0].replace('T', ' в ')}`;
    }
    paymentBox.innerHTML += (title + body + "<hr>");
}

exports.loadPayments = function (paymentBox, render, loadBox){
    const { loadQiwiInfo } = require("./core.js");
    let qiwiInfo = loadQiwiInfo();
    let qiwiLogin = qiwiInfo.login;
    let qiwiToken = qiwiInfo.token;

    let url = new URL('https://edge.qiwi.com/payment-history/v2/persons/' + qiwiLogin + '/payments');
    url.searchParams.set('rows', 10);

    paymentBox.innerHTML = "";
    loadBox.hidden = false;

    request.get(
        {
            url: url,
            headers: {
                'User-agent': 'Mozilla/5.0',
                'authorization': ('Bearer ' + qiwiToken)
            }
        }, (err, response) => {
            if(err){
                console.log(err);
            }
            else{
                let data = JSON.parse(response.body).data;
                data.forEach((data) => {
                    render(data, paymentBox, qiwiLogin);
                });
                loadBox.hidden = true;
            }
        }
    );
}

exports.loadQiwiInfo = function(){
    return JSON.parse(fs.readFileSync("./config.json", "utf8"));
}