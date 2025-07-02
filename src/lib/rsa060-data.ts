import type { Milestone, Category, AssociatedFile } from '@/types';

// NOTE: This category object is a placeholder. The actual, state-managed category
// object from `src/lib/data.ts` will be mapped in the component.
const otrosCategory: Category = { id: 'cat-otros', name: 'Otros', color: '#888888' };

export const RSA060_MILESTONES: Milestone[] = [
  {
    id: 'rsa060-1',
    name: 'Inicio de Proyecto RSA060',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°1.',
    occurredAt: '2023-03-15T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [{ id: 'file-rsa060-1', name: 'Acta_Inicio.pdf', size: '1234.56 KB', type: 'document' }],
    isImportant: true,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-2',
    name: 'Relevamiento Topográfico',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°2.',
    occurredAt: '2023-04-02T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [
        { id: 'file-rsa060-2-1', name: 'Planos_Topografia.dwg', size: '4587.12 KB', type: 'other' },
        { id: 'file-rsa060-2-2', name: 'Informe_Campo.docx', size: '854.21 KB', type: 'document' }
    ],
    isImportant: false,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-3',
    name: 'Estudio de Suelos Preliminar',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°3.',
    occurredAt: '2023-04-25T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [],
    isImportant: false,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-4',
    name: 'Presentación de Avance a Cliente',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°4.',
    occurredAt: '2023-05-18T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [{ id: 'file-rsa060-4', name: 'Presentacion_Mayo.pptx', size: '8123.45 KB', type: 'document' }],
    isImportant: false,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-5',
    name: 'Aprobación de Diseño Conceptual',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°5.',
    occurredAt: '2023-06-05T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [],
    isImportant: true,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-6',
    name: 'Informe de Impacto Ambiental',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°6.',
    occurredAt: '2023-07-20T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [{ id: 'file-rsa060-6', name: 'EIA_RSA060.pdf', size: '15234.98 KB', type: 'document' }],
    isImportant: false,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-7',
    name: 'Reunión de Contratista',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°7.',
    occurredAt: '2023-08-01T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [{ id: 'file-rsa060-7', name: 'Minuta_Contratista.docx', size: '450.76 KB', type: 'document' }],
    isImportant: false,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-8',
    name: 'Inspección de Obra #1',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°8.',
    occurredAt: '2023-08-15T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [
        { id: 'file-rsa060-8-1', name: 'Foto_Avance_1.jpg', size: '3024.11 KB', type: 'image' },
        { id: 'file-rsa060-8-2', name: 'Foto_Avance_2.jpg', size: '2899.34 KB', type: 'image' }
    ],
    isImportant: false,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-9',
    name: 'Entrega de Planos Constructivos',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°9.',
    occurredAt: '2023-09-10T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [],
    isImportant: false,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-10',
    name: 'Análisis de Costos Detallado',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°10.',
    occurredAt: '2023-09-28T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [{ id: 'file-rsa060-10', name: 'Analisis_Costos_v2.xlsx', size: '1890.23 KB', type: 'document' }],
    isImportant: false,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-11',
    name: 'Capacitación de Seguridad',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°11.',
    occurredAt: '2023-10-12T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [],
    isImportant: false,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-12',
    name: 'Hallazgo Menor en Estructura',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°12.',
    occurredAt: '2023-11-03T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [{ id: 'file-rsa060-12', name: 'Reporte_Hallazgo.pdf', size: '550.00 KB', type: 'document' }],
    isImportant: false,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-13',
    name: 'Informe de Seguimiento Mensual',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°13.',
    occurredAt: '2023-11-30T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [],
    isImportant: false,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-14',
    name: 'Finalización de Cimientos',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°14.',
    occurredAt: '2023-12-20T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [{ id: 'file-rsa060-14', name: 'Certificado_Cimientos.pdf', size: '205.15 KB', type: 'document' }],
    isImportant: true,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-15',
    name: 'Inspección de Obra #2',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°15.',
    occurredAt: '2024-01-18T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [],
    isImportant: false,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-16',
    name: 'Revisión del Cronograma',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°16.',
    occurredAt: '2024-02-05T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [{ id: 'file-rsa060-16', name: 'Cronograma_Actualizado.mpp', size: '678.90 KB', type: 'other' }],
    isImportant: false,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-17',
    name: 'Montaje de Estructura Principal',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°17.',
    occurredAt: '2024-03-10T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [{ id: 'file-rsa060-17', name: 'Video_Montaje.mp4', size: '50123.45 KB', type: 'video' }],
    isImportant: false,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-18',
    name: 'Documentación Legal de Terreno',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°18.',
    occurredAt: '2024-03-25T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [],
    isImportant: false,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-19',
    name: 'Pruebas de Instalación Eléctrica',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°19.',
    occurredAt: '2024-04-12T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [{ id: 'file-rsa060-19', name: 'Protocolo_Pruebas.pdf', size: '987.65 KB', type: 'document' }],
    isImportant: false,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-20',
    name: 'Informe de Avance 50%',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°20.',
    occurredAt: '2024-04-30T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [],
    isImportant: true,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-21',
    name: 'Inspección de Obra #3',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°21.',
    occurredAt: '2024-05-15T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [],
    isImportant: false,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-22',
    name: 'Instalación de Carpinterías',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°22.',
    occurredAt: '2024-06-01T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [],
    isImportant: false,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-23',
    name: 'Programa de Gestión Ambiental (PGA)',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°23.',
    occurredAt: '2024-06-20T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [{ id: 'file-rsa060-23', name: 'PGA_RSA060.pdf', size: '3456.78 KB', type: 'document' }],
    isImportant: false,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-24',
    name: 'Hallazgo Grave: Falla Estructural',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°24.',
    occurredAt: '2024-07-05T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [{ id: 'file-rsa060-24', name: 'Informe_Falla.pdf', size: '1230.10 KB', type: 'document' }],
    isImportant: true,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-25',
    name: 'Reunión de Crisis con Contratista',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°25.',
    occurredAt: '2024-07-08T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [],
    isImportant: false,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-26',
    name: 'Plan de Remediación Aprobado',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°26.',
    occurredAt: '2024-07-22T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [],
    isImportant: false,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-27',
    name: 'Inspección de Obra #4 (Post-remediación)',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°27.',
    occurredAt: '2024-08-10T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [{ id: 'file-rsa060-27', name: 'Fotos_Remediacion.zip', size: '18450.00 KB', type: 'other' }],
    isImportant: false,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-28',
    name: 'Finalización de Interiores',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°28.',
    occurredAt: '2024-08-28T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [],
    isImportant: false,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-29',
    name: 'Auditoría de Calidad Final',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°29.',
    occurredAt: '2024-09-05T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [],
    isImportant: false,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-30',
    name: 'Informe Final de Proyecto',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°30.',
    occurredAt: '2024-09-15T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [{ id: 'file-rsa060-30', name: 'Informe_Final_RSA060.pdf', size: '25000.00 KB', type: 'document' }],
    isImportant: false,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-31',
    name: 'Recepción Provisional de Obra',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°31.',
    occurredAt: '2024-09-20T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [],
    isImportant: true,
    history: ['Hito creado a partir de datos de ejemplo.']
  },
  {
    id: 'rsa060-32',
    name: 'Cierre Administrativo del Proyecto',
    description: 'Este es un hito de ejemplo generado automáticamente para el proyecto RSA060. Corresponde a la actividad de revisión N°32.',
    occurredAt: '2024-09-28T12:00:00.000Z',
    category: otrosCategory,
    tags: null,
    associatedFiles: [],
    isImportant: false,
    history: ['Hito creado a partir de datos de ejemplo.']
  }
];
