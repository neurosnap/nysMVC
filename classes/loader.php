<?php

class Loader {

	private $api;
	private $action;
	private $urlvalues;
	
	//store URL values on object creation
	public function __construct($urlvalues) {
	
		$this->urlvalues = $urlvalues;
		
		if (!array_key_exists("api", $this->urlvalues)) {
			$this->api = "dashboard";
		} else {
			$this->api = $this->urlvalues['api'];
		}
		
		if (!array_key_exists("action", $this->urlvalues)) {
			$this->action = "index";
		} else {
			$this->action = $this->urlvalues['action'];
		}
		
	}
	
	//establish requested api as an object
	public function createAPI() {
	
		if (class_exists($this->api)) {
			$parents = class_parents($this->api);
			
			//does the class extend the api class?
			if (in_array("BaseAPI", $parents)) {
				//does the class contain the requested method?
				if (method_exists($this->api, $this->action)) {
					//i.e. $this->api = "Dashboard" -- return new Dashboard("index", $_GET);
					return new $this->api($this->action, $this->urlvalues);
				} else {
					//bad method error
					return $this->urlvalues;
				}
			} else {
				//bad api error
				return $this->urlvalues;
			}
		} else {
			//bad api error
			return $this->urlvalues;
		}
	
	}
	

}

?>