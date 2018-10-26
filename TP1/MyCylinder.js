
/**
 * Class MyCilinder represents a cylinder is composed by three objects (2 MyCylinderBase and 1 MyCylinderBody)
 */
class MyCylinder extends CGFobject {

	/**
	 * Constructs an object of clas MyCylinder
	 * @param {*} scene Scene in which the cylinder is represented
	 * @param {*} slices Number of slices the cylinder will have, in other words, the number of sides of the polygon.
	 * @param {*} stacks Number of stacks the cylinder will have
	 * @param {*} base The radius of the base
	 * @param {*} top The radius of the top
	 * @param {*} height The distance between the top and base
	 */
	constructor(scene, slices, stacks, base, top, height) {
		super(scene);

		
		this.body = new MyCylinderBody(scene,slices,stacks,base,top,height);
		this.top = new MyCylinderBase(scene,slices,top);
		this.base = new MyCylinderBase(scene,slices,base);

		this.initBuffers();
	};

	/**
	 * Displays the cylinder in member scene
	 */
	display()
	{
		this.body.display();
		this.scene.pushMatrix();
		this.scene.translate(0,0,this.body.height);
		this.top.display();
		this.scene.popMatrix();
		this.scene.pushMatrix();
		this.scene.scale(-1,1,1);
		this.base.display();
		this.scene.popMatrix();
	}
};