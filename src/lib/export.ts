import type { CalculationResult } from "@/types/calculator";
import { money, money3, pct } from "@/lib/calculator";

export const exportResultCSV = (result: CalculationResult, label: string) => {
  const rows = [
    ["Metric", "Value"],
    ["Label", label],
    ["Generated At", new Date().toLocaleString()],
    ["", ""],
    ["Blended Revenue / Pack", money3(result.brev)],
    ["Blended Gross Profit / Pack", money3(result.bgpp)],
    ["Blended Gross Margin", pct(result.bgmp)],
    ["Blended Operating Profit / Pack", money3(result.bopp)],
    ["Blended Operating Margin", pct(result.bomp)],
    ["COGS / Pack", money3(result.cogsPerPack)],
    ["Ingredient Cost / Pack", money3(result.avgIngCostPerPack)],
    ["Total Packaging / Pack", money3(result.totalPackagingCostPerPack)],
    ["Overhead / Pack", money3(result.ohPerPack)],
    ["Shipping / Pack (Retail)", money3(result.shipPerPack)],
    ["", ""],
    ["Retail Price", money3(result.retail.price)],
    ["Retail GP / Pack", money3(result.retail.gp)],
    ["Retail GM%", pct(result.retail.gm)],
    ["Retail OP / Pack", money3(result.retail.op)],
    ["Retail OM%", pct(result.retail.om)],
    ["", ""],
    ["Wholesale Price", money3(result.wholesale.price)],
    ["Wholesale GP / Pack", money3(result.wholesale.gp)],
    ["Wholesale GM%", pct(result.wholesale.gm)],
    ["Wholesale OP / Pack", money3(result.wholesale.op)],
    ["Wholesale OM%", pct(result.wholesale.om)],
    ["", ""],
    ["Distributor Price", money3(result.distributor.price)],
    ["Distributor GP / Pack", money3(result.distributor.gp)],
    ["Distributor GM%", pct(result.distributor.gm)],
    ["Distributor OP / Pack", money3(result.distributor.op)],
    ["Distributor OM%", pct(result.distributor.om)],
    ["", ""],
    ["Break-Even Retail (packs)", isFinite(result.beUnitsR) ? Math.ceil(result.beUnitsR).toLocaleString() : "Unprofitable"],
    ["Break-Even Wholesale (packs)", isFinite(result.beUnitsW) ? Math.ceil(result.beUnitsW).toLocaleString() : "Unprofitable"],
    ["Break-Even Distributor (packs)", isFinite(result.beUnitsD) ? Math.ceil(result.beUnitsD).toLocaleString() : "Unprofitable"],
    ["Break-Even Blended (packs)", isFinite(result.beUnitsB) ? Math.ceil(result.beUnitsB).toLocaleString() : "Unprofitable"],
    ["", ""],
    ["Total Commissionable Revenue", money(result.commissionResults.totalRevenue)],
    ["Total Commissions Paid", money(result.commissionResults.totalComm)],
    ["Total Bonuses Paid", money(result.commissionResults.totalBonus)],
    ["Commissions as % of Revenue", pct(result.commissionResults.commPctGross)],
  ];

  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `calculator-result-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportPDF = async (result: CalculationResult, label: string) => {
  try {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    const primaryColor: [number, number, number] = [37, 99, 235]; // blue-600

    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Channel Calculator", 14, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Pitch Deck Summary${label ? ` — ${label}` : ""}`, 14, 28);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 160, 28, { align: "right" });

    let y = 45;

    // Executive Summary
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Executive Summary", 14, y);
    y += 8;

    const summaryData = [
      ["Blended Gross Margin", pct(result.bgmp), result.bgmp > 0.3 ? "Strong" : result.bgmp > 0.15 ? "Moderate" : "Thin"],
      ["Break-Even Revenue", money3(result.brev), isFinite(result.beUnitsB) ? `${Math.ceil(result.beUnitsB).toLocaleString()} packs` : "Unprofitable"],
      ["Monthly Volume", result.totalMonthlyVolume.toLocaleString(), "Target: 1,000+ packs"],
      ["COGS / Pack", money3(result.cogsPerPack), result.cogsPerPack < result.retail.price * 0.5 ? "Healthy" : "High"],
    ];

    autoTable(doc, {
      startY: y,
      head: [["Metric", "Value", "Assessment"]],
      body: summaryData,
      theme: "grid",
      headStyles: { fillColor: primaryColor, textColor: 255 },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: "bold" },
        2: { fontStyle: "italic" },
      },
      margin: { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // Channel Profitability
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Channel Profitability", 14, y);
    y += 8;

    const channelData = [
      ["Retail", money3(result.retail.price), money3(result.retail.gp), pct(result.retail.gm), pct(result.retail.om)],
      ["Wholesale", money3(result.wholesale.price), money3(result.wholesale.gp), pct(result.wholesale.gm), pct(result.wholesale.om)],
      ["Distributor", money3(result.distributor.price), money3(result.distributor.gp), pct(result.distributor.gm), pct(result.distributor.om)],
    ];

    autoTable(doc, {
      startY: y,
      head: [["Channel", "Price", "GP/Pack", "GM%", "OM%"]],
      body: channelData,
      theme: "grid",
      headStyles: { fillColor: primaryColor, textColor: 255 },
      styles: { fontSize: 10, cellPadding: 3 },
      margin: { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // Cost Breakdown
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Cost Structure", 14, y);
    y += 8;

    const costData = result.costBreakdown
      .filter((c) => c.value > 0)
      .map((c) => [c.name, money3(c.value), `${((c.value / result.cogsPerPack) * 100).toFixed(1)}%`]);

    autoTable(doc, {
      startY: y,
      head: [["Component", "Cost / Pack", "Share of COGS"]],
      body: costData,
      theme: "grid",
      headStyles: { fillColor: primaryColor, textColor: 255 },
      styles: { fontSize: 10, cellPadding: 3 },
      margin: { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // Break-Even Analysis
    if (y < 250) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Break-Even Analysis", 14, y);
      y += 8;

      const beData = [
        ["Retail", isFinite(result.beUnitsR) ? Math.ceil(result.beUnitsR).toLocaleString() : "Unprofitable", isFinite(result.beRevR) ? money(result.beRevR) : "N/A"],
        ["Wholesale", isFinite(result.beUnitsW) ? Math.ceil(result.beUnitsW).toLocaleString() : "Unprofitable", isFinite(result.beRevW) ? money(result.beRevW) : "N/A"],
        ["Distributor", isFinite(result.beUnitsD) ? Math.ceil(result.beUnitsD).toLocaleString() : "Unprofitable", isFinite(result.beRevD) ? money(result.beRevD) : "N/A"],
        ["Blended", isFinite(result.beUnitsB) ? Math.ceil(result.beUnitsB).toLocaleString() : "Unprofitable", isFinite(result.beRevB) ? money(result.beRevB) : "N/A"],
      ];

      autoTable(doc, {
        startY: y,
        head: [["Channel", "Packs Needed", "Revenue Needed"]],
        body: beData,
        theme: "grid",
        headStyles: { fillColor: primaryColor, textColor: 255 },
        styles: { fontSize: 10, cellPadding: 3 },
        margin: { left: 14, right: 14 },
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text("Generated by Channel Calculator | channelcalc.app", 14, 290);

    doc.save(`pitch-deck-${label || "summary"}-${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (err) {
    console.error("PDF export failed:", err);
    alert("PDF export failed. Please try CSV export instead.");
  }
};

export const exportExcel = async (result: CalculationResult, label: string) => {
  try {
    const XLSX = await import("xlsx");

    const wb = XLSX.utils.book_new();
    const wsData = [
      ["Channel Calculator Report"],
      ["Label", label],
      ["Generated", new Date().toLocaleString()],
      [],
      ["Metric", "Value"],
      ["Blended Revenue / Pack", money3(result.brev)],
      ["Blended Gross Profit / Pack", money3(result.bgpp)],
      ["Blended Gross Margin", pct(result.bgmp)],
      ["Blended Operating Profit / Pack", money3(result.bopp)],
      ["Blended Operating Margin", pct(result.bomp)],
      ["COGS / Pack", money3(result.cogsPerPack)],
      ["Ingredient Cost / Pack", money3(result.avgIngCostPerPack)],
      ["Total Packaging / Pack", money3(result.totalPackagingCostPerPack)],
      ["Overhead / Pack", money3(result.ohPerPack)],
      ["Shipping / Pack (Retail)", money3(result.shipPerPack)],
      [],
      ["Channel", "Price", "GP/Pack", "GM%", "OP/Pack", "OM%"],
      ["Retail", money3(result.retail.price), money3(result.retail.gp), pct(result.retail.gm), money3(result.retail.op), pct(result.retail.om)],
      ["Wholesale", money3(result.wholesale.price), money3(result.wholesale.gp), pct(result.wholesale.gm), money3(result.wholesale.op), pct(result.wholesale.om)],
      ["Distributor", money3(result.distributor.price), money3(result.distributor.gp), pct(result.distributor.gm), money3(result.distributor.op), pct(result.distributor.om)],
      [],
      ["Break-Even Analysis"],
      ["Channel", "Packs Needed", "Revenue Needed"],
      ["Retail", isFinite(result.beUnitsR) ? Math.ceil(result.beUnitsR).toLocaleString() : "Unprofitable", isFinite(result.beRevR) ? money(result.beRevR) : "N/A"],
      ["Wholesale", isFinite(result.beUnitsW) ? Math.ceil(result.beUnitsW).toLocaleString() : "Unprofitable", isFinite(result.beRevW) ? money(result.beRevW) : "N/A"],
      ["Distributor", isFinite(result.beUnitsD) ? Math.ceil(result.beUnitsD).toLocaleString() : "Unprofitable", isFinite(result.beRevD) ? money(result.beRevD) : "N/A"],
      ["Blended", isFinite(result.beUnitsB) ? Math.ceil(result.beUnitsB).toLocaleString() : "Unprofitable", isFinite(result.beRevB) ? money(result.beRevB) : "N/A"],
      [],
      ["Purchase Order Summary"],
      ["Total Qty", result.poGrandTotals.totalQty.toLocaleString()],
      ["Total Gross Profit", money(result.poGrandTotals.totalProfit)],
      ["Net Impact (vs Overhead)", money(result.poGrandTotals.totalProfit - result.ohTotal)],
      ["Avg Cost / Unit", money3(result.poGrandTotals.avgCostPerUnit)],
      ["Avg Profit / Unit", money3(result.poGrandTotals.avgProfitPerUnit)],
      [],
      ["Commission Summary"],
      ["Total Revenue", money(result.commissionResults.totalRevenue)],
      ["Total OP", money(result.commissionResults.totalOpProfit)],
      ["Total Commissions", money(result.commissionResults.totalComm)],
      ["Total Bonuses", money(result.commissionResults.totalBonus)],
      ["Commissions % of Revenue", pct(result.commissionResults.commPctGross)],
      ["Commissions % of OP", pct(result.commissionResults.commPctOp)],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Summary");
    XLSX.writeFile(wb, `calculator-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
  } catch (err) {
    console.error("Excel export failed:", err);
    alert("Excel export failed. Please try CSV export instead.");
  }
};
