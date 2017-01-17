$(document).ready(function() {
	var tzs = [
		'US/Eastern',
		'US/Central',
		'US/Mountain',
		'US/Pacific',
		'US/Hawaii',
		'UTC',
		'Etc/GMT',
		'Etc/GMT+0',
		'Etc/GMT+1',
		'Etc/GMT+10',
		'Etc/GMT+11',
		'Etc/GMT+12',
		'Etc/GMT+2',
		'Etc/GMT+3',
		'Etc/GMT+4',
		'Etc/GMT+5',
		'Etc/GMT+6',
		'Etc/GMT+7',
		'Etc/GMT+8',
		'Etc/GMT+9',
		'Etc/GMT-0',
		'Etc/GMT-1',
		'Etc/GMT-10',
		'Etc/GMT-11',
		'Etc/GMT-12',
		'Etc/GMT-13',
		'Etc/GMT-14',
		'Etc/GMT-2',
		'Etc/GMT-3',
		'Etc/GMT-4',
		'Etc/GMT-5',
		'Etc/GMT-6',
		'Etc/GMT-7',
		'Etc/GMT-8',
		'Etc/GMT-9'
	]

	$('#datepicker').datepicker({
		// startDate: '-3d'
		startView: 'years',
		orientation: 'bottom',
		defaultViewDate: {
			year: 1985,
			month: 4,
			day: 13
		},
		format: 'MM d, yyyy',
		autoclose: true
	});

	$('#timepicker').timepicker({
		defaultTime: '7:24pm'
	});

	var $tzs = $('#input-tz, #output-tz');
	$.each(tzs, function(_, tz) {
		$.each($tzs, function(_, $select) {
			var $option = $('<option>').text(tz).prop('value', tz)
			$option.appendTo($select);
		});
	});
	$('#input-tz').find('option[value="US/Eastern"]').prop('selected', true);
	$('#output-tz').find('option[value="US/Pacific"]').prop('selected', true);

	function getStart() {
		var startDate = $('#datepicker').datepicker('getDate');
		var startTime = $('#timepicker').val();
		var startTz = $('#input-tz').val();
		var parsedTime = startTime.match(/(\d+):(\d+)\s(..)/);
		var temp = moment(startDate);
		var dateString = temp.format('YYYY-MM-DD');
		var start = moment.tz(dateString, startTz);
		start.add(parsedTime[1], 'hours');
		start.add(parsedTime[2], 'minutes');
		if (parsedTime[3] === 'PM') {
			start.add(12, 'hours');
		}
		return start;
	}

	function calcCurrent() {
		var millis = new Date() - getStart();
		var seconds = Math.floor(millis / 1000);
		var secondString = seconds.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		$('#current-seconds').text(secondString);
	}

	function calcParty() {
		var endTz = $('#output-tz').val();
		var seconds = parseInt($('#seconds').val().replace(/,/g, ''), 10);
		var start = getStart();
		start.add(seconds, 'seconds');
		$('#end-date').text(start.clone().tz(endTz).format('MMMM Do YYYY, h:mm:ss a'));

		if (new Date() - start > 0) {
			$('#reach').text('reached');
		} else {
			$('#reach').text('will reach');
		}
	}

	$('#datepicker').on('change', calcParty);

	calcParty();
	calcCurrent();
	setInterval(calcCurrent, 1000);
});
