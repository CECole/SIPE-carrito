var fileUpload;
(function (fileUpload) {
    fileUpload.send = function (form, maxRequestLength) {
        var deferred$ = $.Deferred(), options = {
            success: function (data, status, xhr) {
                var response = getData(xhr);
                deferred$.resolve(response);
            },
            error: function (xhr, status, errorMessage) {
                deferred$.reject();
                processError(xhr);
            }
        };
        var displayMaxLengthError = function () { return modal.alert("El tama\u00F1o m\u00E1ximo del archivo no debe exceder los " + maxRequestLength + " MB."); }, getData = function (xhr) { return (xhr.responseJSON) ? xhr.responseJSON.Data : (xhr.responseText || ''); }, checkFileSize = function () {
            if (typeof FileReader !== void (0)) {
                try {
                    var fileSize = $(form).find('input[type=file]').get(0).files[0].size;
                    return maxRequestLength > (fileSize / 1048576);
                }
                catch (ex) { }
            }
            return true;
        }, processError = function (xhr) {
            switch (xhr.status) {
                case 404:
                    displayMaxLengthError();
                    break;
                case 401:
                case 403:
                    SessionManager.close();
                    break;
                default:
                    var message = 'Por el momento no es posible procesar su petición. Por favor, inténtelo más tarde.';
                    if (xhr.responseJSON && xhr.responseJSON.Data) {
                        message = xhr.responseJSON.Data;
                    }
                    modal.alert(message);
                    break;
            }
        };
        if (!checkFileSize()) {
            displayMaxLengthError();
            deferred$.reject();
        }
        else {
            $(form).ajaxSubmit(options);
        }
        return deferred$.promise();
    };
})(fileUpload || (fileUpload = {}));
