var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//import CoinObj from "build/coin.js";
// <reference path="jquery-3.7.0.js" />
// some class exr. JQUERY ~~~~~~~~~~
console.log();
$(() => {
    $("button").click(() => {
        // $(".testing").hide(1000).show(1000);
        // $(".testing").animate({fontSize: "50px"},3000);
        // read/write content
        $(".testing:first-of-type").text('hello');
        const content = $(".testing:first-of-type").text();
        // change css
        $(".testing:first-of-type").css("background-color", "pink");
        $(".testing:first-of-type").css({ backgroundColor: "pink" });
        // get css
        const color = $(".testing:first-of-type").css("background-color");
        $(".testing").append(`<input type ="text"/>`);
    });
});
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~
let coinsInfo = [];
let coinsArr = [];
var selectedCoins = [];
const currenciesUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1";
// const currenciesUrl_TEST = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1";
initHomeContent();
function initHomeContent() {
    coinsArr = [];
    coinsInfo = [];
    selectedCoins = [];
    getAndDisplayAllCoins();
}
class CoinsData {
}
function getAndDisplayAllCoins() {
    return __awaiter(this, void 0, void 0, function* () {
        let coinsData;
        // check if user has coin data in storage
        coinsData = JSON.parse(localStorage.getItem("coinsDataAll"));
        // check if more than 1 minute gone from last time or no localStorage:
        if (coinsData === null || coinsData === undefined ||
            Math.floor(new Date().getTime() / 1000) - Math.floor((new Date(coinsData.updatedTo)).getTime() / 1000) > 60) {
            // WE NEED NEW CALL
            const coins = yield getJson(currenciesUrl);
            let coinsData = new CoinsData();
            coinsData.coinsData = coins;
            coinsData.updatedTo = new Date();
            let str = JSON.stringify(coinsData);
            localStorage.setItem("coinsDataAll", str);
            coinsData = JSON.parse(localStorage.getItem("coinsDataAll"));
        }
        saveCoinsToArr(coinsData.coinsData);
        displayCoins("");
    });
}
// jQuery functions -  npm i --save-dev @types/jquery 
$(() => {
    $("#searchInput").on('keyup', (e) => {
        const filter = $("#searchInput").val().toString().toLowerCase();
        displayCoins(filter);
    });
    $("#pills-about-tab").on('click', () => {
        if (this.timeOutId !== 0) {
            clearTimeout(this.timeOutId);
            this.timeOutId = 0;
        }
    });
});
function saveCoinsToArr(coins) {
    for (const coin of coins) {
        const cObj = new CoinObj(coin.id, coin.image, coin.symbol);
        coinsArr.push(cObj);
    }
}
function displayCoins(filter = "") {
    console.log("displayCoins");
    const filtered = coinsArr.filter((c) => {
        return ((c.cId).indexOf(filter) !== -1 || (c.symbol).indexOf(filter) !== -1);
    });
    const container = document.getElementById("allCoinsDiv");
    container.innerHTML = "";
    if (filtered.length === 0) {
        container.innerHTML =
            `
        <div class=" bg-transparent justify-content-center " >
        <br><br>
            <p class="text-center fs-2 ">
                Oops, No Coins by that search were found...</p>
        </div>
        `;
    }
    for (const coin of filtered) {
        container.appendChild(parseHTML(coin.getCoinCardHtml()));
        // ---Collapse Event---
        let coinCollapseBtn = document.getElementById(`${coin.cId}CollapseBtn`);
        coinCollapseBtn.addEventListener("click", function () {
            if (coinCollapseBtn.getAttribute("aria-expanded") === "true")
                getAndBindCoinInfo(coin.cId);
        });
        // ---Switch Event---
        let coinSwitchInput = document.getElementById(`${coin.cId}SwitchInput`);
        coinSwitchInput.addEventListener('change', () => {
            // check if arr is less then 6, if not -> modal
            if (coinSwitchInput.checked)
                addCoinToSelected(coin);
            else
                removeCoinFromSelected(coin); // remove from arr
        });
    }
}
function getJson(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(url);
        const json = yield response.json();
        return json;
    });
}
function getAndBindCoinInfo(coinId) {
    return __awaiter(this, void 0, void 0, function* () {
        //check if info exist in storage, and if updated 
        let coinIndx = coinsInfo.findIndex(obj => obj.coinId === coinId);
        let coinItem = coinsInfo[coinIndx];
        // if need an info fetch
        if (coinItem === undefined || coinItem === null ||
            Math.floor(new Date().getTime() / 1000) - Math.floor(coinItem.date.getTime() / 1000) > 120) {
            const loaderId = coinId + "Loader";
            let loaderSpin = document.getElementById(loaderId);
            loaderSpin.style.display = "inline-block";
            //document.getElementById(loaderId).style.display = "none";
            console.log("fetch", coinId, new Date());
            const url = "https://api.coingecko.com/api/v3/coins/" + coinId;
            const coinInfo = yield getJson(url);
            if (coinItem !== undefined && coinItem !== null) {
                // console.log(Math.floor(new Date().getTime() / 1000) - Math.floor(coinItem.date.getTime() / 1000))
                coinsInfo.splice(coinIndx, 1);
            }
            const coinInfoObj = {
                coinId: coinInfo.id,
                price: {
                    usd: getPrice(coinInfo.market_data.current_price.usd, 'USD'),
                    eur: getPrice(coinInfo.market_data.current_price.eur, 'EUR'),
                    ils: getPrice(coinInfo.market_data.current_price.ils, 'ILS')
                },
                date: new Date()
            };
            coinsInfo.push(coinInfoObj);
            bindCoinInfo(coinId);
            loaderSpin.style.display = "none";
        }
        else {
            bindCoinInfo(coinId);
        }
    });
}
function bindCoinInfo(coinId) {
    const collapseId = `${coinId}Collapse`;
    const collapse = document.getElementById(collapseId);
    let coinItem = coinsInfo.find(obj => obj.coinId === coinId);
    const html = `
        <br> 
        <p class="card-text">USD: ${coinItem.price.usd}</p>
        <p class="card-text">EUR: ${coinItem.price.eur}</p>
        <p class="card-text">ILS: ${coinItem.price.ils}</p>
        `;
    collapse.innerHTML = html;
}
function getPrice(str, curr) {
    let formatOpt = { style: 'currency', currency: curr, minimumFractionDigits: 0 };
    return str.toLocaleString(str, formatOpt);
}
function addCoinToSelected(coin) {
    console.log(selectedCoins);
    if (selectedCoins.length === 5) {
        // remove selection from 6st coin
        let coinSwitchInput = document.getElementById(`${coin.cId}SwitchInput`);
        coinSwitchInput.checked = false;
        //call modal
        showModal();
        displaySelectedCoinsInModal(coin);
    }
    else {
        selectedCoins.push(coin);
    }
}
function removeCoinFromSelected(coin) {
    const indx = selectedCoins.indexOf(coin);
    selectedCoins.splice(indx, 1);
}
// getbootstrap.com/docs/5.2/components/modal/ via javascript
function showModal() {
    // npm install --save @types/bootstrap - used!
    const myModal = new bootstrap.Modal('#selectedCoinsModal', { keyboard: false });
    myModal.show();
}
function parseHTML(html) {
    var t = document.createElement('template');
    t.innerHTML = html;
    return t.content;
}
function displaySelectedCoinsInModal(coinToAdd) {
    const container = document.getElementById("selectedCoinsContainer");
    container.innerHTML = "";
    for (const coin of selectedCoins) {
        container.appendChild(parseHTML(coin.getModalCoinHtml()));
        let coinSwitchInput = document.getElementById(`${coin.cId}SwitchInputRemove`);
        coinSwitchInput.addEventListener('change', (e) => {
            if (!coinSwitchInput.checked) {
                // remove from arr +  switch - off
                let coinToRemoveSwitchInput = $(`#${coin.cId}SwitchInput`).get();
                coinToRemoveSwitchInput[0].checked = false;
                removeCoinFromSelected(coin);
                // add to arr + switch - on
                let coinToAddSwitchInput = $(`#${coinToAdd.cId}SwitchInput`).get();
                coinToAddSwitchInput[0].checked = true;
                addCoinToSelected(coinToAdd);
            }
        });
    }
}
