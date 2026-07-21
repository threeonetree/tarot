"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOnlineSnapshot() {
  return navigator.onLine;
}

export function PwaStatus() {
  const online = useSyncExternalStore(subscribe, getOnlineSnapshot, () => true);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [updateDismissed, setUpdateDismissed] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(registrations.map((registration) => registration.unregister())),
        )
        .catch(() => undefined);
      return;
    }

    let cancelled = false;
    let removeUpdateListener: () => void = () => {};

    const register = () => {
      void navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          if (cancelled) return;

          const offerUpdate = (worker: ServiceWorker | null) => {
            if (worker && navigator.serviceWorker.controller) {
              setWaitingWorker(worker);
              setUpdateDismissed(false);
            }
          };

          offerUpdate(registration.waiting);
          const handleUpdateFound = () => {
            const installing = registration.installing;
            if (!installing) return;
            const handleStateChange = () => {
              if (installing.state === "installed") offerUpdate(registration.waiting ?? installing);
            };
            installing.addEventListener("statechange", handleStateChange);
          };
          registration.addEventListener("updatefound", handleUpdateFound);
          removeUpdateListener = () =>
            registration.removeEventListener("updatefound", handleUpdateFound);
        })
        .catch(() => undefined);
    };
    if (document.readyState === "complete") {
      register();
      return () => {
        cancelled = true;
        removeUpdateListener();
      };
    }
    window.addEventListener("load", register, { once: true });
    return () => {
      cancelled = true;
      removeUpdateListener();
      window.removeEventListener("load", register);
    };
  }, []);

  function applyUpdate() {
    if (!waitingWorker) return;
    navigator.serviceWorker.addEventListener("controllerchange", () => window.location.reload(), {
      once: true,
    });
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  }

  if (online && (!waitingWorker || updateDismissed)) return null;
  return (
    <div className="pwaNotices" aria-live="polite">
      {!online && (
        <div className="offlineNotice" role="status">
          当前处于离线状态；已缓存页面和本次会话仍可继续使用。
        </div>
      )}
      {waitingWorker && !updateDismissed && (
        <div className="updateNotice" role="status">
          <span>新版本已准备好。你可以稍后刷新，不会打断当前占卜。</span>
          <span className="updateActions">
            <button type="button" onClick={() => setUpdateDismissed(true)}>
              稍后
            </button>
            <button type="button" onClick={applyUpdate}>
              刷新更新
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
