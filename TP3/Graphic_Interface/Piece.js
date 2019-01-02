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
		this.swaped = false;
		this.texture = texture;
		this.selectedText = sText;
		this.center = center;
		this.color = color;
		this.x = this.center[0];
		this.y = this.center[1];
		this.z = 0;
		this.animationTime = 1 * 1000;
		this.parabolic = null;
		this.playedCenter = [];
		this.initialize_values();
	};

	initialize_values()
	{
		if(this.swaped)
			this.swapText();
		this.lastTime = null;
		this.selected = false;
		this.locked = false 
		this.line = null;
		this.column = null;
		this.hasRequestedPlay = 0;
	}

	restart(){
		this.initialize_values();
	}

	update(currTime) {
		var deltaT;
		if (this.lastTime == null){
			deltaT = 0;
		}
		else {
			deltaT = currTime - this.lastTime;
		}
		if(this.parabolic != null && this.parabolic.end == false)
		{
			this.selected = false;
			this.parabolicAnimate(deltaT);
		}
			
		this.lastTime = currTime;
	}

	parabolicAnimate(deltaT){
		console.log('parabolicAnimate');
		if(this.parabolic.time > this.animationTime){
			this.parabolic.end = true;
			if(this.parabolic.reverse == false)
			{
				this.playedCenter = [this.x,this.y];
				this.locked = true;
			}
			if(this.parabolic.cell != null)
			{
				this.parabolic.cell.selected = false;
				this.line = this.parabolic.cell.line;
				this.column = this.parabolic.cell.column;
			}
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

	createParabolicAnimation(begin, height, end, cell, reverse){
		console.log('createParabolicAnimation')
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
			end: false,
			cell: cell,
			reverse: reverse,
		};
		

	}

	swapText(){
		let temp = this.selectedText;
		this.selectedText = this.texture;
		this.texture = temp;
		this.swaped = !this.swaped;
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
	display() {
		this.scene.pushMatrix();
		this.scene.rotate(-Math.PI / 2, 1, 0, 0);
		if (this.scene.pickIndex == this.scene.pickedIndex){
			this.selected = true;
		}
		
		if(this.locked)
			this.selected =false;

		/*if (this.selected && cell != null && this.parabolic == null)
			this.createParabolicAnimation([this.x, this.y], 10, [cell.x,cell.z]);*/
	
		this.texture.bind();


		this.update(this.scene.currTime);
		this.scene.translate(this.x, this.y, this.z);
		
		this.piece.display();
		this.scene.popMatrix();
	}
};