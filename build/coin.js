class CoinObj {
    constructor(cId, img, symbol) {
        this.cId = cId;
        this.img = img;
        this.symbol = symbol;
    }
    getCoinCardHtml() {
        let html = `
    <div class="col-6 col-sm-6 col-md-3 col-lg-2 p-2 ">
        <div class="card text-center rounded-3 " >
            <img src="${this.img}" height="70px" class="card-img-top w-auto mt-3 mx-auto d-block" alt="${this.cId}">
           <div class="card-body p-1 ">
                <h5 class="card-title">${this.symbol}</h5>
                <div class = "justify-content-center coin-id-p">
                <p class=" card-text mb-1 text-center" > ${this.cId}</p>
                </div>
                <div class="form-check form-switch ">
                    <input class="form-check-input float-none w-75" type="checkbox" 
                    id="${this.cId}SwitchInput">
                </div>
                <button class="btn btn-dark mt-2 rounded-circle border-white" type="button" data-bs-toggle="collapse"
                id="${this.cId}CollapseBtn" data-bs-target="#${this.cId}Collapse" aria-expanded="false" aria-controls="${this.cId}Collapse">
                   <span> More<br>Info 
                   <div id="${this.cId}Loader" class="spin-loader"></div>
                   </span>
                </button>
                <div class="collapse" id="${this.cId}Collapse">
                </div>
            </div>
        </div>
    </div>
    `;
        return html;
    }
    getModalCoinHtml() {
        let html = `
        <div class=" col-6 col-xs-6 col-sm-6 col-md-6 col-lg-4 ">
            <div class="card text-center rounded-3">
                <img src="${this.img}"  height="70px" class="card-img-top w-auto mt-3 mx-auto d-block" alt="${this.cId}">
                <div class="card-body p-1">
                    <h5 class="card-title">${this.symbol}</h5>
                    <p class="card-text">${this.cId}</p>
                    <div class="form-check form-switch ">
                        <input class="form-check-input float-none" type="checkbox" 
                        id="${this.cId}SwitchInputRemove" data-bs-dismiss="modal" checked="true">
                    </div>
                </div>
            </div>
        </div>
        `;
        return html;
    }
}
//export default CoinObj // share this object with other scripts
