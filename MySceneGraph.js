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
            if (index != INITIALS_INDEX)
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

        if ((this.root == null || isNaN(this.root))) {
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
        if ((this.root == null || isNaN(this.root))) {
            this.default = "views_default";
            this.onXMLMinorError("unable to parse value for views default; assuming 'default = views_default'");
        }


        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName == "perspective") {
                //get the id of current perspective
                var perspectiveId = this.reader.getString(children[i], 'id');
                if (perspectiveId == null)
                    return "no ID defined for perspective";

                // Checks for repeated IDs.
                if (this.perspectives[perspectiveId] != null)
                    return "ID must be unique for each perspective (conflict: ID = " + perspectiveId + ")";

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
                if (grandChildren.length() != 2)
                    return "incorrect number of children of perspective";

                nodeNames = [];
                for (var j = 0; j < grandChildren.length; j++) {
                    nodeNames.push(grandChildren[j].nodeName);
                }

                var fromIndex = nodeNames.indexOf("from");
                var toIndex = nodeName.indexOf("to");

                if (fromIndex == -1)
                    return "perspective from position undefined for ID = " + perspectiveId;

                if (fromIndex == -1)
                    return "perspective to position undefined for ID = " + perspectiveId;

                var fromPosition = [];
                var toPosition = [];

                //reads the from position
                var x = this.reader.getFloat(grandChildren[fromIndex], 'x');
                if (!(x != null && !isNaN(x)))
                    return "unable to parse from x-coordinate of the perspective position for ID = " + perspectiveId;
                else
                    fromPosition.push(x);
                var y = this.reader.getFloat(grandChildren[fromIndex], 'y');
                if (!(y != null && !isNaN(y)))
                    return "unable to parse from y-coordinate of the perspective position for ID = " + perspectiveId;
                else
                    fromPosition.push(x);
                var z = this.reader.getFloat(grandChildren[fromIndex], 'z');
                if (!(z != null && !isNaN(z)))
                    return "unable to parse from z-coordinate of the perspective position for ID = " + perspectiveId;
                else
                    fromPosition.push(z);

                //reads the to position
                x = this.reader.getFloat(grandChildren[toIndex], 'x');
                if (!(x != null && !isNaN(x)))
                    return "unable to parse to x-coordinate of the perspective position for ID = " + perspectiveId;
                else
                    toPosition.push(x);
                y = this.reader.getFloat(grandChildren[toIndex], 'y');
                if (!(y != null && !isNaN(y)))
                    return "unable to parse to y-coordinate of the perspective position for ID = " + perspectiveId;
                else
                    toPosition.push(x);
                z = this.reader.getFloat(grandChildren[toIndex], 'z');
                if (!(z != null && !isNaN(z)))
                    return "unable to parse to z-coordinate of the perspective position for ID = " + perspectiveId;
                else
                    toPosition.push(z);

                perspectives[perspectiveId] = [near, far, angle, fromPosition, toPosition];

            }
            else {
                if (children[i].nodeName == "ortho") {
                    //get the id of current ortho
                    var orthoId = this.reader.getString(children[i], 'id');
                    if (orthoId == null)
                        return "no ID defined for ortho";

                    // Checks for repeated IDs.
                    if (this.orthos[orthoId] != null)
                        return "ID must be unique for each ortho (conflict: ID = " + orthoId + ")";

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
        var nodeName = [];
        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeName.indexOf("ambient");
        var backgroundIndex = nodeName.indexOf("background");

        //validar ambientIndex e backgroundIndex saber se retorna com erro ou se da valores de default

        var r = this.reader.getFloat(children[ambientIndex], 'r');
        this.ambientAmbient.push(r);
        var g = this.reader.getFloat(children[ambientIndex], 'g');
        this.ambientAmbient.push(g);
        var b = this.reader.getFloat(children[ambientIndex], 'b');
        this.ambientAmbient.push(b);
        var a = this.reader.getFloat(children[ambientIndex], 'a');
        this.ambientAmbient.push(a);

        r = this.reader.getFloat(children[backgroundIndex], 'r');
        this.backgroundAmbient.push(r);
        g = this.reader.getFloat(children[backgroundIndex], 'g');
        this.backgroundAmbient.push(g);
        b = this.reader.getFloat(children[backgroundIndex], 'b');
        this.backgroundAmbient.push(b);
        a = this.reader.getFloat(children[backgroundIndex], 'a');
        this.backgroundAmbient.push(a);


        this.log("Parsed ambient");
        return null;
    }


    /**
   * Parses the <lights> node.
   * @param {lights block element} lightsNode
   */
    parseLights(lightsNode) {
        //TODO
        this.log("Parsed lights");
        return null;
    }


    /**
     * Parses the <textures> node.
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {
        //TODO
        this.log("Parsed textures");
        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        //TODO
        this.log("Parsed materials");
        return null;
    }


    /**
     * Parses the <transformations> node.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        //TODO
        this.log("Parsed transformations");
        return null;
    }


    /**
     * Parses the <primitives> node.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        //TODO
        this.log("Parsed primitives");
        return null;
    }


    /**
     * Parses the <components> node.
     * @param {components block element} componentsNode
     */
    parseComponents(componentsNode) {
        //TODO
        this.log("Parsed components");
        return null;
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

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        // entry point for graph rendering
        //TODO: Render loop starting at root of graph
    }
}