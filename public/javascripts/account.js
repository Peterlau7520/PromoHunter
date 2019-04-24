$("#information li").css("background", "linear-gradient(to right, #f7aa5c 0%, #f7aa5c 5%, #fef2e8 5%, #fef2e8 90%)");

$picNo = 1;
$locNo = 1;
$('#picNo').val($picNo);
$('#locNo').val($locNo);

function add_picture(){
	if($picNo < 5){
		$e = $('#pic'+$picNo);
		$picNo = $picNo+1;
		$row = "<div class='form-group col-md-4' id='pic"+$picNo+"'><input type='file' name='picture' /></div>"+
		"<div class='form-group col-md-8'><input class='form-control' type='text' name='caption' /></div>";
		$e.next().after($row);
		$('#picNo').val($picNo);
	}
}

function delete_picture(){
	if($picNo > 1){
		$e = $('#pic'+$picNo);
		$e2 = $e.next();
		$e.remove();
		$e2.remove();
		$picNo = $picNo-1;
		$('#picNo').val($picNo);
	}
}

function add_location(){
	if($locNo < 10){
		$e = $('#loc'+$locNo);
		$locNo = $locNo+1;
		$row = "<div class='form-group col-md-12', id='loc"+$locNo+"'><input class='form-control' type='text' "+
		"name='location' />";
		$e.after($row);
		$('#locNo').val($locNo);
	}
}

function delete_location(){
	if($locNo > 1){
		$e = $('#loc'+$locNo);
		$e.remove();
		$locNo = $locNo-1;
		$('#locNo').val($locNo);
	}
}

var slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1} 
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none"; 
  }
  for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block"; 
  dots[slideIndex-1].className += " active";
}