var framework;
(function (framework) {
    var datepicker;
    (function (datepicker) {
        function activar() {
            $('.input-group.date').datepicker({
                autoclose: true,
                startDate: new Date(),
                format: 'dd/mm/yyyy',
                language: 'es',
                todayHighlight: true
            });
        }
        datepicker.activar = activar;
        $(activar);
    })(datepicker = framework.datepicker || (framework.datepicker = {}));
})(framework || (framework = {}));
