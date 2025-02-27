import "../styles/globals.css";
import type { NextPage } from "next";
import React, { useEffect } from "react";
import { useAuthStore } from "@/utils/stores/authStore";

type Props = {
  Component: NextPage;
  pageProps: any;
};

const App: React.FC<Props> = ({ Component, pageProps }) => {
  // 클라이언트 사이드에서만 상태 초기화
  useEffect(() => {
    // Zustand persist 스토리지에서 상태 복원
    const authStore = useAuthStore.persist.rehydrate();
  }, []);

  return <Component {...pageProps} />;
};

export default App;
