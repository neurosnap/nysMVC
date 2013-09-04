<?php

class Plugins {

	private $plugin_list;
	public $plugin_css = array("");
	public $plugin_js = array("");

	//accept std object or array
	public function setPlugins($obj) {

		if (gettype($obj) == "array" || gettype($obj) == "object") {

			require('./settings.php');

			$this->plugin_list = json_decode(json_encode($obj));

			//jquery
			array_push($this->plugin_js, $settings->lib_dir . "/js/jquery-2.0.3.min.js");
			//jquery_ui
			array_push($this->plugin_js, $settings->lib_dir . "/js/jquery-ui.min.js");
			array_push($this->plugin_css, $settings->lib_dir . "/css/jquery-ui.min.css");

			//bootstrap
			array_push($this->plugin_js, $settings->lib_dir . "/js/bootstrap.min.js");
			array_push($this->plugin_css, $settings->lib_dir . "/css/bootstrap.min.css");
			array_push($this->plugin_css, $settings->lib_dir . "/css/bootstrap-responsive.min.css");
			//default plugins
			array_push($this->plugin_css, "./layouts/assets/css/supr_main.css");

			array_push($this->plugin_js, "./layouts/assets/js/nysus_supr.js");
			array_push($this->plugin_js, "./layouts/assets/js/core.js");

			foreach ($this->plugin_list as $key => $plugin) {

				//CASE statement to call appropriate function
				switch ($plugin) {
					//Always (for proper loading)
					case "datatables":
						array_push($this->plugin_css, $settings->lib_dir . "/css/jquery.dataTables.css");
						array_push($this->plugin_js, $settings->lib_dir . "/js/jquery.dataTables.min.js");
					break;

					case "tblEditor":
						array_push($this->plugin_css, $settings->lib_dir . "/css/tblEditor.css");
						array_push($this->plugin_js, $settings->lib_dir . "/js/tblEditor.js");
					break;

					case "nysReports":
						array_push($this->plugin_js, $settings->lib_dir . "/js/nysReports.js");
					break;

					case "select2":
						array_push($this->plugin_css, $settings->lib_dir . "/css/select2.css");
						array_push($this->plugin_js, $settings->lib_dir . "/js/select2.min.js");
					break;
						
				}

			}

			array_shift($this->plugin_css);
			array_shift($this->plugin_js);

		} else {
			echo 'setPlugin(param), param must be array or object';
		}
	}

	//manually add a plugin
	public function addPlugin($css, $js) {
		if (gettype() == "string" && gettype() == "string") {
			array_push($this->plugin_css, $css);
			array_push($this->plugin_js, $js);
		} else {
			echo 'addPlugin(css, js), css and js must both be strings containing the directory and file of both css and js.';
		}
	}

	//get CSS plugin list
	public function getPluginsCSS() {
		return $this->plugin_css;
	}

	//get JS plugin list
	public function getPluginsJS() {
		return $this->plugin_js;
	}

}

?>
