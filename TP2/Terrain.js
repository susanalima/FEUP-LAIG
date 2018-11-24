/**
 * Class Terrain is used to represent a terrain primitive based in shaders
 */
class Terrain extends CGFobject{
    
    /**
     * Constructor for class Water
     * @param {Object} scene Scene where the object will be displayed
     * @param {Object} texture Texture visualized 
     * @param {Object} heightmap Texture for the heigt map
     * @param {Object} parts Number of divisions in s and t
     * @param {Object} heightscale Height factor
     */
    constructor(scene,texture,heightmap,parts,heightscale){
        super(scene);
        this.scene = scene;
        this.texture = texture;
        this.heightmap = heightmap;
        this.parts = parts;
        this.heightscale = heightscale;
        this.plane = new Plane(scene,parts,parts);
        this.testShader = new CGFshader(this.scene.gl,"vertexShader.vert", "fragShader.frag");
        this.testShader.setUniformsValues({uSampler2: 1});
        this.testShader.setUniformsValues({uSampler1: 2});
        this.testShader.setUniformsValues({normScale: this.heightscale});
    }

    /**
     * Displays the terrain
     */
    display(){
        this.scene.pushMatrix();
        this.scene.rotate(-Math.PI/2,1,0,0);
        this.scene.setActiveShader(this.testShader);
        this.scene.pushMatrix();
        this.texture.bind(2);
        this.heightmap.bind(1);
        this.plane.display();
        this.scene.popMatrix();
        this.scene.setActiveShader(this.scene.defaultShader);
        this.scene.popMatrix();
    }
}