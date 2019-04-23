$("#coupon li").css("background", "linear-gradient(to right, #f7aa5c 0%, #f7aa5c 5%, #fef2e8 5%, #fef2e8 90%)");

var ajaxObj = new XMLHttpRequest();

var initSearchBoxVal = document.getElementById('searchbox').value;

if(initSearchBoxVal != ''){
	ajaxRequest();
}

function ajaxRequest(){
	var searchbox = document.getElementById('searchbox');
	ajaxObj.onreadystatechange = ajaxResponse;
	ajaxObj.open('GET', '/searchcoupon?search='+searchbox.value, true);
	ajaxObj.send();
}
document.getElementById('searchbox').addEventListener('input', ajaxRequest);

function ajaxResponse(){
	if(ajaxObj.readyState == 4 && ajaxObj.status == 200){
		document.getElementById('searchresult').innerHTML = ajaxObj.responseText;
	}
}