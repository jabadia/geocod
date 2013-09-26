"use strict";

var map, geocoder;

require([
        "dojo/parser", "dojo/ready", "dijit/layout/BorderContainer", "dijit/layout/ContentPane", "dojo/dom", "dojo/_base/Color",
        "esri/map", "esri/urlUtils","esri/arcgis/utils","esri/dijit/Legend","esri/dijit/Scalebar",
        "esri/dijit/Geocoder", "esri/config",
        "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleMarkerSymbol", "esri/InfoTemplate",
        "esri/graphic", "esri/layers/GraphicsLayer",
        "dojo/domReady!"
      ], 
function(
        parser,ready,BorderContainer,ContentPane,dom,Color,
        Map,urlUtils,arcgisUtils,Legend,Scalebar,
        Geocoder, esriConfig,
        PictureMarkerSymbol, SimpleMarkerSymbol, InfoTemplate,
		Graphic, GraphicsLayer
      ) 
{
	var locatorUrl = "http://46.51.169.91/arcgis/rest/services/Toponimia/XuntaToponimos/GeocodeServer";
	//var webmapid = "e91f3b27396747b1b1bef44c573b92d3";
	var webmapid = "16ce0344d96c45f08b2724ee8f78f4c6";
	/*
	"Boiro", "A Portuguesa", "A Coruña"

	http://46.51.169.91/arcgis/rest/services/Toponimia/ToponimosGalicia/GeocodeServer/findAddressCandidates?SingleLinePlaceName=Vigo&outFields=&outSR=102100&f=json&searchExtent=%7B%22xmax%22%3A-514574%2E07441560883%2C%22xmin%22%3A-1297289%2E2440557755%2C%22ymax%22%3A5402263%2E411081694%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%2C%22ymin%22%3A5155830%2E431890298%7D
	*/
	var mapOptions = {
		maxZoom: 18
	};

	//esriConfig.defaults.map.panDuration = 10;
	//esriConfig.defaults.map.panRate = 5;
	//esriConfig.defaults.map.zoomDuration = 10;
	//esriConfig.defaults.map.zoomRate = 5;

	arcgisUtils.createMap(webmapid,"map",{ mapOptions: mapOptions}).then(function(response)
	{
		map = response.map;
		
		geocoder = new Geocoder({
			map:map,
			arcgisGeocoder: false,
			autoNavigate: false,
			autoComplete: true,			
			geocoders: [ {
				url: locatorUrl, 
				name: "Topónimos de Galicia", 
				singleLineFieldName: "SingleLinePlaceName",
				placeholder: "introduzca un topónimo",
				outFields: "*"
			},{
          		url: "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
          		name: "esri World Geocoder",
          		singleLineFieldName: "SingleLine",
          		sourceCountry: "ESP"
        	}]
		}, "search");
		geocoder.startup();

		geocoder.on('find-results',goToResult);
		geocoder.on('select',goToResult);

		function goToResult(evt)
		{
			console.log(evt);
			if( evt.result == undefined && evt.results == undefined )
			{
				console.log('ignoring event');
				return;				
			}
			var candidates = evt.results? evt.results.results : [evt.result];

			candidates.sort( function(a,b) { return (a.feature.attributes.Type - b.feature.attributes.Type); });

			if( candidates.length > 0 )
			{	
				var candidate = candidates[0];
				var center = candidate.feature.geometry;
				var zoomLevel = 16;

				if( candidate.feature.attributes.Type == "1")
					zoomLevel = 14
				else if( candidate.feature.attributes.Type == "2")
					zoomLevel = 15
				else if( candidate.feature.attributes.Type == "7")
					zoomLevel = 17;

				map.centerAndZoom(center,zoomLevel);

				var markerSymbol = new PictureMarkerSymbol('img/marker.png', 50,50);
				markerSymbol.setOffset(-25,0);
				var infoTemplate = new InfoTemplate("Resultado", "${Name}");
				var marker = new Graphic(center, markerSymbol, candidate.feature.attributes,infoTemplate);
				console.log(center);
				map.graphics.clear();
				map.graphics.add(marker);
			}
		}

		var labelsLayer = null;

		response.itemInfo.itemData.operationalLayers.forEach(function(layer)
		{
			console.log(layer.title);
			if( layer.title == "ToponimosOrto" )
				labelsLayer = map.getLayer(layer.id);
		});

		//labelsLayer.hide();

		/*
		desactivar las etiquetas 
		*/

		/*
		// transparencia gradual de la capa topográfica
		
		var topoLayer = null;

		response.itemInfo.itemData.operationalLayers.forEach(function(layer)
		{
			if( layer.title == "World Topographic Map" )
				topoLayer = map.getLayer(layer.id);
		});

		map.on('zoom-end',function(evt)
		{
			if( ! topoLayer )
				return;

			if(evt.level == 14)
				topoLayer.setOpacity(0.25);
			else if(evt.level == 13)
				topoLayer.setOpacity(0.5);			
			else if(evt.level == 12)
				topoLayer.setOpacity(0.75);
			else
				topoLayer.setOpacity(1.0);
		});
		*/
	});
});
