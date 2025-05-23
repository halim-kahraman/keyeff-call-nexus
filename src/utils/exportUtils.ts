
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

/**
 * Exports data to a PDF file
 * @param data The data to be exported
 * @param filename The name of the file to be saved
 * @param title Title for the document
 */
export const exportToPdf = async (data: any[], filename: string, title: string) => {
  try {
    // Since we don't have a direct PDF generation library, we'll use an alternative approach
    // Here we'll simulate PDF export temporarily until properly implemented
    
    // Create a temporary text representation of the data
    let textContent = `${title}\n\n`;
    
    // Add headers
    if (data.length > 0) {
      textContent += Object.keys(data[0]).join('\t') + '\n';
      
      // Add data rows
      data.forEach(row => {
        textContent += Object.values(row).join('\t') + '\n';
      });
    }
    
    // Create a blob from the text content
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    
    // Save the file
    saveAs(blob, `${filename}.txt`);
    
    toast.success("Daten wurden exportiert. PDF-Funktionalität wird in Kürze vollständig implementiert.");
    
    // In a real implementation, you would use jsPDF or another PDF library
  } catch (error) {
    console.error("PDF Export error:", error);
    toast.error("Beim Exportieren der Daten ist ein Fehler aufgetreten.");
  }
};

/**
 * Exports data to an Excel file
 * @param data The data to be exported
 * @param filename The name of the file to be saved
 * @param sheetName Name for the worksheet
 */
export const exportToExcel = (data: any[], filename: string, sheetName: string = "Daten") => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Save the file
    saveAs(blob, `${filename}.xlsx`);
    
    toast.success("Die Daten wurden erfolgreich als Excel-Datei exportiert.");
  } catch (error) {
    console.error("Excel Export error:", error);
    toast.error("Beim Exportieren der Daten ist ein Fehler aufgetreten.");
  }
};

/**
 * Sends data as an email attachment
 * @param data The data to be sent
 * @param emailAddress Recipient email address
 * @param subject Email subject
 * @param message Email message body
 */
export const sendDataByEmail = async (data: any[], emailAddress: string, subject: string, message: string) => {
  try {
    // For demonstration purposes, we'll show a success message
    // In a real implementation, this would send the data to a backend API
    
    // Create a temporary Excel file in memory
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daten");
    
    // Show a success message
    toast.success(`Daten würden an ${emailAddress} gesendet werden. Diese Funktion wird in Kürze implementiert.`);
    
    // In a real implementation, you would call your API endpoint to send the email
  } catch (error) {
    console.error("Email sending error:", error);
    toast.error("Beim Versenden der E-Mail ist ein Fehler aufgetreten.");
  }
};

/**
 * Formats time duration in hours, minutes, and seconds
 * @param seconds Total duration in seconds
 * @returns Formatted time string
 */
export const formatDuration = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) {
    return '0 Sek.';
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours} h ${minutes} Min. ${remainingSeconds} Sek.`;
  } else if (minutes > 0) {
    return `${minutes} Min. ${remainingSeconds} Sek.`;
  } else {
    return `${remainingSeconds} Sek.`;
  }
};
