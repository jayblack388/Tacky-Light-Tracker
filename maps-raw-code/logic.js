// Google Maps Javascript API
const apiKey = "AIzaSyBkUtokw3tHbQTwMkXpIapkw-us_Ln1RKE"

// Initialize Firebase
const config = {
    apiKey: "AIzaSyAOD57dd2jJshQdrBRFnXyvp2M__Q0MEec",
    authDomain: "tacky-light-tracker.firebaseapp.com",
    databaseURL: "https://tacky-light-tracker.firebaseio.com",
    projectId: "tacky-light-tracker",
    storageBucket: "tacky-light-tracker.appspot.com",
    messagingSenderId: "814831670605"
};
  firebase.initializeApp(config);
  let database = firebase.database();
  let mapDatabase = database.ref('mapData');
  let data = {};
  let map;
  let marker;
  let infowindow;
  let messagewindow;

//$(document).ready(initMap())
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
    var marker = new google.maps.Marker({
      position: richmond,
      map: map
    });
    // event listener for user clicks/markers
    map.addListener('click', function(e) {
    placeMarkerAndPanTo(e.latLng, map);
    });
    // event listener for center_changed
    // map.addListener('center_changed', function() {
    // // 3 seconds after the center of the map has changed, pan back to the
    // // marker.
    //   window.setTimeout(function() {
    //     map.panTo(marker.getPosition());
    //   }, 3000);
    // });
};
function geocodeAddress(geocoder, resultsMap) {
        var address = document.getElementById('address').value;
        geocoder.geocode({'address': address}, function(results, status) {
          if (status === 'OK') {
            resultsMap.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
              map: resultsMap,
              position: results[0].geometry.location
            });
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
          console.log(results)
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
// .done(function(response){
// console.log(response)
// })

//function for creating userMarkerInput
function placeMarkerAndPanTo(latLng, map) {
  var marker = new google.maps.Marker({
    position: latLng,
    map: map
  });
  // OPTIONAL used to pan to the new marker on init
  map.panTo(latLng);
}
// Attaches an info window to a marker with the provided message. When the
// marker is clicked, the info window will open with the secret message.
// function attachMessage(marker, secretMessage) {
//   var infowindow = new google.maps.InfoWindow({
//     content: secretMessage
//   });

//   marker.addListener('click', function() {
//     infowindow.open(marker.get('map'), marker);
//   });
// }
// let myObj = {
//   name: "1854 Featherstone Dr",
//   address: "1854 Featherstone Drive, Midlothian, VA 23113",
//   description: "Visible from Huguenot Road, Neighbors also have lights",
//   latitude: 37.51794,
//   longitude: -77.61679
// }
// let myJSON = JSON.stringify(myObj);
// localStorage.setItem("testJSON", myJSON);