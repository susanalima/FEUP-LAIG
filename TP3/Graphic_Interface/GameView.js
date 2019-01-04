/**
 * Class GameView represents the graphic components of the game
 */
class GameView extends CGFobject {

     /**
 	 * Constructs an object of class GameView
	 * @param {Object} scene Scene in which the game is represented
     * @param {Object} boardTexture Texture of the board for the game
     * @param {Object} cellTexture Texture of the board cells
     * @param {Object} pieceTexture1 Texture of the games's 'blackPiece' 
     * @param {Object} pieceTexture2 Texture of the game's 'whitePiece'
     */
    constructor(scene, boardTexture, cellTexture, pieceTexture1, pieceTexture2) {
        super(scene);
        this.board = new MyBoard(this.scene, boardTexture, cellTexture);
        this.map_radius = 3;
        this.cell_space_radius = 2;
        this.cell_radius = 3;
        this.thanosPieces = [];
        this.gamoraPieces = [];

        this.player1Wins = 0;
        this.player2Wins = 0;

        let selectText1 = new CGFtexture(scene, "./scenes/images/selected_roxo.png");
        let selectText2 = new CGFtexture(scene, "./scenes/images/selected_neon.png");
        let pointerText1 = new CGFtexture(scene, "./scenes/images/red.png");
        let pointerText2 = new CGFtexture(scene, "./scenes/images/clock.png");

        this.playTimeMax = 7500;
        this.actualPlayTime = 0;
        this.counting = false;
        this.lastTime = null;

        this.currentMoviePiece = null;

        this.createPieces(this.thanosPieces, pieceTexture2, 18, 32, 'blackPiece', selectText1);
        this.createPieces(this.gamoraPieces, pieceTexture1, -18, -32, 'whitePiece', selectText2);

        this.chronometer = new Chronometer(this.scene, [-25, 4, -20], this.playTimeMax, pointerText1, pointerText2);
        this.marker = new Marker(this.scene, [25, 4, 20]);
        this.sphere = new MySphere2(this.scene,3,3,10);
    };

    /**
     * Restarts this GameView's and its components
     */
    restart() {
        this.board.restart();
        this.resetAllPieces();
        this.stopTimer();
        this.resetTimer();
        this.resetWins();
        this.currentMoviePiece = null;
    }

    /**
     * Resets the number of wins for both players
     */
    resetWins(){
        this.player1Wins = 0;
        this.player2Wins = 0;
    }

    /**
     * Starts the play timer
     */
    startTimer()
    {
        this.resetTimer();
        this.counting = true;
    }

    /**
     * Resets the play timer
     */
    resetTimer(){
        this.actualPlayTime = 0;
        this.chronometer.resetTimer();
        this.lastTime = null;
    }

    /**
     * Stops the play timer
     */
    stopTimer(){
        this.counting = false;
    }

   
    /**
     * Update the play timer has passes that information to the stopwatch
     */
    updateTimer(){
        let deltaT;
        if(this.counting){

        if (this.lastTime == null)
            deltaT = 0;
        else 
            deltaT = this.scene.currTime - this.lastTime; 
            this.actualPlayTime += deltaT;
            this.chronometer.updateTime(this.actualPlayTime);

        this.lastTime = this.scene.currTime;
        }
    }

    /**
     * Increments by 1 the number of wins of the player passed as argument
     * @param {int} player Player whose wins will be incremented by 1
     */
    incWinsPlayer(player){
        if(player == 1){
            this.player1Wins++;
            this.marker.pUnits1++;
        }
        else{
            this.player2Wins++;
            this.marker.pUnits2++;
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
     * Creates the boards pieces positioning in their original positions
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

    /**
     * Restarts all the pieces from the given array
     * @param {Object} pieces array containing the pieces to be restarted
     */
    resetPieces(pieces) {
        for (let i = 0; i < pieces.length; i++) {
            pieces[i].restart();
        }
    }

    /**
     * Restarts all the pieces from this GameView gamora and thanos arrays
     */
    resetAllPieces() {
        this.resetPieces(this.thanosPieces);
        this.resetPieces(this.gamoraPieces);
    }

 
   /**
     * Restarts the piece with given line, column and color, setting it to the start position (animation)
     * @param {Object} line Line of the piece
     * @param {Object} column Column of the piece 
     * @param {Object} color Color of the piece 
     * @return null if the piece does not exist
     */
    undoPlay(column, line, color) {
        let piece = this.getPiece(line, column, color);
        if (piece == null)
            return null;
        piece.createParabolicAnimation([piece.x, piece.y], 10, piece.center, null, true);
        piece.restart();
    }

   /**
     * Sets the piece with given line, column and color to its play position (animation)
     * @param {Object} line Line of the piece
     * @param {Object} column Column of the piece 
     * @param {Object} color Color of the piece 
     * @return null if the piece does not exist
     */
    redoPlay(column, line, color) {
        let piece = this.getPiece(line, column, color);
        if (piece == null)
            return null;
        piece.createParabolicAnimation(piece.center, 10,piece.playedCenter, null, false);
    }

    /**
     * Sets the piece with given line, column and color to its initial position (animation)
     * @param {Object} line Line of the piece
     * @param {Object} column Column of the piece 
     * @param {Object} color Color of the piece 
     * @return null if the piece does not exist
     */
    setPieceToStartPos(column, line , color) {
        let piece = this.getPiece(line, column, color);
        if (piece == null)
            return null;
        piece.createParabolicAnimation([piece.x, piece.y], 10, piece.center, null, true);
    }

    /**
     * Retrieves the piece from the pieces array with given line, column and color
     * @param {Object} line Line of the piece to be retrieved
     * @param {Object} column Column of the piece to be retrieved
     * @param {Object} color Color of the piece to be retrieved
     * @return {Object} The piece if the piece in this refered conditions exists, null otherwise
     */
    searchPiece(line, column, color, pieces) {
        for (let i = 0; i < pieces.length; i++) {
            if (pieces[i].line == line && pieces[i].column == column && pieces[i].color == color)
                return pieces[i];
        }
        return null;
    }


    /**
     * Retrieves the piece from this GameView's gamora and thanos arrays with given line, column and color
     * @param {Object} line Line of the piece to be retrieved
     * @param {Object} column Column of the piece to be retrieved
     * @param {Object} color Color of the piece to be retrieved
     * @return {Object} The piece if the piece in this refered conditions exists, null otherwise
     */
    getPiece(line, column, color) {
        let piece;
        if (color == 'blackPiece')
            piece = this.searchPiece(line, column, color, this.thanosPieces);
        if (color == 'whitePiece')
            piece = this.searchPiece(line, column, color, this.gamoraPieces);
        return piece;
    }

    /**
     * Selects a random piece of the passed array
     * @param {Object} pieces array containing the pieces from where the random piece will be selected
     * @returns {Object} randomly selected piece from the pieces array
     */
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

    /**
     * Selects a random piece of the given color
     * @param {Object} color Color of the piece to randomly select
     * @returns {Object} randomly selected piece with color color from this GameView's gamora and thanos array
     */
    selectRandomPieceColor(color) {
        if (color == 'blackPiece')
            return this.selectRandomPiece(this.thanosPieces);
        if (color == 'whitePiece')
            return this.selectRandomPiece(this.gamoraPieces);
        return null;
    }

    /**
     * Selects the cell with the given column and line
     * @param {Object} column Column of the cell to be selected
     * @param {Object} line Line of the cell to be selected
     */
    selectCell(column, line) {
        return this.board.selectCell(column, line);
    }

    /**
     * Retrieves the current selected piece
     * @return {Object} the piece currently selected
     */
    getCurrentSelectedPiece() {
        for (let i = 0; i < this.thanosPieces.length; i++) {
            if (this.thanosPieces[i].selected)
                return this.thanosPieces[i];
            if (this.gamoraPieces[i].selected)
                return this.gamoraPieces[i];
        }
    }

    /**
     * Updates this GameView's currentMoviePiece
     * @param {Object} column Column of the piece
     * @param {Object} line Line of the piece
     * @param {Object} color Color of the piece
     */
    updateCurrentMoviePiece(column, line, color)
    {
        this.currentMoviePiece = this.getPiece(line, column, color);
    }

};

