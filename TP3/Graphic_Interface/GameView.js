/**
 * Class TheGame represents a board
 */
class GameView extends CGFobject {

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

        let selectText1 = new CGFtexture(scene, "./scenes/images/selected_neon.jpg");
        let selectText2 = new CGFtexture(scene, "./scenes/images/selected_neon.jpg");
        let pointerText1 = new CGFtexture(scene, "./scenes/images/pink.jpg");
        let pointerText2 = new CGFtexture(scene, "./scenes/images/white.png");

        this.playTimeMax = 7500;
        this.actualPlayTime = 0;
        this.counting = false;
        this.lastTime = null;

        this.createPieces(this.thanosPieces, pieceTexture2, 18, 32, 'blackPiece', selectText1);
        this.createPieces(this.gamoraPieces, pieceTexture1, -18, -32, 'whitePiece', selectText2);
        this.assertPlayer = new Piece(this.scene, [-30, 0], pieceTexture1, 'whitePiece');
        this.playBot = new Piece(this.scene, [-25, 8], pieceTexture2, 'blackPiece');

        this.cronometer = new Cronometer(this.scene, [-20, 10, -20], this.playTimeMax, pointerText1, pointerText2);
    };

    restart() {
        this.board.restart();
        this.resetAllPieces();
    }

    startTimer()
    {
        this.resetTimer();
        this.counting = true;
      

    }

    resetTimer(){
        this.actualPlayTime = 0;
        this.cronometer.resetTimer();
        this.lastTime = null;
    }

    stopTimer(){
        this.counting = false;
    }

   

    updateTimer(){
        let deltaT;
        if(this.counting){

        if (this.lastTime == null)
            deltaT = 0;
        else 
            deltaT = this.scene.currTime - this.lastTime;

       
            this.actualPlayTime += deltaT;
            this.cronometer.updateTime(this.actualPlayTime);

        this.lastTime = this.scene.currTime;
        }
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
    createPieces(pieces, texture, translateValueX, translateValueY, color, sText) {
        let index = 0;
        for (var q = -this.map_radius; q <= this.map_radius; q++) {
            var r1 = Math.max(-this.map_radius, -q - this.map_radius);
            var r2 = Math.min(this.map_radius, -q + this.map_radius);
            for (var r = r1; r <= r2; r++) {
                let center = this.hex_to_pixel(q, r);
                center[1] += translateValueY;
                center[0] += translateValueX;
                if (index < 15) {
                    let piece = new Piece(this.scene, center, texture, color, sText);
                    pieces.push(piece);
                }
                if (index >= 22) {
                    let piece = new Piece(this.scene, center, texture, color, sText);
                    pieces.push(piece);
                }
                index++;
            }
        }
    }

    resetPieces(pieces) {
        for (let i = 0; i < pieces.length; i++) {
            // pieces[i].x = pieces[i].center[0];
            //pieces[i].y = pieces[i].center[1];
            pieces[i].restart();
        }
    }


    resetAllPieces() {
        this.resetPieces(this.thanosPieces);
        this.resetPieces(this.gamoraPieces);
    }

    undoPlay(column, line, color) {
        let piece = this.getPiece(line, column, color);
        console.log(piece);
        if (piece == null)
            return null;
        piece.createParabolicAnimation([piece.x, piece.y], 10, piece.center);
        piece.restart();
    }

    searchPiece(line, column, color, pieces) {
        for (let i = 0; i < pieces.length; i++) {
            if (pieces[i].line == line && pieces[i].column == column && pieces[i].color == color)
                return pieces[i];
        }
        return null;
    }


    getPiece(line, column, color) {
        let piece;
        if (color == 'blackPiece')
            piece = this.searchPiece(line, column, color, this.thanosPieces);
        if (color == 'whitePiece')
            piece = this.searchPiece(line, column, color, this.gamoraPieces);
        return piece;
    }

    selectRandomPiece(pieces) {
        let availabelPieces = [];
        for (let i = 0; i < pieces.length; i++) {
            if (pieces[i].hasRequestedPlay == 0)
                availabelPieces.push(pieces[i]);
        }
        if (availabelPieces.length == 0)
            return null;
        let randomIndex = Math.floor(Math.random() * availabelPieces.length);
        console.log(availabelPieces.length);
        return availabelPieces[randomIndex];
    }

    selectRandomPieceColor(color) {
        if (color == 'blackPiece')
            return this.selectRandomPiece(this.thanosPieces);
        if (color == 'whitePiece')
            return this.selectRandomPiece(this.gamoraPieces);
        return null;
    }


    selectCell(column, line) {
        return this.board.selectCell(column, line);
    }

    getCurrentSelectedPiece() {
        for (let i = 0; i < this.thanosPieces.length; i++) {
            if (this.thanosPieces[i].selected)
                return this.thanosPieces[i];
            if (this.gamoraPieces[i].selected)
                return this.gamoraPieces[i];
        }
    }

};

