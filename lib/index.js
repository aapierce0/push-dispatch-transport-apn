'use strict';

const apn = require('apn');

class APNTransport {

  // Creates a new APNTransport using the configured apnProvider
  // apnProvider should be an instance of apn.Provider.
  constructor(apnProvider) {
    if (apnProvider instanceof apn.Provider) {
      this.apnProvider = apnProvider;
    } else {
      throw new Error('apnProvider must be an instance of apn.Provider');
    }
  }

  static _parseMessage (message) {
    const note = new apn.Notification();
    note.alert = message.title;
    return note;
  }

  send (deviceDeliveryKey, message, options, callback) {
    const note = APNTransport._parseMessage(message);
    this.apnProvider.send(message, deviceDeliveryKey)
      .then((result) => {
        callback(null, result);
      }, (error) => {
        callback(error);
      });
  }
}

module.exports = APNTransport;