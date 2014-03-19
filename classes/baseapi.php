<?php

/*
More or less the super class of Controllers, 
interacts with ORM class which is the Model
*/
abstract class BaseAPI {

	protected $urlvalues;
	protected $api;
	protected $action;
	protected $settings;
	protected $cookies;

	//set some variables in class creation
	public function __construct($action, $urlvalues) {

		$this->action = strtolower($action);
		$this->api = strtolower(get_class($this));
		$this->urlvalues = $urlvalues;

	}

	//loads the corresponding APIs "action" or method
	//IE Dashboard->Index();
	public function loadAction($request) {
		return $this->{$this->action}($request, $this->urlvalues);
	}

	/*
	Only way to load a view
	$model = data from SQL, made available in the view
	$authenticate = false by default, accepts array of strings that correspond to what permission should be set e.g. array("admin", "manage_users")
	$fullview = determines whether the layout should be loaded or just the view, true load layout, false doesnt
	$view_override = looking for the filename of the other view file to load instead of the default action view
	$layout_override = Looking for the filename of the other layout file to load instead of the default layout in settings folder 
	*/
	protected function loadView($model, $authenticate = false, $fullview = true, $view_override = false, $layout_override = false) {

		//$settings object sent to the view
		require('./settings.php');

		//object to be sent to view
		$api = new stdClass();
		//api and action values to be passed down to the view
		$api->name = ucfirst($this->api);
		$api->action = ucfirst($this->action);
		$api->id = null;
		$api->model = $model;

		//if ID exists, send it to the view
		if (array_key_exists("id", $this->urlvalues)) { 
			$api->id = $this->urlvalues['id'];
		}

		$api->view = './views/' . $this->api . '/' . $this->action . '.php';
		//check to see if we should override the view with some other view
		if ($view_override) {
			$api->view = './views/' . $this->api . '/' . $view_override;
		}

		//plugin functionality
		require_once("./plugin_settings.php");
		$plugin_settings = get_plugins($this->api, $this->action);
		require_once("./classes/plugins.php");
		$api->plugins = new Plugins($plugin_settings, $settings->lib_dir, $this->api, $this->action);

		//load full view
		if ($fullview) {

			if (!$layout_override) {
				require('./layouts/' . $settings->layout);
			} else {
				require('./layouts/' . $layout_override);
			}

		} else {

			//will only return the view without a layout
			require($api->view);

		}

	}

}

?>
