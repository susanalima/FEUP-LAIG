class MyCylinder extends CGFobject {

	constructor(scene, slices, stacks, base, top, height) {
		super(scene);

		
		this.body = new MyCylinderBody(scene,slices,stacks,base,top,height);
		this.top = new MyCylinderBase(scene,slices,top);
		this.base = new MyCylinderBase(scene,slices,base);

		this.initBuffers();
	};

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