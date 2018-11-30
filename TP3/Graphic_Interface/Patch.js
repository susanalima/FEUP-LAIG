/**
 * Class Patch is used to represent a patch primitive generated with NURBS
 */
class Patch extends CGFobject {
    /**
     * Constructor for class Patch
     * @param {Object} scene Scene where the object will be displayed
     * @param {Object} npoints_u Number of control vertexes in U
     * @param {Object} npoints_v  Number of control vertexes in V
     * @param {Object} nparts_u Division in parts of the U domain
     * @param {Object} nparts_v Division in parts of the V domain
     * @param {Object} controlPoints  Array of the control points
     */
    constructor(scene, npoints_u, npoints_v, nparts_u, nparts_v, controlPoints) {
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
        this.makeSurface();

    }

    /**
     * Calculates the control vertexes for this patch
     */
    getControlVertexes() {
        for (let j = 0; j < this.npoints_u; j++) {
            let tmpvert = [];
            for (let i = 0; i < this.npoints_v; i++) {
                this.controlPoints[i + j * this.npoints_v].push(1);
                tmpvert.push(this.controlPoints[i + j * this.npoints_v]);
            }
            this.controlVertexes.push(tmpvert);
        }
    }

    /**
     * Creates a new CGFnurbsObject from the information obtained
     */
    makeSurface() {
        var nurbsSurface = new CGFnurbsSurface(this.degree1, this.degree2, this.controlVertexes);
        this.patch = new CGFnurbsObject(this.scene, this.nparts_u, this.nparts_v, nurbsSurface);
    }

    /**
     * Displays the patch
     */
    display() {
        this.patch.display();
    }
}