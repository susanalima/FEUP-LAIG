/**
 * Class GameModel represents the game's data
 */
class GameModel  { 
    /**
 	 * Constructs an object of class GameModel
	 * @param {Object} scene Scene in which the game is represented
     */
    constructor(scene) { 
        this.scene = scene;
        this.initialize_values();
        this.updateConfigs();
    };

    
    /**
     * Initializes some of this GameModel values
     * currentMoviePlay represents the current index of the play for the game's movie
     * playsValues array that holds the player and color values for eac play
     * playsCoords array that holds the coordinates of each play
     * winner represents the game's winner
     */
    initialize_values(){
        this.currentMoviePlay = 0;
        this.playsValues = [];
        this.playsCoords = [];
        this.winner = 0;  // -1 draw, 0 no winner yet, 1 player1, 2 player2
    }

    /**
     * Restarts this GameModel's and its components
     */
    restart(){
        this.initialize_values();
    }

    /**
     * updates the game configurations according to the chosen ones in te interface
     */
    updateConfigs(){
        this.level = this.scene.level;
        this.mode = parseFloat(this.scene.mode);
    }

    /**
     * Resets this GameModel's playsValues and playsCoord arrays
     */
    resetPlays(){
        this.playsValues = [];
        this.playsCoords = [];
    }

    /**
     * Adds a play to the playsValues and playsCoords array
     * @param {Object} x Play x coordinate
     * @param {Object} y Play y coordinate
     * @param {Object} player Play player
     * @param {Object} color Play color
     */
    addPlay(x, y, player, color) {
        let play = this.createPlay(x, y, player, color);
        this.playsCoords.push(play[0]);
        this.playsValues.push(play[1]);
    }

     /**
     * Creates a play with the given values
     * @param {Object} x Play x coordinate
     * @param {Object} y Play y coordinate
     * @param {Object} player Play player
     * @param {Object} color Play color
     */
    createPlay(x, y, player, color) {
        return [[x, y], [player, color]];
    }

    /**
     * Searches for coords in this GameModel's playsCoords array
     * @param {Object} coords array containig the coordinates to search
     */
    searchCoords(coords) {
        var coordsJson = JSON.stringify(coords);
        var playsCoordsJson = this.playsCoords.map(JSON.stringify);
        return playsCoordsJson.indexOf(coordsJson);
    }

    /**
     * Parses the current GameModel's plays stack, represented in the arrays playsValues and playsCoords
     * @returns {Object} parsed string in the format required by the prolog program, of the game's board
     */
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

    /**
     * Parses a valid plays string to an array with the corresponding coordinates (line, column)
     * @param {Object} validPlays string to be parsed
     * @returns {Object} cellCoordsArray array with the parsed coordinates
     */
    getValidPlays(validPlays) {
        let cellCoordsArray = [];
        let validPlaysarr = validPlays.split('),');
        for(let i = 0; i < validPlaysarr.length; i++)
        {
           let movestr = validPlaysarr[i];
           let tmparr = movestr.split(',');
           let line = tmparr[1];
           let column = tmparr[0].split('(')[1];
           cellCoordsArray.push([parseFloat(line),parseFloat(column)]);
        }
        return cellCoordsArray;
    }

   /**
    * Parsed a string corresponding to a play 
    * @param {Object} reply string to be parsed
    * @returns {Object} array with the column, line of the cell and color of the piece played
    */
    parsePlayReply(reply){
        let replyarr = reply.split(',');
        this.winner = parseFloat(replyarr[2]);
        let player = parseFloat(replyarr[1]);
        let column = parseFloat(replyarr[3].split('[')[1]);
        let line = parseFloat(replyarr[4]);
        let color = replyarr[5].split(']')[0];
        this.addPlay(column, line, player, color);
        return [column,line,color];
    }

    /**
     * Removes the last played values and coordinates from this playsValues and playsCoords
     * @returns {Object} The last played values and coordinates 
     */
    undoLastPlay(){
        let lastCoords = this.playsCoords[this.playsCoords.length -1];
        this.playsCoords.pop();
        let lastValues = this.playsValues[this.playsValues.length -1];
        this.playsValues.pop();
        return [lastCoords, lastValues];
    }

    /**
     * Retrieves the coordinates and the values for this GameModel's currentMoviePlay
     * @returns {Object} The values and coordinates of the currentMoviePlay
     */
    getCurrentMoviePlayInfo(){
        let playCoords = this.playsCoords[this.currentMoviePlay];
        let playValues = this.playsValues[this.currentMoviePlay];
        return [playCoords,playValues];
    }

    /**
     * Increments this GameModel's currentMoviePlay value
     */
    inc_currentMoviePlay(){
        if(this.currentMoviePlay < this.playsCoords.length - 1)
            this.currentMoviePlay++;
    }

    /**
     * Checks is this GameModels currentMoviePlay value is the last play in the stack
     * @returns true if the currentMoviePlay value is the last play in the stack, false otherwise
     */
    lastMoviePlay()
    {
        return (this.currentMoviePlay == this.playsCoords.length - 1);
    }

    /**
     * Retrieves this GameModel's currentMoviePlay values from the playsValues array
     * @returns {Object} the currentMoviePlay values from the playsValues array
     */
    getCurrentMoviePlayPlayer()
    {
        return this.playsValues[this.currentMoviePlay][0];
    }

};



