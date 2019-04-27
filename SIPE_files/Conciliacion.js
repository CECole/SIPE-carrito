var administracion;
(function (administracion) {
    var EstatusConciliacion;
    (function (EstatusConciliacion) {
        EstatusConciliacion[EstatusConciliacion["Ninguno"] = 0] = "Ninguno";
        EstatusConciliacion[EstatusConciliacion["SinPagos"] = 1] = "SinPagos";
        EstatusConciliacion[EstatusConciliacion["EnProceso"] = 2] = "EnProceso";
        EstatusConciliacion[EstatusConciliacion["PorConciliar"] = 3] = "PorConciliar";
        EstatusConciliacion[EstatusConciliacion["Cerrada"] = 4] = "Cerrada";
    })(EstatusConciliacion || (EstatusConciliacion = {}));
    var getProperty = function (target, key) { return (target && Object.prototype.hasOwnProperty.call(target, key)) ? target[key] : null; };
    var ConciliacionPagos = (function () {
        function ConciliacionPagos(paginadorServicios, paginadorProveedores) {
            var _this = this;
            this.paginadorServicios = paginadorServicios;
            this.paginadorProveedores = paginadorProveedores;
            this.calendario$ = $('div.date');
            this.detallePagos = ko.observable();
            this.pagosServicios = ko.observableArray([]);
            this.pagosProveedores = ko.observableArray([]);
            this.fechaConciliacion = ko.observable();
            this.fechaCierre = ko.observable();
            this.maxRequestLength = framework.settings.maxRequestLength || 20;
            this.estatus = ko.pureComputed(function () { return getProperty(_this.detallePagos(), 'Estatus'); });
            this.mostrarFechaDistinta = ko.pureComputed(function () { return getProperty(_this.detallePagos(), 'TienePagosFechaDistinta'); });
            this.mostrarExtemporaneos = ko.pureComputed(function () { return getProperty(_this.detallePagos(), 'TieneExtemporaneosPendientes'); });
            this.mostrarImportar = ko.pureComputed(function () { return _this.conciliacionAbierta() || _this.estatus() === EstatusConciliacion.SinPagos; });
            this.conciliacionAbierta = ko.pureComputed(function () { return _this.estatus() === EstatusConciliacion.EnProceso || _this.estatus() === EstatusConciliacion.PorConciliar; });
            this.conciliacionCerrada = ko.pureComputed(function () { return _this.estatus() === EstatusConciliacion.Cerrada; });
            this.buscar = function () {
                var fecha = _this.formatearFecha(), verificarDatos = function () {
                    if (!_this.pagosServicios().hasElements() && !_this.pagosProveedores().hasElements()) {
                        modal.alert('No existen registros que cumplan con los parámetros de búsqueda.');
                    }
                };
                promises.chain()
                    .pipe(_this.obtenerPagosServicios.close(fecha))
                    .pipe(_this.obtenerPagosProveedores.close(fecha))
                    .pipe(verificarDatos);
            };
            this.cerrarConciliacion = function () {
                var fecha = _this.formatearFecha(), verificarCierre = ajax.postfn('/Conciliacion/VerificarCierre', { fecha: fecha }), cerrar = ajax.postfn('/Conciliacion/Cerrar', { fecha: fecha });
                var desplegarConfirmacion = function (resultado) {
                    return (!resultado) ? modal.confirm('¿Está seguro de que desea realizar el Cierre de la Conciliación? Hay archivos de convenios que no se han importado.') : promises.chain();
                };
                verificarCierre()
                    .pipe(desplegarConfirmacion)
                    .pipe(cerrar)
                    .pipe(_this.obtenerDetalleConciliacion)
                    .done(_this.buscar);
            };
            this.conciliarPagoProveedor = function (proveedor) {
                return ajax.post('/Conciliacion/Conciliar', { IdArchivo: proveedor.IdArchivo, fechaConciliacion: _this.formatearFecha() })
                    .pipe(_this.obtenerPagosProveedores.close(_this.formatearFecha()));
            };
            this.desplegarFechasDistintas = function () {
                var desplegarModal = modal.loadModal('/Conciliacion/FechaDistinta', { fecha: _this.formatearFecha() }, { width: 900, acceptButtonText: 'Regresar', cancelButtonVisible: false });
                desplegarModal.subscribe(function (e) {
                    ko.components.unregister('grid-pagination-fecha');
                    e.close();
                });
            };
            this.eliminarPagoProveedor = function (proveedor, e) {
                var eliminar = ajax.postfn("/Conciliacion/EliminarArchivoProveedor", { idArchivo: proveedor.IdArchivo, esExtemporaneo: false });
                portal.alwaysToogleRow(e)(modal.confirm("\u00BFEst\u00E1 seguro de que desea eliminar el archivo?")
                    .pipe(eliminar)
                    .pipe(modal.alert)
                    .pipe(_this.buscar));
            };
            this.importar = function () {
                var desplegarModal = modal.loadModal('/Conciliacion/Importar', { fecha: _this.formatearFecha() }, { acceptButtonText: 'Importar', width: 700 });
                desplegarModal.subscribe(function (e) {
                    return ajax.validate(e.form)
                        .pipe(fileUpload.send.partial(e.form, _this.maxRequestLength))
                        .pipe(framework.tap(e.close))
                        .pipe(modal.alert)
                        .done(_this.buscar);
                });
            };
            this.verResultados = function () { return portal.redirectUrl2('/Conciliacion/Consultar', { fecha: _this.formatearFecha() }); };
            this.limpiar = function () {
                _this.detallePagos(null);
                _this.pagosServicios([]);
                _this.pagosProveedores([]);
                _this.paginadorServicios.limpiar();
                _this.paginadorProveedores.limpiar();
            };
            this.obtenerDetalleConciliacion = function () {
                return administracion.obtenerDetalleConciliacion()
                    .done(function (response) { return _this.calendario$.datepicker('setProcessDays', response); });
            };
            this.obtenerDetallePagos = function (fecha) {
                var mapearCampos = function (datos) {
                    _this.detallePagos(datos);
                    _this.fechaCierre(datos.FechaCierre);
                };
                ajax.post('/Conciliacion/ObtenerDetallePagos', { fechaConciliacion: fecha })
                    .pipe(promises.hasData)
                    .done(mapearCampos);
            };
            this.formatearFecha = function () { return framework.parseDate(_this.fechaConciliacion()).toISOString(); };
            this.verDetalleArchivoServicio = function (servicio) {
                return ajax.getHTML('/Conciliacion/VerDetalleArchivoServicio', { idArchivo: servicio.IdArchivo, emisoraAfiliacionId: servicio.EmisoraAfiliacionID, fechaConciliacion: _this.formatearFecha(), esExtemporaneo: servicio.TipoPago === 'Extemporáneo' })
                    .done(_this.mostrarDialogoDetalle);
            };
            this.verDetalleArchivoProveedor = function (proveedor) {
                return ajax.getHTML('/Conciliacion/VerDetalleArchivoProveedor', { idArchivo: proveedor.IdArchivo, convenio: proveedor.Convenio, fechaConciliacion: _this.formatearFecha(), esExtemporaneo: proveedor.TipoPago === 'Extemporáneo', esConciliacionPagos: true })
                    .done(_this.mostrarDialogoDetalle);
            };
            this.verDetalleError = function (proveedor) { return modal.alert(proveedor.Error); };
            this.obtenerPagosServicios = function (fecha, pagina) {
                if (pagina === void 0) { pagina = 1; }
                return ajax.post('/Conciliacion/ObtenerPagosServicios', { fechaConciliacion: fecha, Pagina: pagina })
                    .done(_this.procesarRespuesta.partial(function (response) {
                    _this.pagosServicios(response.Registros);
                    _this.paginadorServicios.asignarDatos(response.Paginacion);
                }));
            };
            this.obtenerPagosProveedores = function (fecha, pagina) {
                if (pagina === void 0) { pagina = 1; }
                return ajax.post('/Conciliacion/ObtenerPagosProveedores', { fechaConciliacion: fecha, Pagina: pagina })
                    .pipe(_this.procesarRespuesta.partial(function (response) {
                    _this.pagosProveedores(response.Registros);
                    _this.paginadorProveedores.asignarDatos(response.Paginacion);
                }))
                    .done(_this.obtenerDetallePagos.close(_this.formatearFecha()));
            };
            this.mostrarDialogoDetalle = modal.create({ acceptButtonText: 'Regresar', cancelButtonVisible: false, width: 550 });
            this.procesarRespuesta = function (fn, response) {
                if (response) {
                    fn(response);
                }
            };
            this.calendario$.on('changeDate', this.limpiar);
            this.paginadorServicios.registrarNotificacion(function (pagina) { return _this.obtenerPagosServicios(_this.fechaConciliacion(), pagina); });
            this.paginadorProveedores.registrarNotificacion(function (pagina) { return _this.obtenerPagosProveedores(_this.fechaConciliacion(), pagina); });
            framework.deferred(this.obtenerDetalleConciliacion.close());
        }
        ConciliacionPagos.crear = function () {
            $(function () {
                var today = new Date();
                calendarios.configurar(framework.applyTwice(administracion.getPreviousMonth, today), administracion.getNextMonth(today));
                $('#FechaConciliacion').attr('data-bind', 'control: fechaConciliacion');
                $('#FechaCierre').attr('data-bind', 'control: fechaCierre');
                var paginadorServicios = framework.MiPaginador.crear('grid-estatus');
                var paginadorProveedores = framework.MiPaginador.crear('grid-pagos');
                ko.applyBindings(new ConciliacionPagos(paginadorServicios, paginadorProveedores));
            });
        };
        return ConciliacionPagos;
    }());
    ConciliacionPagos.crear();
})(administracion || (administracion = {}));
