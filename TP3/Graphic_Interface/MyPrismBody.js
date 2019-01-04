/**
 * MyPrismBody (regular)
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyPrismBody extends CGFobject
{
	constructor(scene, slices, stacks, height, radius)
	{
		super(scene);

		this.slices = slices;
		this.stacks = stacks;
		this.height = height;
		this.radius = radius;

		this.initBuffers();
	};


/**
 * Initializes vertices, normals and indices of the object
 */
	initBuffers()
	{
		this.vertices = [
		];

		this.indices = [
		];

		this.normals = [
		];


		var angle = Math.PI*2/(this.slices);
		var newangle = 0;
		var x = 0;
		var y = 0;
		var z = 0;

		var count = 0;
		var v = 0;
		while(count < this.slices)
		{
			v = 0;
			x = this.radius*Math.cos(newangle);
			y = this.radius*Math.sin(newangle);
			
			for(var i = 0; i <= this.stacks; i++)
			{
				this.vertices.push(x);
				this.vertices.push(y);
				this.vertices.push(v);
				v += this.height/this.stacks;
			}
			
	
			x = Math.cos(newangle+angle/2);
			y = Math.sin(newangle+angle/2);

			for(var i = 0; i <= this.stacks; i++)
			{
				this.normals.push(x);
				this.normals.push(y);
				this.normals.push(0);
			}

			newangle = newangle + angle;
			count++;
		}

		newangle = 0;
		count = 0;

		while(count < this.slices)
		{
			v = 0;
			x = this.radius*Math.cos(newangle);
			y = this.radius*Math.sin(newangle);
			
			for(var i = 0; i <= this.stacks; i++)
			{
				this.vertices.push(x);
				this.vertices.push(y);
				this.vertices.push(v);
				v += this.height/this.stacks;
			}
			
	
			x = Math.cos(newangle-angle/2);
			y = Math.sin(newangle-angle/2);

			for(var i = 0; i <= this.stacks; i++)
			{
				this.normals.push(x);
				this.normals.push(y);
				this.normals.push(0);
			}
			
			newangle = newangle + angle;
			count++;
		}


		for (var i = 0; i < this.slices*(this.stacks+1); i+=(this.stacks+1))
		{

			if(i == (this.slices-1)*(this.stacks+1))
			{
				for(var j = 0; j < this.stacks; j++)
				{
					this.indices.push(i+j);
					this.indices.push(i+j+this.stacks+1);
					this.indices.push(i+j+this.stacks+2);

					this.indices.push(i+j);
					this.indices.push(i+j+this.stacks+2);
					this.indices.push(i+j+1);
				}
			}
			else
			{
				for(var j = 0; j < this.stacks; j++)
				{					

					this.indices.push((i+j+(1+this.stacks)*this.slices) + this.stacks+1+1);
					this.indices.push(i+j+1);
					this.indices.push(i+j);
					
					this.indices.push(i+j);
					this.indices.push(i+j+((1+this.stacks)*this.slices) + this.stacks+1);
					this.indices.push(i+j+((1+this.stacks)*this.slices) + this.stacks+1+1);

				}
			}

		}
	
		this.primitiveType=this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};

};