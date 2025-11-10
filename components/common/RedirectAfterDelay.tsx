import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

interface RedirectAfterDelayProps {
  to: string;
  delayMs?: number; // default 1500ms
  replace?: boolean; // default true
  onDone?: () => void;
  children?: React.ReactNode; // optional content to show while waiting
}

const RedirectAfterDelay: React.FC<RedirectAfterDelayProps> = ({
  to,
  delayMs = 1500,
  replace = true,
  onDone,
  children,
}) => {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        if (replace) await router.replace(to);
        else await router.push(to);
      } finally {
        onDone && onDone();
      }
    }, delayMs);
    return () => clearTimeout(t);
  }, [to, delayMs, replace, router, onDone]);

  return <>{children ?? null}</>;
};

export default RedirectAfterDelay;
