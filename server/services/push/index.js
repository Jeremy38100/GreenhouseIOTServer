const request = require('request');
const config  = require('../../config');

class Push {

  constructor() {
    this.headers = {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "Authorization": "key=" + config.firebase.apiKey
    }; 
  }

  /**
   * Send a push notification
   * @param {(error, response, body) => any} cb The callback
   */
  sendPushNotification(cb) {
    let body = {
      to: "/topics/all",
      notification: {
        "title": "Attention !",
        "body": "Votre plante n'a plus assez d'eau, il faut l'arroser !",
        "icon": "fcm_push_icon",
        "color": "#41c136",
        "sound": "default"
      },
      priority: "high",
      click_action:"FCM_PLUGIN_ACTIVITY"
    };
    let url = config.firebase.url + '/fcm/send';
    let options = {
      url: url,
      headers: this.headers,
      body: JSON.stringify(body)
    };
    request.post(options, cb);
  }

}

module.exports = new Push();