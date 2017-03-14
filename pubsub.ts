/*!
 * PubSub.js
 * PubSub.js is a fast and powerful pub-sub event dispatcher built with
 * namespace support and a dependency free experience.
 *
 * @version 1.0.0
 * @author Eliott Robson, https://eliottrobson.me
 * @link https://github.com/eliottrobson/pubsub.js
 */

type IPubSubEventList = Array<IPubSubCallbacks>;
type IPubSubNamespaceList = Array<string>;
type IPubSubData = any;

interface IPubSubNamespace {
    [key: string]: IPubSubNamespace | IPubSubEventList | IPubSubNamespaceList;
    events?: IPubSubEventList;
    children?: IPubSubNamespaceList;
}

interface IPubSubSubscription {
    namespace: Array<string>;
}

type IPubSubCallback = (data?: IPubSubData, event?: string) => void;

interface IPubSubCallbacks {
    callback: IPubSubCallback;
    max: number;
    called: number;
}

class PubSub {
    private events: IPubSubNamespace = {
        children: []
    };

    on(event: string, callback: IPubSubCallback) {
        this.only(event, Infinity, callback);

        return this;
    }

    once(event: string, callback: IPubSubCallback) {
        this.only(event, 1, callback);

        return this;
    }

    only(event: string | Array<string>, limit: number, callback: IPubSubCallback) {
        if (Array.isArray(event)) {
            event.forEach(e => this.only(e, limit, callback));
            return this;
        }

        this.validateEvent(event);

        let namespace = this.getNamespace(event, true);

        let handler: IPubSubCallbacks = {
            callback,
            max: limit,
            called: 0
        };

        // Add to beginning (reverse iteration)
        namespace.events.unshift(handler);

        return this;
    }

    off(event?: string, callback?: IPubSubCallback | true) {
        if (typeof event === "undefined") {
            this.events = {};
            return this;
        }

        this.validateEvent(event);

        let namespace = this.getNamespace(event);

        // Event doesn't exist
        if (namespace === null) return this;

        if (typeof callback === "undefined") {
            // If callback is undefined, remove all events for that branch
            namespace.events = [];
        } else if (callback === true) {
            // If callback is true, remove all children too
            namespace.events = [];
            namespace.children.forEach(child => delete namespace[child]);
            namespace.children = [];
        } else if (typeof callback === "function") {
            // If callback is a function, remove only that function
            namespace.events.reduceRight((prev, item, index, array) => {
                if (item.callback === callback)
                    array.splice(index, 1);

                return array;
            }, []);
        }

        return this;
    }

    trigger(event: string, data?: IPubSubData) {
        this.validateEvent(event);

        this.fireEvent(event, data);

        return this;
    }

    private fireEvent(event: string, data: IPubSubData) {
        let branches = this.getNamespaceMap(event);

        let tree = this.events;

        let fire = (prev, item, index, array) => {
            // Remove expired calls as we go
            if (++item.called >= item.max)
                array.splice(index, 1);

            // Fire away
            item.callback(data, event);

            return array;
        };

        while (branches.length) {
            let ns = branches.shift();

            if (typeof tree[ns] === "undefined") {
                return this;
            } else {
                (<IPubSubNamespace> tree[ns]).events.reduceRight(fire, []);

                tree = <IPubSubNamespace> tree[ns];
            }
        }
    }

    private validateEvent(event: string) {
        if (!event)
            throw new TypeError(`Event cannot be undefined`);

        if (event.length < 1)
            throw new TypeError(`Event cannot be empty`);

        if (event.indexOf(" ") > -1)
            throw new TypeError(`Event cannot contain spaces (${event})`);
    }

    private getNamespaceMap(event: string) {
        return event.split(".")
            .filter(n => n.length > 0)
            .map(n => `ns_${n}`);
    }

    private getNamespace(event: string, build: boolean = false): IPubSubNamespace {
        let branches = this.getNamespaceMap(event);

        let tree = this.events;

        while (branches.length) {
            let ns = branches.shift();

            let nonexistant = typeof tree[ns] === "undefined";

            if (nonexistant && build) {
                tree.children.push(ns);
                tree = tree[ns] = {
                    events: [],
                    children: []
                };
            } else if (nonexistant) {
                return null;
            } else {
                tree = <IPubSubNamespace> tree[ns];
            }
        }

        return tree;
    }
}
