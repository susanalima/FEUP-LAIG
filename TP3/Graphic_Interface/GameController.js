
/**
 * Class TheGame represents a board
 */
class GameController extends CGFobject {


    /**
 	 * Constructs an object of class TheGame
	 * @param {Object} scene Scene in which the game is represented
     * @param {Object} boardTexture 
     * @param {Object} cellTexture 
     * @param {Object} pieceTexture1
     * @param {Object} pieceTexture2
     */
    constructor(scene, boardTexture, cellTexture, pieceTexture1, pieceTexture2) {
        super(scene);
        this.model = new GameModel(scene);
        this.view = new GameView(scene, boardTexture, cellTexture, pieceTexture1, pieceTexture2);
        this.selectedPiece = null;
        this.state = 'START';
        this.currentPlayerBot = null;
        //this.alreadyWaiting = false;
        this.client = new Client(this.model);
        this.lastResponse = [];
    };


    showValidCells() {
        this.client.requestValidPlays(this.selectedPiece.color);
        this.makePickingValidCells(this.client.response);
        
    }

    undoLastPlay() {
        this.requestSwitchPlayer();
        //animacao

        let play = this.model.undoLastPlay();
        // this.view.undoPlay(play[0][0], play[0][1], play[1][1]);
    }


    checkSelected() {
        let counter = 0;
        counter = this.setSelected(this.view.thanosPieces, counter);
        counter = this.setSelected(this.view.gamoraPieces, counter);
        if (this.selectedPiece != null)
            //console.log("Selected:" + counter);
            if (counter == 1)
                return "OK"; //One piece selected
            else if (counter == 0) {
                this.selectedPiece.swapText();
                this.selectedPiece = null;
                return "NOTOK"; // No pieces selected
            }
    }

    setSelected(pieces, counter) {
        for (let i = 0; i < pieces.length; i++) {
            if (pieces[i].selected) {
                counter++;
                if (pieces[i] != this.selectedPiece) {
                    if (this.selectedPiece != null) {
                        this.selectedPiece.selected = false;
                        this.selectedPiece.swapText();
                    }
                    this.selectedPiece = pieces[i];
                    if (!this.selectedPiece.locked)
                        this.selectedPiece.swapText();
                }
            }
        }

        return counter;
    }

    makePickingCells() {
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 1, 0, 0);
        for (let i = 0; i < this.view.board.cells.length; i++) {
            this.scene.registerForPick(++this.scene.pickIndex, this.view.board.cells[i]);
            this.view.board.cells[i].display();
        }
        this.scene.popMatrix();
    }

    makePickingValidCells(validCells) {
        let index = 0;
        for (let i = 0; i < this.view.board.cells.length; i++) {
            if (validCells[index][0] == this.view.board.cells[i].line && validCells[index][1] == this.view.board.cells[i].column) {
                index++;
                this.view.board.cells[i].valid = true;
                this.scene.registerForPick(++this.scene.pickIndex, this.view.board.cells[i]);
            }
        }
    }


    makePickingPiecesSide(pieces) {
        for (let i = 0; i < pieces.length; i++) {
            this.scene.registerForPick(++this.scene.pickIndex, pieces[i]);
            pieces[i].display(this.view.board.selectedCell, this.scene.currTime);

        }
    }

    makePickingPieces() {
        this.makePickingPiecesSide(this.view.gamoraPieces);
        this.makePickingPiecesSide(this.view.thanosPieces);
    }



    displayPieces(pieces, currTime) {
        for (let i = 0; i < pieces.length; i++) {
            if (pieces[i].selected && this.view.board.selectedCell != null && pieces[i].parabolic == null)
                pieces[i].createParabolicAnimation([pieces[i].x, pieces[i].y], 10, [this.view.board.selectedCell.x, this.view.board.selectedCell.z]);
            pieces[i].display(this.view.board.selectedCell, currTime);
        }
    }

    play() {
        if (this.selectedPiece != null && this.view.board.selectedCell != null && /*!this.alreadyWaiting &&*/ this.selectedPiece.hasRequestedPlay == 0) {
            console.log('here')
            this.client.requestPlay([this.view.board.selectedCell.column, this.view.board.selectedCell.line, this.selectedPiece.color])
            //this.alreadyWaiting = true;
            this.selectedPiece.hasRequestedPlay++;
        }
    }


    wait_CurrentPlayerBot_response() {
        if (this.lastResponse[0] != this.client.response[0]) {
            this.lastResponse = this.client.response;
            console.log(this.lastResponse);
            this.parseResponse(this.lastResponse[1]);
            this.state = 'REQUEST_VALID_CELLS';
        }
    }

    request_validCells() {
        if (this.currentPlayerBot == 0) {
            if (this.selectedPiece != null) {
                this.client.requestValidPlays(this.selectedPiece.color); //handle faz a animaçao das cores
                this.state = 'WAIT_VP_RESPONSE';
            }
        }
        else {
            this.state = 'REQUEST_PLAY_B';
        }
    }

    wait_validCells_response() {
        if (this.lastResponse[0] != this.client.response[0]) {
            this.lastResponse = this.client.response;
            console.log(this.lastResponse);
            this.parseResponse(this.lastResponse[1]);
            this.state = 'SELECT_CELL';
        }
    }

    selectCell() {
        if (this.view.getCurrentSelectedPiece() != this.selectedPiece) {
            this.state = 'PROCESS_PIECE';
            this.showValidCells();
        }
        else {
            if (this.view.board.selectedCell != null) {
                this.state = 'REQUEST_PLAY_P';
            }
        }
    }

    wait_HumanPlay_response() {
        if (this.lastResponse[0] != this.client.response[0]) {
            this.lastResponse = this.client.response;
            console.log(this.lastResponse);
            this.parseResponse(this.lastResponse[1]);
            this.check_GameOver();
        }
    }

    wait_BotPlay_response() {
        if (this.lastResponse[0] != this.client.response[0]) {
            this.lastResponse = this.client.response;
            console.log(this.lastResponse);
            this.parseResponse(this.lastResponse[1]);
            this.state = 'CHANGE_PLAYER';
            this.check_GameOver();

        }
    }

    check_GameOver() {
        if (this.model.winner == 0)
            this.state = 'WAIT_UNDO';
        else
            this.state = 'GAME_OVER';
    }

    start()
    {
        switch(this.model.mode) {
            case 1:
            this.client.requestPvP();
            break;
            case 2:
            this.client.requestPvC();
            break;
            case 3: 
            this.client.requestCvC();
            break;
        }
    }


    stateMachine() {
        switch (this.state) {
            case 'START':
                //buscar configuraçoes da cena e mandar request consoante as configuraçoes
                //this.model.updateConfigs();
                this.state = 'PROCESS_PIECE';
                break;
            case 'PROCESS_PIECE':
                //ve se o jogado e bot ou nao
                this.client.requestCurrentPlayerBot();
                this.state = 'WAIT_CPB_RESPONSE';
                //se humano
                //so as peças podem ser selecionadas, fica aqui ate se selecionada uma e faz request dos valid cells
                //se peça selecionada passa proxima, se nao fica aqui
                //se bot vai para REQUESTBOT
                break;
            case 'WAIT_CPB_RESPONSE':
                this.wait_CurrentPlayerBot_response();
                break;
            case 'REQUEST_VALID_CELLS':
                this.request_validCells();
                break;
            case 'WAIT_VP_RESPONSE':
                this.wait_validCells_response();
                break;
            case 'SELECT_CELL':
                this.selectCell();
                //as casas sao selecionaveis e as peças tb
                //se selecionar uma peça volta para o process piece
                //se selecionar uma casa vai para o request play
                //faz show das peças válidas selecionaveis
                break;
            case 'REQUEST_PLAY_P':
                this.client.requestPlay([this.view.board.selectedCell.column, this.view.board.selectedCell.line, this.selectedPiece.color])
                this.selectedPiece.hasRequestedPlay++;
                this.state = 'WAIT_PP_RESPONSE';
                break;
            case 'REQUEST_PLAY_B':
                this.client.requestBotPlay(this.model.level);//animaçao feita no handler
                this.state = 'WAIT_PB_RESPONSE';
                break;
            case 'WAIT_PP_RESPONSE':
                this.wait_HumanPlay_response();
                break;
            case 'WAIT_PB_RESPONSE':
                this.wait_BotPlay_response();
                break;
            case 'WAIT_UNDO':
                //wait 2s
                // se undo flag faz undo volta para o process piece
                //se nao vai para o proximo
                this.state = 'CHANGE_PLAYER';
                break;
            case 'CHANGE_PLAYER':
                //animaçao de camara e afins
                //PROCESS PIECE
                this.state = 'PROCESS_PIECE';
                break;
            case 'GAME_OVER':
                //nao pode jogar mais
                //espera pelo botao de start ou assim
                //pode ser substituido pelo start se tiver uma funcao de restart
                break;
        }
    }

    updateClientResponse() {
        if (this.lastResponse[0] != this.client.response[0]) {
            this.lastResponse = this.client.response;
            console.log(this.lastResponse);
            this.parseResponse(this.lastResponse[1]);
        }
    }

    /*
    TODO fazer os que faltam...nao sei ate que ponto sao relevantes...will see
    */
    parseResponse(response) {
        let responsearr = response.split(',');
        let code = parseFloat(responsearr[0].split('[')[1]);
        let reply;
        switch (code) {
            case 0:
                break;
            case 1:
                let validPlays = response.split('[')[2] + '[';
                this.model.getValidPlays(validPlays);
                //animaçao das valid plays TODO
                this.makePickingValidCells(this.model.parsePlayReply(response));
                break;
            case 2:
                this.model.parsePlayReply(response);
                this.selectedPiece.createParabolicAnimation([this.selectedPiece.x, this.selectedPiece.y], 10, [this.view.board.selectedCell.x, this.view.board.selectedCell.z]);
                break;
            case 3:
                break;
            case 4:
                break;
            case 5:
                break;
            case 6:
                break;
            case 7:
                reply = this.model.parsePlayReply(response);
                let piece = this.view.selectRandomPieceColor(reply[2]);
                let cell = this.view.selectCell(parseFloat(reply[0]), parseFloat(reply[1]));
                piece.createParabolicAnimation([piece.x, piece.y], 10, [cell.x, cell.z]);
                piece.hasRequestedPlay++;
                break;
            case 8:
                this.currentPlayerBot = parseFloat(responsearr[1].split(']')[0]);
                break;
        }
    }




    display() {
        //this.updateClientResponse();
        //this.view.board.checkSelectedCells();
        this.view.board.checkSelectedCells(this.selectedPiece);

        //this.play();
        this.stateMachine();
        //console.log(this.state);
        /*if (this.selectedPiece != null && this.selectedPiece.parabolic != null)
            this.alreadyWaiting = false;*/

        let ignore = true;
        if (this.checkSelected() == "OK")
            ignore = false;

        let currTime = this.scene.currTime;
        this.scene.pushMatrix();
        this.makePickingCells();

        this.view.board.display();
        this.makePickingPieces();


        //this.displayPieces(this.view.gamoraPieces, currTime);
        //this.displayPieces(this.view.thanosPieces, currTime);


        /*this.scene.registerForPick(++this.scene.pickIndex, this.view.assertPlayer);
        this.view.assertPlayer.display();
        if (122 == this.scene.pickedIndex)
            //this.client.requestValidPlays('whitePiece');
            this.client.requestPvC();  
            //this.client.requestQuit();
        this.scene.registerForPick(++this.scene.pickIndex, this.view.assertPlayer);
        this.view.playBot.display();
        if (123 == this.scene.pickedIndex)
            this.client.requestBotPlay(2);*/

        this.scene.clearPickRegistration();
        this.scene.popMatrix();

    }
};







    /*getPrologRequest(requestString, onSuccess, onError, port) {
        var requestPort = port || 8081
        var request = new XMLHttpRequest();
        request.open('GET', 'http://localhost:' + requestPort + '/' + requestString, true);
        request.onload = onSuccess || function (data) { console.log("Request successful. Reply: " + data.target.response); };
        request.onerror = onError || function () { console.log("Error waiting for response"); };
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.send();
    }

    requestCurrentPlayerBot() {
        let cp = ['[08]'];
        let handler = this.handleCurrentPlayerRequestBot.bind(this);
        this.getPrologRequest(cp, handler);
    }
    requestQuit() {
        var quit = ['[00]'];
        let func = this.handleQuitReply.bind(this);
        this.getPrologRequest(quit, func);
    }

    requestValidPlays(color) {
        let board = this.model.getBoardState();
        var getValidPlays = ['[01', board, color + ']'];
        let handler = this.handleValidPlaysReply.bind(this);
        this.getPrologRequest(getValidPlays, handler);
    }

    requestPlay(play) {
        let board = this.model.getBoardState();
        var move = ['[02', board, '[' + play + ']' + ']']; // '[0,0,whitePiece]'
        let handler = this.handlePlayReply.bind(this);

        this.getPrologRequest(move,handler);
    }

    requestBotPlay(level) {
        let board = this.model.getBoardState();
        var botplay = ['[07', board, level + ']'];
        this.getPrologRequest(botplay, this.handlePlayReply);
    }

    requestSwitchPlayer() {
        var switchPlayer = ['[03]'];
        this.getPrologRequest(switchPlayer, this.handleSwitchPlayerReply);
    }

    requestPvP() {
        var pvp = ['[04]'];
        this.getPrologRequest(pvp, this.handlePRequest);
    }

    requestPvC() {
        var pvc = ['[05]'];
        this.getPrologRequest(pvc, this.handlePRequest);
    }

    requestCvC() {
        var cvc = ['[06]'];
        this.getPrologRequest(cvc, this.handlePRequest);
    }

    handleQuitReply(data) {
        console.log(data.target.response);
        console.log(this);
    }

    handleValidPlaysReply(data) {
        //console.log(data.target.response);
        //animation
        console.log(this.model.parseValidPlays(data.target.response));
        makePickingValidCells(this.model.parsePlayReply(data.target.response));
    }

    handlePlayReply(data) {
        console.log(data.target.response);
        if(this.selectedPiece != null)
            this.selectedPiece.createParabolicAnimation([this.selectedPiece.x, this.selectedPiece.y], 10, [this.view.board.selectedCell.x, this.view.board.selectedCell.z]);
      
        this.model.parsePlayReply(data.target.response);

    }

    handleSwitchPlayerReply(data) {
        console.log(data.target.response);
    }

    handlePRequest(data) {
        console.log(data.target.response);
    }

    handleCurrentPlayerRequestBot(data) {
        console.log(data.target.response);
        this.currentPlayerBot = parseFloat(data.target.response);
    }*/