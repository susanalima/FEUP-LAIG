/**
 * MyRectangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

/**
 * Class MyTriangle is used to represent triangles 
 */
class MyTriangle extends CGFobject
{
	/**
	 * 
	 * @param {Object} scene Scene where the object will be displayed
	 * @param {Object} x1 x coordinate for vertice 1
	 * @param {Object} y1 y coordinate for vertice 1
	 * @param {Object} z1 z coordinate for vertice 1
	 * @param {Object} x2 x coordinate for vertice 2
	 * @param {Object} y2 y coordinate for vertice 2
	 * @param {Object} z2 z coordinate for vertice 2
	 * @param {Object} x3 x coordinate for vertice 3
	 * @param {Object} y3 y coordinate for vertice 3
	 * @param {Object} z3 z coordinate for vertice 3
	 */
	constructor(scene,x1,y1,z1,x2,y2,z2,x3,y3,z3) 
	{
		super(scene);
		this.x1 = x1;
		this.x2 = x2;
		this.x3 = x3;
		this.y1 = y1;
		this.y2 = y2;
		this.y3 = y3;
		this.z1 = z1;
		this.z2 = z2;
		this.z3 = z3;

		let a = Math.sqrt(Math.pow((this.x1 - this.x3),2) + Math.pow((this.y1 - this.y3),2) + Math.pow((this.z1 - this.z3),2));
		let b =  Math.sqrt(Math.pow((this.x2 - this.x1),2) + Math.pow((this.y2 - this.y1),2) + Math.pow((this.z2 - this.z1),2));
		this.c =  Math.sqrt(Math.pow((this.x3 - this.x2),2) + Math.pow((this.y3 - this.y2),2) + Math.pow((this.z3 - this.z2),2));
		let cos_beta = (Math.pow(a,2) - Math.pow(b,2) + Math.pow(this.c,2))/(2*a*this.c);
		let sin_beta = Math.sqrt(1 - Math.pow(cos_beta,2));
		this.p1 = this.c - a*cos_beta;
		this.p2 = 1 - a*sin_beta;
		
		this.initBuffers();
	};

	/**
	 * Function used to define the vertices, indices, normals and texture coordinates for the object
	 */
	initBuffers()
	{
		this.vertices = [
			this.x1,this.y1,this.z1,
			this.x2,this.y2,this.z2,
			this.x3,this.y3,this.z3,
		];

		this.indices = [
			0,1,2,
		];

		this.normals = [
			0,0,1,
			0,0,1,
			0,0,1,
		];

	
		this.texCoords = [
			this.p1,this.p2,
			0,1,
			this.c,1
		];

			
		this.primitiveType=this.scene.gl.TRIANGLES;
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
			this.p1/length_s,(length_t -(1-this.p2))/length_t,
			0,1,
			this.c/length_s,1,
			this.p1/length_s,(length_t -(1-this.p2))/length_t,
			0,1,
			this.c/length_s,1
		];

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();

		
	};
};