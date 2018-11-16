class Plane extends CGFobject{
    
    constructor(scene, nparts_u, nparts_v){
        super(scene);
        this.scene = scene;
        this.degree1 = 1;
        this.degree2 = 1;
        this.nparts_u = nparts_u;
        this.nparts_v = nparts_v;
        let controlPoint1 = [-0.5, -0.5, 0, 1];
        let controlPoint2 = [-0.5, 0.5, 0, 1];
        let controlPoint3 = [0.5, -0.5, 0, 1];
        let controlPoint4 = [0.5, 0.5, 0, 1];
        this.controlPoints = [[controlPoint1,controlPoint2],[controlPoint3,controlPoint4]];
        this.makeSurface();
        this.initBuffers();
        this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
    }

    makeSurface(){
        var nurbsSurface = new CGFnurbsSurface(this.degree1, this.degree2, this.controlPoints);
        console.dir(this.controlPoints);
        this.plane = new CGFnurbsObject(this.scene, this.nparts_u, this.nparts_v, nurbsSurface);

    }

    display(){
        this.plane.display();
    }
}