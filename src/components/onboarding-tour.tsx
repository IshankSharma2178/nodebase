"use client";

import { driver, type DriveStep, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { authClient } from "@/lib/auth-client";

const TOUR_VERSION = "v1";
export const START_TOUR_EVENT = "nodebase:start-tour";

const tourSteps: DriveStep[] = [
  {
    popover: {
      title: "Welcome to Nodebase",
      description:
        "Let's take a quick tour so you know how to build a workflow, run it, and find the results. You can skip this anytime.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="sidebar-workflows"]',
    popover: {
      title: "1. Workflows",
      description:
        "All of your automations live here. Open Workflows to see and manage them.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="new-workflow"]',
    popover: {
      title: "2. Create a workflow",
      description:
        "Click \"New workflow\" to open the editor and start building.",
      side: "bottom",
      align: "end",
    },
  },
  {
    popover: {
      title: "3. Build it in the editor",
      description:
        "Drag nodes from \"Add node\" onto the canvas. Start with a trigger such as Manual Trigger, then connect and configure the steps you need.",
      side: "bottom",
      align: "center",
    },
  },
  {
    popover: {
      title: "4. Run it",
      description:
        "Add a Manual Trigger to reveal the \"Execute Workflow\" button. Click it to run, and watch each node update live with its status.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="sidebar-executions"]',
    popover: {
      title: "5. See results",
      description:
        "Open Executions to review every run, its status, and the output of each node.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="sidebar-credentials"]',
    popover: {
      title: "6. Add credentials",
      description:
        "AI and integration nodes need API keys. Add and manage them here — they are encrypted at rest.",
      side: "right",
      align: "start",
    },
  },
  {
    popover: {
      title: "You're all set",
      description:
        "Create a workflow to get started. You can replay this tour anytime from \"Take a tour\" in the sidebar.",
      side: "bottom",
      align: "center",
    },
  },
];

export function OnboardingTour() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();
  const driverRef = useRef<Driver | null>(null);
  const autoStartedRef = useRef(false);
  const replayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const userId = session?.user?.id;

  const storageKey = useMemo(
    () => (userId ? `nodebase:onboarding-tour:${TOUR_VERSION}:${userId}` : null),
    [userId],
  );

  const startTour = useCallback(() => {
    if (driverRef.current || typeof document === "undefined") {
      return;
    }

    const driverObj = driver({
      showProgress: true,
      progressText: "Step {{current}} of {{total}}",
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Done",
      closeBtnLabel: "Skip tour",
      allowClose: true,
      overlayOpacity: 0.7,
      stagePadding: 8,
      stageRadius: 10,
      waitForElement: 1500,
      skipMissingElement: true,
      popoverClass: "nodebase-tour",
      steps: tourSteps,
      onDestroyed: () => {
        driverRef.current = null;
      },
    });

    driverRef.current = driverObj;

    if (storageKey) {
      try {
        localStorage.setItem(storageKey, "seen");
      } catch {
        // localStorage may be unavailable; the tour will simply show again.
      }
    }

    driverObj.drive();
  }, [storageKey]);

  useEffect(() => {
    if (isPending || !userId || autoStartedRef.current) {
      return;
    }
    autoStartedRef.current = true;

    if (storageKey) {
      try {
        if (localStorage.getItem(storageKey) === "seen") {
          return;
        }
      } catch {
        // If storage is blocked, fall back to showing the tour.
      }
    }

    if (window.location.pathname !== "/workflows") {
      router.push("/workflows");
    }

    const timer = setTimeout(startTour, 1400);
    return () => clearTimeout(timer);
  }, [isPending, userId, storageKey, router, startTour]);

  useEffect(() => {
    const handleStart = () => {
      if (storageKey) {
        try {
          localStorage.removeItem(storageKey);
        } catch {
          // ignore
        }
      }

      if (replayTimerRef.current) {
        clearTimeout(replayTimerRef.current);
        replayTimerRef.current = null;
      }

      if (pathname !== "/workflows") {
        router.push("/workflows");
        replayTimerRef.current = setTimeout(startTour, 1400);
      } else {
        startTour();
      }
    };

    window.addEventListener(START_TOUR_EVENT, handleStart);
    return () => {
      window.removeEventListener(START_TOUR_EVENT, handleStart);
      if (replayTimerRef.current) {
        clearTimeout(replayTimerRef.current);
        replayTimerRef.current = null;
      }
    };
  }, [pathname, router, startTour, storageKey]);

  return null;
}
