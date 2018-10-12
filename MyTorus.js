/**
 * MyCylinder (regular) to be changed 
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyTorus extends CGFobject
{
	constructor(scene, slices, stacks, rad,length)
	{
		super(scene);

		this.slices = slices;
		this.stacks = stacks;
		this.rad = rad;
		this.length = length;

		this.initBuffers();
	};


	initBuffers()
	{
		this.vertices = [
		];

		this.indices = [
		];

		this.normals = [
		];

		this.texCoords = [
		];


	
		
		console.log(this.indices);
		this.primitiveType=this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};

	
};