$(document).ready(function(){
    //global var
    var waiting, adresse, map, longitude, latitude, markers;


    $(".button-collapse").sideNav();

    setBackground();
    setMap(0,0);

    $(".refresh").on("click", function(){
       getSomePhotos();
    });

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
            latitude = obj.geometry.location.lat;
            longitude = obj.geometry.location.lng;
            $('html,body').animate({
                scrollTop: $("#picuresMap").offset().top
            },1500, 'easeInOutQuad');
            getSomePhotos();
            map.panTo(new L.LatLng(latitude, longitude));
        });
    }


    function setMap(lat,lon){
        map = L.map('picuresMap').setView([lat, lon], 12);
        markers = L.layerGroup();

        L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'examples.map-i875mjb7'
        }).addTo(map);


        L.marker([lat, lon]).addTo(map)
            .bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();
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

    function getSomePhotos(){
        //var tags = "veracruz,mexico,jarocho"

        var limit = 120;
        var flickr = "https://api.flickr.com/services/rest/?&method=flickr.photos.search&per_page="+limit+"&api_key=f42673e7bf8314ab473f73e8668ac2f7&radius=10&extras=geo,owner_name,license,date_upload,date_taken,url_sq,url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o&format=json&nojsoncallback=1&lat="+latitude+"&lon="+longitude;
        $.getJSON(flickr, function($photos){
            markers.clearLayers();
            var path = $photos.photos.photo;
            var picts = [];
            var random = parseInt(Math.random()*path.length);
            var img = path[random].url_l;

            for(var i = 0; i<50; i++){
                var pict = path[parseInt(Math.random()*path.length)];
                var o = {
                    ownerUrl: "https://www.flickr.com/photos/"+pict.owner,
                    ownerName: pict.ownername,
                    title: pict.title,
                    dateUpload : pict.dateupload,
                    dateTaken: pict.datetaken,
                    dateTakenUnknown: pict.datetakenunknown,
                    lat: pict.latitude,
                    lng: pict.longitude,
                    placeId: pict.place_id,
                    woeid: pict.woeid,
                    height_sq: pict.height_sq,
                    width_sq: pict.width_sq,
                    img_sq: pict.url_sq,
                    img_t: pict.url_t,
                    img_s: pict.url_s,
                    img_q: pict.url_q,
                    img_m: pict.url_m,
                    img_n: pict.url_n,
                    img_z: pict.url_z,
                    img_c: pict.url_c,
                    img_l: pict.url_l,
                    img_o: pict.url_o,
                    marker: L.icon({
                        iconUrl: pict.url_sq,

                        iconSize: [35,35],
                        iconAnchor: [22,94],
                        popupAnchor: [-3,-76]
                    }),
                    popupContent: '<strong>'+pict.title+'</strong><br>' +
                    '<img src="'+pict.url_s+'" alt="'+pict.title+'"/>'

                }
                picts.push(o);
            }
            for(var i = 0; i<picts.length; i++){
                var marker = L.marker([picts[i].lat, picts[i].lng], {icon: picts[i].marker}).addTo(markers);
                picts[i].img_s.onloadend = marker.bindPopup(picts[i].popupContent);
            }
            markers.addTo(map);


            console.log(picts);
        }).fail(function(jqXHR, status, error){
            console.dir(error);
        });
    }
});