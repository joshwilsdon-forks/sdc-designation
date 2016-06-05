/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright (c) 2014, Joyent, Inc.
 */

var test = require('tape');
var filter = require('../../lib/algorithms/hard-filter-min-cpu.js');


var log = {
	trace: function () { return (true); },
	debug: function () { return (true); }
};


test('filterMinCpu()', function (t) {
	var givenServers = [
		{
			uuid: '79cc8d8a-1754-46d7-bd2c-ab5fe7f8c7bf',
			unreserved_cpu: 400,
			overprovision_ratios: {}
		},
		{
			uuid: '9324d37d-e160-4a9d-a6d8-39a519634398',
			unreserved_cpu: 590,
			overprovision_ratios: {}
		},
		{
			uuid: 'f07f6c2c-8f9c-4b77-89fe-4b777dff5826',
			unreserved_cpu: 610,
			overprovision_ratios: { cpu: 1.0 }
		},
		{
			uuid: '69003dc2-1122-4851-8a2a-fccb609e4e84',
			unreserved_cpu: 900,
			overprovision_ratios: { cpu: 1.0 }
		}
	];

	var expectedServers = givenServers.slice(0, 2);
	var constraints = {
		vm: { cpu_cap: 900 },
		img: {},
		pkg: {},
		defaults: {}
	};

	var results = filter.run(log, givenServers, constraints);
	var filteredServers = results[0];
	var reasons = results[1];

	t.deepEqual(filteredServers, expectedServers);

	var expectedReasons = {
		'f07f6c2c-8f9c-4b77-89fe-4b777dff5826':
		    'Package gave no CPU overprovision ratio, ' +
		    'but server has ratio 1',
		'69003dc2-1122-4851-8a2a-fccb609e4e84':
		    'Package gave no CPU overprovision ratio, ' +
		    'but server has ratio 1'
	};
	t.deepEqual(reasons, expectedReasons);

	t.end();
});


test('filterMinCpu() without pkg', function (t) {
	var givenServers = [
		{
			uuid: '79cc8d8a-1754-46d7-bd2c-ab5fe7f8c7bf',
			unreserved_cpu: 400,
			overprovision_ratios: {}
		},
		{
			uuid: '9324d37d-e160-4a9d-a6d8-39a519634398',
			unreserved_cpu: 590,
			overprovision_ratios: {}
		},
		{
			uuid: 'f07f6c2c-8f9c-4b77-89fe-4b777dff5826',
			unreserved_cpu: 610,
			overprovision_ratios: { cpu: 1.0 }
		},
		{
			uuid: '69003dc2-1122-4851-8a2a-fccb609e4e84',
			unreserved_cpu: 900,
			overprovision_ratios: { cpu: 1.0 }
		}
	];

	var expectedServers = givenServers;
	var constraints = {
		vm: { cpu_cap: 900 },
		img: {},
		defaults: {}
	};

	var results = filter.run(log, givenServers, constraints);
	var filteredServers = results[0];
	var reasons = results[1];

	t.deepEqual(filteredServers, expectedServers);
	t.deepEqual(reasons, {});

	t.end();
});


test('filterMinCpu() with override', function (t) {
	var givenServers = [
		{
			uuid: '79cc8d8a-1754-46d7-bd2c-ab5fe7f8c7bf',
			unreserved_cpu: 400,
			overprovision_ratios: { cpu: 1.0 }
		},
		{
			uuid: '9324d37d-e160-4a9d-a6d8-39a519634398',
			unreserved_cpu: 590,
			overprovision_ratios: { cpu: 1.0 }
		},
		{
			uuid: 'f07f6c2c-8f9c-4b77-89fe-4b777dff5826',
			unreserved_cpu: 610,
			overprovision_ratios: { cpu: 1.0 }
		},
		{
			uuid: '69003dc2-1122-4851-8a2a-fccb609e4e84',
			unreserved_cpu: 900,
			overprovision_ratios: { cpu: 1.0 }
		}
	];

	var constraints = {
		vm: { cpu_cap: 900 },
		img: {},
		pkg: {},
		defaults: { filter_min_resources: false }
	};

	var results = filter.run(log, givenServers, constraints);

	t.deepEqual(results[0], givenServers);

	t.end();
});


test('filterMinCpu() with overprovision ratios', function (t) {
	var givenServers = [
		{
			uuid: '79cc8d8a-1754-46d7-bd2c-ab5fe7f8c7bf',
			unreserved_cpu: 400,
			overprovision_ratios: { cpu: 1.0 }
		},
		{
			uuid: '9324d37d-e160-4a9d-a6d8-39a519634398',
			unreserved_cpu: 590,
			overprovision_ratios: { cpu: 1.0 }
		},
		{
			uuid: 'f07f6c2c-8f9c-4b77-89fe-4b777dff5826',
			unreserved_cpu: 610,
			overprovision_ratios: { cpu: 1.0 }
		},
		{
			uuid: '69003dc2-1122-4851-8a2a-fccb609e4e84',
			unreserved_cpu: 900,
			overprovision_ratios: { cpu: 1.0 }
		}
	];

	var expectedServers = givenServers.slice(2, 4);
	var constraints = {
		vm:  { cpu_cap: 900 },
		img: {},
		pkg: { overprovision_cpu: 1.5 },
		defaults: {}
	};

	var results = filter.run(log, givenServers, constraints);
	var filteredServers = results[0];
	var reasons = results[1];

	t.deepEqual(filteredServers, expectedServers);

	var expectedReasons = {
		'79cc8d8a-1754-46d7-bd2c-ab5fe7f8c7bf':
		    'VM\'s calculated 600 CPU is less than server\'s spare 400',
		'9324d37d-e160-4a9d-a6d8-39a519634398':
		    'VM\'s calculated 600 CPU is less than server\'s spare 590'
	};
	t.deepEqual(reasons, expectedReasons);

	t.end();
});


test('filterMinCpu with no cpu', function (t) {
	var givenServers = [
		{
			uuid: '79cc8d8a-1754-46d7-bd2c-ab5fe7f8c7bf',
			unreserved_cpu: 400,
			overprovision_ratios: { cpu: 1.0 }
		},
		{
			uuid: 'f07f6c2c-8f9c-4b77-89fe-4b777dff5826',
			unreserved_cpu: 600,
			overprovision_ratios: { cpu: 1.0 }
		},
		{
			uuid: '69003dc2-1122-4851-8a2a-fccb609e4e84',
			unreserved_cpu: 650,
			overprovision_ratios: { cpu: 1.0 }
		}
	];

	var constraints = { vm: {}, img: {}, pkg: {}, defaults: {} };

	var results = filter.run(log, givenServers, constraints);
	var filteredServers = results[0];
	var reasons = results[1];

	t.deepEqual(filteredServers, givenServers);
	t.deepEqual(reasons, undefined);

	t.end();
});


test('filterMinCpu() with no servers', function (t) {
	var servers = [];
	var constraints = {
		vm:  { cpu_cap: 900 },
		img: {},
		pkg: { overprovision_cpu: 1.0 },
		defaults: {}
	};

	var results = filter.run(log, servers, constraints);
	var filteredServers = results[0];
	var reasons = results[1];

	t.equal(filteredServers.length, 0);

	var expectedReasons = {};
	t.deepEqual(reasons, expectedReasons);

	t.end();
});


test('name', function (t) {
	t.equal(typeof (filter.name), 'string');
	t.end();
});
