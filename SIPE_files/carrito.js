var framework;
(function (framework) {
    var Carrito;
    (function (Carrito) {
        var notificaciones = new framework.Observer();
        var instanciaCarrito = new ((function () {
            function CarritoImp() {
                var _this = this;
                this.NumeroConceptos = ko.observable(0);
                this.Total = ko.observable();
                this.sincronizar = function () {
                    return framework.ajax.simplePost('/ObtenerDetalleCarrito')
                        .done(function (resultado) {
                        _this.NumeroConceptos(resultado.NumeroConceptos);
                        _this.Total(resultado.Total);
                    });
                };
                this.actualizar = function () { return _this.sincronizar().done(function () { return notificaciones.publish({ NumeroConceptos: _this.NumeroConceptos(), Total: _this.Total() }); }); };
                this.tieneConceptos = ko.pureComputed(function () { return _this.NumeroConceptos() > 0; });
                this.vaciar = function () { return framework.ajax.post('/VaciarCarrito').done(_this.actualizar); };
            }
            return CarritoImp;
        }()))();
        Carrito.tieneConceptos = instanciaCarrito.tieneConceptos;
        Carrito.actualizar = instanciaCarrito.actualizar;
        Carrito.notificarCambios = function (callback) { return notificaciones.subscribe(callback); };
        var registrar = function (nombreComponente, idPlantilla) {
            ko.components.register(nombreComponente, {
                viewModel: {
                    createViewModel: function (params, componentInfo) { return instanciaCarrito; }
                },
                template: { element: idPlantilla }
            });
            instanciaCarrito.actualizar();
        };
        $(function () {
            registrar('detalle-carrito', 'menu-detalle-carrito');
            ko.applyBindings(null, $('#main-menu').get(0));
        });
    })(Carrito = framework.Carrito || (framework.Carrito = {}));
})(framework || (framework = {}));
