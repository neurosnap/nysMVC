<?php

class ORM {

	protected $con;
	protected $db_con;
	
	protected $driver;
	protected $server;
	protected $db;
	protected $user;
	protected $pass;

	function __construct() {

		require("./settings.php");

		$this->driver = $settings->driver;
		$this->server = $settings->server;
		$this->db = $settings->db;
		$this->user = $settings->user;
		$this->pass = $settings->pass;

	}

	public function Connect() {

		if ($this->driver == "sqlsrv") {

			$this->db_con = array("Database" => $this->db, "UID" => $this->user, "PWD" => $this->pass, "ReturnDatesAsStrings" => true);
			$this->con = sqlsrv_connect($this->server, $this->db_con);

		} else if ($this->driver == "mssql") {

			$this->con = mssql_connect($this->server, $this->user, $this->pass);
			$this->db_con = mssql_select_db($this->db);

		} else if ($this->driver == "mysql") {

			$this->con = mysql_connect($this->server, $this->user, $this->pass);
			$this->db_con = mysql_select_db($this->db);

		} else {

			die("{ \"error\": \"No SQL driver selected for PHP. Set settings->driver to sqlsrv or mssql in settings.php\" }");

		}

		if (!$this->con) {

			if ($this->driver == "sqlsrv")
				print_r(sqlsrv_errors());
			else if ($this->driver == "mysql")
				print_r(mysql_error());
			else 
				die("{ \"error\": \"MSSQL Connect failed when attempting to secure connection to database.\" }");
		}

	}

	public function Close() {

		if ($this->driver == "sqlsrv")
			sqlsrv_close($this->con);
		else if ($this->driver == "mssql")
			mssql_close($this->con);
		else if ($this->driver == "mysql")
			mysql_close($this->con);

	}

	public function Qu($string, $json_content = true, $multiple_records = false) {

		if ($json_content) {
			header('Content-type: application/json');
		}

		//$this->Connect();

		$arr = array();

		if ($this->driver == "sqlsrv") {

			$data = sqlsrv_query($this->con, $string);

			if ($data === false) {

				$obj = new stdClass();
				$obj->message = 'Error: ' . print_r(sqlsrv_errors()) . ', Query: ' . $string;
				$obj->success = false;

				if ($json_content)
					return json_encode($obj);
				else
					return $obj;

			}

			if ($multiple_records == false) {

				while ($obj = sqlsrv_fetch_object($data)) {
					array_push($arr, $obj);
				}

			} else {
				
				$count = 0;
				$arr = new stdClass();
				// Iterate through returned records
				do {

					while ($obj = sqlsrv_fetch_object($data)) {

						if (!property_exists($arr, $multiple_records[$count]))
							$arr->$multiple_records[$count] = array();
						
						array_push($arr->$multiple_records[$count], $obj);

					}

					$count++;

				} while (sqlsrv_next_result($data));

				sqlsrv_free_stmt($data);

			}

		} else if ($this->driver == "mssql") {

			$data = mssql_query($string, $this->con);

			if ($data === false) {

				$obj = new stdClass();
				$obj->success = false;
				$obj->message = "Query returned false";

				if ($json_content)
					return json_encode($obj);
				else
					return $obj;

			}

			if ($multiple_records == false) {

				while ($obj = mssql_fetch_object($data)) {
					array_push($arr, $obj);
				}
				
			} else {

				$count = 0;
				$arr = new stdClass();
				// Iterate through returned records
				do {
					
					while ($obj = mssql_fetch_object($data)) {

						if (!property_exists($arr, $multiple_records[$count]))
							$arr->$multiple_records[$count] = array();

						array_push($arr->$multiple_records[$count], $obj);

					}

					$count++;

				} while (mssql_next_result($data));

				mssql_free_result($data);

			}

		} else if ($this->driver == "mysql") {

			$data = mysql_query($string, $this->con);

			if ($data === false) {

				$obj = new stdClass();
				$obj->success = false;
				$obj->message = "Query returned false";

				if ($json_content)
					return json_encode($obj);
				else
					return $obj;

			}

			if ($multiple_records == false) {

				while ($obj = mysql_fetch_object($data)) {
					array_push($arr, $obj);
				}
				
			} else {

				$count = 0;
				$arr = new stdClass();
				// Iterate through returned records
				do {
					
					while ($obj = mysql_fetch_object($data)) {

						if (!property_exists($arr, $multiple_records[$count]))
							$arr->$multiple_records[$count] = array();

						array_push($arr->$multiple_records[$count], $obj);

					}

					$count++;

				} while (mysql_data_seek($data));

				mysql_free_result($data);

			}

		}

		//$this->Close();

		if ($json_content)
			return json_encode($arr);
		else
			return $arr;

	}

	public function Mod($string, $json_content = true) {

		if ($json_content) {
			header('Content-type: application/json');
		}

		//$this->Connect();

		$msg = new stdClass();

		if ($this->driver == "sqlsrv") {

			$data = sqlsrv_query($this->con, $string);

			if ($data === false) {

				$msg->success = false;
				$msg->message = 'Error: ' . sqlsrv_errors() . ', Query: ' . $string;

			} else {

				$msg->success = true;
				$msg->message = 'SQL has been updated';

			}

		} else if ($this->driver == "mssql") {

			$data = mssql_query($string, $this->con);

			if ($data === false) {

				$msg->success = false;
				$msg->message = "Error: Query returned false, Query: " . $string;

			} else {

				$msg->success = true;
				$msg->message = 'SQL has been updated';

			}

		} else if ($this->driver == "mysql") {

			$data = mysql_query($string, $this->con);

			if ($data === false) {

				$msg->success = false;
				$msg->message = "Error: Query returned false, Query: " . $string;

			} else {

				$msg->success = true;
				$msg->message = 'SQL has been updated';

			}

		}

		//$this->Close();

		if ($json_content)
			return json_encode($msg);
		else
			return $msg;

	}

}

?>