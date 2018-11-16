class Patch extends CGFobject{
    
    constructor(scene, nparts_u, nparts_v){
        super(scene);
        this.scene = scene;
        this.degree1 = 1;
        this.degree2 = 1;
        this.nparts_u = nparts_u;
        this.nparts_v = nparts_v;
        
        this.controlPoints;
        this.makeSurface();
       
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