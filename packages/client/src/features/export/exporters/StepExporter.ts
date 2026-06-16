import { ExporterFactory } from './ExporterFactory'
import type { IExporter, ExportInput, ExportResult } from './IExporter'

export class StepExporter implements IExporter {
  readonly format = 'step' as const

  async export(input: ExportInput): Promise<ExportResult> {
    const date = new Date().toISOString()
    const filename = `${input.name}.step`

    const content = [
      'ISO-10303-21;',
      'HEADER;',
      `FILE_DESCRIPTION(('adem_cad export'),'2;1');`,
      `FILE_NAME('${filename}','${date}',(''),(''),'','adem_cad v0.1','');`,
      `FILE_SCHEMA(('AP203_CONFIGURATION_CONTROLLED_3D_DESIGN_OF_MECHANICAL_PARTS_AND_ASSEMBLIES_MIM_LF { 1 0 10303 403 1 1 4 }'));`,
      'ENDSEC;',
      'DATA;',
      `/* Solid: ${input.solidId} */`,
      '/* TODO: Real OCCT geometry will populate this section */',
      'ENDSEC;',
      'END-ISO-10303-21;',
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain' })

    return { blob, filename, format: 'step' }
  }
}

// Self-register on module load
ExporterFactory.register('step', StepExporter)
