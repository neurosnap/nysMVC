<?php

class Dashboard extends BaseAPI {

	protected function Index() {

		//Loading data with a view
		//$orm = new ORM();
		//$orm->Connect();
		//$model = $orm->Qu("SELECT * FROM users");
		//$orm->Close();
		//$this->loadView($model);

		//Loading AJAX call
		//$orm = new ORM();
		//$orm->Connect();
		//$model = $orm->Qu("SELECT * FROM users WHERE id = " . $_POST['id']);
		//$orm->Close();
		//echo $model;

		//loads the view with data from model
		//function loadView($model, $fullview = true, $authenticate = false, $view_override = false)
		//----------------------------------------------------------------------------------------------
		//$model = database data, gets passed to the view as $model, typically string, object, or array
		//$authenticate = adding user authentication to the view, should be an int (i.e. 1, 2, 3, 4)
		//		Authenticate uses $_SESSION['operator_ID'] and $_SESSION['permission_level']
		//		the check is if ($authenticate >= $_SESSION['permission_level'])
		//$view_override = expecting string containing filename of view that should be used instead of 
		//		default action
		$this->loadView("This is the model data");
	
	}
	
}

?>