<?php

	$page_title = $this->settings->company_name . " " . $this->settings->product_name . " - " . $api->name;

?>

<!DOCTYPE html>
<html>
    <head>
	    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	    <title><?= $this->settings->company_name ?> - <?= $api->name ?></title>

	        <!-- Mobile Specific Metas -->
	    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta name="author" content="<?= $this->settings->company_name ?>" />
		<meta name="description" content="<?= $this->settings->product_description ?>" />
		<meta name="keywords" content="" />
		<meta name="application-name" content="<?= $this->settings->product_name ?>" />

	    <?php
	    	$plugin = new Plugins($api);

	    	echo $plugin->getPluginsCSS();
	    ?>

	    <!-- User defined javascript -->
	    <script type="text/javascript">

	    	var settings = {
	    		"base_dir": '<?= $this->settings->base_dir ?>',
	    		"image_dir": '<?= $this->settings->image_dir ?>',
	    		"lib_dir": '<?= $this->settings->lib_dir ?>',
	    		"api": '<?= $api->name ?>',
	    		"action": '<?= $api->action ?>',
	    		"id": '<?= $api->id ?>'
	    	};

	    </script>

	    <!-- Load plugins -->
	    <?php
	    	echo $plugin->getPluginsJS();
		?>

    </head>

	<body>

		<div id="header">
			<div class="navbar">
				<div class="supr-navbar-inner">
					<div class="container-fluid">
						<a class="brand" href="index.php"><img src="<?= $this->settings->logo ?>" alt="logo" style="height:55px;" /></a>

					</div>
				</div>
			</div>
		</div>

		<div id="wrapper">

			<div class="collapseBtn leftbar" style="top: 70px;">
				<a href="#" class="tipR" title="Hide sidebar"><img src="<?= $this->settings->image_dir ?>/application-dock-180.png"/></a>
			</div>


			<div id="sidebarbg"></div>

			<div id="sidebar">

				<div class="sidenav">

					<div class="sidebar-widget" style="margin: -1px 0 0 0;">
						<h5 class="title" style="margin-bottom:0">Navigation</h5>
					</div>

					<div class="mainnav">
						<ul>
							<li>
								<a href="index.php"><img src="<?= $this->settings->image_dir ?>/home.png"/>  Dashboard</a>
							</li>
							<li>
								<a href="#"><img src="<?= $this->settings->image_dir ?>/reports-stack.png"/>  Demo 1 <span class="hasDrop iconSwitch"><img src="<?= $this->settings->image_dir ?>/arrow-transition.png" /></span></a>
								<ul class="sub">
									<li><a href="index.php?api=demo&action=index"><img src="<?= $this->settings->image_dir ?>/report.png"/>  Generate</a></li>
									<li><a href="index.php?api=demo&action=edit"><img src="<?= $this->settings->image_dir ?>/report.png"/>  Edit</a></li>
								</ul>
							</li>
							<li>
								<a href="#"><img src="<?= $this->settings->image_dir ?>/reports-stack.png"/>  Demo 2 <span class="hasDrop iconSwitch"><img src="<?= $this->settings->image_dir ?>/arrow-transition.png" /></span></a>
								<ul class="sub">
									<li><a href="index.php?api=demo&action=index"><img src="<?= $this->settings->image_dir ?>/report.png"/>  Dashboard</a></li>
									<li><a href="index.php?api=demo&action=approval"><img src="<?= $this->settings->image_dir ?>/report.png"/> Approval</a></li>
								</ul>
							</li>

						</ul>
					</div>

				</div>

			</div>

			<div id="content" class="clearfix">

				<div class="contentwrapper">
					<div class="heading">
						<h3><?php echo $page_title; ?></h3>

						<ul class="breadcrumb">
							<li>You are here:</li>
							<li>
								<a href="index.php" class="tip" title="back to dashboard">
									<img src="<?= $this->settings->image_dir ?>/home.png"/>
								</a>
								<span class="divider">
									<img src="<?= $this->settings->image_dir ?>/resultset_next.png"/>
								</span>
							</li>
							<li class="active"><?php echo $api->name; ?></li>

						</ul>

					</div>
					<!-- Build page from here: -->
	               <?php require($api->view); ?>
	            </div>

	        </div>

    	</div>

    </body>
</html>