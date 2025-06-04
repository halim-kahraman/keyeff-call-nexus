import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// PDF Export für echte Datenbank-Daten
export const exportToPdf = (data: any[], title: string, filename: string) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text(title, 20, 20);
  
  // Datum
  doc.setFontSize(10);
  doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 20, 30);
  
  if (!data || data.length === 0) {
    doc.setFontSize(12);
    doc.text('Keine Daten verfügbar', 20, 50);
    doc.save(`${filename}.pdf`);
    return;
  }

  // Tabelle basierend auf echten Daten
  if (title.includes('Statistiken')) {
    const stats = data[0];
    autoTable(doc, {
      startY: 40,
      head: [['Kategorie', 'Wert']],
      body: [
        ['Anrufe gesamt', stats.summary?.total_calls || 0],
        ['Termine gesamt', stats.summary?.total_appointments || 0],
        ['Kontaktierte Kunden', stats.summary?.total_customers_contacted || 0],
        ['Erfolgsquote', `${stats.summary?.success_rate || 0}%`]
      ],
    });
  } else if (title.includes('Benutzer')) {
    autoTable(doc, {
      startY: 40,
      head: [['Name', 'E-Mail', 'Rolle', 'Filiale']],
      body: data.map(user => [
        user.name || '',
        user.email || '',
        user.role || '',
        user.filiale_name || user.filiale || ''
      ]),
    });
  } else if (title.includes('Kunden')) {
    autoTable(doc, {
      startY: 40,
      head: [['Name', 'Telefon', 'E-Mail', 'Firma', 'Status']],
      body: data.map(customer => [
        customer.name || '',
        customer.primary_phones || '',
        customer.email || '',
        customer.company || '',
        customer.contract_statuses || ''
      ]),
    });
  } else {
    // Allgemeine Tabelle für andere Datentypen
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      autoTable(doc, {
        startY: 40,
        head: [headers],
        body: data.map(item => headers.map(header => item[header] || '')),
      });
    }
  }
  
  doc.save(`${filename}.pdf`);
};

// Excel Export für echte Datenbank-Daten
export const exportToExcel = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    // Leere Datei mit Hinweis
    const emptyData = [{ 'Hinweis': 'Keine Daten verfügbar' }];
    const ws = XLSX.utils.json_to_sheet(emptyData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Daten');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}.xlsx`);
    return;
  }

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Daten');
  
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
};

// CSV Export für echte Datenbank-Daten
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    const csv = 'Hinweis\nKeine Daten verfügbar';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
};

export const sendDataByEmail = async (data: any[], filename: string, email: string) => {
  // Implementation for sending data by email
  console.log('Sending data by email:', { filename, email, dataCount: data.length });
  // This would typically integrate with your email service
  return Promise.resolve(true);
};
