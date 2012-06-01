/*
 * 2011 written by Sam Deering on JQUERY4U
 * Source: http://www.jquery4u.com/snippets/url-parameters-jquery/#.T8ihOKXgCXZ
 */
$.urlParam = function(name){
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results != null)
    	return results[1] || 0;
    else
    	return 0;
}