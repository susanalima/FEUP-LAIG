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
        this.createPieces(this.thanosPieces, pieceTexture2, 18, 32, 'blackPiece');
        this.createPieces(this.gamoraPieces, pieceTexture1, -18, -32, 'whitePiece');
        this.assertPlayer = new Piece(this.scene, [-30, 0], pieceTexture1, 'whitePiece');
        this.playBot = new Piece(this.scene, [-25,8], pieceTexture2, 'blackPiece');

    };


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
    createPieces(pieces, texture, translateValueX, translateValueY, color) {
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
                    let piece = new Piece(this.scene, center, texture, color);
                    pieces.push(piece);
                }
                index++;
            }
        }
    }

    undoPlay(x,y,color){
        /*console.log(x);
        console.log(y);*/
        console.log(color);
        let piece = this.getPiece(x,y,color);
        console.log(piece);
        if (piece == null)
            return null;
        piece.createParabolicAnimation([x,y],3,piece.center);
        piece.line = null;
        piece.column = null;
        piece.locked = false;
        piece.lastTime = null;
    }

    searchPiece(line,column,color,pieces) {
        for (let i = 0; i < pieces.length; i++)
        {
            if(pieces[i].line == line && pieces[i].column == column && pieces[i].color == color)
            return pieces[i];
        }
        return null;
    }


    getPiece(line,column,color) {
        let piece;
        if(color == 'blackPiece')
            piece = this.searchPiece(line, column,color, this.thanosPieces);
        if(color == 'whitePiece')
            piece = this.searchPiece(line, column,color, this.gamoraPieces);
        return piece;
    }

    selectRandomPiece(pieces)
    {
        let availabelPieces = [];
        for(let i = 0; i < pieces.length; i++)
        {
            if(pieces[i].hasRequestedPlay == 0)
                availabelPieces.push(pieces[i]);
        }
        if(availabelPieces.length == 0)
            return null;
        let randomIndex = Math.floor(Math.random() * availabelPieces.length); 
        console.log(availabelPieces.length);
        return availabelPieces[randomIndex];
    }

    selectRandomPieceColor(color) {
        if(color == 'blackPiece')
            return this.selectRandomPiece(this.thanosPieces);
        if(color == 'whitePiece')
            return this.selectRandomPiece(this.gamoraPieces);
        return null;
    }  


    selectCell(column, line)
    {
        return this.board.selectCell(column,line);
    }

    getCurrentSelectedPiece() {
        for (let i = 0; this.thanosPieces.length; i++) {
            if (this.thanosPieces[i].selected)
                return this.thanosPieces[i];
            if (this.gamoraPieces[i].selected)
                return this.gamoraPieces[i];
        }
    }

};

