class Client {
    constructor(model)
    {       
        this.model = model;
        this.initialize_values();
    }

    initialize_values() {
        this.response = [];
        this.requestId = 0;
    }
    
    restart(){
        this.initialize_values();
    }

    getPrologRequest(requestString, onSuccess, onError, port) {
        var requestPort = port || 8081
        var request = new XMLHttpRequest();
        console.log('getPrologRequest')
        request.open('GET', 'http://localhost:' + requestPort + '/' + requestString, true);
        request.onload = onSuccess || function (data) { console.log("Request successful. Reply: " + data.target.response); };
        request.onerror = onError || function () { console.log("Error waiting for response"); };
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.send();
    }

    requestCurrentPlayerBot(){
        let cp = ['[08]'];
        let handler = this.handleRequest.bind(this);
        this.requestId++;
        this.getPrologRequest(cp,handler);
    }
    requestQuit(){
        var quit = ['[00]'];
        let handler = this.handleRequest.bind(this);
        this.requestId++;
        this.getPrologRequest(quit, handler);
    }

    requestValidPlays(color) {
        let board = this.model.getBoardState();
        var getValidPlays = ['[01', board, color + ']'];
        let handler = this.handleRequest.bind(this);
        this.requestId++;
        this.getPrologRequest(getValidPlays, handler);
    }

    requestPlay(play) {
        console.log('requestPlay');
        let board = this.model.getBoardState();
        var move = ['[02', board, '[' + play + ']' + ']']; // '[0,0,whitePiece]'
        let handler = this.handleRequest.bind(this);
        this.requestId++;
        this.getPrologRequest(move, handler);
    }

    requestBotPlay(level) {
        let board = this.model.getBoardState();
        var botplay = ['[07',board, level + ']'];
        let handler = this.handleRequest.bind(this);
        this.requestId++;
        this.getPrologRequest(botplay, handler);
    }

    requestSwitchPlayer() {
        var switchPlayer = ['[03]'];
        let handler = this.handleRequest.bind(this);
        this.requestId++;
        this.getPrologRequest(switchPlayer, handler);
    }

    requestPvP(){
        var pvp = ['[04]'];
        let handler = this.handleRequest.bind(this);
        this.requestId++;
        this.getPrologRequest(pvp,handler);
    }

    requestPvC(){
        var pvc = ['[05]'];
        let handler = this.handleRequest.bind(this);
        this.requestId++;
        this.getPrologRequest(pvc, handler);
    }

    requestCvC(){
        var cvc = ['[06]'];
        let handler = this.handleRequest.bind(this);
        this.requestId++;
        this.getPrologRequest(cvc, handler);
    }

    handleRequest(data) {
        this.response = [this.requestId,data.target.response];
    }
}