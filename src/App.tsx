import { Header } from "@/components/Header";
import { ProductSpecs } from "@/components/ProductSpecs";
import { OrderComposition } from "@/components/OrderComposition";
import { IngredientsSection } from "@/components/IngredientsSection";
import { SalesChannels } from "@/components/SalesChannels";
import { MonthlyCosts } from "@/components/MonthlyCosts";
import { BreakEven } from "@/components/BreakEven";
import { BlendedKPIs } from "@/components/BlendedKPIs";
import { PurchaseOrders } from "@/components/PurchaseOrders";
import { Commissions } from "@/components/Commissions";
import { ThirdParty } from "@/components/ThirdParty";
import { ScenariosSection } from "@/components/ScenariosSection";
import { useCalculator } from "@/hooks/useCalculator";
import { Separator } from "@/components/ui/separator";

function App() {
  const {
    state,
    result,
    updateState,
    addSKU,
    removeSKU,
    updateSKU,
    updateOrderQty,
    addIngredient,
    updateIngredient,
    removeIngredient,
    addOverhead,
    updateOverhead,
    removeOverhead,
    updateMonthlyVolume,
    commissions,
    addVP,
    removeVP,
    updateVP,
    addRSM,
    removeRSM,
    updateRSM,
    addSP,
    removeSP,
    updateSP,
    addBonus,
    updateBonus,
    removeBonus,
    updatePresident,
    thirdPartyCompanies,
    updateThirdParty,
    updateThirdPartyItem,
    scenarios,
    saveScenario,
    loadScenario,
    deleteScenario,
    clearScenarios,
    resetAll,
  } = useCalculator();

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSaveScenario={saveScenario}
        onReset={resetAll}
        result={result}
      />

      <main className="container py-6 space-y-8">
        {/* Left column content */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-8">
          <div className="space-y-8">
            <ProductSpecs
              skus={state.skus}
              onAdd={addSKU}
              onRemove={removeSKU}
              onUpdate={updateSKU}
            />

            <OrderComposition
              skus={state.skus}
              order={state.order}
              onUpdateQty={updateOrderQty}
            />

            <IngredientsSection
              ingredients={state.ingredients}
              result={result}
              onAdd={addIngredient}
              onUpdate={updateIngredient}
              onRemove={removeIngredient}
            />

            <SalesChannels
              result={result}
              wDisc={state.wDisc}
              dDisc={state.dDisc}
              includeShip={state.includeShip}
              shippingPerPack={state.shippingPerPack}
              includeR={state.includeR}
              includeW={state.includeW}
              includeD={state.includeD}
              onUpdate={(patch) => updateState(patch as Record<string, unknown>)}
            />
          </div>

          <div className="space-y-8">
            <MonthlyCosts
              overhead={state.overhead}
              monthlyVolumes={state.monthlyVolumes}
              result={result}
              ohR={state.ohR}
              ohW={state.ohW}
              ohD={state.ohD}
              includeThirdParty={state.includeThirdParty}
              thirdPartyTotal={result.thirdPartyTotal}
              skus={state.skus}
              onAddOverhead={addOverhead}
              onUpdateOverhead={updateOverhead}
              onRemoveOverhead={removeOverhead}
              onUpdateVolume={updateMonthlyVolume}
              onUpdate={(patch) => updateState(patch as Record<string, unknown>)}
            />

            <BreakEven
              result={result}
              beIncludeOverhead={state.beIncludeOverhead}
              onUpdate={(patch) => updateState(patch as Record<string, unknown>)}
            />

            <BlendedKPIs result={result} />
          </div>
        </div>

        <Separator />

        <PurchaseOrders result={result} />

        <Separator />

        <Commissions
          commissions={commissions}
          result={result}
          onAddVP={addVP}
          onRemoveVP={removeVP}
          onUpdateVP={updateVP}
          onAddRSM={addRSM}
          onRemoveRSM={removeRSM}
          onUpdateRSM={updateRSM}
          onAddSP={addSP}
          onRemoveSP={removeSP}
          onUpdateSP={updateSP}
          onAddBonus={addBonus}
          onUpdateBonus={updateBonus}
          onRemoveBonus={removeBonus}
          onUpdatePresident={updatePresident}
        />

        <Separator />

        <ThirdParty
          companies={thirdPartyCompanies}
          onUpdateCompany={updateThirdParty}
          onUpdateItem={updateThirdPartyItem}
        />

        <Separator />

        <ScenariosSection
          scenarios={scenarios}
          onLoad={loadScenario}
          onDelete={deleteScenario}
          onClear={clearScenarios}
        />
      </main>

      <footer className="border-t py-6 mt-8">
        <div className="container text-center text-xs text-muted-foreground">
          Channel Calculator v8 · All-in · Built with React + Tailwind + shadcn/ui
        </div>
      </footer>
    </div>
  );
}

export default App;
