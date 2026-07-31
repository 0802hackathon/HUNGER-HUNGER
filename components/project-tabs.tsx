"use client";

import { useEffect, useState } from "react";

const tabs = [
    { id: "overview", label: "概要" },
    { id: "environment", label: "開発環境" },
    { id: "implemented", label: "実装済み" },
    { id: "planned", label: "構想" },
    { id: "shoots", label: "シュート" },
];

type ProjectTabsProps = {
    continuationCount: number;
};

export function ProjectTabs({
    continuationCount,
}: ProjectTabsProps) {
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        const updateFromHash = () => {
            const hash = window.location.hash.replace("#", "");

            if (tabs.some((tab) => tab.id === hash)) {
                setActiveTab(hash);
            } else {
                setActiveTab("overview");
            }
        };

        updateFromHash();

        window.addEventListener("hashchange", updateFromHash);

        return () => {
            window.removeEventListener("hashchange", updateFromHash);
        };
    }, []);

    useEffect(() => {
        const sections = tabs
            .map((tab) => document.getElementById(tab.id))
            .filter((section): section is HTMLElement => section !== null);

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleSections = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort(
                        (first, second) =>
                            first.boundingClientRect.top -
                            second.boundingClientRect.top,
                    );

                const visibleSection = visibleSections[0];

                if (visibleSection) {
                    setActiveTab(visibleSection.target.id);
                }
            },
            {
                rootMargin: "-130px 0px -60% 0px",
                threshold: 0,
            },
        );

        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    return (
        <nav className="repo-tabs" aria-label="Project内ナビゲーション">
            {tabs.map((tab) => (
                <a
                    key={tab.id}
                    href={`#${tab.id}`}
                    aria-current={activeTab === tab.id ? "page" : undefined}
                    onClick={() => setActiveTab(tab.id)}
                >
                    {tab.label}
                    {tab.id === "shoots" && (
                        <> <span>{continuationCount}</span></>
                    )}
                </a>
            ))}
        </nav>
    );
}