
/**
 * Class Client class responsible for the connection with the prolog server
 */
class Client {
    /**
     * Constructs an object of class GameController
     * @param {Object} model Game's model component
     */
    constructor(model)
    {       
        this.model = model;
        this.initialize_values();
    }

    /**
     * Initializes some of this Client values
     * response represents the server's last response
     * requestId value of the requests ids
     */
    initialize_values() {
        this.response = [];
        this.requestId = 0;
    }
    
    /**
     * Restarts this Client's and its components
     */
    restart(){
        this.initialize_values();
    }

    /**
     * Given function to establish the connection with the prolog server
     */
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

    /**
     * Request th current player bot value
     */
    requestCurrentPlayerBot(){
        let cp = ['[08]'];
        let handler = this.handleRequest.bind(this);
        this.requestId++;
        this.getPrologRequest(cp,handler);
    }

    /**
     * Request the quit of the prolog server
     */
    requestQuit(){
        var quit = ['[00]'];
        let handler = this.handleRequest.bind(this);
        this.requestId++;
        this.getPrologRequest(quit, handler);
    }

    /**
     * Requests the valid plays for the given color
     * @param {Object} color color of the piece whose valid plays will be requested
     */
    requestValidPlays(color) {
        let board = this.model.getBoardState();
        var getValidPlays = ['[01', board, color + ']'];
        let handler = this.handleRequest.bind(this);
        this.requestId++;
        this.getPrologRequest(getValidPlays, handler);
    }

    /**
     * Requests a play
     * @param {Object} play array in the format [column,line,color] representing a play
     */
    requestPlay(play) {
        console.log('requestPlay');
        let board = this.model.getBoardState();
        var move = ['[02', board, '[' + play + ']' + ']']; // '[0,0,whitePiece]'
        let handler = this.handleRequest.bind(this);
        this.requestId++;
        this.getPrologRequest(move, handler);
    }

    /**
     * Requests a bot play from the given level
     * @param {Object} level difficulty of the game
     */
    requestBotPlay(level) {
        let board = this.model.getBoardState();
        var botplay = ['[07',board, level + ']'];
        let handler = this.handleRequest.bind(this);
        this.requestId++;
        this.getPrologRequest(botplay, handler);
    }

    /**
     * Requests the swap of the current player
     */
    requestSwitchPlayer() {
        var switchPlayer = ['[03]'];
        let handler = this.handleRequest.bind(this);
        this.requestId++;
        this.getPrologRequest(switchPlayer, handler);
    }

    /**
     * Request the mode of the game to be player vs player
     */
    requestPvP(){
        var pvp = ['[04]'];
        let handler = this.handleRequest.bind(this);
        this.requestId++;
        this.getPrologRequest(pvp,handler);
    }

    /**
     * Request the mode of the game to be player vs bot
     */
    requestPvC(){
        var pvc = ['[05]'];
        let handler = this.handleRequest.bind(this);
        this.requestId++;
        this.getPrologRequest(pvc, handler);
    }

    /**
     * Request the mode of the game to be bot vs bot
     */
    requestCvC(){
        var cvc = ['[06]'];
        let handler = this.handleRequest.bind(this);
        this.requestId++;
        this.getPrologRequest(cvc, handler);
    }

    /**
     * Handles the reponse received, updating this Client's response value
     * @param {Object} data prolog server's response to the request
     */
    handleRequest(data) {
        this.response = [this.requestId,data.target.response];
    }
}