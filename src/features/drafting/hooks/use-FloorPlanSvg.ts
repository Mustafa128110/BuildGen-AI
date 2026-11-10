"use client";
import React,{ useRef,useState } from "react";
import type { FloorPlanSvgProps } from "../model/FloorPlanSvg-props";

export function useFloorPlanSvg({
  plan,
  activeTool,
  selectedRoomId,
  onSelectRoom,
  onUpdateCoordinates,
}: FloorPlanSvgProps) {
  const [zoom, setZoom] = useState(1);
  const [showFurn, setShowFurn] = useState(true);
  const [showHvac, setShowHvac] = useState(true);
  const [showDims, setShowDims] = useState(true);
  const [graphiteOverlay, setGraphiteOverlay] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle live coordinate tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !onUpdateCoordinates) return;
    const rect = containerRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Scale: 780px = 14450mm = 14.45m
    const xMeters = (px / 780) * 14.45;
    const yMeters = (py / 520) * 9.80;
    onUpdateCoordinates(
      Math.max(0, Math.min(18.0, xMeters)),
      Math.max(0, Math.min(12.0, yMeters))
    );
  };
  return { zoom, setZoom, showFurn, setShowFurn, showHvac, setShowHvac, showDims, setShowDims, graphiteOverlay, setGraphiteOverlay, containerRef, handleMouseMove, plan, activeTool, selectedRoomId, onSelectRoom };
}
