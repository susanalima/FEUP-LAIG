
// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var AMBIENT_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var PRIMITIVES_INDEX = 7;
var COMPONENTS_INDEX = 8;

/**
* MySceneGraph class, representing the scene graph.
*/
class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.nodes = [];

        this.idRoot = null;                    // The id of the root element.

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading 
        this.reader = new CGFXMLreader();

        /*
        * Read the contents of the xml file, and refer to this class for loading and error handlers.
        * After the file is read, the reader calls onXMLReady on this object.
        * If any error occurs, the reader calls onXMLError on this object, with an error message
        */

        this.reader.open('scenes/' + filename, this);
    }


    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /**
    * Parses the XML file, processing each block.
    * @param {XML root element} rootElement
    */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "yas")
            return "root tag <yas> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <scene>
        var index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order");

            //Parse scene block
            if ((error = this.parseScene(nodes[index])) != null)
                return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse views block 
            if ((error = this.parseViews(nodes[index])) != null)
                return error;
        }


        // <ambient>
        if ((index = nodeNames.indexOf("ambient")) == -1)
            return "tag <views> missing";
        else {
            if (index != AMBIENT_INDEX)
                this.onXMLMinorError("tag <ambient> out of order");

            //Parse ambient block
            if ((error = this.parseAmbient(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }


        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return "tag <transformations> missing";
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError("tag <transformations> out of order");

            //Parse transformations block
            if ((error = this.parseTransformations(nodes[index])) != null)
                return error;
        }

        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) == -1)
            return "tag <primitives> missing";
        else {
            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");

            //Parse primitives block
            if ((error = this.parsePrimitives(nodes[index])) != null)
                return error;
        }

        // <components>
        if ((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
        else {
            if (index != COMPONENTS_INDEX)
                this.onXMLMinorError("tag <components> out of order");

            //Parse components block
            if ((error = this.parseComponents(nodes[index])) != null)
                return error;
        }

    }


    /**
    * Parses the <scene> block. 
    * @param {scene block element} sceneNode
    */
    parseScene(sceneNode) {
        var nodeNames = [];

        this.root = this.reader.getString(sceneNode, 'root');
        this.axisLength = this.reader.getFloat(sceneNode, 'axis_length');

        if (this.root == null) {
            this.root = "scene_root";
            this.onXMLMinorError("unable to parse value for scene root; assuming 'root = scene_root'");
        }
        else if (!(this.axisLength != null && !isNaN(this.axisLength))) {
            this.axisLength = 10.0;
            this.onXMLMinorError("unable to parse value for axisLength; assuming 'far = 10.0'");
        }

        this.log("Parsed scene");
        return null;
    }


    /**
    * Parses the <views> block. 
    * @param {views block element} viewsNode
    */
    parseViews(viewsNode) {
        var children = viewsNode.children;
        this.views = {
            default: null,
            orthos: [],
            perspectives: []
        }
        var numViews = 0;
        var error;

        //nao sei pode ser este o valor de default  
        var def = this.reader.getString(viewsNode, 'default');
        if (def == null) {
            this.onXMLMinorError("unable to parse value for views default; assuming 'default = default'");
        }
        else
            this.views.default = def;

        for (var i = 0; i < children.length; i++) {

            switch (children[i].nodeName) {
                case "perspective":
                    if ((error = this.parseViewsPerspective(children, i)) != null)
                        return error;
                    break;
                case "ortho":
                    if ((error = this.parseViewsOrtho(children, i)) != null)
                        return error;
                    break;
                default:
                    this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                    continue;
            }
            numViews++;
        }

        if (numViews == 0)
            return "at least one view must be defined";

        this.log("Parsed views");
        return null;
    }


    parseViewsPerspective(children, index) {
        var grandChildren = [];
        var perspective = {
            near: 0.1,
            far: 1000,
            angle: 60,
            fromPosition: [],
            toPosition: []
        }
        var error;
        //get the id of current perspective
        var perspectiveId = this.reader.getString(children[index], 'id');
        if (perspectiveId == null)
            return "no ID defined for view";

        // Checks for repeated IDs.
        if (this.views.perspectives[perspectiveId] != null)
            return "ID must be unique for each view (conflict: ID = " + perspectiveId + ")";

        //get the near value of current perspective
        perspective.near = this.reader.getFloat(children[index], 'near');
        if (perspective.near == null)
            return "no near defined for perspective";

        //get the far value of current perspective
        perspective.far = this.reader.getFloat(children[index], 'far');
        if (perspective.far == null)
            return "no far defined for perspective";

        //get the angle value of current perspective
        perspective.angle = this.reader.getFloat(children[index], 'angle');
        if (perspective.angle == null)
            return "no angle defined for perspective";

        grandChildren = children[index].children;
        if (grandChildren.length != 2)
            return "incorrect number of children of perspective";

        var nodeNames = [];
        for (var j = 0; j < grandChildren.length; j++) {
            nodeNames.push(grandChildren[j].nodeName);
        }

        var fromIndex = nodeNames.indexOf("from");
        var toIndex = nodeNames.indexOf("to");

        if (fromIndex == -1)
            return "perspective's from position undefined for ID = " + perspectiveId;

        if (toIndex == -1)
            return "perspective's to position undefined for ID = " + perspectiveId;

        //reads the from position
        error = this.parseAndValidateXYZvalues(grandChildren, fromIndex, perspectiveId, "from", "perspective", perspective.fromPosition);
        if (error != null)
            return error;
        //reads the to position
        this.parseAndValidateXYZvalues(grandChildren, toIndex, perspectiveId, "to", "perspective", perspective.toPosition);
        if (error != null)
            return error;


        this.views.perspectives[perspectiveId] = this.createCameraPerspective(perspective);

        return null;
    }

    //TODO FALTA VALIDAR OS PARAMETROS
    parseViewsOrtho(children, index) {
        var grandChildren = [];
        var ortho = {
            near: 0.1,
            far: 1000,
            left: null,
            right: null,
            top: null,
            bottom: null,
            fromPosition: [],
            toPosition: []
        }

        var error;
        //get the id of current ortho
        var orthoId = this.reader.getString(children[index], 'id');
        if (orthoId == null)
            return "no ID defined for view";

        // Checks for repeated IDs.
        if (this.views.orthos[orthoId] != null)
            return "ID must be unique for each view (conflict: ID = " + orthoId + ")";

        //get the near value of current ortho
        ortho.near = this.reader.getFloat(children[index], 'near');
        if (ortho.near == null)
            return "no near defined for ortho";

        //get the far value of current ortho
        ortho.far = this.reader.getFloat(children[index], 'far');
        if (ortho.far == null)
            return "no far defined for ortho";

        //get the left value of current ortho
        ortho.left = this.reader.getFloat(children[index], 'left');
        if (ortho.left == null)
            return "no left defined for ortho";

        //get the right value of current ortho
        ortho.right = this.reader.getFloat(children[index], 'right');
        if (ortho.right == null)
            return "no right defined for ortho";

        //get the top value of current ortho
        ortho.top = this.reader.getFloat(children[index], 'top');
        if (ortho.top == null)
            return "no top defined for ortho";

        //get the bottom value of current ortho
        ortho.bottom = this.reader.getFloat(children[index], 'bottom');
        if (ortho.bottom == null)
            return "no bottom defined for ortho";

        grandChildren = children[index].children;
        if (grandChildren.length != 2)
            return "incorrect number of children of ortho";

        var nodeNames = [];
        for (var j = 0; j < grandChildren.length; j++) {
            nodeNames.push(grandChildren[j].nodeName);
        }

        var fromIndex = nodeNames.indexOf("from");
        var toIndex = nodeNames.indexOf("to");

        if (fromIndex == -1)
            return "ortho's from position undefined for ID = " + orthoId;

        if (toIndex == -1)
            return "ortho's to position undefined for ID = " + orthoId;

        //reads the from position
        error = this.parseAndValidateXYZvalues(grandChildren, fromIndex, orthoId, "from", "ortho", ortho.fromPosition);
        if (error != null)
            return error;
        //reads the to position
        this.parseAndValidateXYZvalues(grandChildren, toIndex, orthoId, "to", "ortho", ortho.toPosition);
        if (error != null)
            return error;

        this.views.orthos[orthoId] = this.createCameraOrtho(ortho);


        return null;
    }


    createCameraPerspective(perspective) {
        var camera = new CGFcamera(0.4, perspective.near, perspective.far, perspective.fromPosition, perspective.toPosition);
        return camera;
    }

    //TODO MUDAR CAMARA PARA SER ORTHO
    createCameraOrtho(ortho) {
        var camera = new CGFcamera(0.4, ortho.near, ortho.far, ortho.fromPosition, ortho.toPosition);
        return camera;
    }


    //TODO  MUDAR PARA USAR AS OUTRAS FUNCOES, VER CENA DOS VALORES DE DEFAULT
    /**
    * Parses the <ambient> block. 
    * @param {ambient block element} ambientNode
    */
    parseAmbient(ambientNode) {
        this.ambientAmbient = [];
        this.backgroundAmbient = [];
        var children = ambientNode.children;
        var nodeNames = [];
        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        //get and validate the ambient values
        var { x, y, z, w } = this.parsePointRGBA(children, ambientIndex);
        if (!this.validateFloat(x)) {
            x = 0;
            this.onXMLMinorError("unable to parse r-value for ambient ambient; assuming 'r = 0'");
        }
        if (!this.validateFloat(y)) {
            y = 0;
            this.onXMLMinorError("unable to parse g-value for ambient ambient; assuming 'g = 0'");
        }
        if (!this.validateFloat(z)) {
            z = 0;
            this.onXMLMinorError("unable to parse b-value for ambient ambient; assuming 'b = 0'");
        }
        if (!this.validateFloat(w)) {
            w = 1;
            this.onXMLMinorError("unable to parse a-value for ambient ambient; assuming 'a = 1'");
        }
        this.ambientAmbient.push(x, y, z, w);

        //get and validate the backgound values
        var { x, y, z, w } = this.parsePointRGBA(children, backgroundIndex);
        if (!this.validateFloat(x)) {
            x = 0;
            this.onXMLMinorError("unable to parse r-value for ambient background; assuming 'r = 0'");
        }
        if (!this.validateFloat(y)) {
            y = 0;
            this.onXMLMinorError("unable to parse g-value for ambient background; assuming 'g = 0'");
        }
        if (!this.validateFloat(z)) {
            z = 0;
            this.onXMLMinorError("unable to parse b-value for ambient background; assuming 'b = 0'");
        }
        if (!this.validateFloat(w)) {
            w = 1;
            this.onXMLMinorError("unable to parse a-value for ambient background; assuming 'a = 1'");
        }
        this.backgroundAmbient.push(x, y, z, w);

        this.log("Parsed ambient");
        return null;
    }


    /**
    * Parses the <lights> node.
    * @param {lights block element} lightsNode
    */
    parseLights(lightsNode) {
        var children = lightsNode.children;
        this.omnis = [];
        this.spots = [];
        var numLights = 0;
        var error;

        for (var i = 0; i < children.length; i++) {
            switch (children[i].nodeName) {
                case "omni":
                    error = this.parseLightsOmni(children, i);
                    if (error != null)
                        return error;
                    break;
                case "spot":
                    error = this.parseLightsSpot(children, i);
                    if (error != null)
                        return error;
                    break;
                default:
                    this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                    continue;
            }
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";

        this.log("Parsed lights");
        return null;
    }



    parseLightsOmni(children, index) {
        var grandChildren = [];
        var error;
        //get the id of current light
        var omniId = this.reader.getString(children[index], 'id');
        if (omniId == null)
            return "no ID defined for light";

        // Checks for repeated IDs.
        if (this.omnis[omniId] != null)
            return "ID must be unique for each light (conflict: ID = " + omniId + ")";

        //get the enabled value of current omni
        var enabled = this.reader.getFloat(children[index], 'enabled');
        if (enabled == null)
            return "no enabled defined for omni";

        grandChildren = children[index].children;

        var nodeNames = [];
        for (var j = 0; j < grandChildren.length; j++) {
            nodeNames.push(grandChildren[j].nodeName);
        }

        var locationIndex = nodeNames.indexOf("location");
        var ambientIndex = nodeNames.indexOf("ambient");
        var diffuseIndex = nodeNames.indexOf("diffuse");
        var specularIndex = nodeNames.indexOf("specular");

        if (locationIndex == -1)
            return "omni's location undefined for ID = " + omniId;
        if (ambientIndex == -1)
            return "omni's ambient undefined for ID = " + omniId;
        if (diffuseIndex == -1)
            return "omni's diffuse undefined for ID = " + omniId;
        if (specularIndex == -1)
            return "omni's specular undefined for ID = " + omniId;

        var location = [];
        var ambient = [];
        var diffuse = [];
        var specular = [];

        //reads the location values 
        error = this.parseAndValidateXYZWvalues(grandChildren, locationIndex, omniId, "location", "omni", location);
        if (error != null)
            return error;

        //reads the ambient values
        error = this.parseAndValidateRGBAvalues(grandChildren, ambientIndex, omniId, "ambient", "omni", ambient);
        if (error != null)
            return error;

        //reads the diffuse values 
        error = this.parseAndValidateRGBAvalues(grandChildren, diffuseIndex, omniId, "diffuse", "omni", diffuse);
        if (error != null)
            return error;

        //reads the specular values
        error = this.parseAndValidateRGBAvalues(grandChildren, specularIndex, omniId, "specular", "omni", specular);
        if (error != null)
            return error;

        this.omnis[omniId] = [enabled, location, ambient, diffuse, specular];

        return null;
    }


    parseLightsSpot(children, index) {

        var grandChildren = [];
        var error;
        //get the id of current light
        var spotId = this.reader.getString(children[index], 'id');
        if (spotId == null)
            return "no ID defined for light";

        // Checks for repeated IDs.
        if (this.spots[spotId] != null)
            return "ID must be unique for each light (conflict: ID = " + spotId + ")";

        //get the enabled value of current spot
        var enabled = this.reader.getFloat(children[index], 'enabled');
        if (enabled == null)
            return "no enabled defined for spot";

        //get the angle value of current spot
        var angle = this.reader.getFloat(children[index], 'angle');
        if (angle == null)
            return "no angle defined for spot";

        //get the exponent value of current spot
        var exponent = this.reader.getFloat(children[index], 'exponent');
        if (exponent == null)
            return "no exponent defined for spot";

        grandChildren = children[index].children;
        var nodeNames = [];
        for (var j = 0; j < grandChildren.length; j++) {
            nodeNames.push(grandChildren[j].nodeName);
        }

        var locationIndex = nodeNames.indexOf("location");
        var targetIndex = nodeNames.indexOf("target");
        var ambientIndex = nodeNames.indexOf("ambient");
        var diffuseIndex = nodeNames.indexOf("diffuse");
        var specularIndex = nodeNames.indexOf("specular");

        if (locationIndex == -1)
            return "spot's location undefined for ID = " + spotId;
        if (targetIndex == -1)
            return "spot's target undefined for ID = " + spotId;
        if (ambientIndex == -1)
            return "spot's ambient undefined for ID = " + spotId;
        if (diffuseIndex == -1)
            return "spot's diffuse undefined for ID = " + spotId;
        if (specularIndex == -1)
            return "spot's specular undefined for ID = " + spotId;

        var location = [];
        var target = [];
        var ambient = [];
        var diffuse = [];
        var specular = [];

        //reads the location values 
        error = this.parseAndValidateXYZWvalues(grandChildren, locationIndex, spotId, "location", "spot", location);
        if (error != null)
            return error;
        //reads the target values
        error = this.parseAndValidateXYZvalues(grandChildren, targetIndex, spotId, "target", "spot", target);
        if (error != null)
            return error;
        //reads the ambient values
        error = this.parseAndValidateRGBAvalues(grandChildren, ambientIndex, spotId, "ambient", "spot", ambient);
        if (error != null)
            return error;
        //reads the diffuse values
        error = this.parseAndValidateRGBAvalues(grandChildren, diffuseIndex, spotId, "diffuse", "spot", diffuse);
        if (error != null)
            return error;
        //reads the specular values
        error = this.parseAndValidateRGBAvalues(grandChildren, specularIndex, spotId, "specular", "spot", specular);
        if (error != null)
            return error;

        this.spots[spotId] = [enabled, angle, exponent, location, target, ambient, diffuse, specular];

        return null;
    }



    /**
     * Parses the <textures> node.
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {
        var children = texturesNode.children;
        this.textures = [];
        var nodeNames = [];
        var numTextures = 0;
        var grandChildren = [];
        var error;
        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName == "texture") {
                if ((error = this.parseTexturesTexture(children, i)) != null)
                    return error;
            }
            else {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            numTextures++;
        }
        if (numTextures == 0)
            return "at least one texture must be defined";

        this.log("Parsed textures");
        return null;
    }

    /**
     * 
     * @param {*} children 
     * @param {*} index 
     */
    parseTexturesTexture(children, index) {
        //get the id of current texture
        var textureId = this.reader.getString(children[index], 'id');
        if (textureId == null)
            return "no ID defined for texture";

        // Checks for repeated IDs.
        if (this.textures[textureId] != null)
            return "ID must be unique for each texture (conflict: ID = " + textureId + ")";

        //get the enabled value of current omni
        var file = this.reader.getString(children[index], 'file');
        if (file == null)
            return "no file defined for texture";

        var texture = new CGFtexture(this.scene, file);
        this.textures[textureId] = texture;

        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        var children = materialsNode.children;
        this.materials = [];
        var numMaterials = 0;
        var error;
        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName == "material") {
                error = this.parseMaterialsMaterial(children, i);
                if (error != null)
                    return error;
            }
            else {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            numMaterials++;
        }

        if (numMaterials == 0)
            return "at least one material must be defined";

        this.log("Parsed materials");
        return null;
    }

    parseMaterialsMaterial(children, index) {
        var material = {
            shininess: null,
            emission: [],
            ambient: [],
            diffuse: [],
            specular: []
        }
        var grandChildren = [];
        var error;
        //get the id of current material
        var materialId = this.reader.getString(children[index], 'id');
        if (materialId == null)
            return "no ID defined for material";

        // Checks for repeated IDs.
        if (this.materials[materialId] != null)
            return "ID must be unique for each material (conflict: ID = " + materialId + ")";

        //get the shininess value of current material
        material.shininess = this.reader.getFloat(children[index], 'shininess');
        if (material.shininess == null)
            return "no shininess defined for material";

        grandChildren = children[index].children;
        var nodeNames = [];
        for (var j = 0; j < grandChildren.length; j++) {
            nodeNames.push(grandChildren[j].nodeName);
        }

        var emissionIndex = nodeNames.indexOf("emission");
        var ambientIndex = nodeNames.indexOf("ambient");
        var diffuseIndex = nodeNames.indexOf("diffuse");
        var specularIndex = nodeNames.indexOf("specular");

        if (emissionIndex == -1)
            return "material's emission undefined for ID = " + materialId;
        if (ambientIndex == -1)
            return "material's ambient undefined for ID = " + materialId;
        if (diffuseIndex == -1)
            return "material's diffuse undefined for ID = " + materialId;
        if (specularIndex == -1)
            return "material's specular undefined for ID = " + materialId;

        //reads the emission values
        error = this.parseAndValidateRGBAvalues(grandChildren, emissionIndex, materialId, "emission", "ambient", material.emission);
        if (error != null)
            return error;

        //reads the ambient values
        error = this.parseAndValidateRGBAvalues(grandChildren, ambientIndex, materialId, "ambient", "ambient", material.ambient);
        if (error != null)
            return error;

        //reads the diffuse values
        error = this.parseAndValidateRGBAvalues(grandChildren, diffuseIndex, materialId, "diffuse", "ambient", material.diffuse);
        if (error != null)
            return error;

        //reads the specular values
        error = this.parseAndValidateRGBAvalues(grandChildren, specularIndex, materialId, "specular", "ambient", material.specular);
        if (error != null)
            return error;

        this.materials[materialId] = this.createAppearance(material);

        return null;
    }

    /**
     * Creates a new appearance with the information in the struct material received
     * @param {*} material struct containig the necessary information to create a new appearance
     */
    createAppearance(material) {
        var appearance = new CGFappearance(this.scene);
        appearance.setEmission(material.emission[0], material.emission[1], material.emission[2], material.emission[3]);
        appearance.setAmbient(material.ambient[0], material.ambient[1], material.ambient[2], material.ambient[3]);
        appearance.setDiffuse(material.diffuse[0], material.diffuse[1], material.diffuse[2], material.diffuse[3]);
        appearance.setSpecular(material.specular[0], material.specular[1], material.specular[2], material.specular[3]);
        return appearance;
    }


    /**
     * Parses the <transformations> node.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        var children = transformationsNode.children;
        this.transformations = [];
        var numTransformations = 0;
        var error;
        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName == "transformation") {
                error = this.parseTransformationsTransformation(children, i);
                if (error != null)
                    return error;
            }
            else {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            numTransformations++;
        }

        if (numTransformations == 0)
            return "at least one transformation must be defined";

        this.log("Parsed transformations");
        return null;
    }

    parseTransformationsTransformation(children, index) {
        var grandChildren = [];
        var numT = 0;
        //get the id of current transformation
        var transformationId = this.reader.getString(children[index], 'id');
        if (transformationId == null)
            return "no ID defined for transformation";

        // Checks for repeated IDs.
        if (this.transformations[transformationId] != null)
            return "ID must be unique for each transformation (conflict: ID = " + transformationId + ")";

        grandChildren = children[index].children;
        var nodeNames = [];
        for (var j = 0; j < grandChildren.length; j++) {
            nodeNames.push(grandChildren[j].nodeName);
        }
        var tmp_transformations = [];
        for (var j = 0; j < grandChildren.length; j++) {
            var nodeName = grandChildren[j].nodeName;
            switch (nodeName) {
                case "translate":
                    var translate = this.parseTransformationTranslate(grandChildren, j);
                    tmp_transformations.push(translate);
                    numT++;
                    break;
                case "rotate":
                    var rotate = this.parseTransformationRotate(grandChildren, j);
                    tmp_transformations.push(rotate);
                    numT++;
                    break;
                case "scale":
                    var scale = this.parseTransformationScale(grandChildren, j);
                    tmp_transformations.push(scale);
                    numT++;
                    break;
                default:
                    this.onXMLMinorError("unknown tag <" + grandChildren[i].nodeName + ">");
                    break;
            }
        }
        if (numT == 0)
            return "at least one transformation must be defined";

        this.transformations[transformationId] = tmp_transformations;
        return null;
    }


    parseTransformationScale(children, index) {
        var scale = {
            class: 'scale',
            x: null,
            y: null,
            z: null
        }
        var { x, y, z } = this.parsePointXYZ(children, 'x', 'y', 'z', index);
        scale.x = x;
        scale.y = y;
        scale.z = z;
        return scale;
    }

    parseTransformationRotate(children, index) {
        var rotate = {
            class: 'rotate',
            axis: null,
            angle: null
        }
        rotate.axis = this.reader.getString(children[index], 'axis');
        rotate.angle = this.reader.getFloat(children[index], 'angle');
        return rotate;
    }

    parseTransformationTranslate(children, index) {
        var translate = {
            class: 'translate',
            x: null,
            y: null,
            z: null
        }
        var { x, y, z } = this.parsePointXYZ(children, 'x', 'y', 'z', index);
        translate.x = x;
        translate.y = y;
        translate.z = z;
        return translate;
    }



    //nao existe get int
    /**
     * Parses the <primitives> node.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        //Important new arrays should be added according to new primitives
        var children = primitivesNode.children;
        this.primitives = [];
        var numPrimitives = 0;
        var grandChildren = [];
        var nodeNames = [];
        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName == "primitive") {
                var primitiveId = this.reader.getString(children[i], 'id');
                if (primitiveId == null)
                    return "no Id defined for primitive";
                if (this.primitives[primitiveId] != null)
                    return "Id must be unique for each primitive  (conflict: ID = " + primitiveId + ")";

                grandChildren = children[i].children;
                nodeNames = [];

                for (var j = 0; j < grandChildren.length; j++) {
                    nodeNames.push(grandChildren[j].nodeName);
                }
                var nodeName = grandChildren[0].nodeName;
                switch (nodeName) {
                    case "triangle":
                        var triangle = this.parseTriangle(grandChildren, 0);
                        this.primitives[primitiveId] = triangle;
                        break;

                    case "rectangle":
                        var rectangle = this.parseRetangle(grandChildren, 0);
                        this.primitives[primitiveId] = rectangle;
                        break;

                    case "cylinder":
                        var cylinder = this.parseCylinder(grandChildren, 0);
                        this.primitives[primitiveId] = cylinder;
                        break;

                    case "sphere":
                        var sphere = this.parseSphere(grandChildren, 0);
                        this.primitives[primitiveId] = sphere;
                        break;

                    case "torus":
                        var g_torus = this.parseTorus(grandChildren, 0);
                        this.primitives[primitiveId] = g_torus;
                        break;

                    default:
                        this.onXMLMinorError("unknown tag <" + grandChildren[i].nodeName + ">");
                        break;
                }
            }
            else {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            numPrimitives++;
        }
        if (numPrimitives == 0)
            return "at least one primitive must be defined";

        this.log("Parsed primitives");
        return null;
    }

    parseComponents(componentsNode) {

        var component = {

            id: "0",

            materials: [],

            texture: {
                id: "0",
                length_s: 0,
                length_t: 0
            },

            transformations: {
                tref: false,
                trefID: null,
                transformations: []

            },

            children: {
                componentsRef: [],
                primitivesRef: [],
            }
        }

        var children = componentsNode.children;
        this.components = [];
        var numComponents = 0;
        var grandChildren = [];
        var nodeNames = [];

        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName == "component") {
                var componentId = this.reader.getString(children[i], "id");
                if (componentId == null)
                    return "no Id defined for component";
        
                if (this.components[componentId] != null)
                    return "Id must be unique for each component  (conflict: ID = " + componentId + ")";
                
                //ver se nao ha componentes com id iguais   

                grandChildren = children[i].children;
                nodeNames = [];

                for (var j = 0; j < grandChildren.length; j++) {
                    nodeNames.push(grandChildren[j].nodeName);
                }
                for (var j = 0; j < grandChildren.length; j++) {

                    var nodeName = grandChildren[j].nodeName;
                    var ggrandChildren = grandChildren[j].children; //g(rand)grandchildren
                    switch (nodeName) {
                        case "transformation":
                            for (var k = 0; k < ggrandChildren.length; k++) {
                                var nodeName2 = ggrandChildren[k].nodeName;
                                if (nodeName == "transformationref") {
                                    //var transformationRef = [];
                                    component.trefID = this.reader.getString(ggrandChildren[k], 'id');
                                    //transformationRef.push(tref)
                                    //transformation.push(transformationRef);
                                    component.tref = true;
                                }
                                else {
                                    switch (nodeName2) {
                                        case "translate":
                                            var translate = this.parseTransformationTranslate(ggrandChildren, k);
                                            component.transformations.transformations.push(translate);
                                            break;

                                        case "rotate":
                                            var rotate = this.parseTransformationRotate(ggrandChildren, k);
                                            component.transformations.transformations.push(rotate);
                                            break;

                                        case "scale":
                                            var scale = this.parseTransformationScale(ggrandChildren, k);
                                            component.transformations.transformations.push(scale);
                                            break;
                                        default:
                                            this.onXMLMinorError("unknown tag <" + ggrandChildren[k].nodeName + ">");
                                            break;
                                    }
                                }
                            }
                           
                            break;

                        case "materials":
                            for (var k = 0; k < ggrandChildren.length; k++) {
                                var nodeName2 = ggrandChildren[k].nodeName;
                                if (nodeName2 == "material") {
                                    var id = this.reader.getString(ggrandChildren[k], 'id');
                                    component.materials.push(id);
                                }
                                else
                                    this.onXMLMinorError("unknown tag <" + ggrandChildren[k].nodeName + ">");

                            }
                            break;

                        case "texture":
                            component.texture.id = this.reader.getString(grandChildren[j], 'id');
                            component.texture.length_s = this.reader.getFloat(grandChildren[j], 'length_s');
                            component.texture.length_t = this.reader.getFloat(grandChildren[j], 'length_t');
                            break;

                        case "children":
                            for (var k = 0; k < ggrandChildren.length; k++) {
                                var nodeName2 = ggrandChildren[k].nodeName;
                                switch (nodeName2) {
                                    case "componentref":
                                        var idC = this.reader.getString(ggrandChildren[k], 'id');
                                        component.children.componentsRef.push(idC);
                                        break;
                                    case "primitiveref":
                                        var idP = this.reader.getString(ggrandChildren[k], 'id');
                                        component.children.primitivesRef.push(idP);
                                        break;
                                    default:
                                        this.onXMLMinorError("unknown tag <" + ggrandChildren[k].nodeName + ">");
                                        break;
                                }
                            }
                            break;

                        default:
                            this.onXMLMinorError("unknown tag <" + grandChildren[j].nodeName + ">");
                            break;
                    }
                }
            }
            else
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");

            numComponents++;
            this.components[componentId] = component;
        }
        this.log("Parsed components");
        return null;
    }


    createRectangle(rectangle)
    {

    }

    createTriangle(triangle)
    {

    }

    createSphere(sphere)
    {

    }

    createCylinder(sphere)
    {

    }

    createTorus(torus)
    {

    }


    /**usar na das components tambem */
    /****mudar de sitio *************/
    parseTorus(children, index) {
        var g_torus = {
            inner: null,
            outer: null,
            slices: null,
            loops: null
        }
        g_torus.inner = this.reader.getFloat(children[index], 'inner');
        g_torus.outer = this.reader.getFloat(children[index], 'outer');
        g_torus.slices = this.reader.getFloat(children[index], 'slices');
        g_torus.loops = this.reader.getFloat(children[index], 'loops');
        return g_torus;
    }

    parseSphere(children, index) {
        var sphere = {
            radius: null,
            stacks: null,
            slices: null
        }
        sphere.radius = this.reader.getFloat(children[index], 'radius');
        sphere.stacks = this.reader.getFloat(children[index], 'stacks');
        sphere.slices = this.reader.getFloat(children[index], 'slices');
        return sphere;
    }

    parseCylinder(children, index) {
        var cylinder = {
            base: null,
            top: null,
            height: null,
            stacks: null,
            slices: null
        }
        cylinder.base = this.reader.getFloat(children[index], 'base');
        cylinder.top = this.reader.getFloat(children[index], 'top');
        cylinder.height = this.reader.getFloat(children[index], 'height');
        cylinder.stacks = this.reader.getFloat(children[index], 'stacks');
        cylinder.slices = this.reader.getFloat(children[index], 'slices');
        return cylinder;
    }

    parseRetangle(children, index) {
        var rectangle = {
            x1: null,
            y1: null,
            x2: null,
            y2: null
        }
        var x = this.reader.getFloat(children[index], 'x1');
        var y = this.reader.getFloat(children[index], 'y1');
        rectangle.x1 = x;
        rectangle.y1 = y;
        x = this.reader.getFloat(children[index], 'x2');
        y = this.reader.getFloat(children[index], 'y2');
        rectangle.x2 = x;
        rectangle.y2 = y;
        return rectangle;
    }

    parseTriangle(children, index) {
        var triangle = {
            x1: null,
            y1: null,
            z1: null,
            x2: null,
            y2: null,
            z2: null,
            x3: null,
            y3: null,
            z3: null
        }
        var { x, y, z } = this.parsePointXYZ(children, 'x1', 'y1', 'z1', index);
        triangle.x1 = x;
        triangle.y1 = y;
        triangle.z1 = z;
        var { x, y, z } = this.parsePointXYZ(children, 'x2', 'y2', 'z2', index);
        triangle.x2 = x;
        triangle.y2 = y;
        triangle.z2 = z;
        var { x, y, z } = this.parsePointXYZ(children, 'x3', 'y3', 'z3', index);
        triangle.x3 = x;
        triangle.y3 = y;
        triangle.z3 = z;
        return triangle;
    }


    parsePointXYZ(vector, x1, y1, z1, index) {
        var x = this.reader.getFloat(vector[index], x1);
        var y = this.reader.getFloat(vector[index], y1);
        var z = this.reader.getFloat(vector[index], z1);
        return { x, y, z };
    }

    parsePointXYZW(vector, x1, y1, z1, w1, index) {
        var x = this.reader.getFloat(vector[index], x1);
        var y = this.reader.getFloat(vector[index], y1);
        var z = this.reader.getFloat(vector[index], z1);
        var w = this.reader.getFloat(vector[index], w1);
        return { x, y, z, w };
    }

    parsePointRGBA(vector, index) {
        var { x, y, z, w } = this.parsePointXYZW(vector, 'r', 'g', 'b', 'a', index);
        return { x, y, z, w };

    }

    //TODO decidir se da erro ou se assumo valores por defeito
    parseAndValidateRGBAvalues(children, index, id, s1, s2, vector) {
        var { x, y, z, w } = this.parsePointRGBA(children, index);
        if (!this.validateFloat(x))
            return "unable to parse " + s1 + " r-value of the " + s2 + " for ID = " + id;
        if (!this.validateFloat(y))
            return "unable to parse " + s1 + " g-value of the " + s2 + " for ID = " + id;
        if (!this.validateFloat(z))
            return "unable to parse " + s1 + " b-value of the " + s2 + " for ID = " + id;
        if (!this.validateFloat(w))
            return "unable to parse " + s1 + " a-value of the " + s2 + " for ID = " + id;
        vector.push(x, y, z, w);
        return null;
    }


    parseAndValidateXYZvalues(children, index, id, s1, s2, vector) {
        var { x, y, z } = this.parsePointXYZ(children, 'x', 'y', 'z', index);
        if (!this.validateFloat(x))
            return "unable to parse " + s1 + " x-coordinate of " + s2 + " position for ID = " + id;
        if (!this.validateFloat(y))
            return "unable to parse " + s1 + " y-coordinate of " + s2 + " position for ID = " + id;
        if (!this.validateFloat(z))
            return "unable to parse " + s1 + " z-coordinate of " + s2 + " position for ID = " + id;
        vector.push(x, y, z);
        return null;
    }


    parseAndValidateXYZWvalues(children, index, id, s1, s2, vector) {
        var { x, y, z, w } = this.parsePointXYZW(children, 'x', 'y', 'z', 'w', index);
        if (!this.validateFloat(x))
            return "unable to parse " + s1 + " x-coordinate of " + s2 + " position for ID = " + id;
        if (!this.validateFloat(y))
            return "unable to parse " + s1 + " y-coordinate of " + s2 + " position for ID = " + id;
        if (!this.validateFloat(z))
            return "unable to parse " + s1 + " z-coordinate of " + s2 + " position for ID = " + id;
        if (!this.validateFloat(w))
            return "unable to parse " + s1 + " w-coordinate of " + s2 + " position for ID = " + id;
        vector.push(x, y, z, w);
        return null;
    }


    validateFloat(x) {
        if (!(x != null && !isNaN(x)))
            return false;
        else
            return true;
    }

    /***************************************/

    /***************************** */



    /*
    * Callback to be executed on any read error, showing an error on the console.
    * @param {string} message
    */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }


    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

<<<<<<< HEAD
   
=======
    applyTexture(comp, compAppearance) {
        //var text = this.textures[comp[2][0]];
        //compAppearance.loadTexture(text[0]);
    }

    applyTransformations(comp) {

    }
>>>>>>> cb4a2fab1c0841f9281fd9dfe43d9d229b3bf545

    displayComp(comp) {

       
    }


    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        // entry point for graph rendering
        for (var l = 0; l < this.components.length; l++) {
            this.displayComp(this.components[l]);
        }
    }
}

