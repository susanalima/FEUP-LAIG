/**
 * MyRectangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyTriangle extends CGFobject
{
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