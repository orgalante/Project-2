
"use strict";

$(() => {
    $("#pills-Live-Report-tab").on('click', () => {
        startLiveReport();
    });
    $("#pills-home-tab").on('click', () => {
        clearInterval(intervalId);
    });
});

function startLiveReport() {
    $("#chartContainer").html(""); // init
    $("#chartMsgContainer").hide();

    if (selectedCoins.length == 0) {
        $("#chartMsgContainer").show();
        timeOutId = setTimeout(() => {
            var homeTabEl = document.querySelector('#pills-home-tab')
            var homeTab = new bootstrap.Tab(homeTabEl);
            homeTab.show();
        }, 10000);
    }
    else getSelectedCoinsApi();
}

var dataPointsArr = [];

var options = {
    exportEnabled: true,
    animationEnabled: true,
    animationDuration: 2000,
    title: {
        text: "dynamic Header here**************"
    },
    subtitles: [{
        text: "Click Legend to Hide or Unhide a Coin"
    }],
    axisX: {
        title: "Time",
        titleFontColor: "#1A96B8",
        lineColor: "#1A96B8",
        labelFontColor: "red",
        tickColor: "#1A96B8",
        labelFormatter: function (e) {
            return CanvasJS.formatDate(e.value, "hh:mm:ss");
        },
        labelAngle: -20,

    },
    axisY: {
        title: "Coin Value",
        titleFontColor: "#4F81BC",
        lineColor: "#4F81BC",
        labelFontColor: "#4F81BC",
        tickColor: "#4F81BC",
        labelFormatter: function (e) {
            return "$" + CanvasJS.formatNumber(e.value, "#,##0.#");
        }
    },
    toolTip: {
        shared: true
    },
    legend: {
        cursor: "pointer",
        verticalAlign: "top",
        fontSize: 22,
        fontColor: "dimGrey",
        itemclick: toggleDataSeries
    },
    data: dataPointsArr
};

function toggleDataSeries(e) {
    if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible)
        e.dataSeries.visible = false;
    else
        e.dataSeries.visible = true;

    e.chart.render();
}

function drawChart() {
    // var chart = new CanvasJS.Chart("chartContainer", options);
    chart.render();
}

var updateInterval = 2000; // every 2 seconds
var coinsStr = "";
var chart;

var time = new Date();
var intervalId = 0;
var timeOutId = 0;

async function getSelectedCoinsApi() {

    coinsStr = "";
    dataPointsArr = []; // init
    for (const selectedCoin in selectedCoins) {
        let symbolStr = selectedCoins[selectedCoin]["symbol"];
        coinsStr += symbolStr + ",";

        // initDataPointsArr
        let cell = {
            type: "spline",
            xValueType: "dateTime",
            xValueFormatString: "HH:mm:ss",
            name: symbolStr,
            showInLegend: true,
            yValueFormatString: "$#,##0.#",
            dataPoints: []
        }
        dataPointsArr.push(cell);
    }
    options["data"] = dataPointsArr;
    coinsStr = coinsStr.slice(0, -1);
    let testStr = coinsStr.replace(",",", ");
    options["title"]["text"] = coinsStr.replace(",",", ").toUpperCase() + " To USD";
    chart = new CanvasJS.Chart("chartContainer", options);

    //console.log("dataPointsArr", dataPointsArr);
    //console.log("coinsStr", coinsStr);

    refreshData();
    intervalId = setInterval(refreshData, 2000);
}



async function refreshData() {
    const coins = await newCoinsCall(coinsStr);
    updateChart(coins);
}

async function newCoinsCall(coinsStr) {
    let selectedCoinsUrl = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coinsStr}&tsyms=USD`;
    const coins = await getJson(selectedCoinsUrl);
    return coins;

}

async function getJson(url) {
    const response = await fetch(url);
    const json = await response.json();
    return json;
}

function updateChart(coins) {
    console.log(coins);
    for (const coin in coins) {
        console.log("coin", coin, coins[coin]);
        const indx = dataPointsArr.findIndex((cell) => {
            const str = cell["name"];
            return str.toUpperCase() == coin.toUpperCase()
        });
        const usdVal = coins[coin]["USD"];
        const dataPoint = { x: (new Date()).getTime(), y: usdVal };
        // pushing the new values
        dataPointsArr[indx]["dataPoints"].push(dataPoint);
        console.log(dataPointsArr[indx]["dataPoints"]);

    }
    drawChart();

}


