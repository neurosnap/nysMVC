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

	public function loadAction() {
		return $this->{$this->action}();
	}

	protected function loadView($model, $fullview = true, $authenticate = false, $view_override = false) {

		$api = new stdClass();
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

			require('./settings.php');

			if (!$view_override)
				$api->viewloc = './views/' . $this->api . '/' . $this->action . '.php';
			else
				$api->viewloc = './views/' . $this->api . '/' . $view_override;

			$api->jsloc = './views/' . $this->api . '/js/' . $this->action . '.js';

			$api->name = ucfirst($this->api);
			$api->action = ucfirst($this->action);

			//build array of necessary plugins
			switch($this->api) {

				case "dashboard":
					$api->page_plugins = array("");
				break;

				case "setup":
					$api->page_plugins = array("datatables", "tblEditor");
				break;

				case "report":
					$api->page_plugins = array("datatables", "select2", "nysReports");
				break;

				default:
					$api->page_plugins = array("");
					$api->name = 'Dashboard';
					$api->action = 'Dashboard';
				break;

			}

			if ($fullview)
				require('./layouts/layout.php');
			else
				require($viewloc);

		}


	}

}

?>
