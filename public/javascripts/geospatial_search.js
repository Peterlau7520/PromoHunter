var map;
var pos = navigator.geolocation.getCurrentPosition(initMap);
function initMap(position) {
	var latlng = {lat: position.coords.latitude, lng: position.coords.longitude};
	map = new google.maps.Map(document.getElementById('map'), {
		center: latlng,
		zoom: 15,
		disableDefaultUI: true
	});
	
	var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        draggable: true
    });

	marker.addListener('dragend', function(){
		document.getElementById('markerpos').value = marker.getPosition();
		map.setCenter(marker.getPosition());
		map.setZoom(15);
	});
}