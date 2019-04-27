var framework;
(function (framework) {
    var promises;
    (function (promises) {
        function createPromise(f) {
            var deferred$ = $.Deferred();
            try {
                f();
                deferred$.resolve();
            }
            catch (ex) {
                deferred$.reject(ex);
            }
            return deferred$.promise();
        }
        promises.createPromise = createPromise;
        function createPromiseFromPredicate(f) {
            var deferred$ = $.Deferred(), result = f();
            if (result) {
                deferred$.resolve();
            }
            else {
                deferred$.reject();
            }
            return deferred$.promise();
        }
        promises.createPromiseFromPredicate = createPromiseFromPredicate;
        function hasData(data) {
            var deferred$ = $.Deferred();
            if (data) {
                deferred$.resolve(data);
            }
            else {
                deferred$.reject();
            }
            return deferred$.promise();
        }
        promises.hasData = hasData;
        promises.empty = function () { return $.Deferred().promise(); };
        promises.chain = function () { return $.Deferred().resolve().promise(); };
        promises.greaterThan = function (arg0, arg1) { return createPromiseFromPredicate(function () { return arg0 > arg1; }); };
        promises.greaterThanOrEqual = function (arg0, arg1) { return createPromiseFromPredicate(function () { return arg0 >= arg1; }); };
    })(promises = framework.promises || (framework.promises = {}));
})(framework || (framework = {}));
