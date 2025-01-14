"use client";

import { usePathname } from "next/navigation";
import Filters from "./Filters";
import React from "react";

 function FiltersWrapper() {
  const pathname = usePathname();
  console.log('FiltersWrapper rendered')

  if (pathname === "/members") return <Filters />;
  else return null;

}
export default React.memo(FiltersWrapper);
