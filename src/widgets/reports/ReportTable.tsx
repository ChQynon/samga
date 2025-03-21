import React, { FC, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import ResponsiveModal from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { ReportCard } from '@/shared/types'
import ReportDetails from '@/widgets/reports/ReportDetails'
import { ArrowDown, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { useToast } from '@/lib/providers/ToastProvider'
import { useState } from 'react'

const ReportTable: FC<{ reportCard?: ReportCard[number] }> = ({
  reportCard,
}) => {
  const { showToast } = useToast();
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  
  if (!reportCard) return <></>

  const calculatedGPA = useMemo(() => {
    let sum = 0
    let count = 0

    reportCard.reportCard.forEach((report) => {
      const yearMark = Number(report.yearMark?.ru)
      if (!isNaN(yearMark)) {
        sum += yearMark
        count++
      }
    })

    return count !== 0 ? sum / count : 0
  }, [reportCard])

  const handleExportExcel = async () => {
    if (!reportCard) return;
    
    try {
      setLoadingExcel(true);
      showToast('Подготовка Excel-файла...', 'info');
      
      // Небольшая задержка для возможности отрисовки UI
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const data = [
        ['Предмет', 'I четверть', 'II четверть', 'III четверть', 'IV четверть', 'Годовая'],
        ...reportCard.reportCard.map(report => [
          report.subject.name.ru,
          report.firstPeriod?.ru || '-',
          report.secondPeriod?.ru || '-',
          report.thirdPeriod?.ru || '-',
          report.fourthPeriod?.ru || '-',
          report.yearMark?.ru || '-'
        ]),
        ['Итоговый GPA', '', '', '', '', calculatedGPA ? calculatedGPA.toFixed(2) : 'Н/Д']
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Табель');
      
      // Настраиваем ширину столбцов для каждой колонки
      const cols = [
        { wch: Math.max(...data.map(r => r[0]?.toString().length || 0), 10) }, // Предмет
        { wch: 12 }, // I четверть
        { wch: 12 }, // II четверть
        { wch: 12 }, // III четверть
        { wch: 12 }, // IV четверть
        { wch: 12 }  // Годовая
      ];
      worksheet['!cols'] = cols;
      
      // Конвертируем в бинарную строку
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const fileName = `Табель_${reportCard.schoolYear.name.ru}.xlsx`;
      
      // Создаем Blob и сохраняем файл
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Используем файловый API для более надежного скачивания
      const downloadLink = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      downloadLink.href = url;
      downloadLink.download = fileName;
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      
      downloadLink.click();
      
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
        showToast('Excel-файл успешно скачан', 'success');
        setLoadingExcel(false);
      }, 100);
      
    } catch (error) {
      console.error('Ошибка при создании Excel:', error);
      showToast('Ошибка при создании Excel-файла', 'error');
      setLoadingExcel(false);
    }
  };

  const handleExportPDF = async () => {
    if (!reportCard) return;
    
    try {
      setLoadingPDF(true);
      showToast('Подготовка PDF-файла...', 'info');
      
      // Небольшая задержка для возможности отрисовки UI
      await new Promise(resolve => setTimeout(resolve, 100));

      const doc = new jsPDF();
      
      // Добавляем заголовок
      doc.setFontSize(18);
      doc.text(`Табель успеваемости: ${reportCard.schoolYear.name.ru}`, 14, 22);
      
      // Подготавливаем данные для таблицы
      const tableData = reportCard.reportCard.map(report => [
        report.subject.name.ru,
        report.firstPeriod?.ru || '-',
        report.secondPeriod?.ru || '-',
        report.thirdPeriod?.ru || '-',
        report.fourthPeriod?.ru || '-',
        report.yearMark?.ru || '-'
      ]);
      
      // Добавляем GPA
      tableData.push(['Итоговый GPA', '', '', '', '', calculatedGPA ? calculatedGPA.toFixed(2) : 'Н/Д']);
      
      // Создаем таблицу с использованием autoTable
      // @ts-ignore - jspdf-autotable расширяет jsPDF прототип
      doc.autoTable({
        startY: 30,
        head: [['Предмет', 'I', 'II', 'III', 'IV', 'Год']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [66, 139, 202], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 240] }
      });
      
      // Добавляем информацию о сайте
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(10);
      doc.text('Сгенерировано на samga.nis', 14, pageHeight - 15);
      doc.text(`Дата: ${new Date().toLocaleDateString()}`, 14, pageHeight - 10);
      
      // Используем blob для более надежного скачивания
      const pdfBlob = doc.output('blob');
      const fileName = `Табель_${reportCard.schoolYear.name.ru}.pdf`;
      
      const downloadLink = document.createElement('a');
      const url = URL.createObjectURL(pdfBlob);
      
      downloadLink.href = url;
      downloadLink.download = fileName;
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      
      downloadLink.click();
      
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
        showToast('PDF-файл успешно скачан', 'success');
        setLoadingPDF(false);
      }, 100);
      
    } catch (error) {
      console.error('Ошибка при создании PDF:', error);
      showToast('Ошибка при создании PDF-файла', 'error');
      setLoadingPDF(false);
    }
  };

  return (
    <div>
      <div className="mt-4 flex flex-wrap gap-2 sm:justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={handleExportExcel}
          disabled={loadingExcel}
        >
          {loadingExcel ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-4 w-4" />
          )}
          <span>{loadingExcel ? 'Скачивание...' : 'Скачать в Excel'}</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
          onClick={handleExportPDF}
          disabled={loadingPDF}
        >
          {loadingPDF ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          <span>{loadingPDF ? 'Скачивание...' : 'Скачать в PDF'}</span>
        </Button>
      </div>

      <Table className="mt-5 overflow-x-auto border-[1px] sm:border-0">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[150px]">Предмет</TableHead>
            <TableHead className="min-w-[75px]">I</TableHead>
            <TableHead className="min-w-[75px]">II </TableHead>
            <TableHead className="min-w-[75px]">III</TableHead>
            <TableHead className="min-w-[75px]">IV</TableHead>
            <TableHead className="min-w-[75px]">Год</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reportCard?.reportCard.map((report) => (
            <ResponsiveModal
              trigger={
                <TableRow key={`report-${report.subject.id}`}>
                  <TableCell>
                    <span className="hover:underline">
                      {report.subject.name.ru}
                    </span>
                  </TableCell>
                  <TableCell>
                    <FormattedMark mark={report.firstPeriod?.ru} />
                  </TableCell>
                  <TableCell>
                    <FormattedMark mark={report.secondPeriod?.ru} />
                  </TableCell>
                  <TableCell>
                    <FormattedMark mark={report.thirdPeriod?.ru} />
                  </TableCell>
                  <TableCell>
                    <FormattedMark mark={report.fourthPeriod?.ru} />
                  </TableCell>
                  <TableCell>
                    <FormattedMark mark={report.yearMark?.ru} />
                  </TableCell>
                </TableRow>
              }
              title={
                <span className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl">
                  {report.subject.name.ru}
                </span>
              }
              description={<span>{reportCard?.schoolYear.name.ru}</span>}
              close={<Button variant="outline">Закрыть</Button>}
              key={`report-modal-${report.subject.id}`}
            >
              <ReportDetails report={report} />
            </ResponsiveModal>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={5}>Итог. GPA</TableCell>
            <TableCell>
              <span className="text-[18px] font-bold">
                {calculatedGPA ? calculatedGPA.toFixed(2) : 'Н/Д'}
              </span>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}

export const FormattedMark = ({ mark }: { mark?: string }) => {
  if (!mark) return <span className="text-muted-foreground">-</span>

  const formattedMark = Number(mark)

  if (isNaN(formattedMark)) return <span>{mark.toUpperCase()}</span>

  let textColor = 'text-red-500'
  if (formattedMark === 4) textColor = 'text-yellow-500'
  else if (formattedMark === 5) textColor = 'text-green-500'

  return (
    <span className={`text-[16px] font-extrabold ${textColor}`}>
      {formattedMark}
    </span>
  )
}

export default React.memo(ReportTable)
