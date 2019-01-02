
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
        //this.alreadyWaiting = false;
        this.client = new Client(this.model);
        this.maxNumberOfTries = 100;
        this.gameCount = 0;
        this.currentPlayerBot = null;
        this.currentPlayer = null;
        this.selectedPiece = null;
        this.state = 'START';
        this.initialize_values();
    };

    initialize_values() {
        this.lastResponse = [];
        this.tmpPiece = null;
        this.numberOfTries = 0;
    }

    restart_values() {
        this.initialize_values();
        this.model.restart();
        this.view.restart();
        this.client.restart();
        this.deselectCurrentPiece();
        this.scene.reset = false;
    }



    deselectCurrentPiece() {
        if (this.selectedPiece != null) {
            this.selectedPiece.selected = false;
            this.selectedPiece.swapText();
            this.selectedPiece = null;
        }
    }

    showValidCells() {
        this.client.requestValidPlays(this.selectedPiece.color);
        this.parseResponse(this.client.response);

    }

    undoLastPlay() {
        this.client.requestSwitchPlayer();
        let play = this.model.undoLastPlay();
        this.view.undoPlay(play[0][0], play[0][1], play[1][1]);
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
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 1, 0, 0);
        for (let i = 0; i < this.view.board.cells.length; i++) {
            if (validCells != null && index >= validCells.length)
                break;
            if (this.view.board.cells[i].valid || (validCells != null && validCells[index][0] == this.view.board.cells[i].line && validCells[index][1] == this.view.board.cells[i].column)) {
                index++;
                this.view.board.cells[i].valid = true;
                this.scene.registerForPick(++this.scene.pickIndex, this.view.board.cells[i]);
                this.view.board.cells[i].display();
            }
            else {
                this.scene.registerForPick(++this.scene.pickIndex, this.view.board.cells[i]);
                this.scene.clearPickRegistration();
                this.view.board.cells[i].display();
            }
        }
        this.scene.popMatrix();
    }

    unvalidateCells() {
        for (let i = 0; i < this.view.board.cells.length; i++)
            this.view.board.cells[i].valid = false;
    }


    makePickingPiecesSide(pieces) {
        for (let i = 0; i < pieces.length; i++) {
            this.scene.registerForPick(++this.scene.pickIndex, pieces[i]);
            pieces[i].display();
        }
    }

    makePickingPieces() {
        this.makePickingPiecesSide(this.view.gamoraPieces);
        this.makePickingPiecesSide(this.view.thanosPieces);
    }


    /*displayPieces(pieces, currTime) {
        for (let i = 0; i < pieces.length; i++) {
            if (pieces[i].selected && this.view.board.selectedCell != null && pieces[i].parabolic == null)
                pieces[i].createParabolicAnimation([pieces[i].x, pieces[i].y], 10, [this.view.board.selectedCell.x, this.view.board.selectedCell.z]);
            pieces[i].display(this.view.board.selectedCell, currTime);
        }
    }*/


    wait_CurrentPlayerBot_response() {
        if (this.lastResponse[0] != this.client.response[0]) {
            this.lastResponse = this.client.response;
            console.log(this.lastResponse);
            this.parseResponse(this.lastResponse[1]);
            this.state = 'REQUEST_VALID_CELLS';
            this.check_Reset();
        }
    }

    request_validCells() {
        if(this.check_Reset())
            return;
        if (this.currentPlayerBot == 0) {
            if (this.selectedPiece != null) {
                this.client.requestValidPlays(this.selectedPiece.color);
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
            this.check_Reset();
        }
    }

    selectCell() {
        if(this.check_Reset())
            return;
        if (this.view.getCurrentSelectedPiece() != this.selectedPiece) {
            this.state = 'PROCESS_PIECE';
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
            this.state = 'WAIT_ANIMATION_END';
        }
    }

    wait_BotPlay_response() {
        if (this.lastResponse[0] != this.client.response[0]) {
            this.lastResponse = this.client.response;
            console.log(this.lastResponse);
            this.parseResponse(this.lastResponse[1]);
            this.state = 'WAIT_ANIMATION_END';
        }
    }

    check_GameOver() {
        console.log("winner" + this.model.winner);
        if (this.model.winner == 0) {
            if (this.currentPlayerBot == 0) {
                this.scene.undo_play = false;
                this.state = 'WAIT_UNDO';
            }
            else
                this.state = 'CHANGE_PLAYER';
        }
        else{
            this.state = 'GAME_OVER';
            this.scene.showGameMovie = false;
            this.view.incWinsPlayer(this.model.winner);
        }
    }

    checkOverTime(){
        if(this.view.actualPlayTime >= this.view.playTimeMax){
            this.state = 'CHANGE_PLAYER';
            if(this.selectedPiece != null){
            this.selectedPiece.selected = false;
            this.selectedPiece.swapText();
            this.selectedPiece = null;
            }
        }
    }


    start(){
        if (this.scene.reset == true) {
            if (this.gameCount > 0 && this.model.playsCoords.length > 0) {
                this.undoAllPlays();
                this.state = 'SMALL_WAIT';
            }
            else {
                this.state = 'UPDATE_CONFIGS';
            }
            this.restart_values();
            this.gameCount++;
        }
    }

    update_Configs()
    {
        if(this.check_Reset())
            return;
        this.model.updateConfigs();
        console.log(this.model.mode)
        switch (this.model.mode) {
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
        this.state = 'WAIT_AP_RESPONSE';
    }

    wait_AssertPlayers_response() {
        if (this.lastResponse[0] != this.client.response[0]) {
            this.lastResponse = this.client.response;
            console.log(this.lastResponse);
            this.parseResponse(this.lastResponse[1]);
            this.state = 'PROCESS_PIECE';
        }
    }

    wait_SwitchPlayers_response() {
        if (this.lastResponse[0] != this.client.response[0]) {
            this.lastResponse = this.client.response;
            console.log(this.lastResponse);
            this.parseResponse(this.lastResponse[1]);
            this.state = 'PROCESS_PIECE';
        }
    }

    wait_Undo() {
        if(this.check_Reset())
            return;
        if (this.numberOfTries <= this.maxNumberOfTries) {
            if (this.scene.undo_play == true) {
                this.scene.undo_play = false;
                this.undoLastPlay();
                this.numberOfTries = -1;
                this.state = 'WAIT_SP_RESPONSE';
            }
        }
        else {
            this.numberOfTries = -1;
            this.state = 'CHANGE_PLAYER';
        }
        this.numberOfTries++;
    }

    wait_AnimationEnd() {
        if (this.tmpPiece.parabolic.end == true) {
            this.unvalidateCells();
            this.check_GameOver();
            this.check_Reset();
        }
    }


    undoAllPlays() {
        for (let i = this.model.playsCoords.length - 1; i >= 0; i--) {
            let playCoords = this.model.playsCoords[i];
            let playValues = this.model.playsValues[i];
            this.view.undoPlay(playCoords[0], playCoords[1], playValues[1]);
        }
    }

    small_Wait(){
        if(this.check_Reset())
            return;
        if (this.numberOfTries > this.maxNumberOfTries) {
            if (this.currentPlayer == 2)
                this.scene.update_CameraRotation();

            this.numberOfTries = -1;
            this.state = 'UPDATE_CONFIGS';
        }
        this.numberOfTries++;
    }

    
    check_Reset(){
        if (this.scene.reset) {
            this.state = 'START';
            this.view.stopTimer();
            this.view.resetTimer();
            return true;
        }
        return false;
    }

    check_GameMovie(){
        if(this.scene.showGameMovie){
            this.state = 'GAME_MOVIE';
        }
    }




    view_GameMovie(){
       let currMoviePlayInfo = this.model.getCurrentMoviePlayInfo();
       console.log(currMoviePlayInfo);
       this.view.updateCurrentMoviePiece(currMoviePlayInfo[0][0], currMoviePlayInfo[0][1], currMoviePlayInfo[1][1]);
       this.view.undoPlay(currMoviePlayInfo[0][0], currMoviePlayInfo[0][1], currMoviePlayInfo[1][1]);
       this.state = 'WAIT_GM_ANIMATION_END';
    }

    wait_GM_AnimationEnd(){

        if (this.view.currentMoviePiece.parabolic.end == true) {
            if(this.model.lastMoviePlay() == true)
            {
                this.state = 'STOP';
            }
            else
            {
                this.model.dec_currentMoviePlay();
                this.state = 'GAME_MOVIE';
            }
        }
    }


    stateMachine() {
        switch (this.state) {
            case 'START':
                this.start();
                break;
            case 'UPDATE_CONFIGS':
                this.update_Configs();
                break;
            case 'WAIT_AP_RESPONSE':
                this.wait_AssertPlayers_response();
                break;
            case 'PROCESS_PIECE':
                this.view.startTimer();
                this.client.requestCurrentPlayerBot();
                this.state = 'WAIT_CPB_RESPONSE';
                break;
            case 'WAIT_CPB_RESPONSE':
                this.checkOverTime();
                this.wait_CurrentPlayerBot_response();
                break;
            case 'REQUEST_VALID_CELLS':
                this.checkOverTime();
                this.request_validCells();
                break;
            case 'WAIT_VP_RESPONSE':
                this.wait_validCells_response();
                break;
            case 'SELECT_CELL':
                this.checkOverTime();
                this.selectCell();
                break;
            case 'REQUEST_PLAY_P':
                this.client.requestPlay([this.view.board.selectedCell.column, this.view.board.selectedCell.line, this.selectedPiece.color])
                this.state = 'WAIT_PP_RESPONSE';
                break;
            case 'REQUEST_PLAY_B':
                this.client.requestBotPlay(this.model.level);
                this.state = 'WAIT_PB_RESPONSE';
                break;
            case 'WAIT_PP_RESPONSE':
                this.wait_HumanPlay_response();
                break;
            case 'WAIT_PB_RESPONSE':
                this.wait_BotPlay_response();
                break;
            case 'WAIT_ANIMATION_END':
                this.view.stopTimer();
                this.wait_AnimationEnd();
                break;
            case 'WAIT_UNDO':
                this.wait_Undo();
                break;
            case 'WAIT_SP_RESPONSE':
                this.wait_SwitchPlayers_response();
                break;
            case 'CHANGE_PLAYER':
                  this.scene.update_CameraRotation();
                //animaçao de camara e afins
                this.state = 'PROCESS_PIECE';
                this.check_Reset();
                break;
            case 'GAME_OVER':
                //reset game e volta para o start
                //  this.restart();
                //this.state = 'WAIT';
                //if (this.currentPlayer == 2)
                  //  this.scene.camera_rotation = 32;
               this.check_GameMovie();
               this.check_Reset();
                break;
            case 'GAME_MOVIE' :
                this.view_GameMovie();
                break;
            case 'WAIT_GM_ANIMATION_END' :
                this.wait_GM_AnimationEnd();
                break;
            case 'STOP' :
                this.check_Reset();
                break;
            case 'SMALL_WAIT':
                this.small_Wait();
                break;
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
                let arrayValidPlays = this.model.getValidPlays(validPlays);
                this.makePickingValidCells(arrayValidPlays);
                break;
            case 2:
                this.model.parsePlayReply(response);
                this.selectedPiece.createParabolicAnimation([this.selectedPiece.x, this.selectedPiece.y], 10, [this.view.board.selectedCell.x, this.view.board.selectedCell.z], this.view.board.selectedCell);
                this.selectedPiece.hasRequestedPlay++;
                this.tmpPiece = this.selectedPiece;
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
                console.log(cell)
                piece.createParabolicAnimation([piece.x, piece.y], 10, [cell.x, cell.z], cell);
                piece.hasRequestedPlay++;
                this.tmpPiece = piece;
                break;
            case 8:
                this.currentPlayer = parseFloat(responsearr[1]);
                this.currentPlayerBot = parseFloat(responsearr[2].split(']')[0]);
                console.log(this.currentPlayerBot);
                break;
        }
    }


    display() {
        //this.view.board.checkSelectedCells();

        this.view.board.checkSelectedCells(this.selectedPiece);
        this.stateMachine();
        //console.log(this.state);
        /*if (this.selectedPiece != null && this.selectedPiece.parabolic != null)
            this.alreadyWaiting = false;*/

        let ignore = true;
        if (this.checkSelected() == "OK")
            ignore = false;
        
        this.view.updateTimer();
        this.view.cronometer.display();
        this.view.marker.display();

        this.scene.pushMatrix();
        this.makePickingValidCells(null);

        this.view.board.display();
        this.makePickingPieces();


        //this.displayPieces(this.view.gamoraPieces, currTime);
        //this.displayPieces(this.view.thanosPieces, currTime);


        this.scene.clearPickRegistration();
        this.scene.popMatrix();

    }
};

