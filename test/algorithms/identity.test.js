/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright (c) 2014, Joyent, Inc.
 */

var test = require('tape');
var identity = require('../../lib/algorithms/identity.js');


var log = {
	trace: function () { return (true); },
	debug: function () { return (true); }
};


test('identity()', function (t) {
	var givenServers = [
		{ unreserved_ram: 256 },
		{ unreserved_ram: 511 },
		{ unreserved_ram: 512 },
		{ unreserved_ram: 768 }
	];

	var constraints = {};

	var results = identity.run(log, givenServers, constraints);
	var servers = results[0];
	var reasons = results[1];

	t.deepEqual(servers, givenServers);
	t.deepEqual(reasons, undefined);

	t.end();
});


test('identity() with no servers', function (t) {
	var givenServers = [];
	var constraints = {};

	var results = identity.run(log, givenServers, constraints);
	var servers = results[0];
	var reasons = results[1];

	t.equal(servers.length, 0);
	t.deepEqual(reasons, undefined);

	t.end();
});


test('name', function (t) {
	t.ok(typeof (identity.name) === 'string');
	t.end();
});
