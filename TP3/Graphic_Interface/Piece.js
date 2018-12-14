/**
 * Class Piece represents a piece in the game
 */
class Piece extends CGFobject {

	/**
	 * Constructs an object of class Piece
	 * @param {Object} scene Scene in which the piece is represented
	 */
	constructor(scene, center, texture) {
        super(scene);
        //(scene, slices, stacks, base, top, height)
		this.piece = new MyCylinder(scene,30,20,1.5,1.5,0.8);
		this.texture = texture;
		this.visible = true;
		this.x = center[0];
		this.y = center[1];
    };

	/**
	 * Displays the piece in member scene
	 */
	display()
	{
	  this.scene.pushMatrix();
	  this.scene.rotate(-Math.PI/2,1,0,0);
	  this.scene.translate(this.x, this.y, 0);
	  this.texture.bind();
	  this.piece.display();
      this.scene.popMatrix();
	}
};