
/**
 * Class BoardCell represents a board cell
 */
class BoardCell extends CGFobject {

	/**
	 * Constructs an object of class BoardCell
	 * @param {Object} scene Scene in which the board cell is represented
	 */
	constructor(scene, radius, center) {
        super(scene);
        this.cell = new MyPrism(scene,6,1,0.1,radius);
        this.x = center[0]; 
		this.z = center[1];
		this.texture = new CGFtexture(this.scene, "scenes/images/batman.jpg");
		this.flag = false;
    };

	/**
	 * Displays the cell in member scene
	 */
	display()
	{
		
		this.scene.pushMatrix();
		this.scene.translate(this.x,0,this.z);
		if(this.scene.pickIndex == this.scene.pickedIndex)
			this.texture.bind();
		this.cell.display();
		this.texture.unbind();
      	this.scene.popMatrix();
	}
};