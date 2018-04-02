var net = require('net');
var Service, Characteristic;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-weconn", "WeConn", Weconn);
}

// Thanks to: https://stackoverflow.com/a/31929689/5383897
const SET_AS_ADMIN = '0101100148000000010000005c6c5c6c0000000000000000000000000000000000000000000000000000000000000000xxxxxxxxxxxx0000feff0000xxxxxxxxxxxx000000000100';
const ON_CODE = '0101010180000000010000005c6c5c6c0000000000000000000000000000000000000000000000000000000000000000xxxxxxxxxxxx0000000000000000000001000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
const OFF_CODE = '0101010180000000010000005c6c5c6c0000000000000000000000000000000000000000000000000000000000000000xxxxxxxxxxxx0000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
const GET_INFO = '0101030138000000010000005c6c5c6c0000000000000000000000000000000000000000000000000000000000000000xxxxxxxxxxxx0000';

class Weconn {
    constructor(log, config) {
        if (!config.ip_address) {
            throw new Error('Error in WeConn accessory. Missing IP Address');
        }
        if (!config.mac) {
            throw new Error('Error in WeConn accessory. Missing MAC');
        }

        this.log = log;
        this.config = config;
        this.name = config.name;
        this.mac = config.mac;
        this.state = true;
    }

    getServices() {
        var informationService = new Service.AccessoryInformation();

        informationService
            .setCharacteristic(Characteristic.Manufacturer, "Weconn")
            .setCharacteristic(Characteristic.Model, "Weconn")
            .setCharacteristic(Characteristic.SerialNumber, "111-222-333");

        let service = new Service.Switch(this.name);
        service
            .getCharacteristic(Characteristic.On)
            .on('get', this.getPowerState.bind(this))
            .on('set', this.setPowerState.bind(this));

        return [service];
    }

    getPowerState(callback) {
        let state = false;

        var client = new net.Socket();
        client.connect(9957, this.config.ip_address, () => {
            let buffer = this.createBufferFromCommand(GET_INFO.replace('xxxxxxxxxxxx', this.mac));
            client.write(buffer);
        });
        client.on('data', (data) => {
            if (data.toString('hex').charAt(113) == '1') {
                state = true;
            }
            client.end();
        });
        client.on('close', () => {
            callback(null, state);
        });
    }

    setPowerState(state, callback) {
        var client = new net.Socket();
        client.connect(9957, this.config.ip_address, () => {
            let buffer;
            if (state) {
                buffer = this.createBufferFromCommand(ON_CODE.replace('xxxxxxxxxxxx', this.config.mac));
            } else {
                buffer = this.createBufferFromCommand(OFF_CODE.replace('xxxxxxxxxxxx', this.config.mac));
            }
            this.state = state;
            client.write(buffer, null, () => {
                callback();
                client.end();
            });
        });
        client.on('data', function(data) {

        });
    }

    createBufferFromCommand(command) {
        let data = command.match(/.{2}/g)
            .map(x => '0x' + x)
            .map(x => Number(x));
        return new Buffer(new Uint8Array(data));
    }    
}