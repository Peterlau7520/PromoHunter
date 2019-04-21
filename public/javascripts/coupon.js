var ajaxObj = new XMLHttpRequest();

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