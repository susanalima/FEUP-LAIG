class MySphere2 extends CGFobject
{
	/**
	 * Class constructor for MySphere
	 * @param {Object} scene Scene where the object will be displayed
	 * @param {Object} slices Number of slices of the sphere
	 * @param {Object} stacks Number of stacks of the sphere
	 * @param {Object} radius The radius of the sphere
	 */
	constructor(scene, slices, stacks, radius)
	{
		super(scene);

		this.slices = slices;
		this.stacks = stacks;
		this.radius = radius;
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
        
        this.angleStacks = Math.PI/this.stacks;
        this.angleSlices = 2*Math.PI/this.slices;

        this.initVertices();
        this.initNormals();
        this.initIndices();
        console.log(this.vertices);
        console.log(this.indices);

        this.primitiveType=this.scene.gl.TRIANGLES;
		this.initGLBuffers();
    }


    initVertices(){
        this.vertices.push(0,-this.radius,0);

        for(let i  = 0; i < this.slices; i++){
            let angle2 = this.angleSlices * i;
            let omega = Math.cos(angle2);
            for(let j = 1; j < this.stacks; j++){
                let angle = -Math.PI + this.angleStacks * j;
                let x = omega*this.radius * Math.cos(angle);
                let y = omega*this.radius * Math.sin(angle);
                let z = this.radius*Math.sin(angle2)*Math.cos(angle);

                this.vertices.push(x,y,z);
            }
        }
        this.vertices.push(0,this.radius,0);
    }

    initNormals(){
        this.normals.push(0,-1,0);
        for(let i  = 0; i < this.slices; i++){
            let angle2 = this.angleSlices * i;
            let omega = this.radius*Math.cos(angle2);
            for(let j = 1; j < this.stacks; j++){
                let angle = -Math.PI + this.angleStacks * j;
                let x = omega* Math.cos(angle);
                let y = omega* Math.sin(angle);
                let z = Math.sin(angle2)*Math.cos(angle);

                this.normals.push(x,y,z);
            }
        }
        this.normals.push(0,1,0);
    }

    initIndices(){
        for(let i = 0 ; i < this.slices -1 ; i++){
            this.indices.push(0, (i+1) * this.stacks, i * (this.stacks-1) + 1);
            for(let j = 1; j < this.stacks-1; j++){
                this.indices.push((this.stacks-1) * i + j, (this.stacks-1) * (i+1) + j, (this.stacks-1) * (i+1) + j+1);
                this.indices.push((this.stacks-1) * i + j, (this.stacks-1) * (i+1) + j+1, (this.stacks-1) * i + j+1);
            }
            this.indices.push(this.slices * this.stacks, i*this.stacks + this.stacks - 1, (i+1) * this.stacks + this.stacks -1);
        }

        this.indices.push(0, 1,this.slices * this.stacks - this.stacks -1);
        for(let j = 1; j < this.stacks-1; j++){
            this.indices.push(j, (this.stacks-1) * this.slices-1 + j + 1, (this.stacks-1) * this.slices-1 + j);
            this.indices.push(j, j+1, (this.stacks-1) * this.slices-1 + j + 1);
        }
        this.indices.push(this.slices * this.stacks, this.slices*this.stacks-1, this.stacks-1);
    }

    display()
	{
		this.scene.pushMatrix();
		this.scene.rotate(Math.PI/2,1,0,0);
		super.display();
		this.scene.popMatrix();
	}
    
}