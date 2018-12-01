
/**
 * Class MyPrism represents a cylinder is composed by three objects (2 MyCylinderBase and 1 MyPrimsBody)
 */
class MyPrism extends CGFobject {

	/**
	 * Constructs an object of class MyPrism
	 * @param {Object} scene Scene in which the prism is represented
	 * @param {Object} slices Number of slices the prism will have, in other words, the number of sides of the polygon.
	 * @param {Object} stacks Number of stacks the prism will have
	 * @param {Object} height The distance between the top and base
     * @param {Object} radius The radius of the base
	 */
	constructor(scene, slices,stacks,height, radius) {
        super(scene);
        this.top = new MyCylinderBase(scene,slices,radius);
		this.base = new MyCylinderBase(scene,slices,radius);
        this.body = new MyPrismBody(this.scene,slices,stacks,height, radius);
		this.initBuffers();
	};


	/**
	 * Displays the prism in member scene
	 */
	display()
	{
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI/2,0,0,1);
        this.scene.rotate(Math.PI/2,0,1,0);
		this.body.display();
		this.scene.pushMatrix();
		this.scene.translate(0,0,this.body.height);
		this.top.display();
		this.scene.popMatrix();
		this.scene.pushMatrix();
		this.scene.scale(-1,1,1);
		this.base.display();
        this.scene.popMatrix();
        this.scene.popMatrix();
	}
};