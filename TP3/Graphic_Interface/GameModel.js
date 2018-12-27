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
       
        this.createPlays();
       /* this.addPlay(0, 1, 1, 'whitePiece');
        this.addPlay(2, 0, 2, 'whitePiece');
        this.addPlay(12, 5, 1, 'whitePiece');
        console.log(this.playsCoords);
        console.log(this.playsValues);*/

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

    undoLastPlay(){
        this.playsCoords.pop();
        this.playsValues.pop();
    }

};



