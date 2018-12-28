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
        this.validPlay = false;
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


    requestQuit(){
        var quit = ['[00]'];
        this.getPrologRequest(quit, this.handleQuitReply);
    }

    requestValidPlays(color) {
        let board = model.getBoardState();
        var getValidPlays = ['[01', board, color + ']'];
        this.getPrologRequest(getValidPlays, this.handleValidPlaysReply);
    }

    requestPlay(play) {
        let board = model.getBoardState();
        var move = ['[02', board, '[' + play + ']' + ']']; // '[0,0,whitePiece]'
        this.getPrologRequest(move, this.handlePlayReply);
    }

    requestBotPlay(level) {
        let board = model.getBoardState();
        var botplay = ['[07',board, level + ']'];
        this.getPrologRequest(botplay, this.handlePlayReply);
    }

    requestSwitchPlayer() {
        var switchPlayer = ['[03]'];
        this.getPrologRequest(switchPlayer, this.handleSwitchPlayerReply);
    }

    requestPvP(){
        var pvp = ['[04]'];
        this.getPrologRequest(pvp, this.handlePRequest);
    }

    requestPvC(){
        var pvc = ['[05]'];
        this.getPrologRequest(pvc, this.handlePRequest);
    }

    requestCvC(){
        var cvc = ['[06]'];
        this.getPrologRequest(cvc, this.handlePRequest);
    }

    handleQuitReply(data) {
        console.log(data.target.response);
    }

    handleValidPlaysReply(data) {
        //console.log(data.target.response);
        //animation
        console.log(model.parseValidPlays(data.target.response));
    }

    handlePlayReply(data) {
        console.log(data.target.response);
        this.validPlay = true; //animation
        //Is this ok? should animation function be always called here?
        //should only the first call to the animation be called here?
        //which prolog file should be consulted game/main/?
        //sicstus implementation for testing
        //Meeting sugested...
        //animation
        model.parsePlayReply(data.target.response);
    }

    handleSwitchPlayerReply(data) {
        console.log(data.target.response);
    }

    handlePRequest(data) {
        console.log(data.target.response);
    }

    showValidCells(){
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
        for (let i = 0; i < view.thanosPieces.length; i++) {
            if (view.thanosPieces[i].selected) {
                counter++;
                if (view.thanosPieces[i] != this.selectedPiece) {
                    if (this.selectedPiece != null) {
                        this.selectedPiece.selected = false;
                        this.selectedPiece.swapText();
                    }
                    this.selectedPiece = view.thanosPieces[i];
                    if(!this.selectedPiece.locked)
                        this.selectedPiece.swapText();
                }
            }
        }
        for (let i = 0; i < view.gamoraPieces.length; i++) {
            if (view.gamoraPieces[i].selected) {
                counter++;
                if (view.gamoraPieces[i] != this.selectedPiece) {
                    if (this.selectedPiece != null)
                    {
                        this.selectedPiece.selected = false;
                        this.selectedPiece.swapText();
                    }
                    this.selectedPiece = view.gamoraPieces[i];
                    if(!this.selectedPiece.locked)
                        this.selectedPiece.swapText();
                }
            }
        }
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


    setSelected(pieces, counter){
        for (let i = 0; i < pieces.length; i++) {
            if (pieces[i].selected) {
                counter++;
                if (pieces[i] != this.selectedPiece) {
                    if (this.selectedPiece != null)
                    {
                        this.selectedPiece.selected = false;
                        this.selectedPiece = pieces[i];
                    }
                }
            }
        }
            return counter;
        }
        


    displayPieces(pieces, currTime) {
        for (let i = 0; i < pieces.length; i++) {
            this.scene.registerForPick(++this.scene.pickIndex, pieces[i]);
            pieces[i].display(view.board.selectedCell, currTime);
        }
    }

    play(){
        if(this.selectedPiece != null && view.board.selectedCell != null )
            this.requestPlay([view.board.selectedCell.column, view.board.selectedCell.line, this.selectedPiece.color])
    }

    display() {
        this.play();
        let ignore = true;
        if (this.checkSelected() == "OK" /*&& this.validPlay*/)
            ignore = false;
     
        let currTime = this.scene.currTime;
        this.scene.pushMatrix();
        view.board.display(ignore);
        this.displayPieces(view.gamoraPieces, currTime);
        this.displayPieces(view.thanosPieces, currTime);

        this.scene.registerForPick(++this.scene.pickIndex, view.assertPlayer);
        view.assertPlayer.display();
        if (61 == this.scene.pickedIndex)
            this.requestPvP();  
        this.scene.registerForPick(++this.scene.pickIndex, view.assertPlayer);
        view.playBot.display();
        if (62 == this.scene.pickedIndex)
            this.undoLastPlay();
        
        this.scene.clearPickRegistration();
        this.scene.popMatrix();
    }
};



