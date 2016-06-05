/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright (c) 2014, Joyent, Inc.
 */

var test = require('tape');
var filter = require('../../lib/algorithms/hard-filter-min-ram.js');


var log = {
	trace: function () { return (true); },
	debug: function () { return (true); }
};


test('filterMinRam()', function (t) {
	var givenServers = [
		{
			uuid: 'f667e0fa-33db-48da-a5d0-9fe837ce93fc',
			unreserved_ram: 256, overprovision_ratios: {}
		},
		{
			uuid: '4fe12d99-f013-4983-9e39-6e2f35b37aec',
			unreserved_ram: 511, overprovision_ratios: {}
		},
		{
			uuid: '7a8c759c-2a82-4d9b-bed4-7049b71197cb',
			unreserved_ram: 512,
			overprovision_ratios: { ram: 1.0 }
		},
		{
			uuid: 'f60f7e40-2e92-47b8-8686-1b46a85dd35f',
			unreserved_ram: 768,
			overprovision_ratios: { ram: 1.0 }
		}
	];

	var expectedServers = givenServers.slice(0, 2);
	var constraints = { vm: { ram: 512 }, pkg: {}, defaults: {} };

	var results = filter.run(log, givenServers, constraints);
	var filteredServers = results[0];
	var reasons = results[1];

	t.deepEqual(filteredServers, expectedServers);

	var expectedReasons = {
		'7a8c759c-2a82-4d9b-bed4-7049b71197cb':
		    'Package gave no RAM overprovision ratio, ' +
		    'but server has ratio 1',
		'f60f7e40-2e92-47b8-8686-1b46a85dd35f':
		    'Package gave no RAM overprovision ratio, ' +
		    'but server has ratio 1'
	};
	t.deepEqual(reasons, expectedReasons);

	t.end();
});


test('filterMinRam() with KVM', function (t) {
	var givenServers = [
		{
			uuid: 'f667e0fa-33db-48da-a5d0-9fe837ce93fc',
			unreserved_ram: 256,
			overprovision_ratios: { ram: 2.0 }
		},
		{
			uuid: '4fe12d99-f013-4983-9e39-6e2f35b37aec',
			unreserved_ram: 511,
			overprovision_ratios: { ram: 2.0 }
		},
		{
			uuid: '7a8c759c-2a82-4d9b-bed4-7049b71197cb',
			unreserved_ram: 512,
			overprovision_ratios: { ram: 2.0 }
		},
		{
			uuid: 'f60f7e40-2e92-47b8-8686-1b46a85dd35f',
			unreserved_ram: 768,
			overprovision_ratios: { ram: 2.0 }
		}
	];

	var expectedServers = givenServers.slice(2, 4);
	var constraints = {
		vm: { ram: 512, brand: 'kvm' },
		pkg: { overprovision_ram: 2.0 },
		defaults: {}
	};

	var results = filter.run(log, givenServers, constraints);
	var filteredServers = results[0];
	var reasons = results[1];

	t.deepEqual(filteredServers, expectedServers);

	var expectedReasons = {
		'f667e0fa-33db-48da-a5d0-9fe837ce93fc':
			'VM\'s calculated 512 RAM is less than ' +
			'server\'s spare 256',
		'4fe12d99-f013-4983-9e39-6e2f35b37aec':
			'VM\'s calculated 512 RAM is less than ' +
			'server\'s spare 511'
	};
	t.deepEqual(reasons, expectedReasons);

	t.end();
});


test('filterMinRam() without pkg', function (t) {
	var givenServers = [
		{
			uuid: 'f667e0fa-33db-48da-a5d0-9fe837ce93fc',
			unreserved_ram: 256, overprovision_ratios: {}
		},
		{
			uuid: '4fe12d99-f013-4983-9e39-6e2f35b37aec',
			unreserved_ram: 511, overprovision_ratios: {}
		},
		{
			uuid: '7a8c759c-2a82-4d9b-bed4-7049b71197cb',
			unreserved_ram: 512,
			overprovision_ratios: { ram: 1.0 }
		},
		{
			uuid: 'f60f7e40-2e92-47b8-8686-1b46a85dd35f',
			unreserved_ram: 768,
			overprovision_ratios: { ram: 1.0 }
		}
	];

	var expectedServers = givenServers;
	var constraints = {
		vm: { ram: 512 },
		defaults: {}
	};

	var results = filter.run(log, givenServers, constraints);
	var filteredServers = results[0];
	var reasons = results[1];

	t.deepEqual(filteredServers, expectedServers);
	t.deepEqual(reasons, {});

	t.end();
});


test('filterMinRam() with override', function (t) {
	var givenServers = [
		{
			uuid: 'f667e0fa-33db-48da-a5d0-9fe837ce93fc',
			unreserved_ram: 256, overprovision_ratios: {}
		},
		{
			uuid: '4fe12d99-f013-4983-9e39-6e2f35b37aec',
			unreserved_ram: 511, overprovision_ratios: {}
		},
		{
			uuid: '7a8c759c-2a82-4d9b-bed4-7049b71197cb',
			unreserved_ram: 512,
			overprovision_ratios: { ram: 1.0 }
		},
		{
			uuid: 'f60f7e40-2e92-47b8-8686-1b46a85dd35f',
			unreserved_ram: 768,
			overprovision_ratios: { ram: 1.0 }
		}
	];

	var constraints = {
		vm: { ram: 512 },
		pkg: {},
		defaults: { filter_min_resources: false }
	};

	var results = filter.run(log, givenServers, constraints);

	t.deepEqual(results[0], givenServers);

	t.end();
});


test('filterMinRam() with overprovision ratios', function (t) {
	var givenServers = [
		{
			uuid: 'f667e0fa-33db-48da-a5d0-9fe837ce93fc',
			unreserved_ram: 256, overprovision_ratios: { ram: 1.0 }
		},
		{
			uuid: '4fe12d99-f013-4983-9e39-6e2f35b37aec',
			unreserved_ram: 511, overprovision_ratios: { ram: 1.0 }
		},
		{
			uuid: '7a8c759c-2a82-4d9b-bed4-7049b71197cb',
			unreserved_ram: 512, overprovision_ratios: { ram: 1.0 }
		},
		{
			uuid: 'f60f7e40-2e92-47b8-8686-1b46a85dd35f',
			unreserved_ram: 768, overprovision_ratios: { ram: 1.0 }
		}
	];

	var expectedServers = givenServers.slice(2, 4);
	var constraints = {
		vm: { ram: 768 },
		pkg: { overprovision_ram: 1.5 },
		defaults: {}
	};

	var results = filter.run(log, givenServers, constraints);
	var filteredServers = results[0];
	var reasons = results[1];

	t.deepEqual(filteredServers, expectedServers);

	var expectedReasons = {
		'f667e0fa-33db-48da-a5d0-9fe837ce93fc':
		    'VM\'s calculated 512 RAM is less than server\'s spare 256',
		'4fe12d99-f013-4983-9e39-6e2f35b37aec':
		    'VM\'s calculated 512 RAM is less than server\'s spare 511'
	};
	t.deepEqual(reasons, expectedReasons);

	t.end();
});


test('filterMinRam() with no servers', function (t) {
	var servers = [];
	var constraints = {
		vm: { ram: 512 },
		pkg: { overprovision_ram: 1.0 },
		defaults: {}
	};

	var results = filter.run(log, servers, constraints);
	var filteredServers = results[0];
	var reasons = results[1];

	t.equal(filteredServers.length, 0);
	t.deepEqual(reasons, {});

	t.end();
});


test('name', function (t) {
	t.equal(typeof (filter.name), 'string');
	t.end();
});
