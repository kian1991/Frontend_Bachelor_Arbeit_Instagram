/**
	Diese Klasse stellt die Funktionen zum darstellen der Diagramme bereit
**/

//Konstanten
const INSTAGRAM_POST_URL = 'https://www.instagram.com/p/';

/*
	Diese Funktion ist für die Darstellung des Abonnenten Zugang/Abgang-Diagram
 */
function drawFollowerChart(follower_history, media=null) {
	let data = new google.visualization.DataTable();
	// Hier wird das Array mit den objekten in ein Array für das 
	// Diagramm gemapped und das Datum in ein Date Objekt gespeichert
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
		// Den Timestamp in ein JS-Datum umwandeln
		arr[0] = new Date(arr[0]*1000); 
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
	let rows = prepareMedia(media);


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
	hashtags = sortHashtagsToArray(hashtags);
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

// Die Karte braucht eine globale Variable um die Karten-Informationen der Callback Funktion
// bereitzustellen

let MAP_DATA = '';

function drawMapCallback(){
	let map = new google.maps.Map(document.getElementById('chart-post-map'), {
		center: {lat: -34.397, lng: 150.644},
		zoom: 0
	});	
	// Die Makierungen der Karte hinzufügen und die Bildinformationen hinzufügen
	// Die InfoBoxen werden zum Einfachen schließen in ein Array gespeichert
	const infoWindowArray = [];
	for(loc of MAP_DATA){
		// Marker
		const marker = new google.maps.Marker({
			position: {
				lat: loc.lat,
				lng: loc.lng
			},
			map: map
		});
		// Bildinformationen beim Klick auf den Marker
		const infowindow = new google.maps.InfoWindow({
			content: loc.html
		  });
		
		infoWindowArray.push(infowindow);
		
		marker.addListener('click', () => {
			closeInfoWindows()
			infowindow.open(map, marker);
		});
	}
	// An den Letzten Marker ranzoomen
	map.setCenter({lat: MAP_DATA[0].lat, lng: MAP_DATA[0].lng})
	map.setZoom(8)
	//Falls irgendwo auf der Karte geklickt wird sollen sich alle Boxen schließen
	map.addListener('click', () => {
		closeInfoWindows()
	})

	function closeInfoWindows(){
		for(info of infoWindowArray){
			info.close();
		}
	}
}

function drawPostMap(mapData) {
	//Google Maps Api Key authetifizierung
	var script = document.createElement('script');
	script.src = 'https://maps.googleapis.com/maps/api/js?key=KEY&callback=drawMapCallback';
	document.body.appendChild(script);
}


// Hilfs-Funktionen

function prepareMedia(media){
		// Die Längen und Breitengrade können hier schonmal 
		// herausgefiltert und in die golbale Variable
		// MAP_DATA geschrieben werden.
		locations = []
		rows = []
		for(let m of media){
			// Falls Geoinformationen verfügbar sind, dem Location-Array hinzufügen
			if(m.lat !== undefined){
				locations.push({
					lat: m.lat,
					lng: m.lng,
					html: generateHTMLString(m)
					})
			}
			// Medieninformationen dem 'rows' array hinzufügen
			rows.push([
				new Date(m.taken_at),
				m.engagement_rate,
				generateHTMLString(m),
				INSTAGRAM_POST_URL + m.code
			])
		}
		MAP_DATA = locations;
		return rows;
}

function generateHTMLString(mediaEntry){
		const datetime = new Date(mediaEntry.taken_at*1000);
		let mediaUrl = null;
		if(mediaEntry['media_type'] !== 2){
			if(mediaEntry.image_versions2 === undefined){ // Falls mehrere Bilder auf einmal gepostet wurden
				for(entry of mediaEntry.carousel_media){ // wird geprßft ob sich anzeigbare Bilder
					if(entry['media_type'] !== 2){		// unter ihnen befinden
						mediaUrl = entry.image_versions2.candidates[1].url;
					}
				}
			}else{
				mediaUrl = mediaEntry.image_versions2.candidates[1].url
			}
		}
		// Falls Beitrag ein Video ist, wird die Beschreibung hinzugefüt
		const caption = mediaEntry['caption']['text'] !== undefined ? mediaEntry['caption']['text'].slice(0,70) + '...' : 'Kein Bild verfügbar' 

		const availableImageData = mediaUrl ? '<img src="' +	mediaUrl  + '">' : '<div style="height: 240;width: 240">' + caption + '</div>';

		return availableImageData + '<br><div style="margin: 0.25em; text-align: center; font-weight: bolder">' +
			'Zeit: ' + datetime.format("HH:MM") + ' | ER: ' + mediaEntry.engagement_rate.toFixed(2) + '</div>'
}

function sortHashtagsToArray(hashtags) {
	function compareHashtag(hashtagA, hashtagB) {
		return hashtagB[1] - hashtagA[1];
	}
	let sortableHashtagArray = []
	for(let tag in hashtags){
		sortableHashtagArray.push([
			tag,
			hashtags[tag]
		])
	}
	return sortableHashtagArray.sort(compareHashtag)
}