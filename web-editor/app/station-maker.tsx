"use client";

import { useRef, useState } from "react";
import {
  STATION_CANVAS,
  constrainStationObjectToCanvas,
  createStationObject,
  isStationSetupSaveable,
  stationAsset,
  stationAssets,
  type StationAssetId,
  type StationColor,
  type StationObject,
  type StationSetup,
} from "./station-setups";

const COLORS: StationColor[] = ["blue", "pink", "yellow", "green", "purple"];

function Equipment({ object, selected, onSelect }: { object: StationObject; selected?: boolean; onSelect?: (event: React.PointerEvent<HTMLButtonElement>) => void }) {
  const layout: React.CSSProperties = {
    left: `${object.x / STATION_CANVAS.width * 100}%`,
    top: `${object.y / STATION_CANVAS.height * 100}%`,
    width: `${object.width / STATION_CANVAS.width * 100}%`,
    height: `${object.height / STATION_CANVAS.height * 100}%`,
    transform: `rotate(${object.rotation}deg)`,
    zIndex: object.zIndex,
  };
  const render = (className: string, content: React.ReactNode, style = layout, ariaLabel?: string) => onSelect
    ? <button type="button" className={className} aria-label={ariaLabel} style={style} onPointerDown={onSelect}>{content}</button>
    : <span aria-hidden="true" className={className} style={style}>{content}</span>;
  if (object.kind === "label") return render(`station-label-object${selected ? " selected" : ""}`, object.text || "LABEL");
  if (object.kind === "arrow") return render(`station-arrow-object${selected ? " selected" : ""}`, "➜", { ...layout, fontSize: `${Math.max(16, Math.min(object.width, object.height))}px` }, "Direction arrow");
  const asset = stationAsset(object.assetId!);
  return render(`station-piece ${asset.id} ${object.color ?? "blue"}${selected ? " selected" : ""}`, <span>{asset.id === "beam" ? "" : asset.name}</span>, layout, asset.name);
}

export function StationPreview({ setup, label }: { setup: StationSetup | null | undefined; label: string }) {
  if (!setup) return <div className="station-preview-empty">PIXEL STATION<br />LOCAL PREVIEW</div>;
  return <div className="station-preview" aria-label={`Pixel station preview for ${label}`}>{setup.objects.slice().sort((a, b) => a.zIndex - b.zIndex).map((object) => <Equipment key={object.id} object={object} />)}</div>;
}

type Drag = { id: string; pointerId: number; startX: number; startY: number; objectX: number; objectY: number };

export function StationMakerDialog({ setup, onSave, onCancel }: { setup: StationSetup; onSave: (setup: StationSetup) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<StationSetup>(setup);
  const [selectedId, setSelectedId] = useState<string | null>(draft.objects.at(-1)?.id ?? null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const selected = draft.objects.find((object) => object.id === selectedId) ?? null;

  const revise = (change: (current: StationSetup) => StationSetup) => setDraft((current) => ({ ...change(current), updatedAt: new Date().toISOString() }));
  const addEquipment = (assetId: StationAssetId) => revise((current) => {
    const object = createStationObject(assetId, Math.max(0, ...current.objects.map((item) => item.zIndex)) + 1);
    setSelectedId(object.id);
    return { ...current, objects: [...current.objects, object] };
  });
  const addAnnotation = (kind: "label" | "arrow") => revise((current) => {
    const zIndex = Math.max(0, ...current.objects.map((item) => item.zIndex)) + 1;
    const object: StationObject = kind === "label"
      ? { id: `station-label-${Date.now()}`, kind, text: "START HERE", x: 128, y: 96, width: 160, height: 32, rotation: 0, zIndex }
      : { id: `station-arrow-${Date.now()}`, kind, x: 160, y: 160, width: 64, height: 32, rotation: 0, zIndex };
    setSelectedId(object.id);
    return { ...current, objects: [...current.objects, object] };
  });
  const patchSelected = (patch: Partial<StationObject>) => selected && revise((current) => ({ ...current, objects: current.objects.map((object) => object.id === selected.id ? constrainStationObjectToCanvas({ ...object, ...patch }) : object) }));
  const removeSelected = () => selected && revise((current) => ({ ...current, objects: current.objects.filter((object) => object.id !== selected.id) }));

  const beginDrag = (event: React.PointerEvent, object: StationObject) => {
    event.preventDefault(); event.stopPropagation();
    setSelectedId(object.id);
    dragRef.current = { id: object.id, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, objectX: object.x, objectY: object.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const drag = (event: React.PointerEvent<HTMLDivElement>) => {
    const active = dragRef.current; const bounds = canvasRef.current?.getBoundingClientRect();
    if (!active || active.pointerId !== event.pointerId || !bounds) return;
    const x = Math.round((active.objectX + (event.clientX - active.startX) / bounds.width * STATION_CANVAS.width) / STATION_CANVAS.grid) * STATION_CANVAS.grid;
    const y = Math.round((active.objectY + (event.clientY - active.startY) / bounds.height * STATION_CANVAS.height) / STATION_CANVAS.grid) * STATION_CANVAS.grid;
    revise((current) => ({ ...current, objects: current.objects.map((object) => object.id === active.id ? constrainStationObjectToCanvas({ ...object, x, y }) : object) }));
  };

  const canSave = isStationSetupSaveable(draft);

  return <div className="station-maker-scrim" role="presentation">
    <section className="station-maker retro-window" role="dialog" aria-modal="true" aria-label="Make pixel station">
      <div className="window-title"><b>MAKE STATION</b><span>PIXEL SETUP · SYNCED WITH THE PUBLIC IDEA LIBRARY</span><button type="button" onClick={onCancel} aria-label="Close station maker">×</button></div>
      <div className="station-maker-body">
        <aside className="station-palette"><b>BUILDING BLOCKS</b>{stationAssets.map((asset) => <button key={asset.id} type="button" onClick={() => addEquipment(asset.id)}><i className={`station-palette-icon ${asset.id}`} /><span>{asset.name}</span></button>)}<hr /><button type="button" onClick={() => addAnnotation("label")}>+ TEXT LABEL</button><button type="button" onClick={() => addAnnotation("arrow")}>+ ARROW</button></aside>
        <div className="station-maker-center">
          <div ref={canvasRef} className="station-canvas" onPointerMove={drag} onPointerUp={() => { dragRef.current = null; }} onPointerCancel={() => { dragRef.current = null; }}>
            {draft.objects.slice().sort((a, b) => a.zIndex - b.zIndex).map((object) => <Equipment key={object.id} object={object} selected={selectedId === object.id} onSelect={(event) => beginDrag(event, object)} />)}
            {!draft.objects.length ? <span className="station-canvas-hint">PICK A MAT, THEN DRAG IT INTO PLACE</span> : null}
          </div>
          <p>GRID: APPROXIMATE MAT SCALE · TALL PIECES USE A PIXEL SIDE + SHADOW</p>
        </div>
        <aside className="station-inspector"><b>SELECTED PIECE</b>{selected ? <><strong>{selected.kind === "equipment" ? stationAsset(selected.assetId!).name : selected.kind.toUpperCase()}</strong>{selected.kind === "equipment" ? <label>COLOR<select value={selected.color} onChange={(event) => patchSelected({ color: event.target.value as StationColor })}>{COLORS.map((color) => <option key={color} value={color}>{color.toUpperCase()}</option>)}</select></label> : null}{selected.kind === "label" ? <label>TEXT<input value={selected.text ?? ""} maxLength={40} onChange={(event) => patchSelected({ text: event.target.value })} /></label> : null}<div className="station-inspector-row"><button type="button" onClick={() => patchSelected({ rotation: (selected.rotation - 15 + 360) % 360 })}>↶ ROTATE</button><button type="button" onClick={() => patchSelected({ rotation: (selected.rotation + 15) % 360 })}>ROTATE ↷</button></div><div className="station-inspector-row"><button type="button" onClick={() => patchSelected({ width: Math.max(32, selected.width - 32), height: Math.max(32, selected.height - 32) })}>− SIZE</button><button type="button" onClick={() => patchSelected({ width: Math.min(640, selected.width + 32), height: Math.min(480, selected.height + 32) })}>+ SIZE</button></div><div className="station-inspector-row"><button type="button" onClick={() => patchSelected({ zIndex: Math.max(0, selected.zIndex - 1) })}>SEND BACK</button><button type="button" onClick={() => patchSelected({ zIndex: Math.max(...draft.objects.map((object) => object.zIndex)) + 1 })}>BRING FRONT</button></div><button type="button" onClick={removeSelected} className="station-delete">DELETE PIECE</button></> : <span>SELECT A PIECE TO EDIT IT</span>}</aside>
      </div>
      <footer className="station-maker-actions"><span>{canSave ? `${draft.objects.length} OBJECT${draft.objects.length === 1 ? "" : "S"} · EDITABLE AFTER SAVING` : "ADD A PIECE TO ENABLE SAVE"}</span><div><button type="button" onClick={onCancel}>CANCEL</button><button type="button" className="station-save" disabled={!canSave} onClick={() => { if (canSave) onSave(draft); }}>SAVE STATION</button></div></footer>
    </section>
  </div>;
}
