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

		let v = 1;
		

		let a = Math.sqrt(Math.pow((this.x1 - this.x3),2) + Math.pow((this.y1 - this.y3),2) + Math.pow((this.z1 - this.z3),2));
		let b =  Math.sqrt(Math.pow((this.x2 - this.x1),2) + Math.pow((this.y2 - this.y1),2) + Math.pow((this.z2 - this.z1),2));
		let c =  Math.sqrt(Math.pow((this.x3 - this.x2),2) + Math.pow((this.y3 - this.y2),2) + Math.pow((this.z3 - this.z2),2));
		let cos_beta = (Math.pow(a,2) - Math.pow(b,2) + Math.pow(c,2))/(2*a*c);
		let sin_beta = Math.sqrt(1 - Math.pow(cos_beta,2));
		let p1 = c - a*cos_beta;
		let p2 = v - a*sin_beta;

		this.texCoords = [
			p1,p2,
			0,v,
			c,v
		];

			
		this.primitiveType=this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};


	//TODO
	updateTexCoordLength(length_s, length_t)
	{
		let v = 1;
		
		let a = Math.sqrt(Math.pow((this.x1 - this.x3),2) + Math.pow((this.y1 - this.y3),2) + Math.pow((this.z1 - this.z3),2));
		let b =  Math.sqrt(Math.pow((this.x2 - this.x1),2) + Math.pow((this.y2 - this.y1),2) + Math.pow((this.z2 - this.z1),2));
		let c =  Math.sqrt(Math.pow((this.x3 - this.x2),2) + Math.pow((this.y3 - this.y2),2) + Math.pow((this.z3 - this.z2),2));
		let cos_beta = (Math.pow(a,2) - Math.pow(b,2) + Math.pow(c,2))/(2*a*c);
		let sin_beta = Math.sqrt(1 - Math.pow(cos_beta,2));
		let p1 = (c - a*cos_beta)/length_s;
		let p2 = (length_t - a*sin_beta)/length_t;

		this.texCoords = [
			p1,p2,
			0,v,
			c/length_s,v,
			p1,p2,
			0,v,
			c/length_s,v
		];
	};
};