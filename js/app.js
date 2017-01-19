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
	];

	// Hey, guys. Who did I miss?
	var vips = [
		{
			name: 'Austin',
			date: '5/17/1985'
		},
		{
			name: 'Joe',
			date: '5/29/1985'
		},
		{
			name: 'Jordan',
			date: '6/30/1985'
		}
	];
	var vipAlert = false;

	$('#datepicker').datepicker({
		// startView: 'years',
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
		$('#current-seconds').text(secondString + ' seconds');
	}

	function calcParty() {
		var endTz = $('#output-tz').val();
		var seconds = parseInt($('#seconds').text().replace(/,/g, ''), 10);
		var start = getStart();
		start.add(seconds, 'seconds');
		$('#end-date').text(start.clone().tz(endTz).format('MMMM Do YYYY, h:mm:ss a z'));

		if (new Date() - start > 0) {
			$('#reach').text('reached');
		} else {
			$('#reach').text('will reach');
		}

		permalink();
		gCalLink(start);
	}

	function permalink() {
		var params = {
			date: $('#datepicker').val(),
			time: $('#timepicker').val(),
			stz: $('#input-tz').val(),
			etz: $('#output-tz').val(),
			seconds: $.trim($('#seconds').text())
		};

		window.history.replaceState(
			undefined,
			undefined,
			// '#' + $.param(params)
			'#' + btoa(JSON.stringify(params))
		)
	}

	function gCalLink(date) {
		var end = date.clone().add(1, 'seconds');
		var format = 'YYYYMMDD[T]HHmmss[Z]';
		var baseUrl = "http://www.google.com/calendar/event?";
		var params = {
			action: 'TEMPLATE',
			text: 'My Billionth Second',
			details: date.unix() + ' is going to be totally epoch.',
			location: '',
			dates: date.utc().format(format) + '/' + end.utc().format(format)
		};
		$('#gcal a').prop('href', baseUrl + $.param(params));
	}

	function checkVIPs() {
		if (vipAlert) {
			return;
		}

		var date = getStart().format('M/D/YYYY');
		$.each(vips, function(_, vip) {
			if (vip.date === date) {
				alert("Yeah, " + vip.name + ". What are we doing for yours?");
				vipAlert = true;
			}
		});
	}

	function init() {
		var hash = window.location.hash;
		if (hash.length === 0) {
			return;
		}

		var params =JSON.parse(atob(hash.substring(1, hash.length)));
		$('#datepicker').val(params.date);
		$('#timepicker').val(params.time);
		$('#input-tz').val(params.stz);
		$('#output-tz').val(params.etz);
		$('#seconds').text(params.seconds);

		runCalcs();
		showOutput();
	}

	function showOutput() {
		$('.output').removeClass('hide');
	}

	function runCalcs() {
		calcParty();
		checkVIPs();
	}

	$('#btn-calculate').click(function() {
		calcParty();
		showOutput();
	});

	$('#change-timezone a').click(function(e) {
		e.preventDefault();
		$(this).hide();
		$('#end-tz-controls').removeClass('hide');
	});

	$('#datepicker, #timepicker, #input-tz, #output-tz').on('change', runCalcs);
	$('#seconds').on('blur keyup paste input', runCalcs);

	init();
	calcCurrent();
	setInterval(calcCurrent, 1000);
});
