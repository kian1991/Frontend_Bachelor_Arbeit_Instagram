/*

 */

// Konstanten
const API_URL = 'http://api.instalyzer.ml:5000/users/';
const REFRESH_INTERVAL = 10 * 1000; // in ms
const INSTAGRAM_URL = 'https://www.instagram.com/';
const API_URL_DEBUG = 'http://localhost:5000/users/';


// Funktionen

// Read a page's GET URL variables and return them as an associative array.
function getFirstUrlParameter() {
    const query = window.location.href.slice(window.location.href.indexOf('?') + 1);
    return query.split('=')[1];
}

function getUserFromAPI(username, limit) {
	$.ajax({
		url: API_URL + username,
		type: "GET",
		crossDomain: true,
		data: 'limit=' + limit,
		dataType: "json",
		statusCode: {
			200: response => {
				setLoading(false);
				fillBasicInfo(response)
			},
			202: response => {
				fillBasicInfo(response);
				if(response.error) {
					alert('Benutzer nicht gefunden. Bitte nocheinmal versuchen.')
					window.location = 'index.html'
				}
				if(response.media_count > 0) setLoading(true);
				if(response.isPrivate) return; // Nicht nochmal abrufen, wenn Profil Privat ist.
				setTimeout(() => {
					getUserFromAPI(username, limit)
				}, REFRESH_INTERVAL)
			}
		},
		error: function (xhr, status) {
			alert("error");
		}
	});
}


/*
	Oberflächen verändernde funktionen
*/
function setLoading(isLoading) {
	$('#loading-container').css('display', isLoading ? 'flex' : 'none');
}

function setPrivate() {
	$('#loading-container').html('<strong> Profil ist privat. </strong>')
}

function fillBasicInfo(accountData){
	console.log(accountData);
	$('#avatar').attr('src', accountData.profile_pic_url)
	$('#username').html(
		'<a ' +
		'href="' + INSTAGRAM_URL + accountData.username+'" ' +
		'target="_blank" ' +
		'style="text-decoration: none; color: var(--color-font-dark)">'
		+ accountData.username +
		'</a>'
	);
	$('#full-name').html('<strong>' + accountData.full_name + '</strong>');
	$('#bio').text(accountData.biography)
	$('#follower').text(accountData.follower_count)
	$('#followings').text(accountData.following_count)
	$('#media').text(accountData.media_count)
	if (accountData.is_private){
		setPrivate();
	}else if(accountData.created_at !== undefined) { //Sicherstellen, das der Eintrag aus der Datenbank stammt
		drawCharts(accountData)
		// EventListener hinzufügen, damit beim verädern der Fenstergröße die Diagramme angepasst werden
		window.addEventListener('resize', () => drawCharts(accountData)); 
	}
}

/**
 	Visualisierung der Daten in google Charts
 **/

function drawCharts(accountData) {
	google.charts.load('current', {packages: ['corechart', 'line', 'map'],
									language: 'de'});
	if(accountData.follower_count_history.length > 1) {
		// Nur Medien übergeben, die nach anfang des Monitorings veröffentlich wurden
		const media = accountData.media.filter(entry => entry.taken_at >= accountData.created_at);
		google.charts.setOnLoadCallback(() => drawFollowerChart(accountData.follower_count_history, media));
	}
	if(accountData.media_count > 0) {
		$('.only-visible-if-media').css('display', 'block');
		google.charts.setOnLoadCallback(() => drawMediaTimeEngagementChart(accountData.media));
		google.charts.setOnLoadCallback(() => drawTopTenHashtags(accountData.hashtags));
		google.charts.setOnLoadCallback(() => drawPostMap(accountData.hashtags));
	}
}



// Dokument hat geladen, initales Limit wird auf 200 gesetzt

let limit = 200;

$(document).ready(function () {
	getUserFromAPI(getFirstUrlParameter(), limit);
	$('#select-limit').change(() => {
		const selected = $(this).find(":selected").text();
		console.log(selected);
		selected === 'Zeige alle Beiträge' ? limit = 3000 : limit = parseInt(selected);
		getUserFromAPI(getFirstUrlParameter(), limit);
	});
});


