/**
 * Class TheGame represents a board
 */
class GameModel  { 
    /**
 	 * Constructs an object of class TheGame
	 * @param {Object} scene Scene in which the game is represented
     * @param {Object} boardTexture 
     * @param {Object} cellTexture 
     * @param {Object} pieceTexture1
     * @param {Object} pieceTexture2
     */
    constructor(scene) { 
        this.scene = scene;
        this.playsValues = [];
        this.playsCoords = [];
        this.winner = 0;  // -1 draw, 0 no winner yet, 1 player1, 2 player2
        this.updateConfigs();
        //https://editor.p5js.org/Gonca007/sketches/ByHifcMoX
    };

    //updates the game configurations according to the chosen ones in te interface
    updateConfigs(){
        this.level = this.scene.level;
        this.mode = parseFloat(this.scene.mode);
    }

    resetPlays(){
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



    undoLastPlay(){
        let lastCoords = this.playsCoords[this.playsCoords.length -1];
        this.playsCoords.pop();
        let lastValues = this.playsValues[this.playsValues.length -1];
        this.playsValues.pop();
        console.log([lastCoords, lastValues]);
        return [lastCoords, lastValues];
    }

};



