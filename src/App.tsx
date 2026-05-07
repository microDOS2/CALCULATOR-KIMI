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
    <div className="min-h-screen bg-background">
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
          <TabsList className="w-full justify-center flex-wrap h-auto gap-1">
            <TabsTrigger value="product"><span className="text-xs text-muted-foreground mr-1 font-bold">1</span>Product</TabsTrigger>
            <TabsTrigger value="packaging"><span className="text-xs text-muted-foreground mr-1 font-bold">2</span>Packaging</TabsTrigger>
            <TabsTrigger value="channels"><span className="text-xs text-muted-foreground mr-1 font-bold">3</span>Channels</TabsTrigger>
            <TabsTrigger value="costs"><span className="text-xs text-muted-foreground mr-1 font-bold">4</span>Costs</TabsTrigger>
            <TabsTrigger value="po"><span className="text-xs text-muted-foreground mr-1 font-bold">5</span>Orders</TabsTrigger>
            <TabsTrigger value="commissions"><span className="text-xs text-muted-foreground mr-1 font-bold">6</span>Commissions</TabsTrigger>
            <TabsTrigger value="thirdparty"><span className="text-xs text-muted-foreground mr-1 font-bold">7</span>Third Party</TabsTrigger>
            <TabsTrigger value="charts"><span className="text-xs text-muted-foreground mr-1 font-bold">8</span>Charts</TabsTrigger>
            <TabsTrigger value="dashboard"><span className="text-xs text-muted-foreground mr-1 font-bold">9</span>Dashboard</TabsTrigger>
            <TabsTrigger value="goalseek"><span className="text-xs text-muted-foreground mr-1 font-bold">9.5</span>Goal Seek</TabsTrigger>
            <TabsTrigger value="batch"><span className="text-xs text-muted-foreground mr-1 font-bold">9.6</span>Batch</TabsTrigger>
            <TabsTrigger value="subscriptions"><span className="text-xs text-muted-foreground mr-1 font-bold">10</span>Subscriptions</TabsTrigger>
            <TabsTrigger value="cashflow"><span className="text-xs text-muted-foreground mr-1 font-bold">10</span>Cash Flow</TabsTrigger>
            <TabsTrigger value="campaigns"><span className="text-xs text-muted-foreground mr-1 font-bold">11</span>Campaigns</TabsTrigger>
            <TabsTrigger value="scenarios"><span className="text-xs text-muted-foreground mr-1 font-bold">12</span>Scenarios</TabsTrigger>
            <TabsTrigger value="compare"><span className="text-xs text-muted-foreground mr-1 font-bold">12</span>Compare</TabsTrigger>
            <div className="w-px h-5 bg-border mx-1 hidden sm:block" />
            <TabsTrigger value="simulate"><span className="text-xs text-primary mr-1 font-bold">●</span>Simulate</TabsTrigger>
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

          <TabsContent value="channels">
            <ChannelsTab
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

          <TabsContent value="charts">
            <ChartsTab state={calc.state} result={calc.result} />
          </TabsContent>

          <TabsContent value="dashboard">
            <ExecutiveDashboard result={calc.result} />
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
              result={calc.result}
              isWeekly={cashFlowWeekly}
              onToggleWeekly={() => setCashFlowWeekly((v) => !v)}
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
