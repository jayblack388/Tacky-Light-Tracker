let map;
let marker;
let infowindow;
let messagewindow;
function initMap() {
        var california = {lat: 37.4419, lng: -122.1419};
        map = new google.maps.Map(document.getElementById('map'), {
          center: california,
          zoom: 13
        });
        infowindow = new google.maps.InfoWindow({
  		  content: document.getElementById('form')
		});
		messagewindow = new google.maps.InfoWindow({
		  content: document.getElementById('message')
		});
		google.maps.event.addListener(map, "click", function(event) {
	      marker = new google.maps.Marker({
	        position: event.latLng,
	        map: map
	      });
		});
		google.maps.event.addListener(marker, "click", function() {
		  infowindow.open(map, marker);
		});
    };
function saveData() {
  var name = escape(document.getElementById("name").value);
  var address = escape(document.getElementById("address").value);
  var type = document.getElementById("type").value;
  var latlng = marker.getPosition();
  var url = "phpsqlinfo_addrow.php?name=" + name + "&address=" + address +
            "&type=" + type + "&lat=" + latlng.lat() + "&lng=" + latlng.lng();

  downloadUrl(url, function(data, responseCode) {

    if (responseCode == 200 && data.length <= 1) {
      infowindow.close();
      messagewindow.open(map, marker);
    }
  });
};
function downloadUrl(url, callback) {
        var request = window.ActiveXObject ?
            new ActiveXObject('Microsoft.XMLHTTP') :
            new XMLHttpRequest;

        request.onreadystatechange = function() {
          if (request.readyState == 4) {
            request.onreadystatechange = doNothing;
            callback(request.responseText, request.status);
          }
        };

        request.open('GET', url, true);
        request.send(null);
      }

      function doNothing () {
      }  