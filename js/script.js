/*
	Dieses Script ist.....
 */
// Konstanten
const API_URL = 'http://api.instalyzer.ml:5000/users/'
const API_URL_DEBUG = 'http://localhost:5000/users/'


// Funktionen
// Read a page's GET URL variables and return them as an associative array.
function getFirstUrlParameter() {
    const query = window.location.href.slice(window.location.href.indexOf('?') + 1);
    return query.split('=')[1];
}


function getUserFromAPI(username, limit) {
	let json = {};
	$.ajax({
		url: API_URL + username,
		type: "GET",
		crossDomain: true,
		data: '?limit=' + limit,
		dataType: "json",
		statusCode: {
			200: response => {
				fillBasicInfo(response) //todo 202 Wait for
			},
			202: response => {
                json = response
			}
		},
		error: function (xhr, status) {
			alert("error");
		}
	});
}

function fillBasicInfo(accountData){
	console.log(accountData);
	$('#avatar').attr('src', accountData.profile_pic_url)
	$('#username').text(accountData.username)
	$('#full-name').html('<strong>' + accountData.full_name + '</strong>');
	$('#bio').text(accountData.biography)
	$('#follower').text(accountData.follower_count)
	$('#followings').text(accountData.following_count)
	$('#media').text(accountData.media_count)
}


// DEBUG

$(document).ready(function () {
	getUserFromAPI(getFirstUrlParameter(), 20)
});


