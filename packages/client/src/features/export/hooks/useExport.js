import { useState } from 'react';
import { ExporterFactory } from '../exporters/ExporterFactory';
// Import all exporters to trigger self-registration
import '../exporters/StepExporter';
import '../exporters/GltfExporter';
import '../exporters/StlExporter';
export function useExport() {
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState(null);
    const exportSolid = async (format, input) => {
        setExporting(true);
        setError(null);
        try {
            const exporter = ExporterFactory.create(format);
            const result = await exporter.export(input);
            // Trigger browser download
            const url = URL.createObjectURL(result.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.filename;
            a.click();
            URL.revokeObjectURL(url);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Export failed');
        }
        finally {
            setExporting(false);
        }
    };
    return { exportSolid, exporting, error };
}
