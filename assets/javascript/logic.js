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
const database = firebase.database();
const storage = firebase.storage();
const auth = firebase.authentication();
// Google maps API Key
const apiKey = "AIzaSyBkUtokw3tHbQTwMkXpIapkw-us_Ln1RKE"

// It looks like we need to look into the FirebaseUI Auth module within Firebase (It looks like it is resonably manageable to drop in Google/FB logins)
// https://github.com/firebase/firebaseui-web



// AJAX call for open weather API
var apiKey = " f7df47b99b23eb3b8a448faa4293549d";
var cityCode = "6254928";
var queryURL = "api.openweathermap.org/data/2.5/forecast?id=" + cityCode + "&APPID=" + apiKey

$ajax({
  url: queryURL,
  method: "GET"
}).done(function(data){
  console.log(data)
  console.log(data.city)
});



/*
Need to create and manage the databse within firebase, will need directories for:
TrainApp>TrainData; 
TackyApp>MapData>GeoJSON file to store and push new coords to
	store in firebase and use map.data.loadGeoJson('data.json') to access
TackyApp>UserData
Complete reading about GMaps API, firebase storage including directory management, Read about CORS and OAuth
*/