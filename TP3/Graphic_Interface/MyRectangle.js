/**
 * MyRectangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

/**
 * Class MyRectangle is used to represent rectangles 
 */
class MyRectangle extends CGFobject {

	/**
	 * Class constructor for MyRectangle, vertices 1 and 2 are not adjacent
	 * @param {Object} scene Scene where the object will be displayed
	 * @param {Object} x1 x coordinate for vertice 1
	 * @param {Object} y1 y coordinate for vertice 1
	 * @param {Object} x2 x coordinate for vertice 2
	 * @param {Object} y2 y coordinate for vertice 2
	 */
	constructor(scene, x1, y1, x2, y2) {
		super(scene);
		this.x1 = x1;
		this.x2 = x2;
		this.y1 = y1;
		this.y2 = y2;

		this.p1 = Math.abs(this.x1-this.x2);
		this.p2 = Math.abs(this.y1-this.y2);

		this.initBuffers();
	};

	/**
	 * Function used to define the vertices, indices, normals and texture coordinates for the object
	 */
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
			1, 0,
			0, 1,
			1, 1,
		];



		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};

	/**
	 * Function used to update the texture coordinates of the object in relation to the texture factors being applied
	 * @param {Object} length_s Horizontal length of the texture
	 * @param {Object} length_t Vertical length of the texture
	 */
	updateTexCoordLength(length_s, length_t)
	{
		this.texCoords = [
			this.p1/length_s, 0,
			0,0,
			this.p1/length_s,this.p2/length_t,
			0, this.p2/length_t,
			
		];
		

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};
};