'use strict';

const apn = require('apn');

class APNTransport {
  // Creates a new APNTransport using the configured apnProvider
  // apnProvider should be an instance of apn.Provider.
  constructor (apnProvider, bundleIdentifier) {
    this.apnProvider = apnProvider;
    this.bundleIdentifier = bundleIdentifier;

    // The apnProvider variable must be provided.
    if (typeof this.apnProvider.send !== 'function') {
      throw new Error('apnProvider must have a send function');
    }

    // The bundle identifier must be provided.
    if (typeof this.bundleIdentifier !== 'string') {
      throw new Error('bundleIdentifier must be a string');
    }
  }

  /** Converts the push-dispatch message to an APN notification object */
  static _parseMessage (message) {
    const note = new apn.Notification();
    note.alert = {
      title: message.title,
      subtitle: message.subtitle,
      body: message.body
    };
    return note;
  }

  /** Send a message to a specific device */
  send (eventID, transactionID, deviceDeliveryKey, message, options, callback) {
    // Parse the message into an APN notification
    const note = APNTransport._parseMessage(message);

    // Set the topic of the notification. This is required by APNs.
    note.topic = this.bundleIdentifier;
    note.collapseId = transactionID;

    // Send the message.
    this.apnProvider.send(note, deviceDeliveryKey)
      .then((result) => {
        callback(null, result);
      }, (error) => {
        callback(error);
      });
  }
}

module.exports = APNTransport;
