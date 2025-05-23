
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
// Import jspdf-autotable as a plugin
import 'jspdf-autotable';
import { toast } from 'sonner';

// Add type declaration for jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * Exports data to a PDF file
 * @param data The data to be exported
 * @param filename The name of the file to be saved
 * @param title Title for the document
 */
export const exportToPdf = async (data: any[], filename: string, title: string) => {
  try {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    // Get columns from data
    if (data.length > 0) {
      const columns = Object.keys(data[0]);
      
      // Format data for autoTable
      const tableData = data.map(item => Object.values(item));
      
      // Add table to PDF
      doc.autoTable({
        head: [columns],
        body: tableData,
        startY: 30,
        headStyles: {
          fillColor: [66, 133, 244],
          textColor: 255
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        }
      });
      
      // Save the PDF
      doc.save(`${filename}.pdf`);
      
      toast.success("Die Daten wurden als PDF exportiert.");
    } else {
      // If no data, create simple PDF with title
      doc.text("Keine Daten verfügbar", 14, 30);
      doc.save(`${filename}.pdf`);
      
      toast.success("Leeres PDF wurde exportiert, da keine Daten vorhanden sind.");
    }
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
