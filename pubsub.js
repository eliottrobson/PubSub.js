/*!
 * PubSub.js
 * PubSub.js is a fast and powerful pub-sub event dispatcher built with
 * namespace support and a dependency free experience.
 *
 * @version 1.0.0
 * @author Eliott Robson, https://eliottrobson.me
 * @link https://github.com/eliottrobson/pubsub.js
 */
var PubSub = (function () {
    function PubSub() {
        this.events = {
            children: []
        };
    }
    PubSub.prototype.on = function (event, callback) {
        this.only(event, Infinity, callback);
        return this;
    };
    PubSub.prototype.once = function (event, callback) {
        this.only(event, 1, callback);
        return this;
    };
    PubSub.prototype.only = function (event, limit, callback) {
        var _this = this;
        if (Array.isArray(event)) {
            event.forEach(function (e) { return _this.only(e, limit, callback); });
            return this;
        }
        this.validateEvent(event);
        var namespace = this.getNamespace(event, true);
        var handler = {
            callback: callback,
            max: limit,
            called: 0
        };
        namespace.events.unshift(handler);
        return this;
    };
    PubSub.prototype.off = function (event, callback) {
        if (typeof event === "undefined") {
            this.events = {};
            return this;
        }
        this.validateEvent(event);
        var namespace = this.getNamespace(event);
        if (namespace === null)
            return this;
        if (typeof callback === "undefined") {
            namespace.events = [];
        }
        else if (callback === true) {
            namespace.events = [];
            namespace.children.forEach(function (child) { return delete namespace[child]; });
            namespace.children = [];
        }
        else if (typeof callback === "function") {
            namespace.events.reduceRight(function (prev, item, index, array) {
                if (item.callback === callback)
                    array.splice(index, 1);
                return array;
            }, []);
        }
        return this;
    };
    PubSub.prototype.trigger = function (event, data) {
        this.validateEvent(event);
        this.fireEvent(event, data);
        return this;
    };
    PubSub.prototype.fireEvent = function (event, data) {
        var branches = this.getNamespaceMap(event);
        var tree = this.events;
        var fire = function (prev, item, index, array) {
            if (++item.called >= item.max)
                array.splice(index, 1);
            item.callback(data, event);
            return array;
        };
        while (branches.length) {
            var ns = branches.shift();
            if (typeof tree[ns] === "undefined") {
                return this;
            }
            else {
                tree[ns].events.reduceRight(fire, []);
                tree = tree[ns];
            }
        }
    };
    PubSub.prototype.validateEvent = function (event) {
        if (!event)
            throw new TypeError("Event cannot be undefined");
        if (event.length < 1)
            throw new TypeError("Event cannot be empty");
        if (event.indexOf(" ") > -1)
            throw new TypeError("Event cannot contain spaces (" + event + ")");
    };
    PubSub.prototype.getNamespaceMap = function (event) {
        return event.split(".")
            .filter(function (n) { return n.length > 0; })
            .map(function (n) { return "ns_" + n; });
    };
    PubSub.prototype.getNamespace = function (event, build) {
        if (build === void 0) { build = false; }
        var branches = this.getNamespaceMap(event);
        var tree = this.events;
        while (branches.length) {
            var ns = branches.shift();
            var nonexistant = typeof tree[ns] === "undefined";
            if (nonexistant && build) {
                tree.children.push(ns);
                tree = tree[ns] = {
                    events: [],
                    children: []
                };
            }
            else if (nonexistant) {
                return null;
            }
            else {
                tree = tree[ns];
            }
        }
        return tree;
    };
    return PubSub;
}());
