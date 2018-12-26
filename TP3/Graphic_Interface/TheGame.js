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
        this.createPlays();
        this.addPlay(0, 1, 1, 'whitePiece');
        this.addPlay(2, 0, 2, 'whitePiece');
        this.addPlay(12, 5, 1, 'whitePiece');
        console.log(this.playsCoords);
        console.log(this.playsValues);
        this.createBoardState();

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



    createBoardState() {
        let board = "[";
        for (var q = -4; q <= 4; q++) {
            var r1 = Math.max(-4, -q - 4);
            var r2 = Math.min(4, -q + 4);
            for (var r = r1; r <= r2; r++) {
                let line = q+4;
                let column = (q + r + 4) * 2;
                let index  = this.searchCoords([column, line]);
                if(index != -1)
                {  
                   let color = this.playsValues[index][1];
                    board += `cell(${column},${line},${color}),`
                }
                else
                {
                    board += `cell(${column},${line},emptyCell),`
                }
            }
        }
        board = board.slice(0, -1);;
        board += ']';
        console.log(board);
    }


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

    setVisiblePieces() {
        for (let i = 0; i < this.thanosPieces.length; i++) {
            if (i >= 15 && i < 22)
                this.thanosPieces[i].visible = false;
        }
    }


    display() {
        let currTime = this.scene.currTime;
        this.scene.pushMatrix();
        this.board.display();
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
            this.makeRequest();
        this.scene.clearPickRegistration();
        this.scene.popMatrix();

    }


    getPrologRequest(requestString, onSuccess, onError, port) {
        var requestPort = port || 8081
        var request = new XMLHttpRequest();
        request.open('GET', 'http://localhost:' + requestPort + '/' + requestString, true);
        request.onload = onSuccess || function (data) { console.log("Request successful. Reply: " + data.target.response); };
        request.onerror = onError || function () { console.log("Error waiting for response"); };
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.send();
    }

    makeRequest() {
        // Get Parameter Values
        var getValidPlays = ['[01', '[cell(0,0,emptyCell),cell(2,0,emptyCell),cell(4,0,emptyCell),cell(6,0,emptyCell),cell(8,0,emptyCell),cell(0,1,emptyCell),cell(2,1,emptyCell),cell(4,1,emptyCell),cell(6,1,emptyCell),cell(8,1,emptyCell),cell(10,1,emptyCell),cell(0,2,emptyCell),cell(2,2,emptyCell),cell(4,2,emptyCell),cell(6,2,emptyCell),cell(8,2,emptyCell),cell(10,2,emptyCell),cell(12,2,emptyCell),cell(0,3,emptyCell),cell(2,3,emptyCell),cell(4,3,emptyCell),cell(6,3,emptyCell),cell(8,3,emptyCell),cell(10,3,emptyCell),cell(12,3,emptyCell),cell(14,3,emptyCell),cell(0,4,emptyCell),cell(2,4,emptyCell),cell(4,4,emptyCell),cell(6,4,emptyCell),cell(8,4,emptyCell),cell(10,4,emptyCell),cell(12,4,emptyCell),cell(14,4,emptyCell),cell(16,4,emptyCell),cell(2,5,emptyCell),cell(4,5,emptyCell),cell(6,5,emptyCell),cell(8,5,emptyCell),cell(10,5,emptyCell),cell(12,5,emptyCell),cell(14,5,emptyCell),cell(16,5,emptyCell),cell(4,6,emptyCell),cell(6,6,emptyCell),cell(8,6,emptyCell),cell(10,6,emptyCell),cell(12,6,emptyCell),cell(14,6,emptyCell),cell(16,6,emptyCell),cell(6,7,emptyCell),cell(8,7,emptyCell),cell(10,7,emptyCell),cell(12,7,emptyCell),cell(14,7,emptyCell),cell(16,7,emptyCell),cell(8,8,emptyCell),cell(10,8,emptyCell),cell(12,8,emptyCell),cell(14,8,emptyCell),cell(16,8,emptyCell)]', 'whitePiece]'];
        var quit = ['[00]'];
        var play = ['[02', '[cell(0,0,emptyCell),cell(2,0,emptyCell),cell(4,0,emptyCell),cell(6,0,emptyCell),cell(8,0,emptyCell),cell(0,1,emptyCell),cell(2,1,emptyCell),cell(4,1,emptyCell),cell(6,1,emptyCell),cell(8,1,emptyCell),cell(10,1,emptyCell),cell(0,2,emptyCell),cell(2,2,emptyCell),cell(4,2,emptyCell),cell(6,2,emptyCell),cell(8,2,emptyCell),cell(10,2,emptyCell),cell(12,2,emptyCell),cell(0,3,emptyCell),cell(2,3,emptyCell),cell(4,3,emptyCell),cell(6,3,emptyCell),cell(8,3,emptyCell),cell(10,3,emptyCell),cell(12,3,emptyCell),cell(14,3,emptyCell),cell(0,4,emptyCell),cell(2,4,emptyCell),cell(4,4,emptyCell),cell(6,4,emptyCell),cell(8,4,emptyCell),cell(10,4,emptyCell),cell(12,4,emptyCell),cell(14,4,emptyCell),cell(16,4,emptyCell),cell(2,5,emptyCell),cell(4,5,emptyCell),cell(6,5,emptyCell),cell(8,5,emptyCell),cell(10,5,emptyCell),cell(12,5,emptyCell),cell(14,5,emptyCell),cell(16,5,emptyCell),cell(4,6,emptyCell),cell(6,6,emptyCell),cell(8,6,emptyCell),cell(10,6,emptyCell),cell(12,6,emptyCell),cell(14,6,emptyCell),cell(16,6,emptyCell),cell(6,7,emptyCell),cell(8,7,emptyCell),cell(10,7,emptyCell),cell(12,7,emptyCell),cell(14,7,emptyCell),cell(16,7,emptyCell),cell(8,8,emptyCell),cell(10,8,emptyCell),cell(12,8,emptyCell),cell(14,8,emptyCell),cell(16,8,emptyCell)]', '[0,0,whitePiece]]'];
        var switchPlayer = ['[03]'];
        // Make Request
        this.getPrologRequest(quit, this.handleReply);
    }

    //Handle the Reply
    handleReply(data) {
        console.log(data.target.response);
    }
};

