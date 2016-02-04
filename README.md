Usage
====================
You must define the following environment variables using a .env file in the
project's root:

  * **PORT**: The port to use for the application (default 8080).
  * **MERAKI_POST_PATH**: The path that meraki will use to reach the server with event notifications.
  * **TIME_DELTA**: How long it takes until someone is considered "away" since their last entry.
  * **SECRET**: The secret key used by Meraki.
  * **VALIDATOR**: The validator used by Meraki on get requests.

The following environment variables are optional but are required for Twilio support:

 * **TWILIO_SID**: SID given by Twilio.
 * **TWILIO_TOKEN**: Auth token given by Twilio.
 * **TWILIO_PHONE_NUMBER**: Phone number used by Twilio.

The following environment variables add more control to the Twilio functionality.

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
    ...
  }
]
```

If you would rather not mess with the JSON manually, there is also a script to add tracked clients.

Using it is simple:

```
npm run createUser
```
You will then be prompted for the tracked client fields. They are:

 * **name**: The client's full name.
 * **img**: The client's associated image.
 * **clientMac**: The client's MAC address.
 * **clientPhone**: The client's phone number.
 * **clientExtension** The client's phone number extension.

Using Twilio
==================
Assuming that the following environment variables are specified in .env:

  0. **TWILIO_SID**
  0. **TWILIO_TOKEN**
  0. **TWILIO_PHONE_NUMBER**

It is possible to send a call to tracked clients using the demo page 'index.html'.

To send a call, simply click a tracked client's image twice.

Note that without a proper twiml message specified, the voice will state a generic error.
