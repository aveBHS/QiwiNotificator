var modal = document.getElementById("my_modal");
var btn = document.getElementById("btn_modal_window");
var close = document.getElementsByClassName("close_modal_window")[0];

btn.onclick = function () {
   modal.style.display = "block";
}

close.onclick = function () {
   modal.style.display = "none";
}

window.onclick = function (event) {
   if (event.target == modal) {
       //modal.style.display = "none";
   }
}

var hideElements = [
    document.getElementById('header'),
    document.getElementById('getpaymentsbtn')
];
document.addEventListener("DOMContentLoaded", () => 
{ 
    loadPayments(paymentBox, renderPayment, loadBox, hideElements); 
});