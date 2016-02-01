Usage
====================
You must define the following environment variables using a .env file in the
project's root:

  * TIME_DELTA: How long it takes until someone is considered "away" since their last entry.
  * SECRET: The secret key used by Meraki.
  * VALIDATOR: The validator used by Meraki on get requests.

You also need to define a "tracked-clients.json" file using the following format:

```
[
  {
    "name": "clientName1",
    "img": "domain.com/avatar.png",
    "clientMac": "aa:bb:cc:dd:ee:ff"
  },
  {
    "name": "clientName2",
    "img": "domain.com/avatar.png",
    "clientMac": "aa:bb:cc:dd:ee:ff"
  },
]
```
