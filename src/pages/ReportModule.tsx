import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  ScanBarcode,
  X,
  AlertTriangle,
  History,
  ChevronRight,
  ChevronLeft,
  Camera,
  Send,
  MapPin,
  Package,
  CheckCircle2,
} from 'lucide-react';
import { QRScannerWrapper } from '../components/scanner/QRScannerWrapper';
import { mockProducts, getAvailableStockBySku, getLocationBySku } from '../data/mockData';
import {
  useReportsStore,
  reportTypeLabels,
  type ReportType,
} from '../stores/reportsStore';
import { useAuthStore } from '../stores/authStore';

const ReportModule: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addReport, getReportsByUser } = useReportsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [showScanner, setShowScanner] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // Formulario de reporte
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [description, setDescription] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = searchQuery
    ? mockProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockProducts;

  const userReports = user ? getReportsByUser(user.id) : [];

  const handleScan = (qrCode: string) => {
    setShowScanner(false);
    let sku = qrCode;
    const parts = qrCode.split(':');
    if (parts[0] === 'SS' && parts[1] === 'P') {
      sku = parts[2];
    }
    setSearchQuery(sku);
    const product = mockProducts.find((p) => p.sku === sku);
    if (product) {
      setSelectedProduct(product.id);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReport = () => {
    if (!selectedProduct || !reportType || !user) return;

    const product = mockProducts.find((p) => p.id === selectedProduct);
    if (!product) return;

    addReport({
      productSku: product.sku,
      productName: product.name,
      productLocation: getLocationBySku(product.sku) || 'Sin ubicación',
      type: reportType,
      description: description.trim(),
      photoBase64: photoBase64 || undefined,
      createdBy: user.id,
    });

    // Mostrar éxito y resetear
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedProduct(null);
      setReportType(null);
      setDescription('');
      setPhotoBase64(null);
      setActiveTab('history');
    }, 2000);
  };

  const product = selectedProduct
    ? mockProducts.find((p) => p.id === selectedProduct)
    : null;

  const productStock = product ? getAvailableStockBySku(product.sku) : 0;
  const productLocation = product ? getLocationBySku(product.sku) : '';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Reportar Incidencia</h1>
          <div className="w-10" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveTab('new');
              setSelectedProduct(null);
              setReportType(null);
              setDescription('');
              setPhotoBase64(null);
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'new'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Nuevo Reporte
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'history'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <History className="w-4 h-4" />
            Mis Reportes
            {userReports.length > 0 && (
              <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                {userReports.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'history' ? (
          /* Historial de Reportes */
          <div>
            {userReports.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Sin reportes
                </h3>
                <p className="text-sm text-gray-500">
                  Aún no has reportado ninguna incidencia.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {userReports.map((report) => {
                  const typeInfo = reportTypeLabels[report.type];
                  return (
                    <div
                      key={report.id}
                      className="bg-white rounded-xl shadow-sm overflow-hidden"
                    >
                      <div className="p-4">
                        {/* Header del reporte */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {report.productName}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">
                              {report.productSku}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {formatDate(report.createdAt)}
                          </span>
                        </div>

                        {/* Tipo de incidencia */}
                        <div
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-sm ${typeInfo.color}`}
                        >
                          <span>{typeInfo.icon}</span>
                          <span className="font-medium">{typeInfo.label}</span>
                        </div>

                        {/* Descripción */}
                        {report.description && (
                          <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                            {report.description}
                          </p>
                        )}

                        {/* Foto adjunta */}
                        {report.photoBase64 && (
                          <div className="mt-2">
                            <img
                              src={report.photoBase64}
                              alt="Evidencia"
                              className="w-full max-h-40 object-cover rounded-lg"
                            />
                          </div>
                        )}

                        {/* Ubicación */}
                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span>{report.productLocation}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : selectedProduct && product ? (
          /* Formulario de Reporte */
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4">
              {/* Botón de volver */}
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setReportType(null);
                  setDescription('');
                  setPhotoBase64(null);
                }}
                className="flex items-center gap-1 text-orange-600 text-sm font-medium mb-3 hover:text-orange-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Seleccionar otro producto
              </button>

              {/* Info del producto */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{product.sku}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {productLocation || 'Sin ubicación'}
                      </span>
                      <span>Stock: {productStock}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tipo de incidencia */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Incidencia *
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {(Object.entries(reportTypeLabels) as [ReportType, typeof reportTypeLabels[ReportType]][]).map(
                    ([type, info]) => (
                      <button
                        key={type}
                        onClick={() => setReportType(type)}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                          reportType === type
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-xl">{info.icon}</span>
                        <span
                          className={`font-medium ${
                            reportType === type ? 'text-orange-700' : 'text-gray-700'
                          }`}
                        >
                          {info.label}
                        </span>
                        {reportType === type && (
                          <CheckCircle2 className="w-5 h-5 text-orange-500 ml-auto" />
                        )}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe el problema con más detalle..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Subir foto */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto de evidencia (opcional)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                {photoBase64 ? (
                  <div className="relative">
                    <img
                      src={photoBase64}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setPhotoBase64(null)}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center gap-2 text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors"
                  >
                    <Camera className="w-8 h-8" />
                    <span className="text-sm font-medium">Tomar o subir foto</span>
                  </button>
                )}
              </div>

              {/* Botón enviar */}
              <button
                onClick={handleSubmitReport}
                disabled={!reportType}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                  reportType
                    ? 'bg-orange-500 text-white active:scale-[0.98]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
                ENVIAR REPORTE
              </button>
            </div>
          </div>
        ) : (
          /* Lista de productos para seleccionar */
          <div>
            {/* Search Bar */}
            <div className="relative flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar producto para reportar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowScanner(true)}
                className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
              >
                <ScanBarcode className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Instrucciones */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-orange-700">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Selecciona un producto para reportar una incidencia o problema.
              </p>
            </div>

            {/* Lista de productos */}
            <p className="text-sm text-gray-600 mb-2">
              {searchQuery
                ? `Resultados (${filteredProducts.length}):`
                : `Todos los productos (${filteredProducts.length}):`}
            </p>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {filteredProducts.length === 0 ? (
                <div className="p-6 text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No se encontraron productos</p>
                </div>
              ) : (
                filteredProducts.map((product, index) => {
                  const stock = getAvailableStockBySku(product.sku);
                  const location = getLocationBySku(product.sku);

                  return (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProduct(product.id)}
                      className={`w-full p-3 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors text-left ${
                        index !== filteredProducts.length - 1
                          ? 'border-b border-gray-100'
                          : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="font-mono">{product.sku}</span>
                          {location && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-3 h-3" />
                                {location}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-1 bg-gray-100 rounded-lg">
                          <p className="text-sm font-medium text-gray-600">{stock}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <QRScannerWrapper
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
          title="Escanear Producto"
          subtitle="Escanea el código del producto"
          expectedType="product"
        />
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 text-center max-w-sm w-full animate-in zoom-in-95">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Reporte Enviado
            </h3>
            <p className="text-sm text-gray-500">
              Tu reporte ha sido registrado correctamente.
            </p>
          </div>
        </div>
      )}

      {/* Bottom Nav Spacer */}
      <div className="h-20" />
    </div>
  );
};

export default ReportModule;
