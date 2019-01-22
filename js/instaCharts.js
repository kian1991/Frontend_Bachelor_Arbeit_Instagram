/**
	Diese Klasse stellt die Funktionen zum darstellen der Diagramme bereit
**/

//Konstanten
const INSTAGRAM_POST_URL = 'https://www.instagram.com/p/';

/*
	Diese Funktion ist für die Darstellung des Abonnenten Zugang/Abgang-Diagram
 */
function drawFollowerChart(follower_history) {
	let data = new google.visualization.DataTable();
	// Hier wird das Array mit den objekten in ein Array für das Diagramm gemapped
	// und das Datum in ein Date Objekt gespeichert
	const rows = follower_history.map(entry => {
		let arr = Object.values(entry);
		arr[0] = new Date(arr[0]*1000);
		return arr;
	});

	// Daten hinzufügen
	data.addColumn('date', 'Zeit');
	data.addColumn('number', 'Abonnenten');
	data.addRows(rows);
	// Optionen festlegen
	let options = {
		title: 'Abonnenten Zugänge/Abgänge',
		hAxis: {
			title: 'Zeit'
		},
		vAxis: {
			title: 'Abonnenten'
		},explorer: {
			actions: ['dragToZoom', 'rightClickToReset'],
			axis: 'horizontal',
			keepInBounds: true,
			maxZoomIn: 6.0}
	};
	const chart = new google.visualization.LineChart(document.getElementById('follower-chart'));
	chart.draw(data, options);
}

function drawMediaTimeEngagementChart(media) {
	let data = new google.visualization.DataTable();
	let rows = []
	// Daten vorbereiten
	for(let m of media){
		let media_url = '';
		const datetime = new Date(m.taken_at*1000);
		if(m.image_versions2 === undefined){
			media_url = m.carousel_media[0].image_versions2.candidates[1].url;
		}else{
			media_url = m.image_versions2.candidates[1].url
		}
		rows.push([
			datetime,
			m.engagement_rate,
			'<img src="' +	media_url + '"><br><div style="margin: 0.25em; text-align: center; font-weight: bolder"> ' +
			'Zeit: ' + datetime.format("HH:MM") + '</div>',
			INSTAGRAM_POST_URL + m.code
		])
	}

	// Daten hinzufügen
	data.addColumn('date', 'Zeit');
	data.addColumn('number', 'Engagement Rate');
	data.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
	data.addColumn({'type': 'string', 'role': 'link'});
	data.addRows(rows);

	// Optionen festlegen
	let options = {
		title: 'Engagementrate der Beiträge',
		tooltip: { isHtml: true },
		hAxis: {
			title: 'Zeit'
		},
		vAxis: {
			title: 'Engagement Rate'
		},explorer: {
			actions: ['dragToZoom', 'rightClickToReset'],
			axis: 'horizontal',
			keepInBounds: true,
			maxZoomIn: 6.0}
	};
	const chart = new google.visualization.LineChart(document.getElementById('time-post-chart'));

	// Links zur weiterleitung an die Instagram Seite
	google.visualization.events.addListener(chart, 'select', function (e) {
		const selection = chart.getSelection();
		if (selection.length) {
			const row = selection[0].row;
			const url = data.getValue(row, 3);
			const tab = window.open(url, '_blank');
			tab.focus();
		}
	});
	chart.draw(data, options);
}

function drawTopTenHashtags(hashtags) {

	let data = new google.visualization.DataTable();
	let rows = [];
	//Daten Vorbereiten
	for(let tag in hashtags){
		rows.push([
			tag,
			hashtags[tag]
		])
	}

	// Hashtags sortieren
	rows = rows.sort(compareHashtag).splice(0,10);


	// Daten hinzufügen
	data.addColumn('string', '');
	data.addColumn('number', 'Anzahl');
	data.addRows(rows);
	// Optionen festlegen
	let options = {
		title: 'Top 10 Hashtags',
		hAxis: {
			title: 'Anzahl'
		},
		vAxis: {
			title: 'Hashtags'
		},explorer: {
			actions: ['dragToZoom', 'rightClickToReset'],
			axis: 'horizontal',
			keepInBounds: true,
			maxZoomIn: 6.0}
	};
	const chart = new google.visualization.BarChart(document.getElementById('hashtag-chart'));
	chart.draw(data, options);
}



// Helper functions

function compareHashtag(hashtagA, hashtagB) {
	return hashtagB[1] - hashtagA[1];
}