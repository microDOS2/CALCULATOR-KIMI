import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCalculator } from "@/hooks/useCalculator";
import { Header } from "@/components/Header";
import { SensitivityPanel } from "@/components/SensitivityPanel";
import { RecoveryDialog } from "@/components/RecoveryDialog";
import { ProductTab } from "@/components/tabs/ProductTab";
import { ChannelsTab } from "@/components/tabs/ChannelsTab";
import { CostsTab } from "@/components/tabs/CostsTab";
import { PackagingTab } from "@/components/tabs/PackagingTab";
import { POTab } from "@/components/tabs/POTab";
import { CommissionsTab } from "@/components/tabs/CommissionsTab";
import { ThirdPartyTab } from "@/components/tabs/ThirdPartyTab";
import { ScenariosTab } from "@/components/tabs/ScenariosTab";
import { CompareTab } from "@/components/tabs/CompareTab";
import { CampaignsTab } from "@/components/tabs/CampaignsTab";
import { ExecutiveDashboard } from "@/components/tabs/ExecutiveDashboard";
import { GoalSeekTab } from "@/components/tabs/GoalSeekTab";
import { BatchWhatIfTab } from "@/components/tabs/BatchWhatIfTab";
import { ChartsTab } from "@/components/tabs/ChartsTab";
import { SubscriptionsTab } from "@/components/tabs/SubscriptionsTab";
import { SimulateTab } from "@/components/tabs/SimulateTab";
import { CashFlowTab } from "@/components/tabs/CashFlowTab";
import { AffiliatesTab } from "@/components/tabs/AffiliatesTab";
import { B2BSalesTab } from "@/components/tabs/B2BSalesTab";
import { OverridesTab } from "@/components/tabs/OverridesTab";
import { AuditLogTab } from "@/components/tabs/AuditLogTab";
import { MarketingTab } from "@/components/tabs/MarketingTab";
import { ShippingEmployeesTab } from "@/components/tabs/ShippingEmployeesTab";

function App() {
  const calc = useCalculator();
  const [activeTab, setActiveTab] = useState("product");
  const [simulateOpen, setSimulateOpen] = useState(false);
  const [cashFlowWeekly, setCashFlowWeekly] = useState(false);

  const handleSimulateClick = () => {
    if (!calc.sensitivity.isActive) {
      calc.sensitivity.enable();
    }
    setSimulateOpen(true);
  };

  const handleApply = () => {
    const newState = calc.sensitivity.applyToModel();
    calc.updateState(newState);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "simulate" && !calc.sensitivity.isActive) {
      calc.sensitivity.enable();
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          calc.redo();
        } else {
          calc.undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        calc.redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [calc]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Header
        onSaveScenario={calc.saveScenario}
        onReset={calc.resetAll}
        result={calc.result}
        unitSystem={calc.unitSystem}
        onToggleUnitSystem={calc.toggleUnitSystem}
        onSimulateClick={handleSimulateClick}
        onUndo={calc.undo}
        onRedo={calc.redo}
        canUndo={calc.canUndo}
        canRedo={calc.canRedo}
      />

      <RecoveryDialog
        open={calc.showRecovery}
        onRecover={calc.recoverState}
        onDismiss={calc.dismissRecovery}
      />

      {/* Floating Sensitivity Panel */}
      <SensitivityPanel
        baseState={calc.state}
        baseResult={calc.result}
        shadowState={calc.sensitivity.shadowState}
        shadowResult={calc.sensitivity.shadowResult}
        isOpen={simulateOpen}
        onOpenChange={(open) => {
          setSimulateOpen(open);
          if (!open) calc.sensitivity.disable();
        }}
        onUpdateSku={calc.sensitivity.updateSku}
        onUpdatePlan={calc.sensitivity.updatePlan}
        onUpdateGlobal={calc.sensitivity.updateShadow}
        onReset={calc.sensitivity.reset}
        onApply={handleApply}
      />

      <main className="container mx-auto py-6 px-4 sm:px-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="w-full justify-center flex-wrap h-auto gap-1.5 bg-transparent">
            {/* Group 1: Foundation — Blue */}
            <TabsTrigger value="product" className="bg-blue-100/70 text-blue-800 hover:bg-blue-200 data-[state=active]:!bg-blue-300 data-[state=active]:!text-blue-950 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-800/50 dark:data-[state=active]:!bg-blue-700 dark:data-[state=active]:!text-blue-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <span className="text-xs mr-1 font-bold opacity-70">1</span>Product
            </TabsTrigger>
            <TabsTrigger value="packaging" className="bg-blue-100/70 text-blue-800 hover:bg-blue-200 data-[state=active]:!bg-blue-300 data-[state=active]:!text-blue-950 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-800/50 dark:data-[state=active]:!bg-blue-700 dark:data-[state=active]:!text-blue-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <span className="text-xs mr-1 font-bold opacity-70">2</span>Packaging
            </TabsTrigger>
            <TabsTrigger value="costs" className="bg-blue-100/70 text-blue-800 hover:bg-blue-200 data-[state=active]:!bg-blue-300 data-[state=active]:!text-blue-950 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-800/50 dark:data-[state=active]:!bg-blue-700 dark:data-[state=active]:!text-blue-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <span className="text-xs mr-1 font-bold opacity-70">3</span>Costs
            </TabsTrigger>

            <div className="w-px h-5 bg-border/40 mx-0.5 hidden sm:block" />

            {/* Group 2: B2C Sales — Indigo */}
            <TabsTrigger value="b2c" className="bg-indigo-100/70 text-indigo-800 hover:bg-indigo-200 data-[state=active]:!bg-indigo-300 data-[state=active]:!text-indigo-950 dark:bg-indigo-900/30 dark:text-indigo-200 dark:hover:bg-indigo-800/50 dark:data-[state=active]:!bg-indigo-700 dark:data-[state=active]:!text-indigo-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <span className="text-xs mr-1 font-bold opacity-70">4</span>B2C Sales
            </TabsTrigger>
            <TabsTrigger value="b2b" className="bg-teal-100/70 text-teal-800 hover:bg-teal-200 data-[state=active]:!bg-teal-300 data-[state=active]:!text-teal-950 dark:bg-teal-900/30 dark:text-teal-200 dark:hover:bg-teal-800/50 dark:data-[state=active]:!bg-teal-700 dark:data-[state=active]:!text-teal-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <span className="text-xs mr-1 font-bold opacity-70">5</span>B2B Sales
            </TabsTrigger>

            <div className="w-px h-5 bg-border/40 mx-0.5 hidden sm:block" />

            {/* Group 3: Operations — Emerald */}
            <TabsTrigger value="po" className="bg-emerald-100/70 text-emerald-800 hover:bg-emerald-200 data-[state=active]:!bg-emerald-300 data-[state=active]:!text-emerald-950 dark:bg-emerald-900/30 dark:text-emerald-200 dark:hover:bg-emerald-800/50 dark:data-[state=active]:!bg-emerald-700 dark:data-[state=active]:!text-emerald-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <span className="text-xs mr-1 font-bold opacity-70">5</span>Orders
            </TabsTrigger>
            <TabsTrigger value="commissions" className="bg-emerald-100/70 text-emerald-800 hover:bg-emerald-200 data-[state=active]:!bg-emerald-300 data-[state=active]:!text-emerald-950 dark:bg-emerald-900/30 dark:text-emerald-200 dark:hover:bg-emerald-800/50 dark:data-[state=active]:!bg-emerald-700 dark:data-[state=active]:!text-emerald-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <span className="text-xs mr-1 font-bold opacity-70">6</span>Commissions
            </TabsTrigger>
            <TabsTrigger value="thirdparty" className="bg-emerald-100/70 text-emerald-800 hover:bg-emerald-200 data-[state=active]:!bg-emerald-300 data-[state=active]:!text-emerald-950 dark:bg-emerald-900/30 dark:text-emerald-200 dark:hover:bg-emerald-800/50 dark:data-[state=active]:!bg-emerald-700 dark:data-[state=active]:!text-emerald-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <span className="text-xs mr-1 font-bold opacity-70">7</span>Third Party
            </TabsTrigger>
            <TabsTrigger value="overrides" className="bg-emerald-100/70 text-emerald-800 hover:bg-emerald-200 data-[state=active]:!bg-emerald-300 data-[state=active]:!text-emerald-950 dark:bg-emerald-900/30 dark:text-emerald-200 dark:hover:bg-emerald-800/50 dark:data-[state=active]:!bg-emerald-700 dark:data-[state=active]:!text-emerald-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <span className="text-xs mr-1 font-bold opacity-70">8</span>Overrides
            </TabsTrigger>
            <TabsTrigger value="charts" className="bg-emerald-100/70 text-emerald-800 hover:bg-emerald-200 data-[state=active]:!bg-emerald-300 data-[state=active]:!text-emerald-950 dark:bg-emerald-900/30 dark:text-emerald-200 dark:hover:bg-emerald-800/50 dark:data-[state=active]:!bg-emerald-700 dark:data-[state=active]:!text-emerald-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <span className="text-xs mr-1 font-bold opacity-70">10</span>Charts
            </TabsTrigger>

            <div className="w-px h-5 bg-border/40 mx-0.5 hidden sm:block" />

            {/* Group 4: Dashboard & Power Tools — Violet */}
            <TabsTrigger value="dashboard" className="bg-violet-100/70 text-violet-800 hover:bg-violet-200 data-[state=active]:!bg-violet-300 data-[state=active]:!text-violet-950 dark:bg-violet-900/30 dark:text-violet-200 dark:hover:bg-violet-800/50 dark:data-[state=active]:!bg-violet-700 dark:data-[state=active]:!text-violet-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <span className="text-xs mr-1 font-bold opacity-70">11</span>Dashboard
            </TabsTrigger>
            <TabsTrigger value="goalseek" className="bg-violet-100/70 text-violet-800 hover:bg-violet-200 data-[state=active]:!bg-violet-300 data-[state=active]:!text-violet-950 dark:bg-violet-900/30 dark:text-violet-200 dark:hover:bg-violet-800/50 dark:data-[state=active]:!bg-violet-700 dark:data-[state=active]:!text-violet-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <span className="text-xs mr-1 font-bold opacity-70">12</span>Goal Seek
            </TabsTrigger>
            <TabsTrigger value="batch" className="bg-violet-100/70 text-violet-800 hover:bg-violet-200 data-[state=active]:!bg-violet-300 data-[state=active]:!text-violet-950 dark:bg-violet-900/30 dark:text-violet-200 dark:hover:bg-violet-800/50 dark:data-[state=active]:!bg-violet-700 dark:data-[state=active]:!text-violet-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <span className="text-xs mr-1 font-bold opacity-70">13</span>Batch
            </TabsTrigger>

            <div className="w-px h-5 bg-border/40 mx-0.5 hidden sm:block" />

            {/* Group 5: Forecasting — Amber */}
            <TabsTrigger value="subscriptions" className="bg-amber-100/70 text-amber-800 hover:bg-amber-200 data-[state=active]:!bg-amber-300 data-[state=active]:!text-amber-950 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:bg-amber-800/50 dark:data-[state=active]:!bg-amber-700 dark:data-[state=active]:!text-amber-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <span className="text-xs mr-1 font-bold opacity-70">14</span>Subscriptions
            </TabsTrigger>
            <TabsTrigger value="cashflow" className="bg-amber-100/70 text-amber-800 hover:bg-amber-200 data-[state=active]:!bg-amber-300 data-[state=active]:!text-amber-950 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:bg-amber-800/50 dark:data-[state=active]:!bg-amber-700 dark:data-[state=active]:!text-amber-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <span className="text-xs mr-1 font-bold opacity-70">15</span>Cash Flow
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="bg-amber-100/70 text-amber-800 hover:bg-amber-200 data-[state=active]:!bg-amber-300 data-[state=active]:!text-amber-950 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:bg-amber-800/50 dark:data-[state=active]:!bg-amber-700 dark:data-[state=active]:!text-amber-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <span className="text-xs mr-1 font-bold opacity-70">16</span>Campaigns
            </TabsTrigger>

            <div className="w-px h-5 bg-border/40 mx-0.5 hidden sm:block" />

            {/* Group 6: Management — Slate */}
            <TabsTrigger value="scenarios" className="bg-slate-100/70 text-slate-800 hover:bg-slate-200 data-[state=active]:!bg-slate-300 data-[state=active]:!text-slate-950 dark:bg-slate-900/30 dark:text-slate-200 dark:hover:bg-slate-800/50 dark:data-[state=active]:!bg-slate-700 dark:data-[state=active]:!text-slate-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <span className="text-xs mr-1 font-bold opacity-70">17</span>Scenarios
            </TabsTrigger>
            <TabsTrigger value="compare" className="bg-slate-100/70 text-slate-800 hover:bg-slate-200 data-[state=active]:!bg-slate-300 data-[state=active]:!text-slate-950 dark:bg-slate-900/30 dark:text-slate-200 dark:hover:bg-slate-800/50 dark:data-[state=active]:!bg-slate-700 dark:data-[state=active]:!text-slate-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <span className="text-xs mr-1 font-bold opacity-70">18</span>Compare
            </TabsTrigger>
            <TabsTrigger value="auditlog" className="bg-slate-100/70 text-slate-800 hover:bg-slate-200 data-[state=active]:!bg-slate-300 data-[state=active]:!text-slate-950 dark:bg-slate-900/30 dark:text-slate-200 dark:hover:bg-slate-800/50 dark:data-[state=active]:!bg-slate-700 dark:data-[state=active]:!text-slate-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <span className="text-xs mr-1 font-bold opacity-70">19</span>Audit Log
            </TabsTrigger>

            <div className="w-px h-5 bg-border/40 mx-0.5 hidden sm:block" />

            {/* Group 7: Outsourceable Cost Centers */}
            <TabsTrigger value="marketing" className="bg-pink-100/70 text-pink-800 hover:bg-pink-200 data-[state=active]:!bg-pink-300 data-[state=active]:!text-pink-950 dark:bg-pink-900/30 dark:text-pink-200 dark:hover:bg-pink-800/50 dark:data-[state=active]:!bg-pink-700 dark:data-[state=active]:!text-pink-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <span className="text-xs mr-1 font-bold opacity-70">20</span>Marketing
            </TabsTrigger>
            <TabsTrigger value="shipping" className="bg-cyan-100/70 text-cyan-800 hover:bg-cyan-200 data-[state=active]:!bg-cyan-300 data-[state=active]:!text-cyan-950 dark:bg-cyan-900/30 dark:text-cyan-200 dark:hover:bg-cyan-800/50 dark:data-[state=active]:!bg-cyan-700 dark:data-[state=active]:!text-cyan-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <span className="text-xs mr-1 font-bold opacity-70">21</span>Shipping
            </TabsTrigger>

            <div className="w-px h-5 bg-border/40 mx-0.5 hidden sm:block" />

            {/* Simulate — Special Rose (Action Tab) */}
            <TabsTrigger value="simulate" className="bg-rose-100/70 text-rose-800 hover:bg-rose-200 data-[state=active]:!bg-rose-300 data-[state=active]:!text-rose-950 dark:bg-rose-900/30 dark:text-rose-200 dark:hover:bg-rose-800/50 dark:data-[state=active]:!bg-rose-700 dark:data-[state=active]:!text-rose-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm ring-1 ring-rose-300/50">
              <span className="text-xs mr-1 font-bold">●</span>Simulate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="product">
            <ProductTab
              state={calc.state}
              result={calc.result}
              addSKU={calc.addSKU}
              removeSKU={calc.removeSKU}
              updateSKU={calc.updateSKU}
              updateOrderQty={calc.updateOrderQty}
              addIngredient={calc.addIngredient}
              setIngredients={calc.setIngredients}
              updateIngredient={calc.updateIngredient}
              removeIngredient={calc.removeIngredient}
            />
          </TabsContent>

          <TabsContent value="b2c">
            <ChannelsTab
              state={calc.state}
              result={calc.result}
              updateState={calc.updateState}
              mode="b2c"
            />
            <div className="mt-6">
              <AffiliatesTab
                state={calc.state}
                result={calc.result}
                updateState={calc.updateState}
              />
            </div>
          </TabsContent>

          <TabsContent value="b2b">
            <B2BSalesTab
              state={calc.state}
              result={calc.result}
              updateState={calc.updateState}
            />
          </TabsContent>

          <TabsContent value="costs">
            <CostsTab
              state={calc.state}
              result={calc.result}
              addOverhead={calc.addOverhead}
              updateOverhead={calc.updateOverhead}
              removeOverhead={calc.removeOverhead}
              updateMonthlyVolume={calc.updateMonthlyVolume}
              updateState={calc.updateState}
            />
          </TabsContent>

          <TabsContent value="packaging">
            <PackagingTab
              skus={calc.state.skus}
              unitSystem={calc.unitSystem}
              skuPackagingCosts={calc.result.skuPackagingCosts}
              totalPackagingCostPerPack={calc.result.totalPackagingCostPerPack}
              totalPackagingWeightPerPack={calc.result.totalPackagingWeightPerPack}
              totalUnitWeightPerPack={calc.result.totalUnitWeightPerPack}
              addLayer={calc.addPackagingLayer}
              updateLayer={calc.updatePackagingLayer}
              removeLayer={calc.removePackagingLayer}
            />
          </TabsContent>

          <TabsContent value="po">
            <POTab result={calc.result} />
          </TabsContent>

          <TabsContent value="commissions">
            <CommissionsTab
              commissions={calc.commissions}
              result={calc.result}
              onAddVP={calc.addVP}
              onRemoveVP={calc.removeVP}
              onUpdateVP={calc.updateVP}
              onAddRSM={calc.addRSM}
              onRemoveRSM={calc.removeRSM}
              onUpdateRSM={calc.updateRSM}
              onAddSP={calc.addSP}
              onRemoveSP={calc.removeSP}
              onUpdateSP={calc.updateSP}
              onAddBonus={calc.addBonus}
              onUpdateBonus={calc.updateBonus as (spId: string, bonusId: string, patch: { metric?: string; thresh?: number; amt?: number }) => void}
              onRemoveBonus={calc.removeBonus}
              onUpdatePresident={calc.updatePresident}
            />
          </TabsContent>

          <TabsContent value="thirdparty">
            <ThirdPartyTab
              companies={calc.thirdPartyCompanies}
              updateCompany={calc.updateThirdParty}
              updateItem={calc.updateThirdPartyItem}
            />
          </TabsContent>

          <TabsContent value="overrides">
            <OverridesTab
              state={calc.state}
              result={calc.result}
              updateState={calc.updateState}
            />
          </TabsContent>

          <TabsContent value="charts">
            <ChartsTab state={calc.state} result={calc.result} />
          </TabsContent>

          <TabsContent value="dashboard">
            <ExecutiveDashboard state={calc.state} result={calc.result} />
          </TabsContent>

          <TabsContent value="goalseek">
            <GoalSeekTab state={calc.state} />
          </TabsContent>

          <TabsContent value="batch">
            <BatchWhatIfTab state={calc.state} />
          </TabsContent>

          <TabsContent value="subscriptions">
            <SubscriptionsTab
              skus={calc.state.skus}
              plans={calc.subscriptionPlans}
              summary={calc.result.subscriptionSummary}
              addPlan={calc.addSubscriptionPlan}
              updatePlan={calc.updateSubscriptionPlan}
              removePlan={calc.removeSubscriptionPlan}
              addItem={calc.addSubscriptionItem}
              updateItem={calc.updateSubscriptionItem}
              removeItem={calc.removeSubscriptionItem}
            />
          </TabsContent>

          <TabsContent value="cashflow">
            <CashFlowTab
              state={calc.state}
              result={calc.result}
              isWeekly={cashFlowWeekly}
              onToggleWeekly={() => setCashFlowWeekly((v) => !v)}
              updateState={calc.updateState}
            />
          </TabsContent>

          <TabsContent value="campaigns">
            <CampaignsTab
              campaigns={calc.state.campaigns}
              campaignImpact={calc.result.campaignImpact}
              baseRetailPrice={calc.result.retail.price}
              baseWholesalePrice={calc.result.wholesale.price}
              baseDistributorPrice={calc.result.distributor.price}
              baseVolume={calc.result.totalMonthlyVolume}
              onUpdate={(campaigns) => calc.updateState({ campaigns })}
            />
          </TabsContent>

          <TabsContent value="scenarios">
            <ScenariosTab
              scenarios={calc.scenarios}
              onLoad={calc.loadScenario}
              onDelete={calc.deleteScenario}
              onClear={calc.clearScenarios}
            />
          </TabsContent>

          <TabsContent value="compare">
            <CompareTab scenarios={calc.scenarios} />
          </TabsContent>

          <TabsContent value="auditlog">
            <AuditLogTab state={calc.state} updateState={calc.updateState} />
          </TabsContent>

          <TabsContent value="marketing">
            <MarketingTab
              state={calc.state}
              updateState={calc.updateState}
              marketingEmployees={calc.marketingEmployees}
              marketingExpenses={calc.marketingExpenses}
              addMarketingEmployee={calc.addMarketingEmployee}
              removeMarketingEmployee={calc.removeMarketingEmployee}
              updateMarketingEmployee={calc.updateMarketingEmployee}
              addMarketingExpense={calc.addMarketingExpense}
              removeMarketingExpense={calc.removeMarketingExpense}
              updateMarketingExpense={calc.updateMarketingExpense}
            />
          </TabsContent>

          <TabsContent value="shipping">
            <ShippingEmployeesTab
              state={calc.state}
              updateState={calc.updateState}
              shippingEmployees={calc.shippingEmployees}
              shippingMaterials={calc.shippingMaterials}
              addShippingEmployee={calc.addShippingEmployee}
              removeShippingEmployee={calc.removeShippingEmployee}
              updateShippingEmployee={calc.updateShippingEmployee}
              addShippingMaterial={calc.addShippingMaterial}
              removeShippingMaterial={calc.removeShippingMaterial}
              updateShippingMaterial={calc.updateShippingMaterial}
            />
          </TabsContent>

          <TabsContent value="simulate">
            <SimulateTab
              baseState={calc.state}
              baseResult={calc.result}
              shadowState={calc.sensitivity.shadowState}
              shadowResult={calc.sensitivity.shadowResult}
              onUpdateSku={calc.sensitivity.updateSku}
              onUpdatePlan={calc.sensitivity.updatePlan}
              onUpdateGlobal={calc.sensitivity.updateShadow}
              onReset={calc.sensitivity.reset}
              onApply={handleApply}
            />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t py-6 mt-8">
        <div className="container mx-auto px-4 sm:px-6 text-center text-xs text-muted-foreground">
          Channel Calculator v10 · Simulate · Cash Flow · Per-SKU Packaging · mg/oz Toggle · Formula-driven
        </div>
      </footer>
    </div>
  );
}

export default App;
