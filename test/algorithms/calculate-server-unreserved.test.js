/*
 * Copyright (c) 2013, Joyent, Inc. All rights reserved.
 */

var filter = require('../../lib/algorithms/calculate-server-unreserved.js');

var log = { trace: function () { return true; },
            debug: function () { return true; } };



exports.calculateServerUnreserved =
function (t) {
    var GB = 1024 * 1024 * 1024;

    var serversInfo = [
        {
            memory_total_bytes: 2942881792,
            disk_pool_size_bytes: 2048 * GB,
            disk_installed_images_used_bytes: 1 * GB,
            disk_zone_quota_bytes: 0,
            disk_kvm_quota_bytes: (25 + 5 + 10 + 10) * GB,
            disk_kvm_zvol_volsize_bytes: (25 + 5) * GB,
            reservation_ratio: 0.15,
            sysinfo: {
                'Zpool Size in GiB': 2048,
                'CPU Total Cores': 16
            },
            vms: {
                '1ac434da-01aa-4663-8420-d3524ed1de0c': {
                    brand: 'kvm',
                    cpu_cap: 350,
                    quota: 25,
                    max_physical_memory: 2048
                },
                'b3d04682-536f-4f09-8170-1954e45e9e1c': {
                    brand: 'kvm',
                    cpu_cap: 350,
                    quota: 5,
                    max_physical_memory: 128
                }
            }
        },
        {
            memory_total_bytes: 9132881112,
            disk_pool_size_bytes: 2048 * GB,
            disk_installed_images_used_bytes: 2 * GB,
            disk_zone_quota_bytes: 20 * GB,
            disk_kvm_quota_bytes: (10 + 10) * GB,
            disk_kvm_zvol_volsize_bytes: 10 * GB,
            reservation_ratio: 0.25,
            sysinfo: {
                'Zpool Size in GiB': 2048,
                'CPU Total Cores': 24
            },
            vms: {
                '62559b33-4f3a-4505-a942-87cc557fdf4e': {
                    brand: 'joyent',
                    cpu_cap: 350,
                    quota: 20,
                    max_physical_memory: 512
                },
                '335498f7-a1ed-420c-8367-7f2769ca1e84': {
                    brand: 'kvm',
                    cpu_cap: 350,
                    quota: 10,
                    max_physical_memory: 4096
                }
            }
        },
        {
            overprovision_ratios: { ram: 1.5 },
            memory_total_bytes: 9132881112,
            disk_pool_size_bytes: 4096 * GB,
            disk_installed_images_used_bytes: 3 * GB,
            disk_zone_quota_bytes: (20 + 10) * GB,
            disk_kvm_quota_bytes: 0,
            disk_kvm_zvol_volsize_bytes: 0,
            reservation_ratio: 0.15,
            sysinfo: {
                'Zpool Size in GiB': 4096,
                'CPU Total Cores': 32
            },
            vms: {
                '62559b33-4f3a-4505-a942-87cc557fdf4e': {
                    brand: 'joyent',
                    cpu_cap: 350,
                    quota: 20,
                    max_physical_memory: 512
                },
                '335498f7-a1ed-420c-8367-7f2769ca1e84': {
                    brand: 'joyent',
                    cpu_cap: 350,
                    quota: 10,
                    max_physical_memory: 4096
                }
            }
        },
        {
            overprovision_ratios: { ram: 1.5, disk: 2.0, cpu: 2.0 },
            memory_total_bytes: 9132881112,
            disk_pool_size_bytes: 4096 * GB,
            disk_installed_images_used_bytes: 4 * GB,
            disk_zone_quota_bytes: 20 * GB,
            disk_kvm_quota_bytes: (10 + 30) * GB,
            disk_kvm_zvol_volsize_bytes: 30 * GB,
            reservation_ratio: 0.15,
            sysinfo: {
                'Zpool Size in GiB': 4096,
                'CPU Total Cores': 32
            },
            vms: {
                'd251001f-57eb-4360-a04a-96d7d20a520c': {
                    brand: 'joyent',
                    cpu_cap: 700,
                    quota: 20,
                    max_physical_memory: 512
                },
                '9dd471a6-4679-4201-a02d-5e824deefc3e': {
                    brand: 'kvm',
                    cpu_cap: 200,
                    quota: 30,
                    max_physical_memory: 4096
                }
            }
        }
    ];

    var state = {};
    var servers = filter.run(log, state, serversInfo);
    t.deepEqual(state, {});

    t.equal(servers[0].unreserved_disk, 2096128);
    t.equal(servers[0].unreserved_ram,  209);
    t.equal(servers[0].unreserved_cpu,  1600);

    t.equal(servers[1].unreserved_disk, 2095104);
    t.equal(servers[1].unreserved_ram,  1924);
    t.equal(servers[1].unreserved_cpu,  2400);

    t.equal(servers[2].unreserved_disk, 4191232);
    t.equal(servers[2].unreserved_ram,  4331);
    t.equal(servers[2].unreserved_cpu,  3200);

    t.equal(servers[3].unreserved_disk, 4159488);
    t.equal(servers[3].unreserved_ram,  4331);
    t.equal(servers[3].unreserved_cpu,  2750);


    t.done();
};



exports.calculateServerUnreserved_no_servers =
function (t) {
    var state = {};

    var servers = filter.run(log, state, []);

    t.deepEqual(servers, []);
    t.deepEqual(state, {});

    t.done();
};



exports.name =
function (t) {
    t.ok(typeof (filter.name) === 'string');
    t.done();
};