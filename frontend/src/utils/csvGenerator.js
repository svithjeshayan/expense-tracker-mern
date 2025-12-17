export const downloadCSV = (data, filename = 'expenses.csv') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Define headers
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Payment Method'];

  // Convert data to CSV rows
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(item => {
      return [
        `"${new Date(item.date).toLocaleDateString()}"`,
        `"${item.description || ''}"`,
        `"${item.category}"`,
        `"${item.type}"`,
        `"${item.amount}"`,
        `"${item.paymentMethod || 'Cash'}"`
      ].join(',');
    })
  ].join('\n');

  // Create text blob
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
