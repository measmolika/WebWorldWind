requirejs(['./WorldWindShim',
 './LayerManager'],
function (WorldWind,
          LayerManager) {
          "use strict";

    ///////////////////////////////////////////////////////////////
    var wwd = new WorldWind.WorldWindow("canvasOne");
    wwd.addLayer(new WorldWind.BMNGLayer());
    wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
    
    var starFieldLayer = new WorldWind.StarFieldLayer();
    var atmosphereLayer = new WorldWind.AtmosphereLayer();
    wwd.addLayer(starFieldLayer);
    wwd.addLayer(atmosphereLayer);
    
    var now = new Date();
    starFieldLayer.time = now;
    atmosphereLayer.time = now;

    //////////////////////////////////////////////////////////////
    function makeid(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * 
        charactersLength));
        }
        return result;
    }

    function maketype(){
        var types = ['PAYLOAD', 'UNKNOWN', 'DEBRIS'];
        var i = Math.floor(Math.random() * 3);
        return types[i];
    }

    function makegroup(){
        var groups = ['SpaceX', 'Galileo', 'GPS', 'Iridium', 'GLONASS', 'Westford Needles'];
        var i = Math.floor(Math.random() * 6);
        return groups[i];
    }
    ///////////////////////////////////////////////////////////////
    ///////// GET AJAX REQUEST
    function gettext(str) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", 'http://127.0.0.1:5000/', true);
        xhttp.responseType = 'text';
        xhttp.onload = function(e){
            if (xhttp.readyState==4 && xhttp.status==200)
                console.log(xhttp.response);
        }
        xhttp.send();   
    }

    ////////////////////////////////////////////////////////////////

    // Create the custom image for the placemark with a 2D canvas.
    for (var j = 0; j < 2; j++) {
        var canvas = document.createElement("canvas"),
        ctx2d = canvas.getContext("2d"),
        size = 12, c = size / 2 - 0.5, innerRadius = 0.9375, outerRadius = 3.75;

        canvas.width = size;
        canvas.height = size;

        var gradient = ctx2d.createRadialGradient(c, c, innerRadius, c, c, outerRadius);
        var rgbstr = 'rgb(255,102,0)';
        if (j==0) {
            rgbstr = 'rgb(192,192,192)';
        }
        gradient.addColorStop(0, rgbstr);

        ctx2d.fillStyle = gradient;
        ctx2d.arc(c, c, outerRadius, 0, 2 * Math.PI, false);
        ctx2d.fill();
        
        // Set placemark attributes.
        var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
        // Wrap the canvas created above in an ImageSource object to specify it as the placemarkAttributes image source.
        placemarkAttributes.imageSource = new WorldWind.ImageSource(canvas);
        // Define the pivot point for the placemark at the center of its image source.
        placemarkAttributes.imageOffset = new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 0.5, WorldWind.OFFSET_FRACTION, 0.5);
        placemarkAttributes.imageScale = 1;
        placemarkAttributes.imageColor = WorldWind.Color.WHITE;

        var highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
        highlightAttributes.imageScale = 1.3;
        
        for (var i = 0; i < 500; i++) {
            var rand_x = Math.ceil(Math.random() * 90) * (Math.round(Math.random()) ? 1 : -1)
            var rand_y = Math.ceil(Math.random() * 180) * (Math.round(Math.random()) ? 1 : -1)
            var placemarkPosition = new WorldWind.Position(rand_x, rand_y, 1000e3);
            var placemark = new WorldWind.Placemark(placemarkPosition, false, placemarkAttributes);
            placemark.highlightAttributes = highlightAttributes;
            var placemarkLayer = new WorldWind.RenderableLayer("Custom Placemark");
            placemarkLayer.name = makeid(5); // set attributes for the placemark object
            placemarkLayer.type_name = maketype();
            placemarkLayer.group_name = makegroup();
            placemarkLayer.addRenderable(placemark);
            wwd.addLayer(placemarkLayer);
        }  
    }

    ////////////////////////////////////////////////////////////
    wwd.deepPicking = true;
    var highlightedItems = [];
    var handleClick = function (recognizer) {
        gettext();
        var x = recognizer.clientX,
            y = recognizer.clientY;
        
        var redrawRequired = highlightedItems.length > 0;

        var pickList = wwd.pick(wwd.canvasCoordinates(x, y));
        if (pickList.objects.length > 0) {
            redrawRequired = true;
        }

         // Highlight the items picked by simply setting their highlight flag to true.
        if (pickList.objects.length > 0) {
            var numShapesPicked = 0;
            for (var p = 0; p < pickList.objects.length; p++) {
                pickList.objects[p].userObject.highlighted = true;

                var position = pickList.objects[0].position;
                wwd.goTo(new WorldWind.Location(position.latitude, position.longitude));

                // Keep track of highlighted items in order to de-highlight them later.
                highlightedItems.push(pickList.objects[p].userObject);

                // Increment the number of items picked if a shape is picked.
                if (!pickList.objects[p].isTerrain) {
                    ++numShapesPicked;
                    var obj = pickList.objects[p].userObject.layer;
                    if (document.getElementById("blob1").style.visibility=='hidden')
                        document.getElementById("blob1").style.setProperty("visibility","visible")
                    document.getElementById("title1").innerHTML = obj.name;
                    document.getElementById("type1").innerHTML = "Type: "+obj.type_name;
                    document.getElementById("group1").innerHTML = "Group: "+obj.group_name;
                }
            }
        }

        // Update the window if we changed anything.
        if (redrawRequired) {
            wwd.redraw(); // redraw to make the highlighting changes take effect on the screen
        }
    };

    var handleMouseOver = function (recognizer) {
        var x = recognizer.clientX,
            y = recognizer.clientY;
    };

    wwd.addEventListener("click", handleClick);
    wwd.addEventListener("mouseover", handleMouseOver);
    var highlightController = new WorldWind.HighlightController(wwd);
    var layerManager = new LayerManager(wwd);
});