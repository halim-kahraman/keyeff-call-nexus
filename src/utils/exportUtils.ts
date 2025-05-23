
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from '@/hooks/use-toast';

/**
 * Exports data to a PDF file
 * @param data The data to be exported
 * @param filename The name of the file to be saved
 * @param title Title for the document
 */
export const exportToPdf = async (data: any[], filename: string, title: string) => {
  try {
    // Since we don't have a direct PDF generation library, we'll use an alternative approach
    // Here we'll show a notification that this feature is in development
    toast({
      title: "PDF Export",
      description: "Diese Funktion wird gerade implementiert. Bitte versuchen Sie es später erneut."
    });
    
    // In a real implementation, you would use a library like jsPDF or pdfmake
    // Example with jsPDF would be:
    /*
    import { jsPDF } from 'jspdf';
    import 'jspdf-autotable';
    
    const doc = new jsPDF();
    doc.text(title, 14, 22);
    doc.autoTable({
      head: [Object.keys(data[0])],
      body: data.map(item => Object.values(item)),
      startY: 30,
    });
    
    doc.save(`${filename}.pdf`);
    */
  } catch (error) {
    console.error("PDF Export error:", error);
    toast({
      title: "Export Fehler",
      description: "Beim Exportieren der Daten ist ein Fehler aufgetreten.",
      variant: "destructive"
    });
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
    
    toast({
      title: "Export erfolgreich",
      description: `Die Daten wurden erfolgreich als Excel-Datei exportiert.`
    });
  } catch (error) {
    console.error("Excel Export error:", error);
    toast({
      title: "Export Fehler",
      description: "Beim Exportieren der Daten ist ein Fehler aufgetreten.",
      variant: "destructive"
    });
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
    // Here we would typically call a backend API to send the email with the data
    // Since we don't have that implemented, we'll show a notification
    toast({
      title: "E-Mail wird gesendet",
      description: "Diese Funktion wird gerade implementiert. Bitte versuchen Sie es später erneut."
    });
    
    // In a real implementation, you would call your API endpoint:
    /*
    const response = await fetch('/api/sendEmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: emailAddress,
        subject,
        message,
        data
      })
    });
    
    if (!response.ok) {
      throw new Error('Email sending failed');
    }
    
    toast({
      title: "E-Mail gesendet",
      description: `Die Daten wurden erfolgreich an ${emailAddress} gesendet.`
    });
    */
  } catch (error) {
    console.error("Email sending error:", error);
    toast({
      title: "Fehler beim E-Mail-Versand",
      description: "Beim Versenden der E-Mail ist ein Fehler aufgetreten.",
      variant: "destructive"
    });
  }
};
