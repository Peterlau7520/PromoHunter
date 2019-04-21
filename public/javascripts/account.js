$picNo = 1;
$locNo = 1;

function add_picture(){
	if($picNo < 5){
		$e = $('#pic'+$picNo);
		$picNo = $picNo+1;
		$row = "<div class='form-group col-md-4' id='pic"+$picNo+"'><input type='file' name='picture' /></div>"+
		"<div class='form-group col-md-8'><input class='form-control' type='text' name='caption"+$picNo+"' /></div>";
		$e.next().after($row);
		$('#picNo').value = $picNo;
	}
}

function delete_picture(){
	if($picNo > 1){
		$e = $('#pic'+$picNo);
		$e2 = $e.next();
		$e.remove();
		$e2.remove();
		$picNo = $picNo-1;
		$('#picNo').value = $picNo;
	}
}

function add_location(){
	if($locNo < 10){
		$e = $('#loc'+$locNo);
		$locNo = $locNo+1;
		$row = "<div class='form-group col-md-12', id='loc"+$locNo+"'><input class='form-control' type='text' "+
		"name='location"+$locNo+"' />";
		$e.after($row);
		$('#locNo').value = $locNo;
	}
}

function delete_location(){
	if($locNo > 1){
		$e = $('#loc'+$locNo);
		$e.remove();
		$locNo = $locNo-1;
		$('#locNo').value = $locNo;
	}
}