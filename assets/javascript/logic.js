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
// Create variables so we don't have to constantly write firebase.BLANK()
const storage = firebase.storage();
const auth = firebase.authentication();
// Google maps API Key

const apiKey = "AIzaSyBkUtokw3tHbQTwMkXpIapkw-us_Ln1RKE"
let database = firebase.database();
let mapDatabase = database.ref('mapData');
// Data is an object to push into Firebase
let data = {};
function initMap() {
    let richmond = {lat: 37.540, lng: -77.436};
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 15,
      center: richmond
    });
    let geocoder = new google.maps.Geocoder();
    document.getElementById('geosubmit').addEventListener('click',function () {
      geocodeAddress (geocoder, map);
    })
    let marker = new google.maps.Marker({
      position: richmond,
      map: map
    });
    // event listener for user clicks/markers
    map.addListener('click', function(e) {
    placeMarkerAndPanTo(e.latLng, map);
    });
};
function geocodeAddress(geocoder, resultsMap) {
    let address = document.getElementById('address').value;
    geocoder.geocode({'address': address}, function(results, status) {
      if (status === 'OK') {
        resultsMap.setCenter(results[0].geometry.location);
        let marker = new google.maps.Marker({
          map: resultsMap,
          position: results[0].geometry.location
        });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
    console.log(results);

    // Sets data to our Data object and then pushes it to Firebase
    data = {
      address: results[0].formatted_address,
      lat: results[0].geometry.location.lat(),
      lng: results[0].geometry.location.lng()
    }

    console.log(results[0].geometry.location.lat());
    console.log(results[0].geometry.location.lng());

    database.ref().push({
      mapData: data
    });

  });
}
//function for creating userMarkerInput
function placeMarkerAndPanTo(latLng, map) {
  var marker = new google.maps.Marker({
    position: latLng,
    map: map
  });
  // OPTIONAL used to pan to the new marker on init
  map.panTo(latLng);
}
// It looks like we need to look into the FirebaseUI Auth module within Firebase (It looks like it is resonably manageable to drop in Google/FB logins)
// https://github.com/firebase/firebaseui-web



// AJAX call for open weather API
var apiID = " f7df47b99b23eb3b8a448faa4293549d";
var cityCode = "6254928";
var queryURL = "api.openweathermap.org/data/2.5/forecast?id=" + cityCode + "&APPID=" + apiID

$ajax({
  url: queryURL,
  method: "GET"
}).done(function(response){
  console.log(response)
  console.log(response.city)
});



