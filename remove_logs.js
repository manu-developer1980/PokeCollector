const fs = require('fs');

function removeConsoleLogs(filePath) {
  try {
    // Leer el archivo
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Eliminar console.log de una sola línea
    content = content.replace(/^\s*console\.log\(.*\);?\s*$/gm, '');
    
    // Eliminar console.log multilínea
    content = content.replace(/console\.log\(\s*[\s\S]*?\);/g, '');
    
    // Guardar el archivo
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log(`Removed console.log statements from ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Archivo a procesar
const filePath = process.argv[2];
if (!filePath) {
  console.error('Please provide a file path');
  process.exit(1);
}

removeConsoleLogs(filePath);
