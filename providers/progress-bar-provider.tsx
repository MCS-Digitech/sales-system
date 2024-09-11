"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { memo } from "react";

const ProgressBarProvider: React.FC<{
  children: React.ReactNode;
}> = memo(({ children }) => {
  return (
    <>
      {children}
      <ProgressBar
        height="4px"
        color="#FF0000"
        options={{ showSpinner: false }}
        shallowRouting
      />
    </>
  );
});
ProgressBarProvider.displayName = "ProgressBarProvider";
export default ProgressBarProvider;
