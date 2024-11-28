"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

const CrispChat = () => {
  useEffect(() => {
    Crisp.configure("9ea8a5a6-1032-49eb-aee0-81af37053f65");
  }, []);

  return null;
};

export default CrispChat;
