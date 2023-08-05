var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const coinsDataKey = "coinsDataAll";
let coinsInfo = [];
let coinsArr = [];
var selectedCoins = [];
const currenciesUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1";
class CoinsData {
    constructor(coinsData, updatedTo) {
        this.coinsData = coinsData;
        this.updatedTo = updatedTo;
    }
}
initHomeContent();
// init home page 
function initHomeContent() {
    coinsArr = [];
    coinsInfo = [];
    selectedCoins = [];
    getAndDisplayAllCoins();
}
// get updated coins data and show it 
function getAndDisplayAllCoins() {
    return __awaiter(this, void 0, void 0, function* () {
        let coinsData;
        const container = document.getElementById("allCoinsDiv");
        container.innerHTML = "";
        try {
            // start spinner
            $("#dispLoadLoader").css({ display: "inline-block" });
            // check if user has coin data in storage
            coinsData = getCoinsDataFromLocalStorage(coinsDataKey);
            // check if more than 1 minute gone from last time or no localStorage:
            if (coinsData === null || coinsData === undefined ||
                Math.floor(new Date().getTime() / 1000) - Math.floor((new Date(coinsData.updatedTo)).getTime() / 1000) > 60) {
                // run API request to get updated coins data
                const coins = yield getJson(currenciesUrl);
                coinsData = new CoinsData(coins, new Date());
                // save data in user local storage
                let str = JSON.stringify(coinsData);
                localStorage.setItem(coinsDataKey, str);
                // reads the updated data from user local storage
                coinsData = getCoinsDataFromLocalStorage(coinsDataKey);
            }
            saveCoinsToArr(coinsData.coinsData);
            // stop spinner 
            $("#dispLoadLoader").css({ display: "none" });
            displayCoins("");
        }
        catch (e) {
            console.log("e", e);
            // in case of error, make sure to stop spinner
            $("#dispLoadLoader").css({ display: "none" });
            // remove old junk storage
            localStorage.removeItem(coinsDataKey);
            let msgErrStr = "Oops 😕, an error has occurred.<br>Please try again or come back later.";
            container.innerHTML =
                `
        <div class=" bg-transparent justify-content-center " >
        <br><br>
            <p class="text-center fs-2 ">
                ${msgErrStr}</p>
        </div>
        `;
        }
    });
}
// fetch data from storage
function getCoinsDataFromLocalStorage(dataKey) {
    const dataStr = localStorage.getItem(dataKey);
    return JSON.parse(dataStr);
}
// anonymous jQuery functions -clicks
$(() => {
    $("#searchInput").on('keyup', (e) => {
        const filter = $("#searchInput").val().toString().toLowerCase();
        selectedCoins = [];
        displayCoins(filter);
    });
    $("#pills-about-tab").on('click', () => {
        clearInterval(this.intervalId);
        if (this.timeOutId !== 0) {
            clearTimeout(this.timeOutId);
            this.timeOutId = 0;
        }
    });
    $("#logoBtn").on('click', () => {
        clearInterval(this.intervalId);
        var homeTabEl = document.querySelector('#pills-home-tab');
        var homeTab = new bootstrap.Tab(homeTabEl);
        homeTab.show();
    });
});
// coins data obj to arr
function saveCoinsToArr(coins) {
    for (const coin of coins) {
        const cObj = new CoinObj(coin.id, coin.image, coin.symbol);
        coinsArr.push(cObj);
    }
}
// create html card for each coin that was filtered
function displayCoins(filter = "") {
    const filtered = coinsArr.filter((c) => {
        return ((c.cId).indexOf(filter) !== -1 || (c.symbol).indexOf(filter) !== -1);
    });
    const container = document.getElementById("allCoinsDiv");
    container.innerHTML = "";
    // no coins result msg 
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
    // coin card events
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
// add coins extra info to card 
function getAndBindCoinInfo(coinId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //check if info exist in storage, and if it's updated 
            let coinIndx = coinsInfo.findIndex(obj => obj.coinId === coinId);
            let coinItem = coinsInfo[coinIndx];
            // if need a new info fetch
            if (coinItem === undefined || coinItem === null ||
                Math.floor(new Date().getTime() / 1000) - Math.floor(coinItem.date.getTime() / 1000) > 120) {
                // small loading spinner start
                const loaderId = coinId + "Loader";
                $(`#${loaderId}`).css({ display: "inline-block" });
                // fetch new data
                const url = "https://api.coingecko.com/api/v3/coins/" + coinId;
                const coinInfo = yield getJson(url);
                // remove old coin extra info
                if (coinItem !== undefined && coinItem !== null) {
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
                // add new coin extra info 
                coinsInfo.push(coinInfoObj);
                bindCoinInfo(coinId);
                // small loading spinner stop
                $(`#${loaderId}`).css({ display: "none" });
            }
            else {
                bindCoinInfo(coinId);
            }
        }
        catch (e) {
            console.log(e);
        }
    });
}
// add html to card with extra data 
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
// get the numeric value in a price format with currency sign
function getPrice(str, curr) {
    let formatOpt = { style: 'currency', currency: curr, minimumFractionDigits: 0 };
    return str.toLocaleString(str, formatOpt);
}
// adds a selected coin to all selected coins arr if less then 5 
function addCoinToSelected(coin) {
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
// removes a selected coins from all the selected coins arr 
function removeCoinFromSelected(coin) {
    const indx = selectedCoins.indexOf(coin);
    selectedCoins.splice(indx, 1);
}
// display a screen for user to choose which coin to remove
function showModal() {
    const myModal = new bootstrap.Modal('#selectedCoinsModal', { keyboard: false });
    myModal.show();
}
// string -> DocumentFragment to use as html element
function parseHTML(html) {
    var t = document.createElement('template');
    t.innerHTML = html;
    return t.content;
}
// add the selected coins as cards to the modal
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
