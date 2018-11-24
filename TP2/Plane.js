
/**
 * Class Plane is used to represent a plane primitive generated with NURBS
 */
class Plane extends CGFobject {

    /**
     * Constructor for class Plane
     * @param {Object} scene Scene where the object will be displayed
     * @param {Object} nparts_u Division in parts of the U domain
     * @param {Object} nparts_v Division in parts of the V domain
     */
    constructor(scene, nparts_u, nparts_v) {
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
        this.controlPoints = [[controlPoint1, controlPoint2], [controlPoint3, controlPoint4]];
        this.makeSurface();
    }

    /**
     * Creates a new CGFnurbsObject from the information obtained
     */
    makeSurface() {
        var nurbsSurface = new CGFnurbsSurface(this.degree1, this.degree2, this.controlPoints);
        this.plane = new CGFnurbsObject(this.scene, this.nparts_u, this.nparts_v, nurbsSurface);
    }

    /**
     * Displays the plane
     */
    display() {
        this.plane.display();
    }
}