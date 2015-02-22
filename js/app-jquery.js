$(document).ready(function(){
    //global var
    var waiting, adresse, map;


    $(".button-collapse").sideNav();

    setBackground();
    setMap(0,0);

    $(".search").keyup(function(){
        adresse = $(this).val();
        clearTimeout(waiting);
        waiting = setTimeout(slowAlert, 2000);
    });

    function slowAlert(){
        var geocode = "https://maps.googleapis.com/maps/api/geocode/json?address="+adresse.split(" ").join("+");
        var zoom = 16;

        $.getJSON(geocode, function($data){
            var obj = $data.results[0];
            var latitude = obj.geometry.location.lat,
                longitude = obj.geometry.location.lng;
            $('html,body').animate({
                scrollTop: $("#picuresMap").offset().top
            },1500, 'easeInOutQuad');

            map.panTo(new L.LatLng(latitude, longitude));
        });
    }


    function setMap(lat,lon){
        map = L.map('picuresMap').setView([lat, lon], 10);

        L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'examples.map-i875mjb7'
        }).addTo(map);


        L.marker([lat, lon]).addTo(map)
            .bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();


        var popup = L.popup();

        function onMapClick(e) {
            popup
                .setLatLng(e.latlng)
                .setContent("You clicked the map at " + e.latlng.toString())
                .openOn(map);
        }


        map.on('click', onMapClick);
    }


    function setBackground(){
        /*
         * FLICKR
         */
        var tags = "veracruz,mexico,jarocho"
        var flickr = "https://api.flickr.com/services/rest/?&method=flickr.photos.search&per_page=250&api_key=f42673e7bf8314ab473f73e8668ac2f7&radius=10&tags="+tags+"&extras=url_l&format=json&nojsoncallback=1";
        $.getJSON(flickr, function($photos){
            var random = parseInt(Math.random()*$photos.photos.photo.length);
            var img = $photos.photos.photo[random].url_l;
            console.log(img);
            $(".parallax>img").attr("src", img);
            $(".parallax").parallax();
            //$(".main-head-container").css("background", "url("+img+")");
        }).fail(function(jqXHR, status, error){
            console.dir(error);
        });
    }
});