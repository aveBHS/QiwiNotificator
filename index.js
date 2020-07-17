const {app, BrowserWindow, Notification} = require("electron");
const request = require('request');
const core = require('./core');
const currencyTypes = {
    '643': 'RUB'
};


let lastPaymentID = 0;
let main = null;

function getPayments() {
    let url = new URL('https://edge.qiwi.com/payment-history/v2/persons/' + qiwiLogin + '/payments');
    url.searchParams.set('rows', 10);
    request.get(
        {
            url: url,
            headers: {
                'User-agent': 'Mozilla/5.0',
                'authorization': ('Bearer ' + qiwiToken)
            }
        }, (err, response, body) => {
            if(err){
                console.log(err);
            }
            else{
                let data = JSON.parse(response.body).data;
                if(lastPaymentID == 0){
                    lastPaymentID = data[0].txnId;
                    let startNotify = new Notification({
                        title: `Qiwi Notificator`,
                        body: `Программа успешно запущенна!`,
                        icon: "./img/icon.png"
                    });
                    startNotify.show();
                    return;
                }
                if(data[0].txnId > lastPaymentID){
                    console.log("New payment");
                    data.forEach((payment) => {
                        console.log(payment.txnId);
                        if(payment.txnId > lastPaymentID){
                            showNotification(payment);
                        }
                    });
                    lastPaymentID = data[0].txnId;
                }
            }
        }
    );
}

function showNotification(data){
    let notify = null;
    let commission = '';
    let comment = '';
    let sender = "";
    if(data.commission.amount > 0){
        commission = `\nКомиссия опперации: ${data.commission.amount} ${currencyTypes[data.commission.currency.toString()]}`;
    }
    if(data.comment != null){
        comment = `\nКомментарий: ${data.comment}`;
    }
    if(data.view.account != ''){
        if(data.view.account.substring(2) != qiwiLogin.substring(1)){
            sender = `\nОтправитель: ${data.view.account}${comment}`;
        }
    }
    if(data.type == 'IN'){
        notify = new Notification({
            title: "Пополнение Qiwi кошелька",
            body: `Приход: ${data.sum.amount} ${currencyTypes[data.sum.currency.toString()]}${commission}` + 
            `${sender}` +
            `\nДата: ${data.date.split('+')[0].replace('T', ' в ')}`,
            icon: "./img/icon.png"
        });
    }
    else{
        notify = new Notification({
            title: `Перевод на ${data.view.title}`,
            body: `Сумма перевода: ${data.total.amount} ${currencyTypes[data.total.currency.toString()]}${commission}` + 
            `\nПолучатель: ${data.view.account}${comment}` + 
            `\nДата: ${data.date.split('+')[0].replace('T', ' в ')}`,
            icon: "./img/icon.png"
        });
    }
    notify.show();
}

function createMainWindow(){
    main = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntergration: true
        }
    });

    main.loadFile('index.html');
    main.show();

    setInterval(getPayments, 3000);
}

app.whenReady().then(createMainWindow);