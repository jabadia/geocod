"use strict";

var map, geocoder;

require([
        "dojo/parser", "dojo/ready", "dijit/layout/BorderContainer", "dijit/layout/ContentPane", "dojo/dom",
        "esri/map", "esri/urlUtils","esri/arcgis/utils","esri/dijit/Legend","esri/dijit/Scalebar",
        "esri/dijit/Geocoder", "esri/config", /*"esri/Graphic",*/
        "dojo/domReady!"
      ], 
function(
        parser,ready,BorderContainer,ContentPane,dom,
        Map,urlUtils,arcgisUtils,Legend,Scalebar,
        Geocoder, esriConfig/*, Graphic*/
      ) 
{
	var locatorUrl = "http://46.51.169.91/arcgis/rest/services/Toponimia/ToponimosXunta/GeocodeServer";
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
				placeholder: "introduzca un topónimo"
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
			var candidates = evt.results? evt.results.results : [evt.result];

			if( candidates.length > 0 )
			{	
				var center = candidates[0].feature.geometry;
				console.log(candidates[0]);
				map.centerAndZoom(center,16);
/*
				var marker = new Graphic( )
				map.graphics.clear();
				map.graphics.add(marker);
				*/
			}
		}
	});
});
