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

		require('./settings.php');

		$this->settings = $settings;
		$this->cookies = $cookies;

		$this->action = strtolower($action);
		$this->api = strtolower(get_class($this));
		$this->urlvalues = $urlvalues;
	}

	//loads the corresponding APIs "action" or method
	//IE Dashboard->Index();
	public function loadAction($post) {
		return $this->{$this->action}($post, $this->urlvalues);
	}

	//$msg = string of message to be loaded
	//$type = type of notification, i.e. error, success, warning, info
	protected function notify($msg, $type) {

		$special_type = false;

		if ($type != "warning")
			$special_type = true;

		$notify = '<div class="alert ' . ($special_type ? 'alert-' . $type : '') . '">' . $msg . ' <a href="index.php">Back</a></div>';

		require('./layouts/' . $this->settings->layout_notify);
	
	}

	//function used to check for permissions
	protected function hasPerm($req_permission, $have_permissions = false) {

		if (!$have_permissions)
			$have_permissions = $this->cookies->permissions;

		for ($i = 0; $i < count($have_permissions); $i++)
			if ($have_permissions[$i] == $req_permission)
				return true;

		return false;

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

		//object to be sent to view
		$api = new stdClass();
		//flag to test if the view should be loaded
		$load_view = true;

		if (!isset($authenticate))
			$authenticate = null;

		//if ID exists, send it to the view
		if (isset($this->urlvalues['id'])) 
			$api->id = $this->urlvalues['id'];
		else
			$api->id = null;

		//require admin flag
		if ((bool) $authenticate) {

			$auth = $this->cookies;

			//requires user_ID as the ID of the user in the relational database
			if (isset($auth->user_ID)) {

					//requires permissions to be set as an Array of Strings
					if (isset($auth->permissions)) {

						for ($i = 0; $i < count($authenticate); $i++) {

							$req_permission = $authenticate[$i];
							$found_permission = false;

							for ($j = 0; $j < count($auth->permissions); $j++) {
								
								$have_permission = $auth->permissions[$j];

								if ($req_permission == $have_permission) {
									$found_permission = true;
								}

							}

							//no permissions match, throw an error
							if (!$found_permission) {

								$this->notify("Permission [" . $req_permission . "] not found for user.", "error");
								$load_view = false;

							}

						}

					} else {
						$this->notify("No permissions found for users.", "error");
						$load_view = false;
					}

			} else {
				
				$this->notify("Authentication not set:  You do not have access to this page.", "error");
				$load_view = false;
			
			}

		} else {

			$load_view = true;

		}

		//if load_view is true, output view
		if ($load_view) {

			//check to see if we should override the view with some other view
			if (!$view_override)
				$api->view = './views/' . $this->api . '/' . $this->action . '.php';
			else
				$api->view = './views/' . $this->api . '/' . $view_override;

			//api-specific javascript file
			$js_api = './views/' . $this->api . '/js/' . $this->api . '.js';

			if ($this->api != $this->action && file_exists($js_api)) {
				$api->js_api = $js_api;
			} else {
				$api->js_api = null;
			}

			//view-specific javascript file
			$js_view = './views/' . $this->api . '/js/' . $this->action . '.js';

			if (file_exists($js_view))
				$api->js_view = $js_view;
			else
				$api->js_view = null;
			
			//api-specific css file
			$css_api = './views/' . $this->api . '/js/' . $this->api . '.js';

			if ($this->api != $this->action && file_exists($css_api)) {
				$api->css_api = $css_api;
			} else {
				$api->css_api = null;
			}

			//view-specific css file
			$css_view = './views/' . $this->api . '/css/' . $this->action . '.css';

			if (file_exists($css_view))
				$api->css_view = $css_view;
			else 
				$api->css_view = null;

			//api and action values to be passed down to the view
			$api->name = ucfirst($this->api);
			$api->action = ucfirst($this->action);

			//load full view
			if ($fullview) {

				if (!$layout_override)
					require('./layouts/' . $this->settings->layout);
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
