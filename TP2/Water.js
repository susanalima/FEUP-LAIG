/**
 * Class Water is used to represent a water primitive based in shaders
 */
class Water extends CGFobject {

    /**
     * Constructor for class Water
     * @param {Object} scene Scene where the object will be displayed
     * @param {Object} texture Texture visualized 
     * @param {Object} wavemap Texture for the wave map
     * @param {Object} parts Number of divisions in s and t
     * @param {Object} heightscale Height factor
     * @param {Object} textscale Scale factor for the texture coordinates
     */
    constructor(scene, texture, wavemap, parts, heightscale, textscale) {
        super(scene);
        this.scene = scene;
        this.texture = texture;
        this.wavemap = wavemap;
        this.parts = parts;
        this.heightscale = heightscale;
        this.textscale = textscale;
        this.plane = new Plane(scene, this.parts, this.parts);
        this.wave_time = 2;
        this.lastTime = null;
        this.testShader = new CGFshader(this.scene.gl, "waterShader.vert", "waterShader.frag");
        this.testShader.setUniformsValues({ uSampler2: 1 });
        this.testShader.setUniformsValues({ uSampler1: 2 });
        this.testShader.setUniformsValues({ normScale: this.heightscale });
        this.testShader.setUniformsValues({ textscale: this.textscale });
    }

    /**
     * Displays the water, updates the testShader timeFactor value
     */
    display() {
        this.scene.pushMatrix();
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        let timeFactor = (Math.sin((this.scene.currTime / 10000) % 512 * 2));
        this.testShader.setUniformsValues({ time: timeFactor });
        this.scene.setActiveShader(this.testShader);
        this.scene.pushMatrix();
        this.texture.bind(2);
        this.wavemap.bind(1);
        this.texture.bind();
        this.plane.display();
        this.scene.popMatrix();
        this.scene.setActiveShader(this.scene.defaultShader);
        this.scene.popMatrix();
    }
}