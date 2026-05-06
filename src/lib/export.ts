import type { CalculationResult } from "@/types/calculator";
import { money, money3, pct } from "@/lib/calculator";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// ===== CSV Export =====

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
    ["", ""],
    ["COGS / Pack", money3(result.cogsPerPack)],
    ["Ingredient Cost / Pack", money3(result.avgIngCostPerPack)],
    ["Packaging Cost / Pack", money3(result.avgPackCostPerPack)],
    ["Display Cost / Pack", money3(result.avgDisplayCostPerPack)],
    ["Shipping Box Cost / Pack", money3(result.avgShipBoxCostPerPack)],
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

// ===== PDF Export =====
export const exportPDF = (result: CalculationResult, label: string) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Channel Calculator Report", 14, 20);
  doc.setFontSize(10);
  doc.text(`Label: ${label || "N/A"}`, 14, 28);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);

  const tableData = [
    ["Blended Revenue / Pack", money3(result.brev)],
    ["Blended Gross Profit / Pack", money3(result.bgpp)],
    ["Blended Gross Margin", pct(result.bgmp)],
    ["Blended Operating Profit / Pack", money3(result.bopp)],
    ["Blended Operating Margin", pct(result.bomp)],
    ["COGS / Pack", money3(result.cogsPerPack)],
    ["Overhead / Pack", money3(result.ohPerPack)],
    ["Retail Price", money3(result.retail.price)],
    ["Retail GP / Pack", money3(result.retail.gp)],
    ["Retail GM%", pct(result.retail.gm)],
    ["Retail OP / Pack", money3(result.retail.op)],
    ["Wholesale Price", money3(result.wholesale.price)],
    ["Wholesale GP / Pack", money3(result.wholesale.gp)],
    ["Wholesale GM%", pct(result.wholesale.gm)],
    ["Distributor Price", money3(result.distributor.price)],
    ["Distributor GP / Pack", money3(result.distributor.gp)],
    ["Distributor GM%", pct(result.distributor.gm)],
    ["Break-Even Retail (packs)", isFinite(result.beUnitsR) ? Math.ceil(result.beUnitsR).toLocaleString() : "Unprofitable"],
    ["Break-Even Wholesale (packs)", isFinite(result.beUnitsW) ? Math.ceil(result.beUnitsW).toLocaleString() : "Unprofitable"],
    ["Break-Even Blended (packs)", isFinite(result.beUnitsB) ? Math.ceil(result.beUnitsB).toLocaleString() : "Unprofitable"],
    ["Total Commissions", money(result.commissionResults.totalComm)],
    ["Commissions % of Revenue", pct(result.commissionResults.commPctGross)],
  ];

  autoTable(doc, {
    startY: 40,
    head: [["Metric", "Value"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [60, 60, 60] },
    styles: { fontSize: 9 },
  });

  doc.save(`calculator-report-${new Date().toISOString().slice(0, 10)}.pdf`);
};

// ===== Excel Export =====
export const exportExcel = (result: CalculationResult, label: string) => {
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
    ["Packaging Cost / Pack", money3(result.avgPackCostPerPack)],
    ["Display Cost / Pack", money3(result.avgDisplayCostPerPack)],
    ["Shipping Box Cost / Pack", money3(result.avgShipBoxCostPerPack)],
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
};
