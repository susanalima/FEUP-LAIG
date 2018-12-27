/**
 * Class TheGame represents a board
 */
class TheGame extends CGFobject {

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
        this.board = new MyBoard(this.scene, boardTexture, cellTexture);
        this.map_radius = 3;
        this.cell_space_radius = 2;
        this.cell_radius = 3;
        this.thanosPieces = [];
        this.gamoraPieces = [];
        this.createPieces(this.thanosPieces, pieceTexture1, pieceTexture2, 18, 32, 'blackPiece');
        this.createPieces(this.gamoraPieces, pieceTexture2, pieceTexture1, -18, -32, 'whitePiece');
        this.piece = new Piece(this.scene, [0, 0], pieceTexture1, 'whitePiece');
        this.plays = [];
        this.selectedPiece = null;
        this.createPlays();
        this.addPlay(0, 1, 1, 'whitePiece');
        this.addPlay(2, 0, 2, 'whitePiece');
        this.addPlay(12, 5, 1, 'whitePiece');
        console.log(this.playsCoords);
        console.log(this.playsValues);

        //https://editor.p5js.org/Gonca007/sketches/ByHifcMoX
    };

    createPlays() {
        this.playsValues = [];
        this.playsCoords = [];
    }

    addPlay(x, y, player, color) {
        let play = this.createPlay(x, y, player, color);
        this.playsCoords.push(play[0]);
        this.playsValues.push(play[1]);
    }

    createPlay(x, y, player, color) {
        return [[x, y], [player, color]];
    }

    searchCoords(coords) {
        var coordsJson = JSON.stringify(coords);
        var playsCoordsJson = this.playsCoords.map(JSON.stringify);
        return playsCoordsJson.indexOf(coordsJson);
    }

    getBoardState() {
        let board = "[";
        for (var q = -4; q <= 4; q++) {
            var r1 = Math.max(-4, -q - 4);
            var r2 = Math.min(4, -q + 4);
            for (var r = r1; r <= r2; r++) {
                let line = q + 4;
                let column = (q + r + 4) * 2;
                let index = this.searchCoords([column, line]);
                if (index != -1) {
                    let color = this.playsValues[index][1];
                    board += `cell(${column},${line},${color}),`
                }
                else {
                    board += `cell(${column},${line},emptyCell),`
                }
            }
        }
        board = board.slice(0, -1);
        board += ']';
        return board;
    }



/******************************************* Board Display ***********************************************/
    /**
     * Matrix multiplication between a hexagon orientation matrix and the vector [q,r]
     * @param {Object} q 
     * @param {Object} r 
     */
    hex_to_pixel(q, r) {
        var x = (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r) * (this.cell_space_radius);
        var y = (0 * q + 3 / 2 * r) * this.cell_space_radius;
        return [x, y];
    }

    /**
     * Creates the boards cells
     */
    createPieces(pieces, texture, texture2, translateValueX, translateValueY, color) {
        let index = 0;
        for (var q = -this.map_radius; q <= this.map_radius; q++) {
            var r1 = Math.max(-this.map_radius, -q - this.map_radius);
            var r2 = Math.min(this.map_radius, -q + this.map_radius);
            for (var r = r1; r <= r2; r++) {
                let center = this.hex_to_pixel(q, r);
                center[1] += translateValueY;
                center[0] += translateValueX;
                if (index < 15) {
                    let piece = new Piece(this.scene, center, texture, color);
                    pieces.push(piece);
                }
                if (index >= 22) {
                    let piece = new Piece(this.scene, center, texture2, color);
                    pieces.push(piece);
                }
                index++;
            }
        }
    }

    checkSelected() {
        let counter = 0;
        for (let i = 0; i < this.thanosPieces.length; i++) {
            if (this.thanosPieces[i].selected) {
                counter++;
                if (this.thanosPieces[i] != this.selectedPiece) {
                    if (this.selectedPiece != null)
                        this.selectedPiece.selected = false;
                    this.selectedPiece = this.thanosPieces[i];
                }
            }
        }
        for (let i = 0; i < this.gamoraPieces.length; i++) {
            if (this.gamoraPieces[i].selected) {
                counter++;
                if (this.gamoraPieces[i] != this.selectedPiece) {
                    if (this.selectedPiece != null)
                        this.selectedPiece.selected = false;
                    this.selectedPiece = this.gamoraPieces[i];
                }
            }
        }
        //console.log("Selected:" + counter);
        if (counter == 1)
            return "OK"; //One piece selected
        else if (counter == 0)
            return "NOTOK"; // No pieces selected
        else
            return "ERROR"; //More than one piece was selected (Only one piece should be selected at any time)
    }


    display() {
        let ignore = true;
        if (this.checkSelected() == "OK")
            ignore = false;
        else
            ignore = true;

        let currTime = this.scene.currTime;
        this.scene.pushMatrix();
        this.board.display(ignore);
        for (let i = 0; i < this.thanosPieces.length; i++) {
            this.scene.registerForPick(++this.scene.pickIndex, this.gamoraPieces[i]);
            this.gamoraPieces[i].display(this.board.selectedCell, currTime);
        }
        for (let i = 0; i < this.thanosPieces.length; i++) {
            this.scene.registerForPick(++this.scene.pickIndex, this.thanosPieces[i]);
            this.thanosPieces[i].display(this.board.selectedCell, currTime);
        }
        this.scene.registerForPick(++this.scene.pickIndex, this.piece);
        this.piece.display();
        if (this.scene.pickIndex == this.scene.pickedIndex)
            this.requestValidPlays(this.piece.color);
        this.scene.clearPickRegistration();
        this.scene.popMatrix();
    }

/******************************************* Prolog Requests and Replies ***********************************************/
    
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
        let board = this.getBoardState();
        var getValidPlays = ['[01', board, color+']'];
        this.getPrologRequest(getValidPlays, this.handleValidPlaysReply);
    }

    requestPlay(play) {
        let board = this.getBoardState();
        var move = ['[02',board, play + ']']; // '[0,0,whitePiece]'
        this.getPrologRequest(move, this.handlePlayReply);
    }

    requestSwitchPlayer() {
         var switchPlayer = ['[03]'];
         this.getPrologRequest(switchPlayer, this.handleSwitchPlayerReply);
    }

    handleQuitReply(data) {
        console.log(data.target.response);
    }

    handleValidPlaysReply(data) {
        //console.log(data.target.response);
        //animation
       console.log(parseValidPlays(data.target.response));  
    }

    handlePlayReply(data) {
        console.log(data.target.response);
        //animation
    }

    handleSwitchPlayerReply(data) {
        console.log(data.target.response);
    }


    play(){
        //this.requestPlay(play);
    }

    showValidCells(){
        this.requestValidPlays();
    }

    undoLastPlay(){
        this.playsCoords.pop();
        this.playsValues.pop();
        this.requestSwitchPlayer();
        //animacao
    }
};

/*function parseValidPlays(validPlays) {
    let cellCoordsArray = [];
    let validPlaysarr = validPlays.split('),');
    for(let i = 0; i < validPlaysarr.length; i++)
    {
       let movestr = validPlaysarr[i];
       let tmparr = movestr.split(',');
       let line = tmparr[1];
       let column = tmparr[0].split('(')[1];
       cellCoordsArray.push([column,line]);
    }
    return cellCoordsArray;
}*/

