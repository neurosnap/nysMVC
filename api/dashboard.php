<?php

class Dashboard extends BaseAPI {

	/*
	EACH function gets passed $_POST data and $_GET data, e.g. protected function Index($post, $get) {}
	*/

	protected function Index() {

		/* this will load the view in /views/registration/index.php
		loads the view with data from model
		function loadView($model, $fullview = true, $authenticate = false, $view_override = false, $layout_override = false)
		---------------------------------------------------------------------
			$model = database data, gets passed to the view as $model, typically string, object, or array
			$authenticate = adding user authentication to the view, should be an int (i.e. 1, 2, 3, 4)
					Authenticate uses $_SESSION['operator_ID'] and $_SESSION['permission_level']
					the check is if ($authenticate >= $_SESSION['permission_level'])
			$view_override = expecting string containing filename of view that should be used instead of 
					default action
			$layout_override = expecting string containing file of layout that should be used instead of 
					default layout, layout must contain:  require($api->view);  in order to load the view content properly
		*/
		$this->loadView("This is the model data");
	
	}

	//simple ajax call
	protected function example_simple_ajax($reqs) {

		//ORM class defined /classes/orm.php
		$orm = new ORM();

		/* 
		function Qu($string, $json_content = true, $multiple_records = false, $params = false)
		---------------------------------------------------------------------
			$string = the query
			$json_content = true or false flag to set header to JSON or just text
			$multiple_records = If returning multiple record sets from DB, set this variable to an array of 
			all the "key" names for the key-to-recordset map, 
			i.e. two recordsets: $multiple_records = array("users", "broadcasts");
			the order in which they are in the array is the order in which the recordsets are assigned
			$params = array of parameters for SQL parameterization
		*/
		$model = $orm->Qu("SELECT * FROM users");

		$orm->Close();

		echo $model;

	}

	//more complicated ajax call with mutiple keys
	protected function example_complex_ajax($reqs) {

		//ORM class defined /classes/orm.php
		$orm = new ORM();
		$model = new stdClass();

		//$json_content set to false because then it defaults the Qu() return to a stdClass object
		$model->users = $orm->Qu("SELECT * FROM users WHERE ID = 1", false);
		$model->permissions = $orm->Qu("SELECT * FROM permissions WHERE user_ID = 1", false);

		$orm->Close();

		echo json_encode($model);
		
	}

	protected function example_update_insert_delete_ajax($reqs) {

		$orm = new ORM();
		$model = new stdClass();

		/*
		This is used for queries that don't respond with data
		I.E INSERT, UPDATE, DELETE
		This will return an object container "success" as bool and an error message as "message"

		function Mod($string, $json_content = true)
		--------------------------------------------------------------------
			$string = query
			$json_content = flag to set the header and output format as JSON, typically used in AJAX calls
		*/
		$model = $orm->Mod("DELETE FROM users WHERE ID = 1");

		echo $model;

		$orm->Close();

	}

	
}

?>