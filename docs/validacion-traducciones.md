# Validación de traducciones — para hablante nativo

La base de datos completa de frases está en **`docs/validacion-traducciones.csv`** (ábrela con Excel / Google Sheets).
Tiene **460 frases** de la entrevista médica en quechua, extraídas de una guía oficial.

## Cómo revisar
1. Abrí `validacion-traducciones.csv` en Excel o Google Sheets.
2. Columnas: **Español | Quechua (OPS/OMS Bolivia 2013) | Quechua corregido | Aymara**.
3. Si una frase en quechua se dice distinto en tu zona, escribila en **"Quechua corregido"**. Si está bien, dejalo vacío.
4. Si hablás **aymara**, completá esa columna.
5. Cuando termines, pasámelo y lo cargo al sistema (`datos/frases-clinicas.json`).

## Fuente (citable en el documento)
OPS/OMS Bolivia — *"Diálogo Médico-Paciente en Quechua"*, La Paz, 2013.
Revisor de la traducción: **Diether Flores Chumacero**. Coordinación técnica OPS/OMS: Hugo Rivera, Susana Hannover.

> Nota: la extracción fue automática desde el PDF oficial. La mayoría está perfecta, pero algunas frases largas pueden tener pequeños errores de formato — por eso la revisión del hablante nativo es importante.
