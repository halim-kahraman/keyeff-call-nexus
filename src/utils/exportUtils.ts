import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'sonner';

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
      const tableData = data.map((item) => Object.values(item));
      
      // Add table to PDF
      (doc as any).autoTable({
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
export const exportToExcel = (data: any[], filename: string, sheetName = "Daten") => {
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

/**
 * Formats statistics data for export
 * @param stats Statistics data object
 * @param period Time period string
 * @returns Formatted data array for export
 */
export const formatStatisticsForExport = (stats: any, period: string): any[] => {
  if (!stats) return [];
  
  const exportData: any[] = [];
  
  // Summary data
  exportData.push({
    "Bereich": "Zusammenfassung",
    "Element": "Zeitraum",
    "Wert": period
  });
  
  exportData.push({
    "Bereich": "Zusammenfassung",
    "Element": "Gesamtanrufe",
    "Wert": stats.summary.total_calls
  });
  
  exportData.push({
    "Bereich": "Zusammenfassung",
    "Element": "Vereinbarte Termine",
    "Wert": stats.summary.total_appointments
  });
  
  exportData.push({
    "Bereich": "Zusammenfassung",
    "Element": "Kontaktierte Kunden",
    "Wert": stats.summary.total_customers_contacted
  });
  
  // Calls by day
  if (stats.calls_by_day && stats.calls_by_day.length > 0) {
    stats.calls_by_day.forEach((day: any) => {
      exportData.push({
        "Bereich": "Anrufe pro Tag",
        "Element": day.day,
        "Wert": day.total_calls,
        "Dauer": formatDuration(day.total_duration),
        "Durchschnitt": formatDuration(day.avg_duration)
      });
    });
  }
  
  // Calls by outcome
  if (stats.calls_by_outcome && stats.calls_by_outcome.length > 0) {
    stats.calls_by_outcome.forEach((outcome: any) => {
      exportData.push({
        "Bereich": "Anrufergebnisse",
        "Element": formatOutcome(outcome.outcome),
        "Wert": outcome.count
      });
    });
  }
  
  // Top callers
  if (stats.top_callers && stats.top_callers.length > 0) {
    stats.top_callers.forEach((caller: any) => {
      exportData.push({
        "Bereich": "Top Telefonisten",
        "Element": caller.name,
        "Anrufe": caller.total_calls,
        "Gesamtdauer": formatDuration(caller.total_duration),
        "Durchschnitt": formatDuration(caller.avg_duration)
      });
    });
  }
  
  // Appointments by type
  if (stats.appointments_by_type && stats.appointments_by_type.length > 0) {
    stats.appointments_by_type.forEach((apt: any) => {
      exportData.push({
        "Bereich": "Termine nach Typ",
        "Element": apt.type,
        "Wert": apt.count
      });
    });
  }
  
  // Filiale stats
  if (stats.filiale_stats && stats.filiale_stats.length > 0) {
    stats.filiale_stats.forEach((filiale: any) => {
      exportData.push({
        "Bereich": "Filialstatistiken",
        "Element": filiale.name,
        "Mitarbeiter": filiale.total_users,
        "Anrufe": filiale.total_calls,
        "Termine": filiale.total_appointments,
        "Durchschnitt": formatDuration(filiale.avg_call_duration)
      });
    });
  }
  
  return exportData;
};

/**
 * Format outcome labels
 * @param outcome Outcome code
 * @returns Formatted outcome string
 */
export const formatOutcome = (outcome: string): string => {
  const outcomeMap: Record<string, string> = {
    "interested": "Interessiert",
    "callback": "Rückruf",
    "no_answer": "Nicht erreicht",
    "not_interested": "Kein Interesse",
    "appointment": "Termin"
  };
  
  return outcomeMap[outcome] || outcome;
};

/**
 * Exports statistics to PDF including charts
 * @param statsData The statistics data
 * @param filename The name of the file to be saved
 * @param title Title for the document
 * @param charts Optional array of chart image data URLs
 */
export const exportStatisticsToPdf = async (statsData: any, filename: string, title: string, charts: string[] = []) => {
  try {
    // Create new PDF document - landscape for better chart display
    const doc = new jsPDF({
      orientation: 'landscape'
    });
    
    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    // Add period information
    if (statsData.summary?.period) {
      const period = `Zeitraum: ${statsData.summary.period.start} bis ${statsData.summary.period.end}`;
      doc.setFontSize(12);
      doc.text(period, 14, 30);
    }
    
    // Add summary data
    doc.setFontSize(14);
    doc.text("Zusammenfassung", 14, 40);
    
    const summaryData = [
      ["Gesamtanrufe", statsData.summary?.total_calls?.toString() || "0"],
      ["Vereinbarte Termine", statsData.summary?.total_appointments?.toString() || "0"],
      ["Kontaktierte Kunden", statsData.summary?.total_customers_contacted?.toString() || "0"]
    ];
    
    (doc as any).autoTable({
      startY: 45,
      head: [["Kennzahl", "Wert"]],
      body: summaryData,
      theme: 'grid',
      headStyles: {
        fillColor: [66, 133, 244],
        textColor: 255
      }
    });
    
    let yPosition = (doc as any).lastAutoTable.finalY + 15;
    
    // Add charts if available
    if (charts && charts.length > 0) {
      doc.setFontSize(14);
      doc.text("Diagramme", 14, yPosition);
      yPosition += 10;
      
      for (let i = 0; i < charts.length; i++) {
        if (yPosition > 180) {
          doc.addPage();
          yPosition = 20;
        }
        
        try {
          doc.addImage(
            charts[i],
            'PNG',
            14,
            yPosition,
            180,
            70
          );
          yPosition += 80;
        } catch (e) {
          console.error("Error adding chart to PDF:", e);
        }
      }
    }
    
    // Add detailed data tables
    if (statsData.calls_by_day && statsData.calls_by_day.length > 0) {
      if (yPosition > 180) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.text("Anrufe nach Tagen", 14, yPosition);
      
      const callsByDayData = statsData.calls_by_day.map((day: any) => [
        day.day,
        day.total_calls,
        formatDuration(day.avg_duration)
      ]);
      
      (doc as any).autoTable({
        startY: yPosition + 5,
        head: [["Datum", "Anrufe", "Durchschnittsdauer"]],
        body: callsByDayData,
        theme: 'grid',
        headStyles: {
          fillColor: [66, 133, 244],
          textColor: 255
        }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }
    
    if (statsData.top_callers && statsData.top_callers.length > 0) {
      if (yPosition > 180) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.text("Top Telefonisten", 14, yPosition);
      
      const topCallersData = statsData.top_callers.map((caller: any) => [
        caller.name,
        caller.total_calls,
        formatDuration(caller.avg_duration)
      ]);
      
      (doc as any).autoTable({
        startY: yPosition + 5,
        head: [["Name", "Anrufe", "Durchschnittsdauer"]],
        body: topCallersData,
        theme: 'grid',
        headStyles: {
          fillColor: [66, 133, 244],
          textColor: 255
        }
      });
    }
    
    // Save the PDF
    doc.save(`${filename}.pdf`);
    toast.success("Die Statistiken wurden als PDF exportiert.");
  } catch (error) {
    console.error("Statistics PDF Export error:", error);
    toast.error("Beim Exportieren der Statistiken ist ein Fehler aufgetreten.");
  }
};

/**
 * Captures charts as images for PDF export
 * @returns Promise with array of chart image data URLs
 */
export const captureChartsForExport = async (): Promise<string[]> => {
  try {
    const chartImages: string[] = [];
    
    // Find all chart containers with the recharts class
    const chartContainers = document.querySelectorAll('.recharts-wrapper');
    
    // Convert each chart to an image using html2canvas
    for (let i = 0; i < chartContainers.length; i++) {
      try {
        // We're using a dynamic import for html2canvas to avoid loading it unless needed
        const html2canvasModule = await import('html2canvas');
        const html2canvas = html2canvasModule.default;
        
        const canvas = await html2canvas(chartContainers[i] as HTMLElement, {
          backgroundColor: '#ffffff',
          scale: 2, // Higher quality
          logging: false
        });
        
        const imageData = canvas.toDataURL('image/png');
        chartImages.push(imageData);
      } catch (e) {
        console.error("Error capturing chart:", e);
      }
    }
    
    return chartImages;
  } catch (e) {
    console.error("Error in chart capture:", e);
    return [];
  }
};
