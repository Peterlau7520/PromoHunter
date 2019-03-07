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

const startdate_picker = datepicker('#startdate', {
	formatter: (input, date, instance) => {
		const value = date.toLocaleDateString();
		input.value = value; // => '1/1/2099'
	},
	onSelect: (instance, date) => {
		instance.value = date;
	}
});

const enddate_picker = datepicker('#enddate', {
	formatter: (input, date, instance) => {
		const value = date.toLocaleDateString();
		input.value = value; // => '1/1/2099'
	},
	onSelect: (instance, date) => {
		instance.value = date;
	}
});

function show_campaign_form() {
	document.getElementById('campaignform').style.display = "block";
	document.getElementById("cancel_btn").addEventListener("click", function(e){
		e.preventDefault();
	});
}

function hide_campaign_form() {
	document.getElementById('campaignform').style.display = "none";
}