
/**
 * Class MyBoard represents a board
 */
class MyBoard extends CGFobject {

	/**
	 * Constructs an object of class MyBoard
	 * @param {Object} scene Scene in which the board is represented
	 */
	constructor(scene) {
        super(scene);
        this.cells = [];
        this.cellsNumber = 61;
        this.map_radius = 4;
        this.cell_space_radius = 3;
        this.cell_radius = 2.8;
        this.createCells();
    };
    

    hex_to_pixel(q, r) {
        var x = (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r) * (this.cell_space_radius);
        var y = (0 * q + 3 / 2 * r) * this.cell_space_radius;
        return [x, y];
    }


    createCells() {
        for (var q = -this.map_radius; q <= this.map_radius; q++) {
			var r1 = Math.max(-this.map_radius, -q - this.map_radius);
			var r2 = Math.min(this.map_radius, -q + this.map_radius);
			for (var r = r1; r <= r2; r++) {
                let center = this.hex_to_pixel(q, r);
                let cell = new BoardCell(this.scene,this.cell_radius,center);
                this.cells.push(cell);
                console.log(center);
			}
		}
    }


	/**
	 * Displays the prism in member scene
	 */
	display()
	{
     this.scene.pushMatrix();
     for(let i = 0; i < this.cells.length; i++)
     {
         this.cells[i].display();
     }
     this.scene.popMatrix();
	}
};