const {app, BrowserWindow, Notification} = require("electron");
const request = require('request');

let qiwiToken = "";
let qiwiLogin = "";
let url = new URL('https://edge.qiwi.com/payment-history/v2/persons/' + qiwiLogin + '/payments');
const currencyTypes = {
    '643': 'RUB'
};

function getPayments() {
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
                let data = JSON.parse(response.body).data[0];
                let notify = null;
                if(data.type == 'IN'){
                    notify = new Notification({
                        title: "Пополнение Qiwi кошелька",
                        body: `Приход: ${data.sum.amount} ${currencyTypes[data.sum.currency.toString()]}`,
                        icon: "./img/icon.png"
                    });
                }
                else{
                    notify = new Notification({
                        title: `Перевод на ${data.provider.shortName}`,
                        body: `Сумма перевода: ${data.total.amount} ${currencyTypes[data.total.currency.toString()]}`,
                        icon: "./img/icon.png"
                    });

                }
                notify.show()
            }
        }
    );
}

function createMainWindow(){
    let main = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntergration: true
        }
    });

    main.loadFile('index.html');
    main.show();
    getPayments();
}

app.whenReady().then(createMainWindow);