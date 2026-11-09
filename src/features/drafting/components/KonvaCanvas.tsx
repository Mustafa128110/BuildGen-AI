"use client";
import {
DoorClosed,
FilePlus2,
Grid,
Grid2X2,
Maximize2,
MousePointer,
Redo2,
Square,
Trash2,
Undo2,
ZoomIn,
ZoomOut
} from "lucide-react";
import React from "react";
import {
Arc,
Group,
Layer,
Line,
Rect,
Stage,
Text,
Transformer
} from "react-konva";
import { useKonvaCanvas } from "../hooks/use-KonvaCanvas";
import type { KonvaCanvasProps } from "../model/KonvaCanvas-props";
import { calculateAreaM2,pxToMeters } from "../model/geometry";

export const KonvaCanvas: React.FC<KonvaCanvasProps> = (props) => {
  const { containerRef, stageRef, transformerRef, dimensions, scale, position, isDrawing, newRect, PLOT_WIDTH, PLOT_HEIGHT, centerOffsetX, centerOffsetY, handleStageMouseMove, handleStageMouseDown, handleStageMouseUp, handleRoomClick, handleRoomDragEnd, handleRoomTransformEnd, handleDeleteSelected, handleClearCanvas, handleZoom, plan, activeTool, onSelectTool, selectedRoomIds, snapEnabled, onToggleSnap, isActivePanel, onMouseEnter, onUndoCanvas, canUndoCanvas, onRedoCanvas, canRedoCanvas } = useKonvaCanvas(props);

  return (
    <section
      onMouseEnter={onMouseEnter}
      className={`flex-1 flex flex-col relative overflow-hidden bg-slate-100 select-none transition-colors ${
        isActivePanel ? "ring-1 ring-inset ring-sky-500/30" : ""
      }`}
    >
      {/* Top Technical Ruler */}
      <div className="h-6 w-full bg-slate-50 border-b border-slate-300 flex items-center relative overflow-hidden shrink-0">
        <div className="w-8 h-full bg-slate-200/70 border-r border-slate-300 flex items-center justify-center font-mono text-[10px] text-slate-800 font-bold">
          0,0
        </div>
        <div className="flex-1 h-full ruler-top-ticks flex items-center justify-between px-4 font-mono text-[10px] text-slate-500">
          <span>0.00m</span>
          <span>2.00m</span>
          <span>4.00m</span>
          <span>6.00m</span>
          <span>8.00m</span>
          <span>10.00m</span>
          <span>12.00m</span>
          <span>14.00m</span>
          <span>16.00m</span>
        </div>
      </div>

      <div className="flex-1 flex relative overflow-hidden" ref={containerRef}>
        {/* Left Technical Ruler */}
        <div className="w-6 bg-slate-50 border-r border-slate-300 h-full ruler-left-ticks flex flex-col justify-between py-4 font-mono text-[10px] text-slate-500 shrink-0 items-center">
          <span>0.0</span>
          <span>2.0</span>
          <span>4.0</span>
          <span>6.0</span>
          <span>8.0</span>
          <span>10.0</span>
        </div>

        {/* Floating Drafting Canvas Controls */}
        <div className="absolute top-3 left-10 z-30 flex items-center gap-1.5 p-1 bg-white/95 border border-slate-300 shadow-md backdrop-blur-xs font-mono text-xs">
          {/* Panel Identity Badge */}
          <div className="px-2 py-0.5 border-r border-slate-200 flex items-center gap-1.5 font-sans font-bold text-[10px] text-slate-800">
            <span className={`w-2 h-2 rounded-full ${isActivePanel ? "bg-sky-600 animate-pulse" : "bg-slate-300"}`}></span>
            <span>CANVAS</span>
          </div>

          {/* Undo / Redo Buttons for Canvas */}
          {onUndoCanvas && (
            <button
              onClick={onUndoCanvas}
              disabled={!canUndoCanvas}
              className={`px-1.5 py-1 flex items-center gap-1 border transition-colors ${
                canUndoCanvas
                  ? "border-slate-300 hover:bg-slate-100 text-slate-700"
                  : "border-slate-200 text-slate-300 cursor-not-allowed"
              }`}
              title="Undo Canvas Change [Ctrl+Z]"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Undo</span>
            </button>
          )}

          {onRedoCanvas && (
            <button
              onClick={onRedoCanvas}
              disabled={!canRedoCanvas}
              className={`px-1.5 py-1 flex items-center gap-1 border transition-colors ${
                canRedoCanvas
                  ? "border-slate-300 hover:bg-slate-100 text-slate-700"
                  : "border-slate-200 text-slate-300 cursor-not-allowed"
              }`}
              title="Redo Canvas Change [Ctrl+Y]"
            >
              <Redo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Redo</span>
            </button>
          )}

          <div className="w-[1px] h-5 bg-slate-300 mx-0.5"></div>

          {/* Select Tool */}
          <button
            onClick={() => onSelectTool("select")}
            className={`px-2 py-1 flex items-center gap-1 border transition-colors ${
              activeTool === "select"
                ? "bg-sky-50 text-sky-800 border-sky-600 font-bold"
                : "border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
            title="Select & Transform [V] (Ctrl+Click for multi-select)"
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>Select [V]</span>
          </button>

          {/* Draw Room Tool */}
          <button
            onClick={() => onSelectTool("room")}
            className={`px-2 py-1 flex items-center gap-1 border transition-colors ${
              activeTool === "room"
                ? "bg-sky-50 text-sky-800 border-sky-600 font-bold"
                : "border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
            title="Draw Room Rectangle [R]"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Draw Room [R]</span>
          </button>

          {/* Door Tool */}
          <button
            onClick={() => onSelectTool("door")}
            className={`px-2 py-1 flex items-center gap-1 border transition-colors ${
              activeTool === "door"
                ? "bg-sky-50 text-sky-800 border-sky-600 font-bold"
                : "border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
            title="Place Door [D]"
          >
            <DoorClosed className="w-3.5 h-3.5" />
            <span>Door [D]</span>
          </button>

          {/* Window Tool */}
          <button
            onClick={() => onSelectTool("window")}
            className={`px-2 py-1 flex items-center gap-1 border transition-colors ${
              activeTool === "window"
                ? "bg-sky-50 text-sky-800 border-sky-600 font-bold"
                : "border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
            title="Place Window [O]"
          >
            <Grid2X2 className="w-3.5 h-3.5" />
            <span>Window [O]</span>
          </button>

          <div className="w-[1px] h-5 bg-slate-300 mx-0.5"></div>

          {/* Delete Selected Room(s) */}
          {selectedRoomIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 flex items-center gap-1 font-bold transition-colors"
              title="Delete Selected Rooms [Del]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedRoomIds.length})</span>
            </button>
          )}

          {/* Clear Canvas */}
          <button
            onClick={handleClearCanvas}
            className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1 transition-colors"
            title="Start New Floor Plan from Scratch"
          >
            <FilePlus2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <div className="w-[1px] h-5 bg-slate-300 mx-0.5"></div>

          {/* Snap toggle */}
          <button
            onClick={onToggleSnap}
            className={`p-1 border transition-colors ${
              snapEnabled
                ? "bg-sky-50 border-sky-500 text-sky-700 font-bold"
                : "border-slate-300 text-slate-400"
            }`}
            title="Snap to 10mm Grid [S]"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {/* Zoom controls */}
          <button
            onClick={() => handleZoom("in")}
            className="p-1 border border-slate-300 text-slate-600 hover:bg-slate-50"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom("out")}
            className="p-1 border border-slate-300 text-slate-600 hover:bg-slate-50"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom("reset")}
            className="p-1 border border-slate-300 text-slate-600 hover:bg-slate-50"
            title="Reset View [100%]"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* The Konva Canvas Blueprint Container */}
        <div className="flex-1 h-full blueprint-grid-canvas relative overflow-hidden cursor-crosshair">
          <Stage
            ref={stageRef}
            width={dimensions.width}
            height={dimensions.height}
            scaleX={scale}
            scaleY={scale}
            x={position.x}
            y={position.y}
            onMouseMove={handleStageMouseMove}
            onMouseDown={handleStageMouseDown}
            onMouseUp={handleStageMouseUp}
          >
            <Layer>
              {/* Centered Plot Group: Keeps floorplan precisely in the center of the canvas */}
              <Group x={centerOffsetX} y={centerOffsetY}>
                {/* Outer Plot Boundary Background */}
                <Rect
                  name="plot-background"
                  x={0}
                  y={0}
                  width={PLOT_WIDTH}
                  height={PLOT_HEIGHT}
                  stroke="#64748b"
                  strokeWidth={1.5}
                  dash={[6, 4]}
                  fill="rgba(255, 255, 255, 0.5)"
                />

                {/* ============================================================ */}
                {/* TOP OVERALL DIMENSION LINE (Strictly along X-axis at Y=-18) */}
                {/* ============================================================ */}
                <Group>
                  {/* Dimension line parallel to X axis */}
                  <Line points={[0, -18, PLOT_WIDTH, -18]} stroke="#0369a1" strokeWidth={1.5} />

                  {/* Vertical Perpendicular Witness Lines */}
                  <Line points={[0, 0, 0, -24]} stroke="#0369a1" strokeWidth={1} />
                  <Line points={[PLOT_WIDTH, 0, PLOT_WIDTH, -24]} stroke="#0369a1" strokeWidth={1} />

                  {/* Axis-Aligned Inward Arrowheads */}
                  <Line points={[8, -21, 0, -18, 8, -15]} stroke="#0369a1" strokeWidth={1.5} lineCap="round" lineJoin="round" />
                  <Line points={[PLOT_WIDTH - 8, -21, PLOT_WIDTH, -18, PLOT_WIDTH - 8, -15]} stroke="#0369a1" strokeWidth={1.5} lineCap="round" lineJoin="round" />

                  {/* 45° Architectural Slash Ticks */}
                  <Line points={[-4, -14, 4, -22]} stroke="#0369a1" strokeWidth={2} />
                  <Line points={[PLOT_WIDTH - 4, -14, PLOT_WIDTH + 4, -22]} stroke="#0369a1" strokeWidth={2} />

                  {/* Centered Dimension Text */}
                  <Text
                    x={PLOT_WIDTH / 2 - 80}
                    y={-34}
                    width={160}
                    align="center"
                    text="14,450 mm [TOTAL SPAN]"
                    fill="#0369a1"
                    fontSize={10}
                    fontFamily="Space Mono"
                    fontStyle="bold"
                  />
                </Group>

                {/* ============================================================ */}
                {/* LEFT OVERALL DIMENSION LINE (Strictly along Y-axis at X=-18) */}
                {/* ============================================================ */}
                <Group>
                  {/* Dimension line parallel to Y axis */}
                  <Line points={[-18, 0, -18, PLOT_HEIGHT]} stroke="#0369a1" strokeWidth={1.5} />

                  {/* Horizontal Perpendicular Witness Lines */}
                  <Line points={[0, 0, -24, 0]} stroke="#0369a1" strokeWidth={1} />
                  <Line points={[0, PLOT_HEIGHT, -24, PLOT_HEIGHT]} stroke="#0369a1" strokeWidth={1} />

                  {/* Axis-Aligned Inward Arrowheads */}
                  <Line points={[-21, 8, -18, 0, -15, 8]} stroke="#0369a1" strokeWidth={1.5} lineCap="round" lineJoin="round" />
                  <Line points={[-21, PLOT_HEIGHT - 8, -18, PLOT_HEIGHT, -15, PLOT_HEIGHT - 8]} stroke="#0369a1" strokeWidth={1.5} lineCap="round" lineJoin="round" />

                  {/* 45° Architectural Slash Ticks */}
                  <Line points={[-22, 4, -14, -4]} stroke="#0369a1" strokeWidth={2} />
                  <Line points={[-22, PLOT_HEIGHT + 4, -14, PLOT_HEIGHT - 4]} stroke="#0369a1" strokeWidth={2} />

                  {/* Rotated Centered Dimension Text */}
                  <Text
                    x={-34}
                    y={PLOT_HEIGHT / 2 + 35}
                    rotation={-90}
                    text="9,800 mm"
                    fill="#0369a1"
                    fontSize={10}
                    fontFamily="Space Mono"
                    fontStyle="bold"
                  />
                </Group>

                {/* ============================================================ */}
                {/* ROOMS LAYER */}
                {/* ============================================================ */}
                {plan.rooms.map((room) => {
                  const isSelected = selectedRoomIds.includes(room.id);
                  const areaStr = `${calculateAreaM2(room.width, room.height)} m²`;
                  const dimStr = `${pxToMeters(room.width)}m × ${pxToMeters(room.height)}m`;

                  return (
                    <Group
                      key={room.id}
                      id={room.id}
                      x={room.x}
                      y={room.y}
                      draggable={activeTool === "select"}
                      onClick={(e) => handleRoomClick(room.id, e)}
                      onDragEnd={(e) => handleRoomDragEnd(room.id, e)}
                      onTransformEnd={(e) => handleRoomTransformEnd(room.id, e)}
                    >
                      {/* Room Floor Rectangle */}
                      <Rect
                        width={room.width}
                        height={room.height}
                        fill={room.fillColor || "rgba(2, 132, 199, 0.08)"}
                        stroke={isSelected ? "#0284c7" : "#0f172a"}
                        strokeWidth={isSelected ? 2.5 : 2}
                        shadowColor={isSelected ? "#0284c7" : "transparent"}
                        shadowBlur={isSelected ? 8 : 0}
                        shadowOpacity={0.3}
                      />

                      {/* Clean Room Title & Area Label */}
                      <Text
                        x={8}
                        y={room.height / 2 - 14}
                        width={room.width - 16}
                        align="center"
                        text={room.label}
                        fill="#0f172a"
                        fontSize={11}
                        fontFamily="Space Grotesk"
                        fontStyle="bold"
                      />

                      <Text
                        x={8}
                        y={room.height / 2 + 2}
                        width={room.width - 16}
                        align="center"
                        text={`${areaStr} • [${dimStr}]`}
                        fill="#0369a1"
                        fontSize={10}
                        fontFamily="Space Mono"
                        fontStyle="bold"
                      />

                      {/* Room-Level Dimension Lines when Selected (Strictly Axis-Aligned) */}
                      {isSelected && (
                        <Group>
                          {/* Top edge dimension line */}
                          <Line
                            points={[0, -8, room.width, -8]}
                            stroke="#0284c7"
                            strokeWidth={1.5}
                          />
                          {/* Top edge witness lines */}
                          <Line points={[0, -12, 0, -4]} stroke="#0284c7" strokeWidth={1} />
                          <Line points={[room.width, -12, room.width, -4]} stroke="#0284c7" strokeWidth={1} />
                          {/* Top edge inward arrowheads */}
                          <Line points={[6, -11, 0, -8, 6, -5]} stroke="#0284c7" strokeWidth={1.5} lineCap="round" lineJoin="round" />
                          <Line points={[room.width - 6, -11, room.width, -8, room.width - 6, -5]} stroke="#0284c7" strokeWidth={1.5} lineCap="round" lineJoin="round" />
                          {/* Top edge 45° slash ticks */}
                          <Line points={[-3, -5, 3, -11]} stroke="#0284c7" strokeWidth={2} />
                          <Line points={[room.width - 3, -5, room.width + 3, -11]} stroke="#0284c7" strokeWidth={2} />
                          {/* Top edge text */}
                          <Text
                            x={room.width / 2 - 40}
                            y={-22}
                            width={80}
                            align="center"
                            text={`${pxToMeters(room.width)}m`}
                            fill="#0284c7"
                            fontSize={9}
                            fontFamily="Space Mono"
                            fontStyle="bold"
                          />

                          {/* Left edge dimension line */}
                          <Line
                            points={[-8, 0, -8, room.height]}
                            stroke="#0284c7"
                            strokeWidth={1.5}
                          />
                          {/* Left edge witness lines */}
                          <Line points={[-12, 0, -4, 0]} stroke="#0284c7" strokeWidth={1} />
                          <Line points={[-12, room.height, -4, room.height]} stroke="#0284c7" strokeWidth={1} />
                          {/* Left edge inward arrowheads */}
                          <Line points={[-11, 6, -8, 0, -5, 6]} stroke="#0284c7" strokeWidth={1.5} lineCap="round" lineJoin="round" />
                          <Line points={[-11, room.height - 6, -8, room.height, -5, room.height - 6]} stroke="#0284c7" strokeWidth={1.5} lineCap="round" lineJoin="round" />
                          {/* Left edge 45° slash ticks */}
                          <Line points={[-11, 3, -5, -3]} stroke="#0284c7" strokeWidth={2} />
                          <Line points={[-11, room.height + 3, -5, room.height - 3]} stroke="#0284c7" strokeWidth={2} />
                          {/* Left edge text */}
                          <Text
                            x={-38}
                            y={room.height / 2 - 5}
                            width={28}
                            align="right"
                            text={`${pxToMeters(room.height)}m`}
                            fill="#0284c7"
                            fontSize={9}
                            fontFamily="Space Mono"
                            fontStyle="bold"
                          />
                        </Group>
                      )}
                    </Group>
                  );
                })}

                {/* ============================================================ */}
                {/* DOORS LAYER */}
                {/* ============================================================ */}
                {plan.doors?.map((door) => (
                  <Group key={door.id} x={door.x} y={door.y} rotation={door.rotation}>
                    <Line points={[0, 0, door.width, 0]} stroke="#0284c7" strokeWidth={2} />
                    <Arc
                      x={0}
                      y={0}
                      innerRadius={door.width - 1}
                      outerRadius={door.width}
                      angle={90}
                      stroke="#0284c7"
                      strokeWidth={1}
                      dash={[4, 3]}
                    />
                    <Text
                      x={door.width / 2}
                      y={10}
                      text={door.label}
                      fill="#0369a1"
                      fontSize={8}
                      fontFamily="Space Mono"
                      fontStyle="bold"
                    />
                  </Group>
                ))}

                {/* ============================================================ */}
                {/* WINDOWS LAYER */}
                {/* ============================================================ */}
                {plan.windows?.map((win) => (
                  <Group key={win.id} x={win.x} y={win.y} rotation={win.rotation}>
                    <Rect
                      x={0}
                      y={-4}
                      width={win.width}
                      height={8}
                      fill="#f0f9ff"
                      stroke="#0f172a"
                      strokeWidth={1.5}
                    />
                    <Line
                      points={[win.width * 0.33, -4, win.width * 0.33, 4]}
                      stroke="#0284c7"
                      strokeWidth={1.5}
                    />
                    <Line
                      points={[win.width * 0.66, -4, win.width * 0.66, 4]}
                      stroke="#0284c7"
                      strokeWidth={1.5}
                    />
                    <Text
                      x={win.width / 2 - 25}
                      y={-14}
                      width={50}
                      align="center"
                      text={win.label}
                      fill="#0f172a"
                      fontSize={8}
                      fontFamily="Space Mono"
                    />
                  </Group>
                ))}

                {/* ============================================================ */}
                {/* NEW ROOM DRAWING PREVIEW */}
                {/* ============================================================ */}
                {isDrawing && newRect && (
                  <Group>
                    <Rect
                      x={newRect.x}
                      y={newRect.y}
                      width={newRect.width}
                      height={newRect.height}
                      fill="rgba(2, 132, 199, 0.15)"
                      stroke="#0284c7"
                      strokeWidth={2}
                      dash={[4, 4]}
                    />
                    <Text
                      x={newRect.x + 8}
                      y={newRect.y + 8}
                      text={`${pxToMeters(Math.abs(newRect.width))}m × ${pxToMeters(Math.abs(newRect.height))}m`}
                      fill="#0284c7"
                      fontSize={10}
                      fontFamily="Space Mono"
                      fontStyle="bold"
                    />
                  </Group>
                )}
              </Group>

              {/* ============================================================ */}
              {/* TRANSFORMER FOR RESIZING & ROTATION */}
              {/* ============================================================ */}
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 40 || newBox.height < 40) {
                    return oldBox;
                  }
                  return newBox;
                }}
                rotateEnabled={false}
                enabledAnchors={[
                  "top-left",
                  "top-center",
                  "top-right",
                  "middle-right",
                  "middle-left",
                  "bottom-left",
                  "bottom-center",
                  "bottom-right",
                ]}
                anchorFill="#0284c7"
                anchorStroke="#ffffff"
                anchorSize={8}
                borderStroke="#0284c7"
                borderDash={[3, 3]}
              />
            </Layer>
          </Stage>

          {/* Bottom Floating Status Bar */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/95 border border-slate-300 flex items-center gap-4 font-mono text-[10px] text-slate-700 shadow-md backdrop-blur-xs">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isActivePanel ? "bg-sky-600 animate-pulse" : "bg-slate-400"}`}></span>
              CANVAS: {isActivePanel ? "ACTIVE [Ctrl+Z to Undo]" : "HOVER TO FOCUS"}
            </span>
            <span className="text-slate-300">|</span>
            <span>
              TOOL: {activeTool.toUpperCase()}
            </span>
            <span className="text-slate-300">|</span>
            <span>
              ROOMS: {plan.rooms.length} | DOORS: {plan.doors?.length || 0}
            </span>
            <span className="text-slate-300">|</span>
            <span>
              {selectedRoomIds.length > 0
                ? `${selectedRoomIds.length} ROOM(S) SELECTED (Ctrl+Click to toggle, Del to remove)`
                : "CLICK TO SELECT (Ctrl+Click for multiple)"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );

};
