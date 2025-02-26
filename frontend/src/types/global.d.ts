// React 관련 타입 선언
import "react";

declare module "react" {
    interface CSSProperties {
        [key: string]: any;
    }
}

// Next.js 관련 타입 선언
declare module "next/router" {
    export interface NextRouter {
        route: string;
        pathname: string;
        query: Record<string, string | string[]>;
        asPath: string;
        push: (url: string) => Promise<boolean>;
        replace: (url: string) => Promise<boolean>;
        reload: () => void;
        back: () => void;
        prefetch: (url: string) => Promise<void>;
        beforePopState: (cb: (state: any) => boolean) => void;
        events: {
            on: (type: string, handler: (...evts: any[]) => void) => void;
            off: (type: string, handler: (...evts: any[]) => void) => void;
            emit: (type: string, ...evts: any[]) => void;
        };
        isFallback: boolean;
    }

    export function useRouter(): NextRouter;
}

// 환경 변수 타입 선언
declare namespace NodeJS {
    interface ProcessEnv {
        NEXT_PUBLIC_API_URL: string;
        [key: string]: string;
    }
}

// JSX 네임스페이스 확장
declare namespace JSX {
    interface IntrinsicElements {
        [elemName: string]: any;
    }
}
