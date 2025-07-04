'use client';

import * as React from 'react';
import { type Milestone } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Printer, Star } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface MilestoneSummaryTableProps {
  milestones: Milestone[];
}

export function MilestoneSummaryTable({ milestones }: MilestoneSummaryTableProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-6 printable-area">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="font-headline text-2xl">Resumen de Hitos</CardTitle>
                <CardDescription>
                    Una tabla con todos los hitos visibles, ordenados por fecha.
                </CardDescription>
            </div>
            <Button onClick={handlePrint} size="sm" variant="outline" className="no-print">
                <Printer className="mr-2 h-4 w-4" />
                Imprimir o Guardar como PDF
            </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Nombre del Hito</TableHead>
                <TableHead className="w-[15%]">Fecha</TableHead>
                <TableHead className="w-[20%]">Categoría</TableHead>
                <TableHead className="w-[25%]">Etiquetas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {milestones.length > 0 ? (
                milestones.map((milestone) => (
                  <TableRow key={milestone.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {milestone.isImportant && (
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 shrink-0" />
                        )}
                        <span>{milestone.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(parseISO(milestone.occurredAt), "dd/MM/yyyy", { locale: es })}
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <div
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: milestone.category.color }}
                            />
                            <span className="text-xs">{milestone.category.name}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {milestone.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary" className="font-normal">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No hay hitos para mostrar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
