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
  let originPos;
  let lastFifty = mapDatabase.limitToLast(50);
  let richmond = {lat: 37.540, lng: -77.436};
  let origin;
  let destination;
  let directionsService;
  let directionsDisplay;
  let stepDisplay;
  let markerArray = [];
  var pointToPointQuery;
  var tourQuery;
  var query;
  var planner = false;
  var id;
  var start;
  var end;
  var waypoints = [];
  var directionResult;


function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: pos
    });

    geocoder = new google.maps.Geocoder();
    document.getElementById('geosubmit').addEventListener('click',function () {
      geocodeAddress (geocoder, map);
    });

    directionsService = new google.maps.DirectionsService;

    directionsDisplay = new google.maps.DirectionsRenderer({map: map});

    stepDisplay = new google.maps.InfoWindow;
    
    infoWindow = new google.maps.InfoWindow;
      // Try HTML5 geolocation.
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
         pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          originPos = pos;
          $('#from').text("Your location: " + originPos.lat.toString() + "\xB0 Latitude, " + originPos.lng.toString() + "\xB0 Longitude");
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
        // If location is denied then zoom
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 12,
          center: richmond
        });
        mapDatabase.on('child_added', function(snapshot){

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
          //console.log(markers)

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


    $("#planner").click(function() {
      $("#directions p").empty();
      $("#directions #from").empty();
      $("#directions #to").empty();
      $("#step-by-step").empty();
      $("#planner").remove();
      $("#getdirections").remove();
      planner = true;
      $("#instructions").append("<p>Select multiple waypoints by clicking pins on the map.</p> <p>Select starting point.</p>");
      $("#directions").prepend('<button id="generate">Generate Tacky Lights Tour!</button>');
      document.getElementById('generate').addEventListener('click', generateHandler);
      //$("#directions").prepend('<button id="revert">Revert</button>');
      //document.getElementById('revert').addEventListener('click', revertHandler);
    });

    document.getElementById('reset').addEventListener('click', resetHandler);


    document.getElementById('getdirections').addEventListener('click', onChangeHandler);

    // Listen to click events.
    function onChangeHandler() {
      if (originPos == undefined) {
        $("#warning").html("Origin undefined.");
        setTimeout(function(){$("#warning").empty()}, 2000)
      } else if (destination == undefined) {
        $("#warning").html("You must select a destination by clicking the map's pins.");
        setTimeout(function(){$("#warning").empty()}, 2000)
      }
      $("#step-by-step").empty();
      calculateAndDisplayRoute(directionsDisplay, directionsService, markerArray, stepDisplay, map);
      showSteps();
    };
    function generateHandler() {
      console.log("Generating your tour");
      $("#directions").append("");
      calculateAndDisplayRoute(directionsDisplay, directionsService, markerArray, stepDisplay, map);
      //console.log(response);
      //console.log(directionResult);
      //showSteps(response);
    };
    // function revertHandler() {
    //   $("#instructions").append("REVERT");
    //   planner = false;
    // }
    function resetHandler() {
      $("#step-by-step").empty();
      $("#directions p").remove();
      $("#instructions").html("<p>Select a starting point</p>");
      start = null;
      end = null;
      waypoints = [];
      originPos = null;
      destination = null;
      map.directions.clear();
    }
};
function calculateAndDisplayRoute(directionsDisplay, directionsService, markerArray, stepDisplay, map) {
  // First, remove any existing markers from the map.
  // for (var i = 0; i < markerArray.length; i++) {
  //   markerArray[i].setMap(null);
  // }

  pointToPointQuery = {
    origin: originPos,
    destination: destination,
    travelMode: 'DRIVING'
  }

  tourQuery = {
    origin: start,
    destination: end,
    waypoints: waypoints,
    optimizeWaypoints: true,
    travelMode: 'DRIVING'
  }

  if (planner == true) {
    query = tourQuery;
  } else if (planner == false) {
    query = pointToPointQuery;
  }
  console.log(query);
  // Retrieve the start and end locations and create a DirectionsRequest using
  // WALKING directions.
  directionsService.route(query, function(response, status) {
    // Route the directions and pass the response to a function to create
    // markers for each step.
    if (status === 'OK') {
      //document.getElementById('warnings-panel').innerHTML =
      //    '<b>' + response.routes[0].warnings + '</b>';
      directionsDisplay.setDirections(response);
      showSteps(response, markerArray, stepDisplay, map);
      console.log(response)
      //directionResult = response;


    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
};


// $('#getdirections').click(function() {
//   $("#step-by-step").empty();
//   calculateAndDisplayRoute();
//   showSteps();
// })




function showSteps(directionResult, markerArray, stepDisplay, map, frome, to) {
  // For each step, add the text to the step-by-step directions display.
  let myRoute = directionResult;
  console.log(myRoute)
  for (let j = 0; j < myRoute.routes[0].legs.length; j++) {
    $("#step-by-step").append("<p><b>From " + myRoute.routes[0].legs[j].start_address + " to " + myRoute.routes[0].legs[j].end_address + ": </b></p>");
    for (let k = 0; k < myRoute.routes[0].legs[j].steps.length; k++) {
      $("#step-by-step").append("<p>" + (k + 1).toString() + ". " + myRoute.routes[0].legs[j].steps[k].instructions + "</p>");
    }

  }
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
            $("#warning").html('Geocode was not successful for the following reason: ' + status);
            setTimeout(function(){$("#warning").empty()}, 2000)
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
  messagewindow.open()
  infowindow.close();
};
function centerMap() {
  map.setCenter(originPos);
  map.setZoom(12);
  infoWindow.close();
  addressInfo.close();
};
mapDatabase.on('child_added', function(snapshot){
  post = {
  lat: snapshot.val().locationData.lat,
  lng: snapshot.val().locationData.lng
  }
  marker = new google.maps.Marker({
    map: map,
    position: post,
    title: snapshot.val().locationData.address,
    id: snapshot.val().locationData.id
  })
  markers.push(marker)

  addressInfo = new google.maps.InfoWindow();
  for (i = 0; i < markers.length; i++) {
    let thisData = markers[i];
    (function (marker, thisData) {
      google.maps.event.addListener(marker, "click", function (e) {
        addressInfo.setContent("<div style= 'width:200px;min-height:40px'>" + thisData.title + "</div>");
        addressInfo.open(map, marker);
        map.setCenter(marker.getPosition());
        map.setZoom(11);
        if (planner == false) {
          destination = thisData.title;
          $("#to").text(destination);          
        }
        id = thisData.id;
        console.log(id);
        console.log(planner);

                if (planner == true && id == 2) {
                  //waypoints.push(marker);
                  //$("#directions").append(marker.title);
                  //var test = [];
                  //waypoints = [{location: "baltimore"}]
                  if (start == null) {
                    start = marker.title;
                    $("#instructions").html("<p>Select your tour's end point</p>");
                    $("#directions").append("<p>Start: " + start + "</p>");
                  } else if (end == null) {
                    end = marker.title;
                    $("#instructions").html("<p>Select additional locations to visit</p>");
                    $("#directions").append("<p>End: " + end + "</p>");
                  } else {
                    waypoints.push({location: marker.title});
                    //console.log(waypoints[2].location.toString())
                    $("#directions").append("<p>Additional Houses: " + marker.title + "</p>");
                    $("#instructions").html("<p>Click generate tour after selecting all.</p>");
                  }
                  
                  //waypoints.push(marker.position + "|");

                  //apiInput = waypoints;
                  //apiInput.push({"location": marker.title, "stopover": true});
                  //$("#directions").append(apiInput + "<br><br>");
                }
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

    var widgetTemp = $("<p>").html("Currently in " + cityName + ": " + temperature + " \xB0F");
    var widgetConditions = $("<div>").html(widgetConditionsIcon);


    weatherDiv.append(widgetTemp);
    weatherDiv.append(widgetConditions);
    weatherDiv.append(" " + condition)

    $("#weather").html(weatherDiv);
  });