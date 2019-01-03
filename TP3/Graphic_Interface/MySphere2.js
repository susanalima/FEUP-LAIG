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
    }


    initVertices(){
        this.vertices.push(0,-this.radius,0);

        for(let i  = 0; i < this.slices; i++){
            let angle2 = this.angleSlices * i;
            let omega = this.radius*Math.cos(angle2);
            for(let j = 1; j < this.stacks - 1; j++){
                let angle = -Math.PI + this.angleStacks * j;
                let x = omega*this.radius * Math.cos(angle);
                let y = omega*this.radius * Math.sin(angle);
                let z = this.radius*Math.sin(angle2)*Math.cos(angle);

                this.vertices.push(x,y,z);
            }
        }
        this.vertices.push(0,this.radius,0);
    }
    
}