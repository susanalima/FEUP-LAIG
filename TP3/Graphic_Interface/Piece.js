/**
 * Class Piece represents a piece in the game
 */
class Piece extends CGFobject {

	/**
	 * Constructs an object of class Piece
	 * @param {Object} scene Scene in which the piece is represented
	 */
	constructor(scene) {
        super(scene);
        //(scene, slices, stacks, base, top, height)
        this.piece = new MyCylinder(scene,30,20,1.5,1.5,0.8);
    };

	/**
	 * Displays the piece in member scene
	 */
	display()
	{
	  this.scene.pushMatrix();
	  this.scene.rotate(-Math.PI/2,1,0,0);
      this.piece.display();
      this.scene.popMatrix();
	}
};