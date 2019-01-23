/**
	Diese Klasse stellt die Funktionen zum darstellen der Diagramme bereit
**/

//Konstanten
const INSTAGRAM_POST_URL = 'https://www.instagram.com/p/';

/*
	Diese Funktion ist für die Darstellung des Abonnenten Zugang/Abgang-Diagram
 */
function drawFollowerChart(follower_history, media=null) {
	//console.log(media)
	//console.log(follower_history)
	let data = new google.visualization.DataTable();
	// Hier wird das Array mit den objekten in ein Array für das Diagramm gemapped
	// und das Datum in ein Date Objekt gespeichert
	let i = 0
	const rows = follower_history.map(entry => {
		let arr = Object.values(entry);
		let annotation = null;
		let annotationText = null;
		/* 	Posts hinzufügen wenn sie in den Zeitraum der Aufnahme fallen
			Da alle 10 Minuten akutalisiert wird muss überprüft werden 
			ob dar Beiträg im Rahmen von 600 Sekunden Stattfand	
		*/
		if(media.length > 0){
			for(let i = 0; i < media.length; i++){
				if(media[i].taken_at <= arr[0]){
					const entry = media[i]
				 	media.splice(i)
					annotation = 'Beitrag';
					annotationText = generateHTMLString(entry)
				}
			}
		}
		arr.push(annotation)
		arr.push(annotationText);
		arr[0] = new Date(arr[0]*1000); // Den Timestamp in ein JS-Datum umwandeln
		return arr;
	});

	// Falls Medien vorhanden sind werden sie als Reihe hinzugefügt
	

	// Daten hinzufügen
	data.addColumn('date', 'Zeit');
	data.addColumn('number', 'Abonnenten');
	data.addColumn({type: 'string', role: 'annotation'});
	data.addColumn({type: 'string', role: 'annotationText',p: {html:true}});
	data.addRows(rows);
	// Optionen festlegen
	let options = {
		title: 'Abonnenten Zugänge/Abgänge',
		hAxis: {
			title: 'Zeit'
		},
		vAxis: {
			title: 'Abonnenten'
		},
		explorer: {
			actions: ['dragToZoom', 'rightClickToReset'],
			axis: 'horizontal',
			keepInBounds: true,
			maxZoomIn: 6.0},
		annotations: {
			style: 'point'
		},
		tooltip: {
			isHtml: true
		}
	};
	const chart = new google.visualization.LineChart(document.getElementById('chart-follower'));
	chart.draw(data, options);
}

function drawMediaTimeEngagementChart(media) {
	let data = new google.visualization.DataTable();
	let rows = []
	// Daten vorbereiten
	for(let m of media){
		rows.push([
			new Date(m.taken_at),
			m.engagement_rate,
			generateHTMLString(m),
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
	const chart = new google.visualization.LineChart(document.getElementById('chart-time-post'));

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

	const data = new google.visualization.DataTable();

	// Nur die ersten 10 Hashtags nutzen
	const rows = hashtags.splice(0,10);

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
	const chart = new google.visualization.BarChart(document.getElementById('chart-hashtag'));
	chart.draw(data, options);
}

// helper functions

function generateHTMLString(mediaEntry){
	let media_url = '';
		const datetime = new Date(mediaEntry.taken_at*1000);
		if(mediaEntry.image_versions2 === undefined){
			media_url = mediaEntry.carousel_media[0].image_versions2.candidates[1].url;
		}else{
			media_url = mediaEntry.image_versions2.candidates[1].url
		}
		return '<img src="' +	media_url + '"><br><div style="margin: 0.25em; text-align: center; font-weight: bolder"> ' +
			'Zeit: ' + datetime.format("HH:MM") + ' | ER: ' + mediaEntry.engagement_rate.toFixed(2) + '</div>'
}