"use client";

import { useLayoutEffect } from "react";

export function MotionController() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const observed = new WeakSet<Element>();

    root.classList.add("motion-ready");

    if (reduceMotion) {
      document
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((element) => element.classList.add("is-visible"));
      return () => root.classList.remove("motion-ready");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.12
      }
    );

    const observeReveals = (scope: ParentNode) => {
      const elements = Array.from(
        scope.querySelectorAll<HTMLElement>("[data-reveal]")
      );

      if (scope instanceof HTMLElement && scope.matches("[data-reveal]")) {
        elements.unshift(scope);
      }

      elements.forEach((element) => {
        if (observed.has(element)) {
          return;
        }

        observed.add(element);
        observer.observe(element);
      });
    };

    observeReveals(document);

    const mutations = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            observeReveals(node);
          }
        });
      });
    });

    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer.disconnect();
      root.classList.remove("motion-ready");
    };
  }, []);

  return null;
}
