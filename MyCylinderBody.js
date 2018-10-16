/**
 * MyCylinder (regular) to be changed 
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyCylinderBody extends CGFobject
{
	constructor(scene, slices, stacks, base,top,height)
	{
		super(scene);

		this.slices = slices;
		this.stacks = stacks;
		this.height = height;
		this.base = base;
		this.top = top;

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


		var angle = Math.PI*2/(this.slices);
		var newangle = 0;
		var x = 0;
		var y = 0;
		var z = 0;

		var count = 0;
		var v = 0;

		var delta = (this.base - this.top)/this.stacks;
		
		while(count < this.slices)
		{
			v = 0;
			x = Math.cos(newangle);
			y = Math.sin(newangle);
			
			for(var i = 0; i <= this.stacks; i++)
			{
				this.vertices.push(x * (this.base - (delta * i)));
				this.vertices.push(y * (this.base - (delta * i)));
				this.vertices.push(this.height*v);
				
				v += 1/this.stacks;
			}
	
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

					this.indices.push(j+1);
					this.indices.push(i+j);
					this.indices.push(j);
					this.indices.push(1+j);
					this.indices.push(i+j+1);
					this.indices.push(j+i);
				}
			}
			else
			{
				for(var j = 0; j < this.stacks; j++)
				{					
					
					this.indices.push(i+j);
					this.indices.push(i+j+this.stacks+1);
					this.indices.push(i+j+this.stacks+1+1);
					
					this.indices.push(i+j+this.stacks+1+1);
					this.indices.push(i+j+1);
					this.indices.push(i+j);
				}
			}

		}

	
		
			
			/*for (var i = 0; i < this.slices; i++) 
			{
					this.texCoords.push(0);
					this.texCoords.push(0);
					
					this.texCoords.push(0);
					this.texCoords.push(i * 1/this.slices);
					
					this.texCoords.push(i* 1/this.slices);
					this.texCoords.push(0);

					this.texCoords.push(i* 1/this.slices);
					this.texCoords.push(i* 1/this.slices);
				
			}*/
		
			
			var s = 0;
			var t = 0;
		
			for (var i = 0; i < this.slices; i++) {
			  for (var j = 0; j <= this.stacks; j++) {
				this.texCoords.push( t,s);
				s += 1 / this.stacks;
			  }
			  s = 0;
			  t += 1 / this.slices;
			}
			
		
		
		console.log(this.indices);
		this.primitiveType=this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};

		rotate()
		{
			this.scene.rotate(-Math.PI/2,1,0,0);
		};

};