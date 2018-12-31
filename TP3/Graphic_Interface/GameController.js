
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
        this.tmpPiece = null;
        this.numberOfTries = 0;
        this.maxNumberOfTries = 100;
    };


    showValidCells() {
        this.client.requestValidPlays(this.selectedPiece.color);
        this.parseResponse(this.client.response);
        
    }

    undoLastPlay() {
        this.client.requestSwitchPlayer();
        //animacao
        let play = this.model.undoLastPlay();
        console.log(play);
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
            if (this.view.board.cells[i].valid || (validCells != null && validCells[index][0] == this.view.board.cells[i].line && validCells[index][1] == this.view.board.cells[i].column)) {
                index++;
                this.view.board.cells[i].valid = true;
                this.scene.registerForPick(++this.scene.pickIndex, this.view.board.cells[i]);
                this.view.board.cells[i].display();
            }
            else{
                this.scene.registerForPick(++this.scene.pickIndex, this.view.board.cells[i]);
                this.scene.clearPickRegistration();
                this.view.board.cells[i].display();
            }  
        }
        this.scene.popMatrix();

    }
    
    unvalidateCells(){
        for (let i = 0; i < this.view.board.cells.length; i++)
            this.view.board.cells[i].valid = false;
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
        }
    }

    selectCell() {
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
        if (this.model.winner == 0)
        {
            if(this.currentPlayerBot == 0)
                this.state = 'WAIT_UNDO';
            else
                this.state = 'CHANGE_PLAYER';
        }    
        else
            this.state = 'GAME_OVER';
    }

    start()
    {
        this.scene.undo_play = false;
        if(this.scene.startGame == true)
        {
            this.model.updateConfigs();
            console.log(this.model.mode)
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
            this.state = 'WAIT_AP_RESPONSE';
        }     
    }

    wait_AssertPlayers_response()
    {
        if (this.lastResponse[0] != this.client.response[0]) {
            this.lastResponse = this.client.response;
            console.log(this.lastResponse);
            this.parseResponse(this.lastResponse[1]);
            this.state = 'PROCESS_PIECE';
        }
    }

    wait_SwitchPlayers_response()
    {
        if (this.lastResponse[0] != this.client.response[0]) {
            this.lastResponse = this.client.response;
            console.log(this.lastResponse);
            this.parseResponse(this.lastResponse[1]);
            this.state = 'PROCESS_PIECE';
        }
    }

    wait_Undo()
    {
        if(this.numberOfTries <= this.maxNumberOfTries)
        {
            if(this.scene.undo_play == true)
            {
                this.scene.undo_play = false;
                this.undoLastPlay();
                this.numberOfTries = -1;
                this.state = 'WAIT_SP_RESPONSE';
            }
        }
        else
        {
            this.numberOfTries = -1;
            this.state = 'CHANGE_PLAYER';           
        }
        this.numberOfTries++;
    }

    wait_AnimationEnd()
    {
        if(this.tmpPiece.parabolic.end == true)
        {
            this.unvalidateCells();
            this.check_GameOver();
        }
    }

    //make undo only possible in wait undo state
    stateMachine() {
        switch (this.state) {
            case 'START':
                this.start();
                break;
            case 'WAIT_AP_RESPONSE' :
                this.wait_AssertPlayers_response();
                break;
            case 'PROCESS_PIECE':
                this.client.requestCurrentPlayerBot();
                this.state = 'WAIT_CPB_RESPONSE';
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
                this.wait_AnimationEnd();
                break;
            case 'WAIT_UNDO':
                this.wait_Undo();
                break;
            case 'WAIT_SP_RESPONSE' :
                this.wait_SwitchPlayers_response();
                break;
            case 'CHANGE_PLAYER':
                this.scene.camera_rotation = 32;
                //animaçao de camara e afins
                this.state = 'PROCESS_PIECE';
                break;
            case 'GAME_OVER':
                //reset game e volta para o start
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
                let arrayValidPlays = this.model.getValidPlays(validPlays);
                this.makePickingValidCells(arrayValidPlays);
                break;
            case 2:
                this.model.parsePlayReply(response);
                this.selectedPiece.createParabolicAnimation([this.selectedPiece.x, this.selectedPiece.y], 10, [this.view.board.selectedCell.x, this.view.board.selectedCell.z]);
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
                piece.createParabolicAnimation([piece.x, piece.y], 10, [cell.x, cell.z]);
                piece.hasRequestedPlay++;
                this.tmpPiece = piece;
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
        this.makePickingValidCells(null);

        this.view.board.display();
        this.makePickingPieces();


        //this.displayPieces(this.view.gamoraPieces, currTime);
        //this.displayPieces(this.view.thanosPieces, currTime);


        this.scene.clearPickRegistration();
        this.scene.popMatrix();

    }
};

