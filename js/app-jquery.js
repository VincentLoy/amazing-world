$(document).ready(function(){
    //global var
    var waiting, adresse, map, longitude, latitude, markers, limit, currentZoom, oms;
    var randomCountry = chance.country({ full: true });
    var radius = 1;


    $(".button-collapse").sideNav();

    setBackground();

    $(".refresh").on("click", function(){
       getSomePhotos();
    });

    $(".search").keyup(function(){
        adresse = $(this).val();
        clearTimeout(waiting);
        waiting = setTimeout(slowAlert, 2000);
    });

    $.getJSON("https://maps.googleapis.com/maps/api/geocode/json?address="+randomCountry.split(" ").join("+"), function($data){
        var obj = $data.results[0];
        latitude = obj.geometry.location.lat;
        longitude = obj.geometry.location.lng;

        setMap(latitude, longitude);
        getSomePhotos();
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

            map.panTo(new L.LatLng(latitude, longitude));
            getSomePhotos();
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
        map._layersMaxZoom=16;
        map._layersMinZoom=3;
        /*
        * reload pictures on map dragging
         */
        map.on("dragend", function(){
            getSomePhotos();
        });

        oms = new OverlappingMarkerSpiderfier(map);
    }


    function setBackground(){
        /*
         * FLICKR
         */
        var tags = randomCountry+",landscape";
        var flickr = "https://api.flickr.com/services/rest/?&method=flickr.photos.search&per_page=250&api_key=f42673e7bf8314ab473f73e8668ac2f7&radius=10&tags="+tags+"&extras=url_l&format=json&nojsoncallback=1";
        $.getJSON(flickr, function($photos){
            var random = parseInt(Math.random()*$photos.photos.photo.length);
            var img = $photos.photos.photo[random].url_l;
            console.log(img);
            $(".parallax>img").attr("src", img);
            $(".parallax").parallax();
            //$(".main-head-container").css("background", "url("+img+")");
        }).fail(function(jqXHR, status, error){
            console.log(error);
        });
    }

    function getSomePhotos(){
        //var tags = "veracruz,mexico,jarocho"
        latitude = map.getCenter().lat;
        longitude = map.getCenter().lng;
        markers.clearLayers();

        console.log("map size = "+map.getSize()+" / Map zoom = "+map.getZoom());

        //console.log(map.getCenter().lat)
        limit = 120;
        currentZoom = map.getZoom();
        radius = 17-currentZoom;
        console.log("radius : "+radius);
        var flickr = "https://api.flickr.com/services/rest/?&method=flickr.photos.search&per_page="+limit+"&api_key=f42673e7bf8314ab473f73e8668ac2f7&radius="+radius+"&extras=geo,owner_name,license,date_upload,date_taken,url_sq,url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o&format=json&nojsoncallback=1&lat="+latitude+"&lon="+longitude;
        //window.open(flickr)
        $.getJSON(flickr, function($photos){
            console.dir($photos);

            var path = $photos.photos.photo;
            var total = $photos.photos.total;
            var picts = [];
            var random = parseInt(Math.random()*path.length);
            var img = path[random].url_l;

            if(total < limit){
                limit = total;
            }
            else if(path.length > 0){
                
            }

            for(var i = 0; i<path.length; i++){
                var pict = path[i];

                /*
                 * check if original current picture is available
                 */
                /*if(typeof pict.url_o !== "undefined"){
                    var original = pict.url_o;
                }
                else if(typeof pict.url_l !== "undefined"){
                    var original = pict.url_l;
                }
                else if(typeof pict.url_c !== "undefined"){
                    var original = pict.url_c;
                }
                else if(typeof pict.url_z !== "undefined"){
                    var original = pict.url_z;
                }*/

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
                        iconAnchor: [17,0],
                        popupAnchor: [-3,-76]
                    }),
                    popupContent: '<strong>'+pict.title+'</strong><br>' +
                    '<img src="'+pict.url_s+'" alt="'+pict.title+'"/><br>' +
                        '<a href="'+pict.url_o+'" target="_blank">original</a>'+
                        ' by <a href="https://www.flickr.com/photos/'+pict.owner+'" target="_blank">'+pict.ownername+'</a>'

                }
                picts.push(o);
            }
            //alert(picts.length)
            if(picts.length > 0){
                for(var i = 0; i<picts.length; i++){
                    var marker = L.marker([picts[i].lat, picts[i].lng], {icon: picts[i].marker}).addTo(markers);
                    picts[i].img_s.onloadend = marker.bindPopup(picts[i].popupContent);
                    oms.addMarker(marker);
                }
            }
            else{
                alert("aucune photo ici");
            }

            markers.addTo(map);


            //console.log(picts);
        }).fail(function(jqXHR, status, error){
            console.dir(error);
        });
    }
});