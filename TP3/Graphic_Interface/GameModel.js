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
    constructor() { 
        this.playsValues = [];
        this.playsCoords = [];
        this.endGame = false;
        this.level = 2;
        //https://editor.p5js.org/Gonca007/sketches/ByHifcMoX
    };  


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

    parseValidPlays(validPlays) {
        let cellCoordsArray = [];
        let validPlaysarr = validPlays.split('),');
        for(let i = 0; i < validPlaysarr.length; i++)
        {
           let movestr = validPlaysarr[i];
           let tmparr = movestr.split(',');
           let line = tmparr[1];
           let column = tmparr[0].split('(')[1];
           cellCoordsArray.push([parseFloat(column),parseFloat(line)]);
        }
        return cellCoordsArray;
    }

    parsePlayReply(reply){
        let replyarr = reply.split(',');
        let player = parseFloat(replyarr[0].split('[')[1]);
        let column = parseFloat(replyarr[2].split('[')[1]);
        let line = parseFloat(replyarr[3]);
        let color = replyarr[4].split(']')[0];
        this.addPlay(column, line, player, color);
        console.log(this.playsCoords);
        console.log(this.playsValues);
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



