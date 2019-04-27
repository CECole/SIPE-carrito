/*!
 * accounting.js v0.4.2
 * Copyright 2014 Open Exchange Rates
 *
 * Freely distributable under the MIT license.
 * Portions of accounting.js are inspired or borrowed from underscore.js
 *
 * Full details and documentation:
 * http://openexchangerates.github.io/accounting.js/
 */
var accounting;
(function (accounting) {
    // The library's settings configuration object. Contains default parameters for currency and number formatting
    var settings = {
        currency: {
            symbol: "$",
            format: "%s%v",
            decimal: ".",
            thousand: ",",
            precision: 2,
            grouping: 3 // digit grouping (not implemented yet)
        },
        number: {
            precision: 0,
            grouping: 3,
            thousand: ",",
            decimal: "."
        }
    };
    /**
     * Tests whether supplied parameter is a string from underscore.js
     */
    var isString = function (obj) { return !!(obj === '' || (obj && obj.charCodeAt && obj.substr)); };
    /**
     * Check and normalise the value of precision (must be positive integer)
     */
    function checkPrecision(val, base) {
        val = Math.round(Math.abs(val));
        return isNaN(val) ? base : val;
    }
    /**
     * Parses a format string or object and returns format obj for use in rendering
     *
     * `format` is either a string with the default (positive) format, or object
     * containing `pos` (required), `neg` and `zero` values (or a function returning
     * either a string or object)
     *
     * Either string or format.pos must contain "%v" (value) to be valid
     */
    function checkCurrencyFormat(format) {
        var defaults = settings.currency.format;
        // Allow function as format parameter (should return string or object):
        if (typeof format === "function")
            format = format();
        // Format can be a string, in which case `value` ("%v") must be present:
        if (isString(format) && format.match("%v")) {
            // Create and return positive, negative and zero formats:
            return {
                pos: format,
                neg: format.replace("-", "").replace("%s", "-%s"),
                zero: format
            };
        }
        else if (!format || !format.pos || !format.pos.match("%v")) {
            // If defaults is a string, casts it to an object for faster checking next time:
            return (!isString(defaults)) ? defaults : settings.currency.format = {
                pos: defaults,
                neg: defaults.replace("%s", "-%s"),
                zero: defaults
            };
        }
        // Otherwise, assume format was fine:
        return format;
    }
    /**
     * Implementation of toFixed() that treats floats more like decimals
     *
     * Fixes binary rounding issues (eg. (0.615).toFixed(2) === "0.61") that present
     * problems for accounting- and finance-related software.
     */
    var toFixed = function (value, precision) {
        precision = checkPrecision(precision, settings.number.precision);
        var power = Math.pow(10, precision);
        // Multiply up by precision, round accurately, then divide and use native toFixed():
        return (Math.round(value * power) / power).toFixed(precision);
    };
    /**
     * Format a number, with comma-separated thousands and custom precision/decimal places
     * Alias: `accounting.format()`
     *
     * Localise by overriding the precision and thousand / decimal separators
     * 2nd parameter `precision` can be an object matching `settings.number`
     */
    function formatNumber(number, precision, thousand, decimal) {
        // Build options object from second param (if object) or all params, extending defaults:
        var opts = $.extend({}, settings.number, { precision: precision, thousand: thousand, decimal: decimal }), 
        // Clean up precision
        usePrecision = checkPrecision(opts.precision), 
        // Do some calc:
        negative = number < 0 ? "-" : "", base = parseInt(toFixed(Math.abs(number || 0), usePrecision), 10) + "", mod = base.length > 3 ? base.length % 3 : 0;
        // Format the number:
        return negative + (mod ? base.substr(0, mod) + opts.thousand : "") + base.substr(mod).replace(/(\d{3})(?=\d)/g, "$1" + opts.thousand) + (usePrecision ? opts.decimal + toFixed(Math.abs(number), usePrecision).split('.')[1] : "");
    }
    accounting.formatNumber = formatNumber;
    ;
    /**
     * Format a number into currency
     *
     * Usage: accounting.formatMoney(number, symbol, precision, thousandsSep, decimalSep, format)
     * defaults: (0, "$", 2, ",", ".", "%s%v")
     *
     * Localise by overriding the symbol, precision, thousand / decimal separators and format
     * Second param can be an object matching `settings.currency` which is the easiest way.
     */
    function formatMoney(number, symbol, precision, thousand, decimal, format) {
        // Build options object from second param (if object) or all params, extending defaults:
        var opts = $.extend({}, settings.currency, { symbol: symbol, precision: precision, thousand: thousand, decimal: decimal, format: format }), 
        // Check format (returns object with pos, neg and zero):
        formats = checkCurrencyFormat(opts.format), 
        // Choose which format to use for this value:
        useFormat = number > 0 ? formats.pos : number < 0 ? formats.neg : formats.zero;
        // Return with currency symbol added:
        return useFormat.replace('%s', opts.symbol).replace('%v', formatNumber(Math.abs(number), checkPrecision(opts.precision), opts.thousand, opts.decimal));
    }
    accounting.formatMoney = formatMoney;
    ;
    accounting.formatPercentage = function (number) { return (formatNumber(number, '0', '', '') + "%"); };
})(accounting || (accounting = {}));
(function (ko) {
    var transform = function (fn) {
        return function (element, valueAccessor) {
            var value = ko.unwrap(valueAccessor());
            ko.bindingHandlers.text.update(element, function () { return fn(value); }, null, null, null);
        };
    };
    var exists = function (fn) { return function (x) { return (x) ? fn(x) : ''; }; };
    var money = function (symbol) { return function (x) { return accounting.formatMoney(x, symbol, 2, ",", ".", "%s%v"); }; };
    ko.bindingHandlers.money = {
        'update': transform(accounting.formatMoney)
    };
    ko.bindingHandlers.money2 = {
        'update': transform(exists(money('$')))
    };
    ko.bindingHandlers.number = {
        'update': transform(accounting.formatNumber)
    };
    ko.bindingHandlers.number2 = {
        'update': transform(exists(money('')))
    };
    ko.bindingHandlers.percentage = {
        'update': transform(accounting.formatPercentage)
    };
})(ko);
