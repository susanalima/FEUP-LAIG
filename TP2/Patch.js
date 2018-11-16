class Patch extends CGFobject{
    
    constructor(scene, npoints_u, npoints_v, nparts_u, nparts_v, controlPoints){
        super(scene);
        this.scene = scene;
        this.degree1 = npoints_u - 1;
        this.degree2 = npoints_v - 1;
        this.npoints_u = npoints_u;
        this.npoints_v = npoints_v;
        this.nparts_u = nparts_u;
        this.nparts_v = nparts_v;
        this.controlPoints = controlPoints;
        this.controlVertexes = [];
        this.getControlVertexes();
        //console.dir(this.controlVertexes);
        this.makeSurface();
       
    }

    getControlVertexes()
    {
        for(let j = 0; j < this.npoints_u; j++)
        {
            let tmpvert = [];
            for(let i = 0; i < this.npoints_v; i++ ){
                this.controlPoints[i + j*this.npoints_v].push(1);
                tmpvert.push(this.controlPoints[i + j*this.npoints_v]);
            }
               
            this.controlVertexes.push(tmpvert);
        }
         
    }

    makeSurface(){
        var nurbsSurface = new CGFnurbsSurface(this.degree1,this.degree2, this.controlVertexes);
        this.patch = new CGFnurbsObject(this.scene, this.nparts_u, this.nparts_v, nurbsSurface);

    }

    display(){
        this.patch.display();
    }
}