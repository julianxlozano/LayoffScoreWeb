import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { QuizResult, AIAnalysis, QuickAnalysis } from "./api";

interface PDFGeneratorOptions {
  result: QuizResult;
  aiAnalysis?: AIAnalysis | null;
  quickAnalysis?: QuickAnalysis | null;
  userName?: string;
  date?: Date;
}

export const generatePDF = async ({
  result,
  aiAnalysis,
  quickAnalysis,
  userName = "Professional",
  date = new Date(),
}: PDFGeneratorOptions) => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // Add logo in upper right corner
  try {
    // We'll use the shield badge SVG converted to base64
    const logoBase64 =
      "data:image/svg+xml;base64," +
      btoa(`
      <svg width="40" height="40" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:#ff6b6b;stop-opacity:0" />
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill="url(#glow)"/>
        <path d="M32 8 L12 20 L12 36 C12 48 32 56 32 56 C32 56 52 48 52 36 L52 20 Z" 
              fill="#ff6b6b" stroke="#ff4444" stroke-width="2"/>
        <path d="M26 24 L26 31 L32 31 L24 40 L24 33 L18 33 L26 24" 
              fill="white" transform="translate(8,0) scale(1.3)"/>
      </svg>
    `);
    pdf.addImage(
      logoBase64,
      "SVG",
      pageWidth - margin - 15,
      margin - 5,
      15,
      15
    );
  } catch (error) {
    console.error("Error adding logo:", error);
  }

  // Add title and branding
  pdf.setFontSize(24);
  pdf.setTextColor(255, 75, 75); // Red color matching our theme
  pdf.text("LayoffScore", margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text("AI Career Risk Assessment Report", margin, yPosition);
  yPosition += 15;

  // Add date and user info
  pdf.setFontSize(10);
  pdf.setTextColor(80, 80, 80);
  pdf.text(`Generated for: ${userName}`, margin, yPosition);
  yPosition += 5;
  pdf.text(
    `Date: ${date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    margin,
    yPosition
  );
  yPosition += 10;

  // Add horizontal line
  pdf.setDrawColor(230, 230, 230);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Score Section
  pdf.setFontSize(18);
  pdf.setTextColor(40, 40, 40);
  pdf.text("Your Risk Score", margin, yPosition);
  yPosition += 10;

  // Score display with color
  const scoreColor = getScoreColor(result.score);
  pdf.setFontSize(36);
  pdf.setTextColor(scoreColor.r, scoreColor.g, scoreColor.b);
  pdf.text(`${result.score}/100`, margin, yPosition);

  pdf.setFontSize(14);
  pdf.setTextColor(80, 80, 80);
  pdf.text(`Risk Level: ${result.risk_level}`, margin + 50, yPosition - 5);
  yPosition += 15;

  // Risk message
  pdf.setFontSize(11);
  pdf.setTextColor(60, 60, 60);
  const messageLines = pdf.splitTextToSize(result.message, contentWidth);
  pdf.text(messageLines, margin, yPosition);
  yPosition += messageLines.length * 5 + 10;

  // Quick Analysis Section (if available)
  if (quickAnalysis && quickAnalysis.quick_report) {
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(16);
    pdf.setTextColor(40, 40, 40);
    pdf.text("Quick Risk Assessment", margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    const quickLines = pdf.splitTextToSize(
      quickAnalysis.quick_report,
      contentWidth
    );
    quickLines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 5;
    });
    yPosition += 10;
  }

  // AI Analysis Section (if available)
  if (aiAnalysis && aiAnalysis.report && aiAnalysis.success !== false) {
    // Add page break if needed
    if (yPosition > pageHeight - 100) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(16);
    pdf.setTextColor(40, 40, 40);
    pdf.text("AI Risk Analysis", margin, yPosition);
    yPosition += 10;

    // Add the main report
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    const reportLines = pdf.splitTextToSize(aiAnalysis.report, contentWidth);

    // Add report text with page breaks as needed
    reportLines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 5;
    });
    yPosition += 10;

    // Add statistics if available
    if (aiAnalysis.statistics && aiAnalysis.statistics.length > 0) {
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(14);
      pdf.setTextColor(40, 40, 40);
      pdf.text("Key Statistics", margin, yPosition);
      yPosition += 8;

      aiAnalysis.statistics.forEach((stat) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(12);
        pdf.setTextColor(255, 75, 75);
        pdf.text(`${stat.value}`, margin, yPosition);

        pdf.setFontSize(10);
        pdf.setTextColor(40, 40, 40);
        pdf.text(` - ${stat.title}`, margin + 20, yPosition);

        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);
        const descLines = pdf.splitTextToSize(
          stat.description,
          contentWidth - 25
        );
        pdf.text(descLines, margin + 5, yPosition + 5);
        yPosition += 5 + descLines.length * 4 + 5;
      });
    }

    // Add vulnerable tasks if available
    if (aiAnalysis.vulnerable_tasks && aiAnalysis.vulnerable_tasks.length > 0) {
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(14);
      pdf.setTextColor(40, 40, 40);
      pdf.text("Vulnerable Tasks", margin, yPosition);
      yPosition += 8;

      aiAnalysis.vulnerable_tasks.forEach((task, index) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(10);
        pdf.setTextColor(200, 50, 50);
        pdf.text(`${index + 1}. ${task.title}`, margin, yPosition);
        yPosition += 5;

        pdf.setFontSize(9);
        pdf.setTextColor(80, 80, 80);
        const taskLines = pdf.splitTextToSize(
          task.description,
          contentWidth - 10
        );
        pdf.text(taskLines, margin + 5, yPosition);
        yPosition += taskLines.length * 4 + 5;
      });
    }

    // Add actionable steps
    if (aiAnalysis.actionable_steps && aiAnalysis.actionable_steps.length > 0) {
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(14);
      pdf.setTextColor(40, 40, 40);
      pdf.text("Your Action Plan", margin, yPosition);
      yPosition += 8;

      aiAnalysis.actionable_steps.forEach((step, index) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(11);
        pdf.setTextColor(50, 150, 50);
        pdf.text(`✓ ${step.title}`, margin, yPosition);
        yPosition += 5;

        pdf.setFontSize(9);
        pdf.setTextColor(80, 80, 80);
        const stepLines = pdf.splitTextToSize(
          step.description,
          contentWidth - 10
        );
        pdf.text(stepLines, margin + 5, yPosition);
        yPosition += stepLines.length * 4;

        if (step.link) {
          pdf.setTextColor(70, 130, 180);
          pdf.textWithLink("Learn more ›", margin + 5, yPosition, {
            url: step.link,
          });
          yPosition += 5;
        }
        yPosition += 5;
      });
    }
  }

  // Add footer on last page
  const totalPages = pdf.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, {
      align: "center",
    });
    pdf.text("© LayoffScore - Confidential Report", margin, pageHeight - 10);
  }

  // Save the PDF
  const fileName = `LayoffScore_Report_${date.toISOString().split("T")[0]}.pdf`;
  pdf.save(fileName);
};

// Helper function to get color based on score
function getScoreColor(score: number): { r: number; g: number; b: number } {
  if (score <= 24) return { r: 76, g: 175, b: 80 }; // Green
  if (score <= 49) return { r: 255, g: 193, b: 7 }; // Yellow
  if (score <= 74) return { r: 255, g: 152, b: 0 }; // Orange
  return { r: 244, g: 67, b: 54 }; // Red
}
