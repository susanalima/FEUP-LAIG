var model;
var view;
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
        model = new GameModel();
        view = new GameView(scene, boardTexture, cellTexture, pieceTexture1, pieceTexture2);
        this.selectedPiece = null;
        this.state = 'START';
        this.currentPlayerBot = null;
    };


    getPrologRequest(requestString, onSuccess, onError, port) {
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
        let board = model.getBoardState();
        var getValidPlays = ['[01', board, color + ']'];
        let handler = this.handleValidPlaysReply.bind(this);
        this.getPrologRequest(getValidPlays, handler);
    }

    requestPlay(play) {
        let board = model.getBoardState();
        var move = ['[02', board, '[' + play + ']' + ']']; // '[0,0,whitePiece]'
        this.getPrologRequest(move, this.handlePlayReply);
    }

    requestBotPlay(level) {
        let board = model.getBoardState();
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
        console.log(model.parseValidPlays(data.target.response));
        makePickingValidCells(model.parsePlayReply(data.target.response));
    }

    handlePlayReply(data) {
        console.log(data.target.response);
        this.validPlay = true; //animation
        //Is this ok? NO should animation function be always called here? SIM
        //should only the first call to the animation be called here? what?
        //which prolog file should be consulted game/main/? server
        //sicstus implementation for testing
        //Meeting sugested... no :(
        //animation

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
    }

    showValidCells() {
        this.requestValidPlays();
    }

    undoLastPlay() {
        this.requestSwitchPlayer();
        //animacao
        let play = model.undoLastPlay();
        // view.undoPlay(play[0][0], play[0][1], play[1][1]);
    }


    checkSelected() {
        let counter = 0;
        counter = this.setSelected(view.thanosPieces, counter);
        counter = this.setSelected(view.gamoraPieces, counter);
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
        this.scene.rotate(Math.PI, 1,0,0);
        for (let i = 0; i < view.board.cells.length; i++) {
            this.scene.registerForPick(++this.scene.pickIndex, view.board.cells[i]);
            view.board.cells[i].display();
        }
        this.scene.popMatrix();
    }

    makePickingValidCells(validCells) {
        let index = 0;
        for (let i = 0; i < this.board.cells.length; i++) {
            if (validCells[index][0] == this.board.cells[i].line && validCells[index][1] == this.board.cells[i].column) {
                index++;
                this.board.cells[i].valid = true;
                this.scene.registerForPick(++this.scene.pickIndex, this.board.cells[i]);
            }
        }
    }


    makePickingPiecesSide(pieces) {
        for (let i = 0; i < pieces.length; i++){
            this.scene.registerForPick(++this.scene.pickIndex, pieces[i]);
            if (pieces[i].selected && view.board.selectedCell != null && pieces[i].parabolic == null)
                pieces[i].createParabolicAnimation([pieces[i].x, pieces[i].y], 10, [view.board.selectedCell.x, view.board.selectedCell.z]);
            pieces[i].display(view.board.selectedCell, this.scene.currTime);
        }
    }

    makePickingPieces() {
        this.makePickingPiecesSide(view.gamoraPieces);
        this.makePickingPiecesSide(view.thanosPieces);
        
    }



    displayPieces(pieces, currTime) {
        for (let i = 0; i < pieces.length; i++) {
            if (pieces[i].selected && view.board.selectedCell != null && pieces[i].parabolic == null)
                pieces[i].createParabolicAnimation([pieces[i].x, pieces[i].y], 10, [view.board.selectedCell.x, view.board.selectedCell.z]);
            pieces[i].display(view.board.selectedCell, currTime);
        }
    }

    play() {
        if (this.selectedPiece != null && view.board.selectedCell != null)
            this.requestPlay([view.board.selectedCell.column, view.board.selectedCell.line, this.selectedPiece.color])
    }

    getCurrentSelectedPiece(){
        for(let i = 0; this.thanosPieces.length; i++)
        {
            if(this.thanosPieces[i].selected)
                return this.thanosPieces[i];
            if(this.gamoraPieces[i].selected)
                return this.gamoraPieces[i];
        }
    }

    stateMachine(){
        switch(this.state)
        {
            case 'START':
                //buscar configuraçoes da cena e mandar request consoante as configuraçoes
                model.updateConfigs();
                this.state = 'PROCESS_PIECE';
                break;
            case 'PROCESS_PIECE':
            //ve se o jogado e bot ou nao
            this.requestCurrentPlayerBot();
            if(this.currentPlayerBot == 0)
            {
               if(this.selectedPiece != null)
               {
                   this.requestValidPlays(this.selectedPiece.color); //handle faz a animaçao das cores
                   this.state = 'SELECT_CELL';
                   break;
               }
                
            }
            else
            {
                this.state = 'REQUEST_PLAY_B';
                break;
            }
            //se humano
            //so as peças podem ser selecionadas, fica aqui ate se selecionada uma e faz request dos valid cells
            //se peça selecionada passa proxima, se nao fica aqui
            //se bot vai para REQUESTBOT
            break;
            case 'SELECT_CELL':
            if(this.getCurrentSelectedPiece() != this.selectedPiece)
            {
                this.state = 'PROCESS_PIECE';
                break;
            }
            else
            {
                if(this.view.board.selectedCell != null)
                {
                    this.state = 'REQUEST_PLAY_P';
                    break;
                }
            }
            //as casas sao selecionaveis e as peças tb
            //se selecionar uma peça volta para o process piece
            //se selecionar uma casa vai para o request play
            //faz show das peças válidas selecionaveis
            break;
            case 'REQUEST_PLAY_P' :
            this.requestPlay([view.board.selectedCell.column, view.board.selectedCell.line, this.selectedPiece.color])
            //faz request do play e valida
            //caso seja valido faz a animaçao e vai para o proximos
            //caso seja invalida volta para o process piece i guess
            // win condition se ganhou estado END GAME
            break;
            case 'REQUEST_PLAY_B' :
            this.requestBotPlay(this.mode.level);//animaçao feita no handler
            //faz request do play DO BOT 
            // faz a animaçao e vai para o proximos
            // win condition se ganhou estado END GAME
            //CHANGE PLAYER BITCHESSSSS
            this.state = 'CHANGE_PLAYER';
            break;
            case 'WAIT_UNDO':
            //wait 2s
            // se undo flag faz undo volta para o process piece
            //se nao vai para o proximo
            break;
            case 'CHANGE_PLAYER' :
            //animaçao de camara e afins
            //PROCESS PIECE
            this.state = 'PROCESS_PIECE';
            break;        
        }
    }


    display() {
        this.play();
        let ignore = true;
        if (this.checkSelected() == "OK")
            ignore = false;

        let currTime = this.scene.currTime;
        this.scene.pushMatrix();
        this.makePickingCells();
        view.board.display(ignore);
        this.makePickingPieces();

        //this.displayPieces(view.gamoraPieces, currTime);
        //this.displayPieces(view.thanosPieces, currTime);

        this.scene.registerForPick(++this.scene.pickIndex, view.assertPlayer);
        view.assertPlayer.display();
        if (61 == this.scene.pickedIndex)
            this.requestCurrentPlayerBot();  
        this.scene.registerForPick(++this.scene.pickIndex, view.assertPlayer);
        view.playBot.display();
        if (62 == this.scene.pickedIndex)
            this.requestValidPlays('blackPiece');

        this.scene.clearPickRegistration();
        this.scene.popMatrix();
    }
};



