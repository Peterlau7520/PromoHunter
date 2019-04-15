$("#campaign li").css("background", "linear-gradient(to right, #f7aa5c 0%, #f7aa5c 5%, #fef2e8 5%, #fef2e8 90%)");

var map;
var pos = navigator.geolocation.getCurrentPosition(initMap);
function initMap(position) {
	var latlng = {lat: position.coords.latitude, lng: position.coords.longitude};
	map = new google.maps.Map(document.getElementById('map'), {
		center: latlng,
		zoom: 15,
		disableDefaultUI: true
	});
	
	var geocoder = new google.maps.Geocoder;
	var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        draggable: true
    });

	marker.addListener('dragend', function(){
		document.getElementById('markerpos').value = marker.getPosition();
		map.setCenter(marker.getPosition());
		geocoder.geocode({'location': marker.getPosition()}, function(result, status){
			if(status === 'OK'){
				if(result[0]){
					document.getElementById('address').value = result[0].formatted_address;
				}
			}
		});
	});
}

function show_campaign_form() {
	animateCSS('#campaignform','bounceInUp');
	document.getElementById('campaignform').style.display = "block";
	document.getElementById("cancel_btn").addEventListener("click", function(e){
		e.preventDefault();
	});
	document.getElementById('frame').classList.add("blur-filter");
}

function hide_campaign_form() {
	document.getElementById('campaignform').style.display = "none";
	document.getElementById('frame').classList.remove("blur-filter");
}

function show_coupon_form(campaignid) {
	animateCSS('#couponform','bounceInUp');
	document.getElementById('couponform').style.display = "block";
	document.getElementById("coupon_cancel_btn").addEventListener("click", function(e){
		e.preventDefault();
	});
	document.getElementById('addcouponform').action = "/campaign/addcoupon/"+campaignid;
	document.getElementById('frame').classList.add("blur-filter");
}

function hide_coupon_form() {
	document.getElementById('couponform').style.display = "none";
	document.getElementById('frame').classList.remove("blur-filter");
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

const expirydate_picker = datepicker('#expirydate', {
	formatter: (input, date, instance) => {
		const value = date.toLocaleDateString();
		input.value = value; // => '1/1/2099'
	},
	onSelect: (instance, date) => {
		instance.value = date;
	}
});

function tabnav(e, tab){
	var tabs = document.getElementsByClassName("tabcontent");
	for(var i=0; i<tabs.length; i++){
		tabs[i].style.display = "none";
	}
	var navs = document.getElementsByClassName("nav-link");
	for(var i=0; i<navs.length; i++){
		navs[i].classList.remove("active");
	}
	document.getElementById(tab).style.display = "block";
	e.currentTarget.classList.add("active");
}

function animateCSS(element, animationName, callback) {
    const node = document.querySelector(element)
    node.classList.add('animated', animationName)

    function handleAnimationEnd() {
        node.classList.remove('animated', animationName)
        node.removeEventListener('animationend', handleAnimationEnd)

        if (typeof callback === 'function') callback()
    }

    node.addEventListener('animationend', handleAnimationEnd)
}