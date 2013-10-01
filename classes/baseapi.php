<?php

abstract class BaseAPI {

	protected $urlvalues;
	protected $api;
	protected $action;

	public function __construct($action, $urlvalues) {
		$this->action = strtolower($action);
		$this->api = strtolower(get_class($this));
		$this->urlvalues = $urlvalues;
	}

	//loads the corresponding APIs "action" or method
	//IE Dashboard->Index();
	public function loadAction() {
		return $this->{$this->action}();
	}

	//Only way to load a view
	protected function loadView($model, $fullview = true, $authenticate = false, $view_override = false, $layout_override = false) {

		//object to be sent to view
		$api = new stdClass();
		//flag to test if the view should be loaded
		$load_view = false;

		if (!isset($authenticate))
			$authenticate = null;

		//if ID exists, send it to the view
		if (isset($this->urlvalues['id'])) 
			$api->id = $this->urlvalues['id'];
		else
			$api->id = null;

		//require admin flag
		if ((bool) $authenticate) {

			if (isset($_SESSION['operator_ID']) && isset($_SESSION['permission_level'])) {

				if ($_SESSION['permission_level'] >= $authenticate)
					$load_view = true;
				else 
					echo '<div style="color: red;">Permission level mismatch:  You do not have access to this page.</div>';

			
			} else {
				
				echo '<div style="color: red;">Authentication not set:  You do not have access to this page.</div>';
			
			}

		} else {

			$load_view = true;

		}

		//if load_view is true, output view
		if ($load_view) {

			//global variables
			require('./settings.php');

			//check to see if we should override the view with some other view
			if (!$view_override)
				$api->view = './views/' . $this->api . '/' . $this->action . '.php';
			else
				$api->view = './views/' . $this->api . '/' . $view_override;

			//view-specific javascript file
			$jsloc = './views/' . $this->api . '/js/' . $this->action . '.js';

			if (file_exists($jsloc))
				$api->jsloc = $jsloc;
			else
				$api->jsloc = null;
			
			//view-specific css file
			$cssloc = './views/' . $this->api . '/css/' . $this->action . '.css';

			if (file_exists($cssloc))
				$api->cssloc = $cssloc;
			else 
				$api->cssloc = null;

			//api and action values to be passed down to the view
			$api->name = ucfirst($this->api);
			$api->action = ucfirst($this->action);

			//load full view
			if ($fullview) {

				if (!$layout_override)
					require('./layouts/' . $settings->layout);
				else
					require('./layouts/' . $layout_override);

			} else {

				//will only return the view without a layout
				require($viewloc);

			}

		}


	}

}

?>
