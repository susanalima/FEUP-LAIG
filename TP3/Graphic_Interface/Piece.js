/**
 * Class Piece represents a piece in the game
 */
class Piece extends CGFobject {

	/**
	 * Constructs an object of class Piece
	 * @param {Object} scene Scene in which the piece is represented
	 */
	constructor(scene, center, texture, color, sText) {
		super(scene);
		//(scene, slices, stacks, base, top, height)
		this.piece = new MyCylinder(scene, 30, 20, 1.5, 1.5, 0.8);
		this.texture = texture;
		this.selectedText = new CGFtexture(scene, "./scenes/images/selected_neon.jpg");
		this.visible = true;
		this.x = center[0];
		this.y = center[1];
		this.z = 0;
		this.selected = false;
		this.lastTime = null;
		this.animationTime = 1 * 1000;
		this.color = color;
		this.parabolic = null;
		this.locked = false //for when a piece is moved it cannot be moved anymore
	};

	update(currTime, cell) {
		var deltaT;
		if (this.lastTime == null){
			deltaT = 0;
		}
		else {
			deltaT = currTime - this.lastTime;
		}
		if(this.parabolic != null)
			this.parabolicAnimate(deltaT, cell);
		this.lastTime = currTime;
	}

	parabolicAnimate(deltaT, cell){
		if(cell != null)
			cell.selected = false;
		this.selected = false;
		
		if(this.parabolic.end)
			return;

		if(this.parabolic.time > this.animationTime){
			this.parabolic.end = true;
			this.selected = false;
			this.locked = true;
	
			return;
		}
	
		let timeX = this.parabolic.deltaX * deltaT /this.animationTime;
		let timeY = this.parabolic.deltaY * deltaT /this.animationTime;
		let timeZ = this.parabolic.maxZ * deltaT /this.animationTime;
		
		
		this.parabolic.time += deltaT;

		this.x += timeX;
		this.y += timeY;
		if(this.parabolic.time > (this.animationTime /2))	
			this.z -= timeZ;
		else
			this.z += timeZ;

		if(this.parabolic.time > this.animationTime){
			this.x = this.parabolic.endX;
			this.y = this.parabolic.endY;
			this.z = 0;
		}
	}

	createParabolicAnimation(begin, height, end){
		this.parabolic = {
			actualX: begin[0],
			actualZ: 0,
			actualY: begin[1],
			maxZ: height,
			endX: end[0],
			endY: end[1],
			deltaX: end[0] - begin[0],
			deltaY: end[1] - begin[1],
			time: 0,
			end: false
		};
		

	}

	swapText(){
		let temp = this.selectedText;
		this.selectedText = this.texture;
		this.texture = temp;
	}

	animate(cellPosition, deltaT) {
		let deltaX = cellPosition[0] - this.x;
		let deltaY = cellPosition[1] - this.y;
		//console.log("position:" + cellPosition[0] + ":" + cellPosition[1]);
		this.x += deltaX * deltaT / this.animationTime;
		this.y += deltaY * deltaT / this.animationTime;
	}

	/**
	 * Displays the piece in member scene
	 */
	display(cell, currTime) {
		this.scene.pushMatrix();
		this.scene.rotate(-Math.PI / 2, 1, 0, 0);
		if (this.scene.pickIndex == this.scene.pickedIndex){
			this.selected = !this.selected;
		
		}
		if (this.selected && cell != null && this.parabolic == null)
			this.createParabolicAnimation([this.x, this.y], 10, [cell.x,cell.z]);
	
		this.texture.bind();


		this.update(currTime, cell);
		this.scene.translate(this.x, this.y, this.z);
		
		this.piece.display();
		this.scene.popMatrix();
	}
};