
/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>;
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '@tanstack/react-query' {
  export * from '@tanstack/react-query';
}

declare module 'react-router-dom' {
  export * from 'react-router-dom';
}

declare module 'sonner' {
  export * from 'sonner';
}

declare module 'lucide-react' {
  export * from 'lucide-react';
}

declare module 'date-fns' {
  export * from 'date-fns';
}

declare module 'date-fns/locale' {
  export * from 'date-fns/locale';
}

declare module 'class-variance-authority' {
  export * from 'class-variance-authority';
}

declare module '@radix-ui/react-accordion' {
  export * from '@radix-ui/react-accordion';
}

declare module '@radix-ui/react-alert-dialog' {
  export * from '@radix-ui/react-alert-dialog';
}

declare module '@radix-ui/react-aspect-ratio' {
  export * from '@radix-ui/react-aspect-ratio';
}

declare module '@radix-ui/react-avatar' {
  export * from '@radix-ui/react-avatar';
}

declare module '@radix-ui/react-slot' {
  export * from '@radix-ui/react-slot';
}

declare module 'react-day-picker' {
  export * from 'react-day-picker';
}
