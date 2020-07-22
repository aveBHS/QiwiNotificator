const request = require('request');
const { currencyTypes } = require("./const.js");
const fs = require("fs");

exports.renderPayment = function (data, paymentBox, qiwiLogin){
    let body, commission = '';
    let info = '';

    if(data.commission.amount > 0){
        commission = `<p>Комиссия опперации: ${data.commission.amount} ${currencyTypes[data.commission.currency.toString()]}</p>`;
    }
    if(data.view.account != ''){
        if(data.view.account.substring(2) != qiwiLogin.substring(1)){
            if(data.type == 'IN'){
                info = `<p class='payment_more_info'>Отправитель: ${data.view.account}</p>`;
            }
            else{
                info = `<p class='payment_more_info'>Получатель: ${data.view.account}</p>`;
            }
        }
    }
    if(data.comment != null){
        info = `<p class='payment_more_info'>Комментарий: ${data.comment}</p>`;
    }
    if(data.provider.logoUrl == undefined){
        data.provider.logoUrl = "./img/no_pic.png";
    }
    if(data.type == 'IN'){
        // body = `
        // <table class='payment'>
        //     <img class='payment_img' src='${data.provider.logoUrl}'>
        //     <p>Пополнение Qiwi кошелька</p>
        //     <p class='payment_amount positive'>Приход: ${data.sum.amount} ${currencyTypes[data.sum.currency.toString()]}</p>
        //     ${commission}
        //     ${sender}
        //     <p>Дата: ${data.date.split('+')[0].replace('T', ' в ')}</p>
        // </table>`;
        body = `
        <table class='payment'>
            <tr>
                <td class='payment_img'>
                    <img class='payment_img' src='${data.provider.logoUrl}'>
                </td>
                <td class='payment_title'>
                    Пополнение QIWI кошелька
                    ${info}
                </td>
                <td class='payment_amount positive'>
                    +${data.total.amount} ${currencyTypes[data.total.currency.toString()]}
                </td>
            </tr>
            <!--<p>Дата: ${data.date.split('+')[0].replace('T', ' в ')}</p>-->
        </table>`;
    }
    else{
        body = `
        <table class='payment'>
            <tr>
                <td class='payment_img'>
                    <img class='payment_img' src='${data.provider.logoUrl}'>
                </td>
                <td class='payment_title'>
                    ${data.view.title} ${data.view.account}
                    ${info}
                </td>
                <td class='payment_amount negative'>
                    -${data.total.amount} ${currencyTypes[data.total.currency.toString()]}
                </td>
            </tr>
            <!--<p>Дата: ${data.date.split('+')[0].replace('T', ' в ')}</p>-->
        </table>`;
    }
    paymentBox.innerHTML += body;
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
                    console.log(data);
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