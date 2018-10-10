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
        this.perspectives = [];
        this.orthos = [];
        var grandChildren = [];
        var nodeNames = [];
        var numViews = 0;

        //nao sei pode ser este o valor de default  
        this.default = this.reader.getString(viewsNode, 'default');
        //acho que este isNaN nao devia estar aqui
        if (this.default == null) {
            this.default = "views_default";
            this.onXMLMinorError("unable to parse value for views default; assuming 'default = views_default'");
        }


        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName == "perspective") {
                //get the id of current perspective
                var perspectiveId = this.reader.getString(children[i], 'id');
                if (perspectiveId == null)
                    return "no ID defined for view";

                // Checks for repeated IDs.
                if (this.perspectives[perspectiveId] != null)
                    return "ID must be unique for each view (conflict: ID = " + perspectiveId + ")";

                //get the near value of current perspective
                var near = this.reader.getFloat(children[i], 'near');
                if (near == null)
                    return "no near defined for perspective";

                //get the far value of current perspective
                var far = this.reader.getFloat(children[i], 'far');
                if (far == null)
                    return "no far defined for perspective";

                //get the angle value of current perspective
                var angle = this.reader.getFloat(children[i], 'angle');
                if (angle == null)
                    return "no angle defined for perspective";

                grandChildren = children[i].children;
                if (grandChildren.length != 2)
                    return "incorrect number of children of perspective";

                nodeNames = [];
                for (var j = 0; j < grandChildren.length; j++) {
                    nodeNames.push(grandChildren[j].nodeName);
                }

                var fromIndex = nodeNames.indexOf("from");
                var toIndex = nodeNames.indexOf("to");

                if (fromIndex == -1)
                    return "perspective's from position undefined for ID = " + perspectiveId;

                if (fromIndex == -1)
                    return "perspective's to position undefined for ID = " + perspectiveId;

                var fromPosition = [];
                var toPosition = [];

                //reads the from position
                var { x, y, z } = this.parsePointXYZ(grandChildren, 'x', 'y', 'z', fromIndex);
                if (!this.validateFloat(x))
                    return "unable to parse from x-coordinate of the perspective position for ID = " + perspectiveId;
                if (!this.validateFloat(y))
                    return "unable to parse from y-coordinate of the perspective position for ID = " + perspectiveId;
                if (!this.validateFloat(z))
                    return "unable to parse from z-coordinate of the perspective position for ID = " + perspectiveId;
                fromPosition.push(x, y, z);

                //reads the to position
                var { x, y, z } = this.parsePointXYZ(grandChildren, 'x', 'y', 'z', toIndex);
                if (!this.validateFloat(x))
                    return "unable to parse to x-coordinate of the perspective position for ID = " + perspectiveId;
                if (!this.validateFloat(y))
                    return "unable to parse to y-coordinate of the perspective position for ID = " + perspectiveId;
                if (!this.validateFloat(z))
                    return "unable to parse to z-coordinate of the perspective position for ID = " + perspectiveId;
                toPosition.push(x, y, z);

                this.perspectives[perspectiveId] = [near, far, angle, fromPosition, toPosition];

            }
            else {
                if (children[i].nodeName == "ortho") {
                    //get the id of current ortho
                    var orthoId = this.reader.getString(children[i], 'id');
                    if (orthoId == null)
                        return "no ID defined for view";

                    // Checks for repeated IDs.
                    if (this.orthos[orthoId] != null)
                        return "ID must be unique for each view (conflict: ID = " + orthoId + ")";

                    //get the near value of current ortho
                    var near = this.reader.getFloat(children[i], 'near');
                    if (near == null)
                        return "no near defined for ortho";

                    //get the far value of current ortho
                    var far = this.reader.getFloat(children[i], 'far');
                    if (far == null)
                        return "no far defined for ortho";

                    //get the left value of current ortho
                    var left = this.reader.getFloat(children[i], 'left');
                    if (left == null)
                        return "no left defined for ortho";

                    //get the right value of current ortho
                    var right = this.reader.getFloat(children[i], 'right');
                    if (right == null)
                        return "no right defined for ortho";

                    //get the top value of current ortho
                    var top = this.reader.getFloat(children[i], 'top');
                    if (top == null)
                        return "no top defined for ortho";

                    //get the bottom value of current ortho
                    var bottom = this.reader.getFloat(children[i], 'bottom');
                    if (bottom == null)
                        return "no bottom defined for ortho";

                    this.orthos[orthoId] = [near, far, left, right, top, bottom];
                }
                else {
                    this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                    continue;
                }
            }
            numViews++;
        }

        if (numViews == 0)
            return "at least one view must be defined";

        this.log("Parsed views");
        return null;
    }

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
        //TODO tentar eliminar o codigo duplicado

        var children = lightsNode.children;
        this.omnis = [];
        this.spots = [];
        var grandChildren = [];
        var nodeNames = [];
        var numLights = 0;

        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName == "omni") {

                //get the id of current light
                var omniId = this.reader.getString(children[i], 'id');
                if (omniId == null)
                    return "no ID defined for light";

                // Checks for repeated IDs.
                if (this.omnis[omniId] != null)
                    return "ID must be unique for each light (conflict: ID = " + omniId + ")";

                //get the enabled value of current omni
                var enabled = this.reader.getFloat(children[i], 'enabled');
                if (enabled == null)
                    return "no enabled defined for omni";

                grandChildren = children[i].children;

                nodeNames = [];
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
                var { x, y, z, w } = this.parsePointXYZW(grandChildren, 'x', 'y', 'z', 'w', locationIndex);
                if (!this.validateFloat(x))
                    return "unable to parse location x-coordinate of the omni for ID = " + omniId;
                if (!this.validateFloat(y))
                    return "unable to parse location y-coordinate of the omni for ID = " + omniId;
                if (!this.validateFloat(z))
                    return "unable to parse location z-coordinate of the omni for ID = " + omniId;
                if (!this.validateFloat(w))
                    return "unable to parse location w-coordinate of the omni for ID = " + omniId;
                location.push(x, y, z, w);

                //reads the ambient values
                var { x, y, z, w } = this.parsePointRGBA(grandChildren, ambientIndex);
                if (!this.validateFloat(x))
                    return "unable to parse ambient r-value of the omni for ID = " + omniId;
                if (!this.validateFloat(y))
                    return "unable to parse ambient g-value of the omni for ID = " + omniId;
                if (!this.validateFloat(z))
                    return "unable to parse ambient b-value of the omni for ID = " + omniId;
                if (!this.validateFloat(w))
                    return "unable to parse ambient a-value of the omni for ID = " + omniId;
                ambient.push(x, y, z, w);

                //reads the diffuse values 
                var { x, y, z, w } = this.parsePointRGBA(grandChildren, diffuseIndex);
                if (!this.validateFloat(x))
                    return "unable to parse diffuse r-value of the omni for ID = " + omniId;
                if (!this.validateFloat(y))
                    return "unable to parse diffuse g-value of the omni for ID = " + omniId;
                if (!this.validateFloat(z))
                    return "unable to parse diffuse b-value of the omni for ID = " + omniId;
                if (!this.validateFloat(w))
                    return "unable to parse diffuse a-value of the omni for ID = " + omniId;
                diffuse.push(x, y, z, w);

                //reads the specular values
                var { x, y, z, w } = this.parsePointRGBA(grandChildren, specularIndex);
                if (!this.validateFloat(x))
                    return "unable to parse specular r-value of the omni for ID = " + omniId;
                if (!this.validateFloat(y))
                    return "unable to parse specular g-value of the omni for ID = " + omniId;
                if (!this.validateFloat(z))
                    return "unable to parse specular b-value of the omni for ID = " + omniId;
                if (!this.validateFloat(w))
                    return "unable to parse specular a-value of the omni for ID = " + omniId;
                specular.push(x, y, z, w);


                this.omnis[omniId] = [enabled, location, ambient, diffuse, specular];

            }
            else {
                if (children[i].nodeName == "spot") {

                    //get the id of current light
                    var spotId = this.reader.getString(children[i], 'id');
                    if (spotId == null)
                        return "no ID defined for light";

                    // Checks for repeated IDs.
                    if (this.spots[spotId] != null)
                        return "ID must be unique for each light (conflict: ID = " + spotId + ")";

                    //get the enabled value of current spot
                    var enabled = this.reader.getFloat(children[i], 'enabled');
                    if (enabled == null)
                        return "no enabled defined for spot";

                    //get the angle value of current spot
                    var angle = this.reader.getFloat(children[i], 'angle');
                    if (angle == null)
                        return "no angle defined for spot";

                    //get the exponent value of current spot
                    var exponent = this.reader.getFloat(children[i], 'exponent');
                    if (exponent == null)
                        return "no exponent defined for spot";

                    grandChildren = children[i].children;
                    nodeNames = [];
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
                    var { x, y, z, w } = this.parsePointXYZW(grandChildren, 'x', 'y', 'z', 'w', locationIndex);
                    if (!this.validateFloat(x))
                        return "unable to parse location x-coordinate of the spot for ID = " + spotId;
                    if (!this.validateFloat(y))
                        return "unable to parse location y-coordinate of the spot for ID = " + spotId;
                    if (!this.validateFloat(z))
                        return "unable to parse location z-coordinate of the spot for ID = " + spotId;
                    if (!this.validateFloat(w))
                        return "unable to parse location w-coordinate of the spot for ID = " + spotId;
                    location.push(x, y, z, w);

                    //reads the target values
                    var { x, y, z} = this.parsePointXYZ(grandChildren, 'x', 'y', 'z', targetIndex);
                    if (!this.validateFloat(x))
                        return "unable to parse target x-coordinate of the spot for ID = " + spotId;
                    if (!this.validateFloat(y))
                        return "unable to parse target y-coordinate of the spot for ID = " + spotId;
                    if (!this.validateFloat(z))
                        return "unable to parse target z-coordinate of the spot for ID = " + spotId;
                    target.push(x, y, z);

                    //reads the ambient values
                    var { x, y, z, w } = this.parsePointRGBA(grandChildren, ambientIndex);
                    if (!this.validateFloat(x))
                        return "unable to parse ambient r-value of the spot for ID = " + spotId;
                    if (!this.validateFloat(y))
                        return "unable to parse ambient g-value of the spot for ID = " + spotId;
                    if (!this.validateFloat(z))
                        return "unable to parse ambient b-value of the spot for ID = " + spotId;
                    if (!this.validateFloat(w))
                        return "unable to parse ambient a-value of the spot for ID = " + spotId;
                    ambient.push(x, y, z, w);

                    //reads the diffuse values
                    var { x, y, z, w } = this.parsePointRGBA(grandChildren, diffuseIndex);
                    if (!this.validateFloat(x))
                        return "unable to parse diffuse r-value of the spot for ID = " + spotId;
                    if (!this.validateFloat(y))
                        return "unable to parse diffuse g-value of the spot for ID = " + spotId;
                    if (!this.validateFloat(z))
                        return "unable to parse diffuse b-value of the spot for ID = " + spotId;
                    if (!this.validateFloat(w))
                        return "unable to parse diffuse a-value of the spot for ID = " + spotId;
                    diffuse.push(x, y, z, w);

                    //reads the specular values
                    var { x, y, z, w } = this.parsePointRGBA(grandChildren, specularIndex);
                    if (!this.validateFloat(x))
                        return "unable to parse specular r-value of the spot for ID = " + spotId;
                    if (!this.validateFloat(y))
                        return "unable to parse specular g-value of the spot for ID = " + spotId;
                    if (!this.validateFloat(z))
                        return "unable to parse specular b-value of the spot for ID = " + spotId;
                    if (!this.validateFloat(w))
                        return "unable to parse specular a-value of the spot for ID = " + spotId;
                    specular.push(x, y, z, w);

                    this.spots[spotId] = [enabled, angle, exponent, location, target, ambient, diffuse, specular];
                }
                else {
                    this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                    continue;
                }
            }
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";

        this.log("Parsed lights");
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
        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName == "texture") {
                //get the id of current texture
                var textureId = this.reader.getString(children[i], 'id');
                if (textureId == null)
                    return "no ID defined for texture";

                // Checks for repeated IDs.
                if (this.textures[textureId] != null)
                    return "ID must be unique for each texture (conflict: ID = " + textureId + ")";

                //get the enabled value of current omni
                var file = this.reader.getString(children[i], 'file');
                if (file == null)
                    return "no file defined for texture";

                this.textures[textureId] = [file];
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
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        var children = materialsNode.children;
        this.materials = [];
        var numMaterials = 0;
        var grandChildren = [];
        var nodeNames = [];
        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName == "material") {
                //get the id of current material
                var materialId = this.reader.getString(children[i], 'id');
                if (materialId == null)
                    return "no ID defined for material";

                // Checks for repeated IDs.
                if (this.materials[materialId] != null)
                    return "ID must be unique for each material (conflict: ID = " + materialId + ")";

                //get the shininess value of current material
                var shininess = this.reader.getFloat(children[i], 'shininess');
                if (shininess == null)
                    return "no shininess defined for material";

                grandChildren = children[i].children;
                nodeNames = [];
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

                var emission = [];
                var ambient = [];
                var diffuse = [];
                var specular = [];

                //reads the emission values
                var{x,y,z,w} = this.parsePointRGBA(grandChildren,emissionIndex);
                if (!this.validateFloat(x))
                    return "unable to parse emission r-value of ambient for ID = " + materialId;
                if (!this.validateFloat(y))
                    return "unable to parse emission g-value of ambient for ID = " + materialId;
                if (!this.validateFloat(z))
                    return "unable to parse emission b-value of ambient for ID = " + materialId;
                if (!this.validateFloat(w))
                 return "unable to parse emission a-value of ambient for ID = " + materialId;
                emission.push(x,y,z,w);

                //reads the ambient values
                var{x,y,z,w} = this.parsePointRGBA(grandChildren,ambientIndex);
                if (!this.validateFloat(x))
                    return "unable to parse ambient r-value of ambient for ID = " + materialId;
                if (!this.validateFloat(y))
                    return "unable to parse ambient g-value of ambient for ID = " + materialId;
                if (!this.validateFloat(z))
                    return "unable to parse ambient b-value of ambient for ID = " + materialId;
                if (!this.validateFloat(w))
                    return "unable to parse ambient a-value of ambient for ID = " + materialId;
                ambient.push(x,y,z,w);


                //reads the diffuse values
                var{x,y,z,w} = this.parsePointRGBA(grandChildren,diffuseIndex);
                if (!this.validateFloat(x))
                    return "unable to parse diffuse r-value of ambient for ID = " + materialId;
                if (!this.validateFloat(y))
                    return "unable to parse diffuse g-value of ambient for ID = " + materialId;
                if (!this.validateFloat(z))
                    return "unable to parse diffuse b-value of ambient for ID = " + materialId;
                if (!this.validateFloat(w))
                    return "unable to parse diffuse a-value of ambient for ID = " + materialId;
                diffuse.push(x,y,z,w);

                //reads the specular values
                var{x,y,z,w} = this.parsePointRGBA(grandChildren,specularIndex);
                if (!this.validateFloat(x))
                    return "unable to parse specular r-value of ambient for ID = " + materialId;
                if (!this.validateFloat(y))
                    return "unable to parse specular g-value of ambient for ID = " + materialId;
                if (!this.validateFloat(z))
                    return "unable to parse specular b-value of ambient for ID = " + materialId;
                if (!this.validateFloat(w))
                    return "unable to parse specular a-value of ambient for ID = " + materialId;
                specular.push(x,y,z,w);
                
                this.materials[materialId] = [shininess, emission, ambient, diffuse, specular];
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


    /**
     * Parses the <transformations> node.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        var children = transformationsNode.children;
        this.transformations = [];
        var numTransformations = 0;
        var grandChildren = [];
        var nodeNames = [];
        var translations = [];
        var rotations = [];
        var scales = [];
        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName == "transformation") {
                translations = [];
                rotations = [];
                scales = [];
                var numT = 0;
                //get the id of current transformation
                var transformationId = this.reader.getString(children[i], 'id');
                if (transformationId == null)
                    return "no ID defined for transformation";

                // Checks for repeated IDs.
                if (this.transformations[transformationId] != null)
                    return "ID must be unique for each transformation (conflict: ID = " + transformationId + ")";

                grandChildren = children[i].children;
                nodeNames = [];
                for (var j = 0; j < grandChildren.length; j++) {
                    nodeNames.push(grandChildren[j].nodeName);
                }

                for (var j = 0; j < grandChildren.length; j++) {
                    var nodeName = grandChildren[j].nodeName;
                    switch (nodeName) {
                        case "translate":
                            var translate = this.parseTranslate(grandChildren, j);
                            translations.push(translate);
                            numT++;
                            break;
                        case "rotate":
                            var rotate = this.parseRotate(grandChildren, j);
                            rotations.push(rotate);
                            numT++;
                            break;
                        case "scale":
                            var scale = this.parseScale(grandChildren, j);
                            scales.push(scale);
                            numT++;
                            break;
                        default:
                            this.onXMLMinorError("unknown tag <" + grandChildren[i].nodeName + ">");
                            break;
                    }
                }
                if (numT == 0)
                    return "at least one transformation must be defined";

                this.transformations[transformationId] = [translations, rotations, scales];
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



    //nao existe get int
    /**
     * Parses the <primitives> node.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        //Important new arrays should be added according to new primitives
        var children = primitivesNode.children;
        //this.primitives = [];
        var numPrimitives = 0;
        var grandChildren = [];
        var nodeNames = [];
        this.triangles = [];
        this.rectangles = [];
        this.spheres = [];
        this.cylinders = [];
        this.torus = [];
        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName == "primitive") {


                var primitiveId = this.reader.getString(children[i], 'id');
                if (primitiveId == null)
                    return "no Id defined for primitive";
                if (this.triangles[primitiveId] != null || this.rectangles[primitiveId] != null || this.spheres[primitiveId] != null
                    || this.cylinders[primitiveId] != null || this.torus[primitiveId] != null)
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
                        this.triangles[primitiveId] = [triangle];
                        break;

                    case "rectangle":
                        var rectangle = this.parseRetangle(grandChildren, 0);
                        this.rectangles[primitiveId] = [rectangle];
                        break;

                    case "cylinder":
                        var cylinder = this.parseCylinder(grandChildren, 0);
                        this.cylinders[primitiveId] = [cylinder];
                        break;

                    case "sphere":
                        var sphere = this.parseSphere(grandChildren, 0);
                        this.spheres[primitiveId] = [sphere];
                        break;

                    case "torus":
                        var g_torus = this.parseTorus(grandChildren, 0);
                        this.torus[primitiveId] = [g_torus];
                        break;

                    default:
                        this.onXMLMinorError("unknown tag <" + grandChildren[i].nodeName + ">");
                        break;
                }

                /* if(numP == 0)
                 return "at least one primitive must be defined";
 
                 this.primitives[primitiveId] = [triangles, rectangles, cylinders, spheres, torus2];*/

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


    /*
  
    4) se nas transformations tiver um bloco de transformacoes e as diferentes transformacoes forem guardadas 
    individualmente nesse bloco, vai ser impossivel le las sem saber a ordem delas...
    tem que se guardar as rotacoes num array de rotacoes, os scales num array de scales...etc, e depois guardar esses
    arrays dentro do array transformations (de modo a definir qual a posicao do array transformations vai 
    corresponder a cada tipo de transformacao ) ou usar uma struct....
    */

    /**
     * Parses the <components> node.
     * @param {components block element} componentsNode
     */
    parseComponents(componentsNode) {

        var children = componentsNode.children;
        this.components = [];
        var numComponents = 0;
        var grandChildren = [];
        var nodeNames = [];
        var translates = [];
        var rotates = [];
        var scales = [];
        var transformations = [];
        
        for (var i = 0; i < children.length; i++) {
            var component = [];
            if (children[i].nodeName == "component") {
                var componentId = this.reader.getString(children[i], "id");
                if (componentId == null)
                    return "no Id defined for component";

                grandChildren = children[i].children;
                nodeNames = [];

                for (var j = 0; j < grandChildren.length; j++) {
                    nodeNames.push(grandChildren[j].nodeName);
                }
                for (var j = 0; j < grandChildren.length; j++) {

                    var nodeName = grandChildren[j].nodeName;
                    var ggrandChildren = grandChildren[j].children; //g(rand)grandchildren
                    var tref = false;
                    switch (nodeName) {
                        case "transformation":
                            for (var k = 0; k < ggrandChildren.length; k++) {
                                var nodeName2 = ggrandChildren[k].nodeName;
                                if(nodeName == "transformationref")
                                {
                                       //var transformationRef = [];
                                       var tref = this.reader.getString(ggrandChildren[k], 'id');
                                       //transformationRef.push(tref)
                                       //transformation.push(transformationRef);
                                       transformations.push(tref);
                                       tref = true;
                                }
                                else{
                                switch (nodeName2) {
                                    case "translate":
                                        var translate = [];
                                        var x = this.reader.getFloat(ggrandChildren[k], 'x');
                                        var y = this.reader.getFloat(ggrandChildren[k], 'y');
                                        var z = this.reader.getFloat(ggrandChildren[k], 'z');
                                        translate.push(x, y, z);
                                        translates.push(translate);
                                        break;

                                    case "rotate":
                                        var rotate = [];
                                        var axis = this.reader.getString(ggrandChildren[k], 'axis');
                                        var angle = this.reader.getFloat(ggrandChildren[k], 'angle');
                                        rotate.push(axis, angle);
                                        rotates.push(rotate);
                                        break;

                                    case "scale":
                                        var scale = [];
                                        var x = this.reader.getFloat(ggrandChildren[k], 'x');
                                        var y = this.reader.getFloat(ggrandChildren[k], 'y');
                                        var z = this.reader.getFloat(ggrandChildren[k], 'z');
                                        scale.push(x, y, z);
                                        scales.push(scale);
                                        break;
                                    default:
                                        this.onXMLMinorError("unknown tag <" + ggrandChildren[k].nodeName + ">");
                                        break;
                                    }
                                }
                            }
                            if(!tref)
                                transformations.push(translates,rotates,scales);
                            break;

                        case "materials":
                            var materials = [];
                            for (var k = 0; k < ggrandChildren.length; k++) {
                                var nodeName2 = ggrandChildren[k].nodeName;
                                if (nodeName2 == "material") {
                                    var id = this.reader.getString(ggrandChildren[k], 'id');
                                    materials.push(id);
                                }
                                else
                                    this.onXMLMinorError("unknown tag <" + ggrandChildren[k].nodeName + ">");

                            }
                            break;

                        case "texture":
                            var texture = [];
                            var id = this.reader.getString(grandChildren[j], 'id');
                            var s = this.reader.getFloat(grandChildren[j], 'length_s');
                            var t = this.reader.getFloat(grandChildren[j], 'length_t');
                            texture.push(id, s, t);
                            break;

                        case "children":
                            var numP = 0; // number of primitives
                            var numComp = 0; // number of components
                            var children =[];
                            var primitives =[];
                            var components2 = [];
                            for (var k = 0; k < ggrandChildren.length; k++) {
                                var nodeName2 = ggrandChildren[k].nodeName;
                                switch (nodeName2) {
                                    case "componentref":
                                        var idC = this.reader.getString(ggrandChildren[k], 'id');
                                        components2.push(idC);
                                        break;
                                    case "primitiveref":
                                        var idP = this.reader.getString(ggrandChildren[k], 'id');
                                        primitives.push(idP);
                                        break;
                                    default:
                                        this.onXMLMinorError("unknown tag <" + ggrandChildren[k].nodeName + ">");
                                        break;
                                }
                            }
                            children.push(primitives);
                            children.push(components2);
                            break;

                        default:
                            this.onXMLMinorError("unknown tag <" + grandChildren[j].nodeName + ">");
                            break;
                    }
                }
            }
            else
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
           
            component.push(transformations, materials, texture, children);
            numComponents++;
            this.components.push(component);
        }
        this.log("Parsed components");
        return null;
    }


    /**usar na das components tambem */
    /****mudar de sitio *************/
    parseTorus(children, index) {
        var g_torus = [];
        var inner = this.reader.getFloat(children[index], 'inner');
        var outer = this.reader.getFloat(children[index], 'outer');
        var slices = this.reader.getFloat(children[index], 'slices');
        var loops = this.reader.getFloat(children[index], 'loops');
        g_torus.push(inner, outer, slices, loops);
        return g_torus;
    }

    parseSphere(children, index) {
        var sphere = [];
        var radius = this.reader.getFloat(children[index], 'radius');
        var stacks = this.reader.getFloat(children[index], 'stacks');
        var slices = this.reader.getFloat(children[index], 'slices');
        sphere.push(radius, stacks, slices);
        return sphere;
    }

    parseCylinder(children, index) {
        var cylinder = [];
        var base = this.reader.getFloat(children[index], 'base');
        var top = this.reader.getFloat(children[index], 'top');
        var height = this.reader.getFloat(children[index], 'height');
        var stacks = this.reader.getFloat(children[index], 'stacks');
        var slices = this.reader.getFloat(children[index], 'slices');
        cylinder.push(base, top, height, stacks, slices);
        return cylinder;
    }

    parseRetangle(children, index) {
        var rectangle = [];
        var x = this.reader.getFloat(children[index], 'x1');
        var y = this.reader.getFloat(children[index], 'y1');
        rectangle.push(x, y);
        var x = this.reader.getFloat(children[index], 'x2');
        var y = this.reader.getFloat(children[index], 'y2');
        rectangle.push(x, y);
        return rectangle;
    }

    parseTriangle(children, index) {
        var triangle = [];
        var { x, y, z } = this.parsePointXYZ(children, 'x1', 'y1', 'z1', index);
        triangle.push(x, y, z);
        var { x, y, z } = this.parsePointXYZ(children, 'x2', 'y2', 'z2', index);
        triangle.push(x, y, z);
        var { x, y, z } = this.parsePointXYZ(children, 'x3', 'y3', 'z3', index);
        triangle.push(x, y, z);
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

    /*****mudar de sitio********/
    parseScale(children, index) {
        var scale = [];
        var { x, y, z } = this.parsePointXYZ(children, 'x', 'y', 'z', index);
        scale.push(x, y, z);
        return scale;
    }

    parseRotate(children, index) {
        var rotate = [];
        var axis = this.reader.getString(children[index], 'axis');
        var angle = this.reader.getFloat(children[index], 'angle');
        rotate.push(axis, angle);
        return rotate;
    }

    parseTranslate(children, index) {
        var translate = [];
        var { x, y, z } = this.parsePointXYZ(children, 'x', 'y', 'z', index);
        translate.push(x, y, z);
        return translate;
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

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        // entry point for graph rendering
        //TODO: Render loop starting at root of graph
    }




}