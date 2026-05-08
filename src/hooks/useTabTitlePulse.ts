import { useEffect } from "react";

export function useTabTitlePulse(message = "👀 Come back — you're almost done!") {
  useEffect(() => {
    let original = document.title;
    let interval: number | undefined;
    let toggled = false;

    const onHide = () => {
      if (document.hidden) {
        original = document.title;
        interval = window.setInterval(() => {
          toggled = !toggled;
          document.title = toggled ? message : original;
        }, 1200);
      } else {
        if (interval) window.clearInterval(interval);
        document.title = original;
      }
    };

    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      if (interval) window.clearInterval(interval);
      document.title = original;
    };
  }, [message]);
}
