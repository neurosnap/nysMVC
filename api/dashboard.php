<?php

class Dashboard extends BaseAPI {

	//model class that is an Object Relational Map (ORM) to SQL database
	protected $model;

	protected function Index() {

		$this->model = new ORM();

		//loads the view with data from model
		$this->loadView("This is the model data");
	
	}
	
}

?>