/**
 * MyRectangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyRectangle extends CGFobject {

	constructor(scene, x1, y1, x2, y2, length_s, length_t) {
		super(scene);
		this.x1 = x1;
		this.x2 = x2;
		this.y1 = y1;
		this.y2 = y2;

		this.initBuffers();
	};

	initBuffers() {
		this.vertices = [
			this.x2, this.y2, 0,
			this.x1, this.y2, 0,
			this.x2, this.y1, 0,
			this.x1, this.y1, 0,
		];

		this.indices = [
			0, 1, 2,
			3, 2, 1,

		];

		this.normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
		];


		this.texCoords = [
			0, 0,
			0, Math.abs(this.y1-this.y2)/this.length_t,
			Math.abs(this.x1 - this.x2)/this.length_s, 0,
			Math.abs(this.x1 - this.x2)/this.length_s, Math.abs(this.y1-this.y2)/this.length_t,
		];



		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};
};