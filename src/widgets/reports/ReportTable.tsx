import React, { FC, useEffect, useMemo, useState } from 'react'
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
import { useState as useStateImport } from 'react'

// Выносим компонент FormattedMark наверх
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

// Создаем мемоизированный компонент строки таблицы для оптимизации рендеринга
const MemoizedTableRow = React.memo(({ report }: { report: any }) => (
  <TableRow>
    <TableCell>{report.subject.name.ru}</TableCell>
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
))

MemoizedTableRow.displayName = 'MemoizedTableRow';

const ReportTable: FC<{ reportCard?: ReportCard[number] }> = ({
  reportCard,
}) => {
  const { showToast } = useToast();
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  
  // Упрощаем анимацию - используем только одно состояние для отображения
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Ускоряем появление данных
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);
  
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

  // Функции экспорта
  const handleExportExcel = async () => {
    try {
      setLoadingExcel(true);
      
      // Создаем рабочую книгу Excel
      const wb = XLSX.utils.book_new();
      
      // Подготовка данных для Excel
      const wsData = [
        ["Предмет", "I", "II", "III", "IV", "Год"],
        ...reportCard.reportCard.map(report => [
          report.subject.name.ru,
          report.firstPeriod?.ru || "-",
          report.secondPeriod?.ru || "-",
          report.thirdPeriod?.ru || "-",
          report.fourthPeriod?.ru || "-",
          report.yearMark?.ru || "-"
        ]),
        ["Итог. GPA", "", "", "", "", calculatedGPA.toFixed(2)]
      ];
      
      // Создаем страницу с данными
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // Добавляем страницу в книгу
      XLSX.utils.book_append_sheet(wb, ws, "Табель успеваемости");
      
      // Сохраняем файл
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      saveAs(data, `Табель_${reportCard.schoolYear.name.ru}_${new Date().toLocaleDateString()}.xlsx`);
      
      showToast('Файл Excel успешно скачан', 'success');
    } catch (error) {
      console.error("Ошибка при экспорте в Excel:", error);
      showToast('Не удалось сгенерировать Excel файл', 'error');
    } finally {
      setLoadingExcel(false);
    }
  };
  
  const handleExportPDF = async () => {
    try {
      setLoadingPDF(true);
      
      // Создаем PDF документ
      const pdf = new jsPDF();
      
      // Добавляем заголовок
      pdf.setFontSize(18);
      pdf.text("Табель успеваемости", 14, 22);
      
      // Добавляем учебный год
      pdf.setFontSize(12);
      pdf.text(`Учебный год: ${reportCard.schoolYear.name.ru}`, 14, 30);
      
      // Создаем таблицу
      // @ts-ignore
      pdf.autoTable({
        startY: 35,
        head: [["Предмет", "I", "II", "III", "IV", "Год"]],
        body: [
          ...reportCard.reportCard.map(report => [
            report.subject.name.ru,
            report.firstPeriod?.ru || "-",
            report.secondPeriod?.ru || "-",
            report.thirdPeriod?.ru || "-",
            report.fourthPeriod?.ru || "-",
            report.yearMark?.ru || "-"
          ]),
          ["Итог. GPA", "", "", "", "", calculatedGPA.toFixed(2)]
        ],
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        footStyles: { fillColor: [234, 236, 238], textColor: [0, 0, 0], fontStyle: 'bold' }
      });
      
      // Сохраняем PDF
      pdf.save(`Табель_${reportCard.schoolYear.name.ru}_${new Date().toLocaleDateString()}.pdf`);
      
      showToast('Файл PDF успешно скачан', 'success');
    } catch (error) {
      console.error("Ошибка при экспорте в PDF:", error);
      showToast('Не удалось сгенерировать PDF файл', 'error');
    } finally {
      setLoadingPDF(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className={`flex flex-col sm:flex-row sm:justify-end gap-2 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleExportExcel}
          disabled={loadingExcel}
        >
          {loadingExcel ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-4 w-4" />
          )}
          <span className="hidden sm:inline-block">Excel</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleExportPDF}
          disabled={loadingPDF}
        >
          {loadingPDF ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          <span className="hidden sm:inline-block">PDF</span>
        </Button>
      </div>

      <div 
        className={`relative mt-5 overflow-hidden rounded-md border sm:border-0 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Table className="overflow-x-auto">
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
            {reportCard.reportCard.map((report, index) => (
              <MemoizedTableRow key={`report-${report.subject.id}-${index}`} report={report} />
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="transition-opacity duration-300">
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
    </div>
  )
}

export default ReportTable
