'use strict';
const Barrier = require('cb-barrier');
const Code = require('code');
const Lab = require('lab');

const APNTransport = require('../lib');
const apn = require('apn');
const mockAPN = require('apn/mock');

// Test shortcuts
const lab = exports.lab = Lab.script();
const { describe, it } = lab;
const { expect } = Code;

describe('APNTransport', function () {
  describe('constructor', function () {
    const apnProvider = new mockAPN.Provider();

    it('should capture the apnProvider and bundleIdentifier, when provided', function () {
      const bundleIdentifier = 'com.example.app';

      const transport = new APNTransport(apnProvider, bundleIdentifier);
      expect(transport.apnProvider).to.equal(apnProvider);
      expect(transport.bundleIdentifier).to.equal('com.example.app');
    });

    it('should throw an error if the apnProvider is not an instance of apn.Provider', function () {
      expect(() => {
        const transport = new APNTransport('not an apnProvider', 'com.example.app');
        expect(transport).to.not.exist();
      }).to.throw(Error, 'apnProvider must have a send function');
    });

    it('should throw an error if the bundle identifier is not provided', function () {
      expect(() => {
        const transport = new APNTransport(apnProvider);
        expect(transport).to.not.exist();
      }).to.throw(Error, 'bundleIdentifier must be a string');
    });
  });

  describe('_parseMessage()', function () {
    it('should parse a message correctly', function () {
      const message = {
        title: 'notification title',
        subtitle: 'notification subtitle',
        body: 'notification body'
      };

      const notification = APNTransport._parseMessage(message);
      expect(notification).to.be.instanceof(apn.Notification);
      expect(notification.aps.alert).to.equal({
        title: 'notification title',
        subtitle: 'notification subtitle',
        body: 'notification body'
      });
    });
  });

  describe('send()', function () {
    it('should send properly', function () {
      const barrier = new Barrier();
      const apnProvider = new mockAPN.Provider();
      const transport = new APNTransport(apnProvider, 'com.example.app');
      const message = {
        title: 'notification title',
        subtitle: 'notification subtitle',
        body: 'notification body'
      };

      transport.send('event1', 'tx1', 'deliveryKey1', message, {}, (error, result) => {
        expect(error).to.not.exist();

        expect(result).to.equal({
          sent: [{device: 'deliveryKey1'}],
          failed: []
        });

        barrier.pass();
      });
    });
  });
});
