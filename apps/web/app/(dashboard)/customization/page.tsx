import React from "react";
import { CusomizationView } from "../../../modules/customization/ui/views/customization-view";
import { Protect } from "@clerk/nextjs";
import { PremiumFeatureOverlay } from "@/modules/billing/ui/components/premium-feature-overlay";

const Page = () => {
  return (
    <Protect
      condition={(has) => has({ plan: "pro" })}
      fallback={
        <PremiumFeatureOverlay>
          <CusomizationView />
        </PremiumFeatureOverlay>
      }
    >
      <CusomizationView />
    </Protect>
  );
};

export default Page;
