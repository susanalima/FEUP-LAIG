
/**
 * Class GameController represents the game Manalath, controls all the required actions 
 */
class GameController extends CGFobject {


    /**
 	 * Constructs an object of class GameController
	 * @param {Object} scene Scene in which the game is represented
     * @param {Object} boardTexture Texture of the board for the game
     * @param {Object} cellTexture Texture of the board cells
     * @param {Object} pieceTexture1 Texture of the games's 'blackPiece' 
     * @param {Object} pieceTexture2 Texture of the game's 'whitePiece'
     */
    constructor(scene, boardTexture, cellTexture, pieceTexture1, pieceTexture2) {
        super(scene);
        this.model = new GameModel(scene);
        this.view = new GameView(scene, boardTexture, cellTexture, pieceTexture1, pieceTexture2);
        this.client = new Client(this.model);
        this.maxNumberOfTries = 100;
        this.gameCount = 0;
        this.currentPlayerBot = null;
        this.currentPlayer = null;
        this.selectedPiece = null;
        this.state = 'START';
        this.locked = false;
        this.newTimer = true;
        this.initialize_values();
    };

    /**
     * Initializes some of this GameController values
     * lastResponse corresponding to the last response given by the client
     * tmpPiece holds the last selected piece
     * numberOfTries represents a counter for a number of tries
     */
    initialize_values() {
        this.lastResponse = [];
        this.tmpPiece = null;
        this.numberOfTries = 0;
    }

    /**
     * Restarts this GameController and its components
     */
    restart_values() {
        this.initialize_values();
        this.model.restart();
        this.view.restart();
        this.client.restart();
        this.deselectCurrentPiece();
        this.view.marker.indicatorFlag = true;
        this.scene.reset = false;
    }


    /**
     * Deselects the current selected Piece
     */
    deselectCurrentPiece() {
        if (this.selectedPiece != null) {
            this.selectedPiece.selected = false;
            this.selectedPiece.swapText();
            this.selectedPiece = null;
        }
    }

    deselectAllPiecesAux(pieces){
        for(let i = 0; i < pieces.length; i++)
            pieces[i].selected =false;
    }

    deselectAllPieces(){
        this.deselectAllPiecesAux(this.view.gamoraPieces);
        this.deselectAllPiecesAux(this.view.thanosPieces);
    }

    /**
     * Undos the last play
     */
    undoLastPlay() {
        this.view.updateLastTime();
        this.deselectCurrentPiece();
        this.client.requestSwitchPlayer();
        let play = this.model.undoLastPlay();
        this.view.undoPlay(play[0][0], play[0][1], play[1][1]);
        this.view.counting = true;
    }

    /**
     * Undos all the plays
     */
    undoAllPlays() {
        for (let i = this.model.playsCoords.length - 1; i >= 0; i--) {
            let playCoords = this.model.playsCoords[i];
            let playValues = this.model.playsValues[i];
            this.view.undoPlay(playCoords[0], playCoords[1], playValues[1]);
        }
    }

    checkMidAnimationSide(pieces){
        for(let i = 0; i < pieces.length; i++)
        {
            if(pieces[i].midAnimation)
                return true;
        }
        return false;
    }

    checkMidAnimation(){
        return this.checkMidAnimationSide(this.view.thanosPieces) || this.checkMidAnimationSide(this.view.gamoraPieces);
    }

    /**
     * Check which piece is selected returns OK if a piece is selected NOTOK if there are no pieces selected
     */
    checkSelected() {
        let counter = 0;
        let midAnimation = this.checkMidAnimation();
        if(!midAnimation && !this.locked){
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
        else{
            this.deselectAllPieces();
        }
    }

    /**
     * Checks in the pieces array if the selected piece is diferent from the one previously selected, in other words if a new piece has been selected.
     * @param {Array} pieces Array with pieces
     * @param {int} counter Counter which holds the number of selected pieces
     * @returns the number of selected pieces 1 or 0
     */
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

    /**
     * Registers all cells for picking and displays them
     */
    makePickingCells() {
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 1, 0, 0);
        for (let i = 0; i < this.view.board.cells.length; i++) {
            this.scene.registerForPick(++this.scene.pickIndex, this.view.board.cells[i]);
            this.view.board.cells[i].display();
        }
        this.scene.popMatrix();
    }

    /**
     * Displays all cells and registers for picking only the cells present in validCells
     * @param {Array} validCells cells which will be registered for picking
     */
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

    /**
     * Unvalidates all cells, these cells are not valid play destinations
     */
    unvalidateCells() {
        for (let i = 0; i < this.view.board.cells.length; i++)
            this.view.board.cells[i].valid = false;
    }


    /**
     * Displays and registers for picking the elements of pieces
     * @param {Array} pieces Array with pieces
     */
    makePickingPiecesSide(pieces) {
        for (let i = 0; i < pieces.length; i++) {
            this.scene.registerForPick(++this.scene.pickIndex, pieces[i]);
            pieces[i].display();
        }
    }

    /**
     * Displays and registers fo picking all pieces
     */
    makePickingPieces() {
        this.makePickingPiecesSide(this.view.gamoraPieces);
        this.makePickingPiecesSide(this.view.thanosPieces);
    }

    /**
     * Displays the received pieces
     * @param {Object} pieces array containing the pieces to be displayed
     */
    showPiecesSide(pieces){
        for (let i = 0; i < pieces.length; i++)
            pieces[i].display();
    }

    /**
     * Displays this GameController's view gamora and thanos pieces
     */
    showPieces(){
        this.showPiecesSide(this.view.gamoraPieces);
        this.showPiecesSide(this.view.thanosPieces);

    }

    /**
     * Represents the state 'WAIT_CPB_RESPONSE' of the GameController's state machine
     * Waits for a response to the current player bot request then parses the response and updates the state to 'REQUEST_VALID_CELLS'
     */
    wait_CurrentPlayerBot_response() {
        if (this.lastResponse[0] != this.client.response[0]) {
            this.lastResponse = this.client.response;
            console.log(this.lastResponse);
            this.parseResponse(this.lastResponse[1]);
            this.state = 'REQUEST_VALID_CELLS';
            this.check_Reset();
        }
    }

    /**
     * Represents the state 'REQUEST_VALID_CELLS' of the GameController's state machine
     * If the current player is not a bot, requests the cells where the player can play and updates the state to 'WAIT_VP_RESPONSE'
     * Otherwise, if the player is a bot the valid cells are not necessary, updating the state to 'REQUEST_PLAY_B'
     */
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

    /**
     * Represents the state 'WAIT_VP_RESPONSE' of the GameController's state machine
     * Waits for a response to a valid cells request then parses the response and updates the state to 'SELECT_CELL'
     */
    wait_validCells_response() {
        if (this.lastResponse[0] != this.client.response[0]) {
            this.lastResponse = this.client.response;
            this.parseResponse(this.lastResponse[1]);
            this.state = 'SELECT_CELL';
            this.check_Reset();
        }
    }

    /**
     * Represents the state 'SELECT_CELL' of the GameController's state machine
     * If a new piece is selected while in this state the state is updated to 'PROCESS_PIECE'
     * Otherwise waits for the selection of a cell, updating the state to 'REQUEST_PLAY_P'
     */
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

    /**
     * Represents the state 'WAIT_PP_RESPONSE' of the GameController's state machine
     * Waits for a response to a human play request then parses the response and updates the state to 'WAIT_ANIMATION_END'
     */
    wait_HumanPlay_response() {
        if (this.lastResponse[0] != this.client.response[0]) {
            this.lastResponse = this.client.response;
            this.parseResponse(this.lastResponse[1]);
            this.state = 'WAIT_ANIMATION_END';
        }
    }

    /**
     * Represents the state 'WAIT_PB_RESPONSE' of the GameController's state machine
     * Waits for a response to a bot play request then parses the response and updates the state to 'WAIT_ANIMATION_END'
     */
    wait_BotPlay_response() {
        if (this.lastResponse[0] != this.client.response[0]) {
            this.lastResponse = this.client.response;
            this.parseResponse(this.lastResponse[1]);
            this.state = 'WAIT_ANIMATION_END';
        }
    }

    /**
     * Checks is the game has ended
     * If the game has ended the state is updated to 'GAME_OVER'
     * Otherwise, if the current player is a bot the state is updated to 'CHANGE_PLAYER' 
     * If it is a human player the state is updated to 'WAIT_UNDO'
     */
    check_GameOver() {
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

    /**
     * Checks if the time of the current play has been exceeded
     */
    checkOverTime(){
        if(this.view.actualPlayTime >= this.view.playTimeMax){
            this.state = 'WAIT_SP_TIMER';
            this.view.stopTimer();
            this.client.requestSwitchPlayer();


            if(this.selectedPiece != null){
                this.unvalidateCells();
                this.selectedPiece.selected = false;
                this.selectedPiece.swapText();
                this.selectedPiece = null;
            }
        }
    }



    /**
     * Represents the state 'START' of the GameController's state machine
     * If the scene's reset flag is true the game is set to start
     * If the pieces are not in their original places they are repositioned and the state is updated to 'SMALL_WAIT'
     * Otherwise the state is updated ti 'UPDATE_CONFIGS'
     */
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

    /**
     * Represents the state 'UPDATE_CONFIGS' of the GameController's state machine
     * Updates this model's configurations and requests the game mode accordingly
     * The state is updated to 'WAIT_AP_RESPONSE'
     */
    update_Configs()
    {
        if(this.check_Reset())
            return;
        this.model.updateConfigs();
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

    /**
     * Represents the state 'WAIT_AP_RESPONSE' of the GameController's state machine
     * Waits for a response to an assert players request then parses the response and updates the state to 'PROCESS_PIECE'
     */
    wait_AssertPlayers_response() {
        if (this.lastResponse[0] != this.client.response[0]) {
            this.lastResponse = this.client.response;
            console.log(this.lastResponse);
            this.parseResponse(this.lastResponse[1]);
            this.state = 'PROCESS_PIECE';
        }
    }

    /**
     * Represents the state 'WAIT_SP_RESPONSE' of the GameController's state machine
     * Waits for a response to a switch players request then parses the response and updates the state to 'PROCESS_PIECE'
     */
    wait_SwitchPlayers_response() {
        if (this.lastResponse[0] != this.client.response[0]) {
            this.lastResponse = this.client.response;
            console.log(this.lastResponse);
            this.parseResponse(this.lastResponse[1]);
            if (this.numberOfTries <= this.maxNumberOfTries) {
                this.numberOfTries = -1;
                this.state = 'PROCESS_PIECE';
            }
            this.numberOfTries++;
        }
    }

    /**
     * Represents the state 'WAIT_SP_TIMER' of the GameController's state machine
     * Waits for a response to a switch players request then parses the response and updates the state to 'PROCESS_PIECE'
     */
    wait_SwitchPlayers_timer(){
        if (this.lastResponse[0] != this.client.response[0]) {
            this.lastResponse = this.client.response;
            console.log(this.lastResponse);
            this.parseResponse(this.lastResponse[1]);
            this.state = 'CHANGE_PLAYER';
        }
    }

    /**
     * Represents the state 'WAIT_UNDO' of the GameController's state machine
     * Waits maxNumberOfTries tries for a undo request 
     * If an undo is requested executes the undo of the last play and updates the state to 'WAIT_SP_RESPONSE'
     * If not updated the state to 'CHANGE_PLAYER'
     */
    wait_Undo() {
        if(this.check_Reset())
            return;
        if (this.numberOfTries <= this.maxNumberOfTries) {
            if (this.scene.undo_play == true) {
                this.scene.undo_play = false;
                this.undoLastPlay();
                this.numberOfTries = -1;
                this.state = 'WAIT_SP_RESPONSE';
                this.locked = false;
            }
        }
        else {
            this.numberOfTries = -1;
            this.state = 'CHANGE_PLAYER';
            this.locked = false;
        }
        
        this.numberOfTries++;
    }

    /**
     * Represents the state 'WAIT_ANIMATION_END' of the GameController's state machine
     * Waits for this tmpPiece animation to end
     */
    wait_AnimationEnd() {
        if (this.tmpPiece.parabolic.end == true) {
            this.unvalidateCells();
            this.check_GameOver();
            this.check_Reset();
            this.locked = true;
        }
    }

 
    /**
     * Represents the state 'SMALL_WAIT' of the GameController's state machine
     * Waits maxNumberOfTries tries
     * Updates the state to 'UPDATE_CONFIGS'
     */
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

    /**
     * Checks if the scene's reset flag is true
     * If so updates the state to 'START'
     * @returns true if the flag is true and false otherwise 
     */
    check_Reset(){
        if (this.scene.reset) {
            this.state = 'START';
            this.view.stopTimer();
            this.view.resetTimer();
            this.newTimer =true;
            return true;
        }
        return false;
    }

    /**
     * Checks of the scene's showGameMovie is set to true
     * If so the pieces are set to their original position and the state is updated to 'WAIT_GM_1st_ANIMATION_END'
     */
    check_GameMovie(){
        if(this.scene.showGameMovie){
            for (let i = this.model.playsCoords.length - 1; i >= 0; i--) {
                let playCoords = this.model.playsCoords[i];
                let playValues = this.model.playsValues[i];
                this.view.setPieceToStartPos(playCoords[0], playCoords[1], playValues[1]);
            }
            this.state = 'WAIT_GM_1st_ANIMATION_END';
   
        }
    }


    /**
     * Represents the state 'GAME_MOVIE' of the GameController's state machine
     * Remakes this model's currentMoviePlay play 
     * Updates the state to 'WAIT_GM_ANIMATION_END'
     */
     view_GameMovie(){
       let currMoviePlayInfo = this.model.getCurrentMoviePlayInfo();
       this.view.updateCurrentMoviePiece(currMoviePlayInfo[0][0], currMoviePlayInfo[0][1], currMoviePlayInfo[1][1]);
       this.view.redoPlay(currMoviePlayInfo[0][0], currMoviePlayInfo[0][1], currMoviePlayInfo[1][1]);
       this.state = 'WAIT_GM_ANIMATION_END';
    }

    /**
     * Represents the state 'WAIT_GM_ANIMATION_END' of the GameController's state machine
     * Waits for the end of this view's currentMoviePiece animation
     * If this model's currentMoviePlay is the last play the state is updated to 'GAME_OVER'
     * If not the state is updated to 'WAIT_GM_CAMERA_ANIMATION_END'
     */
    wait_GM_AnimationEnd(){
        if(this.check_Reset())
            return;
        if (this.view.currentMoviePiece.parabolic.end == true) {
            if(this.model.lastMoviePlay() == true)
            {
                this.scene.reset = false;
                this.scene.showGameMovie = false;
                this.model.currentMoviePlay = 0;
                this.state = 'GAME_OVER';
            }
            else
            {
                this.model.inc_currentMoviePlay();
                this.scene.update_CameraRotation();
                this.state = 'WAIT_GM_CAMERA_ANIMATION_END';
            }
        }
    }

    /**
     * Represents the state 'WAIT_GM_CAMERA_ANIMATION_END' of the GameController's state machine
     * Waits for the end of the scene's camera rotation and updates the state to 'GAME_MOVIE'
     */
    wait_GM_Camera_AnimationEnd(){
        if(this.check_Reset())
            return;
        if (this.scene.camera_rotation == 0) {
            this.state = 'GAME_MOVIE';
        }
    }

     /**
     * Represents the state 'WAIT_GM_1st_ANIMATION_END' of the GameController's state machine
     * Waits maxNumberOfTries tries and updates the state to 'WAIT_GM_CAMERA_ANIMATION_END' if the current player is 2 or
     * to 'GAME_MOVIE' if the current player is 1
     */
    wait_GM_1st_AnimationEnd(){
        if(this.check_Reset())
            return;
        if (this.numberOfTries > this.maxNumberOfTries) {
            this.numberOfTries = -1;

            if (this.currentPlayer == 2)
            {
                this.scene.update_CameraRotation();
                this.state = 'WAIT_GM_CAMERA_ANIMATION_END';
            }
            else
            this.state = 'GAME_MOVIE';

        }
        this.numberOfTries++;
    }


    /**
     * Implements the game's state machine
     */
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
                this.client.requestCurrentPlayerBot();
                if(this.newTimer){
                    this.newTimer = false;
                    this.view.startTimer();
                }
                this.state = 'WAIT_CPB_RESPONSE';
                break;
            case 'WAIT_CPB_RESPONSE':
                this.checkOverTime();
                this.wait_CurrentPlayerBot_response();
                break;
            case 'REQUEST_VALID_CELLS':
                this.request_validCells();
                this.checkOverTime();
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
                this.checkOverTime();
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
            case 'WAIT_SP_TIMER':
                this.wait_SwitchPlayers_timer();
                break;
            case 'CHANGE_PLAYER':
                this.view.marker.switchPlayer();
                this.scene.update_CameraRotation();
                this.newTimer = true;
                this.state = 'PROCESS_PIECE';
                this.check_Reset();
                break;
            case 'GAME_OVER':
               this.check_GameMovie();
               this.check_Reset();
                break;
            case 'GAME_MOVIE' :
                this.view_GameMovie();
                break;
            case 'WAIT_GM_1st_ANIMATION_END' :
                this.wait_GM_1st_AnimationEnd();
                break;
            case 'WAIT_GM_ANIMATION_END' :
                this.wait_GM_AnimationEnd();
                break;
            case 'WAIT_GM_CAMERA_ANIMATION_END' :
                this.wait_GM_Camera_AnimationEnd();
                break;
            case 'SMALL_WAIT':
                this.small_Wait();
                break;
        }

    }

    /**
     * Parses a response from a request according to its code
     * @param {Object} response to be parsed
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
                this.selectedPiece.createParabolicAnimation([this.selectedPiece.x, this.selectedPiece.y], 10, [this.view.board.selectedCell.x, this.view.board.selectedCell.z], this.view.board.selectedCell, false);
                this.selectedPiece.hasRequestedPlay++;
                this.tmpPiece = this.selectedPiece;
                break;
            case 3:   case 4:   case 5:    case 6:
                break;
            case 7:
                reply = this.model.parsePlayReply(response);
                let piece = this.view.selectRandomPieceColor(reply[2]);
                let cell = this.view.selectCell(parseFloat(reply[0]), parseFloat(reply[1]));
                piece.createParabolicAnimation([piece.x, piece.y], 10, [cell.x, cell.z], cell, false);
                piece.hasRequestedPlay++;
                this.tmpPiece = piece;
                break;
            case 8:
                this.currentPlayer = parseFloat(responsearr[1]);
                this.currentPlayerBot = parseFloat(responsearr[2].split(']')[0]);
                break;
        }
    }


    /**
	 * Displays the GameController's components in member scene
	 */
    display() {
        this.view.board.checkSelectedCells(this.selectedPiece);
        this.stateMachine();
 
        let ignore = true;
        if (this.checkSelected() == "OK")
            ignore = false;
        
        this.view.updateTimer();
        this.view.chronometer.display();
        this.view.marker.display();
        

        this.scene.pushMatrix();
        this.makePickingValidCells(null);

        this.view.board.display();
        if(this.state != 'START')
            this.makePickingPieces();
        else
            this.showPieces();


        this.scene.clearPickRegistration();
        this.scene.popMatrix();

    }
};

