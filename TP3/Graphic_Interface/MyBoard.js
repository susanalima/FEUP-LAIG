/**
 * Class MyBoard represents a board
 */
class MyBoard extends CGFobject {


//TODO MUDAR VALORES PARA SEREM RECEBIDOS COMO PARAMETRO

    /**
 	 * Constructs an object of class MyBoard
	 * @param {Object} scene Scene in which the board is represented
     * @param {Object} boardTexture 
     * @param {Object} cellTexture 
     */
	constructor(scene,boardTexture,cellTexture) {
        super(scene);
        this.cells = [];
        this.cellsNumber = 61;
        this.map_radius = 4;
        this.cell_space_radius = 3;
        this.cell_radius = 2.5;
        this.createCells();
        this.base = new MyPrism(scene,6,1,0.5,25);
        this.boardTexture = boardTexture;
        this.cellTexture = cellTexture;

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
    createCells() {
        for (var q = -this.map_radius; q <= this.map_radius; q++) {
			var r1 = Math.max(-this.map_radius, -q - this.map_radius);
			var r2 = Math.min(this.map_radius, -q + this.map_radius);
			for (var r = r1; r <= r2; r++) {
                let center = this.hex_to_pixel(q, r);
                let cell = new BoardCell(this.scene,this.cell_radius,center);
                this.cells.push(cell);
			}
		}
    }

    checkSelectedCells(){
        let p1 = -1, p2 = -1;
        for(let i = 0; i < this.cells.length; i++){
            if(this.cells[i].getSelected()){
                if(p1 != -1)
                    p2 = i;
                else
                    p1 = i;
            }
        }
        if(p1 != -1 && p2 != -1)
            {
                this.cells[p1].selected = false;
                this.cells[p2].selected = false;
                console.log("Pieces received x1: " + this.cells[p1].x + " y1: " + this.cells[p1].z + "\n");
                console.log("x2: " + this.cells[p2].x + " y2: " + this.cells[p2].z + "\n");
            }

    }

	/**
	 * Displays the board in member scene
	 */
	display()
	{
     this.scene.pushMatrix();

     this.scene.pushMatrix();
     this.scene.rotate(Math.PI/2,0,1,0);
     this.scene.translate(0,-0.5,0);
     this.boardTexture.bind();
     this.base.display();
     this.scene.popMatrix();


     this.scene.pushMatrix();
     this.cellTexture.bind();
     for(let i = 0; i < this.cells.length; i++)
     {
         this.scene.registerForPick(++this.scene.pickIndex, this.cells[i]);
         this.cells[i].display();
     }
     this.checkSelectedCells();
     this.scene.popMatrix();
     this.scene.popMatrix();
	}
};