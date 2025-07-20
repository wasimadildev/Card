import * as XLSX from 'xlsx';
import { FormData } from '@/contexts/AppContext';

export const exportToCSV = (data: FormData[]) => {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  // Transform data for export
  const exportData = data.map(submission => ({
    'ID': submission.id,
    'Rep': submission.rep,
    'Relevancy': submission.relevancy,
    'Company Name': submission.companyName,
    'First Name': submission.firstName,
    'Last Name': submission.lastName,
    'Email': submission.email,
    'Phone': submission.phone,
    'WhatsApp': submission.whatsapp,
    'Partner Details': submission.partnerDetails.join(', '),
    'Target Regions': submission.targetRegions.join(', '),
    'Line of Business': submission.lob,
    'Tier': submission.tier,
    'Grades': submission.grades,
    'Volume': submission.volume,
    'Add Associates': submission.addAssociates ? 'Yes' : 'No',
    'Notes': submission.notes,
    'Submitted At': new Date(submission.submittedAt).toISOString(),
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Business Contacts');

  // Generate CSV and download
  const csvOutput = XLSX.utils.sheet_to_csv(ws);
  downloadFile(csvOutput, 'business-contacts.csv', 'text/csv');
};

export const exportToExcel = (data: FormData[]) => {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  // Transform data for export
  const exportData = data.map(submission => ({
    'ID': submission.id,
    'Rep': submission.rep,
    'Relevancy': submission.relevancy,
    'Company Name': submission.companyName,
    'First Name': submission.firstName,
    'Last Name': submission.lastName,
    'Email': submission.email,
    'Phone': submission.phone,
    'WhatsApp': submission.whatsapp,
    'Partner Details': submission.partnerDetails.join(', '),
    'Target Regions': submission.targetRegions.join(', '),
    'Line of Business': submission.lob,
    'Tier': submission.tier,
    'Grades': submission.grades,
    'Volume': submission.volume,
    'Add Associates': submission.addAssociates ? 'Yes' : 'No',
    'Notes': submission.notes,
    'Submitted At': new Date(submission.submittedAt).toLocaleString(),
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Auto-size columns
  const colWidths = Object.keys(exportData[0] || {}).map(key => {
    const maxLength = Math.max(
      key.length,
      ...exportData.map(row => String(row[key as keyof typeof row] || '').length)
    );
    return { wch: Math.min(maxLength + 2, 50) };
  });
  ws['!cols'] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Business Contacts');

  // Add summary sheet
  const summaryData = [
    { Metric: 'Total Submissions', Value: data.length },
    { Metric: 'Unique Companies', Value: new Set(data.map(d => d.companyName)).size },
    { Metric: 'High Relevancy', Value: data.filter(d => d.relevancy === 'High').length },
    { Metric: 'Medium Relevancy', Value: data.filter(d => d.relevancy === 'Medium').length },
    { Metric: 'Low Relevancy', Value: data.filter(d => d.relevancy === 'Low').length },
    { Metric: 'Partners with Associates', Value: data.filter(d => d.addAssociates).length },
  ];

  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  summaryWs['!cols'] = [{ wch: 25 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

  // Generate Excel file and download
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `business-contacts-${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const downloadFile = (content: string, filename: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Export individual submission
export const exportSingleSubmission = (submission: FormData, format: 'csv' | 'excel' = 'excel') => {
  if (format === 'csv') {
    exportToCSV([submission]);
  } else {
    exportToExcel([submission]);
  }
};

// Export filtered data
export const exportFilteredData = (
  allData: FormData[], 
  filters: {
    relevancy?: string;
    dateFrom?: Date;
    dateTo?: Date;
    company?: string;
  },
  format: 'csv' | 'excel' = 'excel'
) => {
  let filteredData = allData;

  if (filters.relevancy) {
    filteredData = filteredData.filter(d => d.relevancy === filters.relevancy);
  }

  if (filters.dateFrom) {
    filteredData = filteredData.filter(d => new Date(d.submittedAt) >= filters.dateFrom!);
  }

  if (filters.dateTo) {
    filteredData = filteredData.filter(d => new Date(d.submittedAt) <= filters.dateTo!);
  }

  if (filters.company) {
    filteredData = filteredData.filter(d => 
      d.companyName.toLowerCase().includes(filters.company!.toLowerCase())
    );
  }

  if (format === 'csv') {
    exportToCSV(filteredData);
  } else {
    exportToExcel(filteredData);
  }
};