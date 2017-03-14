# PubSub.js (1.0.0)

PubSub.js is a fast and powerful pub-sub event dispatcher built with namespace support and a dependency free experience.

## Table of contents

- [Quick start](#quick-start)
- [Documentation](#documentation)
- [Demo](https://eliottrobson.github.io/PubSub.js/)

## Quick start

You'll be pub-subbing in no time:

1. [Download the latest release.](https://github.com/eliottrobson/PubSub.js/archive/v1.0.0.zip)
2. (Optional) Build the source file (TypeScript)
3. Add the scripts to your Pages
4. Create an event system

### What's included

We provide the source file (`.ts`) along with the transpiled file (`.js`). This will allow you to get started quickly or embed it as part of your build process and customize the styling.

```
PubSub.js/
├── pubsub.js
└── pubsub.ts
```

## Documentation

### API

#### Creating

First you need to create an instance of the class:

```
let pubsub = new PubSub();
```

Then you need to call one of the subscription handlers

```
pubsub.on('event', myCallback);       // Called unlimited times
pubsub.once('event', myCallback);     // Called once§
pubsub.only('event', 3, myCallback);  // Called 3 times
```

Each of these accepts parameters:

Parameter         | Type       | Description                         | Example
----------------- | ---------- | ----------------------------------- | -----------
event             | `string`   | The event to subscribe to           | "message"
limit (once only) | `number`   | The maximum number of times to call | 2
callback          | `function` | The callback                        | console.log

The callback signature is as follows:

Parameter | Type       | Description
--------- | ---------- | -----------------------------------------
data      | `anything` | The data sent via trigger
event     | `string`   | The original event name (with namespaces)

##### Namespaces

The event can also be a namespace

```
pubsub.on('event', myCallback);
pubsub.on('event.message', myOtherCallback);

pubsub.trigger('event', true);         // Calls only event
pubsub.trigger('event.message', true); // Calls both event and event.message
```

#### Destroying

It is possible to disable an event listener via the off method

Because you can disable event listeners by their functions it's important to bind functions by references.

```
pubsub.on('event', function() { /* ... */ }); // This is bad, don't do this
pubsub.on('event', myCallback);               // Much better <3
```

This allows us to call off with the original function to disable ONLY that callback for that event

```
pubsub.on('event', myCallback);
pubsub.off('event', myCallback); // "myCallback" is no longer bound
```

Alternatively we can disable all callbacks for that event

```
pubsub.on('event', myCallback);
pubsub.on('event', myOtherCallback);
pubsub.off('event'); // "myCallback" and "myOtherCallback" are no longer bound
```

And additionally we can disable sub-namespaces too

```
pubsub.on('event', myCallback);
pubsub.on('event.message', myOtherCallback);
pubsub.off('event');       // Only "myCallback" is no longer bound

pubsub.on('event', myCallback);
pubsub.off('event', true); // "myCallback" and "myOtherCallback" are no longer bound
```

Parameter | Type                | Description                   | Example
--------- | ------------------- | ----------------------------- | --------------------------------
event     | `string`            | The event to unsubscribe from | "message"
callback  | `optional (function | true)`                        | The scope of the un-subscription | console.log

#### Triggering

Triggering a publish event is easy too

```
pubsub.on('event', function(data, event) {
    // data = { data: 1 }
    // event = 'event'
});

pubsub.trigger('event', { data: 1 });
```

Parameter | Type       | Description                      | Example
--------- | ---------- | -------------------------------- | -----------
event     | `string`   | The event to unsubscribe from    | "message"
data      | `anything` | The scope of the un-subscription | console.log

#### Fluent API

The return from any pubsub call is the original class it was called on. This allows for a fluent api.

```
var ps = new PubSub()
    .on('event', console.log)
    .trigger('event', 'test');
```
