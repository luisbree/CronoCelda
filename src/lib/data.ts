import type { Milestone, Category } from '@/types';

export const CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Estudios de Impacto (EIA)', color: '#3B5998' },
  { id: 'cat-2', name: 'Inspecciones de Obra', color: '#008080' },
  { id: 'cat-3', name: 'Informes de Seguimiento', color: '#8A2BE2' },
  { id: 'cat-4', name: 'Documentación Legal', color: '#FF4500' },
  { id: 'cat-5', name: 'Planos y Cartografía', color: '#708090' },
];

export const MILESTONES: Milestone[] = [
  {
    id: 'hito-1',
    name: 'Inicio del EIA del Canal Aliviador Sur',
    description: 'Se da inicio formal al estudio de impacto ambiental para la construcción del nuevo canal aliviador sur. Se recopila la información base y se definen los alcances del proyecto.',
    occurredAt: '2024-07-22T14:30:00Z',
    category: CATEGORIES[0],
    tags: ['eia', 'hidráulica', 'inicio'],
    associatedFiles: [
      { id: 'file-1', name: 'Memoria_Descriptiva_Canal_Sur.pdf', size: '25.3 MB', type: 'document' },
    ],
  },
  {
    id: 'hito-2',
    name: 'Inspección Inicial - Defensa Costera',
    description: 'Primera inspección en el sitio de la futura defensa costera. Se toman fotografías del estado actual del terreno y se realizan mediciones preliminares.',
    occurredAt: '2024-07-22T10:15:00Z',
    category: CATEGORIES[1],
    tags: ['inspección', 'fotografía', 'costa'],
    associatedFiles: [
      { id: 'file-2', name: 'Fotos_Inspeccion_Defensa_Costera.zip', size: '150.2 MB', type: 'image' },
    ],
  },
  {
    id: 'hito-3',
    name: 'Entrega Informe Seguimiento Q2 - Presa El Mollar',
    description: 'Presentación del informe trimestral (Q2) sobre el estado de la Presa El Mollar, incluyendo análisis de estabilidad y monitoreo de instrumentación.',
    occurredAt: '2024-07-21T18:00:00Z',
    category: CATEGORIES[2],
    tags: ['seguimiento', 'presa', 'monitoreo'],
    associatedFiles: [
      { id: 'file-3', name: 'Seguimiento_Presa_El_Mollar_Q2.pdf', size: '2.1 MB', type: 'document' },
    ],
  },
  {
    id: 'hito-4',
    name: 'Publicación de Resolución de Aprobación',
    description: 'Se publica en el boletín oficial la resolución 045/22 que aprueba el proyecto y su estudio de impacto ambiental asociado.',
    occurredAt: '2024-07-21T09:05:00Z',
    category: CATEGORIES[3],
    tags: ['resolución', 'legal', 'aprobación'],
    associatedFiles: [
      { id: 'file-4', name: 'Resolucion_Aprobacion_045-22.pdf', size: '88 KB', type: 'document' },
    ],
  },
    {
    id: 'hito-5',
    name: 'Recepción de Planos de Desagüe Urbano',
    description: 'Se reciben los planos finales en formato DWG para el proyecto de desagüe pluvial del casco céntrico de la ciudad.',
    occurredAt: '2023-01-15T11:45:00Z',
    category: CATEGORIES[4],
    tags: ['plano', 'autocad', 'urbano'],
    associatedFiles: [
       { id: 'file-5', name: 'Plano_Desague_Urbano_Centro.dwg', size: '32.5 MB', type: 'document' },
    ],
  },
  {
    id: 'hito-6',
    name: 'Reunión con Comité de Cuenca',
    description: 'Reunión de trabajo con los miembros del comité de la cuenca del Río Lules para presentar los avances del proyecto de canalización.',
    occurredAt: '2023-01-14T16:20:00Z',
    category: CATEGORIES[0],
    tags: ['minuta', 'reunión', 'cuenca'],
    associatedFiles: [
      { id: 'file-6', name: 'Minuta_Reunion_Comite_Cuenca.docx', size: '312 KB', type: 'document' },
    ],
  },
  {
    id: 'hito-7',
    name: 'Audiencia Pública - Canal Norte',
    description: 'Se realiza la audiencia pública con participación de vecinos y organizaciones para discutir el proyecto del Canal Norte. Se graba el audio completo.',
    occurredAt: '2024-06-15T11:00:00Z',
    category: CATEGORIES[0],
    tags: ['audiencia', 'audio', 'pública'],
    associatedFiles: [
      { id: 'file-7', name: 'Audio_Audiencia_Publica_Canal_Norte.mp3', size: '88.4 MB', type: 'audio' },
    ],
  },
  {
    id: 'hito-8',
    name: 'Vuelo de Dron - Obra Defensa Sur',
    description: 'Registro en video mediante vuelo de dron del avance de la obra de la Defensa Sur, cubriendo la totalidad del tramo en construcción.',
    occurredAt: '2023-12-20T21:00:00Z',
    category: CATEGORIES[1],
    tags: ['inspección', 'video', 'dron'],
    associatedFiles: [
      { id: 'file-8', name: 'Video_Vuelo_Dron_Obra_Defensa_Sur.mp4', size: '1.2 GB', type: 'video' },
    ],
  },
];
