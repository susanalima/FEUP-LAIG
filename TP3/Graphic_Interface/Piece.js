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
		this.piece = new MyCylinder(scene, 30, 20, 1.5, 1.5, 0.8);
		this.texture = texture;
		this.visible = true;
		this.x = center[0];
		this.y = center[1];
		this.selected = false;
		this.lastTime = null;
		this.animationTime = 1 * 1000;
	};

	update(cellPosition, currTime) {
		var deltaT;
		if (this.lastTime == null)
			deltaT = 0;
		else {
			deltaT = currTime - this.lastTime;
		}
		this.animate(cellPosition, deltaT);
		this.lastTime = currTime;
	}



	animate(cellPosition, deltaT) {
		let deltaX = cellPosition[0] - this.x;
		let deltaY = cellPosition[1] - this.y;
		console.log("position:" + cellPosition[0] + ":" + cellPosition[1]);
		this.x += deltaX * deltaT / this.animationTime;
		this.y += deltaY * deltaT / this.animationTime;
	}

	/**
	 * Displays the piece in member scene
	 */
	display(cell, currTime) {
		this.scene.pushMatrix();
		this.scene.rotate(-Math.PI / 2, 1, 0, 0);
		if (this.scene.pickIndex == this.scene.pickedIndex)
			this.selected = !this.selected;
		if (this.selected && cell != null)
			this.update([cell.x,cell.z], currTime);

		this.scene.translate(this.x, this.y, 0);
		this.texture.bind();
		this.piece.display();
		this.scene.popMatrix();
	}
};