/**
 * Utility functions for CSV handling in the Tarot Pairs application
 */

/**
 * Parse a CSV string into an array of objects
 * @param {string} csvText - The CSV text to parse
 * @returns {Object} - Object containing headers array and data array
 */
export const parseCSV = (csvText) => {
  try {
    // Split the CSV into rows
    const rows = csvText.split('\n');
    if (rows.length === 0) return { headers: [], data: [] };
    
    // Process the header row
    const headers = parseCSVRow(rows[0]);
    
    // Process data rows
    const data = [];
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue;
      
      const values = parseCSVRow(rows[i]);
      if (values.length === 0) continue;
      
      const rowData = {};
      headers.forEach((header, index) => {
        if (index < values.length) {
          rowData[header] = values[index];
        }
      });
      
      data.push(rowData);
    }
    
    return { headers, data };
  } catch (error) {
    console.error("Error parsing CSV:", error);
    throw new Error(`Failed to parse CSV: ${error.message}`);
  }
};

/**
 * Parse a single CSV row handling quoted fields properly
 * @param {string} row - A single row from a CSV file
 * @returns {Array} - Array of field values
 */
export const parseCSVRow = (row) => {
  const fields = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row.charAt(i);
    
    if (char === '"') {
      // Handle quoted fields
      if (inQuotes && i + 1 < row.length && row.charAt(i + 1) === '"') {
        // Double quotes inside quoted field = escaped quote
        currentField += '"';
        i++; // Skip the next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      fields.push(currentField);
      currentField = '';
    } else {
      // Regular character
      currentField += char;
    }
  }
  
  // Add the last field
  fields.push(currentField);
  
  return fields;
};

/**
 * Convert an array of objects to CSV format
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Optional array of headers (keys) to include
 * @returns {string} - CSV formatted string
 */
export const objectsToCSV = (data, headers = null) => {
  if (!data || data.length === 0) return '';
  
  // Determine headers if not provided
  if (!headers) {
    headers = Object.keys(data[0]);
  }
  
  // Create CSV header row
  const csvRows = [
    headers.map(escapeCSVField).join(',')
  ];
  
  // Create data rows
  data.forEach(item => {
    const row = headers.map(header => {
      return escapeCSVField(item[header]);
    });
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
};

/**
 * Escape a field value for CSV format
 * @param {*} field - Field to escape
 * @returns {string} - Escaped field value
 */
export const escapeCSVField = (field) => {
  if (field === null || field === undefined) return '""';
  
  const stringValue = String(field);
  
  // If the field contains quotes, commas, or newlines, it needs to be quoted
  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
    // Double any quotes in the field
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
};

/**
 * Download data as a CSV file
 * @param {string} csvContent - CSV content to download
 * @param {string} filename - Name for the downloaded file
 */
export const downloadCSV = (csvContent, filename = 'download.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};