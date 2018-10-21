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
var INHERIT = "inherit";
var NONE = "none";
var DEFAULT_MATERIAL = 0;

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
    * @param {*} rootElement XML root element
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
        var index;
        // Processes each node, verifying errors.

        // <scene>
        error = this.parseIndex(SCENE_INDEX, this.parseScene, nodeNames, nodes, "scene");
        if (error != null)
            return error;

        // <views>
        error = this.parseIndex(VIEWS_INDEX, this.parseViews, nodeNames, nodes, "views");
        if (error != null)
            return error;

        // <ambient>
        error = this.parseIndex(AMBIENT_INDEX, this.parseAmbient, nodeNames, nodes, "ambient");
        if (error != null)
            return error;

        // <lights>
        error = this.parseIndex(LIGHTS_INDEX, this.parseLights, nodeNames, nodes, "lights");
        if (error != null)
            return error;

        // <textures>
        error = this.parseIndex(TEXTURES_INDEX, this.parseTextures, nodeNames, nodes, "textures");
        if (error != null)
            return error;

        // <materials>
        error = this.parseIndex(MATERIALS_INDEX, this.parseMaterials, nodeNames, nodes, "materials");
        if (error != null)
            return error;

        // <transformations>
        error = this.parseIndex(TRANSFORMATIONS_INDEX, this.parseTransformations, nodeNames, nodes, "transformations");
        if (error != null)
            return error;

        // <primitives>
        error = this.parseIndex(PRIMITIVES_INDEX, this.parsePrimitives, nodeNames, nodes, "primitives");
        if (error != null)
            return error;

        // <components>
        error = this.parseIndex(COMPONENTS_INDEX, this.parseComponents, nodeNames, nodes, "components");
        if (error != null)
            return error;
    }

    /**
     * Parses the index for the tag
     * @param {*} parseIndex Expected index of the tag
     * @param {*} parseFunction 
     * @param {*} nodeNames Name of the node where th tag is being searched
     * @param {*} nodes 
     * @param {*} tag 
     */
    parseIndex(parseIndex, parseFunction, nodeNames, nodes, tag) {

        var index;
        var error;
        if ((index = nodeNames.indexOf(tag)) == -1)
            return "tag <" + tag + "> missing";
        else {
            if (index != parseIndex)
                this.onXMLMinorError("tag <" + tag + "> out of order");

            if ((error = parseFunction.apply(this, [nodes[index]])) != null)
                return error;
        }
        return null;
    }


    /**
    * Parses the <scene> block. 
    * @param {*} sceneNode scene block element
    */
    parseScene(sceneNode) {
        console.log("scenenode");
        console.log(sceneNode);
        this.root = this.reader.getString(sceneNode, 'root');
        if (!this.validateString(this.root))
            return "unable to parse root value";

        this.axisLength = this.reader.getFloat(sceneNode, 'axis_length');

        if (!this.validateFloat(this.axisLength)) {
            this.axisLength = 10.0;
            this.onXMLMinorError("unable to parse value for axisLength; assuming 'far = 10.0'");
        }

        this.log("Parsed scene");
        return null;
    }


    /**
    * Parses the <views> block 
    * @param {*} viewsNode views block element
    */
    parseViews(viewsNode) {
        var children = viewsNode.children;
        this.views = {
            default: null,
            views: []
        }
        var numViews = 0;
        var error;

        this.views.default = this.reader.getString(viewsNode, 'default');
        if (!this.validateString(this.views.default)) {
            return "unable to parse value for views default";
        }

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

        error = this.validateViewsDefaultValue();
        if (error != null)
            return error;
        this.log("Parsed views");
        return null;
    }

    /**
     * Parses one child of the <views> block of type perspective
     * @param {*} children Children of the <views> block
     * @param {*} index Index of the child being parsed
     */
    parseViewsPerspective(children, index) {
        var grandChildren = [];
        var perspective = {
            near: null,
            far: null,
            angle: null,
            fromPosition: [],
            toPosition: []
        }
        var error;
        //get the id of current perspective
        var perspectiveId = this.reader.getString(children[index], 'id');
        if (!this.validateString(perspectiveId))
            return "no ID defined for view";

        // Checks for repeated IDs.
        if (this.views.views[perspectiveId] != null)
            return "ID must be unique for each view (conflict: ID = " + perspectiveId + ")";

        //get the near value of current perspective
        perspective.near = this.reader.getFloat(children[index], 'near');
        if (!this.validateFloat(perspective.near))
            return "unable to parse near value for perspective for ID" + perspectiveId;

        //get the far value of current perspective
        perspective.far = this.reader.getFloat(children[index], 'far');
        if (!this.validateFloat(perspective.far))
            return "unable to parse far value for perspective for ID" + perspectiveId;

        if (perspective.near >= perspective.far)
            return "near value most be less then far value for perspective for ID " + perspectiveId;

        //get the angle value of current perspective
        perspective.angle = this.reader.getFloat(children[index], 'angle');
        if (!this.validateFloat(perspective.angle))
            return "unable to parse angle value for perspective for ID" + perspectiveId;

        grandChildren = children[index].children;
        if (grandChildren.length != 2)
            return "incorrect number of children for perspective";

        var nodeNames = [];
        for (var j = 0; j < grandChildren.length; j++) {
            nodeNames.push(grandChildren[j].nodeName);
        }

        var fromIndex = nodeNames.indexOf("from");
        var toIndex = nodeNames.indexOf("to");

        if (fromIndex == -1)
            return "perspective's from position undefined for ID  " + perspectiveId;

        if (toIndex == -1)
            return "perspective's to position undefined for ID  " + perspectiveId;

        //reads the from position
        error = this.parseAndValidateXYZvalues(grandChildren, fromIndex, perspectiveId, "from", "perspective", perspective.fromPosition);
        if (error != null)
            return error;
        //reads the to position
        this.parseAndValidateXYZvalues(grandChildren, toIndex, perspectiveId, "to", "perspective", perspective.toPosition);
        if (error != null)
            return error;

        this.views.views[perspectiveId] = this.createCameraPerspective(perspective);

        return null;
    }

    /**
     * Parses one child of the <views> block of type ortho
     * @param {*} children Children of the <views> block
     * @param {*} index Index of the child being parsed
     */
    parseViewsOrtho(children, index) {
        var grandChildren = [];
        var ortho = {
            near: null,
            far: null,
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
        if (!this.validateString(orthoId))
            return "no ID defined for view";

        // Checks for repeated IDs.
        if (this.views.views[orthoId] != null)
            return "ID must be unique for each view (conflict: ID = " + orthoId + ")";

        //get the near value of current ortho
        ortho.near = this.reader.getFloat(children[index], 'near');
        if (!this.validateFloat(ortho.near))
            return "unable to parse near value for ortho for ID " + orthoId;

        //get the far value of current ortho
        ortho.far = this.reader.getFloat(children[index], 'far');
        if (!this.validateFloat(ortho.far))
            return "unable to parse far value for ortho for ID " + orthoId;

        if (ortho.near >= ortho.far)
            return "near value most be less then far value for ortho for ID " + orthoId;

        //get the left value of current ortho
        ortho.left = this.reader.getFloat(children[index], 'left');
        if (!this.validateFloat(ortho.left))
            return "unable to parse left value for ortho for ID " + orthoId;

        //get the right value of current ortho
        ortho.right = this.reader.getFloat(children[index], 'right');
        if (!this.validateFloat(ortho.right))
            return "unable to parse right value for ortho for ID " + orthoId;

        if (ortho.left >= ortho.right)
            return "left value most be less then right value for ortho for ID " + orthoId;

        //get the top value of current ortho
        ortho.top = this.reader.getFloat(children[index], 'top');
        if (!this.validateFloat(ortho.top))
            return "unable to parse top value for ortho for ID " + orthoId;

        //get the bottom value of current ortho
        ortho.bottom = this.reader.getFloat(children[index], 'bottom');
        if (!this.validateFloat(ortho.bottom))
            return "unable to parse bottom value for ortho for ID " + orthoId;

        if (ortho.bottom >= ortho.top)
            return "bottom value most be less then top value for ortho for ID " + orthoId;

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
            return "ortho's from position undefined for ID " + orthoId;

        if (toIndex == -1)
            return "ortho's to position undefined for ID " + orthoId;

        //reads the from position
        error = this.parseAndValidateXYZvalues(grandChildren, fromIndex, orthoId, "from", "ortho", ortho.fromPosition);
        if (error != null)
            return error;
        //reads the to position
        this.parseAndValidateXYZvalues(grandChildren, toIndex, orthoId, "to", "ortho", ortho.toPosition);
        if (error != null)
            return error;

        this.views.views[orthoId] = this.createCameraOrtho(ortho);

        return null;
    }

    /**
     * Creates a new camera of type perspective
     * @param {*} perspective Struct which contain the information needed to generate the new perspective
     */
    createCameraPerspective(perspective) {
        var camera = new CGFcamera(perspective.angle * Math.PI / 180, perspective.near, perspective.far, perspective.fromPosition, perspective.toPosition);
        return camera;
    }

    /**
     * Creates a new camera of type ortho
     * @param {*} ortho Struct which contain the information needed to generate the new ortho
     */
    createCameraOrtho(ortho) {
        var up = [0, 1, 0];
        var camera = new CGFcameraOrtho(ortho.left, ortho.right, ortho.bottom, ortho.top, ortho.near, ortho.far, ortho.fromPosition, ortho.toPosition, up);
        return camera;
    }


    /**
    * Parses the <ambient> block. 
    * @param {*} ambientNode ambient block element
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
    * @param {*} lightsNode lights block element
    */
    parseLights(lightsNode) {
        var children = lightsNode.children;
        this.omnis = [];
        this.spots = [];
        var numLights = 0;
        var error;
        this.lights = [];

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
        console.dir(this.lights);
        return null;
    }


    /**
     * Parses child of the <lights> node of type omni
     * @param {Object} children Children of the <lights> node
     * @param {Object} index Index of the child being parsed
     */
    parseLightsOmni(children, index) {
        var grandChildren = [];
        var error;
        var omni = {
            class: 'omni',
            enabled: null,
            location: [],
            ambient: [],
            diffuse: [],
            specular: [],
        }
        //get the id of current light
        var omniId = this.reader.getString(children[index], 'id');
        if (!this.validateString(omniId))
            return "no ID defined for light";

        // Checks for repeated IDs.
        if (this.lights[omniId] != null)
            return "ID must be unique for each light (conflict: ID = " + omniId + ")";

        //get the enabled value of current omni
        omni.enabled = this.reader.getBoolean(children[index], 'enabled');
        if (omni.enabled == null)
            return "unable to parse enabled value for omni for ID " + omniId;

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
            return "omni's location undefined for ID " + omniId;
        if (ambientIndex == -1)
            return "omni's ambient undefined for ID " + omniId;
        if (diffuseIndex == -1)
            return "omni's diffuse undefined for ID " + omniId;
        if (specularIndex == -1)
            return "omni's specular undefined for ID " + omniId;


        //reads the location values 
        error = this.parseAndValidateXYZWvalues(grandChildren, locationIndex, omniId, "location", "omni", omni.location);
        if (error != null)
            return error;
        //reads the ambient values
        this.parseAndValidateRGBAvalues(grandChildren, ambientIndex, omniId, "ambient", "omni", omni.ambient);

        //reads the diffuse values 
        this.parseAndValidateRGBAvalues(grandChildren, diffuseIndex, omniId, "diffuse", "omni", omni.diffuse);

        //reads the specular values
        this.parseAndValidateRGBAvalues(grandChildren, specularIndex, omniId, "specular", "omni", omni.specular);

        this.lights[omniId] = omni;

        return null;
    }

     /**
     * Parses child of the <lights> node of type spot
     * @param {Object} children Children of the <lights> node
     * @param {Object} index Index of the child being parsed
     */
    parseLightsSpot(children, index) {

        var grandChildren = [];
        var error;
        var spot = {
            class: 'spot',
            enabled: null,
            angle: null,
            exponent: null,
            location: [],
            target: [],
            ambient: [],
            diffuse: [],
            specular: [],
        }
        //get the id of current light
        var spotId = this.reader.getString(children[index], 'id');
        if (!this.validateString(spotId))
            return "no ID defined for light";

        // Checks for repeated IDs.
        if (this.lights[spotId] != null)
            return "ID must be unique for each light (conflict: ID = " + spotId + ")";

        //get the enabled value of current spot
        spot.enabled = this.reader.getBoolean(children[index], 'enabled');
        if (spot.enabled == null)
            return "unable to parse enabled value for spot for ID " + spotId;

        //get the angle value of current spot
        spot.angle = this.reader.getFloat(children[index], 'angle');
        if (!this.validateFloat(spot.angle))
            return "unable to parse angle value for spot for ID " + spotId;

        //get the exponent value of current spot
        spot.exponent = this.reader.getFloat(children[index], 'exponent');
        if (!this.validateFloat(spot.exponent))
            return "unable to parse exponent value for spot for ID " + spotId;

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
            return "spot's location undefined for ID " + spotId;
        if (targetIndex == -1)
            return "spot's target undefined for ID " + spotId;
        if (ambientIndex == -1)
            return "spot's ambient undefined for ID " + spotId;
        if (diffuseIndex == -1)
            return "spot's diffuse undefined for ID " + spotId;
        if (specularIndex == -1)
            return "spot's specular undefined for ID " + spotId;


        //reads the location values 
        error = this.parseAndValidateXYZWvalues(grandChildren, locationIndex, spotId, "location", "spot", spot.location);
        if (error != null)
            return error;
        //reads the target values
        error = this.parseAndValidateXYZvalues(grandChildren, targetIndex, spotId, "target", "spot", spot.target);
        if (error != null)
            return error;
        //reads the ambient values
        this.parseAndValidateRGBAvalues(grandChildren, ambientIndex, spotId, "ambient", "spot", spot.ambient);

        //reads the diffuse values
        this.parseAndValidateRGBAvalues(grandChildren, diffuseIndex, spotId, "diffuse", "spot", spot.diffuse);

        //reads the specular values
        this.parseAndValidateRGBAvalues(grandChildren, specularIndex, spotId, "specular", "spot", spot.specular);

        this.lights[spotId] = spot;

        return null;
    }



    /**
     * Parses the <textures> node.
     * @param {Object} texturesNode textures block element
     */
    parseTextures(texturesNode) {
        var children = texturesNode.children;
        this.textures = [];
        var numTextures = 0;
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
        if (!this.validateString(textureId))
            return "no ID defined for texture";

        // Checks for repeated IDs.
        if (this.textures[textureId] != null)
            return "ID must be unique for each texture (conflict: ID = " + textureId + ")";

        //get the enabled value of current omni
        var file = this.reader.getString(children[index], 'file');
        if (!this.validateString(file))
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
        if (!this.validateString(materialId))
            return "no ID defined for material";

        // Checks for repeated IDs.
        if (this.materials[materialId] != null)
            return "ID must be unique for each material (conflict: ID = " + materialId + ")";

        //get the shininess value of current material
        material.shininess = this.reader.getFloat(children[index], 'shininess');
        if (!this.validateFloat(material.shininess))
            return "unable to parse shininess value for spot for ID " + materialId;

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
            return "material's emission undefined for ID " + materialId;
        if (ambientIndex == -1)
            return "material's ambient undefined for ID " + materialId;
        if (diffuseIndex == -1)
            return "material's diffuse undefined for ID " + materialId;
        if (specularIndex == -1)
            return "material's specular undefined for ID " + materialId;

        //reads the emission values
        this.parseAndValidateRGBAvalues(grandChildren, emissionIndex, materialId, "emission", "ambient", material.emission);

        //reads the ambient values
        this.parseAndValidateRGBAvalues(grandChildren, ambientIndex, materialId, "ambient", "ambient", material.ambient);

        //reads the diffuse values
        this.parseAndValidateRGBAvalues(grandChildren, diffuseIndex, materialId, "diffuse", "ambient", material.diffuse);

        //reads the specular values
        this.parseAndValidateRGBAvalues(grandChildren, specularIndex, materialId, "specular", "ambient", material.specular);

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
        appearance.setTextureWrap('REPEAT', 'REPEAT');
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
        var error;
        //get the id of current transformation
        var transformationId = this.reader.getString(children[index], 'id');
        if (!this.validateString(transformationId))
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
                    error = this.parseTransformationTranslate(grandChildren, j, tmp_transformations);
                    if (error != null)
                        return error;
                    break;
                case "rotate":
                    error = this.parseTransformationRotate(grandChildren, j, tmp_transformations);
                    if (error != null)
                        return error;
                    break;
                case "scale":
                    error = this.parseTransformationScale(grandChildren, j, tmp_transformations);
                    if (error != null)
                        return error;
                    break;
                default:
                    this.onXMLMinorError("unknown tag <" + grandChildren[j].nodeName + ">");
                    continue;
            }
            numT++;
        }
        if (numT == 0)
            return "at least one transformation must be defined";

        this.transformations[transformationId] = tmp_transformations;
        return null;
    }


    parseTransformationScale(children, index, vector) {
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
        if (!this.validateFloat(scale.x))
            return "unable to parse x of scale";
        if (!this.validateFloat(scale.y))
            return "unable to parse y of scale";
        if (!this.validateFloat(scale.z))
            return "unable to parse z of scale";

        vector.push(scale);
        return null;
    }

    parseTransformationRotate(children, index, vector) {
        var rotate = {
            class: 'rotate',
            axis: null,
            angle: null
        }
        rotate.axis = this.reader.getString(children[index], 'axis');
        if (!this.validateAxis(rotate.axis))
            return "unable to parse axis of rotate";

        rotate.angle = this.reader.getFloat(children[index], 'angle');
        if (!this.validateFloat(rotate.angle))
            return "unable to parse angle of rotate";
        vector.push(rotate);
        return null;
    }

    parseTransformationTranslate(children, index, vector) {
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
        if (!this.validateFloat(translate.x))
            return "unable to parse x of translate";
        if (!this.validateFloat(translate.y))
            return "unable to parse y of translate";
        if (!this.validateFloat(translate.z))
            return "unable to parse z of translate";
        vector.push(translate);
        return null;
    }


    /**
     * Parses the <primitives> node.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {

        var children = primitivesNode.children;
        this.primitives = [];
        var numPrimitives = 0;
        var error;
        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName == "primitive") {
                error = this.parsePrimitivesPrimitive(children, i);
                if (error != null)
                    return error;
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


    parsePrimitivesPrimitive(children, index) {
        var grandChildren = [];
        var error;
        var primitiveId = this.reader.getString(children[index], 'id');
        if (!this.validateString(primitiveId))
            return "no Id defined for primitive";
        if (this.primitives[primitiveId] != null)
            return "Id must be unique for each primitive  (conflict: ID = " + primitiveId + ")";

        grandChildren = children[index].children;
        var nodeNames = [];

        for (var j = 0; j < grandChildren.length; j++) {
            nodeNames.push(grandChildren[j].nodeName);
        }
        var nodeName = grandChildren[0].nodeName;
        switch (nodeName) {
            case "triangle":
                error = this.parseTriangle(grandChildren, 0, primitiveId);
                if (error != null)
                    return error;
                break;
            case "rectangle":
                error = this.parseRectangle(grandChildren, 0, primitiveId);
                if (error != null)
                    return error;
                break;
            case "cylinder":
                error = this.parseCylinder(grandChildren, 0, primitiveId);
                if (error != null)
                    return error;
                break;
            case "sphere":
                error = this.parseSphere(grandChildren, 0, primitiveId);
                if (error != null)
                    return error;
                break;
            case "torus":
                error = this.parseTorus(grandChildren, 0, primitiveId);
                if (error != null)
                    return error;
                break;
            default:
                this.onXMLMinorError("unknown tag <" + grandChildren[i].nodeName + ">");
                break;
        }
        return null;
    }

    parseComponents(componentsNode) {
        var children = componentsNode.children;
        this.components = [];
        var numComponents = 0;
        var error;
        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName == "component") {
                error = this.parseComponentsComponent(children, i);
                if (error != null)
                    return error;
                numComponents++;
            }
            else
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
        }
        if (numComponents == 0)
            return "at least one component must be defined";

        error = this.validateRootComponent();
        if (error != null)
            return error;
        error = this.validateComponentsChildren();
        if (error != null)
            return error;
        this.log("Parsed components");
        return null;
    }

    parseComponentsComponent(children, index) {
        var error;
        var component = {

            materials: [],
            currentMaterialIndex: 0,
  
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
                primitivesRef: []
            }
        }
        var grandChildren = [];
        var componentId = this.reader.getString(children[index], "id");
        if (!this.validateString(componentId))
            return "no Id defined for component";

        if (this.components[componentId] != null)
            return "Id must be unique for each component  (conflict: ID = " + componentId + ")";

        grandChildren = children[index].children;
        var nodeNames = [];

        for (var j = 0; j < grandChildren.length; j++) {
            nodeNames.push(grandChildren[j].nodeName);
        }
        for (var j = 0; j < grandChildren.length; j++) {

            var nodeName = grandChildren[j].nodeName;
            var ggrandChildren = grandChildren[j].children; //g(rand)grandchildren
            switch (nodeName) {
                case "transformation":
                    error = this.parseComponentTransformations(ggrandChildren, component, componentId);
                    if (error != null)
                        return error;
                    break;
                case "materials":
                    error = this.parseComponentMaterials(ggrandChildren, component, componentId);
                    if (error != null)
                        return error;
                    break;
                case "texture":
                    error = this.parseComponentTexture(grandChildren, j, component, componentId);
                    if (error != null)
                        return error;
                    break;
                case "children":
                    error = this.parseComponentChildren(ggrandChildren, component, componentId);
                    if (error != null)
                        return error;
                    break;
                default:
                    this.onXMLMinorError("unknown tag <" + grandChildren[j].nodeName + ">");
                    break;
            }
        }
        this.components[componentId] = component;
        return null;
    }

    parseComponentTransformations(children, component, componentId) {
        var error;
        for (let k = 0; k < children.length; k++) {
            let nodeName2 = children[k].nodeName;
            if (nodeName2 == "transformationref") {
              error = this.parseComponentTransformationsTransformationRef(children,k,component,componentId);
              if(error != null)
                return error;
            }
            else {
              error = this.parseComponentTransformationsTransformation(nodeName2,children,k,component);
              if (error != null)
                return error;
            }
        }
        return null;
    }


    parseComponentTransformationsTransformationRef(children,index,component,componentId)
    {
        let id = this.reader.getString(children[index], 'id');
        if (!this.validateString(id))
            return "no id defined for transformation for component ID: " + componentId;
        if(!this.isTransformation(id))
            return "invalid id defined for transformation " + id + " for component ID: " + componentId;
        component.transformations.trefID = id;
        component.transformations.tref = true;
        return null;
    }

    parseComponentTransformationsTransformation(nodeName,children,index,component)
    {
        var error;
        switch (nodeName) {
            case "translate":
                error = this.parseTransformationTranslate(children, index, component.transformations.transformations);
                if (error != null)
                    return error;
                break;
            case "rotate":
                error = this.parseTransformationRotate(children, index, component.transformations.transformations);
                if (error != null)
                    return error;
                break;
            case "scale":
                error = this.parseTransformationScale(children, index, component.transformations.transformations);
                if (error != null)
                    return error;
                break;
            default:
                this.onXMLMinorError("unknown tag <" + children[k].nodeName + ">");
                break;
        }
        return null;
    }



    parseComponentMaterials(children, component, componentId) {
        for (let k = 0; k < children.length; k++) {
            let nodeName2 = children[k].nodeName;
            if (nodeName2 == "material") {
                let id = this.reader.getString(children[k], 'id');
                if (!this.validateString(id))
                    return "no id defined for material for component ID: " + componentId;
                if (!this.isMaterial(id))
                    return "invalid id defined for material " + id + " for component ID: " + componentId;
                component.materials.push(id);
            }
            else
                this.onXMLMinorError("unknown tag <" + children[k].nodeName + ">");

        }
    
        return null;
    }

   


    parseComponentTexture(children, index, component, componentId) {
        component.texture.id = this.reader.getString(children[index], 'id');
        if ((!this.validateString(component.texture.id)))
            return "no id defined for texture for component ID: " + componentId;
        if (!this.isTexture(component.texture.id))
            return "invalid id defined for texture " + component.texture.id + " for component ID: " + componentId;
            
        component.texture.length_s = this.reader.getFloat(children[index], 'length_s', false);
        if (!this.validateFloat(component.texture.length_s)){
            if(component.texture.id == "none" || component.texture.id == "inherit")
                component.texture.length_s = 0;
            else
                return "Unable to parse texture's lenght_s value for component ID: " + componentId;
        }
        component.texture.length_t = this.reader.getFloat(children[index], 'length_t', false);
        if (!this.validateFloat(component.texture.length_t)){
            if(component.texture.id == "none" || component.texture.id == "inherit")
                component.texture.length_t = 0;
            else
                return "Unable to parse texture's lenght_t value for component ID: " + componentId;
        }
        return null;
    }

  

    parseComponentChildren(children, component, componentId) {
        for (let k = 0; k < children.length; k++) {
            let nodeName2 = children[k].nodeName;
            switch (nodeName2) {
                case "componentref":
                    let idC = this.reader.getString(children[k], 'id');
                    if ((!this.validateString(idC)))
                        return "no id defined for componentref for component ID: " + componentId;
                    component.children.componentsRef.push(idC);
                    break;
                case "primitiveref":
                    let idP = this.reader.getString(children[k], 'id');
                    if ((!this.validateString(idP)))
                        return "no id defined for primitiveref for component ID: " + componentId;
                    if (!this.isPrimitive(idP))
                        return "invalid id defined for primitiveref "+ idP + " for component ID: " + componentId;
                    component.children.primitivesRef.push(idP);
                    break;
                default:
                    this.onXMLMinorError("unknown tag <" + children[k].nodeName + ">");
                    break;
            }
        }
        return null;
    }


    createRectangle(rectangle) {
        return new MyRectangle(this.scene, rectangle.x1, rectangle.y1, rectangle.x2, rectangle.y2);
    }

    createTriangle(triangle) {
        return new MyTriangle(this.scene, triangle.x1, triangle.y1, triangle.z1, triangle.x2, triangle.y2, triangle.z2, triangle.x3, triangle.y3, triangle.z3);
    }

    createSphere(sphere) {
        return new MySphere(this.scene, sphere.slices, sphere.stacks, sphere.radius);
    }

    createCylinder(cylinder) {
        return new MyCylinder(this.scene, cylinder.slices, cylinder.stacks, cylinder.base, cylinder.top, cylinder.height); //TODO
    }

    createTorus(torus) {
        return new MyTorus(this.scene, torus.inner, torus.outer, torus.slices, torus.loops);
    }


    parseTorus(children, index, id) {
        var torus = {
            inner: null,
            outer: null,
            slices: null,
            loops: null
        }
        torus.inner = this.reader.getFloat(children[index], 'inner');
        if (!this.validateFloat(torus.inner))
            return "unable to parse inner of torus for ID " + id;

        torus.outer = this.reader.getFloat(children[index], 'outer');
        if (!this.validateFloat(torus.outer))
            return "unable to parse outer of torus for ID  " + id;

        torus.slices = this.reader.getFloat(children[index], 'slices');
        if (!this.validateFloat(torus.slices))
            return "unable to parse slices of torus for Id " + id;

        torus.loops = this.reader.getFloat(children[index], 'loops');
        if (!this.validateFloat(torus.loops))
            return "unable to parse loops of torus for ID " + id;

        this.primitives[id] = this.createTorus(torus);
        return null;
    }

    parseSphere(children, index, id) {
        var sphere = {
            radius: null,
            stacks: null,
            slices: null
        }
        sphere.radius = this.reader.getFloat(children[index], 'radius');
        if (!this.validateFloat(sphere.radius))
            return "unable to parse radius of sphere for ID " + id;

        sphere.stacks = this.reader.getFloat(children[index], 'stacks');
        if (!this.validateFloat(sphere.stacks))
            return "unable to parse stacks of sphere for ID " + id;

        sphere.slices = this.reader.getFloat(children[index], 'slices');
        if (!this.validateFloat(sphere.slices))
            return "unable to parse slices of sphere for ID " + id;

        this.primitives[id] = this.createSphere(sphere);
        return null;
    }

    parseCylinder(children, index, id) {
        var cylinder = {
            base: null,
            top: null,
            height: null,
            stacks: null,
            slices: null
        }
        cylinder.base = this.reader.getFloat(children[index], 'base');
        if (!this.validateFloat(cylinder.base))
            return "unable to parse base of cylinder for ID " + id;

        cylinder.top = this.reader.getFloat(children[index], 'top');
        if (!this.validateFloat(cylinder.top))
            return "unable to parse top of cylinder for ID " + id;

        cylinder.height = this.reader.getFloat(children[index], 'height');
        if (!this.validateFloat(cylinder.height))
            return "unable to parse height of cylinder for ID " + id;

        cylinder.stacks = this.reader.getFloat(children[index], 'stacks');
        if (!this.validateFloat(cylinder.stacks))
            return "unable to parse stacks of cylinder for ID " + id;

        cylinder.slices = this.reader.getFloat(children[index], 'slices');
        if (!this.validateFloat(cylinder.slices))
            return "unable to parse slices of cylinder for ID " + id;

        this.primitives[id] = this.createCylinder(cylinder);
        return null;
    }


    parseRectangle(children, index, id) {
        var rectangle = {
            x1: null,
            y1: null,
            x2: null,
            y2: null
        }
        rectangle.x1 = this.reader.getFloat(children[index], 'x1');
        if (!this.validateFloat(rectangle.x1))
            return "unable to parse x1 of rectangle for ID " + id;

        rectangle.y1 = this.reader.getFloat(children[index], 'y1');
        if (!this.validateFloat(rectangle.y1))
            return "unable to parse y1 of rectangle for ID " + id;

        rectangle.x2 = this.reader.getFloat(children[index], 'x2');
        if (!this.validateFloat(rectangle.x2))
            return "unable to parse x2 of rectangle for ID " + id;

        rectangle.y2 = this.reader.getFloat(children[index], 'y2');
        if (!this.validateFloat(rectangle.y2))
            return "unable to parse y2 of rectangle for ID " + id;

        this.primitives[id] = this.createRectangle(rectangle);
        return null;

    }

    parseTriangle(children, index, id) {
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
        if (!this.validateFloat(triangle.x1))
            return "unable to parse x1 of triangle for ID " + id;
        if (!this.validateFloat(triangle.y1))
            return "unable to parse y1 of triangle for ID " + id;
        if (!this.validateFloat(triangle.z1))
            return "unable to parse z1 of triangle for ID " + id;

        var { x, y, z } = this.parsePointXYZ(children, 'x2', 'y2', 'z2', index);
        triangle.x2 = x;
        triangle.y2 = y;
        triangle.z2 = z;
        if (!this.validateFloat(triangle.x2))
            return "unable to parse x2 of triangle for ID " + id;
        if (!this.validateFloat(triangle.y2))
            return "unable to parse y2 of triangle for ID  " + id;
        if (!this.validateFloat(triangle.z2))
            return "unable to parse z2 of triangle for ID  " + id;

        var { x, y, z } = this.parsePointXYZ(children, 'x3', 'y3', 'z3', index);
        triangle.x3 = x;
        triangle.y3 = y;
        triangle.z3 = z;
        if (!this.validateFloat(triangle.x3))
            return "unable to parse x3 of triangle for ID " + id;
        if (!this.validateFloat(triangle.y3))
            return "unable to parse y3 of triangle for ID " + id;
        if (!this.validateFloat(triangle.z3))
            return "unable to parse z3 of triangle for ID " + id;

        this.primitives[id] = this.createTriangle(triangle);
        return null;
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

    parseAndValidateRGBAvalues(children, index, id, s1, s2, vector) {

        var { x, y, z, w } = this.parsePointRGBA(children, index);
        if (!this.isFloatInBetween(x, 0, 1)) {
            x = 0.3;
            this.onXMLMinorError("unable to parse " + s1 + " r-value of the " + s2 + " for ID " + id + " default: r = " + x);
        }
        if (!this.isFloatInBetween(y, 0, 1)) {
            y = 0.3;
            this.onXMLMinorError("unable to parse " + s1 + " g-value of the " + s2 + " for ID  " + id + " default: g = " + y);
        }
        if (!this.isFloatInBetween(z, 0, 1)) {
            z = 0.3;
            this.onXMLMinorError("unable to parse " + s1 + " b-value of the " + s2 + " for ID " + id + " default: b = " + z);
        }
        if (!this.isFloatInBetween(w, 0, 1)) {
            w = 0.3;
            this.onXMLMinorError("unable to parse " + s1 + " a-value of the " + s2 + " for ID " + id + " default: a = " + w);
        }
        vector.push(x, y, z, w);
        return null;
    }



    parseAndValidateXYZvalues(children, index, id, s1, s2, vector) {
        var { x, y, z } = this.parsePointXYZ(children, 'x', 'y', 'z', index);
        if (!this.validateFloat(x))
            return "unable to parse " + s1 + " x-coordinate of " + s2 + " position for ID " + id;
        if (!this.validateFloat(y))
            return "unable to parse " + s1 + " y-coordinate of " + s2 + " position for ID " + id;
        if (!this.validateFloat(z))
            return "unable to parse " + s1 + " z-coordinate of " + s2 + " position for ID " + id;
        vector.push(x, y, z);
        return null;
    }


    parseAndValidateXYZWvalues(children, index, id, s1, s2, vector) {
        var { x, y, z, w } = this.parsePointXYZW(children, 'x', 'y', 'z', 'w', index);
        if (!this.validateFloat(x))
            return "unable to parse " + s1 + " x-coordinate of " + s2 + " position for ID " + id;
        if (!this.validateFloat(y))
            return "unable to parse " + s1 + " y-coordinate of " + s2 + " position for ID " + id;
        if (!this.validateFloat(z))
            return "unable to parse " + s1 + " z-coordinate of " + s2 + " position for ID " + id;
        if (!this.validateFloat(w))
            return "unable to parse " + s1 + " w-coordinate of " + s2 + " position for ID " + id;
        vector.push(x, y, z, w);
        return null;
    }


    validateFloat(float) {
        if (!(float != null && !isNaN(float)))
            return false;
        else
            return true;
    }

    validateString(string) {
        return (typeof string === 'string' && string != null);
    }


    validateAxis(axis) {
        switch (axis) {
            case "x":
            case "X":
            case "y":
            case "Y":
            case "z":
            case "Z":
                return true;
            default:
                return false;
        }
    }

    isMaterial(id)
    {
        switch(id){
            case INHERIT:
            return true;
            default:
            return (this.materials[id] != null);
        }
    }

    isTexture(id)
    {
        switch(id){
            case INHERIT:
            case NONE:
            return true;
            default:
            return(this.textures[id] != null);
        }
    }

    

    isComponent(id)
    {
        return (this.components[id] != null);
    }

    isTransformation(id)
    {
        return(this.transformations[id]!=null);
    }

    isPrimitive(id)
    {
        return (this.primitives[id] != null);
    }

    validateViewsDefaultValue()
    {
        if(this.views.views[this.views.default] == null)
            return "invalid default value for views :  " + this.views.default;  
        return null;
    }

    validateRootComponent()
    {
        if (this.components[this.root] == null)
            return "invalid root component ID " + this.root;
        return null;
    }

    validateComponentsChildren()
    {
        for(let key in this.components)
        {
            let component = this.components[key];
            for (let i = 0; i < component.children.componentsRef.length; i++)
            {
                let child = component.children.componentsRef[i];
                for(let j = 0; j < component.children.primitivesRef; j++){
                    let primChild = component.children.primitiveRef[j];
                }

                if(!this.isComponent(child))
                    return "invalid id defined for component children " + child + " for component ID: " + key;
            }
        }
        return null;
    }



    isInBetween(float, lower, upper) {
        return (float >= lower && float <= upper)
    }

    isFloatInBetween(float, lower, upper) {
        return (this.validateFloat(float) && this.isInBetween(float, lower, upper));
    }


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

    applyTextureFactors()
    {
        
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        // entry point for graph rendering
        var transformations = [];
        var materials = [];
        var textures = [];
        this.visitNode(this.components[this.root], transformations, materials, textures, false,0);

    }

    applyTransformationsPush(transformations) {
        for (let i = 0; i < transformations.length; i++) {
            this.applyTransformation(transformations[i]);
        }
    }

    applyTransformations(transformations) {
        for (var key in transformations) {
            this.applyTransformation(transformations[key]);
        }
    }

    applyTransformation(transformation) {
        switch (transformation.class) {
            case "translate":
                this.scene.translate(transformation.x, transformation.y, transformation.z);
                break;
            case "scale":
                this.scene.scale(transformation.x, transformation.y, transformation.z);
                break;
            case "rotate":
                this.applyRotate(transformation);
                break;
            default: 
                this.onXMLError("invalid transformation to apply");
                break;
        }
    }
    applyRotate(rotate) {
        var angle = Math.PI / 180 * rotate.angle;
        switch (rotate.axis) {
            case "x":
            case "X":
                this.scene.rotate(angle, 1, 0, 0);
                break;
            case "y":
            case "Y":
                this.scene.rotate(angle, 0, 1, 0);
                break;
            case "z":
            case "Z":
                this.scene.rotate(angle, 0, 0, 1);
                break;
            default: 
                this.onXMLError("Invalid axis to rotate");
                break;
        }
    }

    checkLengthInherit(texture,textures)
    {
        var tmp_t = textures[textures.length - 1];
        if(texture.length_s != 0)
            tmp_t.length_s = texture.length_s;
        if(texture.length_t != 0)
            tmp_t.length_t = texture.length_t;
        if(texture.length_t == 0 && texture.length_s == 0)
            textures.push(textures[textures.length - 1]);
        else
            textures.push(tmp_t);
    }

    pushTexture(texture, textures, none_texture) {
        switch (texture.id) {
            case INHERIT:
                if (!none_texture)
                   this.checkLengthInherit(texture, textures);
                else
                    return true;
                break;
            case NONE:
                return true;
            default:
                textures.push(texture);
                break;
        }
        return false;
    }

    pushMaterials(materials, node, parent_currentMaterialIndex) {
        var is_inherit = false;
        switch (node.materials[node.currentMaterialIndex]) {
            case INHERIT:
                if (node.materials.length <= 1) {
                    materials.push(materials[materials.length - 1]);
                    is_inherit = true;
                }
                else {
                    let mat = materials[materials.length - 1][parent_currentMaterialIndex];
                    let copy = node.materials;
                    copy[node.currentMaterialIndex] = mat;
                    materials.push(copy);
                }
                break;
            default:
                materials.push(node.materials);
                break;
        }
        return is_inherit;
    }


    visitNode(node, transformations, materials, textures, none_texture,parent_currentMaterialIndex = null) {


        none_texture = this.pushTexture(node.texture, textures, none_texture);

        let is_inherit = this.pushMaterials(materials, node, parent_currentMaterialIndex);

        transformations.push(node.transformations);
        let index = 0;
        this.scene.pushMatrix();
        if (node.transformations.tref) {
            this.applyTransformations(this.transformations[node.transformations.trefID]);
        }
        else {
            this.applyTransformationsPush(node.transformations.transformations);
        }

        if (is_inherit)
            index = parent_currentMaterialIndex;
        else
            index = node.currentMaterialIndex;
        for (let i = 0; i < node.children.primitivesRef.length; i++) {
            this.visitLeaf(node.children.primitivesRef[i], materials, textures, index, none_texture);
        }
        for (let i = 0; i < node.children.componentsRef.length; i++) {
            this.visitNode(this.components[node.children.componentsRef[i]], transformations, materials, textures, none_texture, index);
        }

        this.scene.popMatrix();
        transformations.pop();
        materials.pop();
        if (!none_texture)
            textures.pop();
        return null;
    }

    visitLeaf(leaf, materials, textures, currentMaterialIndex, none_texture = null) {
        let prim = this.primitives[leaf];
        this.scene.pushMatrix();
        let text = textures[textures.length - 1];
        let mat = materials[materials.length - 1];
        let m = this.materials[mat[currentMaterialIndex]];
        m.apply();
        if (!none_texture){
           if(prim.constructor.name == "MyRectangle" || prim.constructor.name == "MyTriangle")
               prim.updateTexCoordLength(text.length_s,text.length_t);
            this.textures[text.id].bind();

        }
        
        prim.display();
        this.scene.popMatrix();
    }

    updateComponentsCurrentMaterialIndex() {
        for (let key in this.components) {
            let comp = this.components[key];
            if (comp.currentMaterialIndex >= comp.materials.length-1)
                comp.currentMaterialIndex = 0;
            else
                comp.currentMaterialIndex++;
        }
    }
}



