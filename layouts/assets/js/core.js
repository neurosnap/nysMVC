
$.expr[':'].external = function(obj) {

    return !obj.href.match(/^mailto\:/)
           && (obj.hostname != location.hostname)
           && !obj.href.match(/^javascript\:/)
           && !obj.href.match(/^$/);

};

$(function() {

	$('a:external').attr('target', '_blank');

});