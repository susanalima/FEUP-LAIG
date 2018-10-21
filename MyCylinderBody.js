/**
 * MyCylinder (regular) to be changed 
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

/**
 * MyCylinderBodyClass is used to represent the side of a cylinder
 */
class MyCylinderBody extends CGFobject {
	/**
	 * Constructor for MyCylinderBody class
	 * @param {*} scene Scene where the object will be displayed
	 * @param {*} slices Number of slices of the cylinder, in other words, the number of sides of the polygon
	 * @param {*} stacks Number of stacks that constitute the cylinder.
	 * @param {*} base Radius of the base
	 * @param {*} top Radius of the top
	 * @param {*} height Length of the cylinder
	 */
	constructor(scene, slices, stacks, base, top, height) {
		super(scene);

		this.slices = slices;
		this.stacks = stacks;
		this.height = height;
		this.base = base;
		this.top = top;
		this.repeat = false;
		this.initBuffers();
	};

	/**
	 * Function used to define the vertices, indices, normals and texture coordinates for the object
	 */
	initBuffers() {
		this.vertices = [
		];

		this.indices = [
		];

		this.normals = [
		];

		this.texCoords = [
		];


		var angle = Math.PI * 2 / (this.slices);
		var newangle = 0;
		var x = 0;
		var y = 0;
		var z = 0;

		var count = 0;
		var v = 0;

		var delta = (this.base - this.top) / this.stacks;

		while (count <= this.slices) {
			v = 0;
			x = Math.cos(newangle);
			y = Math.sin(newangle);

			for (let i = 0; i <= this.stacks; i++) {
				this.vertices.push(x * (this.base - (delta * i)));
				this.vertices.push(y * (this.base - (delta * i)));
				this.vertices.push(this.height * v);

				v += 1 / this.stacks;
			}

			for (let i = 0; i <= this.stacks; i++) {
				this.normals.push(x);
				this.normals.push(y);
				this.normals.push(0);
			}

			newangle = newangle + angle;
			count++;
		}

		for (var i = 0; i <= this.slices * (this.stacks + 1); i += (this.stacks + 1)) {

			if (i == (this.slices) * (this.stacks + 1)) {
				for (var j = 0; j < this.stacks; j++) {

					this.indices.push(j + 1);
					this.indices.push(i + j);
					this.indices.push(j);
					this.indices.push(1 + j);
					this.indices.push(i + j + 1);
					this.indices.push(j + i);
				}
			}
			else {
				for (var j = 0; j < this.stacks; j++) {

					this.indices.push(i + j);
					this.indices.push(i + j + this.stacks + 1);
					this.indices.push(i + j + this.stacks + 1 + 1);

					this.indices.push(i + j + this.stacks + 1 + 1);
					this.indices.push(i + j + 1);
					this.indices.push(i + j);
				}
			}

		}

		for (let i = 0; i <= this.slices; i++) {
			for (let j = 0; j <= this.stacks; j++) {
				this.texCoords.push(i / (this.slices), j / this.stacks);
			}
		}



		console.log(this.indices);
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};

	/**
	 * Function used to rotate the cylinder sides by -180 degrees
	 */
	rotate() {
		this.scene.rotate(-Math.PI / 2, 1, 0, 0);
	};

};