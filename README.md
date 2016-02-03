Usage
====================
You must define the following environment variables using a .env file in the
project's root:

  * PORT: The port to use for the application (default 8080).
  * MERAKI_POST_PATH: The path that meraki will use to reach the server with event notifications.
  * TIME_DELTA: How long it takes until someone is considered "away" since their last entry.
  * SECRET: The secret key used by Meraki.
  * VALIDATOR: The validator used by Meraki on get requests.

The following environment variables are optional but are required for Twilio support:

 * **TWILIO_SID**: SID given by Twilio.
 * **TWILIO_TOKEN**: Auth token given by Twilio.
 * **TWILIO_PHONE_NUMBER**: Phone number used by Twilio.
 * **TWILIO_TWIML_URL**: The URL of your custom twiml file. (optional)
 * **TWILIO_SECRET**: A secret that will be used to validate a JWT sent to make a call.
 * **TWILIO_CALL_LIMIT_INTERVAL**: Defines the minmum time (in milli) between calls to one person.
 * **TWILIO_TWIML_MSG**: Defines the message that will be read when the call is answered (a name can be inserted using '%n' in the message). This field is required if **TWILIO_TWIM_URL** is not set)
 * **TWILIO_TWIML_LANGUAGE**: Defines the language that will be used to read the twiml message. (required if **TWILIO_TWIM_URL** is not set)

Note: if you want more freedom with the twiml message, you should change **TWILIO_TWIML_URL**.

You also need to define a "tracked-clients.json" file using the following format:

```
[
  {
    "name": "clientName1",
    "img": "domain.com/avatar.png",
    "clientMac": "aa:bb:cc:dd:ee:ff",
    "clientPhone": "+14385552764",
    "clientExtension": "1234"
  },
  {
    "name": "clientName2",
    "img": "domain.com/avatar.png",
    "clientMac": "aa:bb:cc:dd:ee:ff",
    "clientPhone": "+14385552764"
  },
  {

  }
]
```

Using Twilio
==================
If a Twilio SID and Token are specified, it is possible to send a call to tracked
clients using the demo page 'index.html'.
