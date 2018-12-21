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
	constructor(scene,boardTexture,cellTexture,pieceTexture1,pieceTexture2) {
        super(scene);
        this.board = new MyBoard(this.scene,boardTexture,cellTexture);
   

        this.map_radius = 3;
        this.cell_space_radius = 2;
        this.cell_radius = 3;
        this.thanosPieces = [];
        this.gamoraPieces = [];
        this.createPieces(this.thanosPieces, pieceTexture1, pieceTexture2,18,32);
        this.createPieces(this.gamoraPieces, pieceTexture2, pieceTexture1,-18,-32);
        console.log(this.thanosPieces);
        //this.createPieces(pieceTexture2);
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
    createPieces(pieces, texture, texture2, translateValueX, translateValueY) {
        let index = 0;

        for (var q = -this.map_radius; q <= this.map_radius; q++) {
			var r1 = Math.max(-this.map_radius, -q - this.map_radius);
            var r2 = Math.min(this.map_radius, -q + this.map_radius);
			for (var r = r1; r <= r2; r++) {
                let center =this.hex_to_pixel(q, r);
                center[1] += translateValueY;
                center[0] += translateValueX;
                if( index < 15)
                {
                    let piece = new Piece(this.scene,center, texture);
                    pieces.push(piece);
                }
                if(index >= 22)
                {
                    let piece = new Piece(this.scene,center, texture2);
                    pieces.push(piece); 
                }
                index++;
         
            }
		}
	}

    setVisiblePieces(){
        for(let i = 0; i < this.thanosPieces.length; i++){
            if(i >= 15 && i < 22)
                this.thanosPieces[i].visible = false;
        }
    }

 
    display() {
        let currTime = this.scene.currTime;
        this.scene.pushMatrix();
        this.board.display();
        for(let i = 0; i < this.thanosPieces.length; i++)
        {
            this.scene.registerForPick(++this.scene.pickIndex,  this.gamoraPieces[i]);
            this.gamoraPieces[i].display(this.board.selectedCell,currTime);
        }
        for(let i = 0; i < this.thanosPieces.length; i++){
            this.scene.registerForPick(++this.scene.pickIndex,  this.thanosPieces[i]);
            this.thanosPieces[i].display(this.board.selectedCell,currTime);
        }
        this.scene.popMatrix();
    
    }
};