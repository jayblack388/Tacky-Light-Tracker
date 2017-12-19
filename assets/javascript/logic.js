// Google maps API Key
const apiKey = "AIzaSyBkUtokw3tHbQTwMkXpIapkw-us_Ln1RKE"

// Firebase Reference
const config = {
    apiKey: "AIzaSyAOD57dd2jJshQdrBRFnXyvp2M__Q0MEec",
    authDomain: "tacky-light-tracker.firebaseapp.com",
    databaseURL: "https://tacky-light-tracker.firebaseio.com",
    projectId: "tacky-light-tracker",
    storageBucket: "",
    messagingSenderId: "814831670605"
  };
  firebase.initializeApp(config);
  let database = firebase.database();
  let mapDatabase = database.ref('mapData');
  let data = {};
  let map;
  let marker;
  let markers = [];
  let infowindow;
  let addressInfo;
  let messagewindow;
  let address;
  let geocoder;
  let pos = {};
  let post = {};
  let firstFifty = mapDatabase.limitToFirst(50)
  let richmond = {lat: 37.540, lng: -77.436};



function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: pos
    });

    geocoder = new google.maps.Geocoder();
    document.getElementById('geosubmit').addEventListener('click',function () {
      geocodeAddress (geocoder, map);
    });
    
    marker = new google.maps.Marker({
      position: pos,
      map: map
    });

    infoWindow = new google.maps.InfoWindow;
      // Try HTML5 geolocation.
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
         pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          infoWindow.setPosition(pos);
          infoWindow.setContent('Location found.');
          infoWindow.open(map);
          map.setCenter(pos);
        }, function() {
          handleLocationError(true, infoWindow, map.getCenter());
        });
      } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
      }
    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);

                map = new google.maps.Map(document.getElementById('map'), {
                  zoom: 15,
                  center: richmond
                });
      }  

    infowindow = new google.maps.InfoWindow({
          content: `  
          <div id="form">
          <table>
            <tr><td>Address:</td> <td><input type='text' id='formaddress'/></td></tr>
            <tr><td></td><td><input type='button' onclick='saveData()' value='Save'/></td></tr>
          </table>
          </div>`
        });

    messagewindow = new google.maps.InfoWindow({
      content: `<div id="message">Location saved</div>`
    });

};

function geocodeAddress(geocoder, resultsMap) {
        address = document.getElementById('address').value;
        geocoder.geocode({'address': address}, function(results, status) {
          if (status === 'OK') {
            resultsMap.setCenter(results[0].geometry.location);
            marker = new google.maps.Marker({
              map: resultsMap,
              position: results[0].geometry.location
            });
            address = results[0].formatted_address;
            console.log(address)

            google.maps.event.addListener(marker, 'click', function(){
              infowindow.open(map, marker);
              $('#formaddress').attr("value", address);
            });
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
          console.log(results)
          data = {
              address: results[0].formatted_address,
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng(),
            };
            
          });
};
function saveData() {
  data.timestamp = firebase.database.ServerValue.TIMESTAMP
  mapDatabase.push({
    locationData: data
  });
};
function centerMap() {
  map.setCenter(richmond);
  map.setZoom(12);
  infoWindow.close();
  addressInfo.close();
};
firstFifty.on('child_added', function(snapshot){
  post = {
  lat: snapshot.val().locationData.lat,
  lng: snapshot.val().locationData.lng
  }
  marker = new google.maps.Marker({
    map: map,
    position: post,
    title: snapshot.val().locationData.address
  })
  markers.push(marker)
  console.log(markers)

  addressInfo = new google.maps.InfoWindow();
  for (i = 0; i < markers.length; i++) {
    let thisData = markers[i];
    (function (marker, thisData) {
      google.maps.event.addListener(marker, "click", function (e) {
        addressInfo.setContent("<div style= 'width:200px;min-height:40px'>" + thisData.title + "</div>");
        addressInfo.open(map, marker);
        map.setCenter(marker.getPosition());
        map.setZoom(13);
      });
    }) (marker, thisData);
  }

});

//Weather API
var weatherApiKey = "f7df47b99b23eb3b8a448faa4293549d";
var cityZipCode = 23220;
var queryURL = "https://api.openweathermap.org/data/2.5/weather?zip=" + cityZipCode + ",us&APPID=" + weatherApiKey;
$.ajax({
    url: queryURL,
    data: {
      units: 'imperial'
    },
    method: "GET"
  }).done(function(response){
    console.log(response)
    console.log(response["name"]);

    var weatherDiv = $("<div class = 'weatherWidget'>");
    var cityName = response["name"];
    var temperature = response["main"]["temp"];
    var condition = response["weather"]["0"]["description"];
    var conditionIconCall = response["weather"]['0']["icon"];
    var weatherImgUrl = "http://openweathermap.org/img/w/" + conditionIconCall + ".png";
    var widgetConditionsIcon = $("<img>").attr("src", weatherImgUrl);
    	console.log("City Name: " + cityName + " | Temperature: " + temperature + " \xB0F");
	var widgetTemp = $("<p>").html("Currently in " + cityName + ":" + "<br>" + temperature + " \xB0F");
    var widgetConditions = $("<p>").html(widgetConditionsIcon);

    weatherDiv.append(widgetTemp);
    weatherDiv.append(widgetConditions);
    weatherDiv.append(" " + condition)

    $("#weather").prepend(weatherDiv);
  });