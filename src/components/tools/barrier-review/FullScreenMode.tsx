"use client";

import { useEffect } from "react";

export default function FullScreenMode() {
  useEffect(() => {
    document.body.setAttribute("data-fullscreen-tool", "true");
    return () => {
      document.body.removeAttribute("data-fullscreen-tool");
    };
  }, []);

  return null;
}
