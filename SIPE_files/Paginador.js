var framework;
(function (framework) {
    var Paginador = (function () {
        function Paginador(configuracion) {
            var _this = this;
            this.configuracion = configuracion;
            this.registros = ko.observable([]);
            this.paginas = ko.observable(0);
            this.resultadoBusqueda = ko.observable();
            this.habilitarAnterior = ko.pureComputed(function () { return _this.resultadoBusqueda().Paginacion.Pagina > 1; });
            this.habilitarSiguiente = ko.pureComputed(function () { return _this.totalRegistros() > 0 && _this.calcularNumeroPaginas() > _this.resultadoBusqueda().Paginacion.Pagina; });
            this.buscar = function (pagina) {
                var paginaActual = $.isNumeric(pagina) ? pagina : _this.resultadoBusqueda().Paginacion.Pagina;
                framework.ajax.submitForm(_this.configuracion.Forma, { 'pagina': paginaActual })
                    .done(function (response) {
                    if (response) {
                        _this.resultadoBusqueda(response);
                        if (_this.configuracion.NotificarBusquedaSinRegistros && response.Paginacion.TotalRegistros <= 0) {
                            framework.modal.alert('No existen registros que cumplan con los parámetros de búsqueda.');
                        }
                    }
                    else {
                        framework.modal.alert('Por el momento no es posible procesar su petición. Por favor, inténtelo más tarde.');
                    }
                })
                    .always(framework.portal.setFocus);
            };
            this.buscarPrimeraPagina = function () { return _this.buscar(1); };
            this.buscarUltimaPagina = function () { return _this.buscar(_this.calcularNumeroPaginas()); };
            this.mover = function (paginas) { return _this.buscar(_this.resultadoBusqueda().Paginacion.Pagina + paginas); };
            this.esPaginaActual = function (pagina) { return pagina === (_this.resultadoBusqueda().Paginacion.Pagina || 1); };
            this.limpiar = function () { return _this.resultadoBusqueda({ Registros: [], Paginacion: { Pagina: 1, TotalRegistros: 0, RegistrosPorPagina: 10 } }); };
            this.totalRegistros = function () { return _this.resultadoBusqueda().Paginacion.TotalRegistros; };
            this.recibirNotificacionBusqueda = function (fn) {
                _this.resultadoBusqueda.subscribe(fn);
            };
            this.calcular = function (totalPaginas, pagina, n) {
                if (pagina - (n / 2) < 1) {
                    var limiteSuperior_1 = n;
                    if (n > totalPaginas) {
                        limiteSuperior_1 = totalPaginas;
                    }
                    return [1, limiteSuperior_1];
                }
                var limiteSuperior = totalPaginas; // Cerca del límite superior
                if (totalPaginas > (pagina + (n - ((n / 2) + 1)))) {
                    limiteSuperior = pagina + (n - ((n / 2) + 1));
                }
                if (n > totalPaginas) {
                    n = totalPaginas;
                }
                return [(limiteSuperior - n + 1), limiteSuperior];
            };
            this.calcularNumeroPaginas = function () {
                var registrosPorPagina = _this.resultadoBusqueda().Paginacion.RegistrosPorPagina || 1;
                return Math.ceil(_this.totalRegistros() / registrosPorPagina);
            };
            this.limpiar();
            this.resultadoBusqueda.subscribe(function (resultado) {
                _this.registros(resultado.Registros);
                var paginacion = resultado.Paginacion, totalPaginas = _this.calcularNumeroPaginas(), _a = _this.calcular(totalPaginas, paginacion.Pagina, 10), limiteInferior = _a[0], limiteSuperior = _a[1];
                _this.paginas(ko.utils.range(limiteInferior, limiteSuperior));
            });
            $(configuracion.Forma).find(':text, select').change(this.limpiar);
        }
        Paginador.crear = function (nombreComponente, forma, busquedaInicial) {
            if (forma === void 0) { forma = 'form'; }
            if (busquedaInicial === void 0) { busquedaInicial = true; }
            return Paginador.crearBase({ NombreComponente: nombreComponente, BusquedaInicial: busquedaInicial, Forma: forma });
        };
        Paginador.crearBase = function (configuracion) {
            var configuracionActual = $.extend({}, Paginador.configuracionBase, configuracion);
            var paginador = new framework.Paginador(configuracionActual);
            Paginador.registrar(configuracionActual.NombreComponente, paginador);
            if (configuracionActual.BusquedaInicial) {
                paginador.buscar();
            }
            return paginador;
        };
        Paginador.configuracionBase = { NombreComponente: null, BusquedaInicial: true, Forma: 'forma', NotificarBusquedaSinRegistros: true };
        Paginador.registrar = function (nombreComponente, componente) {
            return ko.components.register(nombreComponente, {
                viewModel: {
                    createViewModel: function (params, componentInfo) { return componente; }
                },
                template: "<ul class=\"pagination\">\n\t\t\t\t\t<li data-bind=\"css: {disabled: !habilitarAnterior()}\"><button data-bind=\"click: habilitarAnterior() && buscarPrimeraPagina\">&laquo;</button></li >\n\t\t\t\t\t<li data-bind=\"css: {disabled: !habilitarAnterior()}\"><button data-bind=\"click: habilitarAnterior() && mover.partial(-1)\">&lsaquo;</button></li >\n\t\t\t\t\t<!-- ko foreach: paginas -->\n\t\t\t\t\t<li data-bind=\"css: {active: $parent.esPaginaActual($data)}\"><button data-bind=\"text: $data, click: $parent.esPaginaActual($data) ? null : function() { $parent.buscar($data); }\"></button></li >\n\t\t\t\t\t<!-- /ko -->\n\t\t\t\t\t<li data-bind=\"css: {disabled: !habilitarSiguiente()}\"><button data-bind=\"click: habilitarSiguiente() && mover.partial(1)\">&rsaquo;</button></li >\n\t\t\t\t\t<li data-bind=\"css: {disabled: !habilitarSiguiente()}\"><button data-bind=\"click: habilitarSiguiente() && buscarUltimaPagina\">&raquo;</button></li>\n\t\t\t\t</ul>"
            });
        };
        return Paginador;
    }());
    framework.Paginador = Paginador;
    var MiPaginador = (function () {
        function MiPaginador() {
            var _this = this;
            this.avanzarPaginador = ko.observable();
            this.paginaActual = ko.observable(1);
            this.datosPaginacion = ko.observable({ Pagina: 1, TotalRegistros: 0, RegistrosPorPagina: 10 });
            this.paginas = ko.pureComputed(function () {
                var totalPaginas = _this.calcularNumeroPaginas(), _a = _this.calcular(totalPaginas, _this.paginaActual(), 10), limiteInferior = _a[0], limiteSuperior = _a[1];
                return ko.utils.range(limiteInferior, limiteSuperior);
            });
            this.asignarDatos = function (datosPaginacion) {
                _this.datosPaginacion(datosPaginacion);
                _this.paginaActual(_this.datosPaginacion().Pagina);
            };
            this.registrarNotificacion = function (fn) {
                _this.avanzarPaginador.subscribe(function () { return fn(_this.paginaActual()); });
            };
            this.limpiar = function () { return _this.asignarDatos({ Pagina: 1, TotalRegistros: 0, RegistrosPorPagina: 10 }); };
            this.navegar = function (pagina) {
                if (pagina <= 0) {
                    pagina = 1;
                }
                var numeroPaginas = _this.calcularNumeroPaginas();
                if (pagina > numeroPaginas) {
                    pagina = numeroPaginas;
                }
                if (_this.paginaActual() !== pagina) {
                    _this.paginaActual(pagina);
                    _this.avanzarPaginador({});
                }
            };
            this.mover = function (paginas) { return _this.navegar(_this.paginaActual() + paginas); };
            this.inicio = function () { return _this.navegar(1); };
            this.fin = function () { return _this.navegar(_this.calcularNumeroPaginas()); };
            this.calcular = function (totalPaginas, pagina, n) {
                if (pagina - (n / 2) < 1) {
                    var limiteSuperior_2 = n;
                    if (n > totalPaginas) {
                        limiteSuperior_2 = totalPaginas;
                    }
                    return [1, limiteSuperior_2];
                }
                var limiteSuperior = totalPaginas; // Cerca del límite superior
                if (totalPaginas > (pagina + (n - ((n / 2) + 1)))) {
                    limiteSuperior = pagina + (n - ((n / 2) + 1));
                }
                if (n > totalPaginas) {
                    n = totalPaginas;
                }
                return [(limiteSuperior - n + 1), limiteSuperior];
            };
            this.calcularNumeroPaginas = function () {
                var registrosPorPagina = _this.datosPaginacion().RegistrosPorPagina || 1;
                return Math.ceil(_this.datosPaginacion().TotalRegistros / registrosPorPagina);
            };
            this.esPaginaActual = function (pagina) { return pagina === _this.paginaActual(); };
            this.deshabilitarSiguiente = ko.pureComputed(function () {
                var numeroPaginas = _this.calcularNumeroPaginas();
                return numeroPaginas <= 0 || _this.paginaActual() === numeroPaginas;
            });
            this.deshabilitarAnterior = ko.pureComputed(function () { return _this.paginaActual() === 1; });
        }
        MiPaginador.crear = function (nombreComponente) {
            var paginador = new framework.MiPaginador();
            ko.components.register(nombreComponente, {
                viewModel: {
                    createViewModel: function (params, componentInfo) { return paginador; }
                },
                template: "<ul class=\"pagination\">\n\t\t\t\t\t<li data-bind=\"css: {disabled: deshabilitarAnterior}\"><button data-bind=\"click: !deshabilitarAnterior() && inicio\">&laquo;</button></li >\n\t\t\t\t\t<li data-bind=\"css: {disabled: deshabilitarAnterior}\"><button data-bind=\"click: !deshabilitarAnterior() && mover.partial(-1)\">&lsaquo;</button></li >\n\t\t\t\t\t<!-- ko foreach: paginas -->\n\t\t\t\t\t<li data-bind=\"css: {active: $parent.esPaginaActual($data)}\"><button data-bind=\"text: $data, click: $parent.navegar.partial($data)\"></button></li >\n\t\t\t\t\t<!-- /ko -->\n\t\t\t\t\t<li data-bind=\"css: {disabled: deshabilitarSiguiente}\"><button data-bind=\"click: !deshabilitarSiguiente() && mover.partial(1)\">&rsaquo;</button></li >\n\t\t\t\t\t<li data-bind=\"css: {disabled: deshabilitarSiguiente}\"><button data-bind=\"click: !deshabilitarSiguiente() && fin\">&raquo;</button></li >\n\t\t\t\t</ul>"
            });
            return paginador;
        };
        return MiPaginador;
    }());
    framework.MiPaginador = MiPaginador;
})(framework || (framework = {}));
