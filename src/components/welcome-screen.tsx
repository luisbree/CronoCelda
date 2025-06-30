import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trello, UploadCloud, Mouse, GanttChartSquare, Settings, Search, ListChecks } from "lucide-react";

export function WelcomeScreen() {
    return (
        <div className="flex flex-col items-center justify-center h-full p-4 md:p-8 overflow-y-auto">
            <div className="text-center mb-8 shrink-0">
                <GanttChartSquare className="h-16 w-16 mx-auto text-muted-foreground/50" />
                <h1 className="text-3xl font-bold font-headline mt-4">Bienvenido a DEAS TL</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto mt-2">
                    Tu repositorio de archivos en una línea de tiempo interactiva. Aquí tienes una guía rápida para empezar.
                </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline text-lg">
                            <Trello className="h-5 w-5 text-primary" />
                            1. Cargar desde Trello
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <p>
                            Usa el panel lateral para conectar con Trello. Selecciona un <strong>tablero</strong>, luego una <strong>lista</strong> y finalmente una <strong>tarjeta</strong>. Los archivos adjuntos de esa tarjeta se cargarán automáticamente como hitos.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline text-lg">
                            <UploadCloud className="h-5 w-5 text-primary" />
                            2. Crear Hitos Manuales
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <p>
                            Una vez seleccionada una tarjeta, activa el botón <strong>"Hito nuevo"</strong> para añadir eventos o documentos que no están en Trello, completando el formulario con sus detalles y archivos.
                        </p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline text-lg">
                            <Mouse className="h-5 w-5 text-primary" />
                            3. Explorar la Línea de Tiempo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <ul className="list-disc list-inside space-y-1">
                            <li><strong>Zoom:</strong> Usa la rueda del ratón.</li>
                            <li><strong>Desplazar:</strong> Clic derecho/rueda y arrastra.</li>
                            <li><strong>Ver Detalles:</strong> Clic en cualquier punto.</li>
                            <li><strong>Redimensionar:</strong> Arrastra la barra divisoria.</li>
                        </ul>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline text-lg">
                           <Settings className="h-5 w-5 text-primary" />
                            Gestionar Hitos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <p>
                            Al seleccionar un hito, se abrirá el <strong>panel de inspección</strong>. Desde allí puedes editar el título, descripción, añadir/quitar etiquetas, cambiar la categoría y marcarlo como importante.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline text-lg">
                           <Search className="h-5 w-5 text-primary" />
                           Búsqueda y Filtros
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <p>
                            Utiliza la barra de búsqueda superior para encontrar hitos por nombre, descripción o etiqueta. Los botones de rango de tiempo (Hoy, 1M, 1A, Todo) te permiten enfocar la línea de tiempo rápidamente.
                        </p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline text-lg">
                            <ListChecks className="h-5 w-5 text-primary" />
                            Funciones Adicionales
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                       <ul className="list-disc list-inside space-y-1">
                            <li><strong>Etiquetado con IA:</strong> Los hitos se etiquetan automáticamente para facilitar la búsqueda.</li>
                            <li><strong>Gestión de Categorías:</strong> Edita, elimina y cambia el color de las categorías en la barra lateral.</li>
                            <li><strong>Resumen de Hitos:</strong> Haz clic en el icono de lista en la cabecera para ver un resumen.</li>
                       </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
