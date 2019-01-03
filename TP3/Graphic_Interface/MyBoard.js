/**
 * Class MyBoard represents a board
 */
class MyBoard extends CGFobject {

    /**
 	 * Constructs an object of class MyBoard
	 * @param {Object} scene Scene in which the board is represented
     * @param {Object} boardTexture 
     * @param {Object} cellTexture 
     */
    constructor(scene, boardTexture, cellTexture) {
        super(scene);
        this.cells = [];
        this.cellsNumber = 61;
        this.map_radius = 4;
        this.cell_space_radius = 3;
        this.cell_radius = 2.5;
        this.createCells();
        this.base = new MyPrism(scene, 6, 1, 0.5, 25);
        this.boardTexture = boardTexture;
        this.cellTexture = cellTexture;
        this.selectedCell = null;
    };

    restart(){
        this.selectedCell = null;
        this.resetBoard();
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
    createCells() {
        let validText =  new CGFtexture(this.scene, "./scenes/images/red.png");
        let text = new CGFtexture(this.scene, "scenes/images/batman.jpg");
        for (var q = -this.map_radius; q <= this.map_radius; q++) {
            var r1 = Math.max(-this.map_radius, -q - this.map_radius);
            var r2 = Math.min(this.map_radius, -q + this.map_radius);
            for (var r = r1; r <= r2; r++) {
                let center = this.hex_to_pixel(q, r);
                let line = q + 4;
                let column = (q + r + 4) * 2;
                let cell = new BoardCell(this.scene, this.cell_radius, center, column, line, text, validText);
                this.cells.push(cell);
            }
        }
    }

    selectCell(column,line)
    {
        for(let i = 0; i < this.cells.length; i++)
        {
            let cell = this.cells[i];
            if(cell.column == column && cell.line == line )
                return cell;
        }
        return null;
    }



//Needs to be changed/deleted
    checkSelectedCells(piece){
        let noSelected = true;
        for (let i = 0; i < this.cells.length; i++) {
            if (this.cells[i].getSelected() && this.cells[i] != null) {
                if(this.selectedCell != null  && this.cells[i] != this.selectedCell)
                    this.selectedCell.selected = false;
                this.selectedCell = this.cells[i];
                noSelected = false;
            }
        }
        if(this.selectedCell != null && this.selectedCell.selected ==false && piece == null){
            this.selectedCell = null;
        }
    }

    ignorePicks(){
        for (let i = 0; i < this.cells.length; i++) 
            this.cells[i].selected = false;
        //this.selectedCell = null;
        this.cellTexture.unbind();
    }

    resetBoard(){
        for (let i = 0; i < this.cells.length; i++) {
            this.cells[i].selected = false;
            this.cells[i].valid = false;
        }
    }

    displayCells(){
        for(let i = 0; i < this.cells.length ; i++)
            this.cells[i].display();
    }

	/**
	 * Displays the board in member scene
	 */
    display() {

        this.scene.pushMatrix();
        this.scene.translate(0, 0.3, 0);
        this.scene.rotate(Math.PI, 1,0,0);
        this.scene.rotate(Math.PI/2, 0,1,0);

        this.boardTexture.bind();
        this.base.display();
        this.scene.popMatrix();

    }
};