import React, { useState } from "react";
import { contentClient } from "@/api/contentClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, FileText, Upload, Loader2, Eye, EyeOff, Award, Calendar, Building2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const CERTIFICATE_TYPES = [
  { value: "constancia", label: "Constancia" },
  { value: "certificado", label: "Certificado" },
  { value: "diploma", label: "Diploma" },
  { value: "reconocimiento", label: "Reconocimiento" },
  { value: "otro", label: "Otro" }
];

const MIN_YEAR = 2021;
const CURRENT_YEAR = new Date().getFullYear();

export default function AdminCertificates() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processedResults, setProcessedResults] = useState([]);
  const [filterYear, setFilterYear] = useState("all");

  const queryClient = useQueryClient();

  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ['admin-certificates'],
    queryFn: () => contentClient.entities.Certificate.list('-date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => contentClient.entities.Certificate.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-certificates'] })
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => contentClient.entities.Certificate.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-certificates'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => contentClient.entities.Certificate.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-certificates'] })
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setProcessing(true);
    setProcessedResults([]);
    setUploadProgress(0);

    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(((i + 0.5) / files.length) * 100);

      // Upload file
      const { file_url } = await contentClient.integrations.Core.UploadFile({ file });

      // Extract data with AI
      const extractedData = await contentClient.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Título del certificado o constancia" },
            issuer: { type: "string", description: "Nombre de la institución o organización que emite el documento" },
            date: { type: "string", description: "Fecha de emisión en formato YYYY-MM-DD si es posible determinarla" },
            year: { type: "number", description: "Año de emisión del documento" },
            type: { type: "string", enum: ["constancia", "certificado", "diploma", "reconocimiento", "otro"] },
            description: { type: "string", description: "Breve descripción del contenido del documento" }
          }
        }
      });

      const data = extractedData.output || {};
      const year = data.year || (data.date ? new Date(data.date).getFullYear() : null);

      results.push({
        file_url,
        title: data.title || file.name.replace('.pdf', ''),
        issuer: data.issuer || '',
        date: data.date || '',
        year: year,
        type: data.type || 'certificado',
        description: data.description || '',
        isValid: year && year >= MIN_YEAR && year <= CURRENT_YEAR,
        fileName: file.name
      });

      setUploadProgress(((i + 1) / files.length) * 100);
    }

    setProcessedResults(results);
    setUploading(false);
    setProcessing(false);
  };

  const handleSaveValidCertificates = async () => {
    const validCerts = processedResults.filter(r => r.isValid);
    
    for (const cert of validCerts) {
      await createMutation.mutateAsync({
        title: cert.title,
        type: cert.type,
        issuer: cert.issuer,
        date: cert.date,
        year: cert.year,
        pdf_url: cert.file_url,
        description: cert.description,
        visible: true
      });
    }

    setProcessedResults([]);
    setIsUploadDialogOpen(false);
  };

  const toggleVisibility = (cert) => {
    updateMutation.mutate({ id: cert.id, data: { visible: !cert.visible } });
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Eliminar este certificado?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredCertificates = certificates.filter(c => {
    if (filterYear === "all") return true;
    return c.year === parseInt(filterYear);
  });

  const validResults = processedResults.filter(r => r.isValid);
  const invalidResults = processedResults.filter(r => !r.isValid);

  const years = [];
  for (let y = CURRENT_YEAR; y >= MIN_YEAR; y--) {
    years.push(y);
  }

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <p className="text-slate-600">{certificates.length} certificados/constancias</p>
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filtrar año" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {years.map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsUploadDialogOpen(true)} className="bg-[#0A2540]">
          <Upload className="w-4 h-4 mr-2" />
          Subir PDFs
        </Button>
      </div>

      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Filtrado Automático por IA</p>
            <p className="text-sm text-amber-700">Solo se guardarán certificados y constancias del {MIN_YEAR} al {CURRENT_YEAR}. Los documentos anteriores serán identificados pero no guardados.</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        {filteredCertificates.map((cert) => (
          <Card key={cert.id} className={`p-4 bg-white ${!cert.visible ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0A2540]/10 flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-[#0A2540]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-[#0A2540]">{cert.title}</h3>
                  <Badge variant="outline">{CERTIFICATE_TYPES.find(t => t.value === cert.type)?.label}</Badge>
                </div>
                {cert.issuer && (
                  <p className="text-sm text-slate-600 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {cert.issuer}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  {cert.year && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {cert.year}
                    </span>
                  )}
                  {cert.pdf_url && (
                    <a href={cert.pdf_url} target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:underline flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Ver PDF
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => toggleVisibility(cert)}>
                  {cert.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(cert.id)} className="text-red-500">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredCertificates.length === 0 && (
          <Card className="p-12 text-center bg-white">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No hay certificados aún. ¡Sube el primero!</p>
          </Card>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Subir Certificados y Constancias</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!processing && processedResults.length === 0 && (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                <input
                  type="file"
                  id="pdf-upload"
                  accept=".pdf"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="font-medium text-slate-700">Arrastra PDFs aquí o haz clic para seleccionar</p>
                  <p className="text-sm text-slate-500 mt-1">Puedes seleccionar múltiples archivos</p>
                </label>
              </div>
            )}

            {(uploading || processing) && (
              <div className="space-y-4 py-8">
                <Loader2 className="w-12 h-12 text-[#D4AF37] mx-auto animate-spin" />
                <p className="text-center text-slate-600">Procesando documentos con IA...</p>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {processedResults.length > 0 && (
              <div className="space-y-4">
                {validResults.length > 0 && (
                  <div>
                    <h4 className="font-bold text-green-700 flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5" />
                      Válidos ({validResults.length}) - Serán guardados
                    </h4>
                    <div className="space-y-2">
                      {validResults.map((result, idx) => (
                        <Card key={idx} className="p-3 bg-green-50 border-green-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-green-800">{result.title}</p>
                              <p className="text-xs text-green-600">{result.issuer} • {result.year}</p>
                            </div>
                            <Badge className="bg-green-100 text-green-700">{result.year}</Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {invalidResults.length > 0 && (
                  <div>
                    <h4 className="font-bold text-red-700 flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      Fuera de rango ({invalidResults.length}) - No serán guardados
                    </h4>
                    <div className="space-y-2">
                      {invalidResults.map((result, idx) => (
                        <Card key={idx} className="p-3 bg-red-50 border-red-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-800">{result.title}</p>
                              <p className="text-xs text-red-600">{result.fileName} • Año: {result.year || 'No detectado'}</p>
                            </div>
                            <Badge className="bg-red-100 text-red-700">Anterior a {MIN_YEAR}</Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => { setProcessedResults([]); setIsUploadDialogOpen(false); }}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSaveValidCertificates} 
                    className="bg-[#0A2540]"
                    disabled={validResults.length === 0}
                  >
                    Guardar {validResults.length} Válidos
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}