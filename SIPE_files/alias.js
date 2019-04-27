var ajax = framework.ajax;
var portal = framework.portal;
var modal = framework.modal;
var promises = framework.promises;
var SessionManager = framework.SessionManager;
var framework;
(function (framework) {
    framework.settings = {};
    framework.root = '';
})(framework || (framework = {}));
var administracion;
(function (administracion) {
    (function (TipoArchivo) {
        TipoArchivo[TipoArchivo["PDF"] = 5] = "PDF";
        TipoArchivo[TipoArchivo["Excel"] = 4] = "Excel";
    })(administracion.TipoArchivo || (administracion.TipoArchivo = {}));
    var TipoArchivo = administracion.TipoArchivo;
    administracion.obtenerDetalleConciliacion = function () {
        var mapearCampos = function (response) {
            return {
                closedDays: response.DiasCerrados.map(framework.toDate),
                openDays: response.DiasAbiertos.map(framework.toDate),
                pendingDays: response.DiasPendientes.map(framework.toDate)
            };
        };
        return ajax.post('/Conciliacion/ObtenerDetalleConciliacion')
            .pipe(mapearCampos);
    };
    administracion.getNextMonth = function (date) {
        var month = date.getMonth(), year = date.getFullYear();
        if (month === 11) {
            return new Date(year + 1, 0, framework.daysInMonth(1, year + 1));
        }
        return new Date(year, month + 1, framework.daysInMonth(month + 2, year));
    };
    administracion.getPreviousMonth = function (date) {
        var month = date.getMonth(), year = date.getFullYear();
        if (month === 0) {
            return new Date(--year, 11, 1);
        }
        return new Date(year, --month, 1);
    };
    administracion.getCurrentMonth = function (date) { return new Date(date.getFullYear(), date.getMonth(), framework.daysInMonth(date.getMonth() + 1, date.getFullYear())); };
})(administracion || (administracion = {}));
var calendarios;
(function (calendarios) {
    calendarios.configurar = function (fechaInicio, fechaFin, context) {
        var parent = (context) ? $(context) : null;
        $('.input-group.date', parent)
            .datepicker('remove')
            .datepicker({
            autoclose: true,
            startDate: fechaInicio,
            endDate: fechaFin,
            format: 'dd/mm/yyyy',
            language: 'es',
            todayHighlight: true
        });
    };
    calendarios.asignarFechasConciliacion = function (context, disableDates, response) {
        var element$ = $('.input-group.date', context);
        element$.datepicker('setProcessDays', response);
        if (disableDates) {
            element$.datepicker('setDatesDisabled', response.closedDays);
        }
    };
})(calendarios || (calendarios = {}));
